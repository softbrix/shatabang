import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gallery'],
  scrollAlmostDown: Ember.inject.service('scroll-almost-down'),
  mediaCount: 22,
  mediaList: buildModel(20),

  didInsertElement() {
    this._super(...arguments);
    console.log('aaaa index');

    var that = this;
    var deregisterer = this.get('scrollAlmostDown').registerListener(function() {
      that.incrementProperty('mediaCount', 100);
      var mCount = that.get('mediaCount');
      that.set('mediaList', buildModel(mCount));
      console.log(mCount);
    });
    this.set('windowscrollCleanup', deregisterer);
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
  }
});

function buildModel(count) {
  var a = [];
  for(var i = 0; i < count; ++i) {
    a.push({id: 'a' + (Math.sin(i)*Math.cos(i))});
  }
  return a;
}
