"use strict";

var assert = require('assert');
var fs = require('fs');
var shFra = require('../modules/shatabang_fra');

var relativeTestFile = "./test/test_data/1920/faces.JPG";
var noFaceFile = "./test/test_data/1920/no_face.JPG";
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

            //console.log(buffer.toString('base64'));
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
  it('should be able to compress face info', function() {
    var info = {
      x: 0.3857421875,
      y: 0.17423133235724744,
      w: 0.2119140625,
      h: 0.31771595900439237
    };
    assert.equal('62C02C9A36405156',shFra.compressFaceInfo(info));
  });
  it('should be able to compress face info which needs padding', function() {
    var info = {
      x: 0.6989583333333333,
      y: 0.875,
      w: 0.03802083333333333,
      h: 0.050694444444444445
    };
    assert.deepEqual('B2EEDFFF09BC0CFA', shFra.compressFaceInfo(info));
  });

  it('should be able to expand face info', function() {
    var info = {
      x: 0.38574807354848556,
      y: 0.17422751201647974,
      w: 0.2119172961013199,
      h: 0.3177233539330129
    };
    assert.deepEqual(info, shFra.expandFaceInfo('62C02C9A36405156'));
  });



  it('should be able to calculate a blur value of buffer', function() {
    var expected_buffer = fs.readFileSync(expectedFileInfo)
    return shFra.imageBlurValue(Buffer.from(expected_buffer.toString(),'base64')).then(value => {
      assert.equal(value, 528.2847871599977);
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
