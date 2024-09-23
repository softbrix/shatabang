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
    var outputImgFileName = fileTypeRegexp.toCacheImageFileName(path.basename(relativeFilePath)), 
        outputFileName = path.join(cacheDir, '' + width, path.dirname(relativeFilePath), outputImgFileName),
        sourceFileName = path.join(storageDir, relativeFilePath);

    if (!data.forceUpdate && shFiles.exists(outputFileName)) {
      job.log('Already exists: ' + outputFileName);
      return done();
    }

    if (fileTypeRegexp.isVideo(sourceFileName)) {
      const videoTmpDir = path.join(cacheDir, '1920', path.dirname(relativeFilePath));
      const tmpFileName = path.join(videoTmpDir, PREFIX + outputImgFileName);
      await shFiles.ensureDir(path.dirname(tmpFileName));
      await thumbnailer.screenshots(sourceFileName, tmpFileName, ['10%']);
      sourceFileName = tmpFileName;
    } else if (fileTypeRegexp.isHeicFile(sourceFileName)) {
      const heicTmpDir = path.join(cacheDir, '1920', path.dirname(relativeFilePath));
      const tmpFileName = path.join(heicTmpDir, 'h' + outputImgFileName);
      await shFiles.ensureDir(path.dirname(tmpFileName));
      await thumbnailer.convertHeicToJpg(sourceFileName, tmpFileName);
      sourceFileName = tmpFileName;
    }
    thumbnailer
      .generateThumbnail(sourceFileName, outputFileName, width, data.height, data.keepAspec)
      .then(() => { done() }, done);
  });
};

module.exports = {
  init : init
};
