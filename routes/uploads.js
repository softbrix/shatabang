"use strict";

var express = require('express'),
    shFiles = require('../modules/shatabang_files');
var router = express.Router(),
    multer  =   require('multer');


var uploadDir, storageDir, importDir;
router.initialize = function(config) {
  uploadDir = config.uploadDir;
  storageDir = config.storageDir;
  importDir = config.importDir;
};
var partPrefix = 'part-';

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    var filename = partPrefix+Date.now()+ '-' + file.originalname;
    console.log('Uploading: ' + filename);
    callback(null, filename);
  }
});
var uploadSingle = multer({ storage : storage}).single('file');
var uploadMultiple = multer({ storage : storage}).array('files', 999);
var imported_cache = [];

router.post('/single',function(req,res) {
    uploadSingle(req,res,function(err) {
        if(err) {
          console.log(err);
          return res.status(500).end("Error uploading file.");
        }
        var file = req.file;
        shFiles.moveFile(file.path, importDir + '/' + file.filename.substr(partPrefix.length));

        res.end("File is uploaded");
    });
});

router.post('/multiple',function(req,res) {
    uploadMultiple(req,res,function(err) {
        if(err) {
          console.log(err);
            return res.status(500).end("Error uploading files.");
        }
        res.end("Files are uploaded");
    });
});

router.get('/imported',function(req,res) {

  if(imported_cache.length === 0) {
    res.send([]).status(200);
    res.end();
    return;
  }

  var last = imported_cache[imported_cache.length - 1];
  res.setHeader('Last-Modified', new Date(last.time));

   var modifiedSinceHeader = req.headers["if-modified-since"];
   var reqModDate = modifiedSinceHeader !== undefined ?  new Date(modifiedSinceHeader).getTime() : 0;

    res.setHeader('content-type', 'application/json');
    var result = [];
    imported_cache.forEach(function(e) {
      if(reqModDate < e.time) {
        result.push(e.path);
      }
    });
    res.send(result).status(200);
   res.end();
});

router.get('/import/list',function(req,res) {
  var last = imported_cache[imported_cache.length - 1];
  res.setHeader('Last-Modified', new Date(last.time));

  // This should send the list with files to be imported
  res.send("Abc").status(200);
 res.end();
});

// TODO: Clear old items in imported_cache


module.exports = router;
