import { RunFunction } from '../../interfaces/Command';
import { Anything } from '../../interfaces/Anything';
import { addProp } from 'tyvn';
import { items } from '../../static/Items';
import { emojis } from '../../static/Emojis';

export const run: RunFunction = async (client, message, args) => {
	const EconomySchema = await client.db.load('usereconomy');
	const User: string =
		client.utils.ResolveMember(message, args[0])?.id || message.author.id;
	const UserCoins = await EconomySchema.findOne({ User });
	const Inventory = (UserCoins as Anything)?.Inventory || {};
	return message.channel.send(
		client.embed(
			{
				fields: [
					client.utils.constructField(
						'User',
						`Tag: **${message.guild.member(User).user.tag}**\nID: **${User}**`,
						true
					),
					client.utils.constructField(
						'Coins',
						`
        Wallet: **${(UserCoins as Anything)?.Coins || 0}**
        Bank: **${(UserCoins as Anything)?.DepositedCoins || 0}**
        Total: **${addProp<Anything>(
					['Coins', 'DepositedCoins'],
					0,
					0,
					UserCoins as Anything
				)}**`,
						true
					),
					client.utils.constructField(
						'Inventory',
						`
        Unique amount of items: **${Object.entries(Inventory).length}**
        Item they have the most of: **${
					items.find(
						(v) =>
							v.id ==
							Object.entries(Inventory).sort(
								(a, b) => (b[1] as number) - (a[1] as number)
							)[0]?.[0]
					)?.name || 'Nothing.'
				}**
        `,
						true
					),
					client.utils.constructField(
						'Miscellaneous',
						`
                    Voted for Spencer in the last 12 hours: **${
											(await client.utils.tryItAndSee<string>(async () => {
												const hasVoted: boolean = await client.topGGApi.hasVoted(
													User
												);
												if (hasVoted) return 'Yes';
												else if (!hasVoted) return 'No';
											})) || 'Unknown'
										}**
                    **Ranks**: ${
											!!Object.entries(Inventory).length
												? Object.entries(Inventory)
														.filter((value: [string, number]) =>
															value[0].includes('rank')
														)
														.map(
															(value: [string, number]) =>
																emojis[value[0].split('rank')[0]]
														)
														.join(',') || '*No ranks.*'
												: '*No ranks.*'
										}
                    `
					),
				],
				description: `Get userinfo on this user: \`${
					User == message.author.id
						? `${await client.utils.getPrefix(message.guild.id)}userinfo`
						: `${await client.utils.getPrefix(
								message.guild.id
						  )}userinfo ${User}`
				}\``,
			},
			message
		)
	);
};
export const name: string = 'profile';
export const category: string = 'economy';
export const description: string = 'Get info on someone in the economy';
