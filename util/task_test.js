"use strict"
var task_queue = require('../modules/task_queue');


task_queue.registerTaskProcessor('tags', function(data, job, done) {
  console.log(data);
  var pending = data.a, total = pending;

  var interval = setInterval(function(){
      job.log('sending!');
      job.progress(total - pending, total);
      --pending || done();
      pending || clearInterval(interval);
    }, 1000);
});

task_queue.registerTaskProcessor('resize_img', function(data, job, done) {
  console.log(data);
  var pending = data.a, total = pending;

  var interval = setInterval(function(){
      job.log('sending!');
      job.progress(total - pending, total);
      --pending || done();
      pending || clearInterval(interval);
    }, 200);
});


task_queue.queueTask('tags', { title: 'JOB6', a: 14 }, 'medium');
task_queue.queueTask('tags1', { title: 'JOB5', a: 27 });
task_queue.queueTask('tags', { title: 'JOB4', a: 13 }, 'low');
task_queue.queueTask('resize_img', { title: 'JOB3', a: 56 }, 'high');
task_queue.queueTask('resize_img', { title: 'JOB2', a: 33 });
task_queue.queueTask('resize_img', { title: 'JOB1', a: 22 }, 'high');

task_queue.queueTask('resize_img', { title: 'JOB6', a: 14 }, 'medium');
task_queue.queueTask('resize_img', { title: 'JOB5', a: 27 });
task_queue.queueTask('resize_img', { title: 'JOB4', a: 13 }, 'low');
task_queue.queueTask('tags', { title: 'JOB3', a: 56 }, 'high');
task_queue.queueTask('tags5', { title: 'JOB2', a: 33 });
task_queue.queueTask('tags', { title: 'JOB1', a: 22 }, 'high');
