// TODO: Add test for adding image here....

"use strict"
var assert = require('assert');
var DirectoryList = require('../processor/modules/directory_list');

describe('List directory module', function() {
  it('processDirectory', function() {
    DirectoryList.processDirectory('1920', './test/test_data', './test/test_data');
  });

  it('addMediaListFile', function() {
    DirectoryList.addMediaListFile('1920', './test/test_data', '1920/test/file1.jpg');
  });
});