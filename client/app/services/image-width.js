import Ember from 'ember';


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

export default Ember.Service.extend({
  imageWidth: 300,
  imagesPWidth: 4,
  zoomMultiplicator: 2,
  ratio: Ember.computed('imagesPWidth', function () {
    var imagesPWidth = Math.ceil(this.get('imagesPWidth'));
    return 100 / imagesPWidth;
  }),

  init: function() {
    this._super(...arguments);

    var imageWidth = this.get('imageWidth');
    var imagesPWidth = Math.ceil(Ember.$('body').width() / imageWidth);
    imagesPWidth = Math.max(4, imagesPWidth); // At least 4 images in with

    this.set('imagesPWidth', imagesPWidth);

    console.log('imagesPWidth: ', imagesPWidth);
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
