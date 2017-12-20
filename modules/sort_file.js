"use strict"
var mediaInfo = require('vega_media_info');
var shFiles = require('../modules/shatabang_files');
var path = require('path');

// ex: 2015:12:11 12:10:09
//var dateRegexp = /^([\d]{2,4}).?(\d{1,2}).?(\d{1,2})\s(\d{1,2}).?(\d{1,2}).?(\d{1,2})/;

var sort_file = function(sourceFile, destDir) {
  var handleError = function(error) {
    console.log(sourceFile, 'Error: ', (error.message || error));
    var destinationDir = path.join(destDir, 'unknown');
    var fileName = path.basename(sourceFile);
    return moveFile(sourceFile, destinationDir, fileName);
  };

  return mediaInfo.readMediaInfo(sourceFile).then(function (exifData) {
    //console.log('exifData', exifData);
    var date = new Date(exifData.CreateDate || exifData.ModifyDate);
    if(date === undefined) {
      return handleError("Failed to parse the date in the exif information, '" + date + "'");
    }
    var newPath = buildPathFromDate(date, destDir);
    var newFileName = buildFileNameFromDate(date, path.extname(sourceFile));
    return moveFile(sourceFile, newPath, newFileName);
  }, handleError);
};

var leftPad = function(d) {
  return ("" + d).padStart(2,"0");
};

var buildPathFromDate = function(date, destDir) {
  var year = "" + date.getFullYear(),
  month = leftPad(date.getMonth()),
  day = leftPad(date.getDate());
  return  path.join(destDir, year, month, day);
};

var buildFileNameFromDate = function(date, fileExt) {
    var hh = leftPad(date.getHours()),
    mm = leftPad(date.getMinutes()),
    ss = leftPad(date.getSeconds());
    return hh+mm+ss + fileExt;
};

var moveFile = function(sourceFile, destinationDir, fileName) {
  if(!shFiles.exists(destinationDir)) {
    shFiles.mkdirsSync(destinationDir);
  }

  var destination = path.join(destinationDir, fileName);

  return shFiles.moveFile(sourceFile, destination);
};

module.exports = sort_file;
