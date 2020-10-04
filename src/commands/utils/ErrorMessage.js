import {MessageEmbed} from 'discord.js'

export default class ErrorMessage{
  constructor(userMessage, error, type, details){
    this.userMessage = userMessage;
    this.error = error;
    this.type = type;
    this.details = details;
  }

  async sendError(){
    const errorEmbed = new MessageEmbed()
      .setColor('#ff000d')
      .setTitle(`${this.type} Error:`)
      .setDescription(`The bot has encountered an error trying to perform your command. \n \n Details: ${this.details}`)
      .setTimestamp();
    this.userMessage.channel.send(errorEmbed);
  }
}
