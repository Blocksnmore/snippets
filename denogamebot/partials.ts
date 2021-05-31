import { SlashCommandPartial, SlashCommandOptionType } from './deps.ts';

export const BotSlashCommands: SlashCommandPartial[] = [
	{
		name: 'tictactoe',
		description: 'Play someone in a game of tictactoe!',
		options: [
			{
				name: 'user',
				type: SlashCommandOptionType.USER,
				description: 'Target user you want to play with',
				required: true,
			},
		],
	},
	{
		name: 'ttt',
		description: 'Play someone in a game of tictactoe!',
		options: [
			{
				name: 'user',
				type: SlashCommandOptionType.USER,
				description: 'Target user you want to play with',
				required: true,
			},
		],
	},
];
