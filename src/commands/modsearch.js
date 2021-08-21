import {MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import SearchMessage from './utils/SearchMessage.js'
import Search from './utils/SearchSorter.js'

const modpackIndexAPI = new MPI;
const utils = new Utils;



const name = 'modsearch';
const description = 'lists mods based on search query';
async function execute (message, args){
  //Return without search parameters
  if(!args[0]){
    message.channel.send('No search paramaters given. \`Usage: mp!modsearch <search term> Ex: mp!modsearch revelations\`')
    return;
  }
  //send query loading message
  const searchMessage = new SearchMessage(message, args)
  if(await searchMessage.sendLoadingMessage() == -1){return;}

  //Retrieve mod data from API Request cache.
  const modsCache = await utils.getCache('mod');
  const modsArray = await utils.cacheArrayifier(modsCache);

  //Search the modsArray for the user's query, then sort the searched set
  const searchQuery = args.join(' ');
  const searcher  = new Search();
  const sortedResult = searcher.sortPopularity(searcher.search(modsArray, searchQuery));

  //ship the data off to be backaged, paginated & displayed to the user
  searchMessage.sendSearchResults(sortedResult, `Search Results For \'${args.join(' ')}\'`);

}

export {name, description, execute}
