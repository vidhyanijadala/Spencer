import { ShoukakuNodeOptions } from 'shoukaku';
export interface Config {
	token: string;
	mongoURI: string;
	prefix: string;
	owners: Array<string>;
	webAuth?: string;
	webPort?: number;
	topGGToken?: string;
	onlyUsed?: string[];
	lavalinkNodes: ShoukakuNodeOptions[];
}
