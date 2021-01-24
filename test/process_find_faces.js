"use strict"
var assert = require('assert');

var taskProcess = require('../processor/workers/faces_find');
var processTester = require('./process_test_base');

var relativeTestFile = "./faces.jpg";

describe('Find faces process', function() {
  it('should handle init method', function(done) {
    processTester.initProcess(taskProcess, {
      queueTask : function(name, data) {
        assert.equal(relativeTestFile, data.file);
        assert.strictEqual(name, 'faces_crop');
        // console.log(data.faceInfo)
        assert.notStrictEqual(undefined, data.faceInfo);
        done();
      },
      registeredFunctionCallback: function(func) {
        var data = {
          file: relativeTestFile
        };
        func(data, processTester.job, (args) => {
            processTester.doneOk(args);
        });
      }
    });
  });
});
