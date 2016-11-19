"use strict"
var Q = require('q');
var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var shIndex = require('../modules/shatabang_index');
var importer = require('./importer');
var path = require('path');

/**
This method will process te configured import folder and update the index,
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
    console.log('update_import_directory', data, importDir);
    shFiles.listMediaFiles(importDir, function(err, mediaFiles) {
        if(err) {
          console.error(err);
          return done(err);
        }
        var idx = shIndex(idx_dir);

        syncLoop(mediaFiles, function(filePath, i) {
          var deferred = Q.defer();

          var resolveFile = function(path) {
            var len = mediaFiles.length;
            job.progress(i, len, {nextSlide : i === len ? 'itsdone' : i + 1});
            deferred.resolve(path);
          };

          // This needs to run synchronolusly. Add to cache after each update.
          thumbnailer.create_image_finger(filePath, function(b85Finger) {
            var items = idx.get(b85Finger);
            if(items.length > 0) {
              var newPath = path.join(duplicatesDir, path.basename(filePath));
              shFiles.moveFile(filePath, newPath);
              console.log("Exists", newPath);
              resolveFile(newPath);
            } else {
              console.log("new file");
              importer(filePath, storageDir).then(function(relativePath) {
                // TODO: add to imported list
                idx.put(b85Finger, relativePath);
                console.log("Imported: ", relativePath, b85Finger);
                /*imported_cache.push({
                  time: current_timestamp(),
                  path: relativePath
                });*/
                resolveFile(relativePath);
              }, function() {
                console.log("Failed to import");
                // Failed to import move to unknown dir
                shFiles.moveFile(filePath, path.join(unknownDir, path.basename(filePath)));
                deferred.reject();
              });
            }
          });
          return deferred.promise;
        }).then(function(importedFiles) {
          done(importedFiles);
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
