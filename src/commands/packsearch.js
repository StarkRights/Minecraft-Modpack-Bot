import {message, MessageEmbed} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;
import Utils from '../utils/MPBotUtils.js'
const utils = new Utils;
import NodeCache from 'node-cache'
import Fuse from 'fuse.js'

const packsCache = new NodeCache();

//this doesn't seem like the ES8 kosher way to do this. It works, however I
// believe there should be a better way. I only want this to export 1 thing, &
// it should run on call, but idk how to do that..
module.exports = {
  name: 'packsearch',
  description:'lists packs based on search query',
  async execute (message, args){
    //Return without search parameters
<<<<<<< HEAD
    if(!args){
=======
    if(!args[0]){
>>>>>>> master
      message.channel.send('No search paramaters given. \`Usage: mp!packsearch <search term> Ex: mp!packsearch revelations\`')
      return;
    }
    const loadingEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Querying results`)
      .setDescription(`This data isn't cached, which probably means you're the first one to run this command since the cache expired. If this happens often, it's more likely that something's broken.`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    const searchEmbedMessage = await message.channel.send(loadingEmbed);
    //Retrieve mod data from API request cache.
    const packsCache = await utils.getPacksCache(100);
    const packsArray = await utils.cacheArrayifier(packsCache);

    //initialize fuze object: Search name of mods for the exact search phrase anywhere in the title.
    const searchOptions = {
      includeScore: true,
      keys: ['name'],
      limit: 30,
      ignoreLocation: true,
      threshold: .1
    }
    const fuse = new Fuse(packsArray, searchOptions);
<<<<<<< HEAD
    let searchResult = await fuse.search(args);
=======
    let searchResult = await fuse.search(args[0]);
>>>>>>> master

    //sort matches by ModPackIndex ranking
    try{
      searchResult.sort(function(a, b){return a.item.popularity_rank-b.item.popularity_rank;})
    }
    catch(e){
      log.error(`modsearchCommand#sortingError -> ${e}`);
    }

    //Take top 15 results, ship them off to discord.
    let finalSearchSet = new Array();
    for(let i = 0; (i+1) <= searchResult.length; i++){
      finalSearchSet[i] = searchResult[i];
    }
    let menuPage = 0;
    const searchResultsEmbed = new MessageEmbed()
      .setColor('#0099ff')
<<<<<<< HEAD
      .setTitle(`Search Results For \'${args}\' | Page ${menuPage + 1}`)
=======
      .setTitle(`Search Results For \'${args[0]}\' | Page ${menuPage + 1}`)
>>>>>>> master
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    for(let i = 0; i <= 9; i++){
      if(i == finalSearchSet.length){break;}
      searchResultsEmbed.addField(`${i+1}) ${finalSearchSet[i].item.name} | \`ID: ${finalSearchSet[i].item.id}\``, finalSearchSet[i].item.summary);
    }

    searchEmbedMessage.edit(searchResultsEmbed);
    const filter = m => (m.author.id === message.author.id);
    const collector = message.channel.createMessageCollector(filter, {max: 1, maxMatches: 1, time: 10000});
    collector.on('collect', collectedMessage => {
      const selection = Number(collectedMessage.content);
      const selectedPack = searchResult[selection];
      let authors = ' ';
      for(let i = 0; (i + 1) <= selectedPack.item.authors.length; i++){
        //Here lies stark's sanity - killed by using = instead of === like a fucking idiot
        if(i===0){ authors = authors + `${selectedPack.item.authors[i].name}`}
        else{authors = authors + `, ${selectedPack.item.authors[i].name}`}
      }

      if(finalSearchSet.length > 10)  {
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
          else{log.error(`PackSearch#MenuPagingError -> Collected Reaction != Left or Right Arrow`);}
          //menuPage can only go as low as 0.
          if(menuPage < 0){menuPage = 0;}
          //delete all old fields
          searchResultsEmbed.spliceFields(0, 10);
          //iterate 10 new fields in
          for(let i = 0; i <= 9; i++){
            //break if we reach the end of search results
            if((menuPage*10 + i) == finalSearchSet.length){break;}
                                        //add 10*menupage to the index.
            let packNumber = (menuPage*10) + i;
            let modObj = finalSearchSet[packNumber].item;

            searchResultsEmbed.addField(`${packNumber}) ${packObj.name} | \`ID: ${packObj.id}\``, packObj.summary);
          }
<<<<<<< HEAD
          searchResultsEmbed.setTitle(`Search Results For \'${args}\' | Page ${menuPage + 1}`);
=======
          searchResultsEmbed.setTitle(`Search Results For \'${args[0]}\' | Page ${menuPage + 1}`);
>>>>>>> master
          //edit message with edited embed.
          searchEmbedMessage.edit(searchResultsEmbed);
        });
      }

      const modEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(selectedPack.item.name)
        .setThumbnail(selectedPack.item.thumbnail_url)
        .addField(`Description:`, selectedPack.item.summary)
        .addField(`Authors:`, authors, true)
        .addField(`Downloads:`, selectedPack.item.download_count, true)
        .addField(`Last modified:`, selectedPack.item.last_modified, true)
        .addField(`Last updated:`, selectedPack.item.last_updated, true)
        .setFooter('Powered by ModPackIndex.com');
      message.channel.send(modEmbed);
    });
  }
}
