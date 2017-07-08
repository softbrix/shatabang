import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gallery'],
  scrollAlmostDown: Ember.inject.service('scroll-almost-down'),
  mediaLoader: Ember.inject.service('media-list-loader'),
  mediaCount: 64,
  mediaList: [],

  didInsertElement() {
    this._super(...arguments);
    console.log('aaaa index');

    var that = this;
    this.get('mediaLoader').iterator().then(function(it) {
      console.log('got the iterator');
      // Initial load
      buildModel(that, that.get('mediaCount'), it);

      var deregisterer = that.get('scrollAlmostDown').registerListener(function() {
        buildModel(that, that.get('mediaCount'), it);
      });

      that.set('windowscrollCleanup', deregisterer);
    });

    console.log('activate index');
    //collectAnalytics();
  },
  willDestroyElement() {
    this._super(...arguments);
    console.log('deactivate index');
    var cleanup = this.get('windowscrollCleanup');
    if(cleanup !== undefined) {
      cleanup();
    }
    //trackPageLeaveAnalytics();
  },
  didRender() {
    this._super(...arguments);
    console.log('gallery render');
  }
});

function buildModel(that, count, it) {
  for(var i = 0; i < count && it.hasPrev(); ++i) {
    that.get('mediaList').pushObject(it.prev());
  }

  return that.get('mediaList');
}
