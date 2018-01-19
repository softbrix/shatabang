"use strict";

// TODO: What's the purpose of this tests
return;

const fs = require('fs');
var MediaMeta = require('../modules/media_meta.js');

var now = () => { return new Date().getTime(); };

var cachePath = './data/store';

var mediaMeta = new MediaMeta(cachePath);
var mediaMeta2 = new MediaMeta(cachePath);

console.log('Test start');
mediaMeta.getAll().then(console.log, console.error);

var mediaLst = fs.readFileSync(cachePath + '/media.lst', 'UTF-8').split(',');

mediaLst.forEach((itm) => {
  mediaMeta.set(itm, {ur: Math.random()});
});

mediaMeta.getAll().then(console.log, console.error);

mediaMeta2.getKeys().then(console.log, console.error);

console.log('Test end');
