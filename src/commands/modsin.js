import {message, MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;
import Utils from '../utils/MPBotUtils.js'
const utils = new Utils;
import NodeCache from 'node-cache'
import Fuse from 'fuse.js'
import MongoWrapper from '../utils/MongoUtils'
const guildsCollection = new MongoWrapper('Guilds');

module.exports = {
  //let user pic mod from menu
  //fuzzy search mods
  name: 'modsin',
  description: 'displays mods in a certain pack',
  async execute (message, args){
    if(isNaN(args[0])){
      message.channel.send('Invalid query/modID. \`Usage: mp!modsearch <modID> ex: mp!modsearch 1634\`');
      return;
    }
    let modsPages = new Array();

    //This should probably be done in MPBotUtils for consistency.
    //Added to spring cleaning
    let modsObject = await modpackIndexAPI.getModpackMods(args[0]);
    let modsArray = new Array();

    for(let i = 0; i < modsObject.data.length; i++){
      let nextObject = await modsObject.data[i];
      modsArray[i] = nextObject;
    }

    try{
      modsArray.sort((a, b)=>
        a.name.localeCompare(b.name)
      );
    }
    catch(e){
      log.error(`modsinCommand#sortingError -> ${e}`);
    }

    let menuPage = 0;


    const modObj = await modpackIndexAPI.getModpack(args[0])
    const packName = modObj.data.name

    const resultsEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Mod list for \'${packName}\' | Page ${menuPage + 1}`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    for(let i = 0; i <= 9; i++){
      if(i == modsArray.length){break;}

      resultsEmbed.addField(`${i+1}) ${modsArray[i].name} | \`ID: ${modsArray[i].id}\``, modsArray[i].summary);
    }

    const searchEmbedMessage = await message.channel.send(resultsEmbed);

    //No paging if search result is < 10 results
    if(modsArray.length > 10)  {
      searchEmbedMessage.react('◀️');
      searchEmbedMessage.react('▶️');
      //filter non-requester reactions, and non-arrow reactions
      const reactionFilter = (reaction, user) => {
        return ((reaction.emoji.name == '▶️') || (reaction.emoji.name == '◀️')) && (user.id === message.author.id);
      };
      const reactionCollector = new ReactionCollector(searchEmbedMessage, reactionFilter, {time: 30000});

      reactionCollector.on('collect', (collectedReaction, user) => {
        collectedReaction.users.remove(user);
        //increment menuPage based on reaction
        if(collectedReaction.emoji.name == '▶️'){menuPage = menuPage + 1;}
        else if(collectedReaction.emoji.name == '◀️'){menuPage = menuPage - 1;}
        else{log.error(`ModSearch#MenuPagingError -> Collected Reaction != Left or Right Arrow`);}
        //menuPage can only go as low as 0.
        if(menuPage < 0){menuPage = 0;}
        //delete all old fields
        resultsEmbed.spliceFields(0, 10);
        //iterate 10 new fields in
        for(let i = 0; i <= 9; i++){
          //break if we reach the end of search results
          if((menuPage*10 + i) == modsArray.length){break;}
                                      //add 10*menupage to the index.
          let modNumber = (menuPage*10) + i;
          let modObj = modsArray[modNumber];

          resultsEmbed.addField(`${modNumber}) ${modObj.name} | \`ID: ${modObj.id}\``, modObj.summary);
        }
        resultsEmbed.setTitle(`Search Results For \'${args[0]}\' | Page ${menuPage + 1}`);
        //edit message with edited embed.
        searchEmbedMessage.edit(resultsEmbed);
      });
    }
  }
}
