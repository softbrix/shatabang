"use strict"
var shFiles = require('../common/shatabang_files');
var path = require('path');

/**
This method will move all media files in unknown directory back to the
import directory so they can be processed again. This could be run after an upgrade
with new import functionallity or media support.
**/
const init = function(config, task_queue) {
  const importDir = config.dirs.import,
        unknownDir = config.dirs.unknown;

  task_queue.registerTaskProcessor('retry_unknown', function(data, job, done) {
    shFiles.listMediaFiles(unknownDir, function(err, mediaFiles) {
      if(err) {
        console.error(err);
        return done(err);
      }

      mediaFiles.forEach(function(filePath) {
        var newPath = path.join(importDir, path.basename(filePath));
        shFiles.moveFile(filePath, newPath);
      });
      done();
    });
  });
};

module.exports = {
  init : init
};
