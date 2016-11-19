"use strict";

var task_queue = require('./modules/task_queue');

var processors = [
    require('./task_processors/create_image_finger'),
    require('./task_processors/index_media'),
    require('./task_processors/process_import'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/resize_image')
  ];

var config = require('./config_server.json');

processors.forEach(function(processor) {
  processor.init(config, task_queue);
});

console.log("Running task processor...");

var queImport = function() {
  setTimeout(function() {
    task_queue.queueTask('update_import_directory', {}, 'low')
    .on('complete', queImport)
    .on('failed', function(errorMessage){
      console.log('Job failed', errorMessage);
      queImport();
    });
  }, 10000);
};
queImport();
