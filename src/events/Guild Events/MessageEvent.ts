import { Message, TextChannel } from 'discord.js';
import { RunFunction } from '../../interfaces/Event';
import { Anything } from '../../interfaces/Anything';
import leven from 'leven';
import { Command } from '../../interfaces/Command';

export const name: string = 'message';
export const run: RunFunction = async (client, message: Message) => {
	if (message.partial) await message.fetch();
	if (message.member?.partial) await message.member.fetch();
	if (!message.guild) return;
	const GuildConfigSchema = await client.db.load('guildconfig');
	const GuildConfig = await GuildConfigSchema.findOne({
		Guild: message.guild.id,
	});
	if (
		(GuildConfig as Anything)?.AntiLink &&
		(GuildConfig as Anything)?.AntiLink == true &&
		!message.member?.permissions?.has(['MANAGE_GUILD']) &&
		!client.config.owners.includes(message.author.id)
	) {
		if (
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi.test(
				message.content
			)
		) {
			try {
				await message.delete();
				const msg: Message = await message.channel.send(
					client.embed({ description: 'No links allowed.' }, message)
				);
				setTimeout(async () => {
					try {
						await msg.delete();
					} catch {}
				}, 3000);
			} catch {}
		}
	}
	if ((GuildConfig as Anything)?.AntiRaid) {
		const RaidUserSchema = await client.db.load('raiduser');
		if (
			message.mentions.members.size >= 4 &&
			!message.member.permissions.has('ADMINISTRATOR')
		) {
			await RaidUserSchema.increment(
				{ Guild: message.guild.id, User: message.author.id },
				'Actions',
				1
			);
			if ((GuildConfig as Anything).AntiRaid == 'low') {
				await message.reply(
					client.embed(
						{ description: "Please don't mass mention people." },
						message
					)
				);
				if (
					((await RaidUserSchema.findOne({
						User: message.author.id,
						Guild: message.guild.id,
					})) as Anything).Actions >= 3
				) {
					try {
						await message.member.ban({ reason: 'Too many infractions.' });
						await RaidUserSchema.delete({
							Guild: message.guild.id,
							User: message.author.id,
						});
						return await message.channel.send(
							client.embed(
								{ description: `${message.author.tag} just got banned.` },
								message
							)
						);
					} catch {
						return message.channel.send(
							client.embed(
								{
									description: `I can't ban ${message.author.tag} - I either don't have BAN_MEMBERS or my highest role is either equal to the user or lower.`,
								},
								message
							)
						);
					}
				}
			} else if ((GuildConfig as Anything).AntiRaid == 'high') {
				if (
					((await RaidUserSchema.findOne({
						User: message.author.id,
						Guild: message.guild.id,
					})) as Anything).Actions >= 1
				) {
					try {
						await message.member.ban({ reason: 'Too many infractions.' });
						await RaidUserSchema.delete({
							Guild: message.guild.id,
							User: message.author.id,
						});
						return await message.channel.send(
							client.embed(
								{ description: `${message.author.tag} just got banned.` },
								message
							)
						);
					} catch {
						return message.channel.send(
							client.embed(
								{
									description: `I can't ban ${message.author.tag} - I either don't have BAN_MEMBERS or my highest role is either equal to the user or lower.`,
								},
								message
							)
						);
					}
				}
			}
		}
	}
	if (message.author.bot) return;
	const Prefix = await client.utils.getPrefix(message.guild.id);
	if (!message.content.toLowerCase().startsWith(Prefix)) return;
	const [cmd, ...args]: string[] = message.content
		.slice(Prefix.length)
		.trim()
		.split(/ +/g);
	const command: Anything =
		client.commands.get(cmd.toLowerCase()) ||
		client.commands.get(client.aliases.get(cmd.toLowerCase()));
	if (client.config.onlyUsed) {
		if (!client.config.onlyUsed.includes(message.author.id)) return;
	}
	if (!cmd.length) return;
	if (!command || command == undefined) {
		if (
			(GuildConfig as Anything)?.DidYouMean == true ||
			((GuildConfig as Anything)?.DidYouMean != false &&
				(GuildConfig as Anything)?.DidYouMean == undefined)
		) {
			const best: string[] = [
				...client.commands.map((value: Command) => value.name),
				...client.aliases.map((value: string, key: string) => key),
			].filter(
				(input: string) =>
					leven(cmd.toLowerCase(), input.toLowerCase()) < input.length * 0.4
			);
			const dym: string =
				best.length == 0
					? ''
					: best.length == 1
					? `\nDid you mean this?\n**${best[0]}**`
					: `\nDid you mean one of these?\n${best
							.slice(0, 3)
							.map((value: string) => `**${value}**`)
							.join('\n')}`;
			return message.channel.send(
				client.embed(
					{
						description: `Couldn't find that command!\nYou can disable this message by typing \`${await client.utils.getPrefix(
							message.guild.id
						)}config didyoumean no\`.${dym}`,
					},
					message
				)
			);
		} else return;
	}
	if (command) {
		if (command.userPermissions) {
			if (!message.member.permissions.has(command.userPermissions))
				return message.channel.send(
					client.embed(
						{
							description: `You need to have ${
								typeof command.userPermissions == 'string' ||
								command.userPermissions.length == 1
									? `\`${
											typeof command.userPermissions == 'string'
												? command.userPermissions
														.replace(/_/gi, ' ')
														.split(/ +/g)
														.map(
															(value: string) =>
																value[0].toUpperCase() +
																value.slice(1).toLowerCase()
														)
														.join(' ')
												: command.userPermissions[0]
														.replace(/_/gi, ' ')
														.split(/ +/g)
														.map(
															(value: string) =>
																value[0].toUpperCase() +
																value.slice(1).toLowerCase()
														)
														.join(' ')
									  }\``
									: `all of these permissions: ${command.userPermissions
											.map(
												(value: string) =>
													`\`${value
														.toLowerCase()
														.replace(/_/gi, ' ')
														.split(/ +/g)
														.map(
															(value: string) =>
																value[0].toUpperCase() +
																value.slice(1).toLowerCase()
														)
														.join(' ')}\``
											)
											.join(', ')}`
							}`,
							title: `❌ You can't use that!`,
						},
						message
					)
				);
		}

		if (
			command.ownerOnly &&
			command.ownerOnly == true &&
			!client.owners.includes(message.author.id)
		)
			return;
		if (client.cooldowns.has(`${message.author.id}${command.name}`)) {
			const cooldownTime: string = client.utils.formatMS(
				client.cooldowns.get(`${message.author.id}${command.name}`) - Date.now()
			);
			return message.channel.send(
				client.embed(
					{
						description: `You can use this command again in \`${
							cooldownTime.split('').length == 0 ? '1 second' : cooldownTime
						}\`\nDid you know, people who donate to Spencer have their cooldown time halfed! Exciting times! *Please note: For donation perks to work, you have to join Spencer support!*`,
					},
					message
				)
			);
		}
		client.cooldowns.set(
			`${message.author.id}${command.name}`,
			client.utils.checkMultipleRoles('784470505607528448', message.author.id, [
				'787656384808353803',
				'787656420258086922',
				'787656471679991829',
			])
				? Date.now() + command?.cooldown / 2
				: Date.now() + command?.cooldown
		);
	}
	command.run(client, message, args).catch((e: Error) => {
		client.logger.error(e);
		message.channel
			.send(
				client.embed(
					{
						title: `❌ An error came about..`,
						description: `\`\`\`\n${e.message}\`\`\`\nPlease join [Spencer Support](https://discord.gg/22TtDpJcNE) and report it.`,
					},
					message
				)
			)
			.catch(() => client.logger.error("Can't send error message"));
		if (e?.message?.toLowerCase()?.includes('missing permissions') || false)
			return;
		return (client.channels.cache.get(
			'787685747649019925'
		) as TextChannel).send(
			client.embed(
				{
					title: `❌ An error came about..`,
					description: `\`\`\`\n${e.stack}\`\`\`\n\`\`\`\n${
						e.message
					}\`\`\`\nNOTES: GID: ${message.guild.id} | UID: ${
						message.author.id
					} | CMD: ${command.name} | ARGS: ${args.join(' ')}`,
				},
				message
			)
		);
	});
	setTimeout(
		() => {
			client.cooldowns.delete(`${message.author.id}${command.name}`);
		},
		client.utils.checkMultipleRoles('784470505607528448', message.author.id, [
			'787656384808353803',
			'787656420258086922',
			'787656471679991829',
		])
			? command?.cooldown / 2
			: command?.cooldown
	);
};
