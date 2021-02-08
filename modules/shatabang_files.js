"use strict";

var dir = require('node-dir');
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs-extra');

var fileEditFallback = function(fileHandlingMethod, source, newDestination, resolve, reject) {
  var command = fileHandlingMethod + '"' + source + '"' + ' "' + newDestination + '"';

  return function(error) {
    if (error) {
      if (error.code === 'EXDEV') {
        exec(command, function(error/*, stdout, stderr*/) {
          if (error) {
            console.log(command, error);
            reject(error);
          } else {
            resolve(newDestination, source);
          }
        });
      } else {
        console.error('Move error', error);
        reject(error);
      }
    } else {
      resolve(newDestination, source);
    }
  };
};

var findAvaliableFileName = function(destination, retryCnt) {
  var newDestination = destination;
  if (retryCnt > 0) {
    var fileInfo = path.parse(destination);
    fileInfo.name = fileInfo.name + '_' + retryCnt;
    fileInfo.base = fileInfo.name + fileInfo.ext;
    newDestination = path.format(fileInfo);
  }
  return new Promise(function(resolve, reject) {
    fs.access(newDestination, fs.F_OK, function(err) {
      if (!err) {
        findAvaliableFileName(destination, (retryCnt || 0) + 1).then(function(name) {
          resolve(name);
        }, function(error) {
          reject(error);
        });
      } else {
        resolve(newDestination);
      }
    });
  });
};

module.exports = {
  listMediaFiles : function(sourceDir, callback) {
    return new Promise((resolve, reject) => {
      if (callback === undefined) {
        callback = (err, result) => {
          if (err !== undefined) {
            reject(err);
          }
          resolve(result);
        };
      }
      dir.files(sourceDir, function(err, files){
          if (err) {
            callback(err);
          }
          if(files === undefined) {
            callback('Directory not found');
            return;
          }

          var mediaFiles = /^(?!\.).+([mj]pe?g|png|mp4|m4a|m4v|mov|bmp|avi)$/i;
          files = files.filter(function(item) {
            return mediaFiles.test(path.basename(item));
          });

          callback(undefined, files);
      });
    });
  },
  /**
  Only list the direct sub directories
  **/
  listSubDirs : function(sourceDir, callback) {
    callback(undefined, fs.readdirSync(sourceDir).filter(
      function(file) {
        return fs.statSync(path.join(sourceDir, file)).isDirectory();
      }));
  },
  listSubDirsAsync : async function(sourceDir) {
    return new Promise((resolve) => {
      this.listSubDirs(sourceDir, (ignore, dirs) => resolve(dirs));
    });
  },
  // List all subdir paths
  listSubDirPaths : function(sourceDir, callback) {
    dir.subdirs(sourceDir, callback);
  },
  /**
  The write file method will first create the folder for the file to be in
  */
  writeFile : function(filePath, fileContent, callback) {
    fs.mkdirs(path.dirname(filePath), function(error) {
      if (error) {
          console.log(filePath, 'Error: '+error.message);
      }
      fs.writeFile(filePath, fileContent, callback);
    });
  },
  readFile : fs.readFile,
  rmDirSync: fs.rmdirSync,
  mkdirsSync : function(dirPath) {
    return fs.mkdirsSync(dirPath);
  },
  exists : function(path) {
    try {
      fs.statSync(path);
      return true;
    } catch (e) {
      return false;
    }
  },
  moveFile : function(source, destination) {
    return new Promise(function(resolve, reject) {
      findAvaliableFileName(destination).then(function(newDestination) {
        fs.rename(source, newDestination, fileEditFallback("mv", source, newDestination, resolve, reject));
        return newDestination;
      });
    });
  },
  copyFile : function(source, destination) {
    return new Promise(function(resolve, reject) {
      findAvaliableFileName(destination).then(function(newDestination) {
        fs.copy(source, newDestination, fileEditFallback("mv", source, newDestination, resolve, reject));
      });
    });
  },
  deleteFile : function(source) {
    return new Promise(function(resolve, reject) {
      fs.unlink(source, function(err) {
        if(err) {
          reject(err);
        }
        resolve();
      });
    });
  }
};
