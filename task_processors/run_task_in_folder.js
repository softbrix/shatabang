"use strict";

var shFiles = require('../modules/shatabang_files');
var path = require('path');

var init = function(config, task_queue) {
  var storageDir = config.storageDir;

 /**
  data.dir = dir to search for media files
  data.params = params to the new Job
  data.task_name = name of the new task to run
  data.priority = priority of the new job
   */
  task_queue.registerTaskProcessor('run_task_in_folder', function(data, job, done) {
    var searchDir = path.join(storageDir, data.dir);
    shFiles.listMediaFiles(searchDir, function(err, mediaFiles) {
        if(err) {
          console.error(err);
          return done(err);
        }
        if(mediaFiles === undefined || !mediaFiles.length) {
          return done('No files found');
        }
        mediaFiles.forEach(function(fullPath) {
          console.log('add task', data.task_name, fullPath);
          var file = path.relative(storageDir, fullPath);
          var params = data.param || {};
          params.file = file;

          task_queue.queueTask(data.task_name, params, data.priority || 'low');
        });
        done();
      });
  });
};

module.exports = {
  init : init
};
