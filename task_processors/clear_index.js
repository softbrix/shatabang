"use strict";

var shIndex = require('stureby_index');
var path = require('path');
var fs   = require('fs-extra');


var init = function(config, task_queue) {
  var cacheDir = config.cacheDir;

/*
data.index_name = relative path of the file from the storageDir
*/
  task_queue.registerTaskProcessor('clear_index', function(data, job, done) {
    var index_name = data.index_name;
    if(index_name === undefined || !index_name.startsWith('idx')) {
      console.log('Not an index: ' + index_name );
      done('Given parameter index_name was not an index: ' + index_name);
      return;
    }

    var idx = path.join(cacheDir, data.index_name);

    // Reinitialize the index
    var index = shIndex(idx);
    index.clear();

    if(index.keys().length === 0) {
        done();
    } else {
      done('Failed to remove index');
    }
  });
};

module.exports = {
  init : init
};
