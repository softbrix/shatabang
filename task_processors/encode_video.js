"use strict"
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Old video formats needs to be reencoded to be supported by the browsers */
const MAX_WIDTH = 1920, MAX_HEIGHT = 1080;
const CPU_CORES = os.cpus();
const CORES_TO_USE = CPU_CORES.length - 1;

module.exports = function(job, done) {
  const data = job.data;
  const storageDir = data.storageDir;
  const cacheDir = data.cacheDir;
  const file = path.parse(data.file);

  var outputFileName = path.join(cacheDir, '1920', file.dir, file.name + '.mp4'),
      sourceFileName = path.join(storageDir, file.dir, file.base);

  fs.mkdirsSync(path.dirname(outputFileName));

  ffmpeg(sourceFileName, {logger: console})
    .videoCodec('libx264')
    .audioCodec('aac')
    .outputOptions([
      // Tell ffmpg to not print video information
      '-hide_banner',
      // Move information to the beginning of the file and allow playing before it's completly downloaded
      '-movflags faststart',
      // Be compatible with the html5 player
      '-pix_fmt yuv420p',
      // Better compression to speed ratio
      '-preset slower',
      // Run on almost all cores
      '-threads ' + CORES_TO_USE,
      // Limit image size to 1920x1080
      //'-vf "scale=\'min(' + MAX_WIDTH + ',iw)\':\'min(' + MAX_HEIGHT +',ih)\'"'
    ])
    .on('error', function(err) {
      console.log('Error encoding file', err);
      done(err);
    })
    .on('progress', function(progress) {
      job.progress(progress.percent);
    })
    .on('end', function() {
      done();
    })
    .on('start', function(commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .save(outputFileName);
}
