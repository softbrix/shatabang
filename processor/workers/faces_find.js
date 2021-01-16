"use strict"

/*jslint node: true, nomen: true*/
var indexes = require('../common/indexes');
var shFiles = require('../common/shatabang_files');
var shFra = require('../modules/shatabang_fra');
var faceInfo = require('../common/face_info');
var fileType = require('../modules/file_type_regexp');
var path = require('path');


/** Part one of detecting faces in images **/
var init = function(config, task_queue) {
  var idx = indexes.facesIndex(config.cacheDir);
  var cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('faces_find', function(data, job, done) {
    var relativeFilePath = fileType.toImageFileName(data.file);
    var sourceFileName = path.resolve(path.join(cacheDir, "1920", relativeFilePath));

    if(!shFiles.exists(sourceFileName)) {
      return done('Missing file:' + sourceFileName);
    }

    shFra.findFaces(sourceFileName).then(function(faces) {
      if(!faces.length) {
        // No face found
        done();
        return;
      }
      
      faces.forEach((face) => {
        const compressed = faceInfo.compress(face);
        const id = faceInfo.toId(relativeFilePath, face);
        idx.update(id, JSON.stringify(compressed));
      })

      // Queue crop faces
      task_queue.queueTask('faces_crop', {
          title: relativeFilePath,
          file: relativeFilePath,
          faceInfo: faces}, 'low');
      done();
    }, done);
  });
};

module.exports = {
  init : init
};
