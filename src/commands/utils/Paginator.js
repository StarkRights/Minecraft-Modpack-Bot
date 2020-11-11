import log from '../../log'
import ErrorMessage from './ErrorMessage.js'
import {ReactionCollector, MessageEmbed} from 'discord.js'


export default class Paginator{
  constructor(dataArray){
    this.dataArray = dataArray;
    //console.log(`dataArray`, this.dataArray);
  }

  paginate(embed, pageNumber){
    let paginatedEmbed = embed;
    for(let i = 0; i <= 9; i++){
      if(i == this.dataArray.length){
        break;
      }

      const modNumber = (i)+(10*(pageNumber));
      const modName = this.dataArray[modNumber].name;
      const modID = this.dataArray[modNumber].id;
      const modSummary = this.dataArray[modNumber].summary;
      paginatedEmbed.addField(`${modNumber+1}) ${modName} | \`ID: ${modID}\``, modSummary);
    }
    return paginatedEmbed;
  }

  async reactionPager(message, userMessage, embed, maxFields, options){

    try{
      const reaction1 = await message.react('◀️');
      const reaction2 = await message.react('▶️');
    } catch(e){
      log.error(`reactionPager#reactionFailure -> ${e}`);
      const errorMessage = new ErrorMessage(messsage, e, 'Pagination', 'The bot could not react to its message. This is likely due to missing the \`add-reactions\` permission');
      errorMessage.sendError();
    }

    const reactionFilter = (reaction, user) => {
      const isNextPage = (reaction.emoji.name == '▶️');
      const isPrevPage = (reaction.emoji.name == '◀️');
      return (isNextPage || isPrevPage) && (user.id === userMessage.author.id);
    };

    const reactionCollector = new ReactionCollector(message, reactionFilter, options);
    let menuPage = 0;
    reactionCollector.on('collect', async (collectedReaction, user) => {
      const isNextPage = (collectedReaction.emoji.name == '▶️');
      const isPrevPage = (collectedReaction.emoji.name == '◀️');
      //remove user's reaction to allow them to react again
      try{ await collectedReaction.users.remove(user); }
      catch(e){
        log.error(`reactionPager#reactionDeleteFailure -> ${e}`);
        const error = new Error()
          .setType('Pagination')
          .setError(e)
          .setDetails('The bot could not remove user reactions. This is likely due to missing the \`manage-messages\` permission')
          .setMessage(userMessage);
        /* old
        const errorMessage = new ErrorMessage(message, error);
        errorMessage.sendError();
        */
        throw error;
      }
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
    // to add: on 'end'{delete reactions};

  }


}
