"use strict"
var express = require('express');
var router  = express.Router();
var path = require('path');
var indexes = require('../common/indexes');

var cacheDir;
router.initialize = function(config) {
  cacheDir = config.cacheDir;
};

router.get('/list',function(req,res){
    var idx = indexes.imgFingerIndex(cacheDir), 
    written = false;
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
