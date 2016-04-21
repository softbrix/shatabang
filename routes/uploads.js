"use strict"
var express = require('express'),
    importer = require('../task_processors/importer');
var router = express.Router(),
    multer  =   require('multer');


var uploadDir, storageDir;
router.initialize = function(config) {
  uploadDir = config.uploadDir;
  storageDir = config.storageDir;
};

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    console.log('Destdir: ' + uploadDir);
    callback(null, uploadDir);
  },
  filename: function (req, file, callback) {
    var filename = file.fieldname + '-' + Date.now()+ '-' + file.originalname;
    console.log('Uploaded: ' + filename);
    callback(null, filename);
  }
});
var uploadSingle = multer({ storage : storage}).single('file');
var uploadMultiple = multer({ storage : storage}).array('files', 999);


router.post('/single',function(req,res){
    uploadSingle(req,res,function(err) {
        if(err) {
          console.log(err);
            return res.end("Error uploading file.");
        }
        importer(req.file.path, storageDir);
        res.end("File is uploaded");
    });
});

router.post('/multiple',function(req,res){
    uploadMultiple(req,res,function(err) {
        if(err) {
          console.log(err);
            return res.end("Error uploading files.");
        }
        console.log(req.files);
        res.end("Files are uploaded");
    });
});


module.exports = router;
