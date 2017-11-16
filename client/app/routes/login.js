import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin);

/**
TODO: Load authetication alternatives
axios.get('./api/auth/list').then(function(response) {
  $('#loginAlternatives').show();
  var auth_list = response.data;
  if(auth_list.indexOf('admin') > -1) {
    $('#adminLoginform').show();
  }
  if(auth_list.indexOf('google') > -1) {
    $('#googleLoginBtn').show();
  }
});

*/
