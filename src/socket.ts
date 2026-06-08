import { io, Socket } from "socket.io-client";

// Get the app URL if it exists, otherwise default to current origin
const SERVER_URL = import.meta.env.VITE_APP_URL || "https://ais-pre-ej2cpsom2qdbywrb6c5irf-216660484941.europe-west2.run.app";

export const socket: Socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"]
});
