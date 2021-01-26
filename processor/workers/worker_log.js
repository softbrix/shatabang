"use strict"

/*jslint node: true, nomen: true*/
var WorkLog = require('../common/work_log');

/** Part one of detecting faces in images **/
var init = function(config, task_queue) {
  var workLog = new WorkLog(config.cacheDir);

  task_queue.registerTaskProcessor('worker_log', function() {
    let queueNames = task_queue.names();
    let now = Date.now();

    return Promise.all(queueNames.map(qName => task_queue.getJobCounts(qName)))
      .then(stats => {
        let mappedStatus = queueNames.reduce(function(result, field, index) {
          let stat = stats[index];
          result.push(compress(field, stat));
          return result;
        }, []);
        workLog.push(JSON.stringify({t:now,s:mappedStatus}));
      });
  });
};

function compress(field, stat) {
  return {
    n: field,
    w: stat.waiting,
    a: stat.active,
    c: stat.completed,
    f: stat.failed,
    d: stat.delayed,
    p: stat.paused,
  };
}

function expand(cmp) {
  return {
    name: cmp.n,
    waiting: cmp.w,
    active: cmp.a,
    completed: stat.c,
    failed: stat.f,
    delayed: stat.d,
    paused: stat.p,
  };
}

module.exports = {
  init : init,
  compress : compress,
  expand : expand 
};