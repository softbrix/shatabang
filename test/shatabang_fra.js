"use strict";

var fs = require('fs');
var shFra = require('../modules/shatabang_fra');

var relativeTestFile = "./data/faces.JPG";

shFra.findFaces(relativeTestFile).then(function(data) {
  //data => console.log(data)
  /*data.length === 1
  { x: 395,
    y: 119,
    w: 217,
    h: 217,
    n: undefined,
    buf: check*/
  //  console.log(data);
  var bs64 = data[0].buf.toString('base64');

    var expected_buffer = fs.readFileSync("./data/face_out.png.bs64");
    // Assert equals
    console.log(bs64.length, expected_buffer.toString().trim().length);
    console.log(bs64.length === expected_buffer.toString().trim().length);
}, err => console.error(err));
