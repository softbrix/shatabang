import Ember from 'ember';

export default Ember.Component.extend({
  session: Ember.inject.service('session'),
  currentUser: Ember.inject.service('current-user'),
  init: function() {
    this._super(...arguments);
    let that = this;
    this._loadCurrentUser().then(function() {
      let user = that.get('currentUser').get('user');
      if(user) {
        that.set('userName', user.get('username'));
      }
    });
  },
  actions: {
    toggleShowUserInfo: function() {
      this.set('showUserInfo', !this.get('showUserInfo'));
    },
    invalidateSession() {
      console.log('invalidate session action');
      this.get('session').invalidate();
    }
  },

  _loadCurrentUser() {
    return this.get('currentUser').load().catch(() => this.get('session').invalidate());

  },
  userName : '',
  showUserInfo: false
});
