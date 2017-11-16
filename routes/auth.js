"use strict";

var _ = require('underscore');
var express = require('express');
var router  = express.Router();

var auth_methods = [], passport, baseUrl;

router.initialize = function(config) {
  [{conf : 'admin_hash', name : 'admin'},
   {conf : 'google_auth', name : 'google'} ]
   .forEach(function(e) {
     if(!_.isEmpty(config[e.conf])) {
         auth_methods.push(e.name);
     }
   });
   passport = config.passport;
   baseUrl = config.baseUrl;

   console.log('baseUrl', baseUrl);

   // Redirect the user to Google for authentication.  When complete, Google
   // will redirect the user back to the application at
   //     /api/auth/google/return configured in the config_server.json
   router.get('/google', passport.authenticate('google',
   { scope: ['https://www.googleapis.com/auth/userinfo.email'
     /*'https://www.googleapis.com/auth/drive.photos.readonly',
     'https://www.googleapis.com/auth/plus.media.upload'*/] }));

   // Google will redirect the user to this URL after authentication.  Finish
   // the process by verifying the assertion.  If valid, the user will be
   // logged in.  Otherwise, authentication has failed.
   router.get('/google/return',
     passport.authenticate('google', { failureRedirect: baseUrl + '?bad=true' }),
     function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
};

router.get('/list',function(req,res){
    res.setHeader('content-type', 'application/json');
    res.send(auth_methods).status(200);
});

module.exports = router;
