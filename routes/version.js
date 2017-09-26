"use strict";
var express = require('express');
var router  = express.Router();

var version = "0.1.0";
router.initialize = function(config) {
};

router.get('/', function(req, res) {
  res.send(version).end();
});

module.exports = router;
