/* global window */

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
  mediaIterator: undefined,
  mediaList: [],
  fromDate: undefined,

  init() {
    this._super(...arguments);
    this.get('imageWidthService').reset();
  },
  didInsertElement() {
    this._super(...arguments);

    var that = this;
    this.get('mediaLoader').loadedPromise().then(function(tree) {
      that.set('mediaIterator', tree.leafIteratorReverse());
      // Initial load
      that._loadMedia();

      that.get('mediaLoader').fullyLoadedPromise().then(function() {
        // Reset loaded images and load more if possible
        that.set('mediaIterator', tree.leafIteratorReverse());
        that.get('mediaList').clear();
        that._loadMedia();

        var deregisterer = that.get('scrollAlmostDown').registerListener(function() {
          var loadAndCheckSize = function() {
            that._loadMedia();
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
  didUpdateAttrs() {
    this._super(...arguments);

    var d = new Date(this.get('fromDate'));
    this.get('mediaIterator').gotoPath([d.getFullYear(), d.getMonth() + 1, d.getDate()], true);
    this.get('mediaList').clear();
    this._loadMedia();
  },
  willDestroyElement() {
    this._super(...arguments);
    Logger.debug('deactivate index');
    var cleanup = this.get('windowscrollCleanup');
    if(cleanup !== undefined) {
      cleanup();
    }
  },
  _loadMedia() {
    const it = this.get('mediaIterator');
    // TODO: This should probably be a computation like:
    // images per row  * rows per screen height   ...
    const count = this.get('mediaCount');
    for(var i = 0; i < count && it.hasPrev(); ++i) {
      var obj = it.prev();
      obj.path = it.getPath();
      this.get('mediaList').pushObject(obj);
    }

    return i === count;
  },
  actions: {
    mediaClicked: function(a) {
      // Show a single media in overlay
      this.set('activeMedia', a);
    }
  }
});
