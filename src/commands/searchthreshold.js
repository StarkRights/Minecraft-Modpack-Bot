import {message, MessageEmbed} from 'discord.js'
import log from '../log'
import MongoUtil from '../utils/MongoUtils'
const guildsCollection = new MongoUtil('Guilds');

module.exports = {
  name: "searchthreshold",
  description: "owner cmd to change search threshold",
  async execute(message, args){
    if(isNaN(args)){
      message.channel.send('A number was not specified');
    }
    if(message.author.id == 189464274958024704){
      message.channel.send('Valid UserID, request accepted');
      const guildID = message.guild.id;
      //update the document belonging to *guildID* - set the threshold field to args
      await guildsCollection.updateDocument(guildID, 'threshold', args);
      const searchThreshold = await guildsCollection.readDocument(guildID, 'threshold');
      console.log('st#SearchThreshold: ', searchThreshold);
      message.channel.send(`New Search Threshold: \`${searchThreshold}\``);
    }
    else{
      message.channel.send('Invalid UserID, request rejected.');
    }
  }
}
