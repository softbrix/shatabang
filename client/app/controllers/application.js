import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: service('session'),
  imageWidthService: service('image-width'),

  init() {
    this._super(...arguments);
    this.get('imageWidthService');
  },
  actions: {
    zoomIn: function() { this.get('imageWidthService').zoomIn(); },
    zoomOut: function() { this.get('imageWidthService').zoomOut(); }
  }
});
