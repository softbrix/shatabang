"use strict"
var assert = require('assert');

xdescribe('Sort faces', function() {
  //var facesJson = require('./test_data/faces.json');

  it('should load faces', function() {
    assert.equal(2001, facesJson.length);
  });

  it('should load faces', function() {
    var faceItems = [];
    facesJson.forEach(function(itm) {
      itm.items.forEach(function(face) {
        face.k = itm.key;
        faceItems.push(face);
      })
    });
    faceItems.forEach((a) => {
      if(a.s * 1 !== a.s) {
        console.log('No stat', a.k);
        a.s = 0;
      }
    });
    faceItems.sort((a,b) => b.s - a.s);
    assert.equal(9332.063681975038, faceItems[0].s);
  });
});
