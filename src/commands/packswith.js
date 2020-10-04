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
    let packsObject = await modpackIndexAPI.getModpacksWithMod(packID, 100, 1);
    const packsArray = packsObject.data;

    //sort the set of mods sortAlphabetically
    const searcher = new Search();
    const sortedResult = searcher.sortAlphabetically(packsObject.data)

    const mod = await modpackIndexAPI.getMod(args[0]);
    const modTitle = mod.data.name;

    //ship data off to be packaged, paginated & displayed to the user.
    searchMessage.sendSearchResults(sortedResult, `Mods in \'${modTitle}\'`)
  }
}
