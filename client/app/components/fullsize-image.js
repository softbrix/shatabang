import Ember from 'ember';

function getImgSize(imgSrc, callback) {
    var newImg = new Image();

    newImg.onload = function () {
        if (callback !== undefined) {
            callback({width: newImg.width, height: newImg.height});
        }
    };

    newImg.src = imgSrc;
}

function getScreenSize() {
    var w = window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;

    var h = window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
  return {width: w, height: h};
}
export default Ember.Component.extend({
  tagName: 'img',
  attributeBindings: ['imgSrc:src', 'imgAlt:alt'],
  classNames: ['galleryImage', 'fullsizeMedia'],
  classNameBindings: ['isWider:fullWidth:fullHeight'],

  imgSize: {w: 1, h: 1},
  screenSize: {w: 1, h: 1},

  init: function() {
    this._super(...arguments);
    getImgSize(this.get('imgSrc'), function(size) {
      this.set('imgSize', {w: size.width, h: size.height});
    }.bind(this));
    this.screenResize();
    window.addEventListener("resize", this.screenResize.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    window.removeEventListener("resize", this.screenResize);
  },
  screenResize: function() {
    var size = getScreenSize();
    this.set('screenSize', {w: size.width, h: size.height});
  },

  imgSrc: Ember.computed('media', function() {
    return  this.get('media.bigMedia');
  }),
  imgAlt: Ember.computed('media', function() {
    return this.get('media.date') + ' - '+ this.get('media.img');
  }),
  isWider: Ember.computed('imgSize', 'screenSize', function() {
    var iSize = this.get('imgSize'),
        sSize = this.get('screenSize');

    var ratio = ((iSize.w / sSize.w) / (iSize.h / sSize.h));
    return ratio > 1;
  })
});