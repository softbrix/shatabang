import Ember from 'ember';

export default Ember.Service.extend({

  initialize: function() {
    setInterval(function() {
      Ember.$.get('./api/upload/imported')
        .then(function (response) {
          var images = response.data;
          if(images !== undefined && images.length > 0) {
            console.log('imported', images);
            /*importImages(images);
            imageList = undefined;
            clearImageList();
            ptr.end = ptr.start;
            // TODO: Should only update current position
            loadMoreImages();
            */
          }
        });
    }, 10 * 1000);
  }
});
