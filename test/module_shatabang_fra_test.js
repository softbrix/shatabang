"use strict";

var assert = require('assert');
var fs = require('fs');
var shFra = require('../modules/shatabang_fra');

var relativeTestFile = "./test/test_data/1920/faces.jpg";
var noFaceFile = "./test/test_data/1920/no_face.jpg";
var expectedFileInfo = "./test/test_data/face_out.png.bs64";

describe('Shatabang Face recognition algorithm', function() {
  it('should handle face lookup', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeTestFile).then(
      function(data) {
        assert.equal(1, data.length);
        var info = data[0];
        assert.equal(0.3876953125, info.x);
        assert.equal(0.17715959004392387, info.y);
        assert.equal(0.2080078125, info.w);
        assert.equal(0.3118594436310395, info.h);

        return shFra.cropFace(relativeTestFile, data[0])
          .then( function(buffer) {
          if(expectedFileInfo !== undefined) {
            var expected_buffer = fs.readFileSync(expectedFileInfo);

            assert.equal(expected_buffer.toString().trim().length,
              buffer.toString('base64').length);
          }
        });
      }, assert.fail);
  });
  it('should handle face lookup on an image with no face', function() {
    this.timeout(60000);
    return shFra.findFaces(noFaceFile).then(function(data) {
      assert.deepEqual([], data);
    }, assert.fail);
  });
  it('should reject if the file is not found', function() {
    return shFra.findFaces('./noFile').then(assert.fail, assert.ok);
  });

  it('should be able to calculate a blur value of buffer', function() {
    var expected_buffer = fs.readFileSync(expectedFileInfo)
    return shFra.imageBlurValue(Buffer.from(expected_buffer.toString(),'base64')).then(value => {
      assert.equal(value, 527.6376387900019);
    });
  });

  it('should be able to calculate a blur value of image', function() {
    return shFra.imageBlurValue(relativeTestFile).then(value => {
      assert.equal(value, 129.319451269357);
    });
  });

  // This can be used as a debug example to extract the faces in an image

  var relativeCropFile = "./test/test_data/1920/faces.JPG";
  xit('crop found faces', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeCropFile).then(function(data) {
      console.log('face count: ', data.length);
      var c = 0;
      var promises = data.map((d) => {
        return shFra.cropFace(relativeCropFile, d)
          .then((buf) => fs.writeFile('./test/test_data/t'+(++c)+'_image.png', buf, console.log), assert.fail);
        });
      return Promise.all(promises);
    }, assert.fail);
  });
});
