import NodeCache from "node-cache";
const modsCache = new NodeCache({stdTTL:60*60*1, deleteOnExpire:false});
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;


export default class Utils {

  /**
   * async cacheArrayifier - Places each key in a cache object into a singular array
   *
   * @param  {type} modsCache cache to be arrayified
   * @return {Array}          an Array where each entry is a keyValue from the cache.
   */
  async cacheArrayifier(modsCache){
      let modsArray = new Array();
      //debug:console.log('modsArray = ', modsArray);
      //for every page...
      const cacheKeys = modsCache.keys();
      //debug:console.log('cacheKeys= ', cacheKeys);

      for(let i = 1; (i-1) < cacheKeys.length; i++){
        let pageNumber = i;
        let nextObject = await modsCache.get(pageNumber);
        modsArray = modsArray.concat(Array.from(nextObject.data));
      }
      //debug: console.log('modsArray', modsArray);
      return modsArray;
   }

  /**
   * async modsCache - Returns a singular *cached* array of all the objects from an MPI API request
   *
   * @param  {num} pageSize number of objects to be returned on a page (Max 100, per API restrictoins)
   * @return {NodeCache}    a NodeCache object which contains each individual page object from the MPI API
   */
  async getModsCache(pageSize){
    if(modsCache.getStats().keys == 0){
      let lastPage = await modpackIndexAPI.getMods(pageSize, 1);
      lastPage = lastPage.meta.last_page;
      console.log('lastPage= ', lastPage);
      for(let pageNumber = 1; pageNumber <= lastPage; pageNumber++){
        let modsObject = await modpackIndexAPI.getMods(pageSize, pageNumber);
        modsCache.set(pageNumber, modsObject);
        console.log(pageNumber);
      }
    }
    return modsCache;
  }
}
