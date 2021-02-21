"use strict"
const fileTypeRegexp = require('../modules/file_type_regexp');
const thumbnailer = require('../modules/thumbnailer');
const shFiles = require('../common/shatabang_files');
const path = require('path');

const PREFIX = 'v';

var init = function(config, task_queue) {
  var storageDir = config.storageDir, cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('resize_image', async function(data, job, done) {
    var width = data.width, 
    relativeFilePath = data.file;
    var outputImgFileName = fileTypeRegexp.toImageFileName(path.basename(relativeFilePath)), 
        outputFileName = path.join(cacheDir, '' + width, path.dirname(relativeFilePath), outputImgFileName),
        sourceFileName = path.join(storageDir, relativeFilePath);

    if (!data.forceUpdate && shFiles.exists(outputFileName)) {
      console.log('Already exists: ' + outputFileName);
      job.log('Already exists: ' + outputFileName);
      return done();
    }

    if (fileTypeRegexp.isVideo(sourceFileName)) {
      const videoTmpDir = path.join(cacheDir, '1920', path.dirname(relativeFilePath));
      const videoImageOutFileName = PREFIX + outputImgFileName;
      const videoOutFullPath = path.join(videoTmpDir, videoImageOutFileName);
      await thumbnailer.screenshots(sourceFileName, videoOutFullPath, ['10%']);
      sourceFileName = videoOutFullPath;
    }
    thumbnailer
      .generateThumbnail(sourceFileName, outputFileName, width, data.height, data.keepAspec)
      .then(() => { done() }, done);
  });
};

module.exports = {
  init : init
};
