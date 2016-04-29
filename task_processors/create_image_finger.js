"use strict"
var task_queue = require('../modules/task_queue');
var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var shIndex = require('../modules/shatabang_index');
var path = require('path');

var init = function(config) {
  var idx_dir = path.join(config.cacheDir, 'idx_finger');

  var idx = shIndex(idx_dir);

  task_queue.registerTaskProcessor('create_image_finger', function(data, job, done) {
    var sourceFile = path.join(config.cacheDir, '1920', data.file);
    if(shFiles.exists(sourceFile)) {
      thumbnailer.create_image_finger(sourceFile, function(b85) {
        idx.put(b85, sourceFile);
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
