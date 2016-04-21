"use strict";

var processors = [
    require('./task_processors/index_media'),
    require('./task_processors/update_directory_list'),
    require('./task_processors/resize_image')
  ];

var config = require('./config_server.json');

processors.forEach(function(processor) {
  processor.init(config);
});

console.log("Running task processor...");


// TODO: Scan import folder every five minutes
