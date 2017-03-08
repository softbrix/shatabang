import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    toggleFullscreen: function(event) {

      // Find correct element to show full screen
      let elem = event.target;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }
  }
});
