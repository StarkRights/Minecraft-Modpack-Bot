import log from '../log'
import fs from 'fs'
import cliProgress from 'cli-progress'
import * as util from 'util'
import NodeCache from "node-cache";
const modsCache = new NodeCache({stdTTL:60*60*1, deleteOnExpire:false});
const packsCache = new NodeCache({stdTTL:60*60*1, deleteOnExpire:false});
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;

  //letter from the editor:
  //Bars don't work properly, could be fixed, not important at the moment though.

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
   * async modsCache - Returns a singular *cached* array of all the objects from an MPI API request
   *
   * @param  {number} pageSize number of objects to be returned on a page (Max 100, per API restrictoins)
   * @return {NodeCache}    a NodeCache object which contains each individual page object from the MPI API
   */
  async getModsCache(pageSize){
    //If cache is expired - generate new cache.
    if((modsCache.getStats().keys == 0)){
      log.info('MPBotUtils#getModsCache -> Quering API for new cache');
      let lastPage = await modpackIndexAPI.getMods(pageSize, 1);
      lastPage = lastPage.meta.last_page;
      log.info('MPBotUtils#getModsCache -> Last API Request Page: ', lastPage);
      //add each individual page response to cache
      const bar1 = new cliProgress.SingleBar({
        format: 'Mod Cacheing Progress |' + ('{bar}') + '| {percentage}% || {value}/{total} Mods || Eta: {eta}s',
        barCompleteChar: '\u2588',
      });
      bar1.start(lastPage, 0);
      for(let pageNumber = 1; pageNumber <= 23; pageNumber++){
        let modsObject = await modpackIndexAPI.getMods(pageSize, pageNumber);
        modsCache.set(pageNumber, modsObject);
        bar1.increment();

      }
      bar1.stop();
      //Info Logging - If the cache is not expected size, log error
      if (modsCache.getStats().keys != lastPage){
        log.error('MPBotUtils#getModsCache -> API Caching Failed.');
      }
    }
    return modsCache;
  }

  async getPacksCache(pageSize){
    try{
        if(packsCache.getStats().keys == 0){
        let lastPage = await modpackIndexAPI.getPacks(pageSize, 1);
        lastPage = lastPage.meta.last_page;

        const bar2 = new cliProgress.SingleBar({
          format: 'Modpack Cacheing Progress |' + ('{bar}') + '| {percentage}% || {value}/{total} Modpacks || Eta: {eta}s',
          barCompleteChar: '\u2588',
        });
        bar2.start(lastPage, 0);

        for (let pageNumber = 1; pageNumber <= 23; pageNumber++){
          let packsObject = await modpackIndexAPI.getPacks(pageSize, pageNumber);
          packsCache.set(pageNumber, packsObject);
          bar2.increment();
        }
        bar2.stop();
      }
    } catch(e) {
      log.error(`WhateverThe Fuck ThE Error Is-> ${e}`);
    }
    return packsCache;
  }
}
