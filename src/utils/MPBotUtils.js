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

  //letter from the editor:
  //Bars don't work properly, could be fixed, not important at the moment though.


//Utility functions that don't really need their own module


/**
 * importDiskCache - Takes data from an existing disk cache & imports it to the bots memory NodeCache
 *
 * @param  {string} cacheFile string filepath to the disk cache file
 * @return {object}           a JSON Parsed object of the cache contents.
 */
async function importDiskCache(cacheFile){

  //                                      Replace w/ cFile
  const cacheFileRaw = await fs.readFile(__dirname+'/mods.cache', 'utf8');
  //if the cacheFile parses, we'll use it- if not, error
  try {
    const cacheFileJson = JSON.parse(cacheFileRaw);
    if(cacheFileJson == {}){
      throw error;
    }
  }
  catch (e) {
    log.error('we caught the error');
    throw e
  }
  //cache file didn't error out, ship it & cli- I mean return the parsed data.
  const cacheFileJSON = JSON.parse(cacheFileRaw);
  return cacheFileJSON;
}

async function writeDiskCache(){

}

export default class Utils {

  /**
   * async cacheArrayifier - Places each key in a cache object into a singular array
   *
   * @param  {type} cache cache to be arrayified
   * @return {Array}      an Array where each index is a mod-object
   */
  async cacheArrayifier(cache){
      let cacheArray = new Array();
      const cacheKeys = cache.keys();
      for(let i = 1; (i-1) < cacheKeys.length; i++){
        let pageNumber = i;
        let nextObject = await cache.get(pageNumber);
        cacheArray = cacheArray.concat(Array.from(nextObject.data));
      }
      //debug: console.log('modsArray', modsArray);
      return cacheArray;
   }

  /**
   * async modsCache - Returns a singular *cached* array of all the page objects from an MPI API request
   *
   * @param  {number} pageSize number of objects to be returned on a page (Max 100, per API restrictoins)
   * @return {NodeCache}    a NodeCache object which contains each individual page object from the MPI API
   */
  async getModsCache(pageSize){
    //If cache is expired - generate new cache.
    if((modsCache.getStats().keys == 0)){

      //try to import from disk cache. return if successful
      try{
        const cacheObject = importDiskCache(modsCacheFile);
        cacheObject.forEach((modObject, i) => {
          const pageNumber = i+1;
          modsCache.set(pageNumber, modObject);
        });
        return modsCache;
      } catch(e){
        log.warn("MPBotUtils#importDiskCache -> Import of existing cached failed");

      }
      //if we didn't return earlier, something's wrong, so fallback to API Queries.

      log.info('MPBotUtils#getModsCache -> Quering API for new cache');
      let lastPage = await modpackIndexAPI.getMods(pageSize, 1);
      lastPage = lastPage.meta.last_page;
      log.info('MPBotUtils#getModsCache -> Last API Request Page: ', lastPage);
      const bar1 = new cliProgress.SingleBar({
        format: 'Mod Cacheing Progress |' + ('{bar}') + '| {percentage}% || {value}/{total} Mods || Eta: {eta}s',
        barCompleteChar: '\u2588',
      });
      bar1.start(lastPage, 0);

      //for every page, add it to the memory cache & to the fileCache array
      const fileCacheArray = new Array;
      for(let pageNumber = 1; pageNumber <= 23; pageNumber++){
        let modsObject = await modpackIndexAPI.getMods(pageSize, pageNumber);
        modsCache.set(pageNumber, modsObject);
        fileCacheArray[pageNumber-1] = modsObject;
        bar1.increment();

      }
      //write to disk cache
      const fileCacheString = JSON.stringify(fileCacheArray);
      fs.writeFile(__dirname+'/mods.cache', fileCacheString);
      bar1.stop();
    }
    return modsCache;
  }

  async getPacksCache(pageSize){
    try{
      /*  Need to implement disk cacheing here as well. We're rewriting code here though...
       * time to outsource to another module? Or at least, outsource to a private func?
      */
      if(packsCache.getStats().keys == 0){
        try{
          const cacheObject = await importDiskCache(packsCacheFile);
          cacheObject.forEach((packObject, i) => {
            const pageNumber = i+1;
            packsCache.set(pageNumber, packObject);
          });
          return packsCache;
        } catch(e){
          log.warn("MPBotUtils#importDiskCache -> Import of existing cached failed");

        }




        let lastPage = await modpackIndexAPI.getPacks(pageSize, 1);
        lastPage = lastPage.meta.last_page;

        const bar2 = new cliProgress.SingleBar({
          format: 'Modpack Cacheing Progress |' + ('{bar}') + '| {percentage}% || {value}/{total} Modpacks || Eta: {eta}s',
          barCompleteChar: '\u2588',
        });
        bar2.start(lastPage, 0);
        let fileCacheArray = new Array;
        for (let pageNumber = 1; pageNumber <= 23; pageNumber++){
          let packsObject = await modpackIndexAPI.getPacks(pageSize, pageNumber);
          fileCacheArray[pageNumber-1] = packsObject;
          packsCache.set(pageNumber, packsObject);
          bar2.increment();
        }
        bar2.stop();
        const fileCacheString = JSON.stringify(fileCacheArray);
        fs.writeFile(__dirname+'/packs.cache', fileCacheString);

      }
    } catch(e) {
      log.error(`WhateverThe Fuck ThE Error Is-> ${e}`);
    }
    return packsCache;
  }
}
