"use strict";

const thumbnailer = require('../modules/thumbnailer');
const shFiles = require('../common/shatabang_files');
const indexes = require('../common/indexes');
const sha1File = require('sha1-file');
const path = require('path');

var init = function(config, task_queue) {
  var fileShaIndex = indexes.fileShaIndex(config.cacheDir);
  var imgFingerIndex = indexes.imgFingerIndex(config.cacheDir);

  task_queue.registerTaskProcessor('create_image_finger', function(data, job, done) {
    var sourceFile = path.join(config.storageDir, data.file);
    if(shFiles.exists(sourceFile)) {
      Promise.all([sha1File(sourceFile), thumbnailer.create_image_finger(sourceFile)])
      .then(([fileSha1, imgB85]) => {
        job.log('Adding: ', data.file, fileSha1, imgB85);
        fileShaIndex.put(fileSha1, data.file);
        imgFingerIndex.put(imgB85, data.file);
      })
      .then(done, done);
    } else {
      done('File not found: ' + sourceFile);
    }
  });
};

module.exports = {
  init : init
};
