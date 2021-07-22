"use strict";

const assert = require('assert');
const shFra = require('../processor/modules/shatabang_fra');
const Face = require('../modules/models/face');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();

var relativeTestFile = "./test/test_data/1920/faces.jpg";

before(async () => {
  let uri; // = 'mongodb://localhost:27017/shatabang';
  if (process.env.MONGODB) {
    uri = process.env.MONGODB;
  } else {
    uri = await mongod.getUri('shatabang');
  }
  mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false  
  });
});

describe('Mongo Test', function() {
  
  //mongoose.set('debug', true);

  it('should someting', function() {
    this.timeout(60000);
    return shFra.findFaces(relativeTestFile).then((faces) => {
      var promises = faces.map(function(face) {
        return shFra.cropFace(relativeTestFile, face).then(function(buffer) {
          // Save the buffer and store the new index to the face info
          // console.log(face);
          const newFace = new Face();
          
          newFace.x = face.x;
          newFace.y = face.y;
          newFace.size = face.sz;
          newFace.height = face.h;
          newFace.width = face.w;
          newFace.buffer = buffer;
          newFace.imageId = 1238719287398172;

          //idx_crop.update(newId, bs64);
          return shFra.imageBlurValue(buffer).then(function(val) {
            newFace.sharpness = val;
            return newFace.save();
          }, newFace.save);
        });
      });
      return Promise.all(promises);
    });
  });

  it('Sort find all', async () => {
    let result = await Face.find({}, 'x y size').sort([['size', -1]]).exec();
    // console.log(result);
  });
});

after(async () => {
  await mongoose.connection.dropDatabase();
  mongoose.disconnect();
  await mongod.stop()
});