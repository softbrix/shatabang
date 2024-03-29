"use strict";

var shFiles = require('../common/shatabang_files');
var path = require('path');


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
  return new Promise(function(resolve, reject) {
    shFiles.listMediaFiles(path.join(sourceDir, directory), function(err, filesList) {
      if (err) {
        reject(err);
        return;
      }

      var relativeFilesList = filesList.map(function(item) {
        return path.relative(sourceDir, item);
      });

      relativeFilesList = sortFileListByDate(relativeFilesList);

      resolve(relativeFilesList);
    });
  });
};

const clearMediaListFiles = function(cacheDir) {
  const infoDirectory = path.join(cacheDir, 'info');
  shFiles.rmDirSync(infoDirectory, { recursive: true });
}

var writeMediaListFile = function(directory, cachedDir, relativeFilesList) {
  return new Promise(function(resolve, reject) {
    var mediaListFile = path.join(cachedDir, 'info', directory, 'media.lst');
    shFiles.writeFile(mediaListFile, relativeFilesList, function(err) {
      if(err) {
        reject(err);
        return;
      }
      console.log("The file was saved: ", directory);
      resolve(mediaListFile);
    });
  });
};

var addMediaListFile = function(directory, cachedDir, relativeFile) {
  return new Promise(function(resolve, reject) {
    var mediaListFile = path.join(cachedDir, 'info', directory, 'media.lst');

    if (shFiles.exists(mediaListFile)) {
      shFiles.readFile(mediaListFile, (err, fileData) => {
        if (err != undefined) {
          reject(err);
          return;
        }

        fileData += ',' + relativeFile;
        
        writeMediaListFile(directory, cachedDir, fileData)
          .then(resolve, reject);
      });
    } else {
      writeMediaListFile(directory, cachedDir, relativeFile)
          .then(resolve, reject);
    }
  });
};

/**
 Processes the year directory and put file list in cache, then generate
 thumbnails for all items.
 */
var processDirectory = function(directory, sourceDir, cachedDir) {
  return findMediaFiles(directory, sourceDir).then(function(relativeFilesList) {
    return writeMediaListFile(directory, cachedDir, relativeFilesList.join(','));
  });
};

var processSubDirectories = function(directory, cachedDir) {
  return new Promise(function(resolve, reject) {
    shFiles.listSubDirs(directory, (err, dirs) => {
      if (err !== undefined) {
        reject(err);
      }
      let qs = dirs.map(dir => {
        return processDirectory(dir, directory, cachedDir);
      });
      Promise.all(qs).then(resolve, reject);
    })
  });
}

module.exports = {
  clearMediaListFiles : clearMediaListFiles,
  findMediaFiles : findMediaFiles,
  processSubDirectories : processSubDirectories,
  processDirectory : processDirectory,
  sortFileListByDate : sortFileListByDate,
  writeMediaListFile : writeMediaListFile,
  addMediaListFile : addMediaListFile
};
