import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    toggleFullscreen: function() {
      alert('Är du full');

      /*if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }*/
    }
  }
});
