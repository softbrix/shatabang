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

  it('should be able to compress face info', function() {
    var info = {
      x: 0.3857421875,
      y: 0.17423133235724744,
      w: 0.2119140625,
      h: 0.31771595900439237
    };
    assert.equal('62C02C9A36405156',faceInfo.compressFaceInfo(info));
  });
  it('should be able to compress face info which needs padding', function() {
    var info = {
      x: 0.6989583333333333,
      y: 0.875,
      w: 0.03802083333333333,
      h: 0.050694444444444445
    };
    assert.deepEqual('B2EEDFFF09BC0CFA', faceInfo.compressFaceInfo(info));
  });

  it('should be able to expand face info', function() {
    var info = {
      x: 0.38574807354848556,
      y: 0.17422751201647974,
      w: 0.2119172961013199,
      h: 0.3177233539330129
    };
    assert.deepEqual(info, faceInfo.expandFaceInfo('62C02C9A36405156'));
  });
});
