import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { gameRooms } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const room = await db.query.gameRooms.findFirst({
        where: eq(gameRooms.joinCode, params.id)
    });

    if (!room) throw error(404, "Room not found");

    return { room };
};