"use strict"
var dir = require('node-dir');
var path = require('path');
var fs = require('fs-extra');

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
   }
};
