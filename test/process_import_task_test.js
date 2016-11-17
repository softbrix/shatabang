"use strict"
var taskProcess = require('../task_processors/process_import');


var taskQueMock = {
  registerTaskProcessor : function(name, func) {
    var done = function() {
      console.log('All set');
    };
    var job = 1;
    func('data', job, done);
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
