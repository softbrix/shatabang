"use strict";

const path = require('path');
const express = require('express');
const router = express.Router();
const indexes = require('../common/indexes')
const shFiles = require('../common/shatabang_files');
const task_queue = require('../common/task_queue');

var  apiEndpoint;
router.initialize = function(config) {
  apiEndpoint = 'https://photoslibrary.googleapis.com';
};

router.post('/delete',function(req,res){
    if(!req.body.length) {
      res.send("Missing post data").status(400);
      return;
    }

    req.body.forEach(function(reference) {
      task_queue.queueTask('delete_media', { title: reference, media: reference}, 'high');
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
      await fetch(apiEndpoint + '/v1/mediaItems:search', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(parameters),
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
