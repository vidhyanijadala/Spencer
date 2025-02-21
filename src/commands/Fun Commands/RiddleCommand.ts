import { RunFunction } from '../../interfaces/Command';
import fetch from 'node-fetch';

export const run: RunFunction = async (client, message, args) => {
	const response: { question: string; answer: string } = await fetch(
		'https://no-api-key.com/api/v1/riddle'
	).then((res) => res.json());

	return message.channel.send(
		client.embed(
			{
				title: 'Riddle!',
				fields: [{ name: response.question, value: `||${response.answer}||` }],
			},
			message
		)
	);
};

export const name: string = 'riddle';
export const category: string = 'fun';
export const description: string = 'Get a random riddle and answer!';
