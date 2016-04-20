"use strict"
var dir = require('node-dir');
var path = require('path');
var Q = require('q');
var exec = require('child_process').exec;
var fs = require('fs-extra');

var createFileEditFallback = function(fileHandlingMethod, source, newDestination, deffered) {
  var command = fileHandlingMethod + '"' + source + '"' + ' "' + newDestination + '"';
  //console.log(command);
  return function(error) {
    if (error) {
      if (error.code === 'EXDEV') {
        exec(command, function(error/*, stdout, stderr*/) {
          if (error) {
            console.log(command, error);
            deffered.reject(error);
          } else {
            deffered.resolve(newDestination, source);
          }
        });
      } else {
        console.error('Move error', error);
        deffered.reject(error);
      }
    } else {
      deffered.resolve(newDestination, source);
    }
  };
};

var findAvaliableFileName = function(destination, retryCnt) {
  var deffered = Q.defer();
  var newDestination = destination;
  if (retryCnt > 0) {
    var fileInfo = path.parse(destination);
    fileInfo.name = fileInfo.name + '_' + retryCnt;
    fileInfo.base = fileInfo.name + fileInfo.ext;
    newDestination = path.format(fileInfo);
  }
  fs.access(newDestination, fs.F_OK, function(err) {
    if (!err) {
      findAvaliableFileName(destination, (retryCnt || 0) + 1).then(function(name) {
        deffered.resolve(name);
      }, function(error) {
        deffered.reject(error);
      });
    } else {
      deffered.resolve(newDestination);
    }
  });
  return deffered.promise;
};

module.exports = {
  listMediaFiles : function(sourceDir, callback) {
    dir.files(sourceDir,
        function(err, files){
            if (err) {
              callback(err);
            }

            var mediaFiles = /^(?!\.).+([mj]pe?g|png|mp4|m4a|mov|bmp|avi)$/i;
            files = files.filter(function(item) {
              return mediaFiles.test(path.basename(item));
            });

            callback(undefined, files);
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
     var deffered = Q.defer();
     findAvaliableFileName(destination).then(function(newDestination) {
       //console.log('newDest', newDestination, path.dirname(newDestination));
       var error = fs.mkdirsSync(path.dirname(newDestination));
       if (error) {
         console.log(newDestination, 'Error with new destination: ', error.message || error);
       }

       var fileOpCallback = createFileEditFallback("mv", source, newDestination, deffered);

       fs.rename(source, newDestination, fileOpCallback);
     });
     return deffered.promise;
   },
   copyFile : function(source, destination) {
     var deffered = Q.defer();
     findAvaliableFileName(destination).then(function(newDestination) {
       //console.log('newDest', newDestination, path.dirname(newDestination));
       var error = fs.mkdirsSync(path.dirname(newDestination));
       if (error) {
         console.log(newDestination, 'Error with new destination: ', error.message || error);
       }

       var fileOpCallback = createFileEditFallback("cp", source, newDestination, deffered);

       fs.copy(source, newDestination, fileOpCallback);
     });
     return deffered.promise;
   },
   deleteFile : function(source) {
     var deffered = Q.defer();
     fs.unlink(source, function(err) {
       if(err) {
         deffered.reject(err);
       }
       deffered.resolve();
     });
     return deffered;
   }
};
