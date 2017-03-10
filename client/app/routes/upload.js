/* global Dropzone */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin).extend({
  /*setupController: function() {
      var defaultBg = '#337ab7';
      var last;

      var preventNavigation = function (e) {
        var confirmationMessage = 'Uploads going on. Are you sure you want to leave this page?';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
      };

      Dropzone.options.uploadForm = {
        //paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 5000, // MB
        maxFiles : 9999,
        init: function() {
          var totalFileSize = 0;

          this.on("addedfile", function(file) {
            console.log("Dropzone added file.");
            totalFileSize += file.size;
          });
          this.on("totaluploadprogress", function(progress, totalBytes, totalSent) {

            if(last === undefined) {
              last = {
                time : Date.now(),
                progress: progress,
                totalSent: totalSent,
                totalBytes: totalBytes
              };
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

            var elem = Ember.$('#upload_btn');

            var timeLeft = "";

            //var deltaProgress = progress - last.progress;
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
            window.removeEventListener('beforeunload', preventNavigation, false);
            var elem = Ember.$('#upload_btn');
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
  }*/
});
