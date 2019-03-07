"use strict";

var FileTypeRegexp = require('./file_type_regexp');

var Q = require('q');
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
    var deffered = Q.defer();
    fs.mkdirs(path.dirname(outputFileName), function(error) {
      if (error) {
          deffered.reject('mkdirs:'+error);
          return;
        }

      if(FileTypeRegexp.isVideo(path.basename(sourceFileName))) {
        outputFileName = FileTypeRegexp.toImageFileName(outputFileName);

        // TODO: This should be handled by the image resize, the ffmpeg lib
        // should only extract the frames from the video
        width = width === undefined ? '?' : width;
        height = height === undefined || isMaxSize ? '?' : height;

        var size =''+width+'x'+height;
        // This operation is really heavy even on my mac book,
        // I think we should generate a single screenshot first
        // and then create a gif/png thumbnail with multiple images
        try {
          console.log('Creating video thumb: ', sourceFileName);
          ffmpeg(sourceFileName)
            .on('error', function(err) {
              deffered.reject(err);
            })
            .on('end', function() {
                deffered.resolve(outputFileName);
            })
            .screenshots({
              timestamps: ['50%'],
              filename: path.basename(outputFileName),
              folder: path.dirname(outputFileName),
              size: size
            });
        } catch(err) {
          console.log('catched', err);
          deffered.reject(sourceFileName + ':' + err);
        }
      } else {
        var image = sharp(sourceFileName);

        var handleImageResize = function(width, height) {
          image.rotate()
            .resize(width, height)
            .toFile(outputFileName, function(err) {
              if(err) {
                deffered.reject('sharp: ' +err);
              }
              deffered.resolve(outputFileName);
            });
        };

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

              handleImageResize(width, height);
            });
        } else {
          handleImageResize(width, height);
        }
      }
    });
    return deffered.promise;
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
            fs.unlink(tmpOutputImage, console.log);
            return b85;
          });
      });
    } else {
      return generateFinger(sourceFile);
    }
  }
};
