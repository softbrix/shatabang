import $ from 'jquery';

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import Ember from 'ember';

const Logger = Ember.Logger;

export default Component.extend({
  activeMedia: undefined,
  mediaLoader: service('media-list-loader'),
  fullscreenService: service('fullscreen'),
  didUpdateAttrs() {
    var a = this.get('activeMedia');
    if(a && this.get('iterator') === undefined) {
      var it = this.get('mediaLoader.tree').leafIterator();
      it.gotoPath(a.path);
      this.set('iterator', it);
      this._preloadImages(it);

      var handleKeyMethd = this._handleKey.bind(this);
      window.addEventListener("keydown", handleKeyMethd);
      this._resetHandleKeyEventMthd = function() {
        window.removeEventListener("keydown", handleKeyMethd);
      };
    }
  },
  actions: {
    resetActiveMedia: function() {
      // Go back to gallery
      this.set('activeMedia', undefined);
      this.set('iterator', undefined);
      this._resetHandleKeyEventMthd();
      if(this.get('fullscreenService.isFullscreen')) {
        this.get('fullscreenService').closeFullscreen();
      }
    },
    moveRight: function(event) {
      if(event) {
        event.preventDefault();
      }
      var it = this.get('iterator');
      if(it.hasPrev()) {
        var prev = it.prev();
        if(prev === this.get('activeMedia')) {
          prev = it.prev();
        }
        this._preloadImages(it.getPath());
        this.set('activeMedia', prev);
      }
    },
    moveLeft: function(event) {
      if(event) {
        event.preventDefault();
      }
      var it = this.get('iterator');
      if(it.hasNext()) {
        var next = it.next();
        if(next === this.get('activeMedia')) {
          next = it.next();
        }
        this._preloadImages(it.getPath());
        this.set('activeMedia', next);
      }
    },
    toggleInteractive: function(event) {
      if(!event.defaultPrevented) {
        $("#interactiveOverlay").toggle();
      }
    }
  },
  _preloadImages: function(path) {
    var it = this.get('mediaLoader.tree').leafIterator();
    it.gotoPath(path);
    if(it.hasNext()) {
      this._loadBigImage(it.next());
      it.prev();
    }
    if(it.hasPrev()) {
      this._loadBigImage(it.prev());
      it.next();
    }
  },
  _loadBigImage: function(media) {
    if(media === undefined) {
      return;
    }
    var curImg = new Image();
    curImg.src = media.bigMedia;
  },
  _handleKey: function(event) {
    if(event.key === "ArrowLeft" || event.keyCode === 37) {
      this.actions.moveLeft.apply(this);
    } else if(event.key === "ArrowRight" || event.keyCode === 39) {
      this.actions.moveRight.apply(this);
    } else if(event.key === "Escape" || event.keyCode === 27) {
      this.actions.resetActiveMedia.apply(this);
    } else {
      Logger.debug('unknown key', event.key,event.keyCode);
    }
  }
});
