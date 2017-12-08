"use strict";

import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('faces');
  this.route('login');
  this.route('upload');
  this.route('admin');
  this.route('calendar');
});

export default Router;
