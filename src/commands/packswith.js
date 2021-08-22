import {MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import SearchMessage from './utils/SearchMessage.js'
import Search from './utils/SearchSorter.js'
const modpackIndexAPI = new MPI;
const utils = new Utils;



//let user pic mod from menu
//fuzzy search mods
const name = 'packswith';
const description = 'displays packs containing a user selected mod';
async function execute (message, args){
  const searchMessage = new SearchMessage(message, args);
  if(await searchMessage.sendLoadingMessage() == -1){return;}


  const packID = args[0];
  let packsObject = await modpackIndexAPI.getModpacksWithMod(packID);
  const packsArray = packsObject.data;

  //sort the set of mods alphabetically
  const searcher = new Search();
  const sortedResult = searcher.sortAlphabetically(packsObject.data);

  const mod = await modpackIndexAPI.getMod(args[0]);
  const modTitle = mod.data.name;

  //ship data off to be packaged, paginated & displayed to the user.
  searchMessage.sendSearchResults(sortedResult, `Packs containing \'${modTitle}\'`);
}

export {name, description, execute}
