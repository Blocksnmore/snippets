// THIS USES DENO & HARMONY
import {
	Client,
	slash,
	event,
	Interaction,
	GatewayIntents,
	SlashCommandOptionType,
	isMessageComponentInteraction,
	InteractionResponseFlags,
	InteractionResponseType,
} from 'https://deno.land/x/harmony/mod.ts';
import { Token } from './config.ts';
import { ttc, ttctemplate } from './games.ts';
import { ttcbuttons, winCheck, tieCheck } from './buttons.ts';

const guilds: string[] = ['725103887584985088', '688115766867918950'];
const ttcgames = new Map<string, ttc>();
const rewrites = new Map<string, string>();

class bot extends Client {
	@event()
	ready(): void {
		console.log('Started bot!');
		guilds.forEach((g) => {
			this.slash.commands.create(
				{
					name: 'ttc',
					description: 'Play tic tac toe',
					options: [
						{
							name: 'user',
							description: 'User you want to play with',
							type: SlashCommandOptionType.USER,
							required: true,
						},
					],
				},
				g
			);
		});
	}
	@slash('ttc')
	async tictactoe(i: Interaction): Promise<void> {
		if (ttcgames.has(i.user.id)) {
			i.reply('You already have a game open!');
			return;
		}
		// @ts-ignore It works but ts is being dum
		const option = i.options[0];
		if (option.value == i.user.id) {
			await i.reply("You can't play with yourself!");
			return;
		}
		const reply = await i.reply(
			'Reply with `y` to accept this match <@!' +
				option.value +
				'> [This will time out in 30 seconds]'
		);
		const message = await i.client.waitFor(
			'messageCreate',
			(m) =>
				m.author.id == option.value &&
				m.content.toLowerCase() == 'y' &&
				m.channelID == i.channel?.id,
			30 * 1000
		);
		if (!message[0]) {
			reply.editResponse('Request timed out!');
			return;
		} else {
			const msg = message[0];
			msg.delete();
			ttcgames.set(i.user.id, ttctemplate(msg.author.id, i.user.id));
			rewrites.set(msg.author.id, i.user.id);
			reply.editResponse({
				content: 'Turn: ' + msg.author.mention,
				components: ttcbuttons(ttcgames.get(i.user.id) as ttc),
			});
			return;
		}
	}

	@event('interactionCreate')
	async onButtonPress(i: Interaction) {
		if (isMessageComponentInteraction(i)) {
			if (
				i.customID != null &&
				!isNaN(parseInt(i.customID)) &&
				i.message?.author.id == i.client.user?.id
			) {
				const saveid = rewrites.has(i.user.id)
					? (rewrites.get(i.user.id) as string)
					: i.user.id;
				const game = ttcgames.get(saveid) as ttc;
				if(game == null){
					await i.reply({
						flags: InteractionResponseFlags.EPHEMERAL,
						content: 'An error occured while trying to find that game!',
					});
					return;
				}

				const turn = game.o == i.user.id ? 'o' : 'x';

				if (game.turn != turn) {
					await i.reply({
						flags: InteractionResponseFlags.EPHEMERAL,
						content: 'It is not your turn!',
					});
					return;
				}
				game.turn = game.o != i.user.id ? 'o' : 'x';
				// @ts-ignore it works
				game[i.customID] = turn;
				const next = game[game.turn];
				ttcgames.set(saveid, game);

				if (await winCheck(game)) {
					i.message.edit({
						content: i.user.mention + ' won!',
						components: ttcbuttons(ttcgames.get(saveid) as ttc),
					});
					i.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					ttcgames.delete(saveid);
					rewrites.delete(game.o);
					rewrites.delete(game.x);
					return;
				} else if (await tieCheck(game)) {
					i.message.edit({
						content: "It's a tie!",
						components: ttcbuttons(ttcgames.get(saveid) as ttc),
					});
					i.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					ttcgames.delete(saveid);
					rewrites.delete(game.o);
					rewrites.delete(game.x);
					return;
				} else {
					i.message.edit({
						content: 'Turn: <@!' + next + '>',
						components: ttcbuttons(ttcgames.get(saveid) as ttc),
					});
					i.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
				}
			}
		}
	}
}

new bot().connect(Token, [
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MESSAGES,
]);
