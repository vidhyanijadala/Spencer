import { Command, RunFunction } from '../../interfaces/Command';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import ms from 'ms';
import alphaSort from 'alpha-sort';
import { Anything } from '../../interfaces/Anything';
export const name: string = 'help';
export const run: RunFunction = async (client, message, args) => {
	const Prefix = await client.utils.getPrefix(message.guild.id);
	const fields: Array<EmbedFieldData> = [...client.categories]
		.filter((value: string) => value != 'owner')
		.map((category: string) => {
			return {
				name: `${category[0].toUpperCase() + category.slice(1)} [${
					client.commands.filter((cmd: Command) => cmd.category == category)
						.size
				}]`,
				value: client.commands
					.filter((cmd: Command) => cmd.category == category)
					.map((cmd: Command) => `\`${cmd.name}\``)
					.join(', '),
			};
		});
	const commandEmbed: MessageEmbed = client.embed(
		{
			fields,
			title: `Prefix: \`${Prefix}\``,
			description: `**${client.user.username}** currently has **${
				client.commands.filter((value: Command) => value.category != 'owner')
					.size
			}** public commands available!\nWant to support us? Go to the [GitHub repo](https://github.com/Milo123459/Spencer) and give us a star! You can also click that discussions button to ask questions, submit ideas, etc!`,
		},
		message
	);
	if (!args[0]) return message.channel.send(commandEmbed);
	if (
		args[0] &&
		!client.commands
			.filter((value: Command) => value.category != 'owner')
			.has(args[0].toLowerCase()) &&
		!client.commands
			.filter((value: Command) => value.category != 'owner')
			.has(client.aliases.get(args[0].toLowerCase()))
	)
		return message.channel.send(commandEmbed);
	const command =
		client.commands
			.filter((value: Command) => value.category != 'owner')
			.get(args[0].toLowerCase()) ||
		client.commands
			.filter((value: Command) => value.category != 'owner')
			.get(client.aliases.get(args[0].toLowerCase()));
	message.channel.send(
		client.embed(
			{
				description: Object.entries(command)
					.sort((a: [string, any], b: [string, any]) => alphaSort()(a[0], b[0]))
					.filter((data) => typeof data[1] != 'function')
					.map((data) =>
						data[0] == 'usage'
							? `**Usage**: \`${Prefix}${(command as Anything).name} ${
									data[1]
							  }\``
							: `**${data[0][0].toUpperCase() + data[0].slice(1)}**: ${
									data[1].map
										? data[1].map((d: unknown) => `\`${d}\``).join(', ')
										: typeof data[1] == 'number'
										? `\`${ms(data[1], { long: true })}\``
										: `\`${data[1]}\``
							  }`
					)
					.join('\n'),
				title: `Prefix: \`${Prefix}\``,
				fields: [
					{
						name: 'Note!',
						value: 'If usage, [] = optional, <> = required.',
						inline: true,
					},
				],
			},
			message
		)
	);
};
export const category: string = 'info';
export const aliases: string[] = ['h', 'commands'];
export const usage: string = '[cmd or alias]';
export const description: string = 'Get help';
