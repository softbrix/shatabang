'use strict';

//var _ = require('underscore');
var async = require('async');
var Q = require('q');
var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').exec;
var ProgressBar = require('progress');
var mediaInfo = require('./modules/media_info');
var shFiles = require('./modules/shatabang_files');

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
      parseFile(filesToProcess.pop());
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

/*var escapePath = function(p) {
  return p.replace(/( |\(|\)|\&)/g, '\\$1');
};*/

var parseFile = function(item) {
  //console.log('parseFile', item);

  var destinationDir = path.join(destDir, 'unknown');
  mediaInfo.readMediaInfo(item).then(function (exifData) {
    //console.log('exifData', exifData);
    var date = exifData.CreateDate || exifData.ModifyDate;
    // ex: 2015:12:11 12:10:09
    var dateRegexp = /^([\d]{2,4}).?(\d{1,2}).?(\d{1,2})\s(\d{1,2}).?(\d{1,2}).?(\d{1,2})/;
    var result = dateRegexp.exec(date);
    //console.log(item, exifData.Tags); // Do something with your data!
    var newFileName;
    if (result && result.length > 3) {
      var year = result[1], month = result[2], day = result[3];
      destinationDir = path.join(destDir, year, month, day);
      if (result.length > 6) {
        var hh = result[4], mm = result[5], ss = result[6];
        //console.log(date, hh,mm,ss);
        newFileName = hh+mm+ss + path.extname(item);
      }
    } else {
      console.log("Failed to parse the date in the exif information", item);
    }
    processFile(item, destinationDir, newFileName);
  }, function(error) {
    console.log(item, 'Error: ', (error.message || error));
    processFile(item, destinationDir);
  });
};

var processFile = function(sourceFile, destinationDir, fileName) {
  var parentDir = sourceDir === "/" ? sourceDir : path.join(sourceDir, '..');
  var relativePath = path.relative(parentDir , path.dirname(sourceFile));

  if (typeof fileName === 'undefined') {
    fileName = path.basename(sourceFile);
  }

  var destination = path.join(destinationDir, fileName);

  //console.log('process', sourceFile, destination);

  var doNext = function(movedFilePath) {
    //console.log('do next');
    if (addTags) {
      addTagsWorkerQueue.push({
        'fileName' : movedFilePath,
        'tags' : [relativePath, fileName]},
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

  moveFile(sourceFile, destination)
  .then(doNext, function(error) {
    console.log(error);
    doNext(sourceFile);
  });

};


var moveFile = function(source, destination, retryCnt) {
  if (typeof fileHandlingMethod === 'undefined') {
    return Q.resolve(source);
  }
  var deffered = Q.defer();
  var newDestination = destination;
  if (retryCnt > 0) {
    var fileInfo = path.parse(destination);
    fileInfo.name = fileInfo.name + '_' + retryCnt;
    fileInfo.base = fileInfo.name + fileInfo.ext;
    newDestination = path.format(fileInfo);
  }
  //console.log('moveFile1', newDestination);
  fs.access(newDestination, fs.F_OK, function(err) {
  if (!err) {
    // TODO: This probably doesn't work
    moveFile(source, destination, (retryCnt || 0) + 1).then(function(name) {
      deffered.resolve(name);
    }, function(error) { deffered.reject(error); });
  } else {
    //console.log('newDest', newDestination, path.dirname(newDestination));
    var error = fs.mkdirsSync(path.dirname(newDestination));
    if (error) {
      console.log(newDestination, 'Error with new destination: ', error.message || error);
    }

    var command = fileHandlingMethod + '"' + source + '"' + ' "' + newDestination + '"';
    //console.log(command);
    var fileOpCallback = function(error) {
      if (error) {
        if (error.code === 'EXDEV') {
          exec(command, function(error/*, stdout, stderr*/) {
            if (error) {
              console.log(command, error);
              deffered.reject(error);
            } else {
              deffered.resolve(newDestination);
            }
          });
        } else {
          console.error('Move error', error);
          deffered.reject(error);
        }
      } else {
        deffered.resolve(newDestination);
      }
    };

    if (fileHandlingMethod === " mv ") {
      fs.rename(source, newDestination, fileOpCallback);
    } else {
      fs.copy(source, newDestination, fileOpCallback);
    }
  }
  });
  return deffered.promise;
};


main();
