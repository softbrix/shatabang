"use strict"
const thumbnailer = require('../modules/thumbnailer');
const shFiles = require('../common/shatabang_files');
const path = require('path');

var init = function(config, task_queue) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('resize_image', async function(data, job, done) {
    var width = data.width, relativeFilePath = data.file;
    var outputFileName = path.join(cacheDir, '' + width, relativeFilePath),
        sourceFileName = path.join(storageDir, relativeFilePath);

    if (!data.forceUpdate && shFiles.exists(outputFileName)) {
      console.log('Already exists: ' + outputFileName);
      job.log('Already exists: ' + outputFileName);
      return done();
    }

    thumbnailer
      .generateThumbnail(sourceFileName, outputFileName, width, data.height, data.keepAspec)
      .then(() => { done() }, done);
  });
};

module.exports = {
  init : init
};
