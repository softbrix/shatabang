import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('faces');
  this.route('login');
  this.route('upload');
  this.route('media',  { path: '/media/:media_id' });
});

export default Router;
