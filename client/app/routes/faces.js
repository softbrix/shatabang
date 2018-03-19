import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Ember from 'ember';
import RSVP from 'rsvp';

const Logger = Ember.Logger;

// TODO: Remove code dupplication
// This could be handled on the server
const MAX_SHORT = 65535;

function fromHex(v) {
  return parseInt(v, 16);
}

function expandFaceInfo(info) {
  if(info.length < 14 /* todo: regexp match input*/) {
    return { x: NaN, y: NaN, w: NaN, h: NaN };
  }
  var t = function t(val) {
    return fromHex(val) / MAX_SHORT;
  };
  const BLK_WIDTH = 4;
  return {
    x: t(info.substr(0, BLK_WIDTH)),
    y: t(info.substr(4, BLK_WIDTH)),
    w: t(info.substr(8, BLK_WIDTH)),
    h: t(info.substr(12, BLK_WIDTH))
  };
}
// END TODO

export default Route.extend(AuthenticatedRouteMixin).extend({
  model() {
    return RSVP.hash({
      faces: Ember.$.getJSON('./api/faces/list')
        .then(list =>  {
          list.forEach((a) => {
            if(a.s * 1 !== a.s) {
              Logger.log('No stat', a.k);
              a.s = 0;
            }
          });
          return list;
        })
        .then(list => list.map(itm => { var o = expandFaceInfo(itm.i); o.s = itm.s; o.k = itm.k; o.b = itm.b; return o}))
        .then(list => list.map(itm => { itm.a = itm.h * itm.w; return itm; }))
        .then(list => list.sort((a,b) => b.a - a.a))  // Sort desc based on focus
        .then(l => l.slice(0, 1024)),
      people: this.get('store').findAll('person')
    });
  }
});
