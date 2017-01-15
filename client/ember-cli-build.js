/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
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

  app.import('bower_components/axios/dist/axios.js');
  // TODO: Add minified files for production or is the resulting assets.js minified

  app.import('bower_components/fancybox/source/jquery.fancybox.css');
  app.import('bower_components/fancybox/lib/jquery.mousewheel.pack.js');
  app.import('bower_components/fancybox/source/jquery.fancybox.pack.js');

  app.import('bower_components/dropzone/dist/dropzone.js');
  app.import('bower_components/dropzone/dist/basic.css');
  app.import('bower_components/dropzone/dist/dropzone.css');

  app.import('vendor/thirdParty.css');
  app.import('vendor/thirdParty.js');

  app.import('vendor/oldIndex.js');
  app.import('vendor/shatabang.js');



  return app.toTree();
};
