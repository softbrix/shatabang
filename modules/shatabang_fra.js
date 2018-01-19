"use strict";

/* Shatabang Face recognition algorithm */
var Q = require('q');
var Faced = require('faced');
var sharp = require('sharp');

const faced = new Faced();

const face_max_width = 100,
      face_max_height = 150,
      face_expand_ratio = 6;

module.exports = {

  findFaces: function(sourceFileName) {
    var deferred = Q.defer();
    faced.detect(sourceFileName, function worker(faces, image_opencv, file) {
      if (!faces) {
        var errorMsg = "Could not open " + file;
        deferred.reject(errorMsg);
        return;
      }

      let [img_height, img_width] = image_opencv.size();
      var image = sharp(sourceFileName);
      var newFacesPromises = faces.map(function (face) {
        // Info will contain position and sizes as fractions
        var info = {
          x: face.getX() / img_width,
          y: face.getY() / img_height,
          w: face.getWidth() / img_width, // Width
          h: face.getHeight() / img_height, // Height
          n: undefined  // Name
        };

        // Expand the face area
        var dw = Math.ceil(face.getWidth() / face_expand_ratio),
            dh = Math.ceil(face.getHeight() / face_expand_ratio);
        var ext = {
            left: face.getX() - dw,
            top: face.getY() - dh,
            width: face.getWidth() + 2 * dw,
            height: face.getHeight() + 2 * dh
          };

        ext.left = ext.left > 0 ? ext.left : 0;
        ext.top = ext.top > 0 ? ext.top : 0;
        ext.width = ext.left + ext.width > img_width ? img_width - ext.left - 1: ext.width;
        ext.height = ext.top + ext.height > img_height ? img_height - ext.top - 1: ext.height;

        // Clip face part from image. Max size 200x320px
        return image
          .extract(ext)
          .resize(face_max_width, face_max_height)
          .max()
          .withoutEnlargement(true)
          .png()
          .toBuffer().then(function(buf) {
            // Adding the cropped face image to the info object
            info.buf = buf;
            return info;
          });
      });
      Promise.all(newFacesPromises).then(deferred.resolve, deferred.reject);
    });
    return deferred.promise;
  }
};
