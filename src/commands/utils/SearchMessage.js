import log from '../../log'
import {MessageEmbed} from 'discord.js'
import Paginator from '../utils/Paginator.js'



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
      .setDescription(`This hasn't been cached yet, which probably means you're the first one to run this command since the cache expired. If this happens often, it's more likely that something's broken.`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');
    this.responseMessage = await this.commandMessage.channel.send(this.messageEmbed);
    return this.responseMessage;
  }

  /**
   * async updateMessage - Updates the loading message
   *
   * @return {void}  description
   */
  async sendSearchResults(searchSet){
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
      .setTitle(`Search Results For \'${args.join(' ')}\' | Page 1`)
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
