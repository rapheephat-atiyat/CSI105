

import type { RequestEvent } from "@sveltejs/kit";
import { auth } from "./auth";
import { db } from "./db";
import { players } from "./db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "player_id";

export async function getOrCreatePlayer(event: RequestEvent) {
    const session = await auth.api.getSession({
        headers: event.request.headers
    });

    const { cookies } = event;

    if (session?.user?.id) {
        let player = await db.query.players.findFirst({
            where: eq(players.userId, session.user.id)
        });

        if (!player) {
            const name = session.user.name || session.user.email?.split("@")[0] || "Anonymous";
            const [created] = await db.insert(players).values({
                type: "player",
                userId: session.user.id,
                name: name,
                avatar: session.user.image
            }).returning();

            player = created;
        }
        return player;
    }

    const cookie = cookies.get(COOKIE_NAME);

    if (cookie) {
        const player = await db.query.players.findFirst({
            where: eq(players.id, cookie)
        });

        if (player) return player;
    }
    const seed = crypto.randomUUID();
    const [player] = await db.insert(players).values({
        type: "guest",
        name: `Anonymous-${Math.floor(Math.random() * 10000)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
    }).returning();

    cookies.set(COOKIE_NAME, player.id, {
        path: "/",
        httpOnly: true,
        sameSite: 'lax'
    });

    return player;
}