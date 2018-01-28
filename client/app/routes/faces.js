import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin).extend({
  model() {
    return Ember.$.getJSON('./api/faces/list').then(list => list.slice(0, 512));
  }
});
