"use strict"
var kue = require('kue');
var queue = kue.createQueue();


process.once( 'SIGTERM', function ( sig ) {
  queue.shutdown( 5000, function(err) {
    console.log( 'Kue shutdown: ', err || '' );
    process.exit( 0 );
  });
});

module.exports = {
  queueTask : function(name, params, priority) {
    var job = queue.create(name, params);
    if(priority) {
      console.log('set priority', priority );
      job.priority(priority);
    }
    job.removeOnComplete( true );
    job.save(
      function(err){
        if( !err ) {
          console.log( 'job id', job.id );
        }
    });
    return job;
  },
  registerTaskProcessor : function(name, taskProcessor) {
    queue.process(name, function(job, done) {
      taskProcessor(job.data, job, done);
    });
  }
};
