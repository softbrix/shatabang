import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin).extend({
  setupController: function(controller, model) {
    Ember.$.getJSON('./api/auth/list', function(auth_list) {
      console.log('Auth list: ', auth_list, model);
      controller.set('useForm', auth_list.indexOf('admin') > -1);
      controller.set('useGoogle', auth_list.indexOf('google') > -1);
    });
  }
});
