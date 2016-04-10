var mediaInfo = require('./modules/media_info');
var shFiles = require('./modules/shatabang_files');
var iptc = require('node-iptc');
var fs = require('fs-extra');
var Q = require('q');
var path = require('path');

if(process.argv.length < 3) {
    console.log('Must give source and destination dirs as parameters');
    process.exit(1);
}

var sourceDir = process.argv[2];

var main = function() {

  shFiles.listMediaFiles(sourceDir, function(error, filesList) {
    filesToProcess = filesList;
    processNext();
  });
  //mediaInfo.getTags(sourceFile);
  /*mediaInfo.addTag(sourceFile, "Student").then(function() {
    mediaInfo.removeTag(sourceFile, "Monkey").then(function() {
      mediaInfo.readMediaInfo(sourceFile).then(console.log, console.log)
      mediaInfo.removeTag(sourceFile, "Student").then(function() {
        mediaInfo.readMediaInfo(sourceFile).then(console.log);
      }, console.log);
    }, console.log);
  }, console.log);*/
  /*mediaInfo.addTag(sourceFile, "Student").then(function() {
    mediaInfo.removeTag(sourceFile, "Student").then(
      function() {
        //mediaInfo.readMediaInfo(sourceFile).then(console.log);
      }, console.log);
  }, console.log);*/
  //mediaInfo.getTags(sourceFile);
};

var processNext = function(files) {
  setTimeout(function() {
    if(filesToProcess.length > 0) {
      processFile(filesToProcess.pop());
    }
  }, 0);
};

var processFile = function(item) {
  read_iptc_1(item).then(function(data) {
    console.log(path.basename(item), data);
  }, console.log).then(processNext);
};

var read_iptc = function(sourceFile) {
  var deffered = Q.defer();
  fs.readFile(sourceFile, function(err, data) {
    if (err) { deffered.reject(err); }
    var iptc_data = iptc(data);
    deffered.resolve(iptc_data);
  });
  return deffered.promise;
};

var read_iptc_1 = mediaInfo.getTags;

main();
