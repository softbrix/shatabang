/* jshint: node */

"use strict"
var dir = require('node-dir');
var _ = require('underscore');
var fs = require('fs-extra');
var path = require('path');
var ExifImage = require('exif').ExifImage;
var iptc = require('node-iptc');
var piexif = require("piexifjs");
var exif = require('./exiftool');
var Q = require('q');

// Allways itpc:keywords
const tagHolderItpc = 'keywords';
const tagsDelimiter = ';';
const isImage = /^(?!\.).+[jpe?g|png|tiff|img]$/i;

var processExiftool = function(filename, tags, callback) {
  var deffered = Q.defer();

//console.log("process", filename);
  exif.metadata(filename, tags, function(error, metadata) {
    if (error) {
      deffered.reject(error);
    } else {
      deffered.resolve(metadata);
    }
    if(_.isFunction(callback)) {
      callback(error, metadata);
    }
  });
  return deffered.promise;
};

var processFile = function(item) {
    var deffered = Q.defer();
    var exifRegexp = /^(?!\.).+[jpe?g|m4a|mp4]$/i;

    var extension = path.extname(item);

    if(exifRegexp.test(path.basename(item))) {
      if(isImage.test(path.basename(item))) {
        //console.log('use exif native');
        new ExifImage({ image : item}, function (error, exifData) {
            if (error) {
                fileSystemFallback(item).then(function(fileInfo) {
                  deffered.resolve(fileInfo);
                }, function(err) {
                  deffered.reject(err);
                });
            } else {
              //var date = exifData.exif.CreateDate || exifData.image.ModifyDate;
              //console.log(item, exifData, date);
              deffered.resolve({
                  CreateDate : exifData.exif.CreateDate,
                  ModifyDate : exifData.image.ModifyDate,
                  //Tags : exifData.image.XPKeywords,
                  //origInfo : exifData
              });
            }
        });
      } else if(true) {
        //console.log('Use exif tool');
        /** exiftool: */
        processExiftool(item, [], function(error, metadata) {
          if (error) {
            deffered.reject(error);
          } else {
            deffered.resolve({
                CreateDate : metadata.createDate,
                ModifyDate : metadata.modifyDate,
                Width: metadata.imageWidth,
                Height: metadata.imageHeight,
                Tags : extractTags(metadata),
                origInfo : metadata
            });
          }
        });
      } else {
        /** piexif: */
        var jpeg = fs.readFileSync(item);
        var data = jpeg.toString("binary");
        var exifData = piexif.load(data);
        deffered.resolve(exifData);
      }
      return deffered.promise;
    } else {
      return fileSystemFallback(item);
    }

};

// This should be the suggested date, more insecure than the exif info
var fileSystemFallback = function(item) {
  var deffered = Q.defer();
  fs.stat(item, function(error, stats) {
    if (error) {
        deffered.reject(error);
    } else {
      deffered.resolve({
          CreateDate : stats.ctime,
          ModifyDate : stats.mtime,
          Tags: [],
          origInfo : stats
      });
    }
    //console.log(item, stats);
  });
  return deffered.promise;
};

var read_iptc = function(sourceFile) {
  var deffered = Q.defer();
  if(isImage.test(sourceFile)) {
    fs.readFile(sourceFile, function(err, data) {
      if (err) { deffered.reject(err); }
      var iptc_data = iptc(data);
      deffered.resolve(iptc_data);
    });
  } else {
    processExiftool(sourceFile, function(err, data) {
      if (err) {
         deffered.reject(err);
       } else {
         deffered.resolve(data);
      }
    });
  }
  return deffered.promise;
};

var read_tags = function(sourceFile) {
  return read_iptc(sourceFile).then(function(iptc_data) {
    return extractTags(iptc_data) || [];
  }, function( /*error */ ) {
    return [];
  });
};

var saveTagsToFile = function(tags, sourceFile) {
  var deffered = Q.defer();
  var newTagStr = tags.length > 0 ? tags.join(tagsDelimiter) : "";
  processExiftool(sourceFile, ['-'+tagHolderItpc+'='+newTagStr, '-overwrite_original'], function(err /*, ignore */) {
    //console.log('tags added', ignore);
    if (err) {
       deffered.reject(err);
     } else {
       deffered.resolve();
    }
  });
  return deffered.promise;
};

var extractTags = function(metadata) {
  var tags = [], tagString = metadata[tagHolderItpc] || "";
  if(tagString !== undefined) {
    if(_.isArray(tagString)) {
      tagString = tagString[0];
    }
    tags = tagString.split(tagsDelimiter);
  }
  return tags;
};

module.exports = {
  readMediaInfo : function(sourceFile) {
    return processFile(sourceFile);
  },
  addTag : function(sourceFile, newTag) {
    return read_tags(sourceFile).then(
      function(tags) {
        var tagCountStart = tags.length;
        if(_.isArray(newTag)) {
          _.each(newTag, function(tag) {
            if(!_.contains(tags, tag)) {
              tags.push(tag);
            }
          });
        } else if (!_.contains(tags, newTag)) {
            tags.push(newTag);
        }
        if (tagCountStart !== tags.length) {
          return saveTagsToFile(tags, sourceFile);
        }
        return Q.resolve();
      });
  },
  removeTag : function(sourceFile, newTag) {
    return read_tags(sourceFile).then(
      function(tags) {
        if(_.contains(tags, newTag)) {
          tags = _.filter(tags, function(item) {
            return item.valueOf() !== '' && item.valueOf() !== newTag.valueOf();
          });
          return saveTagsToFile(tags, sourceFile);
        }
      });
  },
  getTags : function(sourceFile) {
    return read_tags(sourceFile);
  }
};
