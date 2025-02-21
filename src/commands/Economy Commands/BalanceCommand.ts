import { RunFunction } from '../../interfaces/Command';
import { Anything } from '../../interfaces/Anything';

export const run: RunFunction = async (client, message, args) => {
	const EconomySchema = await client.db.load('usereconomy');
	const User: string =
		client.utils.ResolveMember(message, args[0])?.id || message.author.id;
	const UserCoins = await EconomySchema.findOne({ User });
	await message.channel.send(
		client.embed(
			{
				description: `${
					User == message.author.id
						? 'You have'
						: `${message.guild.members.cache.get(User).displayName} has`
				} \`$${((UserCoins as Anything)?.Coins || 0).toLocaleString()}\` in ${
					User == message.author.id ? 'your' : 'their'
				} wallet.\n${
					User == message.author.id
						? 'You have'
						: `${message.guild.members.cache.get(User).displayName} has`
				} \`$${(
					(UserCoins as Anything)?.DepositedCoins || 0
				).toLocaleString()}\` in ${
					User == message.author.id ? 'your' : 'their'
				} bank.\n${
					User == message.author.id
						? 'You have'
						: `${message.guild.members.cache.get(User).displayName} has`
				} \`$${(
					((UserCoins as Anything)?.DepositedCoins || 0) +
					((UserCoins as Anything)?.Coins || 0)
				).toLocaleString()}\` in total.`,
			},
			message
		)
	);
};

export const name: string = 'balance';
export const aliases: string[] = [
	'bal',
	'money',
	'cash',
	'howmuchdollar',
	'wallet',
	'bank',
];
export const usage: string = '[user]';
export const category: string = 'economy';
export const description: string = 'Get someones balance';
