import config from '../config.js'
import {DBClient} from 'mongodb'

const dbURL = config.mongo.dbURL;
const dbName = config.mongo.dbName;
const client = new DBClient(dbURL, dbName);
client.initialize();

//Database is bot wide. A class will be instantiated per collection.
// If you have to access multiple collections, use two class instances. (ex, GuildCollection.updatedocument, & StatsCollection.updateDocument)
export default class MongoWrapper {
  constructor(collection){
    //the DBClient object, after initialized, returns a property, database
    this.client = client.database;
    this.collection = client(collection);
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
