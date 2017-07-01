import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'img',
  classNames: ['galleryImage'],
  attributeBindings: ['imgSrc:src', 'imgAlt:alt', 'imageWidth:style'],

  imgSrc: Ember.computed('media', function() {
    return './images/300/' + this.get('media.img');
  }),
  imgAlt: Ember.computed('media', function() {
    return this.get('media.date') + ' - '+ this.get('media.img');
  }),

  imageWidthService: Ember.inject.service('image-width'),
  imageWidth: Ember.computed('imageWidthService.ratio', function() {
    /* Note: You must implement #escapeCSS. */
    var ratio = this.get('imageWidthService.ratio');
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    if(!isNumber(ratio)) {
      ratio = 25;
    }
    return Ember.String.htmlSafe("width: " + ratio + "%");
  })
});
