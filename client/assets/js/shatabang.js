"use strict"
/** This is the shatabang code */


function deleteImages(imageList) {
  axios.post('/api/images/delete', imageList).then(function(response) {
    if(response.status === 200) {
      console.log(response.data);
    } else {
      console.log('Error while delete request', response.status);
      // TODO: report error
    }
  });
}
var baseUrl = "./images/";
var moveFileRegexp = /(.+)(mp4|avi|mov|mpe?g)$/gi;
var imageWidth = 300;

function generateImageElement(media) {
  var thumb = media, bigMedia, isVideo;
  if(moveFileRegexp.test(media)) {
    thumb = media.replace(moveFileRegexp, '$1jpg');
    bigMedia = "./media/" + media;
    isVideo = true;
  } else {
    bigMedia = baseUrl + '1920/' + media;
    isVideo = false;
  }
  var imgSrc = baseUrl + imageWidth + '/' +thumb;
  return appendStr(imgSrc, bigMedia, media, isVideo);
}

(function($) {
  // TODO: Display error
  axios.get('/api/account').then(function(response) {
    if(response.status === 200 && response.data.user) {
      $('#username').html(response.data.user.displayName);
      $('#header').show();
    } else {
      axios.get('/api/auth/list').then(function(response) {
        $('#loginAlternatives').show();
        var auth_list = response.data;
        if(auth_list.indexOf('admin') > -1) {
          $('#adminLoginform').show();
        }
        if(auth_list.indexOf('google') > -1) {
          $('#googleLoginBtn').show();
        }
      });
    }
  });

  var elem = $('#gallery');
  var imageHolder = window.imageHolder = {};
  var folders;
  var activeFolder;

  var loadImageList = function(folder) {
    return axios.get('/images/info/'+folder+'/media.lst')
      .then(function (response) {
        var images = response.data.split(',');
        //images = images/*.slice(-200)*/.reverse();
        console.log(images);

        imageHolder[folder] = {
          images : images,
          size : images.length,
          ptr : 0
        };
      }, function(error) {
        console.log(error);
        if(error.status === 401) {

        }
      });
  };

  var getNextYear = function() {
    if((activeFolder+1) < folders.length) {
      ++activeFolder;
      return imageHolder[folders[activeFolder]];
    }
    return undefined;
  };

  var loadImages = window.loadImages = function(folderInfo, limit) {
    if(typeof folderInfo === "undefined") {
      return;
    }

    limit = limit ? limit : Number.max_value;
    var images = folderInfo.images;
    for(var i = folderInfo.ptr, j = 0; i < folderInfo.size && j < limit; ++i, ++j) {
      if (images.hasOwnProperty(i)) {
        elem.append(generateImageElement(images[i]));
      }
    }
    folderInfo.ptr = i;
    if(folderInfo.ptr === folderInfo.size && j < limit) {
      loadImages(getNextYear(), limit - j);
    }
  };

  window.loadFromYear = function(year) {
    activeFolder = _.indexOf(folders, "" + year);
    clearImageList();
    loadImages(imageHolder[year], 100);
    loaded();
  };

  var loadMoreImages = function() {
    loadImages(imageHolder[folders[activeFolder]], 100);
    loaded();
  };

  var clearImageList = window.clearImageList = function() {
    elem.html('');
  };


  axios.get('/api/dirs/list').then(function(response) {
    folders = response.data;
    // Sort folders descending
    folders = folders.sort(function(a,b){return b-a;});
    clearImageList();
    activeFolder = 0;
    // Todo: This mix all images from different years
    loadImageList(folders[0])
      .then(loadMoreImages)
      .catch(function (response) {
        console.log(response);
      });

    folders.slice(1).forEach(function(folder) {
      loadImageList(folder);
    });
  });
  //});

  /*  var elem = document.getElementById("myvideo");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }*/
  $('#loadMoreBtn').click(loadMoreImages);

  window.scrollCheck = function scrollCheck() {
    var s = $(window).scrollTop(),
      d = $(document).height(),
      c = $(window).height();

    var scrollPercent = (s / (d-c)) * 100;
    if(d === c || scrollPercent > 90) { loadMoreImages();}
  };

  $( window ).scroll(window.scrollCheck);
})(jQuery);
