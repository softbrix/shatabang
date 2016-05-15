"use strict";

var express        = require("express"),
    bodyParser     = require('body-parser'),
    compression    = require('compression'),
    flash          = require('connect-flash'),
    shFiles        = require('./modules/shatabang_files'),
    upload_route   = require('./routes/uploads'),
    images_route   = require('./routes/images'),
    duplicates_route = require('./routes/duplicates'),
    session        = require('express-session'),
    sha256         = require('sha256'),
    kue            = require('kue'),
    redis          = require("redis"),
    redisStore     = require( 'connect-redis' )( session ),
    app            = express(),
    path           = require('path'),
    passport       = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    LocalStrategy  = require('passport-local').Strategy;

var config = require('./config_server.json'); //JSON.parse(fs.readFileSync('server_config.json', 'utf8'));

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID      = config.google_client_id,
    GOOGLE_CLIENT_SECRET  = config.google_client_secret,
    GOOGLE_CALLBACK_URL = config.google_auth_callback_url,
    GOOGLE_ALLOWED_IDS = config.google_auth_allowed_ids,
    ADMIN_HASH = config.admin_hash,
    SERVER_SALT = config.server_salt;

var storageDir = config.storageDir; //'/Volumes/Mini\ Stick/sorted/';
var cacheDir = config.cacheDir; // '/Volumes/Mini\ Stick/cache/';
var deleteDir = config.deletedDir = path.join(storageDir, 'deleted');
var uploadDir = config.uploadDir = path.join(storageDir, 'upload');

// Check that upload dir exists
if(!shFiles.exists(uploadDir)) {
  console.log("Upload dir does not exists. Trying to create it.");
  shFiles.mkdirsSync(uploadDir);
}
if(!shFiles.exists(deleteDir)) {
  console.log("Delete dir does not exists. Trying to create it.");
  shFiles.mkdirsSync(deleteDir);
}
var routes = [];
routes.push({path: 'upload', route: upload_route});
routes.push({path: 'images', route: images_route});
routes.push({path: 'duplicates', route: duplicates_route});

routes.forEach(function(itm) {
  itm.route.initialize(config);
});

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user.displayName);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
//  console.log('deserializeUser', obj.displayName);
  done(null, obj);
});

if(GOOGLE_CLIENT_ID) {
  console.log('Loading google authentication.');
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL
      //passReqToCallback : true
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
     process.nextTick(function () {
       if(GOOGLE_ALLOWED_IDS.indexOf(profile.id) < 0) {
         profile = null;
       }

       // To keep the example simple, the user's Google profile is returned to
       // represent the logged-in user.  In a typical application, you would want
       // to associate the Google account with a user record in your database,
       // and return that user instead.
       return done(null, profile);
     });
    }
  ));
} else if(ADMIN_HASH) {
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

app.use(bodyParser.json());
app.use(compression());
app.use( session({
	secret: SERVER_SALT,
	name:   'cookie67',
  resave: true,
  saveUninitialized: true,
  store: new redisStore({ host: 'localhost', port: 6379, client: redis.createClient(),ttl :  900})
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',function(req,res){
      res.sendFile(__dirname + "/client/index.html");
});

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
//     /auth/google/return
app.get('/auth/google', passport.authenticate('google',
{ scope: ['https://www.googleapis.com/auth/userinfo.email'
  /*'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/plus.media.upload'*/] }));

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
app.get('/auth/google/return',
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/?bad=true' }));

app.use('/loginform', bodyParser.urlencoded({ extended: true }));
app.post('/loginform',
  passport.authenticate('local', { failureRedirect: '/login.html' }),
    function(req, res) { res.redirect('/'); }
  );

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

app.get('/api/account', function(req, res) {
  var sess = req.session;
  if (!sess.views) {
    sess.views  = 0;
  }
  sess.views++;
  res.json({ user: req.user });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
/// End Authentication

// Secure the api and images path
app.all('/api/*', requireAuthentication);
app.all('/images/*', requireAuthentication);
app.all('/media/*', requireAuthentication);

app.use('/images', express.static(cacheDir));
app.use('/media', express.static(storageDir));

// Map the routes
routes.forEach(function(itm) {
  app.use('/api/' + itm.path, itm.route);
});

kue.app.set('title', 'Shatabang Work que');
app.use('/kue', kue.app);
app.use('/', express.static(__dirname + "/client/"));

var port = config.port || 3000;
app.listen(port, function(){
    console.log("Working on port " + port);
});
