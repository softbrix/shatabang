'use strict';

//var _ = require('underscore');
var async = require('async');
var path = require('path');
var ProgressBar = require('progress');
var mediaInfo = require('vega_media_info');
var sort_file = require('./modules/sort_file');
var shFiles =   require('./modules/shatabang_files');

var argv = require('minimist')(process.argv.slice(2));


/*
-n : don't add tags
-c : copy file
-d : don't move file
*/

var addTags = !argv.n;
// If c we copy file, if d then we should not touch files
var fileHandlingMethod = argv.c ? " cp " : !argv.d  ? " mv " : undefined;

var bar, tagsBar;

console.log(argv, addTags, fileHandlingMethod);

var sourceDir = __dirname;
if (argv._.length < 2) {
  console.log('Must give source and destination dirs as parameters');
  process.exit(1);
}

var sourceDir = argv._[0];
var destDir = argv._[1];

console.log("Reading dir: " + sourceDir);

var main = function() {

  shFiles.listMediaFiles(sourceDir, function(error, filesList) {
    if (error) {
      //console.log(error);
      if (error.code === 'ENOENT') {
        console.error('Error! Could not find the given source folder: ', sourceDir);
      } else {
        throw error;
      }
      process.exit(2);
    }


    console.log(filesList.length);
    filesToProcess = filesList;
    bar = new ProgressBar('[:bar] :percent (:current/:total) :etas', { total: filesToProcess.length });

    try {
      // Start the workers
      processNext();
      // Callback code can't handle multiple instances
      // processNext();
    } catch (err) {
      console.log('Error: ' + err.message);
    }
  });
};

var addTagsWorkerQueue = async.queue(function(fileInfo, callback) {
  mediaInfo.addTag(fileInfo.fileName, fileInfo.tags)
  .then(callback, callback);
}, 4);

var filesToProcess = [];
var processNext = function() {
  setTimeout(function() {
    if (filesToProcess.length > 0) {
      sort_file(filesToProcess.pop(), destDir)
      .then(doNext, function(error) {
        console.log(error);
        processNext();
      });
      bar.tick();
    } else {
      console.log('Finished moving files. ');
      if (addTagsWorkerQueue.length() > 0) {
        console.log('Tagging images');
        tagsBar = new ProgressBar('[:bar] :percent (:current/:total) :etas', { total: addTagsWorkerQueue.length() });
      }
    }
  }, 0);
};

var doNext = function(movedFilePath, sourceFile) {
  //console.log('do next');
  var parentDir = sourceDir === "/" ? sourceDir : path.join(sourceDir, '..');
  var relativePath = path.relative(parentDir , path.dirname(sourceFile));
  if (addTags) {
    addTagsWorkerQueue.push({
      'fileName' : movedFilePath,
      'tags' : [relativePath]},
      function (err) {
        if(err) { console.log(err); }
        else {
          if(typeof tagsBar !== 'undefined') {
            tagsBar.tick();
          }
        }
    });
  }
  processNext();
};


main();
