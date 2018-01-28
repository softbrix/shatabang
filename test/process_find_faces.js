"use strict"
var assert = require('assert');

var taskProcess = require('../task_processors/faces_find');

var relativeTestFile = "./faces.JPG";

describe('Find faces process', function() {
  var taskQueMock = {
    registerTaskProcessor : function(name, func) {
      var done = function(argument) {
        assert.strictEqual(undefined, argument);
      };
      var job = {log: function() {}};
      var data = {
        file: relativeTestFile
      };
      func(data, job, done);
    },
    queueTask : function(name, data) {
      assert.equal(relativeTestFile, data.title);
      assert.equal(relativeTestFile, data.file);
      assert.notStrictEqual(undefined, data.faceInfo);
    }
  };
  var config = {
    importDir : 'not_used_parameter',
    cacheDir : './test/test_data/',
    storageDir : 'not_used_parameter'};
  it('should handle init method', function() {
    return taskProcess.init(config, taskQueMock);
  });
});
