"use strict";

var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var shIndex = require('stureby_index');
var sha1File = require('sha1-file');
var path = require('path');

var init = function(config, task_queue) {
  var idx_finger_dir = path.join(config.cacheDir, 'idx_finger');
  var idx_sha_dir = path.join(config.cacheDir, 'idx_file_sha');

  task_queue.registerTaskProcessor('create_image_finger', function(data, job, done) {
    var sourceFile = path.join(config.storageDir, data.file);
    if(shFiles.exists(sourceFile)) {
      sha1File(sourceFile, function(error, sha) {
        if(error) {
          done(error);
          return;
        }
        var idx = shIndex(idx_sha_dir);
        idx.put(sha, data.file);
        idx.flush(true);

        thumbnailer.create_image_finger(sourceFile, function(error, b85) {
          if(error) {
            done(error);
            return;
          }
          var idx = shIndex(idx_finger_dir);
          idx.put(b85, data.file);
          console.log('adding: ', data.file, b85);
          idx.flush(true);
          done();
        });
      });
    } else {
      done('File not found: ' + sourceFile);
    }
  });
};

module.exports = {
  init : init
};
