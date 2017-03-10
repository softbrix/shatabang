/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var userRouter = express.Router();

  userRouter.get('/', function(req, res) {
    res.send({
      'user': []
    });
  });

  userRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  userRouter.post('/authenticate', function(req, res) {
    if(req.body.username === 'admin') {
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  });

  userRouter.get('/me', function(req, res) {
    res.send({"data": {
        "type": "user",
        "id": "me",
        "attributes": {
          "username": 'arvid'
        }
      }
    });

  });

  userRouter.post('/invalidate', function(req, res) {
    res.status(200).end();
  });

  userRouter.get('/:id', function(req, res) {
    res.send({
      'user': {
        id: req.params.id
      }
    });
  });

  userRouter.put('/:id', function(req, res) {
    res.send({
      'user': {
        id: req.params.id
      }
    });
  });

  userRouter.delete('/:id', function(req, res) {
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
  app.use('/api/users', bodyParser.json());
  app.use('/api/users', bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  app.use('/api/users', userRouter);
};
