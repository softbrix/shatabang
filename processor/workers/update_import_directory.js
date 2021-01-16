"use strict"
var shFiles = require('../common/shatabang_files');
var sort_file = require('../modules/sort_file');
var fileMatcher = require('../modules/file_type_regexp');
var directory_list = require('../modules/directory_list');
var ImportLog = require('../common/import_log');
var mediaInfo = require('vega-media-info');
var path = require('path');
var shIndex = require('stureby-index');
var path = require('path');

const useExifToolFallback = process.env.EXIF_TOOL || true;
/**
This method will process the configured import folder and update the index,
thumbnail and finger for each item in the import folder.
**/
var init = function(config, task_queue) {
  const storageDir = config.storageDir,
  idx_imported_dir = path.join(config.cacheDir, 'idx_imported'),
  importDir = path.join(storageDir, 'import'),
  unknownDir = path.join(storageDir, 'unknown'),
  duplicatesDir = path.join(storageDir, 'duplicates');

  const importLog = new ImportLog(config.cacheDir);
  const idxImported = shIndex(idx_imported_dir);

  shFiles.mkdirsSync(duplicatesDir);

  task_queue.registerTaskProcessor('update_import_directory', async (data, job, done) => {
    let mediaFiles = await shFiles.listMediaFiles(importDir);
    
    return syncLoop(mediaFiles, async (filePath, i) => {
      console.log("Processing", i, filePath);

      var updateProgress = function() {
        job.progress(100 * i / mediaFiles.length);
      };

      try {
        var exifData = await mediaInfo.readMediaInfo(filePath, useExifToolFallback);
        if (exifData === undefined) {
          throw Error("Failed to read exif data from " + filePath);
        }
        var date = new Date(exifData.CreateDate || exifData.ModifyDate);
        var items = idxImported.get(date.getTime());
        // This needs to run synchronolusly. Add to cache after each update.
        if(items.length > 0) {
          var newDest = await sort_file(filePath, duplicatesDir, exifData)
          console.log("Exists in image date cache", newDest);
        } else {
          var newDest = await sort_file(filePath, storageDir, exifData);
          var relativeDest = path.relative(storageDir, newDest);
          await queueWorkers(relativeDest, date.getTime());
          importLog.push(date.getTime());
          console.log("Imported: ", relativeDest);
        }
      } catch (err) {
        console.error("Failed to import", err);
        if (shFiles.exists(filePath)) {
          // Failed to import move to unknown dir
          shFiles.moveFile(filePath, path.join(unknownDir, path.basename(filePath)));
        }
      }
      updateProgress();
    }).then(function(importedFiles) {
      if(importedFiles > 0) {
        console.log('Files imported:', importedFiles);
      }
      done();
    }, done);
  }, {removeOnComplete: true});

  var queueWorkers = function(relativeDest, timestamp) {
    console.log('Importing', relativeDest);
    task_queue.queueTask('create_image_finger', { title: relativeDest, file: relativeDest});
    task_queue.queueTask('import_meta', { title: relativeDest, file: relativeDest, id: '' + timestamp });

    var directory = relativeDest.split(path.sep)[0];

    var addToImported = function() {
      directory_list.addMediaListFile(directory, config.cacheDir, relativeDest);
    };

    // Thumbnail
    task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 300, height: 200})
    .then(job => job.finished().then(addToImported, addToImported));
    task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 1920, height: 1080, keepAspec: true}, 'low')
    .then(job => job.finished().then(() => {
      task_queue.queueTask('faces_find', { title: relativeDest, file: relativeDest}, 'low');
    }));

    if(fileMatcher.isVideo(relativeDest)) {
      // TODO: Encode video in multiple formats and sizes, Search for faces etc.
      var data = { 
        title: relativeDest, 
        file: relativeDest,
        cacheDir: config.cacheDir,
        storageDir: config.storageDir
      };
      data.width = 1920;
      data.height = 1080;
      task_queue.queueTask('encode_video', data, 'low');

      // Create a shallow copy
      data = Object.assign({}, data);
      data.width = 960;
      data.height = 540;
      task_queue.queueTask('encode_video', data, 'low');
    }
  };
};

function syncLoop(list, method) {
  return new Promise(function(resolve, reject) {
    if(list === undefined) {
      resolve([]);
    }
    var i = 0;
    var next = function() {
      //console.log('nextloop', i);
      if(i < list.length) {
        method(list[i], i).then(next, next);
      } else {
        resolve(i);
      }
      ++i;
    };
    next();
  });
}

module.exports = {
  init : init
}
