
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
  fileShaIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_file_sha')),
  imgFingerIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_finger')),
  // importedTimesIndex is dual linked relative file -> timestamp & timestamp -> relative file
  importedTimesIndex: (cacheDir, options) => shIndex(path.join(cacheDir, 'idx_imported'), options),
  ratingIndex: (cacheDir) => shIndex(path.join(cacheDir, 'idx_rating')),
}