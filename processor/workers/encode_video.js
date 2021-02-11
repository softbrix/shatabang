"use strict"
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const shFiles = require('../common/shatabang_files');

// Old video formats needs to be reencoded to be supported by the browsers
// So we do this for all the videos
const MAX_WIDTH = 1920, MAX_HEIGHT = 1080;
const CPU_CORES = os.cpus();
const CORES_TO_USE = Math.max(1, CPU_CORES.length - 1);

module.exports = function(job, done) {
  const data = job.data;
  const storageDir = data.storageDir;
  const cacheDir = data.cacheDir;
  const width = data.width || MAX_WIDTH;
  const height = data.height || MAX_HEIGHT;
  const file = path.parse(data.file);

  var outputFileName = path.join(cacheDir, '' + width, file.dir, file.name + '.mp4'),
      sourceFileName = path.join(storageDir, file.dir, file.base);

  fs.mkdirsSync(path.dirname(outputFileName));

  job.log('Source: '+ sourceFileName);
  job.log('Dest: ' + outputFileName);

  if (!data.forceUpdate && shFiles.exists(outputFileName)) {
    job.log('Video already exists: ' + outputFileName)
    return done();
  }

  ffmpeg(sourceFileName, { logger: console })
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
      //'-preset slowest',
      '-crf 28',
      // Run on almost all cores
      '-threads ' + CORES_TO_USE,
      // Limit image size to 1920x1080
      // '-vf scale=w='+width+':h='+height+':force_original_aspect_ratio=decrease'
    ])
    .size(`${width}x${height}`)
    .keepDisplayAspectRatio()
    .on('error', function(err) {
      job.log('Error encoding file', err);
      done(err);
    })
    .on('progress', function(progress) {
      job.progress(progress.percent);
    })
    .on('end', function() {
      job.progress(100);
      done();
    })
    .on('start', function(commandLine) {
      job.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .save(outputFileName);
}
