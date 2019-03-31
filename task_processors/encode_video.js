"use strict"
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs-extra');

// Old video formats needs to be reencoded to be supported by the browsers */

var init = function(config, task_queue) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;
  const MAX_WIDTH = 1920, MAX_HEIGHT = 1080;

  task_queue.registerTaskProcessor('encode_video', function(data, job, done) {
    var file = path.parse(data.file);

    var outputFileName = path.join(cacheDir, '1920', file.dir, file.name + '.mp4'),
        sourceFileName = path.join(storageDir, file.dir, file.base);

      fs.mkdirsSync(path.dirname(outputFileName));

      ffmpeg(sourceFileName, {logger: console})
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-movflags faststart',
          '-pix_fmt yuv420p',
          '-hide_banner',
          '-preset slower'
        ])
        //.size('640x480')
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
  });
};

module.exports = {
  init : init
};
