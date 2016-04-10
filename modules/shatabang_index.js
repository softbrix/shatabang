
/**
This file describes the index module for the keyword store and lookup

The index stores all information to the file system.
*/
"use strict"

var _ = require('underscore');
var fs = require('fs-extra');
var path = require('path');
var jsonfile = require('jsonfile');
var touch = require("touch");

var pathToUse;
const prefix = '_';
const masterKeyFileName = prefix + prefix + 'allKeys';
const valueDelimiter = '\n';
const defaultEncoding = 'utf8';

var getIndexPath = function() {
  if(_.isUndefined(pathToUse)) {
    throw new Error('The indexer has not been initialized with a path. Call usePath.');
  }
  return pathToUse;
};

/*var dirStructure = {
  1 : [prefix, 1],
  3 : [1, prefix, 2],
  5 : [1, 2, prefix, 5]
};*/

var getFilePathFromKey = function(key) {
  // Replace slashes with underscore
  key = key.replace(/\\|\//g, "_");
  var fileName;
  if(key.length < 3) {
    fileName = prefix + key;
  } else if(key.length < 5) {
    var index = 2;
    fileName = path.join(key.substring(0, index), prefix + key.substring(index));
  } else {
    var index1 = 2;
    var index2 = 4;
    fileName = path.join(key.substring(0, index1), key.substring(index1, index2), key.substring(index2));
  }
  return path.join(getIndexPath(), fileName);
};

var getMasterKeyFile = function() {
  var fileName = path.join(getIndexPath(), masterKeyFileName);
  touchFile(fileName);
  return fileName;
};

var touchFile = function(filepath) {
  var dirpath = path.dirname(filepath);
  try {
    fs.accessSync(dirpath, fs.F_OK);
  } catch(err) {
    fs.mkdirpSync(dirpath);
  }
  touch.sync(filepath);
};

var putToFile = function(fileName, value) {
  var fileContent = fs.readFileSync(fileName, defaultEncoding) || "";
  if(fileContent.indexOf(value) === -1) {
    if(fileContent.length > 0) {
      value = valueDelimiter + value;
    }
    fs.appendFileSync(fileName, value, defaultEncoding);
  }
};

var readFile = function(fileName) {
  try {
    return (fs.readFileSync(fileName, defaultEncoding) || "").split(valueDelimiter);
  } catch(err) {
    //console.log(err);
    return [];
  }
};

module.exports = {
  usePath : function(newPathToUse) {
    pathToUse = newPathToUse;
  },
  /**
  Expects a key string and value string as parameters. These will be added to
  the internal index
  */
  put : function(key, value) {
    if(!_.isString(key) || !_.isString(value) ||
      key.length === 0 || value.length === 0) {
      return;
    }
    var fileName = getFilePathFromKey(key);

    touchFile(fileName);

    putToFile(fileName, value);

    var keyFile = getMasterKeyFile();
    putToFile(keyFile, key);
  },
  /**
   Return all items for the matching key
   */
  get : function(key) {
    if(!_.isString(key) || key.length === 0 ) {
      return [];
    }

    var fileName = getFilePathFromKey(key);

    return readFile(fileName);
  },
  search : function(searchStr) {
    var keys = readFile(getMasterKeyFile());
    return _.filter(keys, function(item){ return item.indexOf(searchStr) >= 0; });
  }
};
