import $ from 'jquery';

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import Ember from 'ember';

const Logger = Ember.Logger;

export default Component.extend({
  activeMedia: undefined,
  reverseMove: false,
  mediaLoader: service('media-list-loader'),
  mediaModel: service('media-model'),
  fullscreenService: service('fullscreen'),
  init() {
    this._super(...arguments);
    var popStateMethd = this._onpopstate.bind(this); 
    window.addEventListener('popstate', popStateMethd);
    this._resetPopStateEvent = function() {
      window.removeEventListener("keydown", popStateMethd);
    };
  },
  didDestroyElement() {
    this._super(...arguments);
    this._resetPopStateEvent();
  },
  didUpdateAttrs() {
    var a = this.get('activeMedia');
    if(a) {
      if(this.get('iterator') === undefined) {
        var it = this.get('mediaLoader.tree').leafIterator();
        it.gotoPath(a.path);
        this.set('iterator', it);
        this._preloadImages(it);

        var handleKeyMethd = this._handleKey.bind(this);
        window.addEventListener("keydown", handleKeyMethd);
        this._resetHandleKeyEventMthd = function() {
          window.removeEventListener("keydown", handleKeyMethd);
        };
        history.pushState(a, '', '#view='+a.bigMedia);
      } else {
        history.replaceState(a, '', '#view='+a.bigMedia);
      }
    }
  },
  actions: {
    close() {
      window.history.back();
    },
    moveRight: function(event) {
      if(event) {
        event.preventDefault();
      }
      if(this.get('reverseMove')) {
        this._iterateNext()
      } else {
        this._iteratePrev();
      }
    },
    moveLeft: function(event) {
      if(event) {
        event.preventDefault();
      }
      if(this.get('reverseMove')) {
        this._iteratePrev()
      } else {
        this._iterateNext();
      }
    },
    toggleInteractive: function(event) {
      if(!event.defaultPrevented) {
        $("#interactiveOverlay").toggle();
      }
    },
    confirmDelete: function(event) {
      if(event) {
        event.preventDefault();
      }
      let confirmed = window.confirm('Do you really want to delete this media file?');
      if(confirmed) {
        let moveNext = this._iteratePrev.bind(this);
        this.get('mediaModel').deleteMedia(this.get('activeMedia.img')).then(function() {
          moveNext();
        }, Logger.error);
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
      this.actions.close.apply(this);
    } else {
      Logger.debug('unknown key', event.key,event.keyCode);
    }
  },
  _iterateNext() {
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
  _iteratePrev() {
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
  _resetActiveMedia: function() {
    // Go back to gallery
    this.set('activeMedia', undefined);
    this.set('iterator', undefined);
    this._resetHandleKeyEventMthd();
    if(this.get('fullscreenService.isFullscreen')) {
      this.get('fullscreenService').closeFullscreen();
    }
  },
  _onpopstate() {
    this._resetActiveMedia.bind(this)();
  }
});
