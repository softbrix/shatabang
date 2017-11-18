"use strict";

var express        = require("express"),
    bodyParser     = require('body-parser'),
    compression    = require('compression'),
    shFiles        = require('./modules/shatabang_files'),
    session        = require('express-session'),
    sha256         = require('sha256'),
    kue            = require('kue'),
    redisStore     = require( 'connect-redis' )( session ),
    app            = express(),
    path           = require('path'),
    passport       = require('passport'),
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    LocalStrategy  = require('passport-local').Strategy;

var config = require('./config_server.json');

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var ADMIN_HASH = config.admin_hash,
    SERVER_SALT = config.server_salt;

var REDIS_HOST = process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1';
var REDIS_PORT = process.env.REDIS_PORT_6379_TCP_PORT || 6379;
config.baseUrl = config.baseUrl || '/';
config.port = config.port || 3000;

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

if(config.google_auth || process.env.GOOGLE_AUTH) {
  console.log('Loading google authentication.');
  if (process.env.GOOGLE_AUTH) {
    console.log('ENV variable overwriting the google auth configuration');
    var envConf = process.env.GOOGLE_AUTH.split(':');
    config.google_auth = {
      "clientID" :	envConf[0],
      "clientSecret" : envConf[1],
      "callbackURL" : process.env.GOOGLE_AUTH_CALLBACK,
      "allowed_ids" : process.env.GOOGLE_AUTH_ALLOW.split(',')
    };
  }

  if(!config.google_auth.callbackURL.endsWith("return")) {
    config.google_auth.callbackURL += "/api/auth/google/return";
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
if(ADMIN_HASH) {
  console.log('Loading local with admin authentication.');
  passport.use(new LocalStrategy(
    function(username, password, done) {
        if ("admin" !== username.toLowerCase()) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        var hash = sha256(password + SERVER_SALT);
        if (hash !== ADMIN_HASH) {
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
	secret: SERVER_SALT,
	name:   'cookie67',
  resave: true,
  saveUninitialized: true,
  store: new redisStore({
    host: REDIS_HOST,
    port: REDIS_PORT,
    ttl :  900
  })
}));
app.use(passport.initialize());
app.use(passport.session());

var sendIndex = function(req,res){
      res.sendFile(__dirname + "/client/dist/index.html");
};

app.get('/',sendIndex);
app.get('/login',sendIndex);

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
app.all('/kue/*', requireAuthentication);

app.use('/images', express.static(cacheDir));
app.use('/media', express.static(storageDir));

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
