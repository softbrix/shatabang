"use strict"
var sort_file = require('../modules/sort_file');
var fileMatcher = require('../modules/file_type_regexp');
var path = require('path');

module.exports = function(src, destDir, task_queue) {
   console.log(src, destDir);
    return sort_file(src, destDir).then(function(newDest) {
      console.log('NewDest', newDest);
      var relativeDest = path.relative(destDir, newDest);
      console.log('Relative', relativeDest);
      //task_queue.queueTask('create_image_finger', { title: relativeDest, file: relativeDest});
      task_queue.queueTask('index_media', { title: relativeDest, file: newDest});
      var directory = relativeDest.split(path.sep)[0];
      console.log('dir', directory);

      var addToImported = function() {
        task_queue.queueTask('update_directory_list', { title: directory, dir: directory});

        //task_queue.queueTask('add_imported', { title: relativeDest, file: relativeDest, time: Date.now()});
      };
      var findFaces = function() {
        task_queue.queueTask('faces_find', { title: relativeDest, file: relativeDest}, 'low');
      }

      // Thumbnail
      task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 300, height: 200})
        .on('complete', addToImported)
        .on('failed', addToImported);
      task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 1920, height: 1080, keepAspec: true}, 'low')
        .on('complete', findFaces);

      if(fileMatcher.isVideo(src)) {
        // TODO: Encode video in multiple formats and sizes, Search for faces etc.
        task_queue.queueTask('encode_video', { title: relativeDest, file: relativeDest}, 'low');
        //task_queue.queueTask('prepare_video', { file: newDest});
      }

      return relativeDest;
    }, console.error);
};
