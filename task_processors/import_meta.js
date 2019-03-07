"use strict"
const path = require('path');
const flatten = require('obj-flatten');
const faceInfo = require('../modules/face_info');
const shFiles = require('../modules/shatabang_files');
const PersonInfo = require('../modules/person_info');
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
      return [key, region.name, compressed];
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
  const storageDir = config.storageDir,
        cacheDir = config.cacheDir;
  let keywordsIndex = vemdalenIndex('keywords:', {
    indexType: 'strings_unique',
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
    // Hack: Due to a temporary bug in importer, should be ok to remove
    data.file = data.file.replace(new RegExp(storageDir, 'g'), '');

    var sourceFilePath = path.join(storageDir, data.file);

    mediaInfo.readMediaInfo(sourceFilePath, true).then((info) => {

      // Store keywords
      let filteredMeta = filterKeyWords(info);
      var keywordPromises  = filteredMeta.map(val => {
        keywordsIndex.put(val, data.file)
      });

      let personInfo = PersonInfo(config.redisClient);
      // Store regions
      let regionPromises = extractRegions(info, data.file)
        .map(([key, name, compressed]) => {
          if(name !== undefined && name.length > 0) {
            return personInfo.getOrCreate(name, key).then(personInfo => {
              compressed.p = personInfo.id;
              return regionsCache.put(key, compressed);
            });
          } else {
            return regionsCache.put(key, compressed);
          }
        });


      // Store meta cache
      let cachableMeta = extractCachableMeta(info);
      let metaPromises = metaCache.put(data.file, cachableMeta);

      if (info.Thumbnail && info.Thumbnail.buffer && info.Thumbnail.buffer.length > 0) {
        var thumbnailFile = path.join(cacheDir, "120", data.file);
        shFiles.writeFile(thumbnailFile, info.Thumbnail.buffer, function(err) {
          if(err) {
            console.error(err)
            return;
          }
          console.log('Thumb saved: ' + thumbnailFile, info.Thumbnail.buffer.length)
        });
      } else {
        console.log('No thumnail')
        task_queue.queueTask('resize_image', { title: data.file, file: data.file, width: 120, height: 100});
      }

      return Promise.all([keywordPromises, metaPromises].concat(regionPromises));
    })
    .then(() => done(), done)
  });
};

module.exports = {
  init : init
};
