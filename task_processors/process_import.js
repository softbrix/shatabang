"use strict"
var Q = require('q');
var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var shIndex = require('stureby_index');
var importer = require('./importer');
var path = require('path');

/**
This method will process the configured import folder and update the index,
thumbnail and finger for each item in the import folder.
**/
var init = function(config, task_queue) {
  var storageDir = config.storageDir,
  idx_dir = path.join(config.cacheDir, 'idx_finger'),
  importDir = path.join(storageDir, 'import'),
  unknownDir = path.join(storageDir, 'unknown'),
  duplicatesDir = path.join(storageDir, 'duplicates');

  shFiles.mkdirsSync(duplicatesDir);

  task_queue.registerTaskProcessor('update_import_directory', function(data, job, done) {
    //console.log('update_import_directory', data, importDir);
    shFiles.listMediaFiles(importDir, function(err, mediaFiles) {
        if(err) {
          console.error(err);
          return done(err);
        }
        var idx = shIndex(idx_dir);

        syncLoop(mediaFiles, function(filePath, i) {
          job.log("Processing", i, filePath);

          var updateProgress = function() {
            var len = mediaFiles.length;
            job.progress(i, len, {nextSlide : i === len ? 'itsdone' : i + 1});
          };

          var handleError = function(err) {
            console.error("Failed to import", err);
            // Failed to import move to unknown dir
            shFiles.moveFile(filePath, path.join(unknownDir, path.basename(filePath)));
            return Promise.reject(err);
          };

          // This needs to run synchronolusly. Add to cache after each update.
          return thumbnailer.create_image_finger(filePath).then(function(b85Finger) {
            var items = idx.get(b85Finger);
            if(items.length > 0) {
              var duplicatesFilePath = path.join(duplicatesDir, path.basename(filePath));
              shFiles.moveFile(filePath, duplicatesFilePath);
              job.log("Exists", duplicatesFilePath);
              updateProgress();
              return duplicatesFilePath;
            } else {
              importer(filePath, storageDir, task_queue).then(function(relativePath) {
                // TODO: add to latest imported list
                idx.put(b85Finger, relativePath);
                job.log("Imported: ", relativePath, b85Finger);
                /*imported_cache.push({
                  time: current_timestamp(),
                  path: relativePath
                });*/
                updateProgress();
                return relativePath;
              }, handleError);
            }
          }, handleError);
        }).then(function(importedFiles) {
          if(importedFiles > 0) {
            console.log('Files imported:', importedFiles);
            job.log('Files imported:', importedFiles);
          }
          done();
        }, done);
      });
  });
};

function syncLoop(list, method) {
  var deferred = Q.defer();
  if(list === undefined) {
    deferred.resolve([]);
  }
  var i = 0;
  var next = function() {
    //console.log('nextloop', i);
    if(i < list.length) {
      method(list[i], i).then(next, next);
    } else {
      deferred.resolve(i);
    }
    ++i;
  };
  next();
  return deferred.promise;
}

module.exports = {
  init : init
};
