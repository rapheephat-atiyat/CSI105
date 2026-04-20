import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { and, eq, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { gameRooms, players, roomParticipants, users } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { getOrCreatePlayer } from "$lib/server/player";

export const load: PageServerLoad = async (event) => {
    const session = await auth.api.getSession({ headers: event.request.headers });

    const room = await db.query.gameRooms.findFirst({
        where: eq(gameRooms.joinCode, event.params.id)
    });

    if (!room) throw error(404, "ไม่พบห้อง");

    const currentPlayer = await getOrCreatePlayer(event);
    const exists = await db.query.roomParticipants.findFirst({
        where: and(
            eq(roomParticipants.roomId, room.id),
            eq(roomParticipants.playerId, currentPlayer.id)
        )
    });

    const raw = await db
        .select({
            playerId: roomParticipants.playerId,
            isReady: roomParticipants.isReady,
            name: sql<string>`COALESCE(${users.name}, ${players.name})`,
            avatar: sql<string>`COALESCE(${users.image}, ${players.avatar})`
        })
        .from(roomParticipants)
        .innerJoin(players, eq(players.id, roomParticipants.playerId))
        .leftJoin(users, eq(users.id, players.userId))
        .where(eq(roomParticipants.roomId, room.id));

    return {
        room,
        currentPlayer,
        isHost: room.hostPlayerId === currentPlayer.id,
        participantsData: raw
    };
};