/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var aRouter = express.Router();


  aRouter.get('/list', function(req, res) {
    res.send(['admin', 'google']).end();
  });

  app.use('/api/auth', aRouter);
};
