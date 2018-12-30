import Controller from '@ember/controller';

import Ember from 'ember';

const Logger = Ember.Logger;

export default Controller.extend({
  addingPerson: false,
  selectedElement: undefined,
  selectedFace: undefined,
  actions: {
    addPerson() {
      var isAddingPerson = this.get('addingPerson');
      if(isAddingPerson) {
        if(!this.get('selectedFace')) {
          this.set('highlightSelectFace', true);
          return;
        }
        var person = this.get('store').createRecord('person', {
          name: this.get('newPersonName'),
          thumbnail: this.get('selectedFace.b')
        });
        return person.save().then(() => {
          this.resetSelectedFace();
          this.set('addingPerson', false);
          this.set('newPersonName', '');
        }, (error) => {
          this.set('addPersonError', error);
        });
      }
      this.set('addingPerson', !isAddingPerson);
    },
    cancelAddPerson() {
      this.resetSelectedFace();
      this.set('addingPerson', false);
    },
    imageClicked(face, event) {
      if(this.get('addingPerson')) {
        this.resetSelectedFace();
        this.set('selectedFace', face);
      } else {
        // TODO: Lookup media
        Logger.debug(face, event);
        this.set('activeMedia', face);
      }
    },
    personClicked(person) {
      Logger.debug(person);
    }
  },
  resetSelectedFace() {
    this.set('highlightSelectFace', false);
    this.set('selectedFace', undefined);
  }
});
