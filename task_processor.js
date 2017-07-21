"use strict";

var task_queue = require('./modules/task_queue');

var processors = [
    require('./task_processors/create_image_finger'),
    require('./task_processors/index_media'),
    require('./task_processors/find_faces'),
    require('./task_processors/process_import'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/resize_image'),
    require('./task_processors/resize_images_in_folder')
  ];

var config = require('./config_server.json');

processors.forEach(function(processor) {
  processor.init(config, task_queue);
});

console.log("Running task processor...");

var timeOut = 0;
var queImport = function() {
  timeOut = setTimeout(function() {
    try {
      task_queue.queueTask('update_import_directory', {}, 'low')
      .on('complete', queImport)
      .on('failed', function(errorMessage){
        console.log('Job failed', errorMessage);
        queImport();
      });
    } catch(e) {
      console.log('Taskprocessor catched error', e);
      queImport();
    }
  }, 10000);
};
queImport();

process.on('SIGINT', function () {
  console.log('Got SIGINT. Shuting down the queue.');
  clearTimeout(timeOut);
  task_queue.disconnect(10000);
});
