"use strict"
var express = require('express');
var router  = express.Router();
var path    = require('path');
var shFiles = require('../modules/shatabang_files');

var cacheDir, infoDirectory;
router.initialize = function(config) {
  cacheDir = config.cacheDir;
  infoDirectory = path.join(cacheDir, 'info');
};

router.get('/list',function(req,res){
  shFiles.listSubDirs(infoDirectory, function(error, directories) {
    if(error) {
      console.log(error);
      res.writeHead(500, {'Content-Type': 'text/plain'});
      return res.end("Error loading directories." + JSON.stringify(error));
    }
    res.setHeader('content-type', 'application/json');
    res.send(directories).status(200);
  });
});

module.exports = router;
