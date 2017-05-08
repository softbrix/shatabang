import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  mediaLoader: Ember.inject.service('media-list-loader'),

  init() {
    console.log('init app');
    this.get('mediaLoader').init();
  }
});
