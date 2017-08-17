"use strict"
var idx = require('stureby_index')('./idx_tst');
var _ = require('underscore');
var ProgressBar = require('progress');


var logGet = function(k) {
  console.log("idx.get('"+k+"'):", idx.get(k));
};
var logSearch = function(k) {
  console.log("idx.search('"+k+"'):",idx.search(k));
};

logGet('asa');
logSearch('sas');


//idx.put('as', 'the beste1');
//idx.put('asa', 'the beste2');
//idx.put('asas', 'the beste3');
//idx.put('asasas', 'the beste4');

//idx.put('asa', 'the beste');
//idx.put('asa', 'the beste1');
//idx.put('asa', 'the beste2');

idx.put('*$HDv>J7{$}s&N*+Gm=sZ@+9E!W:L)!ZhT)?SofkHM^{YKE&FTADDFRErY%YDvfprAd-)[DWp6/u$9+@zFJ%1xLq{gBz+/cx(4D]H<ixour7fiuT[.AHJcZgurQAf', 'aa');
logGet('*$HDv>J7{$}s&N*+Gm=sZ@+9E!W:L)!ZhT)?SofkHM^{YKE&FTADDFRErY%YDvfprAd-)[DWp6/u$9+@zFJ%1xLq{gBz+/cx(4D]H<ixour7fiuT[.AHJcZgurQAf');

var noOfItems = 1;

var bar = new ProgressBar('[:bar] :percent :elapseds :etas', { total: noOfItems });

var arr = [];
var chars='abcdefghijklmnopqrstuvwxyz';
var buckets = chars.length;
_.times(buckets, function(i) {
  arr[i] = 0;
}, arr);

/* Fill with garbage **
_.times(noOfItems, function(n) {
  var k = (Math.random() * 10e20).toString(36).substring(0,_.random(2, 20));

  _.times(200, function(n) {
      var v = (Math.random() * 10e20).toString(36);
    idx.put(k, v);
  });

  arr[parseInt(k ,36) % buckets] ++;

  bar.tick();
});

_.times(buckets, function(i) {
  console.log(chars[i], arr[i]);
}, arr);

bar = new ProgressBar('[:bar] :percent :elapseds :etas', { total: noOfItems });
/** Put plenty items in single file *
var k = "D5320";
_.times(noOfItems, function(n) {
    var v = (Math.random() * 10e20).toString(36);
  idx.put(k, v);

  bar.tick();
});
logSearch(k);
logGet(k);

logGet('ase');
logGet('asa');

logSearch('sas');
logSearch('as');
logSearch('es');

*/
