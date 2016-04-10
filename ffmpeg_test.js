"use strict"

var ffmpeg = require('fluent-ffmpeg');

if(process.argv.length < 3) {
    console.log('Must give source, destination, width and height as parameters');
    process.exit(1);
}

var sourceFile = process.argv[2];

var main = function() {
  ffmpeg.ffprobe(sourceFile, console.log);
};

main();
