"use strict"

/*jslint node: true, nomen: true*/
const Face = require('../common/models/face');
const shFiles = require('../common/shatabang_files');
const shFra = require('../modules/shatabang_fra');
const fileType = require('../modules/file_type_regexp');
const path = require('path');

const THRESHOLD = process.env.SH_FACE_THRESHOLD || 38000;

/** Part one of detecting faces in images **/
var init = function(config, task_queue) {
  var cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('faces_find', function(data, job, done) {
    var relativeFilePath = fileType.toImageFileName(data.file);
    var sourceFileName = path.resolve(path.join(cacheDir, "960", relativeFilePath));

    if(!shFiles.exists(sourceFileName)) {
      return done('Missing file:' + sourceFileName);
    }

    shFra.findFaces(sourceFileName).then(function(faces) {
      if(!faces.length) {
        // No face found
        done();
        return;
      }

      const promises = faces.filter(face => face.sz > THRESHOLD).map(async (face) => {
        const newFace = new Face();
        newFace.x = face.x;
        newFace.y = face.y;
        newFace.height = face.h;
        newFace.width = face.w;
        newFace.size = face.sz;
        newFace.imageId = data.id;

        await newFace.save();
        face.id = newFace._id;

        // Queue crop faces
        task_queue.queueTask('faces_crop', {
          title: relativeFilePath,
          file: relativeFilePath,
          faceInfo: face
        });
      });

      return Promise.all(promises);
    })
    .then((arg) => { job.log(arg); done() })
    .catch((arg) => { job.log(arg); done(arg) });
  });
};

module.exports = {
  init : init
};
