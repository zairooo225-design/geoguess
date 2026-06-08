import { io, Socket } from "socket.io-client";

// Safe helper to get initial server url
const getInitialServerUrl = () => {
    if (typeof window === "undefined") return "";
    
    // 1. Try saved setting in localStorage
    const stored = localStorage.getItem("GEOQUEST_SERVER_URL");
    if (stored) return stored;

    // 2. Try environment variable
    if (import.meta.env.VITE_APP_URL) return import.meta.env.VITE_APP_URL;

    // 3. Fallback to standard origin
    return window.location.origin;
};

export let SERVER_URL = getInitialServerUrl();

export let socket: Socket = io(SERVER_URL, {
    autoConnect: false,
    transports: ["polling", "websocket"]
});

export function updateSocketServerUrl(newUrl: string) {
    if (!newUrl) return socket;
    
    // Normalize URL
    const normalized = newUrl.replace(/\/$/, "");
    localStorage.setItem("GEOQUEST_SERVER_URL", normalized);
    SERVER_URL = normalized;
    
    if (socket) {
        socket.disconnect();
    }
    
    socket = io(SERVER_URL, {
        autoConnect: false,
        transports: ["polling", "websocket"]
    });
    
    return socket;
}
