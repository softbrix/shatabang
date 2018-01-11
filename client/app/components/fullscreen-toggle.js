import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  fullscreenService: inject('fullscreen'),
  actions: {
    toggleFullscreen: function() {
      this.get('fullscreenService').toggleFullscreen();
    }
  },
  isFullscreen: computed('fullscreenService.isFullscreen', function() {
    return this.get('fullscreenService.isFullscreen');
  })
});
