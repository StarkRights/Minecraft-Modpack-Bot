import {MessageEmbed} from 'discord.js'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;


//this doesn't seem like the ES8 kosher way to do this. It works, however I
// believe there should be a better way. I only want this to export 1 thing, &
// it should run on call, but idk how to do that..
//
// Update from 8/21/2021 Stark. What a blast from the past lmfao, I was literally
// just de-babelifying MPIBot & updating commands from module.export syntax- Crazy.

const name = 'packs';
const description = 'lists packs';
async function execute (message, args){

  message.channel.send(modpacksEmbed);

}

export {name, description, execute}
