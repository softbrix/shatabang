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
  if(!disconnected) {
      disconnect(0);
  }
});

var disconnect = function disconnect(timeout) {
  queue.shutdown(timeout || 0, function(err) {
    console.log( 'Kue shutdown: ', err||'' );
    process.exit( 0 );
  });
  disconnected = true;
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
          console.log( 'job id', job.id, err );
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
  redisConnectionInfo: redisConnectionInfo
};
