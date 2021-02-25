"use strict"
var task_queue = require('../modules/task_queue');

task_queue.connect({
  redisHost: 'localhost',
  redisPort: 6379
});

task_queue.registerTaskProcessor('tags', function(data, job, done) {
  var pending = data.a, total = pending;

  var interval = setInterval(function(){
      job.log('sending!');
      job.progress(total - pending, total);
      --pending || done();
      pending || clearInterval(interval);
    }, 100);
});

task_queue.registerTaskProcessor('resize_img', function(data, job, done) {
  if (data.file) {
    return done('Fail');
  }

  var pending = data.a, total = pending;

  var interval = setInterval(function(){
      job.log('sending!');
      job.progress(total - pending, total);
      --pending || done();
      pending || clearInterval(interval);
    }, 20);
});


//task_queue.queueTask('tags', { title: 'JOB6', a: 2 }, 'medium');
//task_queue.queueTask('tags', { title: 'JOB5', a: 4 });
//task_queue.queueTask('tags', { title: 'JOB4', a: 8 }, 'low');
//task_queue.queueTask('resize_img', { title: 'JOB3', a: 56 }, 'low');
//task_queue.queueTask('resize_img', { title: 'JOB2', a: 33 });
//task_queue.queueTask('resize_img', { title: 'JOB1', a: 22 }, 'high');

//task_queue.queueTask('resize_img', { title: 'JOB6', a: 14 }, 'medium');
//task_queue.queueTask('resize_img', { title: 'JOB5', a: 27 });
//task_queue.queueTask('resize_img', { title: 'JOB4', a: 13 }, 'low');
task_queue.clearQueue('resize_img', 'failed').then( () => {
return task_queue.queueTask('resize_img', { file: 'same2', a: 27 })
.then(job => {
  return job.getState()
}).then((state) => {
  console.log(state);
  return task_queue.queueTask('resize_img', { file: 'same2', a: 13 }, 'low').then(job => {
    console.log('got the job');
    return job.finished().then(() => {
      console.log('DONE!');
    })
  });
});
}).catch((err, err1) => { console.log('Got the error', err, err1)});
//task_queue.queueTask('tags', { title: 'JOB3', a: 5 }, 'high');
//task_queue.queueTask('tags5', { title: 'JOB2', a: 33 });
//task_queue.queueTask('tags', { title: 'JOB1', a: 1 }, 'high');
