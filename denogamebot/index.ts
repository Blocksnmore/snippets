import {
	Client,
	event,
	slash,
	Token,
	GatewayIntents,
	Interaction,
	BotSlashCommands,
	TTTCommand,
	TTTButtonPress,
} from './deps.ts';

class bot extends Client {
	@event()
	async ready(): Promise<void> {
		console.log('Bot has logged in!');
        (await this.slash.commands.all()).forEach(async slash=>{
            await slash.delete();
        })
		BotSlashCommands.forEach(async (slash) => {
            (await this.guilds.array()).forEach(async g=>{
                await this.slash.commands.create(slash, g);
            });
		});
	}

	@slash('tictactoe')
	@slash('ttt')
	tttCommand(i: Interaction) {
		TTTCommand(i);
	}

	@event()
	interactionCreate(i: Interaction) {
		TTTButtonPress(i);
	}
}

new bot({}).connect(Token, [
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MESSAGES,
]);
