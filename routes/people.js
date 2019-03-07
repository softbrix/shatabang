"use strict"
var express = require('express');
var router  = express.Router();

var PersonInfo = require("../modules/person_info");
var personInfo;

router.initialize = function(config) {
  personInfo = PersonInfo(config.redisClient);
};

router.get('/', function(req, res) {
  personInfo.getAll().then(persons => {
    res.end(JSON.stringify({people:persons}))
  })
  .catch((err) => {
    res.status(500).end(err);
  });
});

function savePersonInRegion(regionId, person) {
  // TODO: Implement
}

router.post('/', function(req, res) {
  var person = req.body.person;
  if(!person) {
    res.status(400).end();
    return;
  }
  personInfo.getOrCreate(person.name, person.thumbnail)
    .then(
    (savedPerson) => {
      res.end(JSON.stringify({ person: savedPerson}));
      savePersonInRegion(person.thumbnail, savedPerson);
    },
    (err) => res.status(500).end(err)
  );
});

router.get('/:id', function(req, res) {
  personInfo.getById(req.params.id)
    .then(
      personRes => res.end(JSON.stringify({person:personRes})),
      err => res.status(500).end(err)
    );
});

router.get('/:id/faces', function(req, res) {
  index.get(decodeURIComponent(req.params.id))
    .then(
      personRes => res.end(JSON.stringify({person:personRes})),
      err => res.status(500).end(err)
    );
});

module.exports = router;
