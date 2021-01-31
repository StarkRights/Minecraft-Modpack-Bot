import fetch from 'node-fetch'
import log from '../log'



/*
    We do some dumb stuff here. Specifically, we return the entire HTTP request
    response body- which is stupid in and of itself.
    This needs to be changed to only return the data of the response body, &
    MPBotUtils updated to reflect those changes

    11/16 checking in - may not be entirely dumb. Useful for snagging date-headers,
    gives a nice way to do written-cache validation (when the bot startsup from cold/dark)
    This is, after all, literally just a way to access the API. I can do it however
    the damn hell i please.

*/

export default class ModPackIndex {
  constructor(){
    this.baseURL = 'https://www.modpackindex.com/api/v1/';
  }

  /**
   * async getPacks - Calls MPI API to get list of all modpacks
   *
   * @param  {number} limit Max number of modpacks to return
   * @param  {number} page  Page of entries to return
   * @return {object}       JSON Object of modpacks
   */
  async getPacks(limit, page){
    try {
      const response = await fetch(this.baseURL + `modpacks?limit=${limit}&page=${page}`);
      const rateLimit = response.headers.raw()['X-RateLimit-Remaining'];
      const retryAfter = response.headers.raw()['retry-after'];
      if(retryAfter){
        log.info(`Ratelimit: ${rateLimit}`);
        log.info(`RetryAfter: ${retryAfter}`);
      }
      return response.json();
    }
    catch(e) {
      log.error(`ModPackIndexAPI#modpacksRequest -> ${e.message}`)
    }
  }

  /**
   * async getModpack - Calls MPI API to get details of a singular modpack
   *
   * @param  {number} modpackId MPI ID of modpack
   * @return {object}           JSON Object of modpack details
   */
  async getPack(modpackId){
    try{
      const response = await fetch(this.baseURL + `modpack/${modpackId}`);
      return response.json();
    }
    catch(e){
      log.error(`ModPackIndexAPI#modpackRequest -> ${e.message}`)
    }
  }

  /**
   * async getModpackMods - Calls MPI API to get list of mods included in a modpack
   *
   * @param  {number} modpackId MPI ID of modpack
   * @return {object}           description
   */
  async getModpackMods(modpackId){
    try{
      const response = await fetch(this.baseURL + `modpack/${modpackId}/mods`);
      //console.log(await response.json());
      return response.json();
    }
    catch(e){
      log.error(`ModPackIndexAPI#modpackModsRequest -> ${e.message}`)
    }
  }





  /**
   * async getMods - Calls MPI API to get list of all mods
   *
   * @param  {number} limit Max number of mods to return
   * @param  {number} page  Page of entries to return
   * @return {object}       JSON Object of mods
   */
  async getMods(limit, page){
    try{
      const response = await fetch(this.baseURL + `mods?limit=${limit}&page=${page}`);
      const rateLimit = response.headers.raw()['X-RateLimit-Remaining'];
      const retryAfter = response.headers.raw()['retry-after'];
      if(retryAfter){
        log.info(`Ratelimit: ${rateLimit}`);
        log.info(`RetryAfter: ${retryAfter}`);
      }
      return await response.json();
    }
    catch(e){
      log.error(`ModPackIndexAPI#modsRequest -> ${e.message}`)
    }
  }

  /**
   * async getMod - Calls MPI API to get details of singular mod
   *
   * @param  {number} modId MPI ID of mod
   * @return {object}       JSON Object of mod details
   */
  async getMod(modId){
    try{
      const response = await fetch(this.baseURL + `mod/${modId}`);
      //console.log(await response.json());
      return response.json();
    }
    catch(e){
      log.error(`ModPackIndexAPI#modRequest -> ${e.message}`)
    }
  }

  /**
   * async getModpacksWithMod - Calls MPI API to get list of all modpacks which include a mod
   *
   * @param  {number} modId MPI Mod ID
   * @param  {number} limit Max number of packs to return
   * @param  {number} page  Page of entries to return
   * @return {object}       JSON Object of modpacks
   */
  async getModpacksWithMod(modId, limit, page){
    try{
      const response = await fetch(this.baseURL + `mod/${modId}/modpacks?limit=${limit}&page=${page}`);
      //console.log(await response.json());
      return response.json();
    }
    catch(e){
      log.error(`ModPackIndexAPI#modpacksWithModRequest -> ${e.message}`)
    }
  }
}
