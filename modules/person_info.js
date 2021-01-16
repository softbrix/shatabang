const indexes = require("./indexes");

module.exports = function(redisClient) {

  let personIndex = indexes.personIndex(redisClient);
  let personNameIndex = indexes.personNameIndex(redisClient);
  let personFacesIndex = indexes.personFacesIndex(redisClient);

  let addId = function(id) {
    return (obj) => { obj.id = id; return obj };
  };

  return {
    getAll: function() {
      return personIndex.keys().then((keys) => {
        var promises = keys.map(key => personIndex.get(key).then(addId(key)));
        return Promise.all(promises);
      });
    },
    getById: function(id) {
      return personIndex.get(id)
        .then(addId(id));
    },
    getByName: function(name) {
      return personNameIndex.get(name).then(id => {
        if(id) {
          return personIndex.get(id)
            .then(addId(id));
        }
      });
    },
    getOrCreate: function(name, thumbnailKey) {
      return personNameIndex.get(name).then(id => {
        if(id) {
          return personIndex.get(id)
            .then(addId(id));
        }
        let newObj = {
          'name': name,
          'thumbnail': thumbnailKey
        };
        return personIndex.size().then(newId => {
          newId = '' + newId;
          return Promise.all( [
            personNameIndex.put(name, newId),
            personIndex.put(newId, newObj)
          ])
          // Return new object after successful put
          .then(() => addId(newId)(newObj));
        });
      });
    },
    getFaces: function(id) {
      return personFacesIndex.get(id);
    },
    addFace: function(id, faceId) {
      return personFacesIndex.put(id, faceId);
    }
  };
};
