"use strict"
var taskProcess = require('../task_processors/find_faces');

var relativeTestFile = "./2011/08/15/165257.JPG";

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
  importDir : '../data/sorted/import/',
  cacheDir : '../cache',
  storageDir : '../data/sorted'};
taskProcess.init(config, taskQueMock);
