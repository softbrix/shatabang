"use strict";
var express = require('express');
var router  = express.Router();
var path = require('path');
var shIndex = require('stureby_index');

var idx_dir;
router.initialize = function(config) {
  idx_dir = path.join(config.cacheDir, 'idx_finger');
};

router.get('/fingers/keys', function(req, res) {
  var idx = shIndex(idx_dir);
  res.setHeader('content-type', 'application/json');
  res.json(idx.keys()).end();
});

module.exports = router;
