import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  mediaLoader: Ember.inject.service('media-list-loader'),
  imageWidthService: Ember.inject.service('image-width'),

  init() {
    this.get('mediaLoader');
    this.get('imageWidthService');
  },
  actions: {
    zoomIn: function() { this.get('imageWidthService').zoomIn(); },
    zoomOut: function() { this.get('imageWidthService').zoomOut(); }
  }
});
