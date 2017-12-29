import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: service('session'),
  imageWidthService: service('image-width'),
  mediaLoader: service('media-list-loader'),

  fromDate: '1970-01-01',
  toDate: '1979-09-09',

  init() {
    this._super(...arguments);
    // Only init if we are authenticated...
    if (this.get('session.isAuthenticated')) {
      var now = new Date();

      this.set('toDate', now.toLocaleDateString());
      this.set('fromDate', now.toLocaleDateString());
      var tree = this.get('mediaLoader.tree');

      this.get('mediaLoader').fullyLoadedPromise().then(() => {
        var it = tree.leafIterator();
        var d = now;
        if(it.hasNext()) {
          d = it.next().date;
        }
        this.set('fromDate', d.toLocaleDateString());
      });
    }
    this.get('imageWidthService');
  },
  actions: {
    zoomIn: function() { this.get('imageWidthService').zoomIn(); },
    zoomOut: function() { this.get('imageWidthService').zoomOut(); },
    fromDateChanged: function(e) { console.log(e.target.value); },
    toDateChanged: function(e) { console.log(e.target.value); }
  }
});
