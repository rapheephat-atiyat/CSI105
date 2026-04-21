import { db } from '$lib/server/db';
import { eq, desc } from 'drizzle-orm';
import { players, roomParticipants, gameRooms, users, historicGames } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const session = event.locals.session;
	const sessionUser = event.locals.user;

	if (!session || !sessionUser) {
		throw redirect(302, '/signin');
	}

	const userRecord = await db.query.users.findFirst({
		where: eq(users.id, sessionUser.id)
	});

	const playerRecord = await db.query.players.findFirst({
		where: eq(players.userId, sessionUser.id)
	});

	if (!playerRecord) {
		return { user: userRecord || sessionUser, history: [] };
	}

	const history = await db
		.select({
			roomId: historicGames.roomId,
			algorithm: historicGames.algorithm,
			mode: historicGames.mode,
			score: historicGames.score,
			playedAt: historicGames.playedAt
		})
		.from(historicGames)
		.where(eq(historicGames.userId, sessionUser.id))
		.orderBy(desc(historicGames.playedAt))
		.limit(20);

	const mappedHistory = history.map(h => ({
		...h,
		status: 'ended',
		createdAt: h.playedAt
	}));

	return {
		user: userRecord || sessionUser,
		history: mappedHistory
	};
};
