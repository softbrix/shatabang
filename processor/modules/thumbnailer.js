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
    return new Promise(async function(resolve, reject) {
      if(FileTypeRegexp.isVideo(path.basename(sourceFileName))) {
        return reject('Source file is a video, need to extract screenshots');
      }

      try {
        await fs.ensureDir(path.dirname(outputFileName));
        var image = sharp(sourceFileName, { failOnError: process.env.SHARP_FAIL_ON_ERROR });
        if(isMaxSize) {
          let metadata = await image.metadata();
          var imgAspect = metadata.width / metadata.height;
          if(imgAspect > 1) {
            // Image is wider
            height = undefined;
          } else {
            width = undefined;
          }
        }
        await image.rotate()
          .resize(width, height)
          .toFile(outputFileName);
        resolve(outputFileName);
      } catch(e) {
        console.log('Failed to resize', e);
        reject(e)
      }
    });
  },
  screenshots: function(sourceFile, destFile, timestamps) {
    timestamps = timestamps || ['10%'];
    
    return new Promise(async function(resolve, reject) {
      try {
        let destFolder = path.dirname(destFile),
            destFileName = path.basename(destFile);

        await fs.mkdirs(destFolder);
        // console.log('Creating video thumb: ', sourceFile, destFile);
        ffmpeg(sourceFile)
          .on('error', function(err) {
            reject(err);
          })
          .on('end', function() {
            resolve(destFileName);
          })
          .screenshots({
            timestamps: timestamps,
            filename: destFileName,
            folder: destFolder
          });
      } catch(err) {
        console.log('catched', sourceFile, err);
        reject(err);
      }
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
  create_image_finger : async function create_image_finger(sourceFile) {
    // Is this a supported movie file?
    let sourceFileName = path.basename(sourceFile);
    if(FileTypeRegexp.isVideo(sourceFileName)) {
      return Promise.reject('Source file is a video, need to extract screenshots');
    } else {
      try {
        fs.statSync(sourceFile);
      } catch (e) {
        return Promise.reject(e);
      }
      return phash(sourceFile)
        .then(function(bitString) {
          return binaryToHex(bitString);
        });
    }
  }
};
