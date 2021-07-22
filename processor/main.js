"use strict";

const mongoose = require('mongoose');
const redis = require('redis');

const config = require('./common/config.js');
const task_queue = require('./common/task_queue');
const worker_log = require('./workers/worker_log.js');

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
    require('./workers/worker_log'),
  ];

// Connect mongose to mongo database
const mongoUri = process.env.MONGO_URI || `mongodb://${config.mongoHost}:${config.mongoPort}/${config.mongoDB}`;
mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false  
});

// Initialize the default redis client
config.redisClient = redis.createClient({
  host: config.redisHost,
  port: config.redisPort,
  retry_strategy: function(options) {
    if (options.attempt > 50) {
      console.error("Retry task processor redis connection failed");
      return undefined; // End reconnecting with built in error
    }
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting on a specific error and flush all commands with a individual error
      console.error("The redis server refused the connection");
    }
    // reconnect after
    return Math.min(options.attempt*4, 100) * 100;
  },
});
task_queue.connect(config);

processors.forEach(function(processor) {
  processor.init(config, task_queue);
});
// The following tasks runs in a separate process
task_queue.registerProcess('encode_video', __dirname + '/workers/encode_video');

function shutdown() {
  setTimeout(shutdown, 5000);
  clearTimeout(timeOut);
  task_queue.disconnect(2000, disconnectCallback);
}
function disconnectCallback(err) {
  console.log( 'Queue shutdown: ', err || 'OK' );
  config.redisClient.quit();
  process.exit(0);
};
// Ctrl-c
process.on('SIGINT', function () {
  console.error('Got SIGINT. Shuting down the queue.');
  shutdown();
});
// Kill ps
process.once( 'SIGTERM', function () {
  console.error('Got SIGTERM. Shuting down the queue now.');
  shutdown();
});
// Hard internal error, will exit hard after 10sec
process.on('uncaughtException', function (err) {
  console.error('Uncaught exception', err.stack);
  shutdown();
  setTimeout(disconnectCallback, 10000);
});
// Soft error, will probably be hard in the future
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  console.dir('Stack: ', reason.stack);
});

task_queue.queueTask('upgrade_check', {}, 'high')
  .then(async () => {
    console.log("Running task processor...");
    await task_queue.clearQueue('worker_log');
    task_queue.queueTask('worker_log');
    await task_queue.queueTask('worker_log', {}, 5, {
      repeat: {
        every: 5 * 60 * 1000
      },
      removeOnComplete: true,
      removeOnFail: true
    });
    queImport();
  }, disconnectCallback);

var timeOut = 0;
var queImport = function() {
  timeOut = setTimeout(async function() {
    try {
      let job = await task_queue.queueTask('update_import_directory', {}, 'low');
      await job.finished();
    } catch(e) {
      console.error('Taskprocessor catched error', e);
    }
    queImport();
  }, 5000);
};