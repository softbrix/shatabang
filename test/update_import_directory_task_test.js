"use strict"
var taskProcess = require('../processor/update_import_directory');

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
  importDir : './test_data/',
  cacheDir : './cache',
  storageDir : './data/sorted'};
taskProcess.init(config, taskQueMock);
