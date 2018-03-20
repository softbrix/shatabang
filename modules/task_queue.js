"use strict";

var kue = require('kue');

var dying = false;
var disconnect = function disconnect(timeout, cb) {
  console.log('Disconnect kue called');
  if (!dying) {
    dying = true;
    queue.shutdown(timeout || 0, cb);
  }
};

function restartJobs(ids) {
  ids.forEach( function( id ) {
    kue.Job.get( id, function( err, job ) {
      if(err || job === undefined) {
        console.error('Failed to restart job: ', err);
        return;
      }
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

var queue;

module.exports = {
  connect: function(config) {
    queue = kue.createQueue({
      redis: {
        host: config.redisHost,
        port: config.redisPort
      }
    });
  },
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
