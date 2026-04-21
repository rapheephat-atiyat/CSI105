import { db } from '$lib/server/db';
import { eq, desc } from 'drizzle-orm';
import { players, roomParticipants, gameRooms, users } from '$lib/server/db/schema';
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
			roomId: gameRooms.id,
			algorithm: gameRooms.algorithm,
			mode: gameRooms.mode,
			status: gameRooms.status,
			score: roomParticipants.score,
			joinedAt: roomParticipants.joinedAt,
			finishedAt: roomParticipants.finishedAt,
			createdAt: gameRooms.createdAt
		})
		.from(roomParticipants)
		.innerJoin(gameRooms, eq(roomParticipants.roomId, gameRooms.id))
		.where(eq(roomParticipants.playerId, playerRecord.id))
		.orderBy(desc(gameRooms.createdAt))
		.limit(20);

	return {
		user: userRecord || sessionUser,
		history
	};
};
