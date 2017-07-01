import Ember from 'ember';
import DibbaTree from 'npm:dibba_tree';

const Promise = Ember.RSVP.Promise;

function moveIteratorLast(it) {
  while(it.hasNext()) {
    it.next();
  }
  return it;
}

// "2016/03/14/222624.jpg"
var fileNameRegexp = /^([\d]{4}).?(\d{2}).?(\d{2}).?(\d{2})(\d{2})(\d{2})/;
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
  iteratorDeferred: Ember.RSVP.defer(),

  init: function() {
    var tree = this.get('tree');
    var iteratorDeferred = this.get('iteratorDeferred');

    Ember.$.get('./api/dirs/list').then(function(folders) {
      if(folders.length === 0) {
        return;
      }

      // Sort folders descending, are delivered ascending DOH!...
      folders = folders.sort(function(a,b){return b-a;});

      var importImages = function(images) {
        images.forEach(function(fileName) {
          var date = fileName2Date(fileName);
          var newObj = {date: date, img: fileName};

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
          iteratorDeferred.resolve(moveIteratorLast(tree.leafIterator()));
          // Load the rest of the images
          var promises = folders.slice(1).map(loadImageList);
          Promise.all(promises).then(values => {
            console.log(values);
          });
        })
        .catch(function (response) {
          console.log(response);
          iteratorDeferred.reject('Failed to resolve image tree' + response);
        });
    });
  },
  iterator: function() {
    return this.get('iteratorDeferred').promise;
  }
});
