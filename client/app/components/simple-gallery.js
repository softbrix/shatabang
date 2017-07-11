import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gallery'],
  scrollAlmostDown: Ember.inject.service('scroll-almost-down'),
  mediaLoader: Ember.inject.service('media-list-loader'),
  mediaCount: 64,
  activeMedia: undefined,
  mediaList: [],

  didInsertElement() {
    this._super(...arguments);

    var that = this;
    this.get('mediaLoader').iterator().then(function(it) {
      // Initial load
      buildModel(that, that.get('mediaCount'), it);

      var deregisterer = that.get('scrollAlmostDown').registerListener(function() {
        buildModel(that, that.get('mediaCount'), it);
      });

      that.set('windowscrollCleanup', deregisterer);
    });

    console.log('activate index');
  },
  willDestroyElement() {
    this._super(...arguments);
    console.log('deactivate index');
    var cleanup = this.get('windowscrollCleanup');
    if(cleanup !== undefined) {
      cleanup();
    }
  },
  actions: {
    mediaClicked: function(a) {
      this.set('activeMedia', a);
    },
    resetActiveMedia: function() {
      this.set('activeMedia', undefined);
    }
  }
});

function buildModel(that, count, it) {
  for(var i = 0; i < count && it.hasPrev(); ++i) {
    that.get('mediaList').pushObject(it.prev());
  }

  return that.get('mediaList');
}
