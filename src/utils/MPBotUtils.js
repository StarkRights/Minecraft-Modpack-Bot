import NodeCache from "node-cache";
const modsCache = new NodeCache;
export default;
modules.exports = {
  //functions to return a singular *cached* array of all the objects from an MPI API request
  async modsCache(pageSize){
    let lastPage = await modpackIndexAPI.getMods(pageSize, 1);
    lastPage = lastPage.meta.last_page;
    console.log('lastPage= ', lastPage);
    for(let pageNumber = 1; pageNumber <= await lastPage; pageNumber++){
      let modsObject = await modpackIndexAPI.getMods(pageSize, pageNumber);
      modsCache.set(pageNumber, modsObject);
      console.log(pageNumber);
      return modsCache;
    }
  }
}
