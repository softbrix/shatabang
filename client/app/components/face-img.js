import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'img',
  attributeBindings: ['imgSrc:src', 'imgAlt:alt', 'imgAlt:title'],
  didInsertElement() {
    this._super(...arguments);
  },
  imgSrc: computed('faceId', function() {
    return './api/faces/face/' + this.get('faceId');
  }),
  imgAlt: computed('faceId', function() {
    return this.get('faceId');
  })
});
