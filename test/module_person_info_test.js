"use strict"
var assert = require('assert');
var fakeRedis = require('fakeredis');
var PersonInfo = require('../modules/person_info');

describe('Person Info', function() {
  let personInfo = PersonInfo(fakeRedis.createClient());
  it('should create if empty', function() {
    let expected = {
      id: '0',
      name: 'Mr saxofone',
      thumbnail: 'abc123'
    }
    return personInfo.getOrCreate('Mr saxofone', 'abc123')
      .then(result => assert.deepEqual(expected, result), assert.fail);
    ;
  });
});
