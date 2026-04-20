import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { registerGameHandlers } from "./handlers/game.handler";
import { registerRoomHandlers } from "./handlers/room.handler";
import { authMiddleware } from "./middleware/auth.middleware";
import { activeGames, disconnectTimeouts } from "./state/activeGames";
import type { TypedServer, TypedSocket } from "./type";
import { gameRooms, roomParticipants } from "../db/schema";
import { broadcastRoomUpdate } from "./services/room.service";

export function setupSockets(io: TypedServer) {
    io.use(authMiddleware);

    io.on("connection", (socket: TypedSocket) => {
        registerRoomHandlers(io, socket);
        registerGameHandlers(io, socket);

        socket.on("ping:check", () => {
            socket.emit("ping:response");
        });

        socket.on("disconnect", () => {
            const { roomId, playerId, rCode } = socket.data;

            if (!roomId || !playerId || !rCode) return;

            const key = `${roomId}-${playerId}`;

            if (disconnectTimeouts.has(key)) {
                clearTimeout(disconnectTimeouts.get(key));
            }

            const timeout = setTimeout(async () => {
                try {
                    disconnectTimeouts.delete(key);
                    const existing = await db.query.roomParticipants.findFirst({
                        where: and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.playerId, playerId))
                    });

                    if (!existing) return;

                    await db.delete(roomParticipants).where(
                        and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.playerId, playerId))
                    );

                    const [{ remaining }] = await db.select({ remaining: sql<number>`count(*)` })
                        .from(roomParticipants)
                        .where(eq(roomParticipants.roomId, roomId));

                    if (Number(remaining) === 0) {
                        await db.delete(gameRooms).where(eq(gameRooms.id, roomId));
                        activeGames.delete(roomId);
                        io.emit("lobby:remove", { id: rCode });
                    } else {
                        await broadcastRoomUpdate(io, rCode);
                    }
                } catch (error) {
                    console.error(`[Socket] Error in disconnect cleanup for ${playerId}:`, error);
                }
            }, 3000);

            disconnectTimeouts.set(key, timeout);
        });
    });
}