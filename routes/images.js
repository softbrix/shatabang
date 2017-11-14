"use strict";

var path = require('path');
var express = require('express');
var router = express.Router();
var shFiles = require('../modules/shatabang_files');
var task_queue = require('../modules/task_queue');

var sourceDir, cacheDir, deletedDir;
router.initialize = function(config) {
  sourceDir = config.storageDir;
  cacheDir = config.cacheDir;
  deletedDir = config.deletedDir;
};

router.post('/delete',function(req,res){
    console.log(req.body);
    if(!req.body.length) {
      res.send("Missing post data").status(400);
      return;
    }

    req.body.forEach(function(reference) {
      var sourceFile = path.join(sourceDir, reference);
      var destFile = path.join(deletedDir, path.basename(reference));
      var cache300 = path.join(cacheDir, '300', reference);
      var cache1920 = path.join(cacheDir, '1920', reference);

      console.log(sourceFile, ' ', destFile);
      shFiles.moveFile(sourceFile, destFile)
        .then(console.log, function(error) {
          console.log('Error:', error);
        });
      shFiles.deleteFile(cache300);
      shFiles.deleteFile(cache1920);

      var directory = reference.split(path.sep)[0];
      task_queue.queueTask('update_directory_list', { title: directory, dir: directory});
    });

    res.send("OK").status(200);
});

module.exports = router;
