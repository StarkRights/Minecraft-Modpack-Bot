import {message, MessageEmbed} from 'discord.js'
import log from '../log'

module.exports = {
  name:'info',
  description:'bot statistics',
  async execute(message, args) {

    const infoEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('ModPackIndex Bot Info')
      .setDescription('This bot is developed and maintained by Starkrights, powered by ModPackIndex.com.')
      .addField('\u200b', '**Info**')
      .addField('Github', 'Currently Private', true)
      .addField('Version', '4.2.0', true)
      .addField('Servers', '2.5', true)
      .addField('Shards', 'lmao', true)
      .setFooter('Powered by ModPackIndex.com');
    message.channel.send(infoEmbed);
  }
}
