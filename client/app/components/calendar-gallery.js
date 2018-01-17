import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Ember from 'ember';

const MAX_DAYS = 366; // Including leap day
const BLOCK_WIDTH = 180;
const LEFT_MARGIN = 36;
const DAY_MINUTES = 24 * 60;

let isLeapYear = function(date) {
  let year = date.getFullYear();
  if(year % 4 === 0) {
    if(year % 100 === 0) {
      return year % 400 !== 0;
    }
    return true;
  }
  return false;
};

function dateToDay(date) {
  var start = new Date(date.getFullYear(), 0, 0);
  var diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);

  if (!isLeapYear(date) && date.getMonth() > 2) {
    // Skip 29:th feb if no leap year
    day += 1;
  }
  return day;
}

function pixelToDay(pxl) {
  return Math.floor(pxl / BLOCK_WIDTH) + 1;
}
function dayToPixel(day) {
  return day * BLOCK_WIDTH;
}

export default Component.extend({
  mediaLoader: service('media-list-loader'),
  imageWidthService: service('image-width'),
  init() {
    this._super(...arguments);

    this.set('imageWidthService.imagesPWidth', 1);
    this.days = [];

    // Year 2000 was a leap year
    var d = new Date(2000, 0, 1);
    for(var i = 0; i < MAX_DAYS; ++i) {
      this.days.push(new Date(d.getTime()));
      d.setDate(d.getDate() + 1);
    }

    var updateTime = function() {
      var now = new Date();
      var currentDayNumber = dateToDay(now);
      // Calculate the fraction of the day with minute precission
      var timeFraction =  ((now.getHours() * 60) + now.getMinutes()) / DAY_MINUTES;
      this.set('nowX', (currentDayNumber-1 + timeFraction) * BLOCK_WIDTH);
      this.set('today', currentDayNumber);

      // Run once every minute
      var t = Ember.run.later(updateTime.bind(this), 60 * 1000);
      this.set('_updateTimer', t);
    };
    updateTime.bind(this)();
  },

  didInsertElement() {
    this._super(...arguments);
    this.actions.scrollToToday.bind(this)();
  },
  willDestroyElement() {
    this._super(...arguments);
    Ember.run.cancel(this._updateTimer);
  },

  actions: {
    scrollToToday() {
      this._scrollTo(this.nowX);
    },
    scrollToStart() {
      this._scrollTo(0, window.scrollY);
    },
    scrollToEnd() {
      this._scrollTo(dayToPixel(MAX_DAYS - 1));
    }
  },
  _scrollTo(newX) {
    var offsetRight = window.innerWidth - BLOCK_WIDTH - LEFT_MARGIN;
    var scrollX = newX > offsetRight ? newX - offsetRight : newX;
    window.scrollTo(scrollX, window.scrollY);
  },
  years: computed('mediaLoader', function() {
    return this.get('mediaLoader.folders');
  }),
});
