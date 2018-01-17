import Component from '@ember/component';
import EmberObject from '@ember/object';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Ember from 'ember';

const BLOCK_WIDTH = 180;
const MAX_DAYS = 366;

const MediaNotFound = EmberObject.extend({
  notFound: true,
  isFuture: false
});

function pixelToDay(pxl) {
  return Math.floor(pxl / BLOCK_WIDTH);
}
function dayToPixel(day) {
  return day * BLOCK_WIDTH;
}

let scrollListener = function(ctx, callback) {
  var lastScrollX = 0;
  var onScroll = function() {
    var newScroll = window.scrollX;
    if (Math.abs(newScroll - lastScrollX) > BLOCK_WIDTH) {
      lastScrollX = newScroll;
      callback.bind(ctx)(newScroll);
    }
  };

  document.addEventListener('touchmove', onScroll);
  window.addEventListener('scroll', onScroll);

  return function() {
    window.addEventListener('scroll', onScroll);
    document.addEventListener('touchmove', onScroll);
  };
};

export default Component.extend({
  mediaLoader: service('media-list-loader'),
  mediaList: [],
  id: computed('year', function() {
    return "row_"  + this.get('year');
  }),

  init() {
    this._super(...arguments);
    this.set('mediaList', []);
    this.unregisterScrollListener = scrollListener(this, this.actions.updateMediaContent);
    this.get('mediaLoader').fullyLoadedPromise().then(() => {
      this.actions.updateMediaContent.bind(this)(window.scrollX);
    });
  },
  willDestroyElement() {
    this.unregisterScrollListener();
    this._super(...arguments);
  },
  getDateFromDay(day) {
    let d = new Date(this.get('year'), 0, 1);
    d.setDate(d.getDate() + day);
    return d;
  },
  actions : {
    mediaClicked(activeMedia) {
      this.set('activeMedia', activeMedia);
    },
    updateMediaContent(scrollX) {
      const LOAD_BUFFER = 2;
      let from = pixelToDay(scrollX) - LOAD_BUFFER,
      to = pixelToDay(scrollX + window.innerWidth) + LOAD_BUFFER;

      if(from < 0) {
        from = 0;
      }
      if(to > MAX_DAYS) {
        to = MAX_DAYS;
      }

      var it = this.get('mediaLoader.tree').leafIterator();
      var now = new Date();
      var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime();

      this.get('mediaList').clear();
      for(var d = from; d < to; ++d) {
        var date = this.getDateFromDay(d);
        it.gotoPath([date.getFullYear(), date.getMonth() + 1, date.getDate()]);
        let x = dayToPixel(d);

        var obj;
        if(it.getPath() === undefined) {
          let isFuture = date.getTime() > tomorrow;
          obj = MediaNotFound.create({isFuture: isFuture});
        } else {
          if(it.hasPrev()) {
            obj = it.prev();
          } else if (it.hasNext()){
            obj = it.next();
          }
          obj.path = it.getPath();
        }

        if(obj.leftCss === undefined) {
          obj['leftCss'] = Ember.String.htmlSafe('left:' + x + 'px');
        }
        this.get('mediaList').pushObject(obj);
      }
    }
  },
});
