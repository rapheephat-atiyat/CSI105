import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { TypedSocket } from "../type";
import { players, users } from "$lib/server/db/schema";

export async function getOrCreatePlayer(socket: TypedSocket) {
    const guestId = socket.data.guestId;
    if (guestId) {
        const existingPlayer = await db.query.players.findFirst({
            where: eq(players.id, guestId)
        });
        if (existingPlayer) return existingPlayer;
    }

    if (socket.data.userId) {
        const userRow = await db.query.users.findFirst({
            where: eq(users.id, socket.data.userId)
        });

        let player = await db.query.players.findFirst({
            where: eq(players.userId, socket.data.userId)
        });

        if (!player) {
            const [inserted] = await db.insert(players).values({
                type: "player",
                userId: socket.data.userId,
                name: userRow?.name ?? "Anonymous",
                avatar: userRow?.image ?? null
            }).returning();
            player = inserted;
        } else if (userRow && (player.name !== userRow.name || player.avatar !== userRow.image)) {
            const [updated] = await db.update(players)
                .set({ name: userRow.name, avatar: userRow.image })
                .where(eq(players.userId, socket.data.userId))
                .returning();
            player = updated;
        }
        return player;
    }

    throw new Error("ไม่พบข้อมูลตัวตนผู้เล่น กรุณารีเฟรชหน้าจอ");
}