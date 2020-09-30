import config from '../config.js'
import log from '../log.js'
import assert from 'assert'

import {MongoClient} from 'mongodb'
const dbURL = config.mongo.dbURL;
const dbName = config.mongo.dbName;

var db;
var collection;

export default class MongoUtil {
  constructor(collection){
    this.client = new MongoClient(dbURL, {useUnifiedTopology: true});
    this.collectionName = collection;

  }

  async initialize(){
    await this.client.connect(err => {
      if(err){log.error(`MongoUtils#connectionFailure -> ${e}`)}
      else{log.info(`MongoUtils#connection -> ready...`)}
    });
    db = await this.client.db(dbName);
    collection = await db.collection(this.collectionName);
  }
  async insertDocument(){

  }

  async updateDocument(document, field, data){
    const documentFilter = {'guild': document};
    const modification = {$set: {[field]: data}};

    collection.updateOne(documentFilter, modification);

  }

  async readDocument(document, field){
    const documentFilter = {'guild': document};

    //compactable, but I'm leaving it like this for readability.
    const documentCursor = await collection.find(documentFilter);
    const documentsArray = await documentCursor.toArray();

    const threshold = documentsArray[0].threshold;
    return threshold;
  }
}
