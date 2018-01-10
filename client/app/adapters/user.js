/* global location, URL */

import DS from 'ember-data';
import Ember from 'ember';
import config from '../config/environment';

var rootPath = new URL(config.rootURL, location).pathname;
Ember.Logger.debug('User adapter rootPath', rootPath);

export default DS.JSONAPIAdapter.extend({
  namespace: rootPath + 'api'
});
