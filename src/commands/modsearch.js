import {message, MessageEmbed, ReactionCollector} from 'discord.js'
import log from '../log'
import MPI from '../utils/ModPackIndexAPI.js'
const modpackIndexAPI = new MPI;
import Utils from '../utils/MPBotUtils.js'
const utils = new Utils;
import NodeCache from 'node-cache'
import Fuse from 'fuse.js'
import MongoUtil from '../utils/MongoUtils'
const guildsCollection = new MongoUtil('Guilds');

const modsCache = new NodeCache();

//this doesn't seem like the ES8 kosher way to do this. It works, however I
// believe there should be a better way. I only want this to export 1 thing, &
// it should run on call, but idk how to do that..
module.exports = {
  name: 'modsearch',
  description:'lists mods based on search query',
  async execute (message, args){
    //Return without search parameters
    if(!args[0]){
      message.channel.send('No search paramaters given. \`Usage: mp!modsearch <search term> Ex: mp!modsearch revelations\`')
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
    const modsCache = await utils.getModsCache(100);
    const modsArray = await utils.cacheArrayifier(modsCache);

    const guild = message.guild.id;
    //const threshold = await guildsCollection.readDocument(guild, 'threshold');
    //initialize fuze object: Search name of mods for the exact search phrase anywhere in the title.
    const searchOptions = {
      includeScore: true,
      keys: ['name'],
      limit: 30,
      ignoreLocation: true,
      threshold: .1
    }
    //log.info(`Threshold: ${threshold}`);

    const fuse = new Fuse(modsArray, searchOptions);
    let searchResult = await fuse.search(args.join(' '));
    log.info(`Searchresultlength = ${searchResult.length}`);

    //sort matches by ModPackIndex ranking
    try{
      searchResult.sort(function(a, b){return a.item.popularity_rank-b.item.popularity_rank;});
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
      .setTitle(`Search Results For \'${args.join(' ')}\' | Page ${menuPage + 1}`)
   	  .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    for(let i = 0; i <= 9; i++){
      if(i == finalSearchSet.length){break;}
      searchResultsEmbed.addField(`${i+1}) ${finalSearchSet[i].item.name} | \`ID: ${finalSearchSet[i].item.id}\``, finalSearchSet[i].item.summary);
    }
    //here, once again, lies stark's sanity. This line was placed in the If statement. Obvious issues arise with <10 search results
    searchEmbedMessage.edit(searchResultsEmbed);
    //No paging if search result is < 10 results
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
        else{log.error(`ModSearch#MenuPagingError -> Collected Reaction != Left or Right Arrow`);}
        //menuPage can only go as low as 0.
        if(menuPage < 0){menuPage = 0;}
        //delete all old fields
        searchResultsEmbed.spliceFields(0, 10);
        //iterate 10 new fields in
        for(let i = 0; i <= 9; i++){
          //break if we reach the end of search results
          if((menuPage*10 + i) == finalSearchSet.length){break;}
                                      //add 10*menupage to the index.
          let modNumber = (menuPage*10) + i;
          let modObj = finalSearchSet[modNumber].item;

          searchResultsEmbed.addField(`${modNumber}) ${modObj.name} | \`ID: ${modObj.id}\``, modObj.summary);
        }
        searchResultsEmbed.setTitle(`Search Results For \'${args[0]}\' | Page ${menuPage + 1}`);
        //edit message with edited embed.
        searchEmbedMessage.edit(searchResultsEmbed);
        reactionCollector.resetTimer();
      });
    }




    const messageFilter = m => ((m.author.id === message.author.id) && (!isNaN(Number(m.content))) );

    //10 second expiration won't work if a user wants to go thru multiple pages. Figure out how to reset the time?
    const collector = message.channel.createMessageCollector(messageFilter, {max: 1, maxMatches: 1, time: 10000});
    collector.on('collect', collectedMessage => {
      const selection = Number(collectedMessage.content);
      const selectedMod = searchResult[selection];
      let authors = ' ';
      for(let i = 0; (i + 1) <= selectedMod.item.authors.length; i++){
        //Here lies stark's sanity - killed by using = instead of === like a fucking idiot
        if(i===0){ authors = authors + `${selectedMod.item.authors[i].name}`}
        else{authors = authors + `, ${selectedMod.item.authors[i].name}`}
      }

      const modEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(selectedMod.item.name)
        .setThumbnail(selectedMod.item.thumbnail_url)
        .addField(`Description:`, selectedMod.item.summary)
        .addField(`Authors:`, authors, true)
        .addField(`Downloads:`, selectedMod.item.download_count, true)
        .addField(`Last modified:`, selectedMod.item.last_modified, true)
        .addField(`Last updated:`, selectedMod.item.last_updated, true)
        .setFooter('Powered by ModPackIndex.com');
      message.channel.send(modEmbed);
    });
  }
}
