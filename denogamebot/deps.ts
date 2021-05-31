export * from 'https://deno.land/x/harmony/mod.ts';
export * from './config.ts';
export * from './partials.ts';
export * from './commands.ts';

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m));
export const getRandomInt = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;
