"use strict";

const _ = require('underscore');
const fs = require('fs');
const path = require('path');

const DEFAULT_FILE_NAME = 'media.meta';

let _instance = function(cacheDirectory, fileName) {
  fileName = fileName || DEFAULT_FILE_NAME;
  let metaFilePath = path.join(cacheDirectory, fileName);
  let _objs;
  let _readDeferred;

  let _flush = function() {
    fs.writeFile(metaFilePath, JSON.stringify(_objs), (err) => {if(err) {console.log(err);}});
  };
  let _throttledFlush = _.throttle(_flush, 1000);

  return {
    // Read multiple
    getAll : function() {
      if(!_.isUndefined(_objs)) {
        return Promise.resolve(_objs);
      }
      if(!_.isUndefined(_readDeferred)) {
        return _readDeferred;
      }

      _readDeferred = new Promise(function(resolve, reject) {
        fs.readFile(metaFilePath, (err,data) => {
          if(err) {
            // ENOENT = File is missing
            if(err.code !== 'ENOENT') {
              reject(err);
              return;
            }
          }
          if(_.isUndefined(data)) {
            // No file found, initialize empty object
            _objs = {};
          } else {
            _objs = JSON.parse(data);
            if(!_.isObject(_objs)) {
              reject('Stored type is not an object');
              return;
            }
          }
          resolve(_objs);
        });
      });
      return _readDeferred;
    },
    // Read single
    get : function(key) {
      return this.getAll().then((objs) => {
        return objs[key];
      });
    },
    // Read index
    getKeys : function() {
      return this.getAll().then((objs) => {
        return _.keys(objs);
      });
    },
    // Create / update
    set : function(key, meta) {
      return this.getAll().then((objs) => {
        objs[key] = meta;
        _throttledFlush();
        return meta;
      });
    },
    // Delete
    delete : function(key) {
      return this.getAll().then((objs) => {
        var val = objs[key];
        delete objs[key];
        _throttledFlush();
        return val;
      });
    }
  };
};

let _instanceCache = [];

module.exports = function(cacheDirectory) {
  // This will keep a lot in memory but will reuse the instances in the same
  // process thus enable multiple read and writes from different parts of the application.
  if(_.isUndefined(_instanceCache[cacheDirectory])) {
    _instanceCache[cacheDirectory] = new _instance(cacheDirectory);
    // TODO: Add support to unload an instance from the cache.
  }
  return _instanceCache[cacheDirectory];
};
