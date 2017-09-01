import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    clearImageFinger: function() {
      let that = this;
      Ember.$.post( './api/kue/add/clear_index/high/', {'index_name': 'idx_finger'})
        .done(function() {
          that.set('clearStatus', 'Executed');
        })
        .fail(function(resp) {
          console.log(resp);
          that.set('clearStatus', 'Error: ' + resp.statusText);
        });
    },
    rebuildImageFinger: function() {
      let that = this;
      let handleError = function(resp) {
        console.log(resp);
        that.set('rebuildStatus', 'Error: ' + resp.statusText);
      };
      let update_year = function(year) {
        Ember.$.post( './api/kue/addFolder/' + year +'/create_image_finger/low/', {'index_name': 'idx_finger'})
          .then(function() {
            that.set('rebuildStatus', 'Executed');
          }, handleError);
      };
      Ember.$.get('./api/dirs/list').then(function(folders) {
        if(folders.length === 0) {
          that.set('rebuildStatus', 'No folder found');
          return;
        }
        folders.forEach(update_year);
      }, handleError);
    }
  }
});
