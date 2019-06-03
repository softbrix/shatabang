"use strict";

/* Shatabang Face recognition algorithm */
const cv = require('opencv4nodejs');
const sharp = require('sharp');
const variance = require('variance');

const face_max_width = 100,
      face_max_height = 150,
      classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

module.exports = {

  findFaces: function(sourceFileName) {
    return cv.imreadAsync(sourceFileName)
          .then(img => img.bgrToGrayAsync())
          .then(function(img) {
      const faces = classifier.detectMultiScale(img).objects;
      if (!faces.length) {
        return [];
      }

      let [img_height, img_width] = img.sizes;
      var newFaces = faces.map(function (face) {
        // Info will contain position and sizes as fractions
        var info = {
          x: face.x / img_width,
          y: face.y / img_height,
          w: face.width / img_width, // Width
          h: face.height / img_height, // Height
          sz: face.width * face.height
          /*
          Aditional but ignored data
          mouth: [],
          nose: [],
          eyeLeft: [],
          eyeRight: []
          */
        };

        return info;
      });
      return newFaces;
    });
  },
  cropFace: function(sourceFileName, face) {
    // Expand the face area
    // TODO: Explore the optimal way for eigenfaces or other tool
    var dw = 0, // This could be a value between 0 and 1
        dh = 0;
    var ext = {
        left: face.x - dw,
        top: face.y - dh,
        width: face.w + 2 * dw,
        height: face.h + 2 * dh
      };

    ext.left = ext.left > 0 ? ext.left : 0;
    ext.top = ext.top > 0 ? ext.top : 0;
    ext.width = ext.left + ext.width > 1 ? 1 - ext.left: ext.width;
    ext.height = ext.top + ext.height > 1 ? 1 - ext.top: ext.height;

    // Clip face part from image. Max size 100x150px
    var image = sharp(sourceFileName);
    return image
        .metadata()
        .then(function(metadata) {
          ext.left = Math.round(ext.left * metadata.width);
          ext.top = Math.round(ext.top * metadata.height);
          ext.height = Math.round(ext.height * metadata.height);
          ext.width = Math.round(ext.width * metadata.width);

          return image
            .extract(ext)
            .resize(face_max_width, face_max_height, { withoutEnlargement: true , fit: "inside"})
            .png()
            .toBuffer();
        });
  },
  imageBlurValue: function(source) {
    // Inspired from https://www.pyimagesearch.com/2015/09/07/blur-detection-with-opencv/
    var imgPromise;
    const sType = typeof source;
    if(sType === "string") {
      imgPromise = cv.imreadAsync(source);
    } else if(Buffer.isBuffer(source)) {
      imgPromise = cv.imdecodeAsync(source);
    } else {
      return Promise.reject("Unknown source: " + sType);
    }

    return imgPromise.then(function(img) {
      if(img.sizes[0] < 1 || img.sizes[1] < 1) {
        return Promise.reject("Unknown image size: " + img.sizes[0] + ':' + img.sizes[1]);
      }

      return img.bgrToGrayAsync()
        .then(grayImg => grayImg.laplacian(cv.CV_64F))
        .then(lapImg => lapImg.getDataAsArray())
        .then(dataMatrix => flattenMatrix(dataMatrix))
        .then(dataArray => variance(dataArray));
    });
  }
};

/**
This function will concat all array elements in the matrix into a singel array
*/
function flattenMatrix(matrix) {
  return [].concat.apply([], matrix);
}
