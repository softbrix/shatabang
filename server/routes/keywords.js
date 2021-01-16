"use strict"
const express = require('express');
const router  = express.Router();
const indexes = require("../common/indexes");

var index;

router.initialize = function(config) {
  index = indexes.keywordsIndex(config.redisClient);
};

router.get('/', function(req, res) {
  index.keys().then((keys) => {
    res.end(JSON.stringify({keywords:keys}))
  })
  .catch((err) => {
    res.status(500).end(err);
  });
});

router.get('/:id', function(req, res) {
  index.get(req.params.id)
    .then(
      values => res.end(JSON.stringify({keyword:values})),
      err => res.status(500).end(err)
    );
});

module.exports = router;
