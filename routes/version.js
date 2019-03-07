"use strict";
var express = require('express');
var router  = express.Router();

// Read version from package.json
var version = require('../package.json').version;

router.initialize = function() {
};

router.get('/', function(req, res) {
  res.send(version).end();
});

module.exports = router;
