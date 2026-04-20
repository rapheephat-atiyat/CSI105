import { db } from "$lib/server/db";
import { gameRooms, players, roomParticipants, users } from "$lib/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { TypedServer } from "../type";

export async function broadcastRoomUpdate(io: TypedServer, rCode: string) {
    if (!rCode) return;
    const room = await db.query.gameRooms.findFirst({
        where: eq(gameRooms.joinCode, rCode)
    });

    if (!room) return;

    const participants = await db.select({
        playerId: roomParticipants.playerId,
        isReady: roomParticipants.isReady,
        score: roomParticipants.score,
        name: sql<string>`COALESCE(${users.name}, ${players.name})`,
        avatar: sql<string>`COALESCE(${users.image}, ${players.avatar})`
    })
        .from(roomParticipants)
        .leftJoin(players, eq(roomParticipants.playerId, players.id))
        .leftJoin(users, eq(players.userId, users.id))
        .where(eq(roomParticipants.roomId, room.id));

    io.to(rCode).emit("room:update", {
        id: rCode,
        status: room.status,
        players: participants
    });

    io.emit("lobby:update", {
        id: rCode,
        players: participants.length
    });
}

export async function leaveRoom(io: TypedServer, roomId: string, playerId: string, rCode: string) {
    await db.delete(roomParticipants).where(
        and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.playerId, playerId))
    );

    const [{ remaining }] = await db.select({
        remaining: sql<number>`count(*)`
    }).from(roomParticipants).where(eq(roomParticipants.roomId, roomId));

    if (Number(remaining) === 0) {
        await db.delete(gameRooms).where(eq(gameRooms.id, roomId));
        io.emit("lobby:remove", { id: rCode });
    } else {
        await broadcastRoomUpdate(io, rCode);
    }
}