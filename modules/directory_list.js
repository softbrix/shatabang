"use strict";

var shFiles = require('./shatabang_files');
var path = require('path');
var Q = require('q');


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

var findMediaFiles = function(directory, sourceDir) {
  var deffered = Q.defer();
  shFiles.listMediaFiles(path.join(sourceDir, directory), function(err, filesList) {
    if (err) {
      deffered.reject(err);
      return;
    }

    var relativeFilesList = filesList.map(function(item) {
      return path.relative(sourceDir, item);
    });

    relativeFilesList = sortFileListByDate(relativeFilesList);

    deffered.resolve(relativeFilesList);
  });
  return deffered.promise;
};

var writeMediaListFile = function(directory, cachedDir, relativeFilesList) {
  var deffered = Q.defer();
  var mediaListFile = path.join(cachedDir, 'info', directory, 'media.lst');
  //console.log(mediaListFile);

  shFiles.writeFile(mediaListFile, relativeFilesList, function(err) {
    if(err) {
      deffered.reject(err);
      return;
    }
    console.log("The file was saved: ", directory);
    deffered.resolve(mediaListFile);
  });
  return deffered.promise;
};

var addMediaListFile = function(directory, cachedDir, relativeFile) {
  var deffered = Q.defer();
  var mediaListFile = path.join(cachedDir, 'info', directory, 'media.lst');

  if (shFiles.exists(mediaListFile)) {
    //console.log(mediaListFile);
    shFiles.readFile(mediaListFile, (err, fileData) => {
      if (err != undefined) {
        deffered.reject(err);
        return;
      }
      fileData += ',' + relativeFile;
      writeMediaListFile(directory, cachedDir, fileData)
        .then(deffered.resolve, deffered.reject);
    });
  } else {
    writeMediaListFile(directory, cachedDir, relativeFile)
        .then(deffered.resolve, deffered.reject);
  }

  

  return deffered.promise;
};

/**
 Processes the year directory and put file list in cache, then generate
 thumbnails for all items.
 */
var processDirectory = function(directory, sourceDir, cachedDir) {
  return findMediaFiles(directory, sourceDir).then(function(relativeFilesList) {
    return writeMediaListFile(directory, cachedDir, relativeFilesList);
  });
};

var processSubDirectories = function(directory, cachedDir) {
  var deffered = Q.defer();
  shFiles.listSubDirs(directory, (err, dirs) => {
    if (err !== undefined) {
      deffered.reject(err);
    }
    let qs = dirs.map(dir => {
      return processDirectory(dir, directory, cachedDir);
    });
    Promise.resolve(qs).then(deffered.resolve, deffered.reject);
  })

  return deffered.promise;
}

module.exports = {
  findMediaFiles : findMediaFiles,
  processSubDirectories : processSubDirectories,
  processDirectory : processDirectory,
  sortFileListByDate : sortFileListByDate,
  writeMediaListFile : writeMediaListFile,
  addMediaListFile : addMediaListFile
};
