/*
 Test tool to extract faces from images with the shatabang_fra-module. The tool must run on files where the data has 
 been rotated. Ie, images from mobile cameras with exif rotation must be rotated before using this tool.

 The images in the cache/1920 folder are good candidates.
*/
// The folowing value is a threshold for smallest allowed face size
const threshold = 7700;

const fs = require('fs');
const shFra = require('../processor/modules/shatabang_fra');

if(process.argv.length < 4) {
  console.log('Must give source and output');
  process.exit(1);
}

var inFile = process.argv[2];
var outFile = process.argv[3];

shFra.findFaces(inFile).then(function(data) {
  console.log('Face count: ', data.length);
  let c = 0;
  let promises = data.filter(face => face.sz > threshold).map(d => {
    // console.log('Face', d);
    return shFra.cropFace(inFile, d)
          .then((buffer) => {
            fs.writeFileSync(outFile+(++c)+'.png', buffer)
          });
  });
  return Promise.all(promises);
}).then(() => console.log('DONE'));