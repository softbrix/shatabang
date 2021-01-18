"use strict";

const shIndex = require('stureby-index');
const path = require('path');
const fs = require('fs');
const mediaInfo = require('vega-media-info');
const ImportLog = require('../common/import_log');
const MediaMeta = require('../modules/media_meta');
const fileMatcher = require('../modules/file_type_regexp');
const FileType = require('../modules/file_type_regexp');
const shFiles = require('../common/shatabang_files');
const indexes = require("../common/indexes");
const DirectoryList = require('../modules/directory_list');

/**
This task should run every time the task processor is restarted
**/
var init = function(config, task_queue) {
  var infoDirectory = path.join(config.cacheDir, 'info');
  var storageDir = config.storageDir;
  var versionKey = 'shatabangVersion';
  var latestVersion = 202012;

  task_queue.registerTaskProcessor('upgrade_check', function(data, job, done) {
    console.log('Running upgrade')

    var redis = config.redisClient;
    // Check version in redisStore
    redis.get(versionKey, async function (err, version) {
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
      if(version < 202012) {
        await updateMediaLists(storageDir, config.cacheDir);
        await add_import_cache(infoDirectory, storageDir, config.cacheDir);
        await clearVemdalenIndexes(redis);
        await clearSturebyIndexes(config.cacheDir);
        import_meta_to_index(infoDirectory, config.storageDir, task_queue);
        upgrade_faces_index(infoDirectory, config.cacheDir, task_queue);
        reecode_videos(infoDirectory, storageDir, config.cacheDir, task_queue);
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
async function upgrade_faces_index(infoDirectory, cacheDir, task_queue) {
  indexes.facesIndex(cacheDir).clear();
  indexes.facesCropIndex(cacheDir).clear();

  const items = await allMedia(infoDirectory);
  items.filter(FileType.isImage).forEach((relativeDest) => {
    task_queue.queueTask('faces_find', { title: relativeDest, file: relativeDest}, 'low');
  });
}

/** Clear all indexes stored in redis **/
function clearVemdalenIndexes(redisClient) {
  return Promise.all([
    indexes.keywordsIndex(redisClient),
    indexes.metaIndex(redisClient),
    indexes.regionsIndex(redisClient)
  ].map(index => index.clear()));
}

/* Clear all indexes stored on disk, rerun meta import and upgrade_faces_index */
function clearSturebyIndexes(cacheDir) {
  return Promise.all([
    indexes.fileShaIndex(cacheDir),
    indexes.imgFingerIndex(cacheDir),
    indexes.facesIndex(cacheDir),
    indexes.facesCropIndex(cacheDir)
  ].map(index => index.clear()));
}

/** Re run all face recognitions so we add the cropped information to the index **/
async function import_meta_to_index(infoDirectory, storageDir, task_queue) {
  const items = await allMedia(infoDirectory);
  items.forEach(async (relativeDest) => {
    var filePath = path.join(storageDir, relativeDest);
    const exifData = await mediaInfo.readMediaInfo(filePath, true);
    const timestamp = new Date(exifData.CreateDate || exifData.ModifyDate).getTime();
    task_queue.queueTask('import_meta', { title: relativeDest, file: relativeDest, id: '' + timestamp }, 'low');
    task_queue.queueTask('create_image_finger', { title: relativeDest, file: relativeDest});
  });
}

// Clear import cache and add all imported media
async function add_import_cache(infoDirectory, storageDir, cacheDir) {
  var importLog = new ImportLog(cacheDir);
  try {
    await importLog.clear(); 
  } catch(e) {
    console.error('Failed to clear import log cache', e);
  }
  const items = await allMedia(infoDirectory);
  let datesTimes = new Set();
  for (var i in items) {
    var relativeDest = items[i];
    var filePath = path.join(storageDir, relativeDest);
    console.log(i, relativeDest);
    var exifData = await mediaInfo.readMediaInfo(filePath, process.env.EXIF_TOOL || true);
    var dateStr = exifData.CreateDate || exifData.ModifyDate;
    var d = new Date(dateStr).getTime();
    if (!Number.isInteger(d)) {
      console.log('Import log, date is not a number, failed to add', filePath, dateStr)
      continue;
    }
    datesTimes.add(d);
    if (datesTimes.size() % 500) {
      console.log('Import log: ', datesTimes.size() / items.length, '%');
    }
  }
  console.log('Import log: 100%');
  console.log('Adding to import log', datesTimes.size, 'items');
  datesTimes.forEach(d => importLog.push(d));
  importLog.close();
}

async function reecode_videos(infoDirectory, storageDir, cacheDir, task_queue) {
  const items = await allMedia(infoDirectory);
  for (var i in items) {
    var relativeDest = items[i];
    var data = { 
      title: relativeDest, 
      file: relativeDest,
      cacheDir: cacheDir,
      storageDir: storageDir
    };

    task_queue.queueTask('resize_image', Object.assign({ width: 300, height: 200 }, data));
    task_queue.queueTask('resize_image', Object.assign({ width: 1920, height: 1080, keepAspec: true }, data));

    if(fileMatcher.isVideo(relativeDest)) {
      // TODO: Encode video in multiple formats and sizes, Search for faces etc.
      task_queue.queueTask('encode_video', Object.assign({ width: 1920, height: 1080 }, data), 'low');
      task_queue.queueTask('encode_video', Object.assign({ width: 960, height: 540 }, data), 'low');
    }
  }
}

async function updateMediaLists(storageDir, cacheDir) {
  let dirs = await shFiles.listSubDirsAsync(storageDir);

  return Promise.all(dirs.map((dir) => {
    if(!isNumber(dir)) {
      return Promise.resolve();
    }
    return DirectoryList.processDirectory(dir, storageDir, cacheDir);
  })).then(() => {
    console.log('Updated media lists');
  });
}

/** Function which returns all media files ordered in a single array with all items. */
async function allMedia(infoDirectory) {
  const dirs = await shFiles.listSubDirsAsync(infoDirectory);
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
  return result;
}

module.exports = {
  init : init
};
