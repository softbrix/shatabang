"use strict"

var ProgressBar = require('progress');
 
var encoderJob = require('../processor/workers/encode_video');

if(process.argv.length < 3) {
    console.log('Must give source');
    process.exit(1);
}

var bar = new ProgressBar(':bar', { total: 10000 });

const job = {
  data: {
    storageDir: '.',
    cacheDir: '.',
    file: process.argv[2]
  },
  progress: (prcnt)=> {bar.update(prcnt); }
}

encoderJob(job, (args) => { console.log('Done', args) })
