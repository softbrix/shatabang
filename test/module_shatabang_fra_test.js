"use strict";

var assert = require('assert');
var fs = require('fs');
var shFra = require('../processor/modules/shatabang_fra');

var relativeTestFile = "./test/test_data/1920/faces.jpg";
var noFaceFile = "./test/test_data/1920/no_face.jpg";
var expectedFileInfo = "./test/test_data/face_out.png.bs64";

describe('Shatabang Face recognition algorithm', function() {
  it('should handle face lookup', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeTestFile).then(
      function(data) {
        assert.strictEqual(1, data.length);
        var info = data[0];
        assert.strictEqual(0.38671875, info.x);
        assert.strictEqual(0.17862371888726208, info.y);
        assert.strictEqual(0.2109375, info.w);
        assert.strictEqual(0.3162518301610542, info.h);
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
    var expected_buffer = fs.readFileSync(relativeTestFile)
    return shFra.imageBlurValue(expected_buffer).then(value => {
      assert.equal(value, 129.319451269357);
    });
  });

  it('should be able to calculate a blur value of image', function() {
    return shFra.imageBlurValue(relativeTestFile).then(value => {
      assert.equal(value, 129.319451269357);
    });
  });

  // This can be used as a debug example to extract the faces in an image

  var relativeCropFile = "./test/test_data/1920/faces.jpg";
  it('crop found faces', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeCropFile).then(function(data) {
      console.log('face count: ', data.length);
      var c = 0;
      var promises = data.map((d) => {
        return shFra.cropFace(relativeCropFile, d)
          .then((buffer) => {
            if (c == 0) {
              if(expectedFileInfo !== undefined) {
                var expected_buffer = fs.readFileSync(expectedFileInfo);
                fs.writeFileSync(expectedFileInfo + 'res', buffer.toString('base64'));
                assert.strictEqual(buffer.toString('base64').length, expected_buffer.toString().trim().length);
              }
            }
            fs.writeFile('./test/test_data/t'+(++c)+'_image.png', buffer, console.log)
          } , assert.fail);
        });
      return Promise.all(promises);
    }, assert.fail);
  });
});
