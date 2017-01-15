var imageWidth = 300;
var imagesPWidth = Math.ceil($('body').width() / imageWidth);
imagesPWidth = Math.max(4, imagesPWidth); // At least 4 images in with
var zoomMultiplicator = 2;

var uploadInit = true;
var toggleImport = function() {
  if(uploadInit) {
    initUploadForm();
    uploadInit = !uploadInit;
  }
  $('#import_form').toggle();
};

var setImgWidth = function() {
  var elem = findElementAtScrollTop($('#gallery'));
  if(elem === undefined) {
    return;
  }

  imagesPWidth = Math.ceil(imagesPWidth);
  var ratio = 100/imagesPWidth;
  var el = $('.shImage');
  el.css('width',  ratio + '%');
  var width = el.width();
  $('.shImage').css('height', (200 * (width/300)) + 'px');

  scrollToElement(elem);
};

function toggleCalendar() {
  if ( $( "#calendar-wrapper .datepicker" ).length === 0) {
    $('#calendar-wrapper .calendar-bootstrap').datepicker({
      endDate: "0d",
      maxViewMode: 2,
      calendarWeeks: true,
      todayBtn: "linked",
      todayHighlight: true
    }).on('changeDate', function(e) {
      var d = e.date;
      var year = d.getFullYear(); // 2016
      var month = d.getMonth() + 1; // 0 - 11
      var day = d.getDate(); // 1 - 31

      var searchDate = new Date(year, month, day, 0, 0, 0, 0);

      // "2016/03/14/222624.jpg"
      var fileNameRegexp = /^([\d]{4}).?(\d{2}).?(\d{2}).?(\d{2})(\d{2})(\d{2})/;

      // a list of images
      var timeStampList = _.map(imageHolder[year].images, function(fileName) {
        var result = fileNameRegexp.exec(fileName);
        if(result === undefined || result === null) {
          console.log(fileName);
          return new Date();
        }
        return new Date(result[1], result[2], result[3], result[4], result[5], result[6]);
      });

      timeStampList = _.sortBy(timeStampList, function(date) { return date.getTime(); });

      var arraySize = imageHolder[year].images.length;
      var result = arraySize - _.sortedIndex(timeStampList, searchDate) - 1;

      console.log(year, month, day);
      console.log(result, imageHolder[year].images.length);


      if(result < 0) {
        result = 0;
      }
      console.log(imageHolder[year].images[result]);
      imageHolder[year].ptr = result;
      loadFromYear(year);
    });
  }
  $('#calendar-wrapper').toggle();
}

function zoomIn() {
  if(imagesPWidth > 0) {
    imagesPWidth /= zoomMultiplicator;
    setImgWidth();

  }
}

function zoomOut() {
  if(imagesPWidth < 1000) {
    imagesPWidth *= zoomMultiplicator;
    setImgWidth();
    // TODO: Move this into its own object
    window.scrollCheck();
  }
}

function findElementAtScrollTop(parentElemet) {
  var elem, minDistance = Number.MAX_VALUE;
   $.each(parentElemet.children(), function(idx, child) {
     var pos = $(child).position().top;
     var distance = Math.abs(pos - window.scrollY);
     if(distance < minDistance) {
       elem = child;
       minDistance = distance;
     }
   });
   return elem;
}

function scrollToElement(elem) {
  var newTop = $(elem).position().top;
  window.scrollTo(0, newTop);
}

function enableFancyboxOnImages() {
  $(".fancybox:not(.isVideo)").fancybox({
      padding : 0
      /*,
      openEffect	: 'elastic',
      closeEffect	: 'elastic',*/
  });

  $(".fancybox.isVideo").fancybox({
      padding : 0,
      arrows : false,
      iframe: {
        scrolling : 'none',
        preload   : false
      }
  });
}

function updateSlctCnt() {
  // Update select count
  $('#selectCnt').text($("#gallery .selected").length);
}

function getSelectedImages() {
  var a = [];
  $("#gallery .selected").each(function(index, element) {
      a.push(element);
  });
  return a;
}

function loaded() {
  setImgWidth();
  enableFancyboxOnImages();
}

  function appendStr(imgThumb, imgBig, reference, isVideo) {
    var openIframe = "", classes = "", icon = "";
    if(isVideo) {
      openIframe = 'data-fancybox-type="iframe"';
      classes = ' isVideo';
      icon = '<i class="fa fa-youtube-play" style="position: absolute; z-index: 5; margin: 0 3px"></i>'
    }
    return '<a href="'+imgBig+'" data-ref="'+reference+'" '+openIframe +' target="_blank" '+
           'class="shImage fancybox'+classes+'" rel="gallery1">'+
           icon +
           '<img src="'+imgThumb+'" alt="'+imgThumb+'" /></a>';
  }


  function loadDuplicates() {
    axios.get('./api/duplicates/list').then(function(response) {
      if(response.status === 200 && response.data) {
        var list = response.data;
        if(list.length === 0) {
          $("#wrapper").html('<h3 style="text-align: center"> --- No Duplicates --- </h3>');
          return ;
        }
        console.log(list);
        var container = $('<div></div>').addClass('duplicatesList');
        $("#wrapper").append(container);
        list.forEach(function(item) {
          var row = $('<div></div>');
          row.innerHtml = item.key;
          container.append(row);
          item.items.forEach(function(img) {
              row.append(generateImageElement(img));
          });
        });
      }
    });
  }


  $(function() {
    $(".fancyboxLink").fancybox();

    var viewMode = true;

    var clickHandler = function(event) {
      event.stopPropagation();
      event.preventDefault();
      console.log(event);
      $( this ).toggleClass('selected');

      updateSlctCnt();
    };

    $("[name='viewMode']").bootstrapSwitch({
      onSwitchChange : function(event, newViewMode) {
        viewMode = newViewMode;
        if (newViewMode) {
          $("body").removeClass('editMode');
          $(".shImage").addClass('fancybox');
          $("#gallery").off("click", ".shImage", clickHandler);
          $("#selectedHeader").hide();
          $("#findDupliBtn").hide();
          $("#gallery").show();
        } else {
          $("body").addClass('editMode');
          $(".shImage").removeClass('fancybox');
          $("#gallery").on("click", ".shImage", clickHandler);
          $("#selectedHeader").show();
          $("#findDupliBtn").show();
        }
      }
    });
    var clearSelect = function() {
      $(".shImage").removeClass('selected'); updateSlctCnt();
    }
    $('#clrSlct').click(function(){ clearSelect(); });
    $('#allSlct').click(function(){ $(".shImage").addClass('selected'); updateSlctCnt(); });
    $('#invSlct').click(function(){
      $(".shImage.selected").addClass('oldSelected').removeClass('selected');
      $(".shImage:not(.oldSelected)").addClass('selected');
      $(".shImage.oldSelected").removeClass('oldSelected');
      updateSlctCnt();
    });

    $('#delImg').click(function() {
      var ids = [];
      $.each(getSelectedImages(), function(id, el) {
        ids.push($(el).data('ref'));
        $(el).remove();
      });
      console.log(ids);
      deleteImages(ids);
      clearSelect();
    });

    $('#findDupliBtn').click(function() {
      $("#gallery").hide();
      loadDuplicates();
    });

    window.onresize = setImgWidth;
  });


  // Init upload form
  function initUploadForm() {
    var defaultBg = '#337ab7';
    var last = undefined;

    var preventNavigation = function (e) {
      var confirmationMessage = 'Uploads going on. Are you sure you want to leave this page?';

      (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    };

    Dropzone.options.uploadForm = {
      //paramName: "file", // The name that will be used to transfer the file
      maxFilesize: 2000, // MB
      maxFiles : 999,
      init: function() {
        this.on("addedfile", function(file) {
          console.log("Dropzone added file.");
        });
        this.on("totaluploadprogress", function(progress, totalBytes, totalSent) {
          console.log('Progress', progress, totalBytes, totalSent);

          if(last === undefined) {
            last = {
              time : Date.now(),
              progress: progress,
              totalSent: totalSent,
              totalBytes: totalBytes
            }
            return;
          }

          if(totalSent === 0) {
            last = undefined;
            return;
          }

          var deltaTime = (Date.now() - last.time) / 1000;

          if(deltaTime < 0.1) {
            return;
          }

          var elem = $('#upload_btn');

          var timeLeft = "";

          var deltaProgress = progress - last.progress;
          var deltaSent = totalSent - last.totalSent;

          var speed = deltaSent / deltaTime;

          timeLeft = (totalBytes - totalSent) / speed;
          timeLeft = Math.round(timeLeft);

          last.time = Date.now();
          last.progress = progress;
          last.totalSent = totalSent;
          last.totalBytes = totalBytes;

          var metric = "";
          if(speed > 1024) {
            speed /= 1024;
            metric = "K";
          }
          if(speed > 1024) {
            speed /= 1024;
            metric = "M";
          }
          speed = Math.round(speed*10)/10;

          console.log(speed, metric+'B/s', deltaSent, deltaTime);

          var txt = Math.round(progress) + '%';
          txt += '/ ' + timeLeft + 's ';
          txt += '/ ' + speed + metric + 'B/s';
          elem.html(txt);

          var lower = progress;
          var upper = Math.min(100, lower + 2);
          elem.css('background', 'linear-gradient(90deg, '+defaultBg+' '+lower+'%, #FFFFFF '+upper+'%)');
          elem.addClass('uploading');
        });
        this.on("sending", function(file, xhr, formData) {
          // Will send the filesize along with the file as POST data.
          formData.append("filesize", file.size);
          window.addEventListener('beforeunload', preventNavigation, false);
        });
        this.on("success", function(file) {
          var dropzone = this;
          // Remove the file once it is done
          setTimeout(function() {
            dropzone.removeFile(file);
          }, 4000);
        });
        this.on("complete", function() {
          console.log('complete');
        });
        this.on("queuecomplete", function() {
          console.log('queuecomplete');
          window.removeEventListener('beforeunload', preventNavigation, false);
          var elem = $('#upload_btn');
          elem.html('Upload complete').css('background', 'green');
          elem.removeClass('uploading');
          setTimeout(function() {
              // Reset the upload button
              elem.html('Upload').css('background', defaultBg);
          }, 4000);
          last = undefined;
        });
      }
    };
    $("form#uploadForm").dropzone();
  }
