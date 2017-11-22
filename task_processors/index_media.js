"use strict";

var mediaInfo = require('../modules/media_info');
var shIndex = require('stureby_index');
var _ = require('underscore');
var path = require('path');


var init = function(config, task_queue) {
  var idx_meta = shIndex(path.join(config.cacheDir, 'idx_meta'));
  var idx = shIndex(path.join(config.cacheDir, 'idx_tst'));
  var storageDir = config.storageDir;

  task_queue.registerTaskProcessor('index_media', function(data, job, done) {
    console.log(storageDir, data.file);
    var relativeFilePath = path.relative(storageDir, data.file);
    mediaInfo.getTags(data.file).
        then(function(tags) {
          if(tags.length > 0) {
            _.each(tags, function(tag) {
              //console.log('put tag', tag);
              idx.put(tag, relativeFilePath);
            });
          }
          done();
        }, done);
  });
};

module.exports = {
  init : init
};
