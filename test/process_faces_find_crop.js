"use strict"

require('./mongo_test')
require("./process_resize_image") // needs a image sizes generated by other test

var assert = require('assert');

var faceFind = require('../processor/workers/faces_find');
var faceCrop = require('../processor/workers/faces_crop');
var processTester = require('./process_test_base');

var relativeTestFile = "./faces.jpg";

describe('Find faces process', function() {
  let faceData;
  it('should handle find method', function(done) {
    processTester.initProcess(faceFind, {
      queueTask : function(name, data) {
        assert.equal(relativeTestFile, data.file);
        assert.strictEqual(name, 'faces_crop');
        // console.log(data)
        faceData = data;
        assert.notStrictEqual(undefined, data.faceInfo);
        done();
      },
      registeredFunctionCallback: function(func) {
        var data = {
          file: relativeTestFile
        };
        func(data, processTester.job, processTester.doneOk);
      }
    });
  });
  it('should handle crop method', function() {
    return new Promise((resolve, reject) => {
      processTester.initProcess(faceCrop, {
        queueTask : function(name, data) {
          assert.fail('Didnt expect another task to be queued: ' + name);
        },
        registeredFunctionCallback: function(func) {
          func(faceData, processTester.job, processTester.doneOk).then(resolve, reject);
        }
      });
    });
  });
});