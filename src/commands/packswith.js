import {message, MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import SearchMessage from './utils/SearchMessage.js'
import Search from './utils/SearchSorter.js'
const modpackIndexAPI = new MPI;
const utils = new Utils;


module.exports = {
  //let user pic mod from menu
  //fuzzy search mods
  name: 'packswith',
  description: 'displays packs containing a user selected mod',
  async execute (message, args){
    if(isNaN(args[0])){
      message.channel.send('Invalid query/modID. \`Usage: mp!modsearch <modID> ex: mp!modsearch 1634\`');
      return;
    }

    //send query loading messageEmbed
    const searchMessage  = new SearchMessage(message, args);
    if(await searchMessage.sendLoadingMessage() == -1){return;}


    const packID = args[0];
    let lastPage = await modpackIndexAPI.getModpacksWithMod(packID, 100, 1);
    lastPage = lastPage.meta.last_page;
    let packsArray = new Array();
    //needs to be done 'in-house' due to MPIAPI limitations at the moment. It makes no sense to cache these, as they're specific mods and that starts to take up memory like fuck.
    for(let pageNumber = 1; pageNumber <= lastPage; pageNumber++){
      const nextObject = await modpackIndexAPI.getModpacksWithMod(packID, 100, pageNumber);
      for(let i = 0; (i+1) <= nextObject.data.length; i++){
            packsArray[(pageNumber-1)*10+i] = nextObject.data[i];
      }
    }

    //sort the set of mods sortAlphabetically
    const searcher = new Search();
    const sortedResult = searcher.sortPopularity(packsArray);

    const mod = await modpackIndexAPI.getMod(args[0]);
    const modTitle = mod.data.name;

    //ship data off to be packaged, paginated & displayed to the user.
    searchMessage.sendSearchResults(sortedResult, `Packs With \'${modTitle}\'`)
  }
}
