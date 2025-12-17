/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/getLiveData.ts
export type Position = {
  lat: number;
  lng: number;
  heading?: number; // optional heading for car icon rotation
  timestamp: number;
};


const center = {
  lat: 33.6684722,
  lng: 72.9966856,
};

const DEFAULT_JITTER = 0.0005;
const ONE_SHOT_TIMEOUT_MS = 6000; // wait up to 6s for first position from WS

// Helper: build ws url from env or default
function buildWsUrl(): string {
  // derive from current page so we automatically use ws:// or wss://
  const origin = window.location.origin; // e.g. http://localhost:5173 or https://...
  let base = origin;
  if (base.startsWith("http://")) base = base.replace(/^http:\/\//, "ws://");
  else if (base.startsWith("https://")) base = base.replace(/^https:\/\//, "wss://");
  // replace port if needed (backend port)
  // If backend is on different host/port, set env var or replace here
  const backendHost = "localhost:5000";
  // final ws url
  return `${base.split("://")[0]}://${backendHost}/ws/tracking`;
}

function mockPosition(): Position {
  const jitter = DEFAULT_JITTER;
  return {
    lat: center.lat + (Math.random() - 0.5) * jitter,
    lng: center.lng + (Math.random() - 0.5) * jitter,
    heading: Math.floor(Math.random() * 360),
    timestamp: Date.now(),
  };
}

/**
 * One-shot: try to get single live position from backend WS.
 * If WS not available or timeout => fallback to mockPosition().
 */
export async function getLiveData(orderId: string): Promise<Position> {
  // Try WS first
  const wsUrl = buildWsUrl();

  return new Promise<Position>((resolve) => {
    let resolved = false;
    let ws: WebSocket | null = null;
    let timeoutHandle: number | null = null;

    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      // couldn't open WS (bad URL etc) -> fallback
      console.warn("getLiveData: failed to open websocket, falling back to mock", err);
      resolve(mockPosition());
      return;
    }

    ws.onopen = () => {
      try {
        const subscribeMsg = {
          type: "subscribe",
          vehicleId: orderId || null,
          connectionKey: "default",
          pollInterval: 3000,
        };
        ws?.send(JSON.stringify(subscribeMsg));
      } catch (err) {
        // ignore send errors
      }

      // set timeout to avoid waiting forever
      timeoutHandle = window.setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            // best-effort unsubscribe then close
            ws?.send(JSON.stringify({ type: "unsubscribe" }));
          } catch (_) {
            //
          }
          try {
            ws?.close();
          } catch (_) {
            //
          }
          resolve(mockPosition());
        }
      }, ONE_SHOT_TIMEOUT_MS);
    };

    ws.onmessage = (ev) => {
      if (resolved) return;
      try {
        const msg = JSON.parse(ev.data);
        if (msg && msg.type === "position" && msg.position) {
          const p = msg.position;
          const pos: Position = {
            lat: Number(p.lat),
            lng: Number(p.lng),
            heading: typeof p.heading === "number" ? p.heading : undefined,
            timestamp: p.timestamp || Date.now(),
          };
          resolved = true;
          if (timeoutHandle) window.clearTimeout(timeoutHandle);
          // unsubscribe and close WS (one-shot)
          try {
            ws?.send(JSON.stringify({ type: "unsubscribe" }));
          } catch (err) {
            //
          }
          try {
            ws?.close();
          } catch (err) {
            //
          }
          resolve(pos);
          return;
        }
      } catch (err) {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      if (!resolved) {
        resolved = true;
        if (timeoutHandle) window.clearTimeout(timeoutHandle);
        try { ws?.close(); } catch (_) {
          //
        }
        resolve(mockPosition());
      }
    };

    ws.onclose = () => {
      if (!resolved) {
        resolved = true;
        if (timeoutHandle) window.clearTimeout(timeoutHandle);
        resolve(mockPosition());
      }
    };
  });
}

/**
 * startPollingLiveData:
 * - opens persistent WS and subscribes to backend tracking feed
 * - calls `callback` for every incoming position message
 * - returns a cleanup function that unsubscribes and closes the socket
 */
export function startPollingLiveData(
  orderId: string,
  callback: (pos: Position) => void,
  interval = 2000
) {
  const wsUrl = buildWsUrl();
  let ws: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let closedManually = false;

  // create socket and wire handlers
  function connect() {
    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      console.warn("startPollingLiveData: failed to create websocket, falling back to interval mock", err);
      // fallback to polling mock if WS cannot be created
      const timer = window.setInterval(async () => {
        const pos = mockPosition();
        callback(pos);
      }, interval);
      return () => clearInterval(timer);
    }

    ws.onopen = () => {
      // subscribe for push updates
      const subscribeMsg = {
        type: "subscribe",
        vehicleId: orderId || null,
        connectionKey: "default",
        pollInterval: interval,
      };
      try {
        ws?.send(JSON.stringify(subscribeMsg));
      } catch (err) {
        console.warn("startPollingLiveData: send subscribe failed", err);
      }
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg && msg.type === "position" && msg.position) {
          const p = msg.position;
          const pos: Position = {
            lat: Number(p.lat),
            lng: Number(p.lng),
            heading: typeof p.heading === "number" ? p.heading : undefined,
            timestamp: p.timestamp || Date.now(),
          };
          callback(pos);
        }
      } catch (err) {
        // ignore parse errors
      }
    };

    ws.onerror = (ev) => {
      console.warn("startPollingLiveData: websocket error", ev);
    };

    ws.onclose = () => {
      // if closed manually during cleanup, do not reconnect
      if (closedManually) return;
      // attempt reconnect after a short delay
      reconnectTimer = window.setTimeout(() => {
        connect();
      }, 2000);
    };

    // return cleanup that will unsubscribe and close this ws
    return () => {
      closedManually = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "unsubscribe" }));
        } catch (_) {
          //
        }
      }
      try {
        ws?.close();
      } catch (_) {
        //
      }
      ws = null;
    };
  } // end connect()

  // start connection
  const doCleanup = connect();

  // If connect returned a fallback cleanup (i.e., it was a mock interval), handle that case
  const cleanup = () => {
    closedManually = true;
    if (doCleanup) doCleanup();
  };

  return cleanup;
}
