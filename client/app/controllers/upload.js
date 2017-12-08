import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  addedFileEvent: computed(function() {
    var that = this;
    return function(file) {
      that.incrementProperty('totalFileSize', file.size);
      if(that.get('_speedTimer') === 0) {
        that.set('_speedTimer', Date.now());
      }
    };
  }),
  filesuccessEvent: computed(function() {
    var that = this;
    return function(file) {
      that.incrementProperty('sentFileSize', file.size);

      // Remove the file once it is done
      var dropzone = this;
      setTimeout(function() {
        dropzone.removeFile(file);
      }, 4000);
    };
  }),
  filecompleteEvent: computed(function() {
    var that = this;
    return function() {
      that.decrementProperty('currentlySending', 1);
    };
  }),
  sendingEvent: computed(function() {
    var that = this;
    return function(file, xhr, formData) {
      that.incrementProperty('currentlySending', 1);

      // Will send the filesize along with the file as POST data.
      formData.append("filesize", file.size);
      window.addEventListener('beforeunload', preventNavigation, false);
    };
  }),
  queuecompleteEvent: computed(function() {
    var that = this;
    return function() {
      window.removeEventListener('beforeunload', preventNavigation, false);
      that.set('_speedTimer', 0);
    };
  }),
  progress: function() {
    var total = this.get('totalFileSize');
    if(total === 0) {
      return 0;
    }
    return (this.get('sentFileSize') / total) * 100;
  }.property('totalFileSize', 'sentFileSize'),
  speed: function() {
    var total = this.get('sentFileSize'),
        timer = this.get('_speedTimer');
    if(total === 0 || timer === 0) {
      return 0;
    }
    var elapsedMillis = Math.floor(Date.now() - timer);
    // Result in kbs
    return Math.round(total / elapsedMillis);
  }.property('_speedTimer', 'sentFileSize'),
  currentlySending: 0,
  totalFileSize: 0,
  sentFileSize: 0,
  _speedTimer: 0
});

function preventNavigation(e) {
  // This message might not even show
  const confirmationMessage = 'Uploads going on. Are you sure you want to leave this page?';

  (e || window.event).returnValue = confirmationMessage; //Gecko + IE
  return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
}
