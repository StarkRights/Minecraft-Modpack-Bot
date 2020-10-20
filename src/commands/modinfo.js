import {message, MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import SearchMessage from './utils/SearchMessage.js'
import Search from './utils/SearchSorter.js'
const modpackIndexAPI = new MPI;
const utils = new Utils;



module.exports = {
  async execute(message, args){
    const modID = args[0];
    //check if modID is valid

  }
}
