"use strict"

/*jslint node: true, nomen: true*/
var shIndex = require('../modules/shatabang_index');
var Faced = require('faced');
var faced = new Faced();
var path = require('path');


var init = function(config, task_queue) {
  var idx = shIndex(path.join(config.cacheDir, 'idx_faces'));
  var storageDir = config.storageDir;

  task_queue.registerTaskProcessor('find_faces', function(data, job, done) {
    var relativeFilePath = data.file;
    var sourceFileName = path.join(storageDir, relativeFilePath);

    console.log('Detecting faces', sourceFileName);

    faced.detect(path.resolve(sourceFileName), function worker(faces, image, file) {
      if (!faces) {
        var errorMsg = "Could not open " + file;
        console.error(errorMsg);
        done(errorMsg);
        return;
      }
      faces.forEach(function (face) {
        var faceInfo = {
          x: face.getX(),
          y: face.getY(),
          w: face.getWidth(), // Width
          h: face.getHeight(), // Height
          n: undefined  // Name
        };
        idx.put(relativeFilePath, JSON.stringify(faceInfo));
        console.log(faceInfo, JSON.stringify(faceInfo).length);
      });
      done();
    });
  });
};

module.exports = {
  init : init
};
