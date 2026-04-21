import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as schema from './db/schema';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg', schema: {
			user: schema.users,
			account: schema.accounts,
			session: schema.sessions,
			verification: schema.verifications
		}
	}),
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["github", "discord", "roblox"]
		}
	},
	emailAndPassword: { enabled: true },
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		},
		discord: {
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET
		},
		// google: {
		// 	clientId: env.GOOGLE_CLIENT_ID,
		// 	clientSecret: env.GOOGLE_CLIENT_SECRET
		// },
		roblox: {
			clientId: env.ROBLOX_CLIENT_ID,
			clientSecret: env.ROBLOX_CLIENT_SECRET
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
