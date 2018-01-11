/* global window */
import $ from 'jquery';

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Ember from 'ember';

const Logger = Ember.Logger;

export default Component.extend({
  classNames: ['gallery'],
  scrollAlmostDown: service('scroll-almost-down'),
  mediaLoader: service('media-list-loader'),
  fullscreenService: service('fullscreen'),
  imageWidthService: service('image-width'),
  mediaCount: 64,
  activeMedia: undefined,
  mediaList: [],
  BIG_PATH: './images/1920/',

  init() {
    this._super(...arguments);
    this.get('imageWidthService').reset();
  },
  didInsertElement() {
    this._super(...arguments);

    var that = this;
    this.get('mediaLoader').loadedPromise().then(function(tree) {
      var it = moveIteratorLast(tree.leafIterator());
      var loadMedia = function() {
        return buildModel(that, that.get('mediaCount'), it);
      };
      // Initial load
      loadMedia();

      that.get('mediaLoader').fullyLoadedPromise().then(function() {

        // Check if we have more to load or if we display to few
        if(that.get('scrollAlmostDown').scrollCheck() ||
           that.get('mediaList').length < that.get('mediaCount')) {
          loadMedia();
        }
        var deregisterer = that.get('scrollAlmostDown').registerListener(function() {
          var loadAndCheckSize = function() {
            loadMedia();
            setTimeout(function() {
              if(that.get('scrollAlmostDown').scrollCheck()) {
                loadAndCheckSize();
              }
            }, 200);
          };
          loadAndCheckSize();
        });

        that.set('windowscrollCleanup', deregisterer);
      });
    });
  },
  willDestroyElement() {
    this._super(...arguments);
    Logger.debug('deactivate index');
    var cleanup = this.get('windowscrollCleanup');
    if(cleanup !== undefined) {
      cleanup();
    }
  },
  actions: {
    mediaClicked: function(a) {
      // Show a single media in overlay
      this.set('activeMedia', a);

      var it = this.get('mediaLoader.tree').leafIterator();
      it.gotoPath(a.path);
      this.set('activeMediaIterator', it);
      this._preloadImages(it);

      $(window).on('keydown', this._handleKey.bind(this));
    },
    resetActiveMedia: function() {
      // Go back to gallery
      this.set('activeMedia', undefined);
      $(window).off('keydown');
      if(this.get('fullscreenService.isFullscreen')) {
        this.get('fullscreenService').closeFullscreen();
      }
    },
    moveRight: function(event) {
      if(event) {
        event.preventDefault();
      }
      var it = this.get('activeMediaIterator');
      if(it.hasPrev()) {
        var prev = it.prev();
        if(prev === this.get('activeMedia')) {
          prev = it.prev();
        }
        this._preloadImages(it);
        this.set('activeMedia', prev);
      }
    },
    moveLeft: function(event) {
      if(event) {
        event.preventDefault();
      }
      var it = this.get('activeMediaIterator');
      if(it.hasNext()) {
        var next = it.next();
        if(next === this.get('activeMedia')) {
          next = it.next();
        }
        this._preloadImages(it);
        this.set('activeMedia', next);
      }
    },
    toggleInteractive: function(event) {
      if(!event.defaultPrevented) {
        $("#interactiveOverlay").toggle();
      }
    }
  },
  _preloadImages: function(it) {
    var path = it.getPath();
    if(it.hasNext()) {
      this._loadBigImage(it.next());
      it.prev();
    }
    if(it.hasPrev()) {
      this._loadBigImage(it.prev());
    }
    it.gotoPath(path);
  },
  _loadBigImage: function(media) {
    if(media === undefined) {
      return;
    }
    var curImg = new Image();
    curImg.src = this.get('BIG_PATH') + media.img;
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

function moveIteratorLast(it) {
  while(it.hasNext()) {
    it.next();
  }
  return it;
}

function buildModel(that, count, it) {
  for(var i = 0; i < count && it.hasPrev(); ++i) {
    var obj = it.prev();
    obj.path = it.getPath();
    that.get('mediaList').pushObject(obj);
  }

  return i === count;
}
