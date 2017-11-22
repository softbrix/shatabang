"use strict";
var bodyParser = require('body-parser');
var express = require('express');
var router  = express.Router();
var path = require('path');
var shIndex = require('stureby_index');

var idx_finger_dir, idx_rating_dir;

router.initialize = function(config) {
  idx_finger_dir = path.join(config.cacheDir, 'idx_finger');
  idx_rating_dir = path.join(config.cacheDir, 'idx_rating');

  router.get('/fingers/keys', getKeys(shIndex(idx_finger_dir)));
  router.get('/rating/keys', getKeys(shIndex(idx_rating_dir)));

  router.post('/rating/add', function(req, res) {
    var file = req.body.file, rating = req.body.rating;
    if(!file || !rating) {
      res.status(400).send("Missing required parameters, file and/or rating").end();
      return;
    }
    if(rating < 0 || rating > 1) {
      res.status(400).send("Rating should be between 0 and 1").end();
      return;
    }
    var idx = shIndex(idx_rating_dir);
    idx.put(file, rating);
    res.end();
  });

  router.use('/rating/add', bodyParser.urlencoded({ extended: true }));
};

var getKeys = function(idx) {
  return function(req, res) {
    res.setHeader('content-type', 'application/json');
    res.json(idx.keys()).end();
  };
};

module.exports = router;
