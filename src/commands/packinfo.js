import {message, MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import InfoMessage from './utils/InfoMessage.js'
const modpackIndexAPI = new MPI;
const utils = new Utils;



module.exports = {
  name: 'packinfo',
  description:'details info of a specified pack id',
  async execute(message, args){
    const packID = args[0];
    //check if packID is valid

    const packsCache = await utils.getPacksCache(100);
    const packsArray = await utils.cacheArrayifier(packsCache);

    let isValid = false;
    let packObj;
    for(let i = 0; (i+1) <= packsArray.length; i++){
      const nextObj = packsArray[i];
      const nextObjID = nextObj.id;
      if(nextObjID == packID){
        isValid = true;
        packObj = mpiapi.;
      }
    }

    if(!isValid){
      message.channel.send(`Error: \`Invalid mod id\``);
    }
    else{
      const infoMessage = new InfoMessage(message, args);
      if(await infoMessage.sendLoadingMessage() == -1){return;}
      infoMessage.sendInfo(packsArray, packObj);
    }
  }
}
