"use strict";

const assert = require('assert');
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
    // Save the buffer and store the new index to the face info
    const newFace = new Face();
    
    newFace.x = 10;
    newFace.y = 15;
    newFace.size = 25;
    newFace.height = 36;
    newFace.width = 48;
    newFace.buffer = Buffer.from("abababababababa");
    newFace.imageId = 1238719287398172;

    return newFace.save();
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