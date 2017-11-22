"use strict";

var task_queue = require('./modules/task_queue');

var processors = [
    require('./task_processors/clear_index'),
    require('./task_processors/create_image_finger'),
    require('./task_processors/index_media'),
    require('./task_processors/find_faces'),
    require('./task_processors/process_import'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/resize_image'),
    require('./task_processors/resize_images_in_folder'),
    require('./task_processors/run_task_in_folder'),
    require('./task_processors/upgrade'),
  ];

var config = require('./config_server.json');

processors.forEach(function(processor) {
  processor.init(config, task_queue);
});

process.on('SIGINT', function () {
  console.error('Got SIGINT. Shuting down the queue.');
  clearTimeout(timeOut);
  task_queue.disconnect(10000);
});

task_queue.queueTask('upgrade_check', {}, 'high')
  .on('complete', () => {
    console.log("Running task processor...");
    queImport();
  });

var timeOut = 0;
var queImport = function() {
  timeOut = setTimeout(function() {
    try {
      task_queue.queueTask('update_import_directory', {}, 'low')
      .on('complete', queImport)
      .on('failed', function(errorMessage){
        console.error('Job failed', errorMessage);
        queImport();
      });
    } catch(e) {
      console.error('Taskprocessor catched error', e);
      queImport();
    }
  }, 10000);
};
