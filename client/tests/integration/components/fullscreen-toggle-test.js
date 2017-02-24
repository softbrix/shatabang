import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('fullscreen-toggle', 'Integration | Component | fullscreen toggle', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{fullscreen-toggle}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#fullscreen-toggle}}
      template block text
    {{/fullscreen-toggle}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
