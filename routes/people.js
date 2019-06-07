"use strict"
var express = require('express');
var router  = express.Router();
var path = require('path');
var shIndex = require('stureby-index');
var PersonInfo = require("../modules/person_info");

var personInfo, idx_dir;
router.initialize = function(config) {
  idx_dir = path.join(config.cacheDir, 'idx_faces');
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

function savePersonInRegion(id, person) {
  var idx = shIndex(idx_dir);
  var data = idx.get(id);
  if(data && data.length > 0) {
    data = JSON.parse(data[0]);
    data.p = person.id;
    idx.update(id, JSON.stringify(data));
  }
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
      savePersonInRegion(person.thumbnail, savedPerson);
      res.end(JSON.stringify({ person: savedPerson}));
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
