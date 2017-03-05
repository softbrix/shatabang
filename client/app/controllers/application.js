import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    invalidateSession() {
      console.log('iinvalidate session action');
      this.get('session').invalidate();
    }
  }
});
