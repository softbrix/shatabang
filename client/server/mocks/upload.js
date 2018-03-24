/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var uploadRouter = express.Router();


  uploadRouter.post('/single', function(req, res) {
    setTimeout(function() {
      res.status(201).end();
    }, Math.ceil(Math.random()*6000) + 1000);
  });

  uploadRouter.get('/imported', function(req, res) {
    res.end(['/2018/03/24/153332.jpg']);
  });


  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  app.use('/api/upload', uploadRouter);
};
