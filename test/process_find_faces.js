"use strict"
var taskProcess = require('../task_processors/find_faces');

var relativeTestFile = "./faces.JPG";

var taskQueMock = {
  registerTaskProcessor : function(name, func) {
    var done = function() {
      console.log('All set');
    };
    var job = 1;
    var data = {
      file: relativeTestFile
    };
    func(data, job, done);
  },
  queueTask : function(name, data) {
    console.log('Queue task', name, data);
  }
};
var config = {
  importDir : './data/',
  cacheDir : '../cache',
  storageDir : './data/'};
taskProcess.init(config, taskQueMock);
