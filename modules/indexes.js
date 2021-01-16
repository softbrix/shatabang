
const vemdalenIndex = require("vemdalen-index");
var shIndex = require('stureby-index');
var path = require('path');

module.exports = {
  keywordsIndex: (redisClient) => vemdalenIndex('keywords', {
    indexType: 'strings_unique',
    client: redisClient
  }),
  metaIndex: (redisClient) => vemdalenIndex('meta', {
    indexType: 'object',
    client: redisClient
  }),
  regionsIndex: (redisClient) => vemdalenIndex('metaRegions', {
    indexType: 'object',
    client: redisClient
  }),

  personIndex: (redisClient) => vemdalenIndex('persons:', {
    indexType: 'object',
    client: redisClient
  }),
  personNameIndex: (redisClient) => vemdalenIndex('personNames:', {
    indexType: 'string',
    client: redisClient
  }),
  personFacesIndex: (redisClient) => vemdalenIndex('personFaces:', {
    indexType: 'strings_unique',
    client: redisClient
  }),
  fileShaIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_file_sha')),
  imgFingerIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_finger')),
  facesIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_faces')),
  facesCropIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_faces_crop')),
  ratingIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_rating')),
}