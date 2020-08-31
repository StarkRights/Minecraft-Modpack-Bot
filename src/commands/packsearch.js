import {message, MessageEmbed} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;
import Utils from '../utils/MPBotUtils.js'
const utils = new Utils;
import NodeCache from 'node-cache'
import Fuse from 'fuse.js'

const packsCache = new NodeCache();

//this doesn't seem like the ES8 kosher way to do this. It works, however I
// believe there should be a better way. I only want this to export 1 thing, &
// it should run on call, but idk how to do that..
module.exports = {
  name: 'packsearch',
  description:'lists packs based on search query',
  async execute (message, args){
    //Return without search parameters
    if(!args){
      message.channel.send('No search paramaters given. \`Usage: mp!packsearch <search term> Ex: mp!packsearch revelations\`')
      return;
    }

    //Retrieve mod data from API request cache.
    const packsCache = await utils.getPacksCache(100);
    const packsArray = await utils.cacheArrayifier(packsCache);

    //initialize fuze object: Search name of mods for the exact search phrase anywhere in the title.
    const searchOptions = {
      includeScore: true,
      keys: ['name'],
      limit: 30,
      ignoreLocation: true,
      threshold: .1
    }
    const fuse = new Fuse(packsArray, searchOptions);
    let searchResult = await fuse.search(args);
    console.log('searchResult: ', searchResult);
    console.log('Length', searchResult.length);

    //sort matches by ModPackIndex ranking
    try{
      searchResult.sort(function(a, b){return a.item.popularity_rank-b.item.popularity_rank;})
    }
    catch(e){
      log.error(`modsearchCommand#sortingError -> ${e}`);
    }
    console.log('Sorted Search Result; ', searchResult)

    //Take top 15 results, ship them off to discord.
    let finalSearchSet = new Array();
    for(let i = 0; (i+1) <= searchResult.length; i++){
      finalSearchSet[i] = searchResult[i];
    }

    const searchResultsEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Search Results For \'${args}\'`)
   	  .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    for(let i = 0; i <= 9; i++){
      if(i == finalSearchSet.length){break;}
      searchResultsEmbed.addField(`${i+1}) ${finalSearchSet[i].item.name}`, finalSearchSet[i].item.summary);
    }
    message.channel.send(searchResultsEmbed);
    
  }
}
