import Controller from '@ember/controller';

const BLOCK_WIDTH = 200;

export default Controller.extend({

  pixelToDate(pxl) {

  },
  dateToPixel(date) {
    return this.dateToDay(date) * BLOCK_WIDTH;
  },
  dateToDay(date) {
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
});
