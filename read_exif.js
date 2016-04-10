var mediaInfo = require('./modules/media_info');

if(process.argv.length < 3) {
    console.log('Must give source and destination dirs as parameters');
    process.exit(1);
}

var sourceFile = process.argv[2];

var main = function() {
  mediaInfo.readMediaInfo(sourceFile).then(function( data){ console.log(data); });
  //mediaInfo.getTags(sourceFile);

  // Testcase for adding, reading and removing tags
  /*mediaInfo.addTag(sourceFile, "Student").then(function() {
  mediaInfo.addTag(sourceFile, "Student1").then(function() {
    mediaInfo.removeTag(sourceFile, "Monkey").then(function() {
      mediaInfo.getTags(sourceFile).then(console.log, console.log)
      mediaInfo.removeTag(sourceFile, "Student1").then(function() {
        mediaInfo.readMediaInfo(sourceFile).then(console.log);
      }, console.log);
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

main();
