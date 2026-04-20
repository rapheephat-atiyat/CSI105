import { sendError, sendSuccess } from "$lib/server/api";
import { db } from "$lib/server/db";
import { gameRooms } from "$lib/server/db/schema";
import type { RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async (event) => {
    try {
        const joinCode = event.params.id;
        if (!joinCode) return sendError("ไม่พบรหัสห้อง", 400);

        const { pin } = await event.request.json() as { pin?: string };

        const room = await db.query.gameRooms.findFirst({
            where: eq(gameRooms.joinCode, joinCode.toUpperCase())
        });

        if (!room) return sendError("ไม่พบห้องนี้ในระบบ", 404);

        if (room.isPrivate) {
            if (pin !== room.password) {
                return sendError("รหัส PIN ไม่ถูกต้อง", 403);
            }
        }

        return sendSuccess({ verified: true });
    } catch (err) {
        return sendError("เกิดข้อผิดพลาดในการตรวจสอบรหัส", 500);
    }
}
