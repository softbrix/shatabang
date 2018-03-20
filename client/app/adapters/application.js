import DS from 'ember-data';
import config from '../config/environment';

var rootPath = new URL(config.rootURL, location).pathname;

export default DS.RESTAdapter.extend({
  namespace: rootPath + 'api'
});
