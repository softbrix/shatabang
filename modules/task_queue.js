"use strict";

var Queue= require('bull');

var dying = false;
var disconnect = function disconnect(timeout, cb) {
  debug('Disconnect queue called');
  if (!dying) {
    dying = true;
    let closers = Object.values(queues).map(q => q.close());
    Promise.all(closers).then(cb, cb);
  }
};

const queues = {};
var conf;
var jobcnt = 0;
const DEBUG = false;

function debug() {
  if (DEBUG) {
    debug(arguments);
  }
}

function createQueue(name, jobOptions) {
  let queue = new Queue(name, {
    redis: {
      host: conf.redisHost,
      port: conf.redisPort
    },
    prefix: 'shTasks',
    defaultJobOptions: Object.assign({
      priority: getPrio('mid'),
      attempts: 2,
      backoff: 1000//,
      // removeOnComplete: true
    }, jobOptions)
  });

  queues[name] = queue;

  queue.on('error', function(error) {
    // An error occured.
    debug('QUEUE err', name, error);
  })
  
  queue.on('waiting', function(jobId){
    // A Job is waiting to be processed as soon as a worker is idling.
    debug('QUEUE wait', name, jobId);
  });
  
  queue.on('active', function(job, jobPromise){
    // A job has started. You can use `jobPromise.cancel()`` to abort it.
      debug('QUEUE active', name, job.id);
  })
  
  queue.on('stalled', function(job){
    // A job has been marked as stalled. This is useful for debugging job
    // workers that crash or pause the event loop.
    debug('QUEUE stalled', name, job.id);
  })
  
  queue.on('progress', function(job, progress){
    // A job's progress was updated!
    debug('QUEUE progress', name, job.id, progress);
  })
  
  queue.on('completed', function(job, result){
    // A job successfully completed with a `result`.
    debug('QUEUE complete', name, job.id, result);
  })
  
  queue.on('failed', function(job, err){
    // A job failed with reason `err`!
    debug('QUEUE failed', name, job.id, err);
  })
  
  queue.on('paused', function(){
    // The queue has been paused.
    debug('QUEUE paused', name);
  })
  
  queue.on('resumed', function(job){
    // The queue has been resumed.
    debug('QUEUE resumed', name, job.id);
  })
  
  queue.on('cleaned', function(jobs, type) {
    // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
    // jobs, and `type` is the type of jobs cleaned.
    debug('QUEUE cleaned', name);
  });
  
  queue.on('drained', function() {
    // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
    // debug('QUEUE drained', name);
  });
  
  queue.on('removed', function(job){
    // A job successfully removed.
    debug('QUEUE removed', name, job.id);
  });
  return queue;
}

module.exports = {
  connect: function(config) {
    console.log('connect config', config);
    conf = config;
  },
  queueTask : function(name, params, priority, createIfMissing) {
    debug('Adding job', name);
    let queue = queues[name];
    if (queue === undefined || queue.add === undefined) {
      if (createIfMissing) {
        queue = createQueue(name);
      } else {
        return Promise.reject('Missing queue with name: ' + name);
      }
    }
    // queue.getJobCounts().then(debug, debug);
    return queue.add(params, {
      priority: getPrio(priority),
      jobId: ""+Date.now()+jobcnt++
    });
  },
  registerTaskProcessor : function(name, taskProcessor, jobOptions) {
    debug('Register processor', name);
    let queue = createQueue(name, jobOptions);
    /*queue.getActive().then(jobs => {
      jobs.forEach(job => job.moveToFailed().then(() => job.retry()));
    });*/
    queue.process(async (job, done) =>{
      // debug('Running job', name);
      try {
        await taskProcessor(job.data, job, done);
      } catch(err) {
        console.log('Error in task processor', name, err);
      }
    });

    return queue;
  },
  registerTaskProcessorPromise : function(name, taskProcessor) {
    debug('Register processor with promise', name);
    let queue = createQueue(name);

    queue.process((job) => {
      debug('Running promise job', name);
      return taskProcessor(job.data, job);
    });

    return queue;
  },
  disconnect : disconnect,
  retryFailed: function() {
    Object.values(queues).forEach(async queue => {
      let jobs = await queue.getFailed(0, 1000);
      jobs.forEach(j => { 
        j.retry();
        debug('Restarting job: ', j.id);
      });
    });
  }
};

function getPrio(value) {
  if (Number.isSafeInteger(value)) {
    return value;
  }
  switch(value) {
    case 'low': return 100;
    case 'high': return 1;
    default: return 50;
  }
}