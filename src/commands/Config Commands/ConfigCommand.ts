import { RunFunction } from '../../interfaces/Command';
import { SubCommand } from '../../interfaces/ConfigCommand';
import { subcommands } from '../../static/Configs';
export const run: RunFunction = async (client, message, args) => {
	if (!args[0])
		return message.channel.send(
			client.embed(
				{
					description: `
    All available configs:
    ${subcommands
			.map(
				(value: SubCommand) =>
					`${value.key.toLowerCase()}: \`${value.description} - For: ${
						value.schema
					}\``
			)
			.join('\n')}

    You can do ${await client.utils.getPrefix(
			message.guild.id
		)}config <config-name> <value> like so, some require extra permissions.
    `,
				},
				message
			)
		);
	const subcommand: SubCommand = subcommands.find(
		(value: SubCommand) => value.key.toLowerCase() == args[0].toLowerCase()
	);
	if (!subcommand)
		return message.channel.send(
			client.embed({ description: "That config can't be found!" }, message)
		);
	if (!args.slice(1).length)
		return message.channel.send(
			client.embed(
				{
					description:
						'Please specify a value to put into the config! (or delete to stop it from running)',
				},
				message
			)
		);
	if (args[1].toLowerCase() == 'delete') {
		if (
			subcommand.schema == 'guildconfig' &&
			!message.member.permissions.has('ADMINISTRATOR')
		)
			return message.channel.send(
				client.embed({ description: 'Come back with admin...' }, message)
			);
		await (await client.db.load(subcommand.schema)).update(
			subcommand.search(client, message),
			client.utils.proper(subcommand.key, undefined)
		);
		return message.channel.send(
			client.embed({ description: `Deleted ${subcommand.key}!` }, message)
		);
	}
	const validated = subcommand.validate(client, message, args.slice(1));
	if (!!!validated.success)
		return message.channel.send(
			client.embed({ description: validated.fix }, message)
		);
	await (await client.db.load(subcommand.schema)).update(
		subcommand.search(client, message),
		client.utils.proper(
			subcommand.key,
			subcommand.parseToDB(client, message, args.slice(1))
		)
	);
	return message.channel.send(
		client.embed(
			{
				description: `Successfully set ${
					subcommand.key
				} to ${subcommand.parseToDB(client, message, args.slice(1))}!`,
			},
			message
		)
	);
};
export const name: string = 'config';
export const category: string = 'config';
export const description: string = 'Configure the bot how you like it';
export const usage: string = '<key> <config_value | delete>';
