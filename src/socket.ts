import { io, Socket } from "socket.io-client";

// Safe helper to get initial server url
const getInitialServerUrl = () => {
    if (typeof window === "undefined") return "";
    
    // 1. Try saved setting in localStorage
    const stored = localStorage.getItem("GEOQUEST_SERVER_URL");
    if (stored) return stored;

    // 2. Try environment variable
    if (import.meta.env.VITE_APP_URL) return import.meta.env.VITE_APP_URL;

    // 3. Smart Fallback: if running on local Dev Port or GitHub Pages, route automatically
    // to the live Cloud Run backend container to prevent 404 socket errors.
    const origin = window.location.origin;
    if (!origin || !origin.startsWith("http") || origin.includes("github.io") || origin.includes("localhost:5173") || origin.includes("127.0.0.1:5173") || origin.includes("localhost:5174")) {
        return "https://ais-dev-ej2cpsom2qdbywrb6c5irf-216660484941.europe-west2.run.app";
    }

    // 4. Default fallback to the page's current origin
    return origin;
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
