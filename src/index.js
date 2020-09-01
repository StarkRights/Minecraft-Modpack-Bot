import "regenerator-runtime/runtime.js";
import {readdirSync} from 'fs'
import {Client, Collection} from 'discord.js'
import config from './config.js'
import log from './log'
import {join} from 'path'


const token = config.token;
const prefix = config.prefix;
const client = new Client();
client.commands = new Collection();

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	log.info('Client#Ready -> ready...');
});

client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	//better way to do this, 100% no doubt, but I'm lazy asf so stfu future stark.
	const commandArray = await message.content.slice(prefix.length).split(/ +/);
	const command = await commandArray.shift().toLowerCase();
	const args = await message.content.replace(prefix+command, '');

	try {
		await client.commands.get(command).execute(message, args);
	} catch (error) {
		log.error(`Client#commandExecutionError -> ${error}`);
		await message.reply('There was an error trying to execute the command.')
	}
});

client.login(token)
	.catch(e =>{
		log.error(`Client#LoginFailure -> ${e}`);
	});
