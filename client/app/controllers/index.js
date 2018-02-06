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

      this.get('mediaLoader').fullyLoadedPromise().then(() => {
        var tree = this.get('mediaLoader.tree');
        var it = tree.leafIterator();
        this.set('fromDate', (it.hasPrev() ? it.next().date : now).toLocaleDateString());
        //var itl = tree.leafIteratorReverse();
        //this.set('toDate', (itl.hasPrev() ? itl.prev().date : now).toLocaleDateString());
      });
    }
    this.get('imageWidthService');
  },
  actions: {
    zoomIn: function() { this.get('imageWidthService').zoomIn(); },
    zoomOut: function() { this.get('imageWidthService').zoomOut(); },
    fromDateChanged: function(e) { this.set('fromDate', e.target.value); },
    toDateChanged: function(e) { this.set('toDate', e.target.value); }
  }
});
