"use strict"
var thumbnailer = require('../modules/thumbnailer');
var path = require('path');

var init = function(config, task_queue) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('resize_image', function(data, job, done) {
    var width = data.width, relativeFilePath = data.file;
    var outputFileName = path.join(cacheDir, '' + width, relativeFilePath),
        sourceFileName = path.join(storageDir, relativeFilePath);

    thumbnailer
      .generateThumbnail(sourceFileName, outputFileName, width, data.height, data.keepAspec)
      .then(() => done(), done);
  });
};

module.exports = {
  init : init
};
