var mongoose = require('mongoose');

var faceSchema = mongoose.Schema({
  x: Number,
  y: Number,
  height: Number,
  width: Number,
  size: Number,
  sharpness: Number,
  imageId: Number, // from
  personId: Number,
  buffer: Buffer,
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Face', faceSchema);