import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { Server } from 'socket.io';

const webSocketServer = {
    name: 'webSocketServer',
    configureServer(server: ViteDevServer) {
        if (!server.httpServer) return;
        const io = new Server(server.httpServer);
        (globalThis as any).__io = io;

        server.ssrLoadModule('/src/lib/server/socket/handler.ts').then((module) => {
            module.setupSockets(io);
        }).catch((err) => {
            console.error('Error loading socket-handler:', err);
        });
    }
};
export default defineConfig({
    plugins: [tailwindcss(), sveltekit(), webSocketServer], server: {
        allowedHosts: true
    },
    ssr: {
        noExternal: ['lucide-svelte']
    }
});
