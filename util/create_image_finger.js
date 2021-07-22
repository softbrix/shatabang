"use strict"

var thumbnailer = require('../processor/modules/thumbnailer');
const sha1File = require('sha1-file');

if(process.argv.length < 3) {
    console.log('Must give source');
    process.exit(1);
}

var sourceFile = process.argv[2];

var main = async function() {
  Promise
  .all([thumbnailer.create_image_finger(sourceFile), sha1File(sourceFile)])
  .then(console.log);
};

main();
