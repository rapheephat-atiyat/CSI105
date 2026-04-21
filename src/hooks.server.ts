import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { SECRET_KEY } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import { validateTurnstile } from '@battlefieldduck/turnstile-svelte/server';

const turnstileGuard: Handle = async ({ event, resolve }) => {
	const url = new URL(event.request.url);
	if (
		event.request.method === 'POST' &&
		(url.pathname === '/api/auth/sign-in/email' || url.pathname === '/api/auth/sign-up/email')
	) {
		const token = event.request.headers.get('x-turnstile-token');
		if (!token) {
			return new Response(JSON.stringify({ error: { message: 'ระบบป้องกันบอททำงาน กรุณาลองใหม่อีกครั้ง (Turnstile Missing)' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const ip = event.getClientAddress();
		const validation = await validateTurnstile({
			secret: SECRET_KEY.replace(/,/g, '').replace(/"/g, '').trim(),
			response: token,
			remoteip: ip
		});

		if (!validation.success) {
			return new Response(JSON.stringify({ error: { message: 'ระบบป้องกันบอททำงาน กรุณาลองใหม่อีกครั้ง (Turnstile Invalid)' } }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}
	return resolve(event);
};

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = sequence(turnstileGuard, handleBetterAuth);

