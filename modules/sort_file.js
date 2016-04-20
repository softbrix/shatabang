"use strict"
var mediaInfo = require('../modules/media_info');
var shFiles = require('../modules/shatabang_files');
var path = require('path');

// ex: 2015:12:11 12:10:09
var dateRegexp = /^([\d]{2,4}).?(\d{1,2}).?(\d{1,2})\s(\d{1,2}).?(\d{1,2}).?(\d{1,2})/;

var sort_file = function(sourceFile, destDir) {
  //console.log('parseFile', item);

  var destinationDir = path.join(destDir, 'unknown');
  return mediaInfo.readMediaInfo(sourceFile).then(function (exifData) {
    //console.log('exifData', exifData);
    var date = exifData.CreateDate || exifData.ModifyDate;
    var result = dateRegexp.exec(date);
    //console.log(item, exifData.Tags); // Do something with your data!
    var newFileName;
    if (result && result.length > 3) {
      var year = result[1], month = result[2], day = result[3];
      destinationDir = path.join(destDir, year, month, day);
      if (result.length > 6) {
        var hh = result[4], mm = result[5], ss = result[6];
        //console.log(date, hh,mm,ss);
        newFileName = hh+mm+ss + path.extname(sourceFile);
      }
    } else {
      console.log("Failed to parse the date in the exif information", sourceFile);
    }
    return moveFile(sourceFile, destinationDir, newFileName);
  }, function(error) {
    console.log(sourceFile, 'Error: ', (error.message || error));
    var fileName = path.basename(sourceFile);
    return moveFile(sourceFile, destinationDir, fileName);
  });
};

var moveFile = function(sourceFile, destinationDir, fileName) {
  var destination = path.join(destinationDir, fileName);

  //console.log('process', sourceFile, destination);

  return shFiles.moveFile(sourceFile, destination);
};

module.exports = sort_file;
