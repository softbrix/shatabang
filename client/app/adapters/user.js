import DS from 'ember-data';
import config from '../config/environment';

console.log(config.rootURL);

export default DS.JSONAPIAdapter.extend({
  namespace: './api'
});
