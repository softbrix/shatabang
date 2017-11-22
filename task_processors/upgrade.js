"use strict";

var path = require('path');
var fs = require('fs');
var Redis = require('ioredis');
var MediaMeta = require('../modules/media_meta.js');
var shFiles = require('../modules/shatabang_files');

/**
This task should run every time the task processor is restarted
**/
var init = function(config, task_queue) {
  var infoDirectory = path.join(config.cacheDir, 'info');
  var redis = new Redis(task_queue.redisConnectionInfo);
  var versionKey = 'shatabangVersion2';

  task_queue.registerTaskProcessor('upgrade_check', function(data, job, done) {
    // Check version in redisStore
    redis.get(versionKey).then(function (version) {
      console.log('Index version', version);
      if(!version) {
        upgrade_v1(infoDirectory, (error) => {
          if(error) {
            console.error('Failed to upgrade index', error);
            done(error);
            return;
          }
          // On succesful upgrade
          // TODO: Enable when feature is done
          //redis.set(versionKey, 1);
          done();
        });
      } else {
        done();
      }
    });
  });
};

var upgrade_v1 = function(infoDirectory, cb) {
  shFiles.listSubDirs(infoDirectory, function(error, dirs) {
    if(error) {
      console.log(error);
      return cb(error);
    }
    // Add all images to the media index with user rating 0.5
    dirs.forEach((dir) => {
      var mediaLst = fs.readFileSync(path.join(dir, 'media.lst'), 'UTF-8').split(',');

      var mediaMeta = new MediaMeta(dir);
      mediaLst.forEach((itm) => {
        mediaMeta.set(itm, {ur: 0.5});
      });
    });
    cb();
  });
};

module.exports = {
  init : init
};
