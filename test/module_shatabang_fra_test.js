"use strict";

var assert = require('assert');
var fs = require('fs');
var shFra = require('../processor/modules/shatabang_fra');

var relativeTestFile = "./test/test_data/faces.jpg";
var noFaceFile = "./test/test_data/1920/no_face.jpg";
var expectedFileInfo = "./test/test_data/face_out.png.bs64";

describe('Shatabang Face recognition algorithm', function() {
  this.timeout(60000);
  this.beforeAll(() => {
    return shFra.initModel();
  });
  it('should handle face lookup', function() {
    return shFra.findFaces(relativeTestFile).then(
      function(data) {
        assert.strictEqual(1, data.length);
        var info = data[0];
        assert.strictEqual(info.x, 0.36700204014778137);
        assert.strictEqual(info.y, 0.22650068291458866);
        assert.strictEqual(info.w, 0.23924818634986877);
        assert.strictEqual(info.h, 0.23925149004420984);
      }, assert.fail);
  });
  it('should handle face lookup on an image with no face', function() {
    return shFra.findFaces(noFaceFile).then(function(data) {
      assert.deepEqual([], data);
    }, assert.fail);
  });
  it('should reject if the file is not found', function() {
    return shFra.findFaces('./noFile').then(assert.fail, assert.ok);
  });

  
  it('should be able to calculate a blur value of image', function() {
    return shFra.imageBlurValue(relativeTestFile).then(value => {
      assert.equal(value, 57.653148571055205);
    });
  });

  it('should be able to calculate a blur value of buffer', async function() {
    let fileBlurValue = await shFra.imageBlurValue(relativeTestFile);
    var expected_buffer = fs.readFileSync(relativeTestFile);
    return shFra.imageBlurValue(expected_buffer).then(value => {
      assert.equal(value, fileBlurValue);
    });
  });

  it('should be able to calculate a blur value of another image', function() {
    return shFra.imageBlurValue(noFaceFile).then(value => {
      assert.equal(value, 2382.1031581592833);
    });
  });

  // This can be used as a debug example to extract the faces in an image

  var relativeCropFile = "./test/test_data/faces.jpg";
  it('crop found faces', function() {
    return shFra.findFaces(relativeCropFile).then(function(data) {
      //console.log('face count: ', data.length);
      var c = 0;
      var promises = data.map((d) => {
        return shFra.cropFace(relativeCropFile, d)
          .then((buffer) => {
            fs.writeFile('./test/test_data/t'+(++c)+'_image.png', buffer, console.log)
            if (c == 0) {
              if(expectedFileInfo !== undefined) {
                var expected_buffer = fs.readFileSync(expectedFileInfo);
                fs.writeFileSync(expectedFileInfo + 'res', buffer.toString('base64'));
                assert.strictEqual(buffer.toString('base64').length, expected_buffer.toString().trim().length);
              }
            }
          } , assert.fail);
        });
      return Promise.all(promises);
    }, assert.fail);
  });
});
