import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr('string'),
  displayName: DS.attr('string')
});
