"use strict"
var express = require('express');
var router  = express.Router();
var path = require('path');
var shIndex = require('../modules/shatabang_index');

var idx_dir;
router.initialize = function(config) {
  idx_dir = path.join(config.cacheDir, 'idx_finger');
};

router.get('/list',function(req,res){
    var idx = shIndex(idx_dir), written = false;
    res.setHeader('content-type', 'application/json');
    res.write("[");
    idx.keys().forEach(function(key) {
      var items = idx.get(key);
      if(items.length > 1) {
        if(written) {
          res.write(',');
        }
        written = true;
        res.write(JSON.stringify({
          key: key,
          items : items}));
      }
    });
    res.end("]");
});

module.exports = router;
