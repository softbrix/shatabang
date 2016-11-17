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
  var importDir = config.importDir,
  storageDir = config.storageDir,
  idx_dir = path.join(config.cacheDir, 'idx_finger'),
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

        syncLoop(mediaFiles, function(filePath) {
          var deferred = Q.defer();
          // This needs to run synchronolusly. Add to cache after each update.
          thumbnailer.create_image_finger(filePath, function(b85Finger) {
            var items = idx.get(b85Finger);
            if(items.length > 0) {
              // TODO: Move to duplicates folders

              var newPath = path.join(duplicatesDir, path.basename(filePath));
              shFiles.moveFile(filePath, newPath);
              console.log("Exists", newPath);
              deferred.resolve(newPath);
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
                deferred.resolve(relativePath);
              });
            }
          });
          return deferred.promise;
        }).then(function(importedFiles) {
          done(importedFiles);
        });


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
    console.log('nextloop', i);
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
