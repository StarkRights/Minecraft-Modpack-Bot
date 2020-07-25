import {message, MessageEmbed} from 'discord.js'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;
import NodeCache from 'node-cache'
import Fuse from 'fuse.js'

const modsCache = new NodeCache();

//this doesn't seem like the ES8 kosher way to do this. It works, however I
// believe there should be a better way. I only want this to export 1 thing, &
// it should run on call, but idk how to do that..
module.exports = {
  name: 'modsearch',
  description:'lists mods based on search query',
  async execute (message, args){
    if(!args){
      message.channel.send('No search paramaters given. \`Usage: mp!modsearch <search term> Ex: mp!modsearch revelations\`')
      return;
    }
    //i think this should be done in MPIAPI, return modsCache as value for getMods
    // modsCache = modpackIndexAPI.getMods()
    const pageSize = 100;
    const lastPage = await modpackIndexAPI.getMods(pageSize, 1);
    console.log('lastPage= ', lastPage.meta.last_page);
    //pageNumber <= await lastPage.meta.last_page ---this is 2nd func
    for(let pageNumber = 1; pageNumber <= await lastPage.meta.last_page; pageNumber++){
      let modsObject = await modpackIndexAPI.getMods(pageSize, pageNumber);
      modsCache.set(pageNumber, modsObject);
      console.log(pageNumber);
    }


    //This generates a singular object, with a fuckton of keyvalue pairs in the format {modName: modId}. object.keys will be called to search thru.
    let modsArray = new Array();
    console.log('modsArray = ', modsArray);
    //for every page...
    const cacheKeys = modsCache.keys();
    console.log('cacheKeys= ', cacheKeys);

    for(let i = 1; (i-1) < cacheKeys.length; i++){
      let pageNumber = i;
      let nextObject = await modsCache.get(pageNumber);
      modsArray = modsArray.concat(Array.from(nextObject.data));
    }
    console.log('modsArray', modsArray);



    const searchOptions = {
      includeScore: true,
      keys: ['name'],
      limit: 30
    }
    const fuse = new Fuse(modsArray, searchOptions);
    //create array w/ all ordered by result
    let searchResult = await fuse.search(args);
    console.log('Fuse Search Result: ', searchResult);
    //sort by popularity rank
    let finalSearchSet = new Array();
    for(let i = 0; i <= 14; i++){
      finalSearchSet[i] = searchResult[i];
    }
    try{
      finalSearchSet.sort(function(a, b){
        return a.item.popularity_rank-b.item.popularity_rank;
      })
    }
    catch(e){
      log.error(`modsearchCommand#sortingError -> ${e}`);
    }
    console.log('Sorted Search Result; ', finalSearchSet)

    const searchResultsEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Search Results For \'${args}\'`)
   	  .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    for(let i = 0; i <= 9; i++){
      if(i == finalSearchSet.length){break;}
      searchResultsEmbed.addField(`${i+1}) ${finalSearchSet[i].item.name}`, finalSearchSets[i].item.summary);
    }
    message.channel.send(searchResultsEmbed);
  }
}
