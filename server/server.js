"use strict";

const config       = require('./common/config.js'),
    directories  = require('./common/directories'),
    task_queue     = require('./common/task_queue'),
    Bull           = require('bull'),
    Arena          = require('bull-arena'),
    { createBullBoard } = require('@bull-board/api'),
    { BullAdapter }     = require('@bull-board/api/bullAdapter'),
    { BullMQAdapter }   = require('@bull-board/api/bullMQAdapter'),
    { ExpressAdapter }  = require('@bull-board/express'),
    express        = require("express"),
    bodyParser     = require('body-parser'),
    compression    = require('compression'),
    session        = require('express-session'),
    sha256         = require('sha256'),
    url            = require('url'),
    RedisStore     = require('connect-redis')( session ),
    redis          = require('redis'),
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


const baseUrlPath = url.parse(config.baseUrl, true).pathname;

// Initialize the default redis client
config.redisClient = redis.createClient({
  host: config.redisHost,
  port: config.redisPort
});
task_queue.connect(Object.assign(config, { createIfMissing: true }));

// Check that directories exists
directories.populatesDirectories(config);
directories.checkDirectories(config);

var routes = [];
routes.push({path: 'upload', route: require('./routes/uploads')});
routes.push({path: 'images', route: require('./routes/images')});
routes.push({path: 'duplicates', route: require('./routes/duplicates')});
routes.push({path: 'dirs', route: require('./routes/dirs')});
routes.push({path: 'indexes', route: require('./routes/indexes')});
routes.push({path: 'queue', route: require('./routes/queue')});
routes.push({path: 'keywords', route: require('./routes/keywords')});
routes.push({path: 'auth', route: require('./routes/auth'), public: true});
routes.push({path: 'users', route: require('./routes/users'), public: true});
routes.push({path: 'version', route: require('./routes/version'), public: true});

passport.serializeUser(function(user, done) {
  // console.log('serializeUser', user.displayName);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // console.log('deserializeUser', obj);
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
    function(token, refreshToken, profile, done) {
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
      return done(null, {profile, token});
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
function requireAuthentication(redirectUrl) {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    if (redirectUrl !== undefined) {
      res.redirect(url);
    } else {
      res.status(401).send('Unauthorized');
    }
  }
}

/// End Authentication

// Secure the api and images path
app.all('/images/*', requireAuthentication());
app.all('/media/*', requireAuthentication());
app.all('/video/*', requireAuthentication());
app.all('/arena/*', requireAuthentication(baseUrlPath + '/login'));
app.all('/admin/*', requireAuthentication(baseUrlPath + '/login'));

// Map the routes
routes.forEach(function(route) {
  var path = '/api/' + route.path;
  if(route.public !== true) {
    app.all(path + '/*', requireAuthentication());
  }
  // initialize the route
  route.route.initialize(config);
  // connect the route
  app.use(path, route.route);
});

// Images is the route to the cached (resized) images
app.use('/images', express.static(config.cacheDir));
// Media will laod the original
app.use('/media', express.static(config.storageDir));

// Video route will first serve the cached movie and fallback to the original
// file if not found. Images should be loaded from the image dir
const movieFileRegexp = /(.+)(mp4|m4v|avi|mov|mpe?g)$/gi;
app.use('/video', function(req, res, next) {
    req.shOriginalUrl = req.url;
    // Look for a transcoded mp4 file in the cache
    req.url = path.join('/1920', req.url.replace(movieFileRegexp, '$1mp4'));
    next();
}, express.static(path.join(config.cacheDir)));
app.use('/video', function(req, res, next) {
  if(req.shOriginalUrl) {
    // Reset the url if we have modified it
    req.url = req.shOriginalUrl;
  }
  next();
}, express.static(config.storageDir));

const arenaRedisConf = {
  port: config.redisPort,
  host: config.redisHost,
  maxRetriesPerRequest: null, 
  enableReadyCheck: false
};
const queueNames =  task_queue.names();
const queConf = {
  hostId: "shatabang",
  prefix: task_queue.prefix,
  redis: arenaRedisConf,
};

const arenaConfig = Arena({
  Bull, 
  queues: queueNames.map(name => Object.assign({}, queConf, {name: name})),
},
{
  basePath: '/',
  disableListen: true // Let express handle the listening.
});
const arena = express.Router();
arena.use(arenaConfig);
app.use('/arena', (req, res, next) => { 
  if (baseUrlPath != '/' ) {
    req.url = baseUrlPath + `/arena${req.url}`; 
  }
  console.log('get arena', req.url);
  next(); 
}, arena);

// Bull-board route
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queuestat');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [],
  serverAdapter: serverAdapter,
});
setQueues(queueNames.map(name => new BullAdapter(new Bull(name, { redis: arenaRedisConf, prefix: task_queue.prefix }))));

app.use('/admin/queuestat', (req, res, next) => {
  if (baseUrlPath != '/' ) {
    req.proxyUrl = baseUrlPath + '/admin/queuestat';
  }
  next();
}, serverAdapter.getRouter());

app.use('/', express.static(__dirname + "/client/dist/"));

app.listen(config.port, function(){
  console.log("Working on port " + config.port);
});
