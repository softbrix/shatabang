"use strict";

let task_queue = require('./modules/task_queue');

let processors = [
    require('./task_processors/clear_index'),
    require('./task_processors/create_image_finger'),
    require('./task_processors/encode_video'),
    require('./task_processors/faces_find'),
    require('./task_processors/faces_crop'),
    require('./task_processors/import_meta'),
    require('./task_processors/resize_image'),
    require('./task_processors/retry_unknown'),
    require('./task_processors/run_task_in_folder'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/update_import_directory'),
    require('./task_processors/upgrade_check'),
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
  console.log( 'Queue shutdown: ', err||'OK' );
  process.exit(0);
};
process.on('uncaughtException', function (err) {
  console.error('Uncaught exception', err.stack);
  config.redisClient.quit();
  task_queue.disconnect(2000, disconnectCallback);
});
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
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
  task_queue.disconnect(2000, disconnectCallback);
});

task_queue.queueTask('update_directory_list', {}, 'high');
task_queue.queueTask('upgrade_check', {}, 'high')
  .then(() => {
    console.log("Running task processor...");
    // queImport();
  }, disconnectCallback);

var timeOut = 0;
var queImport = function() {
  timeOut = setTimeout(async function() {
    try {
      let job = await task_queue.queueTask('update_import_directory', {}, 'low');
      job.finished()
        .then(queImport)
        .catch(function(errorMessage){
          console.error('Job failed', errorMessage);
          queImport();
        });
    } catch(e) {
      console.error('Taskprocessor catched error', e);
      queImport();
    }
  }, 3000);
};
queImport();