"use strict";

var assert = require('assert');
var fs = require('fs');
var shFra = require('../modules/shatabang_fra');

var relativeTestFile = "./test/test_data/1920/faces.JPG";
var expectedFileInfo = "./test/test_data/face_out.png.bs64";


describe('Shatabang Face recognition algorithm', function() {
  it('should handle face lookup', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeTestFile).then(
      function(data) {
        assert.equal(1, data.length);
        var info = data[0];
        assert.equal(0.3857421875, info.x);
        assert.equal(0.17423133235724744, info.y);
        assert.equal(0.2119140625, info.w);
        assert.equal(0.31771595900439237, info.h);

        return shFra.cropFace(relativeTestFile, data[0])
          .then( function(buffer) {
          if(expectedFileInfo !== undefined) {
            var expected_buffer = fs.readFileSync(expectedFileInfo);
            // Assert equals
            assert.equal(expected_buffer.toString().trim().length,
              buffer.toString('base64').length);
          }
        });
      }, assert.fail);
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

  it('should be able to expand face info', function() {

    var info = {
      x: 0.38574807354848556,
      y: 0.17422751201647974,
      w: 0.2119172961013199,
      h: 0.3177233539330129
    };
    assert.deepEqual(info, shFra.expandFaceInfo('62C02C9A36405156'));
  });

  // This can be used as a debug example to extract the faces in an image
  xit('crop found faces', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeTestFile).then(function(data) {
      console.log('face count: ', data.length);
      var c = 0;
      var promises = data.map((d) => {
        return shFra.cropFace(relativeTestFile, d)
          .then((buf) => fs.writeFile('./test/test_data/t'+(++c)+'_image.png', buf, console.log), assert.fail);
        });
      return Promise.all(promises);
    }, assert.fail);
  });
});
