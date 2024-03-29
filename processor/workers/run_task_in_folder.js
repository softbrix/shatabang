"use strict";

var shFiles = require('../common/shatabang_files');
var path = require('path');

const PROCESS_NAME = 'run_task_in_folder';

var init = function(config, task_queue) {
  var storageDir = config.storageDir;

 /**
  data.dir = dir to search for media files
  data.params = params to the new Job
  data.task_name = name of the new task to run
  data.priority = priority of the new job
   */
  task_queue.registerTaskProcessor(PROCESS_NAME, function(data, job, done) {
    var searchDir = path.join(storageDir, data.dir);
    console.log(PROCESS_NAME, searchDir);
    shFiles.listMediaFiles(searchDir, function(err, mediaFiles) {
        if(err) {
          console.error(PROCESS_NAME, err);
          return done(err);
        }
        if(mediaFiles === undefined || !mediaFiles.length) {
          return done('No files found');
        }
        mediaFiles.forEach(function(fullPath) {
          console.log(PROCESS_NAME, 'add task', data.task_name, fullPath);
          var file = path.relative(storageDir, fullPath);
          var params = data.param || {};
          params.file = file;

          task_queue.queueTask(data.task_name, params, data.priority);
        });
        done();
      });
  });
};

module.exports = {
  init : init
};
