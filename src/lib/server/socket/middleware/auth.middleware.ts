import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { TypedSocket } from "../type";
import * as cookie from "cookie";
import { sessions } from "$lib/server/db/schema";

export async function authMiddleware(socket: TypedSocket, next: (err?: Error) => void) {
    try {
        const raw = socket.handshake.headers.cookie;
        if (!raw) {
            socket.data.isGuest = true;
            return next();
        }

        const parsed = cookie.parse(raw);
        const playerIdFromCookie = parsed["player_id"];

        const reqHeaders = new Headers();
        for (const [key, value] of Object.entries(socket.handshake.headers)) {
            if (typeof value === "string") {
                reqHeaders.set(key, value);
            } else if (Array.isArray(value)) {
                reqHeaders.set(key, value.join(","));
            }
        }

        const authSession = await auth.api.getSession({ headers: reqHeaders });
        if (authSession && authSession.session.expiresAt > new Date()) {
            socket.data.userId = authSession.user.id;
            socket.data.isGuest = false;
            return next();
        }

        const token = parsed["better-auth.session_token"] || parsed["__Secure-better-auth.session_token"];
        if (token) {
            const session = await db.query.sessions.findFirst({
                where: eq(sessions.token, token)
            });
            if (session && session.expiresAt > new Date()) {
                socket.data.userId = session.userId;
                socket.data.isGuest = false;
                return next();
            }
        }
        socket.data.isGuest = true;
        socket.data.guestId = parsed["player_id"];
        next();
    } catch (err) {
        socket.data.isGuest = true;
        next();
    }
}