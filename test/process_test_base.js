var assert = require('assert');
var fakeRedis = require('fakeredis');

const defaultConfig = {
  importDir : './test_data/',
  cacheDir : './test/test_data/',
  storageDir : './test/test_data/',
  redisPort : 6262,
  redisHost : 'localhost',
  redisClient : fakeRedis.createClient()
};

module.exports.defaultConfig = defaultConfig;

module.exports.initProcess = function(taskProcess, opt) {
  var taskQueMock = {
    registerTaskProcessor : function(name, func) {
      assert.ok(name);
      opt.registeredFunctionCallback(func);
    },
    getJobCounts : opt.getJobCounts || function(name) {
      return 0;
    },
    names : opt.names || function() {
      return [];
    },
    queueTask : opt.queueTask || function(name, data) {
      // console.log('Queue task', name, data);
    }
  };

  let config = Object.assign({}, defaultConfig, opt.secondConfig);
  taskProcess.init(config, taskQueMock);
};
module.exports.job = {
  debug: false,
  log: function(...args) {
    if(this.debug) {
      console.log(args);
    }
  }
};
module.exports.doneOk = function(argument) {
  return assert.strictEqual(undefined, argument);
};

module.exports.donePromise = function(resolve, reject) {
  return function(args) {
    if(args !== undefined) {
      return reject(args);
    }
    resolve();
  }
}
