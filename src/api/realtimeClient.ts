import { getAccessToken } from "../utils/tokenManager";

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_BASE_URL = rawApiBaseUrl
  .replace(/\/washioo-api\/?$/, "")
  .replace(/\/$/, "");

const websocketUrl = () => {
  const token = getAccessToken();
  if (!token) return null;
  const url = new URL(`${API_BASE_URL}/washioo-api/ws`);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
};

export type RealtimeEvent = {
  type: string;
  data?: Record<string, unknown>;
};

type RealtimeHandlers = {
  onEvent: (event: RealtimeEvent) => void;
  onOpen?: () => void;
  onDisconnect?: () => void;
};

export type RealtimeConnection = {
  close: () => void;
};

export function connectRealtime({
  onEvent,
  onOpen,
  onDisconnect,
}: RealtimeHandlers): RealtimeConnection | null {
  const url = websocketUrl();
  if (!url) return null;

  const socket = new WebSocket(url);
  let manuallyClosed = false;

  socket.onopen = () => {
    onOpen?.();
  };

  socket.onmessage = (message) => {
    try {
      onEvent(JSON.parse(message.data) as RealtimeEvent);
    } catch {
      // Ignore malformed realtime payloads; REST remains the source of truth.
    }
  };

  socket.onclose = () => {
    if (!manuallyClosed) onDisconnect?.();
  };

  socket.onerror = () => {
    socket.close();
  };

  return {
    close: () => {
      manuallyClosed = true;
      socket.close();
    },
  };
}
