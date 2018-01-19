"use strict";

var assert = require('assert');
var fs = require('fs');
var shFra = require('../modules/shatabang_fra');

var relativeTestFile = "./test/test_data/faces.JPG";
var expectedFileInfo = "./test/test_data/face_out.png.bs64";


describe('Shatabang Face recognition algorithm', function() {
  it('should handle face lookup', function() {
    return shFra.findFaces(relativeTestFile).then(function(data) {
      assert.equal(1, data.length);
      var info = data[0];
      assert.equal(0.3857421875, info.x);
      assert.equal(0.17423133235724744, info.y);
      assert.equal(0.2119140625, info.w);
      assert.equal(0.31771595900439237, info.h);

      var bs64 = data[0].buf.toString('base64');

      var expected_buffer = fs.readFileSync(expectedFileInfo);
      // Assert equals
      assert.equal(bs64.length, expected_buffer.toString().trim().length);
    }, err => assert.fail(err));
  });
});
