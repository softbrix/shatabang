"use strict"
const indexes = require('../common/indexes')
const shFiles = require('../common/shatabang_files');
const fileTypeRegexp = require('../modules/file_type_regexp');
const ImportLog = require('../common/import_log');
const path = require('path');

var init = function(config, task_queue) {
  const cacheDir = config.cacheDir,
        deletedDir = config.deletedDir,
        timesIndex = indexes.importedTimesIndex(config.cacheDir),
        importLogIndex = new ImportLog(config.cacheDir),
        metaCache = indexes.metaIndex(config.redisClient),
        sourceDir = config.storageDir;

  task_queue.registerTaskProcessor('delete_media', async function(data, job, done) {
    try {
      const mediaFile = data.media;
      const sourceFile = path.join(sourceDir, mediaFile);
      const destFile = path.join(deletedDir, path.basename(mediaFile));
      const cache300 = path.join(cacheDir, '300', fileTypeRegexp.toCacheImageFileName(mediaFile));
      const cache1920 = path.join(cacheDir, '1920', fileTypeRegexp.toCacheImageFileName(mediaFile));

      await shFiles.moveFile(sourceFile, destFile);
      await shFiles.deleteFile(cache300);
      await shFiles.deleteFile(cache1920);

     let timestamp = timesIndex.get(mediaFile);
     if (timestamp != undefined && timestamp.length > 0) {
        timesIndex.delete(mediaFile);
        timesIndex.delete(timestamp);
        // importLogIndex.delete(timestamp); 
        await metaCache.delete('' + timestamp);
        job.log(`Deleted ${mediaFile} from indexes (${timestamp})`);
      }

      var directory = mediaFile.split(path.sep)[0];
      task_queue.queueTask('update_directory_list', { title: directory, dir: directory}, 'high');
      done();
    } catch (error) {
      done(error);
    }
  });
};

module.exports = {
  init : init
};
