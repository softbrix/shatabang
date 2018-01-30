"use strict";

/* Shatabang Face recognition algorithm */
var Q = require('q');
//var Faced = require('faced');
const cv = require('opencv4nodejs');
var sharp = require('sharp');

//const faced = new Faced();

const face_max_width = 100,
      face_max_height = 150,
      face_expand_ratio = 6,
      MAX_SHORT = 65535,
      classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

function toHex(v) {
  return v.toString(16).toUpperCase();
}

function fromHex(v) {
  return parseInt(v, 16);
}

module.exports = {

  findFaces: function(sourceFileName) {
    return new Promise(function(resolve, reject) {
      var img = cv.imread(sourceFileName);
      img.bgrToGray();
      const faces = classifier.detectMultiScale(img).objects;
        if (!faces.length) {
          var errorMsg = "Could not open file: " + file;
          reject(errorMsg);
          return;
        }

        let [img_height, img_width] = img.sizes;
        var newFaces = faces.map(function (face) {
          // Info will contain position and sizes as fractions
          var info = {
            x: face.x / img_width,
            y: face.y / img_height,
            w: face.width / img_width, // Width
            h: face.height / img_height, // Height
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
        resolve(newFaces);
    });
  },
  /** Compresses the x, y, w and h fractions to an array of hex to represent the face information */
  compressFaceInfo: function(info) {
    var t = function t(val) {
      return toHex(Math.round(val * MAX_SHORT));
    };
    return t(info.x)+t(info.y)+t(info.w)+t(info.h);
  },
  /* Reverses the compress function, will return NaN if given info is not an correct string */
  expandFaceInfo: function(info) {
    if(info.length !== 16 /* todo: regexp match input*/) {
      return { x: NaN, y: NaN, w: NaN, h: NaN };
    }
    var t = function t(val) {
      return fromHex(val) / MAX_SHORT;
    };
    const BLK_WIDTH = 4;
    return {
      x: t(info.substr(0, BLK_WIDTH)),
      y: t(info.substr(4, BLK_WIDTH)),
      w: t(info.substr(8, BLK_WIDTH)),
      h: t(info.substr(12, BLK_WIDTH))
    };
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
            .resize(face_max_width, face_max_height)
            .max()
            .withoutEnlargement(true)
            .png()
            .toBuffer();
        });
  }
};
