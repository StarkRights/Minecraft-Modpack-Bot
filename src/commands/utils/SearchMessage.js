import log from '../../log'
import {MessageEmbed} from 'discord.js'
import Paginator from '../utils/Paginator.js'
import ErrorMessage from './ErrorMessage.js'



export default class SearchMessage {
  constructor(commandMessage, query){
    this.commandMessage = commandMessage;
    this.query = query;
  }
  /**
   * async sendLoadingMessage - Sends a message to indicate
   * something is happening before data is displayed
   *
   * @return {Message}  Discord.js Message Object
   */
  async sendLoadingMessage(){
    this.messageEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Querying results`)
      .setDescription(`If this is taking a moment, the bot is probably cacheing data. Try again in a few seconds if this message doesn't change`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');

    this.responseMessage;
    //Error handling needs to migrate to ErrorMessage format.
    try{
      this.responseMessage = await this.commandMessage.channel.send(this.messageEmbed);
    } catch(e){
      log.error(`SearchMessage#loadingMessage -> ${e}`);
      this.responseMessage = await this.commandMessage.channel.send('The bot could not send the embed containing the search results. This is likely due to missing the \`embed-links\` permission');
    }
    return this.responseMessage;
  }

  /**
   * async updateMessage - Updates the loading message
   *
   * @return {void}  description
   */
  async sendSearchResults(searchSet, title){
    if(!this.responseMessage){
      log.error(`SearchMessageUtil#chronologyError -> update message called without an existing message`);
      return -1;
    }
    //Create a paginator isntance with the given dataset
    const paginator = new Paginator(searchSet);
    //Create embed frame
    const args = this.query;
    const resultsEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${title} | Page 1`)
      .setDescription(`Use \`mp!modinfo\` or \`mp!packinfo\` to get details about a specific mod, or a link to its ModPackIndex page.`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    //send message with paged results. Pagination handled in paginator
    paginator.paginate(resultsEmbed, 0);
    const searchMessage = this.responseMessage;
    searchMessage.edit(resultsEmbed);
    //send ReactionMonitor the message to monitor & page.
    const reactionCollectorOptions = {time: 30000}
    paginator.reactionPager(this.responseMessage, this.commandMessage, resultsEmbed, 10, reactionCollectorOptions);


  }
}
