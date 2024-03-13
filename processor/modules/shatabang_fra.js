"use strict";

/* Shatabang Face recognition algorithm */
const fs = require('fs');
const sharp = require('sharp');
const variance = require('variance');

const face_max_width = 100,
      face_max_height = 162; // Golden ratio

module.exports = {

  findFaces: function(sourceFileName) {
    // noop
  },
  cropFace: function(sourceFileName, face) {
    // Expand the face area
    // TODO: Explore the optimal way for eigenfaces or other tool
    const width = face.w || face.width;
    const height = face.h || face.height;

    var dw = width/10, // This could be a value between 0 and 1
        dh = height/10;
    var ext = {
        left: face.x - dw,
        top: face.y - dh,
        width: width + 2 * dw,
        height: height + 2 * dh
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
  } 
};
