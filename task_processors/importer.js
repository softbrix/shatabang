"use strict"
var task_queue = require('../modules/task_queue');
var sort_file = require('../modules/sort_file');
var path = require('path');

module.exports = function(src, destDir) {
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

      // Thumbnail
      task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 300, height: 200})
        .on('complete', addToImported)
        .on('failed', addToImported);

      task_queue.queueTask('resize_image', { title: relativeDest, file: relativeDest, width: 1920, height: 1080, keepAspec: true}, 'low');

      task_queue.queueTask('update_directory_list', { title: directory, dir: directory});

      //task_queue.queueTask('prepare_video', { file: newDest});
      task_queue.queueTask('find_faces', { title: relativeDest, file: relativeDest}, 'low');

      return relativeDest;
    });
};
