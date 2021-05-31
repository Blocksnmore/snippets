import {
	Interaction,
	InteractionResponseFlags,
	Embed,
	sleep,
	inviteTimeout,
	isMessageComponentInteraction,
	InteractionResponseType,
	getRandomInt,
	MessageComponentData,
	TTTNotSelected,
} from '../deps.ts';

const tttMatchUsers = new Set<string>();
const matchData = new Map<string, tttGameData>();
const userGameRedirects = new Map<string, string>();
const outgoingRequests = new Map<string, string>();

export async function TTTCommand(i: Interaction): Promise<void> {
	// @ts-ignore It works, ts being dumb
	const targetUserID: string = i.options[0].value;

	if (tttMatchUsers.has(i.user.id)) {
		await i.respond({
			content: 'You already have a game open!',
			flags: InteractionResponseFlags.EPHEMERAL,
		});
		return;
	}

	if (i.user.id == targetUserID) {
		await i.respond({
			content: "You can't play a game with yourself!",
			flags: InteractionResponseFlags.EPHEMERAL,
		});
		return;
	}

	tttMatchUsers.add(i.user.id);
	outgoingRequests.set(i.user.id, targetUserID);
	const reply = await i.respond({
		content: '<@!' + targetUserID + '>',
		embeds: [
			new Embed()
				.setTitle('TicTacToe request')
				.setDescription(
					`${i.user.username} is inviting you to a game of TicTacToe! 
            Click the \`Accept\` button to play!`
				)
				.setColor('#daa520')
				.setFooter(`This will time out in ${inviteTimeout} seconds!`),
		],
		components: [
			{
				type: 1,
				components: [
					{
						type: 2,
						label: 'Accept',
						style: 'GREEN',
						customID: 'acceptgamettt',
					},
					{
						type: 2,
						label: 'Deny',
						style: 'RED',
						customID: 'denygamettt',
					},
				],
			},
		],
	});
	for (let timer = 1; timer <= inviteTimeout * 10; timer++) {
		await sleep(100);
		if (!outgoingRequests.has(i.user.id)) return;
		if (timer == inviteTimeout * 10) {
			reply.editResponse({
				content: '<@!' + targetUserID + '>',
				embeds: [
					new Embed()
						.setTitle('TicTacToe request expired')
						.setDescription(
							`The request from ${i.user.username} expired!`
						)
						.setColor('#daa520'),
				],
				components: [],
			});
			outgoingRequests.delete(i.user.id);
			tttMatchUsers.delete(i.user.id);
		}
	}
}

export async function TTTButtonPress(i: Interaction) {
	if (i.message?.author.id != i.client.user?.id) return;
	if (isMessageComponentInteraction(i)) {
		if (i.customID == 'acceptgamettt') {
			for (const [key, value] of outgoingRequests) {
				if (value == i.user.id) {
					const game = generateGame(i.user.id, key);
					i.message.edit({
						content: '_ _',
						embed: new Embed()
							.setTitle('TicTacToe')
							.setDescription(
								'Turn: <@!' +
									game[game.turn] +
									'> [' +
									game.turn.toUpperCase() +
									']'
							)
							.setColor('#daa520'),
						components: generateTTTButtons(game),
					});
					outgoingRequests.delete(key);
					userGameRedirects.set(i.user.id, key);
					matchData.set(key, game);
					i.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					return;
				} else continue;
			}
			await i.respond({
				content:
					'That game could not be found! The request might have expired or is not for you.',
				flags: InteractionResponseFlags.EPHEMERAL,
			});
		} else if (i.customID == 'denygamettt') {
			for (const [key, value] of outgoingRequests) {
				if (value == i.user.id) {
					i.message.edit({
						content: '_ _',
						embed: new Embed()
							.setTitle('TicTacToe')
							.setDescription(
								i.user.username + ' denied the request'
							)
							.setColor('#daa520'),
						components: [],
					});
					outgoingRequests.delete(key);
					tttMatchUsers.delete(key);
					i.respond({
						type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
					});
					return;
				} else continue;
			}
			await i.respond({
				content:
					'That game could not be found! The request might have expired or is not for you.',
				flags: InteractionResponseFlags.EPHEMERAL,
			});
		} else {
			const saveID: string = userGameRedirects.has(i.user.id)
				? (userGameRedirects.get(i.user.id) as string)
				: i.user.id;
			const gamedata: tttGameData = matchData.get(saveID) as tttGameData;
			if (gamedata == null) {
				await i.respond({
					content:
						'That game could not be found! This is likely not your game!',
					flags: InteractionResponseFlags.EPHEMERAL,
				});
				return;
			}
			if (gamedata[gamedata.turn] != i.user.id) {
				await i.respond({
					content: 'It is currently not your turn!',
					flags: InteractionResponseFlags.EPHEMERAL,
				});
				return;
			}
			// @ts-ignore ts being dumb
			gamedata[i.customID] = gamedata.turn;

			if (winCheck(gamedata)) {
				i.message.edit({
					content: '_ _',
					embed: new Embed()
						.setTitle('TicTacToe')
						.setDescription(
							'<@!' +
								gamedata[gamedata.turn] +
								'> [' +
								gamedata.turn.toUpperCase() +
								'] Won!'
						)
						.setColor('#daa520'),
					components: generateTTTButtons(gamedata, true),
				});
				matchData.delete(saveID);
				userGameRedirects.delete(gamedata.o);
				userGameRedirects.delete(gamedata.x);
				tttMatchUsers.delete(gamedata.o);
				tttMatchUsers.delete(gamedata.x);
				i.respond({
					type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
				});
				return;
			}

			if (tieCheck(gamedata)) {
				i.message.edit({
					content: '_ _',
					embed: new Embed()
						.setTitle('TicTacToe')
						.setDescription("It's a tie!")
						.setColor('#daa520'),
					components: generateTTTButtons(gamedata, true),
				});
				matchData.delete(saveID);
				userGameRedirects.delete(gamedata.o);
				userGameRedirects.delete(gamedata.x);
				tttMatchUsers.delete(gamedata.o);
				tttMatchUsers.delete(gamedata.x);
				i.respond({
					type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
				});
				return;
			}

			gamedata.turn = gamedata.turn == 'x' ? 'o' : 'x';
			i.message.edit({
				content: '_ _',
				embed: new Embed()
					.setTitle('TicTacToe')
					.setDescription(
						'Turn: <@!' +
							gamedata[gamedata.turn] +
							'> [' +
							gamedata.turn.toUpperCase() +
							']'
					)
					.setColor('#daa520'),
				components: generateTTTButtons(gamedata),
			});
			matchData.set(saveID, gamedata);
			i.respond({
				type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
			});
		}
	}
}

interface tttGameData {
	'11': 'x' | 'o' | null;
	'12': 'x' | 'o' | null;
	'13': 'x' | 'o' | null;
	'21': 'x' | 'o' | null;
	'22': 'x' | 'o' | null;
	'23': 'x' | 'o' | null;
	'31': 'x' | 'o' | null;
	'32': 'x' | 'o' | null;
	'33': 'x' | 'o' | null;
	turn: 'x' | 'o';
	x: string;
	o: string;
}

function generateGame(player1: string, player2: string): tttGameData {
	for (let i = getRandomInt(1, 100); i <= 100; i++) {
		getRandomInt(1, 2);
	}
	return {
		'11': null,
		'12': null,
		'13': null,
		'21': null,
		'22': null,
		'23': null,
		'31': null,
		'32': null,
		'33': null,
		x: player1,
		o: player2,
		turn: getRandomInt(1, 2) == 1 ? 'x' : 'o',
	};
}

const style = (opt: string | null): 'GREY' | 'RED' | 'GREEN' =>
	opt ? (opt == 'x' ? 'RED' : 'GREEN') : 'GREY';

const selected = (opt: string | null): string =>
	opt ? opt.toUpperCase() : TTTNotSelected;

const tieCheck = (data: tttGameData) =>
	data['11'] &&
	data['12'] &&
	data['13'] &&
	data['21'] &&
	data['22'] &&
	data['23'] &&
	data['31'] &&
	data['32'] &&
	data['33'];

function winCheck(data: tttGameData): boolean {
	let win = false;
	['x', 'o'].forEach((turn) => {
		if (
			(data['11'] == turn && data['12'] == turn && data['13'] == turn) ||
			(data['21'] == turn && data['22'] == turn && data['23'] == turn) ||
			(data['31'] == turn && data['32'] == turn && data['33'] == turn) ||
			(data['11'] == turn && data['21'] == turn && data['31'] == turn) ||
			(data['12'] == turn && data['22'] == turn && data['32'] == turn) ||
			(data['13'] == turn && data['23'] == turn && data['33'] == turn) ||
			(data['11'] == turn && data['22'] == turn && data['33'] == turn) ||
			(data['13'] == turn && data['22'] == turn && data['31'] == turn)
		) {
			win = true;
		}
	});
	return win;
}

function generateTTTButtons(
	data: tttGameData,
	disableall?: boolean | null
): MessageComponentData[] {
	return [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: selected(data['11']),
					customID: '11',
					style: style(data['11']),
					disabled: disableall || data['11'] != null,
				},
				{
					type: 2,
					label: selected(data['12']),
					customID: '12',
					style: style(data['12']),
					disabled: disableall || data['12'] != null,
				},
				{
					type: 2,
					label: selected(data['13']),
					customID: '13',
					style: style(data['13']),
					disabled: disableall || data['13'] != null,
				},
			],
		},
		{
			type: 1,
			components: [
				{
					type: 2,
					label: selected(data['21']),
					customID: '21',
					style: style(data['21']),
					disabled: disableall || data['21'] != null,
				},
				{
					type: 2,
					label: selected(data['22']),
					customID: '22',
					style: style(data['22']),
					disabled: disableall || data['22'] != null,
				},
				{
					type: 2,
					label: selected(data['23']),
					customID: '23',
					style: style(data['23']),
					disabled: disableall || data['23'] != null,
				},
			],
		},
		{
			type: 1,
			components: [
				{
					type: 2,
					label: selected(data['31']),
					customID: '31',
					style: style(data['31']),
					disabled: disableall || data['31'] != null,
				},
				{
					type: 2,
					label: selected(data['32']),
					customID: '32',
					style: style(data['32']),
					disabled: disableall || data['32'] != null,
				},
				{
					type: 2,
					label: selected(data['33']),
					customID: '33',
					style: style(data['33']),
					disabled: disableall || data['33'] != null,
				},
			],
		},
	];
}
