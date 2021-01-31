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
  name: 'modsin',
  description: 'displays mods in a certain pack',
  async execute (message, args){
    if(isNaN(args[0])){
      message.channel.send('Invalid query/modID. \`Usage: mp!modsearch <modID> ex: mp!modsearch 1634\`');
      return;
    }
    //send query loading message
    const searchMessage = new SearchMessage(message, args);
    if(await searchMessage.sendLoadingMessage() == -1){return;}


    const modID = args[0];
    let modsObject = await modpackIndexAPI.getModpackMods(modID);
    const modsArray = modsObject.data;

    //sort the set of mods alphabetically
    const searcher = new Search();
    const sortedResult = searcher.sortAlphabetically(modsObject.data);

    const pack = await modpackIndexAPI.getPack(args[0]);
    const packTitle = pack.data.name;

    //ship data off to be packaged, paginated & displayed to the user.
    searchMessage.sendSearchResults(sortedResult, `Mods in \'${packTitle}\'`);
  }
}
