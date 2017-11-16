// inspiration from https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md

import { resolve } from 'rsvp';

import Service, { inject as service } from '@ember/service';

export default Service.extend({
  session: service('session'),
  store: service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('store').findRecord('user', 'me').then((user) => {
        this.set('user', user);
      });
    } else {
      return resolve();
    }
  }
});
