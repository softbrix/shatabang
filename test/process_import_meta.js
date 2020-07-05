"use strict"
var assert = require('assert');

var taskProcess = require('../task_processors/import_meta');
var processTester = require('./process_test_base');

var relativeTestFile = "./1920/faces.jpg";

describe('Import meta process', function() {
  it('should handle init method', function() {
    return new Promise((resolve, reject) => {
      processTester.initProcess(taskProcess, {
        registeredFunctionCallback: function(func) {
          var data = {
            file: relativeTestFile
          };
          func(data, processTester.job, processTester.donePromise(resolve, reject));
        }
      });
    });
  });
});
