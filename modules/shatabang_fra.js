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

      var image = sharp(sourceFileName);
      var newFacesPromises = faces.map(function (face) {
        var info = {
          x: face.getX(),
          y: face.getY(),
          w: face.getWidth(), // Width
          h: face.getHeight(), // Height
          n: undefined  // Name
        };

        // Expand the face area
        var dw = Math.ceil(info.w / face_expand_ratio),
            dh = Math.ceil(info.h / face_expand_ratio);
        var ext = {
            left: info.x - dw,
            top: info.y - dh,
            width: info.w + 2 * dw,
            height: info.h + 2 * dh
          };

        ext.left = ext.left > 0 ? ext.left : 0;
        ext.top = ext.top > 0 ? ext.top : 0;

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
      Promise.all(newFacesPromises).then(newFaces => deferred.resolve(newFaces));
    });
    return deferred.promise;
  }
};
