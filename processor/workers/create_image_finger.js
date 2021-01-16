"use strict";

const thumbnailer = require('../modules/thumbnailer');
const shFiles = require('../common/shatabang_files');
const indexes = require('../common/indexes');
const sha1File = require('sha1-file');
const path = require('path');

var init = function(config, task_queue) {

  task_queue.registerTaskProcessor('create_image_finger', function(data, job, done) {
    var sourceFile = path.join(config.storageDir, data.file);
    if(shFiles.exists(sourceFile)) {
      sha1File(sourceFile, function(error, sha) {
        if(error) {
          done(error);
          return;
        }
        var idx = indexes.fileShaIndex(config.cacheDir);
        idx.put(sha, data.file);
        idx.flush(true);

        thumbnailer.create_image_finger(sourceFile).then(function(b85) {
          var idx = indexes.imgFingerIndex(config.cacheDir);
          idx.put(b85, data.file);
          console.log('adding: ', data.file, b85);
          idx.flush(true);
          done();
        }, done);
      });
    } else {
      done('File not found: ' + sourceFile);
    }
  });
};

module.exports = {
  init : init
};
