"use strict";

var kue = require('kue');

var redisConnectionInfo = {
  host: process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1',
  port: process.env.REDIS_PORT_6379_TCP_PORT || 6379
};

var queue = kue.createQueue({
  redis: redisConnectionInfo
});

var disconnected = false;
process.once( 'SIGTERM', function () {
  disconnect(0);
});

var dying = false;
var disconnect = function disconnect(timeout) {
  if (!dying) {
    dying = true;
    queue.shutdown(timeout || 0, function(err) {
      console.log( 'Kue shutdown: ', err||'' );
    });
  }
};

module.exports = {
  queueTask : function(name, params, priority) {
    var job = queue.create(name, params);
    if(priority) {
      //console.log('set priority', priority );
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
    queue.failed(function( err, ids ) { // others are active, complete, failed, delayed
      ids.forEach( function( id ) {
        kue.Job.get( id, function( err, job ) {
          // Your application should check if job is a stuck one
          console.log('Retry job: ', id);
          job.inactive();
        });
      });
    });
  }
};
