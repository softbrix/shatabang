
const mediaFiles = /^(?!\.).+([mj]pe?g|png|mp4|m4a|m4v|mov|bmp|avi)$/i,
exif = /^(?!\.).+(jpe?g|m4a|m4v|mp4)$/i,
movieFile = /(m4v|mp4|mpe?g|mov|avi)$/i,
imageFile = /(jpe?g|png|bmp)$/i;

module.exports = {
  mediaFiles : mediaFiles,
  exif : exif,
  movieFile : movieFile,
  imageFile : imageFile,

  isVideo : function(filePath) {
    return movieFile.test(filePath);
  },
  isImage : function(filePath) {
    return imageFile.test(filePath);
  }
};
