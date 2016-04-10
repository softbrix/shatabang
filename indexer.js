"use strict"

var shFiles = require('./modules/shatabang_files');
var mediaInfo = require('./modules/media_info');
var idx = require('./modules/shatabang_index');
var thumbnailer = require('./modules/thumbnailer');
var _ = require('underscore');
var path = require('path');
var ProgressBar = require('progress');

if(process.argv.length < 4) {
    console.log('Must give source dir and cache dir as parameters');
    process.exit(1);
}

var sourceDir = process.argv[2];
var cachedDir = process.argv[3];

var bar, filesToProcess = [];

var main = function() {

  idx.usePath(path.join(cachedDir, 'idx_tst'));

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


// file list is a lot of entries like '/year/month/day/time.xyz'
var fileDateRegexp = /^([\d]{2,4}).?(\d{1,2}).?(\d{1,2}).?(\d{1,6})/;
var sortFileListByDate = function(fileList) {
  return fileList.sort(function(b, a) {
    var regExpA = fileDateRegexp.exec(a) || {length: 0};
    var regExpB = fileDateRegexp.exec(b) || {length: 0};
    if(regExpA.length < 5 || regExpA.length !== regExpB.length) {
      return regExpA.length - regExpB.length;
    }
    if(regExpA[1] === regExpB[1]) {
      if(regExpA[2] === regExpB[2]) {
        return regExpA[3] - regExpB[3];
      }
      return regExpA[2] - regExpB[2];
    }
    return regExpA[1] - regExpB[1];
  });
};

/**
 Processes the year directory and put file list in cache, then generate
 thumbnails for all items.
 */
var processDirectory = function(directory) {
  shFiles.listMediaFiles(path.join(sourceDir, directory), function(error, filesList) {
    if (error) {
      throw error;
    }

    //console.log(directory, filesList.length);

    var relativeFilesList = _.map(filesList, function(item) {
      return path.relative(sourceDir, item);
    });

    relativeFilesList = sortFileListByDate(relativeFilesList);

    //console.log(relativeFilesList);

    var mediaListFile = path.join(cachedDir, directory, 'media.lst');
    //console.log(mediaListFile);

    shFiles.writeFile(mediaListFile, relativeFilesList, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved: ", directory);
    });

	var startProcessor = filesToProcess.length === 0;
	filesToProcess = filesToProcess.concat(relativeFilesList);

	bar = new ProgressBar('[:bar] :percent (:current/:total) :etas', { total: filesToProcess.length });

  console.log('Added [', directory, ']', filesList.length);

	if(startProcessor) {
		console.log('Processor started');
		processNext();
	}
  });
};

var processNext = function() {
  if(filesToProcess.length === 0) {
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
