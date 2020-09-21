import {MongoClient} from 'mongodb'
const dbURL = config.mongo.dbURL;
const dbName = config.mongo.dbName;
const client = new MongoClient(dbURL, dbName);


export default class DBClient {
  constructor(url, dbName){
    this.client = null;
    this.dbName = dbName;
    this.url = url;
    this.database = null;
  }
  async initialize(){
    this.client = await client.connect(this.url);
    log.info(`MongoDB#Connection -> ready...`)
    this.database = client.db(this.dbName)
  }
}
