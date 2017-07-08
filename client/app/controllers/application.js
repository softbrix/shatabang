import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  imageWidthService: Ember.inject.service('image-width'),

  init() {
    this._super(...arguments);
    this.get('imageWidthService');
  },
  actions: {
    zoomIn: function() { this.get('imageWidthService').zoomIn(); },
    zoomOut: function() { this.get('imageWidthService').zoomOut(); }
  }
});
