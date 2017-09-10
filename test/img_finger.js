'use strict';

const sharp = require('sharp');
const sha1 = require('node-sha1');
const ascii85 = require('ascii85');

const sourceFile = './data/faces.jpg';

/*
Evaluation of Image pHash function, considering speed and accuracy between platforms.
*/

var hashFunctions = [
function(file, cb) {
  require('imghash') // https://www.npmjs.com/package/imghash
    .hash(file)
    .then(cb);
},
function(file, cb) {
  var image = sharp(sourceFile);
  image
    //.rotate()
    //.png()
    .toBuffer()
    .then(function(buffer) {
      return "" + ascii85.encode(buffer);
    }).then(cb);
},
function(file, cb) {
  // https://www.npmjs.com/package/image-hash
  const imageHash = require('image-hash');
  // remote file simple
  imageHash(file, 32, true, (error, data) => {
    if (error) {
      cb(error);
    }
    cb(data);
  });
},
function(file, cb) {
  const phash = require('canvas-phash');
  phash.getImageHash(file).then(cb);
},
function(file, cb) {
  const phash = require('sharp-phash');
  phash(file).then(cb);
},
function(file, cb) {
  const jimp = require('jimp');
  jimp.read(file, function(err, image) {
    if(err) {
      cb(err);
    }
    cb(image.hash());
  });
}
];

//const phash = require('sharp-phash');
const dist = require('sharp-phash/distance');

var now = function() {
  return new Date().getTime();
};
const directory = './data/';
var hashes = [];
const calcHashes = function() {
  console.log('calcing hashes');
  for(var i = 0; i < hashes.length; ++i) {
    for(var j = i; j < hashes.length; ++j) {
      var d = dist(hashes[i], hashes[j]);
      console.log(i, j, d, d < 5, d < 15);
    }
  }
};

//shFiles.listMediaFiles(directory, function(err, filesList) {
var filesList = [
  ['./data/faces_old.JPG', '1010111110011001000100101101100101101110010101110101000001101001']];

  function binaryToHex(binary) {
    return binary.replace(/[01]{4}/g, function(v){
      return parseInt(v, 2).toString(16);
    });
  }
  function hexToBinary(binary) {
    return binary.replace(/[0123456789abcdefgh]{2}/g, function(v){
      return ("00000000" + (parseInt(v, 16)).toString(2)).substr(-8);
    });
  }

  filesList.forEach(function(file) {
    var sourceFile = file[0];
    //hashes.forEach((hashFunction, idx) => {
      var idx = 4;
      const hashFunction = hashFunctions[idx];
      var s = now();
      hashFunction(sourceFile, (result) => {
        hashes.push(result);
        const resString = binaryToHex(result);
        console.log(hexToBinary(resString));
        console.log(result);
        console.log(hexToBinary(resString) === result);
        console.log(/*dist(result, file[1]),*/ result, now() - s, sourceFile);
        if(hashes.length === filesList.length) {
          calcHashes();
        }
      });
    //});
  });
//});
