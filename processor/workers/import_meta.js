"use strict"
const path = require('path');
const flatten = require('obj-flatten');
const faceInfo = require('../common/face_info');
const shFiles = require('../common/shatabang_files');
const PersonInfo = require('../common/person_info');
const mediaInfo = require('vega-media-info');
const indexes = require("../common/indexes");

function notUndefined(val) {
  return val !== undefined;
}

function filterKeyWords(meta) {
  return Object.entries(flatten(meta.Raw))
      .filter(([key, val]) => key.toLowerCase().indexOf('error') < 0)
      .map(([key, val]) => val)
      .filter(val => val !== undefined && typeof(val) === 'string' && val.trim().length > 0);
}

// Sometimes I find stuff on the internet that actually works =)
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
  const keywordsIndex = indexes.keywordsIndex(config.redisClient);
  const metaCache = indexes.metaIndex(config.redisClient);
  const regionsCache = indexes.regionsIndex(config.redisClient);

  const personInfo = PersonInfo(config.redisClient);

  function extractRegions(meta, filePath) {
    if(  meta.Regions === undefined
      || meta.Regions.regionList === undefined) {
        return [];
    }
    return meta.Regions.regionList.map(region => {
        region = Object.assign(region, region.area);
        region.from = 'meta';
  
        var compressed = faceInfo.compress(region);
        let key = faceInfo.toId(filePath, region);
        return updateRegionName(key, region.name, compressed);
      });
  }
  
  function updateRegionName(key, name, compressed) {
    if(name !== undefined && name.length > 0) {
      return personInfo.getOrCreate(name, key).then(personInfo => {
        compressed.p = personInfo.id;
        return Promise.resolve({key: compressed});
      });
    } else {
      return Promise.resolve({key: compressed});
    }
  }

  task_queue.registerTaskProcessor('import_meta', function(data, job, done) {
    // Hack: Due to a temporary bug in importer, should be ok to remove
    // data.file = data.file.replace(new RegExp(storageDir, 'g'), '');

    var sourceFilePath = path.join(storageDir, data.file);

    const id = data.id;

    mediaInfo.readMediaInfo(sourceFilePath, true).then((info) => {

      // Store keywords
      let filteredMeta = filterKeyWords(info);
      var cachePutPromises = filteredMeta.map(val => {
        keywordsIndex.put(val, id)
      });

      // Store regions
      const regionPromises = extractRegions(info, data.file);
      Promise.all(regionPromises).then(regionList => {
        if(regionList.length > 0) {
          let p = regionsCache.put(id, regionList);
          cachePutPromises.push(p);
        }
      });


      // Store meta cache
      let cachableMeta = extractCachableMeta(info);
      cachePutPromises.push(metaCache.put(id, cachableMeta));

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

      return Promise.all(cachePutPromises);
    })
    .then(() => done(), done)
  });
};

module.exports = {
  init : init
};
