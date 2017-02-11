"use strict";

var shFiles = require('../modules/shatabang_files');
var path = require('path');

var init = function(config, task_queue) {
  var storageDir = config.storageDir;

  task_queue.registerTaskProcessor('resize_images_in_folder', function(data, job, done) {
    shFiles.listMediaFiles(data.dir, function(err, mediaFiles) {
        if(err) {
          console.error(err);
          return done(err);
        }
        if(mediaFiles === undefined || !mediaFiles.length) {
          return done('No files found');
        }
        mediaFiles.forEach(function(fullPath) {

          var file = path.relative(storageDir, fullPath);

          task_queue.queueTask('resize_image', { title: file, file: file, width: 300, height: 200});

          task_queue.queueTask('resize_image', { title: file, file: file, width: 1920, height: 1080, keepAspec: true}, 'low');
        });
        done();
      });
  });
};

module.exports = {
  init : init
};
