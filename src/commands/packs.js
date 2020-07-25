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
    let pageNumber = args;

    if(!pageNumber){
      if(isNaN(pageNumber)){message.channel.send('Invalid page number, starting page 1')}
      pageNumber = 1;
    }

    const packsObject = await modpackIndexAPI.getModpacks(10, pageNumber);
    const totalPacks = packsObject.meta.last_page;


    const modpacksEmbed = new MessageEmbed()
    	.setColor('#0099ff')
    	.setTitle(`Modpacks | Page ${pageNumber} / ${totalPacks}`)
//    	.setDescription('Some description here')
//    	.setImage('https://i.imgur.com/wSTFkRM.png')
//    	.setThumbnail('https://i.imgur.com/wSTFkRM.png')
/*   	.addFields(
    		{ name: 'Regular field title', value: 'Some value here' },
    		{ name: '\u200B', value: '\u200B' },
    		{ name: 'Inline field title', value: 'Some value here', inline: true },
    		{ name: 'Inline field title', value: 'Some value here', inline: true },
    	)
    	.addField('Inline field title', 'Some value here', true)
*/   	.setTimestamp()
    	.setFooter('Powered by modpackindex.com');

    const packsLength = Object.keys(packsObject.data).length;
  //  console.log(packsObject);
  //  console.log(packsLength);
    for(let i = 0; i <= (packsLength - 1); i++) {

      modpacksEmbed.addField(`${i + 1}) ${packsObject.data[i].name}`, packsObject.data[i].summary);
    }


    message.channel.send(modpacksEmbed);

  }
}
