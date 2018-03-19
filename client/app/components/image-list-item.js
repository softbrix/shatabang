import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: 'img',
  attributeBindings: ['imgSrc:src', 'imgAlt:alt', 'imgAlt:title'],
  didInsertElement() {
    this._super(...arguments);
  },
  imgSrc: computed('item', function() {
    return './api/faces/face/' + this.get('item.b');
  }),
  imgAlt: computed('item', function() {
    return this.get('item.selected') + this.get('item.b') + ' - ' + this.get('item.s') + ' - ' + this.get('item.a');
  })
});
