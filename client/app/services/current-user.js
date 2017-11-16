// inspiration from https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md
"use strict";

import Service, { inject as service } from '@ember/service';
import { debug } from '@ember/debug';

export default Service.extend({
  session: service('session'),
  store: service(),

  load() {
    var setUser = (user) => {
      this.set('user', user);
    };
    if (this.get('session.isAuthenticated')) {
      return this.get('store').findRecord('user', 'me').then(setUser);
    } else {
      return this.get('session')
        .authenticate('authenticator:passport_google')
        .then(setUser)
        .catch(debug);
    }
  }
});
