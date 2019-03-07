"use strict";

let task_queue = require('./modules/task_queue');

let processors = [
    require('./task_processors/clear_index'),
    require('./task_processors/create_image_finger'),
    require('./task_processors/encode_video'),
    require('./task_processors/faces_find'),
    require('./task_processors/faces_crop'),
    require('./task_processors/import_meta'),
    require('./task_processors/process_import'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/resize_image'),
    require('./task_processors/retry_unknown'),
    require('./task_processors/run_task_in_folder'),
    require('./task_processors/upgrade'),
  ];

let config = require('./config.js');
let redis = require('redis');

// Initialize the default redis client
config.redisClient = redis.createClient({
  host: config.redisHost,
  port: config.redisPort
});
task_queue.connect(config);

processors.forEach(function(processor) {
  processor.init(config, task_queue);
});

function disconnectCallback(err) {
  console.log( 'Kue shutdown: ', err||'OK' );
  process.exit(0);
};
process.on('uncaughtException', function (err) {
  console.error('Uncaught exception', err.stack);
  config.redisClient.quit();
  task_queue.disconnect(0, disconnectCallback);
});
process.on('SIGINT', function () {
  console.error('Got SIGINT. Shuting down the queue.');
  clearTimeout(timeOut);
  config.redisClient.quit();
  task_queue.disconnect(2000, disconnectCallback);
});
process.once( 'SIGTERM', function () {
  console.error('Got SIGTERM. Shuting down the queue now.');
  config.redisClient.quit();
  task_queue.disconnect(0, disconnectCallback);
});

task_queue.enableWatchDog();
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
