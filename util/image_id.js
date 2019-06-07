"use strict"

if(process.argv.length < 3) {
    console.log('Must give source');
    process.exit(1);
}

var directory = process.argv[2];

var thumbnailer = require('../modules/thumbnailer');
var idx = require('stureby-index')('./idx_finger');
var shFiles = require('../modules/shatabang_files');

shFiles.listMediaFiles(directory, function(err, filesList) {
  filesList.forEach(function(sourceFile) {
    thumbnailer.create_image_finger(sourceFile).then(function(b85) {
      console.log(sourceFile, b85.substr(0,8));
      idx.put(b85, sourceFile);
    }, console.error);
  });
});
