import { getAuth, sendError, sendSuccess } from "$lib/server/api";
import { db } from "$lib/server/db";
import { algorithmEnum, gameRoomModeEnum, gameRooms, players } from "$lib/server/db/schema";
import { getOrCreatePlayer } from "$lib/server/player";
import { generateArray } from "$lib/server/socket/utils/sorting";
import type { RequestEvent, RequestHandler } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";

type GameMode = typeof gameRoomModeEnum.enumValues[number];
type Algorithm = typeof algorithmEnum.enumValues[number];

async function generateJoinCode() {
    let code;
    do {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await db.query.gameRooms.findFirst({ where: eq(gameRooms.joinCode, code) }))
    return code;
}

export const GET: RequestHandler = async () => {
    try {
        const room = await db.select({
            id: gameRooms.id,
            joinCode: gameRooms.joinCode,
            status: gameRooms.status,
            mode: gameRooms.mode,
            algorithm: gameRooms.algorithm,
            createdAt: gameRooms.createdAt,
            hostPlayer: {
                id: players.id,
                name: players.name,
                userId: players.userId,
                avatar: players.avatar
            }
        }).from(gameRooms).leftJoin(players, eq(gameRooms.hostPlayerId, players.id)).where(and(eq(gameRooms.status, "waiting"), eq(gameRooms.isPrivate, false))).orderBy(desc(gameRooms.createdAt));
        return sendSuccess(room)
    } catch (err) {
        return sendError("เกิดข้อผิดพลาด", 500)
    }
}

export const POST: RequestHandler = async (event) => {
    try {
        const { mode, algorithm, maxPlayers, isPrivate, password } = await event.request.json() as {
            mode: GameMode;
            algorithm: Algorithm;
            maxPlayers?: number;
            isPrivate?: boolean;
            password?: string;
        }

        const session = await getAuth(event.request.headers);
        const player = await getOrCreatePlayer(event);

        if (!gameRoomModeEnum.enumValues.includes(mode)) return sendError("กรุณาเลือกโหมดเกม", 400);

        if (!algorithmEnum.enumValues.includes(algorithm)) return sendError("กรุณาเลือกอัลกอริทึม", 400);

        const joinCode = await generateJoinCode();

        const initArray = await generateArray(mode)

        const [room] = await db.insert(gameRooms).values({
            joinCode: joinCode,
            status: "waiting",
            mode: mode,
            algorithm: algorithm,
            maxPlayers: maxPlayers ?? 2,
            isPrivate: isPrivate ?? false,
            password: password ?? null,
            initialArray: initArray,
            hostPlayerId: player.id
        }).returning();

        if (!room.isPrivate) {
            const io = (globalThis as any).__io;
            if (io) {
                io.emit("lobby:new", {
                    id: room.id,
                    joinCode: room.joinCode,
                    name: `${room.mode} | ${room.algorithm} Match`,
                    host: player.name ?? 'Anonymous',
                    players: 1,
                    maxPlayers: room.maxPlayers,
                    mode: room.mode,
                    algorithm: room.algorithm,
                    status: room.status,
                    isPrivate: room.isPrivate,
                    ping: 0,
                    createdAt: room.createdAt
                });
            }
        }

        return sendSuccess(room);
    } catch (err) {
        return sendError("เกิดข้อผิดพลาด", 500)
    }
}