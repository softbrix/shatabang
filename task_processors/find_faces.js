"use strict"

/*jslint node: true, nomen: true*/
var shIndex = require('stureby_index');
var shFiles = require('../modules/shatabang_files');
var shFra = require('../modules/shatabang_fra');
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

    shFra.findFaces(sourceFileName).then(function(data) {
      idx.put(relativeFilePath, JSON.stringify(data));
      job.log(data);
      done();
    }, done);
  });
};

module.exports = {
  init : init
};
