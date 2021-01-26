"use strict"
var directory_list = require('../modules/directory_list');

var init = function(config, task_queue) {
  var cacheDir = config.cacheDir,
      // Search the source dir so we know if the source is an image or a video
      // Drawback is that we list files which has not been processed, thus not
      // having a thumbnail
      searchDir = config.storageDir;
      // Should update the file list in a better way. When searching the
      // thumbnail dir we lose the file type
      //path.join(cacheDir, "300");

  task_queue.registerTaskProcessor('update_directory_list', function() {
    return directory_list.processSubDirectories(searchDir, cacheDir);
  });
};

module.exports = {
  init : init
};
