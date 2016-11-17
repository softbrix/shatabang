"use strict"
var mediaInfo = require('../modules/media_info');
var directoryList = require('../modules/directory_list');
var exifHelper = require('../modules/exif_helper');
var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var shIndex = require('../modules/shatabang_index');
var importer = require('./importer');
var path = require('path');

function infoFile(filename) {
  return filename + '.shinfo';
}

/**
This method will process te configured import folder and update the index,
thumbnail and finger for each item in the import folder.
**/
var init = function(config, task_queue) {
  var importDir = config.importDir,
  storageDir = config.storageDir,
  cacheDir = config.cacheDir,
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
        console.log(mediaFiles.length);
        //var filesWithNoInfo = mediaFiles.filter(function(filename) {
        //    var infoFileName = infoFile(filename);
        //    return !shFiles.exists(infoFileName);
        //});

        var idx = shIndex(idx_dir);

        mediaFiles.forEach(function(filePath) {
          // This needs to run synchronolusly. Add to cache after each update.
          thumbnailer.create_image_finger(filePath, function(b85Finger) {
            var items = idx.get(b85Finger);
            if(items.length > 0) {
              // TODO: Move to duplicates folders

              var newPath = path.join(duplicatesDir, path.basename(filePath));
              shFiles.moveFile(filePath, newPath);
              console.log("Exists", newPath);
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
              });
            }

            /*var relPath = path.relative(storageDir, filePath);
            task_queue.queueTask('resize_image', { title: relPath, file: relPath, width: 300, height: 200});
            mediaInfo.readMediaInfo(filePath).then(function (exifData) {
              var exifDate = exifHelper.getDate(exifData);
              var infoFilePath = infoFile(filePath);
              var infoFileData = {
                'finger': b85Finger,
                'date': exifDate.date,
                'time': exifDate.time,
                'width': exifData.Width,
                'height': exifData.Height,
                'tags' : exifData.Tags
              };
              shFiles.writeFile(infoFilePath, JSON.stringify(infoFileData));
            });*/
          });
        });

        //var importReady = mediaFiles.map(function(filePath) {
        //  return path.relative(storageDir, filePath);
        //});

        //directoryList.writeMediaListFile('import', cacheDir, importReady);

        done();

      });
  });
};

module.exports = {
  init : init
};
