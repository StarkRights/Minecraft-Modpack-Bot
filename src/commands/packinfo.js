import {MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
import Utils from '../utils/MPBotUtils.js'
import InfoMessage from './utils/InfoMessage.js'
const mpiAPI = new MPI;
const utils = new Utils;




const name = 'packinfo';
const description = 'details info of a specified pack id';
async function execute(message, args){
  const infoMessage = new InfoMessage(message, args);
  infoMessage.sendLoadingMessage();
  const packID = args[0];
  //check if packID is valid

  const packsCache = await utils.getCache('pack');
  const packsArray = await utils.cacheArrayifier(packsCache);

  let isValid = false;
  let packObj;
  for(let i = 0; (i+1) <= packsArray.length; i++){
    const nextObj = packsArray[i];
    const nextObjID = nextObj.id;
    if(nextObjID == packID){
      isValid = true;
      packObj = await mpiAPI.getPack(packID);
      packObj = packObj.data;
    }
  }
  packObj.link = `http://modpackindex.com/modpack/${packID}`;


  if(!isValid){
    message.channel.send(`Error: \`Invalid mod id\``);
  }
  else{
    infoMessage.sendInfo(packsArray, packObj);
  }
}

export {name, description, execute}
