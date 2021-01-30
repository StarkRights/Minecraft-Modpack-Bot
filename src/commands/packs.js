import {message, MessageEmbed} from 'discord.js'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;


//this doesn't seem like the ES8 kosher way to do this. It works, however I
// believe there should be a better way. I only want this to export 1 thing, &
// it should run on call, but idk how to do that..
module.exports = {
  name: 'packs',
  description:'lists packs',
  async execute (message, args){

    message.channel.send(modpacksEmbed);

  }
}
