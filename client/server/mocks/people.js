/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var router = express.Router();

  var persons = [
    {id: 0, name: 'First person', 'thumbnail': '965e6e22-51ed-493c-b35c-c4956cbedb02'},
    {id: 1, name: 'Second person', 'thumbnail': '0017d1a0-a554-4272-acfb-0a9be291c17c'}
  ];

  router.get('/', function(req, res) {
    res.end(JSON.stringify({people:persons}));
  });

  router.post('/', function(req, res) {
    var id = persons.length;
    req.body.person.id = id;
    persons.push(req.body.person);
    res.end(JSON.stringify({ person: {id: id}}));
  });

  router.get('/:id', function(req, res) {
    res.end(JSON.stringify({person:persons[req.params.id]}));
  });

  app.use('/api/people', router);
};
