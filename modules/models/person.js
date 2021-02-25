var mongoose = require('mongoose');

var personSchema = mongoose.Schema({
  name: String,
  // thumbnailId ?
});

module.exports = mongoose.model('Person', personSchema);