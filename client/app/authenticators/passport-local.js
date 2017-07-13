/* global Ember, $ */

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

export default BaseAuthenticator.extend({
  _provider: null,

  /**
    Restores the session by calling the torii provider's `fetch` method.

    __Many torii providers do not implement the `fetch` method__. If the
    provider in use does not implement the method simply add it as follows:

    ```js
    // app/torii-providers/facebook.js
    import FacebookOauth2Provider from 'torii/providers/facebook-oauth2';

    export default FacebookOauth2Provider.extend({
      fetch(data) {
        return data;
      }
    });
    ```

    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming or remaining authenticated
    @public
  */
  restore(data) {
    console.log('restore user',data);
    return new Ember.RSVP.Promise(function(resolve, reject){
      $.get( './api/users/me')
        .done(resolve)
        .fail(function(resp) {
          if(resp.status === 401) {
            reject('Unknown username and/or password');
          } else {
            reject('Unknown authorization error');
          }
        });
    });
    // TODO: Call /api/account
    /*this._assertToriiIsPresent();

    data = data || {};
    if (!isEmpty(data.provider)) {
      const { provider } = data;

      return this.get('torii').fetch(data.provider, data).then((data) => {
        this._authenticateWithProvider(provider, data);
        return data;
      }, () => delete this._provider);
    } else {
      delete this._provider;
      return RSVP.reject();
    }*/
  },

  /*

    @method authenticate
    @param {String} provider The torii provider to authenticate the session with
    @param {Object} options The options to pass to the torii provider
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session becoming authenticated
    @public
  */
  authenticate(username, password) {
    if(username === undefined || username.trim().length === 0) {
      return Ember.RSVP.reject('Username must not be empty');
    }
    if(password === undefined || password.trim().length === 0) {
      return Ember.RSVP.reject('Password must not be empty');
    }
    return new Ember.RSVP.Promise(function(resolve, reject){
      $.post( './api/users/authenticate', { username: username, password: password })
        .done(resolve)
        .fail(function(resp) {
          if(resp.status === 401) {
            reject('Unknown username and/or password');
          } else {
            reject('Unknown authorization error');
          }
        });
    });
  },

  /**
    Closes the torii provider. If the provider is successfully closed, this
    method returns a resolving promise, otherwise it will return a rejecting
    promise, thus intercepting session invalidation.

    @method invalidate
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being invalidated
    @public
  */
  invalidate(data) {
    console.log(data);
    return new Ember.RSVP.Promise(function(resolve, reject){
      $.post( './api/users/invalidate')
        .done(resolve)
        .fail(function(resp) {
          console.log(resp);
          reject('Unknown authorization error');
        });
    });
  }
});
