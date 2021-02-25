"use strict"
var shFiles = require('../common/shatabang_files');
var path = require('path');

var sort_file = function(sourceFile, destDir, exifData) {
  var handleError = function(error) {
    console.error(sourceFile, 'Error: ', (error.message || error));
    var destinationDir = path.join(destDir, 'unknown');
    var fileName = path.basename(sourceFile);
    return moveFile(sourceFile, destinationDir, fileName);
  };

  var dateStr = exifData.CreateDate || exifData.ModifyDate;
  if(dateStr === undefined) {
    // console.debug('exifData', exifData);
    return handleError("Failed to parse the date in the exif information, '" + dateStr + "'");
  }
  var date = new Date(dateStr);
  var newPath = buildPathFromDate(date, destDir);
  var newFileName = buildFileNameFromDate(date, path.extname(sourceFile));
  return moveFile(sourceFile, newPath, newFileName);
};

var leftPad = function(d) {
  return ("" + d).padStart(2, "0");
};

var buildPathFromDate = function(date, destDir) {
  var year = "" + date.getFullYear(),
  month = leftPad(date.getMonth() + 1),
  day = leftPad(date.getDate());
  return  path.join(destDir, year, month, day);
};

var buildFileNameFromDate = function(date, fileExt) {
    var hh = leftPad(date.getHours()),
    mm = leftPad(date.getMinutes()),
    ss = leftPad(date.getSeconds()),
    ms = leftPad(date.getMilliseconds());
    return hh+mm+ss+ms + fileExt;
};

var moveFile = function(sourceFile, destinationDir, fileName) {
  if(!shFiles.exists(destinationDir)) {
    shFiles.mkdirsSync(destinationDir);
  }

  var destination = path.join(destinationDir, fileName);

  return shFiles.moveFile(sourceFile, destination);
};

module.exports = sort_file;
