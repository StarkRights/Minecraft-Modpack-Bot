import {MessageEmbed} from 'discord.js'
import log from '../log'


const name ='help';
const description = 'displays info regarding command usage';
async function execute(message, args){
  /* eslint-disable no-useless-escape */ //Useless escapes aren't useless, ported to Discord Markdown
  const helpEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('ModPackIndex Bot Help')
    .setDescription('A search utility for the minecraft modding community \n**Commands**')
    .addField('mp!Help', 'Displays this Embed. \n \`Useage: mp!help\`\n\u200b', true)
    .addField('mp!Info', 'Displays bot info/statistics,\n \`Usage: mp!info\`\n\u200b', true)
    .addField('\u200b', '\u200b', true)
    .addField('mp!Packsearch', 'Displays list of packs matching a search query.\n \`Useage: mp!packsearch <pack name>\`\n\u200b', true)
    .addField('mp!Modsearch', 'Displays list of mods matching a search query.\n \`Useage: mp!modsearch <mod name>\`\n\u200b', true)
    .addField('\u200b', '\u200b', true)
    .addField('mp!Packinfo', 'Displays info about a specified pack.\n \`Useage: mp!packs <packID>\`', true)
    .addField('mp!Modinfo', 'Displays info about a specified mod.\n \`Useage: mp!mods <modID>\`', true)
    .addField('\u200b', '\u200b', true)
    .addField('mp!PacksWith', 'Displays list of packs containing a specified mod.\n \`Useage: mp!packswith <mod ID>\`\n\u200b', true)
    .addField('mp!ModsIn', 'Displays list of mods in a certain pack. \n \`Useage: mp!ModsIn <pack ID>\`\n\u200b', true)
    .addField('\u200b', '\u200b', true)
    .setFooter('Powered by ModPackIndex.com');
  message.channel.send(helpEmbed);
}

export {name, description, execute}
