"use strict";

var kue = require('kue');

var redisConnectionInfo = {
  host: process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1',
  port: process.env.REDIS_PORT_6379_TCP_PORT || 6379
};

var queue = kue.createQueue({
  redis: redisConnectionInfo
});

var dying = false;
var disconnect = function disconnect(timeout, cb) {
  if (!dying) {
    dying = true;
    queue.shutdown(timeout || 0, cb);
  }
};

function restartJobs(ids) {
  ids.forEach( function( id ) {
    kue.Job.get( id, function( err, job ) {
      console.log('Retry job: ', id);
      job.inactive();
    });
  });
}

function restartJobsHandler(resolve, reject) {
  return function( err, ids ) {
    if(err) {
      reject(err);
      return;
    }
    restartJobs(ids);
    resolve();
  };
}

module.exports = {
  queueTask : function(name, params, priority) {
    var job = queue.create(name, params);
    if(priority) {
      job.priority(priority);
    }
    job.removeOnComplete( true );
    job.save(
      function(err){
        if( err ) {
          console.log('Error job id', job.id, err );
        }
    });
    return job;
  },
  registerTaskProcessor : function(name, taskProcessor) {
    queue.process(name, function(job, done) {
      taskProcessor(job.data, job, done);
    });
  },
  disconnect : disconnect,
  redisConnectionInfo: redisConnectionInfo,
  retryFailed: function() {
    return new Promise(function(resolve, reject) {
      queue.failed(restartJobsHandler(resolve, reject));
    });
  },
  restartActive: function() {
    return new Promise(function(resolve, reject) {
      queue.active(restartJobsHandler(resolve, reject));
    });
  },
  enableWatchDog : function() {
    queue.watchStuckJobs(4000);
  }
};
