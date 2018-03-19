"use strict";

var shIndex = require('stureby_index');
var path = require('path');
var fs = require('fs');
var Redis = require('redis');
var MediaMeta = require('../modules/media_meta.js');
var FileType = require('../modules/file_type_regexp.js');
var shFiles = require('../modules/shatabang_files');

/**
This task should run every time the task processor is restarted
**/
var init = function(config, task_queue) {
  var infoDirectory = path.join(config.cacheDir, 'info');
  var storageDir = config.storageDir;
  var versionKey = 'shatabangVersion';
  var latestVersion = 4;

  task_queue.registerTaskProcessor('upgrade_check', function(data, job, done) {
    var redis = Redis.createClient(task_queue.redisConnectionInfo);
    // Check version in redisStore
    redis.get(versionKey, function (err, version) {
      if(err) {
        job.log('Error while retrieving versionKey', err);
        return;
      }
      job.log('Index version', version);
      if(!version) {
        version = 0;
        upgrade_v1(infoDirectory, storageDir, (error) => {
          if(error) {
            job.log(error);
          }
        });
        task_queue.queueTask('retry_unknown', {}, 'low');
      }
      if(version < 3) {
        upgrade_faces_index(infoDirectory, config.cacheDir, task_queue);
        task_queue.retryFailed();
        job.log('Successfully upgraded index to', 'v'+latestVersion);
        redis.set(versionKey, latestVersion, function() {
          redis.quit();
          done();
        });
      }
      if(version < latestVersion) {
        import_meta_to_index(infoDirectory, config.cacheDir, task_queue);
      } else {
        redis.quit();
        job.log('All done');
        done();
        return;
      }
    });
  });
};

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var upgrade_v1 = function(infoDirectory, storageDir, cb) {
  shFiles.listSubDirs(infoDirectory, function(error, dirs) {
    if(error) {
      return cb(error);
    }
    // Add all images to the media index with user rating 0.5
    dirs.forEach((dir) => {
      if(!isNumber(dir)) {
        return;
      }
      var yearDir = path.join(infoDirectory, dir);
      var mediaLst = fs.readFileSync(path.join(yearDir, 'media.lst'), 'UTF-8').split(',');

      var mediaMeta = new MediaMeta(yearDir);
      mediaLst.forEach((itm) => {
        fs.stat(path.join(storageDir, itm), (err, stats) => {
          var fileSize = -1;
          if(err) {
            console.log('Upgrade check error', err);
            return;
          }
          fileSize = stats.size;
          mediaMeta.set(itm, {
            ur: 0.5,
            s: fileSize
          });
        });
      });
    });
    cb();
  });
};

/** Re run all face recognitions so we add the cropped information to the index **/
function upgrade_faces_index(infoDirectory, cache_dir, task_queue) {
  var idx = shIndex(path.join(cache_dir, 'idx_faces'));
  idx.clear();

  allMedia(infoDirectory, function(items) {
    items.filter(FileType.isImage).forEach((relativeDest) => {
      task_queue.queueTask('faces_find', { title: relativeDest, file: relativeDest}, 'low');
    });
  });
}

/** Re run all face recognitions so we add the cropped information to the index **/
function import_meta_to_index(infoDirectory, cache_dir, task_queue) {
  allMedia(infoDirectory, function(items) {
    items.forEach((relativeDest) => {
      task_queue.queueTask('import_meta', { title: relativeDest, file: relativeDest}, 'low');
    });
  });
}

/** Function which returns all media files ordered in a single array with all items. */
function allMedia(infoDirectory, cb) {
  shFiles.listSubDirs(infoDirectory, function(error, dirs) {
    if(error) {
      return cb(error);
    }
    var result = [];
    // Add all images to the media index with user rating 0.5
    dirs.forEach((dir) => {
      if(!isNumber(dir)) {
        return;
      }
      var yearDir = path.join(infoDirectory, dir);
      var mediaLst = fs.readFileSync(path.join(yearDir, 'media.lst'), 'UTF-8').split(',');
      mediaLst.forEach((itm) => {
        result.push(itm);
      });
    });
    cb(result);
  });
}

module.exports = {
  init : init
};
