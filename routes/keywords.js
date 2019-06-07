"use strict"
var express = require('express');
var router  = express.Router();

var vemdalenIndex = require("vemdalen-index");
var index;

const namespace = 'keywords:';

router.initialize = function(config) {
  index = vemdalenIndex(namespace, {
    indexType: 'strings',
    client: config.redisClient
  });
};

router.get('/', function(req, res) {
  var persons = [];
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
