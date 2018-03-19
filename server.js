"use strict";

var config         = require('./config.js'),
    express        = require("express"),
    bodyParser     = require('body-parser'),
    compression    = require('compression'),
    shFiles        = require('./modules/shatabang_files'),
    session        = require('express-session'),
    sha256         = require('sha256'),
    kue            = require('kue'),
    RedisStore     = require('connect-redis')( session ),
    app            = express(),
    path           = require('path'),
    passport       = require('passport'),
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    LocalStrategy  = require('passport-local').Strategy;

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/

if (process.env.GOOGLE_AUTH) {
  console.log('ENV variable overwriting the google auth configuration');
  var envConf = process.env.GOOGLE_AUTH.split(':');
  config.google_auth = {
    "clientID" :	envConf[0],
    "clientSecret" : envConf[1],
    "callbackURL" : config.baseUrl,
    "allowed_ids" : process.env.GOOGLE_AUTH_ALLOW.split(',')
  };
}

console.log('Starting the server with the following configuration', config);

var storageDir = config.storageDir;
var cacheDir = config.cacheDir;
var deleteDir = config.deletedDir = path.join(storageDir, 'deleted');
var uploadDir = config.uploadDir = path.join(storageDir, 'upload');
var importDir = config.importDir = path.join(storageDir, 'import');

// Check that directories exists
[uploadDir, importDir, deleteDir, path.join(cacheDir, 'info')].forEach(function(directory) {
  if(!shFiles.exists(directory)) {
    console.log("Directory dir does not exists. Trying to create it.", directory);
    shFiles.mkdirsSync(directory);
  }
});

var routes = [];
routes.push({path: 'upload', route: require('./routes/uploads')});
routes.push({path: 'images', route: require('./routes/images')});
routes.push({path: 'faces', route: require('./routes/faces')});
routes.push({path: 'duplicates', route: require('./routes/duplicates')});
routes.push({path: 'dirs', route: require('./routes/dirs')});
routes.push({path: 'indexes', route: require('./routes/indexes')});
routes.push({path: 'kue', route: require('./routes/kue')});
routes.push({path: 'people', route: require('./routes/people')});
routes.push({path: 'auth', route: require('./routes/auth'), public: true});
routes.push({path: 'users', route: require('./routes/users'), public: true});
routes.push({path: 'version', route: require('./routes/version')});

passport.serializeUser(function(user, done) {
  // console.log('serializeUser', user.displayName);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // console.log('deserializeUser', obj.displayName);
  done(null, obj);
});

if(config.google_auth) {
  console.log('Loading google authentication.');

  if(!config.google_auth.callbackURL.endsWith("return")) {
    if(!config.google_auth.callbackURL.endsWith("/")) {
      config.google_auth.callbackURL += "/";
    }
    config.google_auth.callbackURL += "api/auth/google/return";
  }

  var GOOGLE_ALLOWED_IDS = config.google_auth.allowed_ids;
  passport.use(new GoogleStrategy(config.google_auth,
    function(accessToken, refreshToken, profile, done) {
      if(!profile) {
        done("Missing profile", null);
        return;
      }

      // First test if we have a valid user id
      var allowed = GOOGLE_ALLOWED_IDS.indexOf(profile.id) >= 0;
      // Second iterate the client emails list
      var i = 0, emails = profile.emails;
      if(!allowed && profile.emails) {
        for(; i < emails.length && !allowed; ++i) {
          allowed = GOOGLE_ALLOWED_IDS.indexOf(emails[i].value) >= 0;
        }
      }
      if(!allowed) {
        // TODO: Display this error in the application
        var user = emails[i] || profile.id;
       done(user + " is not allowed to access this application", null);
       return;
      }

      // Decorate the username field with something from the google object
      profile.username = profile.emails[i];

      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    }
  ));
}
if(config.adminHash) {
  console.log('Loading local with admin authentication.');
  passport.use(new LocalStrategy(
    function(username, password, done) {
        if ("admin" !== username.toLowerCase()) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        var hash = sha256(password + config.serverSalt);
        if (hash !== config.adminHash) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, {username: 'admin', displayName: 'admin'});
    }));
} else {
  console.log('No authentication mechanism configured.');
}
config.passport = passport;

app.use(bodyParser.json());
app.use(compression());
app.use(session({
	secret: config.serverSalt,
	name:   'cookie67',
  resave: false,
  saveUninitialized: true,
  store: new RedisStore({
    host: config.redisHost,
    port: config.redisPort,
    ttl :  900
  })
}));
app.use(passport.initialize());
app.use(passport.session());

var sendIndex = function(req,res){
      res.sendFile(__dirname + '/client/dist/index.html');
};

app.get('/', sendIndex);
app.get('/login', sendIndex);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function requireAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send().status(401);
}

/// End Authentication

// Secure the api and images path
app.all('/images/*', requireAuthentication);
app.all('/media/*', requireAuthentication);
app.all('/video/*', requireAuthentication);
app.all('/kue/*', requireAuthentication);

// Images is the route to the cached (resized) images
app.use('/images', express.static(cacheDir));
// Media will laod the original
app.use('/media', express.static(storageDir));

// Video route will first serve the cached movie and fallback to the original
// file if not found. Images should be loaded from the image dir
const movieFileRegexp = /(.+)(mp4|m4v|avi|mov|mpe?g)$/gi;
app.use('/video', function(req, res, next) {
    req.shOriginalUrl = req.url;
    // Look for a transcoded mp4 file in the cache
    req.url = path.join('/1920', req.url.replace(movieFileRegexp, '$1mp4'));
    next();
}, express.static(path.join(cacheDir)));
app.use('/video', function(req, res, next) {
  if(req.shOriginalUrl) {
    // Reset the url if we have modified it
    req.url = req.shOriginalUrl;
  }
  next();
}, express.static(storageDir));

// Map the routes
routes.forEach(function(route) {
  var path = '/api/' + route.path;
  if(route.public !== true) {
    app.all(path + '/*', requireAuthentication);
  }
  // initialize the route
  route.route.initialize(config);
  // connect the route
  app.use(path, route.route);
});

kue.app.set('title', 'Shatabang Work que');
app.use('/kue', kue.app);
app.use('/', express.static(__dirname + "/client/dist/"));

app.listen(config.port, function(){
  console.log("Working on port " + config.port);
});
