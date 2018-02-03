"use strict"

/*jslint node: true, nomen: true*/
var shIndex = require('stureby_index');
var shFiles = require('../modules/shatabang_files');
var shFra = require('../modules/shatabang_fra');
var faceInfo = require('../modules/face_info');
var uuidv4 = require('uuid/v4');
var path = require('path');


/** Part one of detecting faces in images **/
var init = function(config, task_queue) {
  var idx = shIndex(path.join(config.cacheDir, 'idx_faces'));
  var idx_crop = shIndex(path.join(config.cacheDir, 'idx_faces_crop'));
  //var storageDir = config.storageDir;
  var cacheDir = config.cacheDir;

  task_queue.registerTaskProcessor('faces_crop', function(data, job, done) {
    var relativeFilePath = data.file;
    var sourceFileName = path.resolve(path.join(cacheDir, "1920", relativeFilePath));

    job.log('Faces crop', sourceFileName);

    if(!shFiles.exists(sourceFileName)) {
      return done('Missing file:' + sourceFileName);
    }

    var faces;

    if (data.faceInfo) {
      faces = data.faceInfo;
    } else {
      var json = idx.get(relativeFilePath);
      var compressed;

      if(json !== undefined && json.length > 0) {
        job.log('Loaded json', json);
        compressed = JSON.parse(json[0]);
        faces = compressed.map(faceInfo.expand);
      }
    }

    if(!faces.length) {
      done('No face found to crop');
      return;
    }

    var promises = faces.map(function(face) {
      job.log('Face' , face);
      return shFra.cropFace(sourceFileName, face).then(function(buffer) {
        // Save the buffer and store the new index to the face info
        const newId = uuidv4();
        const bs64 = buffer.toString('base64');
        idx_crop.update(newId, bs64);
        face.bid = newId;
        return shFra.imageBlurValue(bs64).then(function(val) {
          face.sharp = val;
          return face;
        });
      }, done);
    });
    Promise.all(promises).then(function(faces) {
      job.log('Faces' , faces);
      var compressed = faces.map(faceInfo.compress);
      idx.update(relativeFilePath, JSON.stringify(compressed));
      done();
    });
  });
};

module.exports = {
  init : init
};
