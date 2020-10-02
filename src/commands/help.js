import {message, MessageEmbed} from 'discord.js'
import log from '../log'

module.exports = {
  name:'help',
  description:'displays info regarding command usage',
  async execute(message, args){
    const helpEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('ModPackIndex Bot Help')
      .setDescription('A search utility for the minecraft modding community \n**Commands**')
      .addField('mp!Help', 'Displays this Embed. \n \`Useage: mp!help\`', true)
      .addField('mp!Info', 'Displays bot info/statistics,\n \`Usage: mp!info\`', true)
      .addField('mp!Packs', 'Displays packs by popularity ranking.\n \`Useage: mp!packs\`', true)
      .addField('mp!Mods', 'Displays mods by popularity ranking.\n \`Useage: mp!mods\`', true)
      .addField('mp!Packsearch', 'Displays list of packs matching a search query.\n \`Useage: mp!packsearch <pack name>\`', true)
      .addField('mp!Modsearch', 'Displays list of mods matching a search query.\n \`Useage: mp!modsearch <mod name>\`', true)
      .addField('mp!PacksWith', 'Displays list of packs containing a specified mod (mod IDs can be found from modsearch).\n \`Useage: mp!packswith <mod ID>\`', true)
      .addField('mp!ModsIn', 'Displays list of mods in a certain pack. (pack IDs can be found from packsearch) \n \`Useage: mp!ModsIn <pack ID>\`', true)
      .setFooter('Powered by ModPackIndex.com');
    message.channel.send(helpEmbed);
  }
}
