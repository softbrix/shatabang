"use strict"
var express = require('express');
var router  = express.Router();
var path = require('path');
var shIndex = require('stureby_index');
var faceInfo = require('../modules/face_info');

var idx_dir, faces_idx_dir;
router.initialize = function(config) {
  idx_dir = path.join(config.cacheDir, 'idx_faces');
  faces_idx_dir = path.join(config.cacheDir, 'idx_faces_crop');
};

function loadFaceItems() {
  var idx = shIndex(idx_dir)
  var faceItems = [];
  idx.keys().forEach(function(key) {
    var items = idx.get(key);
    if(items.length > 0) {
      JSON.parse(items[0]).forEach(function(itm) {
        itm.k = key;
        faceItems.push(itm);
      });
    }
  });
  return faceItems;
}

function sendJsonList(res, list) {
  res.setHeader('content-type', 'application/json');
  res.write(JSON.stringify(list));
  res.end();
}

router.get('/list',function(req,res){
    sendJsonList(res, loadFaceItems());
});

router.get('/list/unknown',function(req,res) {
    var list = loadFaceItems().filter(face => face.n === undefined);
    list = list
      .map(faceInfo.expand)
      .sort(faceInfo.sizeCompare);
    sendJsonList(res, list);
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
