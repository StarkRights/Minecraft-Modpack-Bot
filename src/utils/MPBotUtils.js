import log from '../log'
import fs from 'fs.promises'
import cliProgress from 'cli-progress'
import * as util from 'util'
import NodeCache from "node-cache"
import {Error} from '../commands/utils/ErrorMessage.js'
const modsCache = new NodeCache({stdTTL:60*60*1, deleteOnExpire:false});
const packsCache = new NodeCache({stdTTL:60*60*1, deleteOnExpire:false});
//This should be a config option.
const modsCacheFile = (__dirname+'/mods.cache');
const packsCacheFile = (__dirname+'/packs.cache');
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;
const multibar = new cliProgress.MultiBar({
    clearOnComplete: true,
    hideCursor: true

}, cliProgress.Presets.shades_grey);

/*
  Need to clean up this code. A large amount is written twice for no reason.
  Only reason i'm not doing it now is because I don't want to think about how
  to dynamicaly change from MPI.getmods to .getpacks in a generic function.
  -Stark 11/22/20

  That was stupid easy. Idiot. Code is still a bit tall, but better than it was.
  API Calls refactored.
  -Stark 1/7/21
*/

//temp. future stark, write actual code for determining startup state.
let cacheCycle = 0;
export default class Utils {

  /**
   * async cacheArrayifier - Places each key in a cache object into a singular array
   *
   * @param  {type} cache cache to be arrayified
   * @return {Array}      an Array where each index is a mod-object
   */
  async cacheArrayifier(cache){
      let cacheArray = new Array();
      const cacheKeys = cache.getStats().keys;
      for(let i = 1; (i-1) < cacheKeys; i++){
        let pageNumber = i;
        let nextObject = await cache.get(pageNumber);
        cacheArray = cacheArray.concat(Array.from(nextObject.data));
      }
      //debug: console.log('modsArray', modsArray);
      return cacheArray;
   }
   async getCache(cacheType, pageSize){
     //set cache environment
     let nodeCache;
     let cacheFile;
     if((cacheType != 'pack') && (cacheType != 'mod')){throw 'Invalid cache type.'}
     if(cacheType == 'pack'){
       nodeCache = packsCache;
       cacheFile = packsCacheFile;
     }
     if(cacheType == 'mod'){
       nodeCache = modsCache;
       cacheFile = modsCacheFile;
     }

     //*if given cache is out of keys, generate a new cache
     if(nodeCache.getStats().keys == 0){
       //**if firsttime start, import from disk
       if(cacheCycle == 0){
         try{
           //returns nodecache
           const cacheObject = await importDiskCache(cacheType);
           //, log stats & ship it out
           const importedNumber = cacheObject.getStats().keys;
           log.info(`MPBotUtils#get${cacheType}Cache -> Import of existing cache Successful: Imported ${importedNumber} ${cacheType} pages`);
           return cacheObject;
         } catch(e) {
           log.warn(`MPBotUtils#get${cacheType}Cache -> Import of existing cache failed | Details: ${e}`);
         }
       }
       //If we didn't return earlier, we need to continue and APICache
       const returnCache = getAPICache(cacheType, 100);
       return returnCache;
     }

     //*Else, if the cache does preexist, return the cache
     else {
       return nodeCache;
     }
   }
}




/**
 * importDiskCache - Takes data from an existing disk cache & imports it to the bots memory NodeCache
 *
 * @param  {string} cacheFile string type of cache requested
 * @return {object}           a JSON Parsed object of the cache contents.
 */
async function importDiskCache(cacheType){
  let nodeCache;
  let cacheFile;
  if((cacheType != 'pack') && (cacheType != 'mod')){throw 'Invalid cache type.'}
  if(cacheType == 'pack'){
    nodeCache = packsCache;
    cacheFile = packsCacheFile;
  }
  if(cacheType == 'mod'){
    nodeCache = modsCache;
    cacheFile = modsCacheFile;
  }
  const cacheFileRaw = await fs.readFile(cacheFile, 'utf8');
  //if the cacheFile parses, we'll use it- if not, error
  const cacheFileJson = JSON.parse(cacheFileRaw);
  if(cacheFileJson == {}){throw 'Cache File Empty';}
  //else statements here should also throw if it's < than a reasonable amount of pages.


  //cache file didn't error out, ship it & cli- I mean return the parsed data.
  const cacheObject = JSON.parse(cacheFileRaw);

  cacheObject.forEach((pageObject, i) => {
    const pageNumber = i+1;
    nodeCache.set(pageNumber, pageObject);
  });
  const importedNumber = cacheObject.length;
  return nodeCache;
}


/**
 * getAPICache - Returns the populated nodecache of a specified type
 *
 * @param  {string} type 'mod'or 'pack'
 * @return {nodeCache}      the relevant nodecache
 */
async function getAPICache(type, pageSize){
  let apiFunction;
  let physicalCacheDir;
  let nodeCache;
  if(type!='mod' && type!='pack'){throw 'Invalid cache type.'}
  if(type == 'mod'){
    apiFunction = (pageSize, page)=>{return modpackIndexAPI.getMods(pageSize, page)};
    physicalCacheDir = modsCacheFile;
    nodeCache = modsCache;
  }
  if(type == 'pack'){
    apiFunction = (pageSize, page)=>{return modpackIndexAPI.getPacks(pageSize, page)};
    physicalCacheDir = packsCacheFile;
    nodeCache = packsCache;
  }

  log.info(`MPBotUtils#get${type}ModsCache -> Querying API for new cache`);
  let lastPage = await apiFunction(pageSize, 1);
  lastPage = lastPage.meta.last_page;
  log.info(`MPBotUtils#get${type}Cache -> Last API Request Page: `, lastPage);
  const progressBar = multibar.create(lastPage, 0);

  //for every page, add it to the memory cache & to the fileCache array
  const fileCacheArray = new Array;
  for(let pageNumber = 1; pageNumber <= lastPage; pageNumber++){
    let pageObject = await apiFunction(pageSize, pageNumber);
    nodeCache.set(pageNumber, pageObject);
    fileCacheArray[pageNumber-1] = pageObject;
    progressBar.increment();
  }
  //write to disk cache
  const fileCacheString = JSON.stringify(fileCacheArray);
  fs.writeFile(physicalCacheDir, fileCacheString);
  multibar.remove(progressBar);

  return nodeCache;
}
