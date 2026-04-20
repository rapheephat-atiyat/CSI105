import { db } from "$lib/server/db";
import { and, eq } from "drizzle-orm";
import type { TypedServer, TypedSocket } from "../type";
import { gameRooms, players, roomParticipants } from "$lib/server/db/schema";
import { getOrCreatePlayer } from "../services/player.service";
import { broadcastRoomUpdate, leaveRoom } from "../services/room.service";
import { disconnectTimeouts } from "../state/activeGames";

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket) {
    socket.on("room:join", async ({ rCode, guestName, pin }) => {
        try {
            if (!rCode) return socket.emit("error", "ไม่พบรหัสห้อง");
            const room = await db.query.gameRooms.findFirst({
                where: eq(gameRooms.joinCode, rCode)
            });
            if (!room) return socket.emit("error", "ไม่พบห้องแข่งขัน");
            if (room.status === "ended") return socket.emit("error", "การแข่งขันนี้จบลงแล้ว");

            const player = await getOrCreatePlayer(socket);

            if (guestName && player.type === "guest" && player.name !== guestName) {
                await db.update(players).set({ name: guestName }).where(eq(players.id, player.id));
                player.name = guestName;
            }

            const existing = await db.query.roomParticipants.findFirst({
                where: and(eq(roomParticipants.roomId, room.id), eq(roomParticipants.playerId, player.id))
            });

            if (room.isPrivate && room.password && player.id !== room.hostPlayerId) {
                if (pin) {
                    if (pin !== room.password) {
                        return socket.emit("error", "รหัส PIN ไม่ถูกต้อง");
                    }
                } else if (!existing) {
                    return socket.emit("error", "รหัส PIN ไม่ถูกต้อง");
                }
            }

            if (!existing) {
                const participants = await db.query.roomParticipants.findMany({
                    where: eq(roomParticipants.roomId, room.id)
                });
                if (participants.length >= room.maxPlayers) {
                    return socket.emit("error", "ห้องเต็มแล้ว");
                }
                await db.insert(roomParticipants).values({
                    roomId: room.id,
                    playerId: player.id,
                    isReady: false
                });
            }

            const key = `${room.id}-${player.id}`;
            if (disconnectTimeouts.has(key)) {
                clearTimeout(disconnectTimeouts.get(key));
                disconnectTimeouts.delete(key);
            }

            socket.data.roomId = room.id;
            socket.data.rCode = rCode;
            socket.data.playerId = player.id;
            socket.join(rCode);

            socket.emit("room:join_success");

            await broadcastRoomUpdate(io, rCode);
        } catch (err) {
            console.error("[Socket] Join Error:", err);
            socket.emit("error", "เกิดข้อผิดพลาดในการเข้าห้อง");
        }
    });

    socket.on("room:sync", async () => {
        if (socket.data.rCode) await broadcastRoomUpdate(io, socket.data.rCode);
    });

    socket.on("room:settings:update", async ({ algoIndex }) => {
        if (socket.data.rCode) {
            io.to(socket.data.rCode).emit("room:update", { algoIndex });
        }
    });

    socket.on("player:ready", async ({ roomId }) => {
        const { playerId, rCode } = socket.data;
        if (!roomId || !playerId || !rCode) return;

        const participant = await db.query.roomParticipants.findFirst({
            where: and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.playerId, playerId))
        });

        if (participant) {
            await db.update(roomParticipants)
                .set({ isReady: !participant.isReady })
                .where(and(eq(roomParticipants.roomId, roomId), eq(roomParticipants.playerId, playerId)));
            await broadcastRoomUpdate(io, rCode);
        }
    });

    socket.on("room:leave", async () => {
        const { roomId, playerId, rCode } = socket.data;
        if (roomId && playerId && rCode) {
            await leaveRoom(io, roomId, playerId, rCode);
            socket.leave(rCode);
        }
    });
}