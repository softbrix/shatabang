"use strict";

var shIndex = require('stureby-index');
var path = require('path');
var fs = require('fs');
var ImportLog = require('../common/import_log');
var mediaInfo = require('vega-media-info');
var MediaMeta = require('../modules/media_meta');
var FileType = require('../modules/file_type_regexp');
var shFiles = require('../common/shatabang_files');

/**
This task should run every time the task processor is restarted
**/
var init = function(config, task_queue) {
  var infoDirectory = path.join(config.cacheDir, 'info');
  var storageDir = config.storageDir;
  var versionKey = 'shatabangVersion';
  var latestVersion = 202007;

  task_queue.registerTaskProcessor('upgrade_check', function(data, job, done) {
    console.log('Running upgrade')

    var redis = config.redisClient;
    // Check version in redisStore
    redis.get(versionKey, function (err, version) {
      if(err) {
        console.log('Error while retrieving versionKey', err);
        return;
      }
      console.log('Index version', version);
      if(!version) {
        version = 0;
        upgrade_v1(infoDirectory, storageDir, (error) => {
          if(error) {
            console.log(error);
          }
        });
      }
      if(version < 5) {
        import_meta_to_index(infoDirectory, config.cacheDir, task_queue);
      }
      if(version <= 6) {
        upgrade_faces_index(infoDirectory, config.cacheDir, task_queue);
      }
      if(version < 202007) {
        add_import_cache(infoDirectory, storageDir, config.cacheDir);
      }

      if (version !== latestVersion) {
        task_queue.queueTask('retry_unknown', {}, 'low');
        task_queue.retryFailed();

        console.log('Successfully upgraded index to', 'v'+latestVersion);
        redis.set(versionKey, latestVersion, function() {
          done();
        });
      } else {
        console.log('All done');
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
  shIndex(path.join(cache_dir, 'idx_faces')).clear();
  shIndex(path.join(cache_dir, 'idx_faces_crop')).clear();

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

// Clear import cache and all all imported media
async function add_import_cache(infoDirectory, storageDir, cacheDir) {
  var importLog = new ImportLog(cacheDir);
  await importLog.clear(); 
  allMedia(infoDirectory, async function(items) {
    for (var i in items) {
      var relativeDest = items[i];
      var filePath = path.join(storageDir, relativeDest);
      var stat = await fs.promises.stat(filePath);
      var exifData = await mediaInfo.readMediaInfo(filePath, process.env.EXIF_TOOL || true);
      var dateStr = exifData.CreateDate || exifData.ModifyDate;
      importLog.push(new Date(dateStr).getTime(), new Date(stat.atime).getTime());
    }
    await importLog.close();
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
