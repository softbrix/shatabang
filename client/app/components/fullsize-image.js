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
    this._imgResize();
    this._screenResize();
    window.addEventListener("resize", this._screenResize.bind(this));
  },
  willDestroyElement() {
    this._super(...arguments);
    window.removeEventListener("resize", this._screenResize);
  },
  _screenResize: function() {
    var size = getScreenSize();
    this.set('screenSize', {w: size.width, h: size.height});
  },
  _imgResize: function() {
    getImgSize(this.get('imgSrc'), function(size) {
      this.set('imgSize', {w: size.width, h: size.height});
    }.bind(this));
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
  }),
  mediaChanged: Ember.observer('media', function(sender, key, value, rev) {
    // Executes whenever the "value" property changes
    // See the addObserver method for more information about the callback arguments
    console.log(sender, key, value, rev);
    this._imgResize();
  })
});
