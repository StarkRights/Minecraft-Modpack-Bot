import {message, MessageEmbed} from 'discord.js'
import log from '../log'

module.exports = {
  name:'info',
  description:'bot statistics',
  async execute(message, args) {

    const infoEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('ModPackIndex Bot Info')
      .setDescription('This bot is developed and maintained by \nStarkrights, powered by ModPackIndex.com.')
      .addField('\u200b', '**Info**')
      .addField('Github', 'Currently Private', true)
      .addField('Version', '1.0.0', true)
      .addField('\u200b', '\u200b')
      .addField('Servers', '2 and a half', true)
      .addField('Shards', 'lmao', true)
      .setFooter('Powered by ModPackIndex.com');
    message.channel.send(infoEmbed);
  }
}
