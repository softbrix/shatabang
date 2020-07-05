"use strict"
var thumbnailer = require('../modules/thumbnailer');
var shFiles = require('../modules/shatabang_files');
var sort_file = require('../modules/sort_file');
var fileMatcher = require('../modules/file_type_regexp');
var directory_list = require('../modules/directory_list');
var ImportLog = require('../modules/import_log');
var path = require('path');
var shIndex = require('stureby-index');
var path = require('path');

/**
This method will process the configured import folder and update the index,
thumbnail and finger for each item in the import folder.
**/
var init = function(config, task_queue) {
  const storageDir = config.storageDir,
  idx_dir = path.join(config.cacheDir, 'idx_finger'),
  importDir = path.join(storageDir, 'import'),
  unknownDir = path.join(storageDir, 'unknown'),
  duplicatesDir = path.join(storageDir, 'duplicates');

  const importLog = new ImportLog(config.cacheDir);
  const idx = shIndex(idx_dir);

  shFiles.mkdirsSync(duplicatesDir);

  task_queue.registerTaskProcessor('update_import_directory', async (data, job, done) => {
    let mediaFiles = await shFiles.listMediaFiles(importDir);
    
    return syncLoop(mediaFiles, async (filePath, i) => {
      console.log("Processing", i, filePath);

      var updateProgress = function() {
        job.progress(100 * i / mediaFiles.length);
      };

      try {
        // This needs to run synchronolusly. Add to cache after each update.
        let b85Finger = await thumbnailer.create_image_finger(filePath);
        var items = idx.get(b85Finger);
        if(items.length > 0) {
          var duplicatesFilePath = path.join(duplicatesDir, path.basename(filePath));
          await shFiles.moveFile(filePath, duplicatesFilePath);
          console.log("Exists in image finger cache", duplicatesFilePath);
          updateProgress();
          return duplicatesFilePath;
        } else {
          let relativePath = await importer(filePath)
          importLog.push(relativePath);
          idx.put(b85Finger, relativePath);
          console.log("Imported: ", relativePath, b85Finger);
          updateProgress();
          return relativePath;
        }
      } catch (err) {
        console.error("Failed to import", err);
        // Failed to import move to unknown dir
        shFiles.moveFile(filePath, path.join(unknownDir, path.basename(filePath)));
        return err;
      }
    }).then(function(importedFiles) {
      if(importedFiles > 0) {
        console.log('Files imported:', importedFiles);
      }
      done();
    }, done);
  }, {removeOnComplete: true});

  var importer = function(src) {
    const destDir = storageDir;
    console.log('Importing', src, destDir);
     return sort_file(src, destDir).then(function(newDest) {
       console.log('NewDest', newDest);
       var relativeDest = path.relative(destDir, newDest);
       console.log('Relative', relativeDest);
       //task_queue.queueTask('create_image_finger', { title: relativeDest, file: relativeDest});
       task_queue.queueTask('import_meta', { title: relativeDest, file: relativeDest});
       var directory = relativeDest.split(path.sep)[0];
       console.log('dir', directory);
  
       var addToImported = function() {
         //task_queue.queueTask('update_directory_list', { title: directory, dir: directory});
  
         // task_queue.queueTask('add_imported', { title: relativeDest, dir: directory, file: relativeDest, time: Date.now()});
         directory_list.addMediaListFile(directory, config.cacheDir, relativeDest);
       };
       var findFaces = function() {
         task_queue.queueTask('faces_find', { title: relativeDest, file: relativeDest}, 'low');
       }
  
       // Thumbnail
       task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 300, height: 200})
       .then(job => job.finished().then(addToImported, addToImported));
       task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 1920, height: 1080, keepAspec: true}, 'low')
       .then(job => job.finished().then(findFaces));
  
       if(fileMatcher.isVideo(src)) {
         // TODO: Encode video in multiple formats and sizes, Search for faces etc.
         task_queue.queueTask('encode_video', { 
            title: relativeDest, 
            file: relativeDest,
            cacheDir: config.cacheDir,
            storageDir: config.storageDir,
            }, 'low');
       }
  
       return relativeDest;
     }, console.error);
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
};
