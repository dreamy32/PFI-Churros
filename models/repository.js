///////////////////////////////////////////////////////////////////////////
// This class provide CRUD operations on JSON objects collection text file
// with the assumption that each object have an Id member.
// If the objectsFile does not exist it will be created on demand.
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

const fs = require("fs");
const { v1: uuidv1 } = require("uuid");
const utilities = require("../utilities.js");
const CollectionFilter = require("./collectionFilter.js");
const CachedRequests = require("../CachedRequestsManager");
const RepositoryCachesManager = require("./repositoryCachesManager.js");
global.repositoryEtags = {};

class Repository {
  constructor(ModelClass, cached = true) {
    this.objectsList = null;
    this.model = ModelClass;
    this.objectsName = ModelClass.getClassName() + "s";
    this.objectsFile = `./data/${this.objectsName}.json`;
    this.initEtag();
    this.cached = cached;
    this.bindExtraDataMethod = null;
    this.updateResult = {
      ok: 0,
      conflict: 1,
      notFound: 2,
      invalid: 3,
    };
  }
  setBindExtraDataMethod(bindExtraDataMethod) {
    this.bindExtraDataMethod = bindExtraDataMethod;
  }
  initEtag() {
    this.ETag = "";
    if (this.objectsName in repositoryEtags)
      this.ETag = repositoryEtags[this.objectsName];
    else this.newETag();
  }
  newETag() {
    this.ETag = uuidv1();
    repositoryEtags[this.objectsName] = this.ETag;
    CachedRequests.clear(this.objectsName);
  }
  objects() {
    if (this.objectsList == null) this.read();
    return this.objectsList;
  }
  read() {
    this.objectsList = null;
    if (this.cached) {
      this.objectsList = RepositoryCachesManager.find(this.objectsName);
    }
    if (this.objectsList == null) {
      try {
        let rawdata = fs.readFileSync(this.objectsFile);
        // we assume here that the json data is formatted correctly
        this.objectsList = JSON.parse(rawdata);
        if (this.cached)
          RepositoryCachesManager.add(this.objectsName, this.objectsList);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // file does not exist, it will be created on demand
          console.log(clc.yellow(`Warning ${this.objectsName} repository does not exist. It will be created on demand`));
          this.objectsList = [];
        } else {
          console.log(clc.redBright(`Error while reading ${this.objectsName} repository`));
          console.log(clc.redBright('--------------------------------------------------'));
          console.log((clc.red(error)));
        }
      }
    }
  }
  write() {
    this.newETag();
    fs.writeFileSync(this.objectsFile, JSON.stringify(this.objectsList));
    if (this.cached) {
      RepositoryCachesManager.add(this.objectsName, this.objectsList);
    }
  }
  nextId() {
    let maxId = 0;
    for (let object of this.objects()) {
      if (object.Id > maxId) {
        maxId = object.Id;
      }
    }
    return maxId + 1;
  }
  add(object) {
    try {
      if (this.model.valid(object)) {
        let conflict = false;
        if (this.model.key) {
          conflict =
            this.findByField(this.model.key, object[this.model.key]) != null;
        }
        if (!conflict) {
          object.Id = this.nextId();
          this.objectsList.push(object);
          this.write();
        } else {
          object.conflict = true;
        }
        return object;
      }
      return null;
    } catch (error) {
      console.log(
        FgRed,
        `Error adding new item in ${this.objectsName} repository`
      );
      console.log(
        FgRed,
        "-------------------------------------------------------"
      );
      console.log(Bright, FgRed, error);
      return null;
    }
  }
  update(objectToModify) {
    if (this.model.valid(objectToModify)) {
      let conflict = false;
      if (this.model.key) {
        conflict =
          this.findByField(
            this.model.key,
            objectToModify[this.model.key],
            objectToModify.Id
          ) != null;
      }
      if (!conflict) {
        let index = 0;
        for (let object of this.objects()) {
          if (object.Id === objectToModify.Id) {
            this.objectsList[index] = objectToModify;
            this.write();
            return this.updateResult.ok;
          }
          index++;
        }
        return this.updateResult.notFound;
      } else {
        return this.updateResult.conflict;
      }
    }
    return this.updateResult.invalid;
  }
  remove(id) {
    let index = 0;
    for (let object of this.objects()) {
      if (object.Id === id) {
        this.objectsList.splice(index, 1);
        this.write();
        return true;
      }
      index++;
    }
    return false;
  }
  bindExtraData(datas) {
    let bindedDatas = [];
    if (datas)
      for (let data of datas) {
        bindedDatas.push(this.bindExtraDataMethod(data));
      };
    return bindedDatas;
  }
  getAll(params = null) {
    let objectsList = this.objects();
    if (this.bindExtraDataMethod != null) {
      objectsList = this.bindExtraData(objectsList);
    }
    if (params) {
      let collectionFilter = new CollectionFilter(
        objectsList,
        params,
        this.model
      );
      return collectionFilter.get();
    }
    return objectsList;
  }
  get(id) {
    for (let object of this.objects()) {
      if (object.Id === id) {
        if (this.bindExtraDataMethod != null)
          return this.bindExtraDataMethod(object);
        else return object;
      }
    }
    return null;
  }
  removeByIndex(indexToDelete) {
    if (indexToDelete.length > 0) {
      utilities.deleteByIndex(this.objects(), indexToDelete);
      this.write();
    }
  }
  findByField(fieldName, value, excludedId = 0) {
    if (fieldName) {
      let index = 0;
      for (let object of this.objects()) {
        try {
          if (object[fieldName] === value) {
            if (object.Id != excludedId) return this.objectsList[index];
          }
          index++;
        } catch (error) {
          break;
        }
      }
    }
    return null;
  }
}

module.exports = Repository;
