"use strict"
var directory_list = require('../modules/directory_list');

var init = function(config, task_queue) {
  var cacheDir = config.cacheDir,
      // Search the source dir so we know if the source is an image or a video
      // Drawback is that we list files which has not been processed, thus not
      // having a thumbnail
      searchDir = config.storageDir;

  task_queue.registerTaskProcessor('update_directory_list', async function(data, _job, done) {
    if (data.dir) {
      await directory_list.processDirectory(data.dir, searchDir, cacheDir);
    } else {
      directory_list.clearMediaListFiles(cacheDir);
      await directory_list.processSubDirectories(searchDir, cacheDir);
    }
    done();
  });
};

module.exports = {
  init : init
};
