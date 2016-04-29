"use strict";
var kue = require('kue');

var processors = [
    require('./task_processors/create_image_finger'),
    require('./task_processors/index_media'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/resize_image')
  ];

var config = require('./config_server.json');

processors.forEach(function(processor) {
  processor.init(config);
});

kue.app.listen(3001);

console.log("Running task processor...");
console.log("Kue web interface on port 3001");


// TODO: Scan import folder every five minutes
