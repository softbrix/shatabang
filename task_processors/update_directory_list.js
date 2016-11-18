"use strict"
var directory_list = require('../modules/directory_list');

var init = function(config, task_queue) {
  var storageDir = config.storageDir,
      cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('update_directory_list', function(data, job, done) {
    console.log('update_directory_list', data);
    directory_list.processDirectory(data.dir, storageDir, cacheDir)
      .then(function() { console.log('done'); done(); }, done);
  });
};

module.exports = {
  init : init
};
