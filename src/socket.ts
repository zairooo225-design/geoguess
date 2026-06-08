import { io, Socket } from "socket.io-client";

// Get the app URL if it exists, otherwise default to current origin
const SERVER_URL = import.meta.env.VITE_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");

export const socket: Socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ["polling", "websocket"]
});
