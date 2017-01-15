import Ember from 'ember';

var canvas = document.createElement("CANVAS");
canvas.style.display = 'none';
document.body.appendChild(canvas);

export default Ember.Component.extend({
  tagName: 'div',
  actions: {
    cropImage() {
        console.log('Do it!');
    }
  },
  didInsertElement() {
    this._super(...arguments);

    this.$('img').on('load', (e) => {
      if(this.get('cropped')) {
        return;
      }
      console.log("Opa!",e.target);

      var item = this.get('item');
      canvas.width = item.w;
      canvas.height = item.h;
      canvas.getContext('2d').drawImage(e.target, item.l, item.t, item.w, item.h, 0, 0, item.w, item.h);

      e.target.src = canvas.toDataURL("image/png");

      this.set('cropped', true);
    });
  },
});
