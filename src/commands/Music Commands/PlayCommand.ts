import { RunFunction } from '../../interfaces/Command';
import ms from 'ms';
export const run: RunFunction = async (client, message, args) => {
	if (!args.length)
		return message.channel.send(
			client.embed(
				{ description: 'Please specify a song URL or something to search!' },
				message
			)
		);
	const checked = client.utils.checkVC(message);
	if (!checked)
		return message.channel.send(
			client.embed(
				{
					description:
						'You have to be in a voice channel and be in the same voice channel as me!',
				},
				message
			)
		);
	const node = client.music.shoukaku.getNode();
	if (client.utils.checkURL(args.join(' '))) {
		const result = await node.rest.resolve(args.join(' '));
		if (!result || !result?.tracks?.length)
			return message.channel.send(
				client.embed({ description: "I couldn't find that song!" }, message)
			);
		const playlist = result.type == 'PLAYLIST';
		const track = result?.tracks?.shift();
		if (!track)
			return message.channel.send(
				client.embed({ description: "I couldn't find that song!" }, message)
			);
		if (track.info.isStream)
			return message.channel.send(
				client.embed({ description: 'You cannot play live streams!' }, message)
			);
		if (track.info.length > ms('3h'))
			return message.channel.send(
				client.embed(
					{
						description:
							'You can only play songs that are less then 3 hours long!',
					},
					message
				)
			);
		await client.music.handle(node, track, message);
		if (playlist) {
			for (const track of result.tracks) {
				if (track.info.isStream) return;
				if (track.info.length > ms('3h')) return;
				await client.music.handle(node, track, message);
			}
		}
		return message.channel.send(
			client.embed(
				{
					description: playlist
						? `Queued **${result.playlistName}** and all of its ${result.tracks.length} songs.`
						: `Queued **${track.info.title}** by **${track.info.author}**`,
				},
				message
			)
		);
	} else {
		const searchData = await node.rest.resolve(args.join(' '), 'youtube');
		if (!searchData.tracks.length)
			return message.channel.send(
				client.embed(
					{ description: "I couldnt't find anything with that query!" },
					message
				)
			);
		const track = searchData.tracks.shift();
		await client.music.handle(node, track, message);
		return message.channel.send(
			client.embed(
				{ description: `Added the track **${track.info.title}** in queue!` },
				message
			)
		);
	}
};
export const name: string = 'play';
export const category: string = 'music';
export const description: string = 'Play some music';
export const usage: string = '<song name | youtube vid url / playlist url>';
