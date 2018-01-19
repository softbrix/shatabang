"use strict"
var assert = require('assert');

var taskProcess = require('../task_processors/find_faces');

var relativeTestFile = "./faces.JPG";

describe('Find faces process', function() {
  var taskQueMock = {
    registerTaskProcessor : function(name, func) {
      var done = function(argument) {
        assert.strictEqual(argument, undefined)
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
    storageDir : './test/test_data/'};
  it('should handle init method', function() {
    taskProcess.init(config, taskQueMock);
  });
});
