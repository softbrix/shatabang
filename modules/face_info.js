"use strict"
var shFra = require('./shatabang_fra');

/** Helper methods to expand and compress the face info index */
module.exports = {
  compress : function(i) {
    return {
      i: shFra.compressFaceInfo(i), // Face infor
      b: i.bid || '', // Buffer id
      s: i.sharp || -1, // Sharpness
      f: i.from,
      n: i.name || ''
    };
  },
  expand : function(d) {
    var obj = shFra.expandFaceInfo(d.i);
    d.x = obj.x;
    d.y = obj.y;
    d.h = obj.h;
    d.w = obj.w;
    d.bid = d.b;
    d.s = d.sharp;
    d.from = d.f;
    d.name = d.n;
    return d;
  },
  // From https://gist.github.com/jed/982883
  uuid : function(a) {
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);
  },
  toId: function(relativePath, compressedFaceInfo) {
    const doubleBlockWidth = 2 * 4;
    return relativePath.replace(new RegExp('/', 'g'), '').substr(0, 14) + compressedFaceInfo.i.substr(0, doubleBlockWidth);
  },
  calcSize : function(obj) {
    obj.sz = obj.w * obj.h;
    return obj;
  },
  sizeCompare : function(a, b) { // Sort descending
    return b.sz - a.sz;
  }
};
