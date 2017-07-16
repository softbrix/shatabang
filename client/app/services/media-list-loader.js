import Ember from 'ember';
import DibbaTree from 'npm:dibba_tree';

const Promise = Ember.RSVP.Promise;
const movieFileRegexp = /(.+)(mp4|avi|mov|mpe?g)$/gi;


// "2016/03/14/222624.jpg"
const fileNameRegexp = /^([\d]{4}).?(\d{2}).?(\d{2}).?(\d{2})(\d{2})(\d{2})/;
function fileName2Date(fileName) {
  var result = fileNameRegexp.exec(fileName);
  var date = new Date();
  if(result !== undefined && result !== null) {
    date = new Date(result[1], result[2]-1, result[3], result[4], result[5], result[6]);
  } else {
      console.log('Unknown date or file type' ,fileName);
  }
  return date;
}

export default Ember.Service.extend({
  tree : new DibbaTree(),
  loadedDeferred: Ember.RSVP.defer(),
  fullyLoadedDeferred: Ember.RSVP.defer(),
  isFullyLoaded: false,

  init: function() {
    var tree = this.get('tree');
    var loadedDeferred = this.get('loadedDeferred');
    var fullyLoadedDeferred = this.get('fullyLoadedDeferred');
    var that = this;

    Ember.$.get('./api/dirs/list').then(function(folders) {
      if(folders.length === 0) {
        return;
      }

      // Sort folders descending, are delivered ascending DOH!...
      folders = folders.sort(function(a,b){return b-a;});

      var importImages = function(images) {
        images.forEach(function(fileName) {
          var date = fileName2Date(fileName);

          var isVideo, bigMediaFileName;
          if(movieFileRegexp.test(fileName)) {
            bigMediaFileName = "./media/" + fileName;
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
            isVideo: isVideo
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
        return Ember.$.get('./images/info/'+folder+'/media.lst')
          .then(function (response) {
            var images = response.split(',');

            console.log(images);

            if(folder !== 'import') {
              importImages(images);
            }
            return images.length;
          }, function(error) {
            console.log(error);
            if(error.status === 401) {

            }
          });
      };

      // This loads the first years image list
      loadImageList(folders[0])
        .then(function() {
          console.log('resolving');
          loadedDeferred.resolve(tree);
          // Load the rest of the images
          var promises = folders.slice(1).map(loadImageList);
          Promise.all(promises).then(values => {
            console.log(values, tree.getSize());
            that.set('isFullyLoaded', true);
            fullyLoadedDeferred.resolve(values);
          }).catch(fullyLoadedDeferred.reject);
        })
        .catch(function (response) {
          console.log(response);
          loadedDeferred.reject('Failed to resolve image tree' + response);
        });
    });
  },
  loadedPromise: function() {
    if(this.get('isFullyLoaded')) {
      return Ember.RSVP.Promise.resolve(this.get('tree'));
    } else {
      return this.get('loadedDeferred').promise;
    }
  },
  fullyLoadedPromise: function() {
      return this.get('fullyLoadedDeferred').promise;
  }
});
