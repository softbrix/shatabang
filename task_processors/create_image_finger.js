"use strict"
var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var shIndex = require('../modules/shatabang_index');
var path = require('path');

var init = function(config, task_queue) {
  var idx_dir = path.join(config.cacheDir, 'idx_finger');

  var idx = shIndex(idx_dir);

  task_queue.registerTaskProcessor('create_image_finger', function(data, job, done) {
    var sourceFile = path.join(config.storageDir, data.file);
    if(shFiles.exists(sourceFile)) {
      thumbnailer.create_image_finger(sourceFile, function(error, b85) {
        idx.put(b85, data.file);
        done();
      });
    } else {
      done('File not found: ' + sourceFile);
    }
  });
};

module.exports = {
  init : init
};
