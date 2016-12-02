"use strict"
/* global _, axios, window */
/** This is the shatabang code */


function deleteImages(imageList) {
  axios.post('./api/images/delete', imageList).then(function(response) {
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
  axios.get('./api/account').then(function(response) {
    if(response.status === 200 && response.data.user) {
      $('#username').html(response.data.user.displayName);
      $('#header').show();
    } else {
      axios.get('./api/auth/list').then(function(response) {
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
  var imageTree = {};
  var imageList = [];
  var folders;
  var activeFolder;

  var importImages = function(images) {
    // "2016/03/14/222624.jpg"
    var fileNameRegexp = /^([\d]{4}).?(\d{2}).?(\d{2}).?(\d{2})(\d{2})(\d{2})/;

    images.forEach(function(fileName) {
      var result = fileNameRegexp.exec(fileName);
      var date = new Date();
      if(result !== undefined && result !== null) {
        date = new Date(result[1], result[2]-1, result[3], result[4], result[5], result[6]);
      } else {
          console.log('Unknown date or file type' ,fileName);
      }
      var yearObj = imageTree[date.getFullYear()] = imageTree[date.getFullYear()] || {parent: imageTree};
      // Month is numbered from 0 - 11. Compensate with +1
      var monthObj = yearObj[date.getMonth()+1] = yearObj[date.getMonth()+1] || {parent:  yearObj};
      var dayObj = monthObj[date.getDate()] = monthObj[date.getDate()] || {parent:  monthObj};
      var imgList = dayObj.list = dayObj.list || [];
      var newObj = {date: date, img: fileName};
      if(imgList.indexOf(newObj) === -1) {
          imgList.push(newObj);
      }
    });
  };

  var loadImageList = function(folder) {
    return axios.get('./images/info/'+folder+'/media.lst')
      .then(function (response) {
        var images = response.data.split(',');
        //images = images/*.slice(-200)*/.reverse();
        console.log(images);

        if(folder !== 'import') {
          importImages(images);
        }

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

  var ptr =  {
    start: 0, end: 0, loaded: 0
  };
  var loadImages = window.loadImages = function(images, limit) {
    limit = limit ? limit : Number.max_value;
    // Now we load forward
    for(var i = ptr.end, j = 0; i < images.length && j < limit; ++i, ++j) {
      if (images.hasOwnProperty(i)) {
        elem.append(generateImageElement(images[i]));
        ++ptr.loaded;
      }
    }
    ptr.end = i;
  };

  window.loadFromYear = function(year) {
    activeFolder = _.indexOf(folders, "" + year);
    clearImageList();
    loadImages(imageHolder[year], 100);
    loaded();
  };

  var loadMoreImages = function() {
    if(imageList === undefined || imageList.length === 0) {
      createImageListFromTree(imageTree /*  asc/desc */);
    }
    loadImages(imageList, 300);
    loaded();
  };

  var clearImageList = window.clearImageList = function() {
    elem.html('');
  };

  function createImageListFromTree(imageTree) {
    imageList = [];
    folders.forEach(function(year) {
      var yearObj = imageTree[year];
      if(yearObj !== undefined) {
        yearObj.ptr = imageList.length;
        _.range(12, 0, -1).forEach(function(month) {
          var monthObj = yearObj[month];
          if(monthObj !== undefined) {
            monthObj.ptr = imageList.length;
            _.range(31, 0, -1).forEach(function(day) {
              var dayObj = monthObj[day];
              if(dayObj !== undefined) {
                dayObj.ptr = imageList.length;
                var sortedList = _.sortBy(dayObj.list, 'date').reverse();
                sortedList.forEach(function(el) {
                  imageList.push(el.img);
                });
              }
            });
          }
        });
      }
    });
  }


  axios.get('./api/dirs/list').then(function(response) {
    folders = response.data;
    if(folders.length === 0) {
      loaded();
      return;
    }

    // Sort folders descending
    folders = folders.sort(function(a,b){return b-a;});
    clearImageList();
    activeFolder = 0;
    // This loads the first years image list
    loadImageList(folders[0])
      .then(function() {
        loadMoreImages();
        // Load the rest of the images
        folders.slice(1).forEach(function(folder) {
          loadImageList(folder).then(function() {
            imageList = undefined;
            if(ptr.loaded < 1000) {
              loadMoreImages();
            }
          });
        });
      })
      .catch(function (response) {
        console.log(response);
      });
  });

  setInterval(function() {
    axios.get('./api/upload/imported')
      .then(function (response) {
        var images = response.data;
        if(images !== undefined && images.length > 0) {
          console.log('imported', images);
          importImages(images);
          imageList = undefined;
          clearImageList();
          ptr.end = ptr.start;
          // TODO: Should only update current position
          loadMoreImages();
        }
      });
  }, 10 * 1000);
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
