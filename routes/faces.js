"use strict"
var express = require('express');
var router  = express.Router();
var path = require('path');
var shIndex = require('stureby_index');

var idx_dir, faces_idx_dir;
router.initialize = function(config) {
  idx_dir = path.join(config.cacheDir, 'idx_faces');
  faces_idx_dir = path.join(config.cacheDir, 'idx_faces_crop');
};

router.get('/list',function(req,res){
    var idx = shIndex(idx_dir), written = false;
    res.setHeader('content-type', 'application/json');
    res.write("[");
    idx.keys().forEach(function(key) {
      var items = idx.get(key);
      if(items.length > 0) {
        if(written) {
          res.write(',');
        }
        written = true;
        res.write(JSON.stringify({
          key: key,
          items : JSON.parse(items[0])}));
      }
    });
    res.end("]");
});

router.get('/face/:id', function(req,res){
  var id = req.params.id;
  var idx = shIndex(faces_idx_dir);
  var data = idx.get(id);
  if(data.length) {
    var buf = Buffer.from(data[0], 'base64');
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Length': buf.length
    });
    res.send(buf);
  } else {
    // HTTP No Content
    res.sendStatus(204);
  }
});

module.exports = router;
