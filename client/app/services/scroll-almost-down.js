import Ember from 'ember';

export default Ember.Service.extend({
  registerListener: function(callback) {
    // Creates a listener for the window scoll event
    var scrollChecker = newScrollCheck(callback);
    Ember.$( window ).on('scroll', scrollChecker);
    // Return a cleanup method
    return function() {
      Ember.$( window ).off('scroll', scrollChecker);
    };
  },

  scrollCheck: internalScrollCheck
});

function internalScrollCheck(lastS) {
  if(lastS === undefined) {
    lastS = 0;
  }
  var s = Ember.$(window).scrollTop(),
  d = Ember.$(document).height(),
  c = Ember.$(window).height();

  var scrollPercent = (s / (d-c)) * 100;
  return d === c || (scrollPercent > 90 && s >= lastS);
}

/*
Create a new method for the given callback
*/
function newScrollCheck(callback) {
  var lastS = 0, lastCallback = 0;
  return function() {
    var now = new Date().getTime();
    if(now - lastCallback < 500) {
      return;
    }
    if(internalScrollCheck(lastS)) {
      lastCallback = now;
      Ember.run(callback);
    }
    lastS = Ember.$(window).scrollTop();
  };
}
