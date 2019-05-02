"use strict"

/*jslint node: true, nomen: true*/
var shIndex = require('stureby_index');
var shFiles = require('../modules/shatabang_files');
var shFra = require('../modules/shatabang_fra');
var faceInfo = require('../modules/face_info');
var fileType = require('../modules/file_type_regexp');
var path = require('path');


/** Part one of detecting faces in images **/
var init = function(config, task_queue) {
  var idx = shIndex(path.join(config.cacheDir, 'idx_faces'));
  //var storageDir = config.storageDir;
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
      var compressed = faces.map(faceInfo.compress);
      idx.update(relativeFilePath, JSON.stringify(compressed));
      console.log(data);
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
