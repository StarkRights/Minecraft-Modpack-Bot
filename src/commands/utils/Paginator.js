import log from '../../log'
import {ReactionCollector} from 'discord.js'


export default class Paginator{
  constructor(dataArray){
    this.dataArray = dataArray;
    //console.log(`dataArray`, this.dataArray);
  }

  paginate(embed, pageNumber){
    let paginatedEmbed = embed;
    console.log('')
    for(let i = 0; i <= 9; i++){
      if(i == this.dataArray.length){
        break;
      }

      const modNumber = (i)+(10*(pageNumber));
      const modName = this.dataArray[modNumber].item.name;
      const modID = this.dataArray[modNumber].item.id;
      const modSummary = this.dataArray[modNumber].item.summary;
      paginatedEmbed.addField(`${modNumber+1}) ${modName} | \`ID: ${modID}\``, modSummary);
    }
    return paginatedEmbed;
  }

  reactionPager(message, userMessage, embed, maxFields, options){
    message.react('◀️');
    message.react('▶️');
    const reactionFilter = (reaction, user) => {
      const isNextPage = (reaction.emoji.name == '▶️');
      const isPrevPage = (reaction.emoji.name == '◀️');
      return (isNextPage || isPrevPage) && (user.id === userMessage.author.id);
    };

    const reactionCollector = new ReactionCollector(message, reactionFilter, options);
    let menuPage = 0;
    reactionCollector.on('collect', (collectedReaction, user) => {
      const isNextPage = (collectedReaction.emoji.name == '▶️');
      const isPrevPage = (collectedReaction.emoji.name == '◀️');
      //remove user's reaction to allow them to react again
      collectedReaction.users.remove(user);

      //Increment menupage based on reaction, disallow negative pages
      if(isNextPage){menuPage = menuPage + 1};
      if(isPrevPage){menuPage = menuPage - 1};
      if(menuPage < 0){menuPage = 0};

      //delete all old fields
      embed.spliceFields(0, maxFields);

      //paginate the embed & ship it.
      this.paginate(embed, menuPage);
      message.edit(embed);
      //restart collector for another 30 seconds.
      reactionCollector.resetTimer();
    });

  }


}
