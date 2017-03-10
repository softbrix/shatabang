"use strict"
var bodyParser = require('body-parser');
var express = require('express');
var router  = express.Router();


var passport;
router.initialize = function(config) {
  passport = config.passport;

  router.post('/authenticate',
    passport.authenticate('local'),
      function(req, res) { res.status(200); res.end(); }
    );
};

router.use('/authenticate', bodyParser.urlencoded({ extended: true }));

router.post('/invalidate', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/me', function(req, res) {
  var sess = req.session;
  if(sess === undefined) {
    // The client is missing a session, return unauthorized response
    res.send().status(500);
    return false;
  }
  if (!sess.views) {
    sess.views  = 0;
  }
  sess.views++;
  res.json({
    "data": {
      "type": "user",
      "id": "me",
      "attributes": {
        'username': req.user.name,
        'user': req.user
      }
    }
  });
});

module.exports = router;
