import { db } from "$lib/server/db";
import { gameRooms, players, roomParticipants, algorithmEnum, gameRoomModeEnum } from "$lib/server/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event) => {
	const rooms = await db.select({
		id: gameRooms.id,
		joinCode: gameRooms.joinCode,
		status: gameRooms.status,
		mode: gameRooms.mode,
		algorithm: gameRooms.algorithm,
		createdAt: gameRooms.createdAt,
		hostName: players.name,
		maxPlayers: gameRooms.maxPlayers,
		isPrivate: gameRooms.isPrivate,
		playersCount: sql<number>`count(${roomParticipants.playerId})`
	})
		.from(gameRooms)
		.leftJoin(players, eq(gameRooms.hostPlayerId, players.id))
		.leftJoin(roomParticipants, eq(gameRooms.id, roomParticipants.roomId))
		.where(eq(gameRooms.status, "waiting"))
		.groupBy(
			gameRooms.id,
			gameRooms.joinCode,
			gameRooms.status,
			gameRooms.mode,
			gameRooms.algorithm,
			gameRooms.createdAt,
			gameRooms.maxPlayers,
			gameRooms.isPrivate,
			players.name
		)
		.orderBy(desc(gameRooms.createdAt));

	const init = rooms.map((r) => ({
		id: r.id,
		joinCode: r.joinCode,
		name: `${r.mode} | ${r.algorithm} Match`,
		host: r.hostName ?? 'Anonymous',
		players: r.playersCount,
		maxPlayers: r.maxPlayers,
		mode: r.mode,
		algorithm: r.algorithm,
		status: r.status,
		isPrivate: r.isPrivate,
		ping: 0,
		createdAt: r.createdAt
	}));

	return {
		init,
		algorithms: algorithmEnum.enumValues,
		modes: gameRoomModeEnum.enumValues
	};
};