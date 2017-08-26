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

    //TODO: Clear the index with the module: shIndex
    var idx = path.join(cacheDir, data.index_name);

    console.log('Removing index: ' + idx);
    fs.removeSync(idx)

    // Reinitialize the index
    var newIndex = shIndex(idx);

    if(newIndex.keys().length === 0) {
        done();
    } else {
      done('Failed to remove index');
    }
  });
};

module.exports = {
  init : init
};
