import config from '../config.js'
import log from '../log.js'
import assert from 'assert'

import {MongoClient} from 'mongodb'
const dbURL = config.mongo.dbURL;
const dbName = config.mongo.dbName;

var db;
var collection;


  //Letter from the editor. This wrapper is a bit.. how do you say.... hard coded?
  //You should definitely have to create the document yourself, and pass a
  //completed document, not just a guildID, because this isn't meant to just be
  //for guilds - it should also work for a future statistics API.
  //Putting this in the 'spring cleaning' post-1.0 launch category.
  //Good luck future stark.

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
  async insertDocument(documentObject){
    collection.insertOne(documentObject);
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

  async doesDocument(document){
    const documentFilter = {'guild': document};

    const documentCursor = await collection.find(documentFilter);
    const documentsArray = await documentCursor.toArray();

    //if no documents are returned, ret false. If non0 documents returned, ret true
    if (documentsArray.length == 0){
      return false;
    } else {
      return true;
    }
  }
}
