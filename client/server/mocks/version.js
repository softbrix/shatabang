/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var vRouter = express.Router();


  vRouter.get('/', function(req, res) {
    res.send("1.0.0").end();
  });

  app.use('/api/version', vRouter);
};
