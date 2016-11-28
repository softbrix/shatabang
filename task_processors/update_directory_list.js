"use strict"
var directory_list = require('../modules/directory_list');
var path = require('path');

var init = function(config, task_queue) {
  var cacheDir = config.cacheDir,
      searchDir = path.join(cacheDir, "300");

  task_queue.registerTaskProcessor('update_directory_list', function(data, job, done) {
    console.log('update_directory_list', data);
    directory_list.processDirectory(data.dir, searchDir, cacheDir)
      .then(done, done);
  });
};

module.exports = {
  init : init
};
