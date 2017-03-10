// inspiration from https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md

import Ember from 'ember';

export default Ember.Service.extend({
  session: Ember.inject.service('session'),
  store: Ember.inject.service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('store').findRecord('user', 'me').then((user) => {
        this.set('user', user);
      });
    } else {
      return Ember.RSVP.resolve();
    }
  }
});
