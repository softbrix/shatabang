"use strict"
var taskProcess = require('../processor/workers/update_import_directory');

var taskQueMock = {
  registerTaskProcessor : jest.fn((name, func) => func('data', {}, () => console.log('All set'))),
  queueTask : jest.fn((name, data) => {
    console.log('Queue task', name, data);
    return {
      finished: () => { then: (cb) => { cb(); } }
    }
  })
};

beforeAll(() => {
  var config = {
    importDir : './test_data/',
    cacheDir : './cache',
  storageDir : './test/test_data/'};
  taskProcess.init(config, taskQueMock);
});

describe('Worker log process', () => {
  it('should handle init method', () => {
    console.log('Init method');
  });
});

