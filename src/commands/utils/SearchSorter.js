import Fuse from 'fuse.js'


/**
 * Utility class for performing search operations on data, and sorting data by its MPI popularity
 */
export default class Search{

  /**
   * search - Performs a Fuse Search on the instantiated Object's data.
   *
   * @param  {string} query The search query
   * @return {Array}       A trimmed Fuse-Searched array.
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
    const searchResult = fuse.search(query);
    let parsedArray = new Array();
    for(let i = 0; (i+1) <= searchResult.length; i++){
      parsedArray[i] = searchResult[i].item;
    }

    return parsedArray;
  }


  /**
   * sortPopularity - Sorts an array by it's MPI Popularity rank
   *
   * @param  {Array} data Data to be sorted
   * @return {Array}      Data array ordered by decreasing popularity.
   */
  sortPopularity(data){
    data.sort(function(a,b){
      return a.popularity_rank-b.popularity_rank;
    });
    return data;
  }

  sortAlphabetically(data){
    data.sort((a, b)=>
      a.name.localeCompare(b.name)
    );
    return data;
  }
}
