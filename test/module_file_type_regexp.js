"use strict"
var assert = require('assert');
var FileTypeRegexp = require('../modules/file_type_regexp');

describe('File type regexp', function() {
  let expected = '/mnt/cache/1920/2005/03/19/150739.jpg';
  let videoFileName = '/mnt/cache/1920/2005/03/19/150739.AVI';

  it('isVideo', function() {
    assert.equal(true, FileTypeRegexp.isVideo(videoFileName));
    assert.equal(false, FileTypeRegexp.isImage(videoFileName));
  });

  it('from video to image', function() {
    let result = FileTypeRegexp.toImageFileName(videoFileName);
    assert.equal(expected, result);
  });

  it('from mpg video to image', function() {
    let videoFileName = '/mnt/cache/1920/2005/03/19/150739.mpg';
    let result = FileTypeRegexp.toImageFileName(videoFileName);
    assert.equal(expected, result);
  });
});
