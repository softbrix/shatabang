"use strict"
var task_queue = require('../modules/task_queue');
var directory_list = require('../modules/directory_list');

var init = function(config) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('update_directory_list', function(data, job, done) {
    directory_list.processDirectory(data.dir, storageDir, cacheDir)
      .then(function() { done(); }, done);
  });
};

module.exports = {
  init : init
};
