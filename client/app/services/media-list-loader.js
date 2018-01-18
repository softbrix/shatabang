/* global Promise */

import $ from 'jquery';
import Ember from 'ember';
import Service from '@ember/service';
import { Promise as EmberPromise, defer } from 'rsvp';
import DibbaTree from 'npm:dibba_tree';

const Logger = Ember.Logger;
const movieFileRegexp = /(.+)(mp4|m4v|avi|mov|mpe?g)$/gi;

// "2016/03/14/222624.jpg"
const fileNameRegexp = /^([\d]{4}).?(\d{2}).?(\d{2}).?(\d{2})(\d{2})(\d{2})/;
function fileName2Date(fileName) {
  var result = fileNameRegexp.exec(fileName);
  var date = new Date();
  if(result !== undefined && result !== null) {
    date = new Date(result[1], result[2]-1, result[3], result[4], result[5], result[6]);
  } else {
      Logger.error('Unknown date or file type' ,fileName);
  }
  return date;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default Service.extend({
  tree : new DibbaTree(),
  loadedDeferred: defer(),
  fullyLoadedDeferred: defer(),
  isFullyLoaded: false,
  folders: [],

  init: function() {
    var tree = this.get('tree');
    var loadedDeferred = this.get('loadedDeferred');
    var fullyLoadedDeferred = this.get('fullyLoadedDeferred');
    var that = this;

    $.get('./api/dirs/list').then(function(folders) {
      if(folders.length === 0) {
        return;
      }

      // Sort folders descending, are delivered ascending DOH!...
      folders = folders.filter(isNumber).sort(function(a,b){return b-a;});

      //that.set('folders', folders);

      var importImages = function(images) {
        images.forEach(function(fileName) {
          var date = fileName2Date(fileName);

          var isVideo, bigMediaFileName;
          if(movieFileRegexp.test(fileName)) {
            bigMediaFileName = "./video/" + fileName;
            fileName = fileName.replace(movieFileRegexp, '$1jpg');
            isVideo = true;
          } else {
            bigMediaFileName = './images/1920/' + fileName;
            isVideo = false;
          }

          var newObj = {
            date: date,
            img: fileName,
            bigMedia: bigMediaFileName,
            downloadUrl: "./media/" + fileName,
            isVideo: isVideo,
            isImage: !isVideo
          };

          var y = date.getFullYear();
          var m = date.getMonth()+1; // Month is numbered from 0 - 11. Compensate with +1
          var d = date.getDate();
          var hh = date.getHours();
          var mm = date.getMinutes();
          var ss = date.getSeconds();
          var id = fileName.split('_')[1] || 0;

          tree.update(newObj, y, m, d, hh, mm, ss, id);
        });
      };

      var loadImageList = function(folder) {
        that.get('folders').pushObject(folder);
        return $.get('./images/info/'+folder+'/media.lst')
          .then(function (response) {
            var images = response.split(',');

            Logger.info(images);

            if(folder !== 'import') {
              importImages(images);
            }
            return images.length;
          });
      };

      // This loads the first years image list
      loadImageList(folders[0])
        .then(function() {
          Logger.debug('resolving');
          loadedDeferred.resolve(tree);
          // Load the rest of the images
          var promises = folders.slice(1).map(loadImageList);
          Promise.all(promises).then(values => {
            Logger.info(tree.getSize(), values);
            that.set('isFullyLoaded', true);
            fullyLoadedDeferred.resolve(values);
          }).catch(fullyLoadedDeferred.reject);
        })
        .catch(function (response) {
          loadedDeferred.reject('Failed to resolve image tree' + response);
        });
    });
  },
  loadedPromise: function() {
    if(this.get('isFullyLoaded')) {
      return EmberPromise.resolve(this.get('tree'));
    } else {
      return this.get('loadedDeferred').promise;
    }
  },
  fullyLoadedPromise: function() {
      return this.get('fullyLoadedDeferred').promise;
  }
});
