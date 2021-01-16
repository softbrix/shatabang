"use strict"
var express = require('express');
var router  = express.Router();
var path = require('path');
var indexes = require('../common/indexes');
var faceInfo = require('../common/face_info');

var cacheDir;
router.initialize = function(config) {
  cacheDir = config.cacheDir;
};

function loadFaceItems() {
  var idx = indexes.facesIndex(cacheDir)
  var faceItems = [];
  idx.keys().forEach(function(key) {
    var items = idx.get(key);
    if(items.length > 0) {
      items.forEach(function(str) {
        let itm = JSON.parse(str);
        itm.b = key;
        itm.path = faceInfo.fromIdToPath(key);
        faceItems.push(itm);
      });
    }
  });
  return faceItems;
}

function noPerson(face) {
  return face.p === undefined || face.p.length === 0;
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
    var list = loadFaceItems()
      .filter(noPerson );
    list = list
      .map(faceInfo.expand)
      .sort(faceInfo.sizeCompare);
    sendJsonList(res, list);
});

router.get('/face/:id', function(req,res){
  var id = req.params.id;
  var idx = indexes.facesCropIndex(cacheDir);
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

router.delete('/:id',function(req,res){
  indexes.facesIndex(cacheDir).delete(req.params.id)
  indexes.facesCropIndex(cacheDir).delete(req.params.id);
  res.end('ok')
});

module.exports = router;
