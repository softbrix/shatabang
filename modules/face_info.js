"use strict"
var shFra = require('./shatabang_fra');

/** Helper methods to expand and compress the face info index */
module.exports = {
  compress : function(i) {
    return {
      i: shFra.compressFaceInfo(i), // Face infor
      b: i.bid // Buffer id
    };
  },
  expand : function(d) {
    console.log('expand d',d);
    var obj = shFra.expandFaceInfo(d.i);
    console.log('obj',obj);
    obj.bid = d.b;
  },
  // From https://gist.github.com/jed/982883
  uuid : function(a) {
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);
  }
};
