"use strict"
var assert = require('assert');

var faceInfo = require('../modules/face_info');

describe('Face Info', function() {
  let info = {
    x: 0.5,
    y: 0.2,
    w: 0.2,
    h: 0.4
  };
  let path = '2010/02/24/053532.jpg'
  it('should generate from path and info', function() {
    assert.equal('2010022405353280003333', faceInfo.toId(path, info));
  });

  it('should generate from path and compressed info', function() {
    let compressed = faceInfo.compress(info);
    assert.equal('2010022405353280003333', faceInfo.toId(path, compressed));
  });
});
