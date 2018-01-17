import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('fullsize-media', 'Integration | Component | fullsize media', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{fullsize-media}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#fullsize-media}}
      template block text
    {{/fullsize-media}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
