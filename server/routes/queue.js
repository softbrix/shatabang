"use strict"
var express = require('express');
var task_queue = require('../common/task_queue');
var bodyParser = require('body-parser');
var router  = express.Router();

/**
This route manages the kue apis
*/
var cacheDir;
router.initialize = function(config) {
  cacheDir = config.cacheDir;
};

router.use('/*', bodyParser.urlencoded({ extended: true }));

router.post('/add/:name/:priority/',function(req,res){
  var id = req.params.name;
  var priority = req.params.priority;
  var params = req.body || {};

  res.end("id: " + id + ", priority: " + priority);
  task_queue.queueTask(id, params, priority, true);
});

router.post('/addFolder/:folder/:name/:priority/',function(req,res){
  var id = req.params.name;
  var priority = req.params.priority;
  var params = {
    dir: req.params.folder,
    params: req.body || {},
    task_name: id,
    priority: priority
  };
  // TODO: Verify that year exists, or else return a http error
  console.log('The id: ' + id);
  res.end("id: " + id + ", priority: " + priority);

  task_queue.queueTask('run_task_in_folder', params, priority, true);
});

module.exports = router;
