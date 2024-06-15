"use strict";

/* Shatabang Face recognition algorithm */
const fs = require('fs');
const sharp = require('sharp');
const variance = require('variance');

const face_max_width = 100,
      face_max_height = 162; // Golden ratio
const PROBABILITY_LIMIT = 0.9;

// import nodejs bindings to native tensorflow, Use env variable TF_NO_GPU to load the cpu version
const tf = require('@tensorflow/tfjs-node');
const blazeface = require('@tensorflow-models/blazeface');
var model;

module.exports = {
  initModel: async function() {
    model = await blazeface.load();
  },
  findFaces: function(sourceFileName) {
    return fs.promises.access(sourceFileName, fs.constants.R_OK)
    .then(async () => {
      const fileData = await fs.promises.readFile(sourceFileName);
      const image = tf.node.decodeImage(fileData);
      const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
      const predictions = await model.estimateFaces(image, returnTensors);

      let [img_height, img_width] = image.shape;
      var newFaces = predictions.filter(t => t.probability > PROBABILITY_LIMIT).map(function (face) {
        // Info will contain position and sizes as fractions
        face.width = face.bottomRight[0] - face.topLeft[0];
        face.height = face.bottomRight[1] - face.topLeft[1];
        var info = {
          x: face.topLeft[0] / img_width,
          y: face.topLeft[1] / img_height,
          w: face.width / img_width, // Width
          h: face.height / img_height, // Height
          sz: face.width * face.height,
          pr: face.probability
          /*
          landmarks: [
            [295.13, 177.64], // right eye
            [382.32, 175.56], // left eye
            [341.18, 205.03], // nose
            [345.12, 250.61], // mouth
            [252.76, 211.37], // right ear
            [431.20, 204.93] // left ear
          ]
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
    const width = face.w || face.width;
    const height = face.h || face.height;

    var dw = width/10, // This could be a value between 0 and 1
        dh = height/10;
    var ext = {
        left: face.x - dw,
        top: face.y - 3*dh,
        width: width + 2 * dw,
        height: height + 5 * dh
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
    const sType = typeof source;
    if(sType !== "string" && !Buffer.isBuffer(source)) {
      return Promise.reject("Unknown source: " + sType);
    }
    var image = sharp(source);
    return new Promise((resolve, reject) => {
      image.greyscale()
      .convolve({ // LaplacianFilter
        width: 3,
        height: 3,
        kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0]
      })
     .raw()
     .toBuffer(function(err, data) {
       if (err) {
         return reject(err);
       }
       resolve(variance(data));
     });
    });
  }
};
