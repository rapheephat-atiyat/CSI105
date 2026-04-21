import { db } from "$lib/server/db";
import { eq, sql } from "drizzle-orm";
import type { TypedServer, TypedSocket } from "../type";
import { gameRooms, roomParticipants } from "$lib/server/db/schema";
import { createGame, handleHint, handleMove, handleTimeout, initPlayerState } from "../services/game.service";
import { activeGames } from "../state/activeGames";

export function registerGameHandlers(io: TypedServer, socket: TypedSocket) {
    socket.on("room:start", async ({ roomId, algo, difficulty = 'normal' }) => {
        const { playerId, rCode } = socket.data;
        if (!roomId || !playerId || !rCode) return;

        const room = await db.query.gameRooms.findFirst({
            where: eq(gameRooms.id, roomId)
        });

        if (room && room.hostPlayerId === playerId) {
            const participants = await db.query.roomParticipants.findMany({
                where: eq(roomParticipants.roomId, roomId)
            });
            const allReady = participants.every(p => p.isReady);
            if (!allReady) {
                return socket.emit("error", "ผู้เล่นทุกคนยังไม่พร้อม");
            }

            await db.update(gameRooms).set({ status: "playing" }).where(eq(gameRooms.id, roomId));

            const game = createGame(roomId, algo, difficulty);
            (game as any).roundStartTime = Date.now();

            io.emit("lobby:remove", { id: rCode });
            io.to(rCode).emit("room:started", { algo, difficulty });
        }
    });

    socket.on("game:ready", async () => {
        const { roomId, playerId } = socket.data;
        if (!roomId || !playerId) return;

        const game = activeGames.get(roomId);
        if (game) {
            if (!game.players[playerId]) {
                initPlayerState(game, playerId);
            }

            const countRes = await db.select({
                count: sql<number>`count(*)`
            }).from(roomParticipants).where(eq(roomParticipants.roomId, roomId));

            (game as any).totalPlayers = Number(countRes[0]?.count ?? 1);

            socket.emit("game:new_round", {
                round: game.currentRound,
                maxRounds: game.maxRounds,
                difficulty: game.difficulty,
                array: [...game.players[playerId].currentArray],
                hintsLeft: game.players[playerId].hintsLeft,
                totalScore: game.players[playerId].score
            });
        }
    });

    socket.on("game:try_move", ({ indexA, indexB }) => {
        handleMove(socket, indexA, indexB, io);
    });

    socket.on("game:timeout", () => {
        handleTimeout(socket, io);
    });

    socket.on("game:request_hint", () => {
        handleHint(socket);
    });
}