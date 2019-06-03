"use strict";

const path = require('path');
const express = require('express');
const router = express.Router();
const shFiles = require('../modules/shatabang_files');
const task_queue = require('../modules/task_queue');

const request = require('request-promise');

var sourceDir, cacheDir, deletedDir, apiEndpoint;
router.initialize = function(config) {
  sourceDir = config.storageDir;
  cacheDir = config.cacheDir;
  deletedDir = config.deletedDir;
  apiEndpoint = 'https://photoslibrary.googleapis.com';
};

router.post('/delete',function(req,res){
    if(!req.body.length) {
      res.send("Missing post data").status(400);
      return;
    }

    req.body.forEach(function(reference) {
      var sourceFile = path.join(sourceDir, reference);
      var destFile = path.join(deletedDir, path.basename(reference));
      var cache300 = path.join(cacheDir, '300', reference);
      var cache1920 = path.join(cacheDir, '1920', reference);

      shFiles.moveFile(sourceFile, destFile)
        .then(console.log, function(error) {
          console.log('Error:', error);
        });
      shFiles.deleteFile(cache300);
      shFiles.deleteFile(cache1920);

      var directory = reference.split(path.sep)[0];
      task_queue.queueTask('update_directory_list', { title: directory, dir: directory});
    });

    res.send("OK").status(200);
});

router.get('/listgoo', async (req, res) => {

  var photos = [];
  try {
    let parameters = {
      pageSize: 100
    };
    let photosToLoad = req.query.l || 200;
    res.write("[");

    do {
    console.log(
      `Submitting search with parameters: ${JSON.stringify(parameters)}`);

  // Make a POST request to search the library or album
  const result =
      await request.post(apiEndpoint + '/v1/mediaItems:search', {
        headers: {'Content-Type': 'application/json'},
        json: parameters,
        auth: {'bearer': req.user.token},
      });

      // Set the pageToken for the next request.
      parameters.pageToken = result.nextPageToken;
      
      // The list of media items returned may be sparse and contain missing
      // elements. Remove all invalid elements.
      // Also remove all elements that are not images by checking its mime type.
      // Media type filters can't be applied if an album is loaded, so an extra
      // filter step is required here to ensure that only images are returned.
      const items = result && result.mediaItems ?
          result.mediaItems
              .filter(x => x)  // Filter empty or invalid items.
              // Only keep media items with an image mime type.
             // .filter(x => x.mimeType && x.mimeType.startsWith('image/'))
          : [];
          
        for (var i = 0; i < items.length - 1; i++) {
          res.write(JSON.stringify(items[i]) + ',');
        }
        
      photos = photos.concat(items);
      console.log(photos.length);
      
    } while (photos.length < photosToLoad &&
      parameters.pageToken != null);
      res.write("'']"); //array ending bracket
      res.end();
    shFiles.writeFile("./photo_data.json", JSON.stringify(photos));
  } catch(err) {
    console.log("error" , err)
    res.send(err.message)
  }
});

module.exports = router;
