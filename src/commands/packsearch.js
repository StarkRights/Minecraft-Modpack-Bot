import {message, MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import SearchMessage from './utils/SearchMessage.js'
import Search from './utils/SearchSorter.js'

const modpackIndexAPI = new MPI;
const utils = new Utils;


module.exports = {
  name: 'packsearch',
  description:'lists packs based on search query',
  async execute (message, args){
    //Return without search parameters
    if(!args[0]){
      message.channel.send('No search paramaters given. \`Usage: mp!packsearch <search term> Ex: mp!packsearch revelations\`')
      return;
    }
    //send query loading message
    const searchMessage = new SearchMessage(message, args);
    if(await searchMessage.sendLoadingMessage() == -1){return;}

    //Retrieve pack data from API request cache.
    const packsCache = await utils.getCache('pack',100);
    const packsArray = await utils.cacheArrayifier(packsCache);

    //Search packsArray for the user's query, then sort the searched set
    const searchQuery = args.join(' ');
    const searcher = new Search();
    const sortedResult = searcher.sortPopularity(searcher.search(packsArray, searchQuery));

    //ship the data off to be packaged, paginated & displayed to the user.
    searchMessage.sendSearchResults(sortedResult, `Search Results For \'${args.join(' ')}\'`);

  }
}
