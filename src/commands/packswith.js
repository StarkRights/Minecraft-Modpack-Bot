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
  name: 'packswith',
  description: 'displays packs containing a user selected mod',
  async execute (message, args){
    if(isNaN(args[0])){
      message.channel.send('Invalid query/modID. \`Usage: mp!modsearch <modID> ex: mp!modsearch 1634\`');
      return;
    }
    const loadingEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Querying results`)
      .setDescription(`This data isn't cached, depending on the modpack size, this could take a minute.`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    const searchEmbedMessage = await message.channel.send(loadingEmbed);

    //This should probably be done in MPBotUtils for consistency.
    //Added to spring cleaning
    let packsPages = new Array();
    let lastPage = await modpackIndexAPI.getModpacksWithMod(args[0], 100, 1);
    lastPage = lastPage.meta.last_page;
    for (let pageNumber = 1; pageNumber <= lastPage; pageNumber++){
      let packsObject = await modpackIndexAPI.getModpacksWithMod(args[0], 100, pageNumber);
      packsPages[pageNumber-1] = packsObject;
    }


    let packsArray = new Array();
    let packsKeys = new Array();
    const packsPagesIterator = packsPages.keys();
    for(let key of packsPagesIterator){
      packsKeys[key] = packsArray[key];
    }

    for(let i = 0; i < packsKeys.length; i++){
      let pageNumber = i;
      let nextObject = await packsPages[pageNumber];
      packsArray = packsArray.concat(Array.from(nextObject.data));
    }

    try{
      packsArray.sort(function(a, b){return a.popularity_rank-b.popularity_rank;});
    }
    catch(e){
      log.error(`packswithCommand#sortingError -> ${e}`);
    }

    let menuPage = 0;

    const modObj = await modpackIndexAPI.getMod(args[0]);
    const modName = modObj.data.name;

    let resultsEmbed = new MessageEmbed();
    resultsEmbed
      .setColor('#0099ff')
      .setTitle(`Modpacks Containing \'${modName}\' | Page ${menuPage + 1}`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    for(let i = 0; i <= 9; i++){
      if(i == packsArray.length){break;}

      resultsEmbed.addField(`${i+1}) ${packsArray[i].name} | \`ID: ${packsArray[i].id}\``, packsArray[i].summary);
    }

    searchEmbedMessage.edit(resultsEmbed);

    //No paging if search result is < 10 results
    if(packsArray.length > 10)  {
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
          if((menuPage*10 + i) == packsArray.length){break;}
                                      //add 10*menupage to the index.
          let modNumber = (menuPage*10) + i;
          let modObj = packsArray[modNumber];


          resultsEmbed.addField(`${modNumber}) ${modObj.name} | \`ID: ${modObj.id}\``, modObj.summary);
        }
        resultsEmbed.setTitle(`Search Results For \'${args[0]}\' | Page ${menuPage + 1}`);
        //edit message with edited embed.
        searchEmbedMessage.edit(resultsEmbed);
      });
    }
  }
}
