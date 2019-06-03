"use strict"
var shFiles = require('../modules/shatabang_files');
var path = require('path');

/**
This method will move all media files in unknown directory back to the
import directory so they can be processed again. This could be run after an upgrade
with new import functionallity or media support.
**/
var init = function(config, task_queue) {
  var storageDir = config.storageDir,
  importDir = path.join(storageDir, 'import'),
  unknownDir = path.join(storageDir, 'unknown');

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
