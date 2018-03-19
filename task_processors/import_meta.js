"use strict"
const path = require('path');
const flatten = require('obj-flatten');
const faceInfo = require('../modules/face_info');
const shFra = require('../modules/shatabang_fra');
const mediaInfo = require('vega_media_info');
const vemdalenIndex = require("vemdalen_index");

function notUndefined(val) {
  return val !== undefined;
}

function filterKeyWords(meta) {
  return Object.entries(flatten(meta.Raw))
      .filter(([key, val]) => key.toLowerCase().indexOf('error') < 0)
      .map(([key, val]) => val)
      .filter(val => val !== undefined && typeof(val) === 'string' && val.trim().length > 0);
}

function extractRegions(meta, filePath) {
  if(  meta.Regions === undefined
    || meta.Regions.regionList === undefined) {
      return [];
  }
  return meta.Regions.regionList.map(region => {
      region = Object.assign(region, region.area);
      region.from = 'meta';

      var compressed = faceInfo.compress(region);
      let key = faceInfo.toId(filePath, compressed);
      return [key, compressed];
    });
}

// Sometimes I find stuff on the internet that actuallyworks =)
// This will reduce the array back to a key/value object
let backToObject = (obj, [k, v]) => ({ ...obj, [k]: v });

function extractCachableMeta(meta) {
  return Object.entries(meta)
    .filter(([key, val]) => key !== 'Raw' && val !== undefined)
    .map(([key, val]) => {
      if(val !== undefined && typeof(val) !== 'string') {
        if(Array.isArray(val)) {
          return [key, val.join(',')];
        }
        return [key, val.toString()];
      }
      return [key, val]
    })
    // Restore back to Object
    .reduce(backToObject, {});
}

var init = function(config, task_queue) {
  const storageDir = config.storageDir
  let keywordsIndex = vemdalenIndex('keywords:', {
    indexType: 'strings',
    client: config.redisClient
  });
  let metaCache = vemdalenIndex('meta:', {
    indexType: 'object',
    client: config.redisClient
  });
  let regionsCache = vemdalenIndex('metaRegions:', {
    indexType: 'object',
    client: config.redisClient
  });

  task_queue.registerTaskProcessor('import_meta', function(data, job, done) {
    var sourceFilePath = path.join(storageDir, data.file);

    mediaInfo.readMediaInfo(sourceFilePath).then((info) => {

      // Store keywords
      let filteredMeta = filterKeyWords(info);
      var keywordPromises  = filteredMeta.map(val => {
        // Only add new items
        return keywordsIndex.get(val).then(list => {
          if(list.indexOf(data.file) < 0) {
            return keywordsIndex.put(val, data.file);
          }
        });
      });

      // Store regions
      let regionPromises = extractRegions(info, data.file)
        .map(([key, compressed]) => regionsCache.put(key, compressed));

      // Store meta cache
      let cachableMeta = extractCachableMeta(info);
      let metaPromises = metaCache.put(data.file, cachableMeta);

      return Promise.all(keywordPromises, regionPromises, metaPromises);
    })
    .then(() => done(), done);
  });
};

module.exports = {
  init : init
};
