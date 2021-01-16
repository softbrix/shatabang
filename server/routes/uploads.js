"use strict";

const express = require('express');
const shFiles = require('../common/shatabang_files');
const ImportLog = require('../common/import_log');
const router = express.Router();
const multer = require('multer');


var uploadDir, importDir, importLog;
router.initialize = function(config) {
  uploadDir = config.uploadDir;
  importDir = config.importDir;
  importLog = new ImportLog(config.cacheDir);
};
var partPrefix = 'part-';

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    var filename = partPrefix+Date.now()+ '-' + file.originalname;
    console.log('Uploading: ', filename);
    callback(null, filename);
  }
});
var uploadSingle = multer({ storage : storage}).single('file');
var uploadMultiple = multer({ storage : storage}).array('files', 999);

router.post('/single',function(req,res) {
    uploadSingle(req,res,function(err) {
        if(err) {
          console.log(err);
          return res.status(500).end("Error uploading file.");
        }
        var file = req.file;
        shFiles.moveFile(file.path, importDir + '/' + file.filename.substr(partPrefix.length));
        console.log('Uploading done', file.filename)
        res.end("OK");
    });
});

router.post('/multiple',function(req,res) {
    uploadMultiple(req,res,function(err) {
        if(err) {
          console.log(err);
            return res.status(500).end("Error uploading files.");
        }
        res.end("OK");
    });
});

let importedRoute = function(req, res) {
  var lastId = req.params.lastId || 0;
  let lastTimeStamp = importLog.lastTimestamp();
  if (lastTimeStamp) {
    let lastModifiedDate = new Date();
    lastModifiedDate.setTime(lastTimeStamp);
    res.setHeader('Last-Modified', lastModifiedDate.toUTCString());
  }
  let response = JSON.stringify(importLog.tail(lastId))
  res.send(response.replace(/"/g,''));
};

router.get('/imported/:lastId', importedRoute);
router.get('/imported', importedRoute);

module.exports = router;
