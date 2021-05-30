import { ttc } from './games.ts';
import { MessageComponentData } from 'https://deno.land/x/harmony@v2.0.0-rc2/mod.ts';

const notselected = '?';

function selected(opt: string | null): string {
	if (!opt) return notselected;
	else return opt.toUpperCase();
}
function style(opt: string | null): 'GREY' | 'RED' | 'GREEN' {
	if (!opt) return 'GREY';
	else if (opt == 'x') return 'RED';
	else return 'GREEN';
}

export function winCheck(data: ttc): boolean {
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
		){
			win = true;
		}
	});
	return win;
}

export function tieCheck(data:ttc): boolean{
    if(
        (data['11'] && data['12'] && data['13']) &&
        (data['21'] && data['22'] && data['23']) && 
        (data['31'] && data['32'] && data['33'])
    ) return true;
    return false;
}

export function ttcbuttons(data: ttc): MessageComponentData[] {
	return [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: selected(data['11']),
					customID: '11',
					style: style(data['11']),
					disabled: data['11'] != null
				},
				{
					type: 2,
					label: selected(data['12']),
					customID: '12',
					style: style(data['12']),
					disabled: data['12'] != null
				},
				{
					type: 2,
					label: selected(data['13']),
					customID: '13',
					style: style(data['13']),
					disabled: data['13'] != null
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
					disabled: data['21'] != null
				},
				{
					type: 2,
					label: selected(data['22']),
					customID: '22',
					style: style(data['22']),
					disabled: data['22'] != null
				},
				{
					type: 2,
					label: selected(data['23']),
					customID: '23',
					style: style(data['23']),
					disabled: data['23'] != null
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
					disabled: data['31'] != null
				},
				{
					type: 2,
					label: selected(data['32']),
					customID: '32',
					style: style(data['32']),
					disabled: data['32'] != null
				},
				{
					type: 2,
					label: selected(data['33']),
					customID: '33',
					style: style(data['33']),
					disabled: data['33'] != null
				},
			],
		},
	];
}
