import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

// Including leap year
const MAX_DAYS = 366;
const BLOCK_WIDTH = 180;
const LEFT_MARGIN = 36;

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

  if (!isLeapYear(date) && date.getMonth() > 1) {
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
  firstLoad: true,
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

    // Get todays day number
    this.today = dateToDay(new Date());
    //console.log('Day of year: ' + this.today);
    this.todayX = this.today * BLOCK_WIDTH;

    this.firstLoad = true;
  },

  didRender() {
    this._super(...arguments);
    if(this.firstLoad) {
      this.firstLoad = false;
      this.actions.scrollToToday.bind(this)();
    }
  },
  willDestroyElement() {
    this._super(...arguments);
  },

  actions: {
    scrollToToday() {
      var offsetRight = window.innerWidth - BLOCK_WIDTH - LEFT_MARGIN;
      if(this.todayX > offsetRight) {
        var scrollX = this.todayX - offsetRight;
        window.scrollTo(scrollX, 0);
      }
      console.log('Scroll today');
    },
    scrollToStart() {
      window.scrollTo(0, 0);
    },
    scrollToEnd() {
      window.scrollTo(dayToPixel(MAX_DAYS), 0);
    }
  },
  years: computed('mediaLoader', function() {
    return this.get('mediaLoader.folders');
  }),
});
