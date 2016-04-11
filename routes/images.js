"use strict"
var path = require('path');
var express = require('express');
var router = express.Router();
var shFiles = require('../modules/shatabang_files');
var fs = require('fs');
var readline = require('readline');

var sourceDir, cacheDir, deletedDir;
router.initialize = function(config) {
  sourceDir = config.storageDir;
  cacheDir = config.cacheDir;
  deletedDir = path.join(sourceDir, '/deleted/');
};

var escPath = function(p) {
  return p.replace(/(\s)/, "\\ ");
};

router.post('/delete',function(req,res){
    console.log(req.body);
    if(!req.body.length) {
      res.send("Missing post data").status(400);
      return;
    }

    req.body.forEach(function(reference) {

      var p = reference.split(path.sep);
      var mediaListFile = path.join(cacheDir, p[0], 'media.lst');

      var sourceFile = path.join(sourceDir, reference);
      var destFile = path.join(deletedDir, reference);
      var cache300 = path.join(cacheDir, '300', reference);
      var cache1920 = path.join(cacheDir, '1920', reference);

      console.log(sourceFile, ' ', destFile);
      shFiles.moveFile(escPath(sourceFile), escPath(deletedDir))
      .then(console.log, function(error) {
        console.log('Error:', error);
      });
      shFiles.deleteFile(cache300);
      shFiles.deleteFile(cache1920);


      // Delete row in file
      fs.readFile(mediaListFile, 'utf8', function read(err, data) {
          if (err) {
              throw err;
          }

          var lines = data.split(',');

          //console.log(lines);

          for (var i = lines.length - 1; i > -1; i--) {
            if (lines[i] === reference) {
                console.log('deleted:' , reference);
                lines.splice(i, 1);
            }
          }

          shFiles.writeFile(mediaListFile, lines);
      });
    });

    res.send("OK").status(200);
});

module.exports = router;
