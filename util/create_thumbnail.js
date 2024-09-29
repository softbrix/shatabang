"use strict"

const { isUndefined } = require('underscore');
const thumbnailer = require('../processor/modules/thumbnailer');
const fileTypeRegexp = require('../processor/modules/file_type_regexp');

if(process.argv.length < 6) {
    console.log('Must give source, destination, width and height {isMaxSize} as parameters');
    process.exit(1);
}

var sourceFile = process.argv[2];
var destinationFile = process.argv[3];
var width = process.argv[4];
var height = process.argv[5];

var main = async function() {
  try {
    if (fileTypeRegexp.isVideo(sourceFile)) {
      await thumbnailer.screenshots(sourceFile, destinationFile, ['10%']);
    } else {
      thumbnailer.generateThumbnail(sourceFile, destinationFile, Number(width), Number(height), !isUndefined(process.argv[6]));
    }
  } catch(err) {
    console.error("Error while processing thumbnail", err);
  }
};

main();
