"use strict"

/*jslint node: true, nomen: true*/
var shIndex = require('stureby_index');
var shFiles = require('../modules/shatabang_files');
var Faced = require('faced');
var faced = new Faced();
var path = require('path');


var init = function(config, task_queue) {
  var idx = shIndex(path.join(config.cacheDir, 'idx_faces'));
  var storageDir = config.storageDir;

  task_queue.registerTaskProcessor('find_faces', function(data, job, done) {
    var relativeFilePath = data.file;
    var sourceFileName = path.resolve(path.join(storageDir, relativeFilePath));

    if(!shFiles.exists(sourceFileName)) {
      return done('Missing file');
    }

    console.log('Detecting faces', sourceFileName);

    faced.detect(sourceFileName, function worker(faces, image, file) {
      if (!faces) {
        var errorMsg = "Could not open " + file;
        console.error(errorMsg);
        done(errorMsg);
        return;
      }
      faces.forEach(function (face) {
        // TODO: Clip face part from image. Max size 200x320px
        var faceInfo = {
          x: face.getX(),
          y: face.getY(),
          w: face.getWidth(), // Width
          h: face.getHeight(), // Height
          n: undefined  // Name
        };
        idx.put(relativeFilePath, JSON.stringify(faceInfo));
        job.log(faceInfo);
      });
      done();
    });
  });
};

module.exports = {
  init : init
};
