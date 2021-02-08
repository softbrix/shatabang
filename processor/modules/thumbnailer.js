"use strict";

var FileTypeRegexp = require('./file_type_regexp');

var fs = require('fs-extra');
var path = require('path');
var sharp = require('sharp');
var ffmpeg = require('fluent-ffmpeg');
const phash = require('sharp-phash');

function binaryToHex(binary) {
  return binary.replace(/[01]{4}/g, function(v){
    return parseInt(v, 2).toString(16);
  });
}

function hexToBinary(binary) {
  return binary.replace(/[0123456789abcdefgh]{2}/g, function(v){
    return ("00000000" + (parseInt(v, 16)).toString(2)).substr(-8);
  });
}

module.exports = {
  generateThumbnail : function(sourceFileName, outputFileName, width, height, isMaxSize) {
    return new Promise(function(resolve, reject) {
      fs.mkdirs(path.dirname(outputFileName), function(error) {
        if (error) {
          reject('mkdirs:' + error);
          return;
        }
        var handleImageResize = function(imageSrc) {
          outputFileName = FileTypeRegexp.toImageFileName(outputFileName);
          var image = sharp(imageSrc);
          // Do resize is used later
          var doResize = function() {
            return image.rotate()
            .resize(width, height)
            .toFile(outputFileName, function(err) {
              if(err) {
                reject('sharp: ' + err);
              }
              resolve(outputFileName);
            });
          }
          if(isMaxSize) {
            image
              .metadata()
              .then(function(metadata) {
                var imgAspect = metadata.width / metadata.height;
                if(imgAspect > 1) {
                  // Image is wider
                  height = undefined;
                } else {
                  width = undefined;
                }

                doResize();
              }, reject);
          } else {
            doResize();
          }
        };

        if(FileTypeRegexp.isVideo(path.basename(sourceFileName))) {
          const PREFIX = 'v';
          var videoOutPath = path.dirname(outputFileName);
          var videoImageOutFileName = PREFIX + FileTypeRegexp.toImageFileName(path.basename(sourceFileName));
          const videoOutFullPath = path.join(videoOutPath, videoImageOutFileName);
          
          if (fs.existsSync(videoOutFullPath)) {
            // TODO: Allow force update?
            handleImageResize(videoOutFullPath);
          } else {
            try {
              console.log('Creating video thumb: ', sourceFileName, videoOutFullPath);
              ffmpeg(sourceFileName)
                .on('error', function(err) {
                  reject(err);
                })
                .on('end', function() {
                  handleImageResize(videoOutFullPath);
                })
                .screenshots({
                  timestamps: ['10%'],
                  filename: videoImageOutFileName,
                  folder: videoOutPath
                });
            } catch(err) {
              console.log('catched', err);
              reject(sourceFileName + ':' + err);
            }
          }
        } else {
          handleImageResize(sourceFileName);
        }
      });
    });
  },
  thumbnailNeedsUpdate : function thumbnailNeedsUpdate(sourceFileName, destFileName) {
  	var destSync;
    try {
  	   destSync = fs.statSync(FileTypeRegexp.toImageFileName(destFileName));
  	} catch(error) {
  		// ignore
  //		console.log('statSync',error);
  	}
  	if(destSync === undefined) {
  		return true;
  	}
  	var sourceSync = fs.statSync(sourceFileName);
  	var destFileEdited = new Date(destSync.mtime);
  	var srcFileEdited = new Date(sourceSync.mtime);
  	//console.log(destFileEdited.getTime(),' < ', srcFileEdited.getTime());
  	return destFileEdited.getTime() < srcFileEdited.getTime();
  },
  create_image_finger : function create_image_finger(sourceFile) {
    var generateFinger = function(sourceFile) {
      try {
        fs.statSync(sourceFile);
      } catch (e) {
        return Promise.reject(e);
      }
      return phash(sourceFile)
        .then(function(bitString) {
          return binaryToHex(bitString);
        });
    };

    // Is this a supported movie file?
    let sourceFileName = path.basename(sourceFile);
    if(FileTypeRegexp.isVideo(sourceFileName)) {
      var tmpOutputImage = sourceFile + '.png';
      var width = 1920;
      var height = 1080;
      var isMaxSize = true;
      return this.generateThumbnail(sourceFile, tmpOutputImage, width, height, isMaxSize)
        .then(function(newSource) {
          return generateFinger(newSource).then(function(b85) {
            // Cleanup before callback
            fs.unlink(tmpOutputImage);
            return b85;
          });
      });
    } else {
      return generateFinger(sourceFile);
    }
  }
};
