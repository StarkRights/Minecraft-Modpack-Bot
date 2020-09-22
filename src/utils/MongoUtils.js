import config from '../config.js'

import {MongoClient} from 'mongodb'
const dbURL = config.mongo.dbURL;
const dbName = config.mongo.dbName;

const client = new MongoClient(dbURL, dbName);
try{
  client.connect();
} catch(e){
  log.error(`MongoUtils#connectFailure -> ${e}`);
}
export default class MongoUtil {
  constructor(collection){
    this.collection = collection;
  }

  async insertDocument(){

  }

  async updateDocument(document, field, data){
    const collection = this.collection;
    const documentFilter = {'guild': document};
    const modification = {$set: {[field]: data}};

    this.collection.updateOne(documentFilter, modification);

  }

  async readDocument(document, field){
    const collection = this.collection;
    const documentFilter = {'guild': document};

    const documentObject = this.collection.findOne(documentFilter);
    const fieldValue = documentObject[field];
    return fieldValue;
  }
}
