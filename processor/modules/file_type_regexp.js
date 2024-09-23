const path = require('path');

const mediaFiles = /^(?!\.).+([mj]pe?g|png|mp4|m4a|m4v|mov|bmp|avi)$/i,
exif = /^(?!\.).+(jpe?g|m4a|m4v|mp4)$/i,
movieFile = /(m4v|mp4|mpe?g|mov|avi)$/i,
imageFile = /(jpe?g|png|bmp)$/i,
heicFile = /(heic|heif)$/i;

function replaceExtFunc(filePath, newExt) {
  var fileInfo = path.parse(filePath);
  fileInfo.ext = newExt;
  fileInfo.base = fileInfo.name + '.' + fileInfo.ext;
  return path.format(fileInfo);
}

module.exports = {
  mediaFiles : mediaFiles,
  exif : exif,
  movieFile : movieFile,
  imageFile : imageFile,

  isVideo : function(filePath) {
    return movieFile.test(filePath);
  },
  isImage : function(filePath) {
    return imageFile.test(filePath) || this.isHeicFile(filePath);
  },
  isHeicFile : function(filePath) {
    return heicFile.test(filePath);
  },
  replaceExt: replaceExtFunc,
  toCacheImageFileName: function(movieFilePath) {
    return replaceExtFunc(movieFilePath, 'jpg');
  }
};
