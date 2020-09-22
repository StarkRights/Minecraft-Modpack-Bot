import {message, MessageEmbed} from 'discord.js'
import log from '../log'
import MongoUtil from '../utils/MongoUtils'
const guildsCollection = new MongoUtil('Guilds');

module.exports = {
  name: "searchthreshold",
  description: "owner cmd to change search threshold",
  async execute(message, args){
    if(message.author.id === 189464274958024704){

      const guildID = message.guild.id;
      //update the document belonging to *guildID* - set the threshold field to args
      guildsCollection.updateDocument(guildID, 'threshold', args);
    }
  }
}
