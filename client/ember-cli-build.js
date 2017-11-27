/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
    lessOptions: {
      paths: [
        'node_modules/bootstrap/less',
        'node_modules/font-awesome/less',
        'node_modules/font-awesome/fonts'
      ]
    },

    'ember-bootstrap': {
      'bootstrapVersion': 3,
      'importBootstrapFont': true,
      'importBootstrapCSS': false
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  //app.import('bower_components/axios/dist/axios.js');
  // TODO: Add minified files for production or is the resulting assets.js minified
  /*
  'node_modules/font-awesome/css/font-awesome.min.css',
  'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
  'node_modules/bootstrap/dist/css/bootstrap.min.css',
  'node_modules/bootstrap-social/bootstrap-social.css',
  'node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css',
  'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker3.standalone.min.css',
  'client/assets/dropzone/basic.min.css',
  'client/assets/dropzone/dropzone.min.css'


  'node_modules/bootstrap/dist/bootstrap.js',
  'node_modules/bootstrap-switch/dist/js/bootstrap-switch.min.js',
  'node_modules/axios/dist/axios.min.js',
  'node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
  'node_modules/underscore/underscore-min.js',
  'client/assets/dropzone/dropzone.min.js'
  */

  app.import('node_modules/bootstrap/dist/js/bootstrap.js');

  ['woff', 'woff2', 'ttf', 'svg'].forEach((suffix) => {
    app.import('node_modules/font-awesome/fonts/fontawesome-webfont.' + suffix, {
      destDir: 'fonts'
    });
  });



  return app.toTree();
};
