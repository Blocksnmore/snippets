export interface ttc {
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

export function ttctemplate(first: string, second: string): ttc {
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
		x: first,
		o: second,
		turn: 'x',
	};
}