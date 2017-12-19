"use strict"

var directory_list = require('../modules/directory_list');
var shFiles = require('../modules/shatabang_files');
var mediaInfo = require('vega_media_info');
var shIndex = require('stureby_index');
var thumbnailer = require('../modules/thumbnailer');
var _ = require('underscore');
var path = require('path');
var ProgressBar = require('progress');

if(process.argv.length < 4) {
    console.log('Must give source dir and cache dir as parameters');
    process.exit(1);
}

var sourceDir = process.argv[2];
var cachedDir = process.argv[3];

var idx = shIndex(path.join(cachedDir, 'idx_tst'));
var bar, filesToProcess = [];

var main = function() {

  shFiles.listSubDirs(sourceDir, function(error, directories) {
    if (error) {
      throw error;
    }

    /*
    Filter only year folders *
    var yearRegexp = /^[0-9]{4}$/i;
    directories = directories.filter(function(dirname) {
      return yearRegexp.test(dirname);
    });*/

    var directoriesListFile = path.join(cachedDir, 'dirs.lst');
    shFiles.writeFile(directoriesListFile, directories, function(error) {
      if(error) {
        throw error;
      }
      console.log(directories);
    });

    _.each(directories, processDirectory);

  	// Catches exception in the process and keeps the processing of the files running
  	process.on('uncaughtException', function (err) {
  		console.log('Caught exception: ' + err);
  		processNext();
  	});
  });
};

/**
 Processes the year directory and put file list in cache, then generate
 thumbnails for all items.
 */
var processDirectory = function(directory) {
  directory_list.processDirectory(directory, sourceDir, cachedDir)
    .then(function(relativeFilesList) {
  	var startProcessor = filesToProcess.length === 0;
  	filesToProcess = filesToProcess.concat(relativeFilesList);

  	bar = new ProgressBar('[:bar] :percent (:current/:total) :etas', { total: filesToProcess.length });

    console.log('Added [', directory, ']', relativeFilesList.length);

  	if(startProcessor) {
  		console.log('Processor started');
  		processNext();
  	}
  }, function(error) {
    console.log('Error while processing directory', error);
  });
};

var processNext = function() {
  if(filesToProcess.length === 0) {
    console.log('Exit Process next');
    return;
  }
  var fileName = filesToProcess.pop();
  try {
    processFile(fileName).
      then(processNext,
        function(err) {
          console.log('Promise error', fileName, err);
          processNext();
        });
  } catch(err) {
    console.log('Catched error', fileName, err);
    processNext();
  }
};

/**
Create a thumbnail and put file in cache
*/
var processFile = function(relativeFilePath) {
  // TODO: Fixed with 256 and variable height depending on aspect ratio
  var sourceFileName = path.join(sourceDir, relativeFilePath);

  idx.put(path.basename(sourceFileName), relativeFilePath);

  return mediaInfo.
    getTags(sourceFileName).
    then(function(tags) {
      if(tags.length > 0) {
        _.each(tags, function(tag) {
          //console.log('put tag', tag);
          idx.put(tag, relativeFilePath);
        });
      }
    }).
    then(function() {
      var outputFileName = path.join(cachedDir, '300', relativeFilePath);
  	  if(thumbnailer.thumbnailNeedsUpdate(sourceFileName, outputFileName)) {
  		    thumbnailer.generateThumbnail(sourceFileName, outputFileName, 300, 200);
  	  }
    }).then(function() {
      var outputFileName = path.join(cachedDir, '1920', relativeFilePath);
  	  if(thumbnailer.thumbnailNeedsUpdate(sourceFileName, outputFileName)) {
  		    thumbnailer.generateThumbnail(sourceFileName, outputFileName, 1920, 1080, true);
  	  }
    }).then(function() {
      bar.tick();
    });
};

main();
