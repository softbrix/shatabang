/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var loginformRouter = express.Router();

  loginformRouter.get('/', function(req, res) {
    res.send({
      'loginform': [123]
    });
  });

  loginformRouter.post('/', function(req, res) {
    console.log(req.body);
    if(req.body.username === 'admin') {
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  });

  loginformRouter.get('/:id', function(req, res) {
    res.send({
      'loginform': {
        id: req.params.id
      }
    });
  });

  loginformRouter.put('/:id', function(req, res) {
    res.send({
      'loginform': {
        id: req.params.id
      }
    });
  });

  loginformRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  // Andreas 2017-03-05: Enabled
  var bodyParser = require('body-parser');
  app.use('/api/loginform', bodyParser.json());
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  app.use('/api/loginform', loginformRouter);
};
