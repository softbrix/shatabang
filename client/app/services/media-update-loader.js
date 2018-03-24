import $ from 'jquery';
import Service from '@ember/service';
import Ember from 'ember';

const Logger = Ember.Logger;

export default Service.extend({

  initialize: function() {
    setInterval(function() {
      $.get('./api/upload/imported')
        .then(function (response) {
          var images = response.data;
          if(images !== undefined && images.length > 0) {
            Logger.debug('imported', images);
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
