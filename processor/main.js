"use strict";

let redis = require('redis');

let config = require('./common/config.js');
let task_queue = require('./common/task_queue');

let processors = [
    require('./workers/clear_index'),
    require('./workers/create_image_finger'),
    require('./workers/faces_find'),
    require('./workers/faces_crop'),
    require('./workers/import_meta'),
    require('./workers/resize_image'),
    require('./workers/retry_unknown'),
    require('./workers/run_task_in_folder'),
    require('./workers/update_directory_list'),
    require('./workers/update_import_directory'),
    require('./workers/upgrade_check'),
  ];

// Initialize the default redis client
config.redisClient = redis.createClient({
  host: config.redisHost,
  port: config.redisPort,
  retry_strategy: function(options) {
    if (options.attempt > 10) {
      return undefined; // End reconnecting with built in error
    }
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting on a specific error and flush all commands with a individual error
      return new Error("The server refused the connection");
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
});
task_queue.connect(config);

processors.forEach(function(processor) {
  processor.init(config, task_queue);
});
// The following tasks runs in a separate process
task_queue.registerProcess('encode_video', __dirname + '/workers/encode_video');

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
  console.dir(reason.stack);
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