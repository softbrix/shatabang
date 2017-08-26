"use strict"
var express = require('express');
var task_queue = require('../modules/task_queue');
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

  console.log('The id: ' + id, params);
  res.end("id: " + id + ", priority: " + priority);
  task_queue.queueTask(id, params, priority);
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

  task_queue.queueTask('run_task_in_folder', params, priority);
});


/*
// Old add_task.js file will be replaced by this rest service

var async_lib = require('async');
var path = require('path');
var ProgressBar = require('progress');
var shFiles =   require('./modules/shatabang_files');

var importer = require('./task_processors/importer');

var config = require('./config_server.json');

var argv = require('minimist')(process.argv.slice(2));

if (argv._.length < 1) {
  console.log('Must give action name as parameter');
  process.exit(1);
}

var bar;
var action;
var sourceDir = config.storageDir;

if(argv._[0] === 'create_image_finger') {
  action = function(elem, cb) {
    task_queue.queueTask('create_image_finger', { title: elem, file: elem});
    cb();
  };
  sourceDir = path.join(config.cacheDir, '1920');
} else if(argv._[0] === 'import') {
  sourceDir = path.join(config.storageDir, 'upload');
  action = function(elem, cb) {
    importer(path.join(sourceDir, elem), config.storageDir).then(cb, cb);
  };
} else if(argv._[0] === 'find_faces') {
  minTwoParams();

  var subPath = ""+argv._[1];
  sourceDir = path.join(config.storageDir, subPath);
  action = function(elem, cb) {
    var filePath = path.join(subPath, elem);
    console.log('find_faces', { title: elem, file: filePath});
    task_queue.queueTask('find_faces', { title: elem, file: filePath});
    cb();
  };
} else if(argv._[0] === 'resize_images') {
  minTwoParams();

  sourceDir = path.join(config.storageDir, ""+argv._[1]);
  task_queue.queueTask('resize_images_in_folder', { title: sourceDir, dir: sourceDir});

  return done();
} else if(argv._[0] === 'update_directory') {
  minTwoParams();

  var directory = ""+argv._[1];
  task_queue.queueTask('update_directory_list', { title: directory, dir: directory});

  return done();
} else {
  console.log('Unknown action: ' + argv._[0]);
  process.exit(1);
}

console.log("Reading dir: " + sourceDir);

var main = function() {

  shFiles.listMediaFiles(sourceDir, function(error, filesList) {
    if (error) {
      if (error.code === 'ENOENT') {
        console.error('Error! Could not find the given source folder: ', sourceDir);
      } else {
        throw error;
      }
      process.exit(2);
    }

    console.log(filesList.length);
    bar = new ProgressBar('[:bar] :percent (:current/:total) :etas', { total: filesList.length });

    var relativeFilesList = filesList.map(function(item) {
      return path.relative(sourceDir, item);
    });

    var queue = async_lib.queue(function(elem, callback) {
      action(elem, function() {
        bar.tick();
        callback();
      });
    }, 4);
    queue.push(relativeFilesList);

    queue.drain = function() {
        console.log('All items have been processed');
        done();
    };

  });
};

function done() {
  console.log("Disconnecting queue");
  setTimeout(function() {
    task_queue.disconnect();
  }, 5000);
}

function minTwoParams() {
  if (argv._.length < 2) {
    console.log('Must give folder as second parameter');
    process.exit(1);
  }
}

main();

*/

module.exports = router;
