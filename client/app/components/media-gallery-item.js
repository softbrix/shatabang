import { htmlSafe } from '@ember/string';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default Component.extend({
  tagName: 'span',
  classNames: ['galleryImage'],
  attributeBindings: ['imgSrc:src', 'imgAlt:alt', 'imageWidth:style'],

  imgSrc: computed('media', function() {
    return './images/300/' + this.get('media.img');
  }),
  imgAlt: computed('media', function() {
    return this.get('media.date') + ' - '+ this.get('media.img');
  }),

  imageWidthService: service('image-width'),
  imageWidth: computed('imageWidthService.ratio', function() {
    /* Note: You must implement #escapeCSS. */
    var ratio = this.get('imageWidthService.ratio');
    if(!isNumber(ratio)) {
      ratio = 25;
    }
    return htmlSafe("width: " + ratio + "%");
  })
});
