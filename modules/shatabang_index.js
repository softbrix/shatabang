"use strict"
/**
This file describes the index module for the keyword store and lookup

The index stores all information to the file system.
*/

var _ = require('underscore');
var fs = require('fs-extra');
var path = require('path');
var touch = require("touch");
var shFiles = require("./shatabang_files");
var StringSet = require("stringset");

const prefix = '_';
const masterKeyFileName = prefix + prefix + 'allKeys';
const valueDelimiter = '\n';
const defaultEncoding = 'utf8';
const chars='abcdefghijklmnopqrstuvwxyz';

var touchFile = function(filepath) {
  var dirpath = path.dirname(filepath);
  try {
    fs.accessSync(dirpath, fs.F_OK);
  } catch(err) {
    fs.mkdirpSync(dirpath);
  }
  touch.sync(filepath);
};


var getIdFromKey = function(key) {
  return ((parseInt(key, 36) * 2) % chars.length) + 1;
};

var putToFile = function(fileName, value, key) {
  if(_.isUndefined(key)) {
    key = "";
  }
  var fileContent = fs.readFileSync(fileName, defaultEncoding) || "";
  if(fileContent.indexOf(value) === -1) {
    if(fileContent.length > 0) {
      value = valueDelimiter + key + '_' + value;
    }
    fs.appendFileSync(fileName, value, defaultEncoding);
  }
};

var readFile = function(fileName) {
  //console.log('Loads file: ' + fileName);
  try {
    var idx = {};
    var data = fs.readFileSync(fileName, defaultEncoding);
    if(_.isEmpty(data)) {
      return idx;
    }
    var parsed = JSON.parse(data);
    _.each(parsed, function(list, key) {
      list.forEach(function(value) {
        addValue(idx, key, value);
      });
    });
    return idx;
  } catch(err) {
    //console.log(err);
    return {};
  }
};

var addValue = function(idx, key, value) {
  if(_.isUndefined(idx[key])) {
    idx[key] = new StringSet();
  }
  idx[key].add(value);
};

module.exports = function(pathToUse) {
  var getMasterKeyFile = function() {
    var fileName = path.join(pathToUse, masterKeyFileName);
    touchFile(fileName);
    return fileName;
  };

  var _idx = [new StringSet()];

  // Load old master key file
  var data = fs.readFileSync(getMasterKeyFile(), defaultEncoding);
  if(!_.isEmpty(data)) {
    var parsed = JSON.parse(data);
    parsed.forEach(function(itm) {
      _idx[0].add(itm);
    });
  }

  var getIndexFromKey = function(key) {
    var i = getIdFromKey(key);
    if(_.isUndefined(_idx[i])) {
      _idx[i] = readFile(getFileFromIndex(i));
    }
    return _idx[i];
  };

  var getFileFromIndex = function(idx) {
    return path.join(pathToUse, chars.charAt(idx-1));
  };



  var writeFile = function(list, fileName) {
    //console.log(list);
    shFiles.writeFile(fileName, JSON.stringify(list), function(err) {
      if(err) {
        return;
      }
      console.log("The file was saved: ", fileName);
    });
  };

  var getIndexAsList = function(index) {
    var list = {};
    _.each(index, function(keySet, key) {
      this[key] = keySet.items();
    }, list);
    return list;
  };

  var flush = function() {
    writeFile(_idx[0].items(), getMasterKeyFile());
    _.times(chars.length, function(i) {
      ++i;
      if(_.isEmpty(_idx[i])) {
        return;
      }
      writeFile(getIndexAsList(_idx[i]), getFileFromIndex(i));
    });
  };

  var throttled_flush = _.throttle(flush, 5000);

  return {
    /**
    Expects a key string and value string as parameters. These will be added to
    the internal index
    */
    put : function(key, value) {
      if(!_.isString(key) || !_.isString(value) ||
        key.length === 0 || value.length === 0) {
        return;
      }
      var idx = getIndexFromKey(key);

      addValue(idx, key, value);

      _idx[0].add(key);

      throttled_flush();
    },
    /**
     Return all items for the matching key
     */
    get : function(key) {
      if(!_.isString(key) || key.length === 0 ) {
        return [];
      }

      var idx = getIndexFromKey(key);

      if(_.isUndefined(idx[key])) {
        return [];
      }
      return idx[key].items();
    },
    search : function(searchStr) {
      var keys = _idx[0].items();
      return _.filter(keys, function(item){ return item.indexOf(searchStr) >= 0; });
    }
  };
};
