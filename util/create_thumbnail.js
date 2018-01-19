"use strict"

var thumbnailer = require('../modules/thumbnailer');

if(process.argv.length < 6) {
    console.log('Must give source, destination, width and height as parameters');
    process.exit(1);
}

var sourceFile = process.argv[2];
var destinationFile = process.argv[3];
var width = process.argv[4];
var height = process.argv[5];

var main = function() {
  thumbnailer.generateThumbnail(sourceFile, destinationFile, Number(width), Number(height), true);
};

main();
