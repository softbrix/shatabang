import Component from '@ember/component';

export default Component.extend({
  actions: {
    toggleFullscreen: function() {
      if(this.get('isFullscreen')) {
        if(cancelFullScreen()) {
          this.set('isFullscreen', false);
        }
      } else {
        if(requestFullscreen()) {
          this.set('isFullscreen', true);
        }
      }
    }
  },
  isFullscreen: false
});

function cancelFullScreen() {
  if (document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if (document.msCancelFullscreen) {
    document.msCancelFullScreen();
  } if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else {
    return false;
  }
  return true;
}

function requestFullscreen() {
  let elem = document.body;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else {
    return false;
  }
  return true;
}
