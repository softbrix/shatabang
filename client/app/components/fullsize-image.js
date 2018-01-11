import { computed, observer } from '@ember/object';
import Component from '@ember/component';

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
export default Component.extend({
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
    this._resizeEventMthd = this._screenResize.bind(this);
    window.addEventListener("resize", this._resizeEventMthd);
  },
  willDestroyElement() {
    this._super(...arguments);
    window.removeEventListener("resize", this._resizeEventMthd);
  },
  _resizeEventMthd: undefined,  // Used for binding this and as event listener
  _screenResize: function() {
    var size = getScreenSize();
    this.set('screenSize', {w: size.width, h: size.height});
  },
  _imgResize: function() {
    getImgSize(this.get('imgSrc'), function(size) {
      this.set('imgSize', {w: size.width, h: size.height});
    }.bind(this));
  },
  imgSrc: computed('media', function() {
    return  this.get('media.bigMedia');
  }),
  imgAlt: computed('media', function() {
    return this.get('media.date') + ' - '+ this.get('media.img');
  }),
  isWider: computed('imgSize', 'screenSize', function() {
    var iSize = this.get('imgSize'),
        sSize = this.get('screenSize');

    var ratio = ((iSize.w / sSize.w) / (iSize.h / sSize.h));
    return ratio > 1;
  }),
  mediaChanged: observer('media', function() {
    // Executes whenever the "media" property changes
    this._imgResize();
  })
});
