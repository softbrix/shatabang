"use strict"
var thumbnailer = require('../modules/thumbnailer');
var path = require('path');

var init = function(config, task_queue) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('resize_image', function(data) {
    var width = data.width, relativeFilePath = data.file;
    var outputFileName = path.join(cacheDir, '' + width, relativeFilePath),
        sourceFileName = path.join(storageDir, relativeFilePath);

    return thumbnailer
      .generateThumbnail(sourceFileName, outputFileName, width, data.height, data.keepAspec);
  });
};

module.exports = {
  init : init
};
