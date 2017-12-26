import $ from 'jquery';
import { computed } from '@ember/object';
import Service from '@ember/service';


/*function findElementAtScrollTop(parentElemet) {
  var elem, minDistance = Number.MAX_VALUE;
   $.each(parentElemet.children(), function(idx, child) {
     var pos = $(child).position().top;
     var distance = Math.abs(pos - window.scrollY);
     if(distance < minDistance) {
       elem = child;
       minDistance = distance;
     }
   });
   return elem;
}

function scrollToElement(elem) {
  var newTop = $(elem).position().top;
  window.scrollTo(0, newTop);
}*/

export default Service.extend({
  imageWidth: 300,
  imagesPWidth: 4,
  zoomMultiplicator: 2,
  ratio: computed('imagesPWidth', function () {
    var imagesPWidth = Math.ceil(this.get('imagesPWidth'));
    return 100 / imagesPWidth;
  }),

  init: function() {
    this._super(...arguments);

    this.reset();
  },
  reset() {
    var imageWidth = this.get('imageWidth');
    var imagesPWidth = Math.ceil($('body').width() / imageWidth);
    imagesPWidth = Math.max(4, imagesPWidth); // At least 4 images in with

    this.set('imagesPWidth', imagesPWidth);
  },
  zoomIn() {
    var imagesPWidth = this.get('imagesPWidth');
    if(imagesPWidth > 0) {
      imagesPWidth /= this.get('zoomMultiplicator');
      this.set('imagesPWidth', imagesPWidth);
    }
  },
  zoomOut() {
    var imagesPWidth = this.get('imagesPWidth');
    if(imagesPWidth < 256) {
      imagesPWidth *= this.get('zoomMultiplicator');
      this.set('imagesPWidth', imagesPWidth);
    }
  }
});
