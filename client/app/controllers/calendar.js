import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

const BLOCK_WIDTH = 200;

export default Controller.extend({
  session: service('session'),
  mediaLoader: service('media-list-loader'),

  init() {
    this._super(...arguments);
    // Only init if we are authenticated...
    if (this.get('session.isAuthenticated')) {
      this.get('mediaLoader').fullyLoadedPromise().then(() => {
        var tree = this.get('mediaLoader.tree');
        console.log(this.get('mediaLoader.folders'));
      });
    }
  }
  /*,

  pixelToDate(pxl) {
    return Math.floor(pxl / BLOCK_WIDTH) + 1;
  },
  dateToPixel(date) {
    return this.dateToDay(date) * BLOCK_WIDTH;
  },
  dateToDay(date) {
    var start = new Date(date.getFullYear(), 0, 0);
    var diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);

    if (!this.isLeapYear(date) && date.getMonth() > 1) {
      // Skip 29:th feb if no leap year
      day += 1;
    }
    return day;
  },
  isLeapYear(date) {
    let year = date.getFullYear();
    if(year % 4 === 0) {
      if(year % 100 === 0) {
        return year % 400 !== 0;
      }
      return true;
    }
    return false;
  }*/
});
