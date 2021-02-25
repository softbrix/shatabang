"use strict"

/*jslint node: true, nomen: true*/
const Face = require('../common/models/face');
const shFiles = require('../common/shatabang_files');
const shFra = require('../modules/shatabang_fra');
const path = require('path');


/** Part one of detecting faces in images **/
var init = function(config, task_queue) {

  //var storageDir = config.storageDir;
  var cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('faces_crop', function(data, job, done) {
    var relativeFilePath = data.file;
    var sourceFileName = path.resolve(path.join(cacheDir, "1920", relativeFilePath));

    console.log('Faces crop', sourceFileName);

    if(!shFiles.exists(sourceFileName)) {
      return done('Missing file:' + sourceFileName);
    }

    const face = data.faceInfo;

    // Save the buffer and store the new index to the face info    
    return shFra.cropFace(sourceFileName, face)
    .then(async (buffer) => {
      await Face.findByIdAndUpdate(face.id, { "buffer": buffer })
      return buffer;
    })
    .then(shFra.imageBlurValue)
    .then(function(sharpness) {
      return Face.findByIdAndUpdate(face.id, { "sharpness": sharpness });
    })
    .then((arg) => { job.log(arg); done() })
    .catch((arg) => { job.log(arg); done(arg) });
  });
};

module.exports = {
  init : init
};
