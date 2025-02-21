import { Bio } from '../../interfaces/Bio';
import { RunFunction } from '../../interfaces/Command';
import fetch from 'node-fetch';

export const run: RunFunction = async (client, message, args) => {
	const member = client.utils.ResolveMember(message, args[0]) || message.member;
	const apiResponse: Bio = await fetch(
		`https://api.discord.bio/user/details/${member.id}`
	).then((res) => res.json());
	if (apiResponse.message)
		return message.channel.send(
			client.embed({ description: apiResponse.message }, message)
		);
	return message.channel.send(
		client.embed(
			{
				description: `
    Go to **[${member.displayName}](https://dsc.bio/${
					apiResponse.payload.user.details.slug
				})**
    Description: ${apiResponse.payload.user.details?.description || 'Unknown'}
    Staff? ${apiResponse.payload.user.details?.staff || false}
    Premium? ${apiResponse.payload.user.details?.premium || false}
    Verified? ${apiResponse.payload.user.details?.verified || false}
    Likes: ${apiResponse.payload.user.details?.likes || 0}
    Location: ${
			apiResponse.payload.user.details?.location || 'Somewhere (Unknown)'
		}
    Birthday: ${
			apiResponse.payload.user.details?.birthday || 'Some time (Unknown)'
		}
    `,
			},
			message
		)
	);
};
export const name: string = 'bio';
export const category: string = 'info';
export const usage: string = '[user]';
export const description: string = 'Get the information of a user from dsc.bio';
