import { createAuthClient } from "better-auth/client";
import { PUBLIC_ORIGIN } from '$env/static/public';

export const authClient = createAuthClient({
    baseURL: PUBLIC_ORIGIN || 'http://localhost:5173'
});