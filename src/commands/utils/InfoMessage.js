import log from '../../log'
import {MessageEmbed} from 'discord.js'
import {ErrorMessage, Error} from './ErrorMessage.js'
import Utils from '../../utils/MPBotUtils.js'
import config from '../../config.js'

const utils = new Utils;



export default class InfoMessage {
  constructor(commandMessage, ID){
    this.commandMessage = commandMessage;
    this.ID = ID;
  }
  /**
   * async sendLoadingMessage - Sends a message to indicate
   * something is happening before data is displayed
   *
   * @return {Message}  Discord.js Message Object OR -1 if fail
   */
  async sendLoadingMessage(){
    this.messageEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Retreiving data.`)
      .setDescription(`Retreiving your data.`)
      .setTimestamp()
      .setFooter('Powered by modpackindex.com');

    this.responseMessage;
    try{
      this.responseMessage = await this.commandMessage.channel.send(this.messageEmbed);
    } catch(e){
      const errorObject = new Error()
        .setType(`Results Presentation`)
        .setMessage(this.commandMessage)
        .setError(e)
        .setDetails(config.errorMessages.cantEmbed);
      throw errorObject;
    }
    return this.responseMessage;
  }

  /**
   * async updateMessage - Updates the loading message
   *
   * @return {void}  description
   */
  async sendInfo(array, infoObject){
    if(!this.responseMessage){
      log.error(`SearchMessageUtil#chronologyError -> update message called without an existing message`);
      return -1;
    }

    //Package retreived information & ship it
    const title = infoObject.name;
    let authors = '';
    for(let i = 0; (i + 1) <= infoObject.authors.length; i++){
      if(i==0){ authors = authors + `${infoObject.authors[i].name}`}
      else{authors = authors + `, ${infoObject.authors[i].name}`}
    }
    const infoEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${title}`)
      .setThumbnail(infoObject.thumbnail_url)
      .setTimestamp()
      .addField(`Description:`, infoObject.summary)
      .addField(`Authors:`, authors, true)
      .addField(`Downloads:`, infoObject.download_count, true)
      .addField(`Last modified:`, infoObject.last_modified, true)
      .addField(`Last updated:`, infoObject.last_updated, true)
      .addField(`Link:`, infoObject.link, true)
      .addField(`\u200b`, `\u200b`, true)
      .setFooter('Powered by modpackindex.com');

    const searchMessage = this.responseMessage;
    searchMessage.edit(infoEmbed);
  }
}
