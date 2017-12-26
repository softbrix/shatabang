"use strict"
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs-extra');

// Old video formats needs to be reencoded to be supported by the browsers */

var init = function(config, task_queue) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('encode_video', function(data, job, done) {
    var file = path.parse(data.file);

    var outputFileName = path.join(cacheDir, '1920', file.dir, file.name + '.mp4'),
        sourceFileName = path.join(storageDir, file.dir, file.base);

      console.log(sourceFileName, outputFileName);
      fs.mkdirsSync(path.dirname(outputFileName));

      //ffmpeg -i data/sorterat/2006/04/25/094601.avi -y -c:v libx264  -c:a aac -pix_fmt yuv420p -movflags faststart data/cache/1920/2006/04/25/094601.mp4
      //ffmpeg -movflags faststart -pix_fmt yuv420p -i data/sorterat/2006/04/25/102753.avi -y -acodec aac -vcodec libx264 data/cache/1920/2006/04/25/102753.mp4

      ffmpeg(sourceFileName, {logger: console})
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-movflags faststart',
          //'-c:v libx264',
          '-pix_fmt yuv420p',
          //'-c:a aac'
        ])
        //.size('640x480')
        .on('error', function(err) {
          console.log('Error encoding file', err);
          done(err);
        })
        /*.on('progress', function(progress) {
          job.progress(progress.percent, 100);
        })*/
        .on('end', function() {
          done();
        })
        .on('start', function(commandLine) {
          job.log('Spawned Ffmpeg with command: ' + commandLine);
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .save(outputFileName);
  });
};

module.exports = {
  init : init
};
