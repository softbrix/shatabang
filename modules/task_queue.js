"use strict";

var Queue = require('bull');

var dying = false;
var disconnect = function disconnect(timeout, cb) {
  debug('Disconnect queue called');
  if (!dying) {
    dying = true;
    let closers = Object.values(queues).map(q => q.close());
    Promise.all(closers).then(() => { cb() }, cb);
  }
};

const PREFIX = 'shTasks';
const queues = {};
var conf;
var jobcnt = 0;
const DEBUG = process.env.DEBUG_TASK_PROCESSOR;

var debug = () => {}
if (DEBUG) {
  debug = console.debug;
}
const log = console.log;

function createQueue(name, jobOptions, advancedSettings) {
  let queue = new Queue(name, {
    redis: {
      host: conf.redisHost,
      port: conf.redisPort,
      maxRetriesPerRequest: null, 
      enableReadyCheck: false
    },
    prefix: PREFIX,
    defaultJobOptions: Object.assign({
      attempts: 2,
      backoff: 5000,
      lifo: true
    }, jobOptions),
    settings: Object.assign({}, advancedSettings)
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
  
  queue.on('resumed', function(){
    // The queue has been resumed.
    debug('QUEUE resumed', name);
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
    debug('connect config', config);
    conf = config;
  },
  clearQueue: function(queueName, status) {
    let queue = queues[queueName];
    if (queue === undefined || queue.clean === undefined) {
        return Promise.reject('Missing queue with name: ' + queueName);
    }
    var clean = queue.clean.bind(queue, 0);

    if (status !== undefined) {
      return queue.pause()
          .then(clean(status))
          .then(() => {
            queue.resume()
          })
    }

    return queue.pause()
     .then(clean('completed'))
     .then(clean('active'))
     .then(clean('delayed'))
     .then(clean('failed'))
     .then(() => {
        return queue.empty();
     })
     .then(() => {
       return queue.getRepeatableJobs()
     })
     .then((repeatJobs) => {
       repeatJobs.forEach((job) => {
         queue.removeRepeatableByKey(job.key);
       })
     })
     .then(() => {
       queue.resume()
     });
  },
  queueTask : function(name, params, priority, jobOpts) {
    debug('Adding job', name);
    let queue = queues[name];
    if (queue === undefined || queue.add === undefined) {
      if (conf.createIfMissing) {
        queue = createQueue(name);
      } else {
        return Promise.reject('Missing queue with name: ' + name);
      }
    }

    let jobid = ((params || {}).file ? params.file + (params.width || '') : new Date().toISOString()) + '_' + jobcnt++;
    params = params || {};
    let options = Object.assign({
      priority: getPrio(priority),
      jobId:  jobid
    }, jobOpts);
    return queue.add(params, options);
  },
  registerTaskProcessor : function(name, taskProcessor, jobOptions) {
    log('Register processor', name);
    jobOptions = jobOptions || {};
    jobOptions.logStartStop = jobOptions.hasOwnProperty('logStartStop') ? jobOptions.logStartStop : true;
    let queue = createQueue(name, jobOptions);
    queue.process(async (job, done) => {
      if (jobOptions.logStartStop) {
        log('Running job: ', name, job.data.title || job.data.file);
      }
      try {
        await taskProcessor(job.data, job, done);
      } catch(err) {
        log('Error in task processor', name, err);
      }
    });

    return queue;
  },
  registerTaskProcessorPromise : function(name, taskProcessor) {
    log('Register processor with promise', name);
    let queue = createQueue(name);

    queue.process((job) => {
      debug('Running promise job', name);
      return taskProcessor(job.data, job);
    });

    return queue;
  },
  registerProcess : function(name, pathToProcessor, concurrency) {
    log('Register separate processor with promise', name);
    let queue = createQueue(name, {});

    concurrency = concurrency || 1
    queue.process(concurrency, pathToProcessor);
  },
  disconnect : disconnect,
  retryFailed: function() {
    Object.values(queues).forEach(async queue => {
      let jobs = await queue.getFailed(0, 1000);
      jobs.forEach(j => { 
        // TODO: add config value when to remove failed jobs
        if (j.attemptsMade > 3) {
          j.discard();
          debug('Discard job: ', j.id);
        } else {
          j.retry();
          debug('Restarting job: ', j.id);
        }
      });
    });
  },
  getJobCounts: function(qName) {
    if (queues[qName] === undefined) {
      createQueue(qName);
    }
    return (queues[qName]||{}).getJobCounts();
  },
  names: () => [
    'clear_index',
    'create_image_finger',
    'encode_video',
    'import_meta',
    'resize_image',
    'retry_unknown',
    'run_task_in_folder',
    'update_directory_list',
    'upgrade_check',
// Keep the update import loop on the side
    'update_import_directory'
  ],
  prefix: PREFIX
};

function getPrio(value) {
  if (value === undefined || Number.isSafeInteger(value)) {
    return value;
  }
  switch(value) {
    case 'low': return 100;
    case 'high': return 1;
    default: return 50;
  }
}