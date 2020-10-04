import Fuse from 'fuse.js'


/**
 * Utility class for performing search operations on data, and sorting data by its MPI popularity
 */
export default class Search{



  /**
   * search - Performs a Fuse Search on the instantiated Object's data.
   *
   * @param  {string} query The search query
   * @return {Array}       A Fuse-Searched array with metadata.
   */
  search(data, query){
    const searchOptions = {
      includeScore: true,
      keys: ['name'],
      limit: 30,
      ignoreLocation: true,
      threshold: .1
    }
    const fuse = new Fuse(data, searchOptions);
    let searchResult = fuse.search(query);
    return searchResult;
  }


  /**
   * sortPopularity - Sorts an array by it's MPI Popularity rank
   *
   * @param  {Array} data Data to be sorted
   * @return {Array}      Data array ordered by decreasing popularity.   
   */
  sortPopularity(data){
    data.sort(function(a,b){
      return a.item.popularity_rank-b.item.popularity_rank;
    });
    return data;
  }
}
