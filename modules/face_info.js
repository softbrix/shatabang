"use strict"

const MAX_SHORT = 65535,
    BLK_WIDTH = 4;

function toHex(v) {
  return v.toString(16).toUpperCase();
}

function fromHex(v) {
  return parseInt(v, 16);
}

function leftPad(d, w) {
  return ("" + d).padStart(w, "0");
};

function _compressFaceInfo(info) {
  var t = function t(val) {
    return leftPad(toHex(Math.round(val * MAX_SHORT)), BLK_WIDTH);
  };
  return t(info.x)+t(info.y)+t(info.w)+t(info.h);
}

function _expandFaceInfo(info) {
  if(info.length < BLK_WIDTH * 4 /* todo: regexp match input*/) {
    return { x: NaN, y: NaN, w: NaN, h: NaN };
  }
  var t = function t(val) {
    return fromHex(val) / MAX_SHORT;
  };
  return {
    x: t(info.substr(0, BLK_WIDTH)),
    y: t(info.substr(4, BLK_WIDTH)),
    w: t(info.substr(8, BLK_WIDTH)),
    h: t(info.substr(12, BLK_WIDTH))
  };
}

/** Helper methods to expand and compress the face info index */
module.exports = {
  compress : function(i) {
    return {
      i: _compressFaceInfo(i), // Face infor
      b: i.bid || '', // Buffer id
      s: i.sharp || -1, // Sharpness
      f: i.from,
      p: i.personid || '',
      sz: i.sz
    };
  },
  expand : function(d) {
    var obj = _expandFaceInfo(d.i);
    d.x = obj.x;
    d.y = obj.y;
    d.h = obj.h;
    d.w = obj.w;
    d.sz = obj.sz;
    d.bid = d.b;
    d.s = d.sharp;
    d.from = d.f;
    d.personid = d.p;
    return d;
  },
  /** Compresses the x, y, w and h fractions to an array of hex to represent the face information */
  compressFaceInfo: _compressFaceInfo,
  /* Reverses the compress function, will return NaN if given info is not an correct string */
  expandFaceInfo: _expandFaceInfo,
  // From https://gist.github.com/jed/982883
  uuid : function(a) {
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);
  },
  toId: function(relativePath, faceInfo) {
    const doubleBlockWidth = 2 * BLK_WIDTH;
    let faceId = (faceInfo.i !== undefined ? faceInfo.i : this.compressFaceInfo(faceInfo)).substr(0, doubleBlockWidth);
    return relativePath.replace(new RegExp('/', 'g'), '').substr(0, 14) + faceId;
  },
  fromIdToPath: function(id) {
    return id.substr(0, 4) + '/' + id.substr(4,2) + '/' + id.substr(6,2) + '/' + id.substr(8, 6) + '.jpg'
  },
  sizeCompare : function(a, b) { // Sort descending
    return b.sz - a.sz;
  }
};
