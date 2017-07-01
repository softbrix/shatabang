import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('media-gallery-item', 'Integration | Component | media gallery item', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{media-gallery-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#media-gallery-item}}
      template block text
    {{/media-gallery-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
