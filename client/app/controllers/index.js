import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: service('session'),
  mediaLoader: service('media-list-loader'),

  init() {
    this._super(...arguments);
    // Only init if we are authenticated...
    this.get('mediaLoader');
  }
});
