import { error, json } from "@sveltejs/kit";
import { auth } from "./auth"

export const getAuth = async (headers: Headers) => {
    return await auth.api.getSession({ headers });
}

export const checkAuth = async (headers: Headers) => {
    const session = await getAuth(headers);
    if (!session) throw error(401, "Unauthorized");
    return session;
}

export const sendSuccess = <T>(data?: T, status = 200) => {
    return json({ success: true, data }, { status });
}

export const sendError = (message: string, status = 400) => {
    return json({ success: false, message }, { status });
}
