"use strict";
const bodyParser = require('body-parser');
const express = require('express');
const router  = express.Router();
const indexes = require('../common/indexes');

router.initialize = function(config) {
  router.get('/sha/keys', getKeys(indexes.fileShaIndex(config.cacheDir)));
  router.get('/fingers/keys', getKeys(indexes.imgFingerIndex(config.cacheDir)));
  router.get('/rating/keys', getKeys(indexes.ratingIndex(config.cacheDir)));

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
    var idx = indexes.ratingIndex(config.cacheDir);
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
