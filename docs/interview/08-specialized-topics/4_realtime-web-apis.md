---
sidebar_position: 4
title: "4. Real-time & Modern Web APIs"
---

# Real-time & Modern Web APIs

> *Phần này test kiến thức về Web Platform — Worker, Service Worker, IndexedDB, WebSocket, WebRTC. Hỏi ở Senior vì FE thường chỉ làm component, dev senior phải biết khi nào reach for browser API native.*

---

## Câu 1: Web Worker — khi nào dùng, implement thế nào? `[Senior]`

### Câu hỏi

> Em compute heavy task trên main thread, UI freeze. Em offload sang Web Worker thế nào?

### Giải thích lý thuyết

Web Worker chạy JS trên thread riêng — main thread không bị block.

Use case:
- Heavy computation (image processing, parsing large CSV/JSON, encryption).
- Long-running task không cần DOM.
- Background sync.

Limitation:
- Không truy cập DOM, `window`.
- Communication qua `postMessage` (serialize qua structured clone).
- Cost spawn worker ~5-50ms.
- Mỗi worker = thread → đừng spawn quá nhiều.

Types:
- **Dedicated Worker** — 1 worker cho 1 page.
- **Shared Worker** — share across tab/window cùng origin.
- **Service Worker** — proxy network, offline (khác mục đích).

### Code minh hoạ

```typescript
// 1. Inline worker với Comlink (RPC-style API, ngon hơn raw postMessage)
import * as Comlink from "comlink";

// worker.ts
const api = {
  async parseHugeCSV(csvText: string): Promise<Row[]> {
    // Heavy parsing
    const rows = csvText.split("\n").map((line) => {
      const cells = line.split(",");
      return { id: cells[0], name: cells[1], value: parseFloat(cells[2]) };
    });
    return rows;
  },

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },
};

Comlink.expose(api);

// main.ts
import * as Comlink from "comlink";
type WorkerAPI = typeof import("./worker").default;

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
const api = Comlink.wrap<WorkerAPI>(worker);

// Call như function thường — Comlink handle postMessage transparently
const rows = await api.parseHugeCSV(csvText);

// 2. Raw worker (without lib)
// worker.ts
self.addEventListener("message", async (e) => {
  const { type, payload } = e.data;

  if (type === "PARSE_CSV") {
    const rows = parseCSV(payload);
    self.postMessage({ type: "PARSE_RESULT", payload: rows });
  }
});

// main.ts
const worker = new Worker("/worker.js");

function parseCSVInWorker(csv: string): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    const handler = (e: MessageEvent) => {
      if (e.data.type === "PARSE_RESULT") {
        worker.removeEventListener("message", handler);
        resolve(e.data.payload);
      }
    };
    worker.addEventListener("message", handler);
    worker.postMessage({ type: "PARSE_CSV", payload: csv });
  });
}

// 3. Transferable objects — zero-copy transfer
const buffer = new ArrayBuffer(1024 * 1024 * 10);  // 10MB

// Without transfer: structured clone copies → slow + double memory
worker.postMessage({ buffer });

// With transfer: ownership transferred, no copy, instant
worker.postMessage({ buffer }, [buffer]);
// Sau khi transfer, main thread KHÔNG còn access buffer (length = 0)

// 4. Image processing
// worker.ts
self.onmessage = async (e) => {
  const { imageBitmap } = e.data;
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(imageBitmap, 0, 0);
  // Apply filter
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = imageData.data[i] * 0.3 + imageData.data[i + 1] * 0.59 + imageData.data[i + 2] * 0.11;
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);

  const blob = await canvas.convertToBlob();
  self.postMessage({ blob }, [await blob.arrayBuffer()]);
};

// main.ts
const file = await getFile();
const bitmap = await createImageBitmap(file);
worker.postMessage({ imageBitmap: bitmap }, [bitmap]);

// 5. React hook
function useWorker<T extends object>(workerUrl: URL): T {
  const apiRef = useRef<T>();

  useEffect(() => {
    const worker = new Worker(workerUrl, { type: "module" });
    apiRef.current = Comlink.wrap<T>(worker);

    return () => {
      apiRef.current = undefined;
      worker.terminate();
    };
  }, [workerUrl]);

  return new Proxy({} as T, {
    get(_, prop) {
      return (...args: any[]) => apiRef.current?.[prop as keyof T](...args);
    },
  });
}

// Usage
function App() {
  const workerAPI = useWorker<WorkerAPI>(new URL("./worker.ts", import.meta.url));

  const handleFile = async (file: File) => {
    const text = await file.text();
    const rows = await workerAPI.parseHugeCSV(text);
    setRows(rows);
  };
}

// 6. Worker pool — reuse, avoid spawn cost
class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ task: any; resolve: (v: any) => void }> = [];
  private busy = new Set<Worker>();

  constructor(workerUrl: URL, size = navigator.hardwareConcurrency ?? 4) {
    this.workers = Array.from({ length: size }, () =>
      new Worker(workerUrl, { type: "module" })
    );
  }

  async run<T>(task: any): Promise<T> {
    return new Promise((resolve) => {
      const free = this.workers.find((w) => !this.busy.has(w));

      if (free) {
        this.busy.add(free);
        const handler = (e: MessageEvent) => {
          free.removeEventListener("message", handler);
          this.busy.delete(free);
          this.drainQueue();
          resolve(e.data);
        };
        free.addEventListener("message", handler);
        free.postMessage(task);
      } else {
        this.queue.push({ task, resolve });
      }
    });
  }

  private drainQueue() {
    while (this.queue.length > 0) {
      const free = this.workers.find((w) => !this.busy.has(w));
      if (!free) break;
      const item = this.queue.shift()!;
      this.run(item.task).then(item.resolve);
    }
  }

  terminate() {
    this.workers.forEach((w) => w.terminate());
  }
}
```

### Đáp án mẫu

> "Web Worker chạy JS trên thread riêng, main thread không block. Em offload khi: parse large CSV/JSON (50MB+), image processing, encryption/hashing, complex calculation (Markov chain, simulation). KHÔNG dùng cho: DOM manipulation (worker không access DOM); task nhanh dưới 50ms (overhead spawn cao hơn benefit); task cần frequent UI update. **Implementation**: em prefer **Comlink** thay raw `postMessage` — RPC-style API, type-safe, code đọc như function call. **Transferable Objects** quan trọng cho data lớn: `worker.postMessage(buffer, [buffer])` transfer ownership thay vì copy → zero-copy, instant, không gấp đôi memory. **OffscreenCanvas** trong worker cho image processing. **Worker pool** cho repeated task — spawn N worker (= `navigator.hardwareConcurrency`) reuse, tránh cost spawn 5-50ms mỗi lần. React hook wrapping với cleanup terminate khi unmount. **Real story**: app em parse CSV 100MB user upload — main thread freeze 8s. Move sang worker với streaming parse + Transferable → main thread 0 freeze, UX progress bar smooth. **Pitfall**: structured clone serialize data — Function/DOM node/Promise không transfer được; circular reference fail. Test edge case data shape trước ship."

---

## Câu 2: Service Worker — PWA, offline, caching strategy `[Senior]`

### Câu hỏi

> Em add offline support cho app. Service Worker hoạt động ra sao? Em config caching strategy gì?

### Giải thích lý thuyết

Service Worker là **network proxy** giữa app và server. Intercept fetch, decide serve cache hay network.

Caching strategies (Workbox naming):

| Strategy              | Behavior                                                        | Use case                     |
| --------------------- | --------------------------------------------------------------- | ---------------------------- |
| **Cache First**       | Cache hit → serve. Miss → network → cache → serve.              | Static asset có hash         |
| **Network First**     | Network thử trước → fail → cache.                               | API data fresh quan trọng    |
| **Stale While Revalidate** | Cache serve ngay. Background refresh.                       | News, social feed            |
| **Network Only**      | Always network.                                                 | Auth, payment, write API     |
| **Cache Only**        | Always cache.                                                   | Offline-first data           |

Lifecycle:
1. **Register** → install → activate → fetch.
2. Update flow: new SW install → wait → activate khi tab close hoặc skipWaiting.

### Code minh hoạ

```javascript
// 1. Register service worker
// app/layout.tsx
"use client";
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New SW available — prompt user reload
              showUpdatePrompt();
            }
          });
        });
      });
  }
}, []);

// 2. Manual SW (vanilla)
// public/sw.js
const VERSION = "v1.2.0";
const STATIC_CACHE = `static-${VERSION}`;
const DYNAMIC_CACHE = `dynamic-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
];

// Install — cache static
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate — clean old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — strategy per route
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: API write — network only
  if (request.method !== "GET") {
    return;  // không intercept, native fetch
  }

  // Strategy 2: Static asset — cache first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(js|css|woff2)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Strategy 3: Image — cache first với fallback
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE).catch(() => caches.match("/icons/placeholder.png")));
    return;
  }

  // Strategy 4: API GET — stale while revalidate
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  // Strategy 5: HTML — network first với offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE).catch(() => caches.match("/offline.html"))
    );
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw e;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  return cached ?? networkPromise;
}

// 3. Workbox — declarative + battle-tested
// service-worker.ts (build qua webpack/workbox)
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST);

// Image
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// API
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new StaleWhileRevalidate({
    cacheName: "api",
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 5 * 60 })],
  })
);

// 4. Next.js PWA với next-pwa
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

module.exports = withPWA({});

// 5. Background sync — retry khi online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-posts") {
    event.waitUntil(syncOfflinePosts());
  }
});

async function syncOfflinePosts() {
  const db = await openDB("app", 1);
  const pending = await db.getAll("pending-posts");

  for (const post of pending) {
    try {
      await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(post),
      });
      await db.delete("pending-posts", post.id);
    } catch (e) {
      // Retry later
    }
  }
}

// main.ts — register sync khi submit offline
async function submitPost(post) {
  try {
    await fetch("/api/posts", { method: "POST", body: JSON.stringify(post) });
  } catch (e) {
    // Save to IndexedDB + register sync
    const db = await openDB("app", 1);
    await db.add("pending-posts", { ...post, id: crypto.randomUUID() });

    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register("sync-posts");
  }
}

// 6. Update flow UX
function ServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    });
  }, []);

  const applyUpdate = () => {
    navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="update-prompt">
      <p>Có phiên bản mới. Cập nhật?</p>
      <button onClick={applyUpdate}>Cập nhật</button>
    </div>
  );
}
```

### Đáp án mẫu

> "Service Worker là **network proxy** intercept fetch. Em config 5 strategy per route type. **Static asset có hash** (`_next/static/`) → **Cache First** + long TTL — file URL hash đổi khi content đổi, cache forever an toàn. **Image** → Cache First + LRU eviction (60 entries, 30 ngày). **API GET** → **Stale While Revalidate** — cache serve instant, background refresh — UX feels fast. **HTML navigation** → **Network First** với offline.html fallback — fresh content khi online, offline page graceful. **API write (POST/PUT/DELETE)** → KHÔNG intercept (Network Only) — không cache mutation. **Tool**: Workbox cho declarative API + battle-tested expiration logic. Next.js dùng `next-pwa`. **Background Sync API**: user submit offline → save IndexedDB + register sync → SW retry khi online. **Update flow UX**: detect new SW installed → prompt user 'có version mới, cập nhật?' → user click → `skipWaiting` + reload. KHÔNG auto-update silently (UX gây confusing — user mid-action bị reload). **Pitfall**: cache nhiều quá → storage limit (~50% disk free); old cache không clear → bloat — activate event phải delete old cache theo version. **Test**: Chrome DevTools > Application > Service Workers, toggle 'Offline' mode test full offline UX."

---

## Câu 3: WebSocket vs SSE vs Long Polling cho realtime `[Senior]`

### Câu hỏi

> Em build feature realtime (notification, live chat, collaborative editing). WebSocket, SSE, hay polling?

### Giải thích lý thuyết

| Tech              | Direction        | Stateful | Browser support | Latency   | Complexity |
| ----------------- | ---------------- | -------- | --------------- | --------- | ---------- |
| **HTTP polling**  | Client → Server  | No       | Universal       | Đợi interval | Low     |
| **Long polling**  | Server → Client  | No       | Universal       | Real-time | Medium     |
| **SSE**           | Server → Client  | Yes (open conn) | Modern    | Low       | Low        |
| **WebSocket**     | Bidirectional    | Yes      | Modern          | Lowest    | Higher     |

Decision tree:
- Server → Client only (notification, AI streaming) → **SSE**.
- Bidirectional (chat, multiplayer) → **WebSocket**.
- Simple notification + don't need realtime → polling.
- Legacy browser support → long polling fallback.

### Code minh hoạ

```typescript
// 1. SSE — đơn giản, HTTP-based, auto-reconnect
// Server (Next.js Route Handler)
export async function GET(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`));

      // Subscribe to event source (Redis pub/sub, DB listener, etc.)
      const subscription = redis.subscribe("notifications", (msg) => {
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
      });

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        subscription.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Client
function useSSE(url: string) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");

  useEffect(() => {
    const es = new EventSource(url);

    es.onopen = () => setStatus("open");
    es.onmessage = (e) => setData(JSON.parse(e.data));
    es.onerror = () => {
      setStatus("closed");
      // EventSource auto-reconnect built-in
    };

    return () => es.close();
  }, [url]);

  return { data, status };
}

// Usage
function Notifications() {
  const { data } = useSSE("/api/notifications/stream");

  useEffect(() => {
    if (data?.type === "new_message") {
      toast(data.message);
    }
  }, [data]);
}

// 2. WebSocket — bidirectional cho chat
// Client
function useWebSocket(url: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const wsRef = useRef<WebSocket>();
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    let cleanup = false;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("open");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        setMessages((prev) => [...prev, msg]);
      };

      ws.onclose = () => {
        if (cleanup) return;
        setStatus("closed");

        // Exponential backoff reconnect
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      cleanup = true;
      wsRef.current?.close();
    };
  }, [url]);

  const send = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { messages, status, send };
}

// Heartbeat — detect dead connection
function useWebSocketWithHeartbeat(url: string) {
  const ws = useWebSocket(url);

  useEffect(() => {
    if (ws.status !== "open") return;

    const interval = setInterval(() => {
      ws.send({ type: "ping" });
    }, 30000);

    return () => clearInterval(interval);
  }, [ws.status]);

  return ws;
}

// 3. Production: managed services
// Pusher, Ably, Supabase Realtime — handle reconnect, presence, channel
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Subscribe to DB changes
const channel = supabase
  .channel("messages")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
    setMessages((m) => [...m, payload.new]);
  })
  .on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    setOnlineUsers(Object.keys(state));
  })
  .subscribe();

// Cleanup
useEffect(() => () => supabase.removeChannel(channel), []);

// 4. Pattern: tách concern WebSocket
// Reconnect logic, heartbeat, type-safe messaging
class TypedWebSocket<TIn, TOut> {
  private ws?: WebSocket;
  private listeners = new Set<(msg: TIn) => void>();
  private url: string;
  private reconnectTimeout?: number;
  private heartbeatInterval?: number;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (e) => {
      const msg: TIn = JSON.parse(e.data);
      this.listeners.forEach((fn) => fn(msg));
    };

    this.ws.onclose = () => {
      clearInterval(this.heartbeatInterval);
      this.reconnectTimeout = window.setTimeout(() => this.connect(), 1000);
    };

    this.ws.onopen = () => {
      this.heartbeatInterval = window.setInterval(() => {
        this.send({ type: "ping" } as any);
      }, 30000);
    };
  }

  send(msg: TOut) {
    this.ws?.send(JSON.stringify(msg));
  }

  subscribe(fn: (msg: TIn) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  close() {
    clearTimeout(this.reconnectTimeout);
    clearInterval(this.heartbeatInterval);
    this.ws?.close();
  }
}

// Type-safe usage
type ServerMessage = { type: "message"; data: string } | { type: "user_joined"; userId: string };
type ClientMessage = { type: "send"; text: string } | { type: "ping" };

const ws = new TypedWebSocket<ServerMessage, ClientMessage>("/ws");
ws.connect();
ws.subscribe((msg) => {
  if (msg.type === "message") console.log(msg.data);
});
ws.send({ type: "send", text: "Hello" });
```

### Đáp án mẫu

> "Em chọn theo direction + complexity. **SSE** cho server → client one-way (notification, AI streaming, stock ticker, activity feed) — đơn giản nhất, HTTP-based (proxy/firewall friendly), auto-reconnect built-in trong EventSource, không cần lib. **WebSocket** cho bidirectional (chat, multiplayer, collaborative editing) — full duplex, low overhead per message sau handshake. Implementation: reconnect với **exponential backoff** (1s, 2s, 4s, ..., max 30s), **heartbeat ping/pong 30s** detect dead connection, **type-safe message** với TypeScript discriminated union. **Production em recommend managed service** (Pusher, Ably, Supabase Realtime, Liveblocks) thay vì self-host vì: presence (ai đang online), channel/room management, scaling (hàng triệu connection), authentication, replay missed messages — tự build phức tạp. **Long polling** chỉ legacy fallback nếu corporate firewall block WebSocket. **HTTP polling** đơn giản chỉ khi data không cần real-time (refresh notification 30s OK). **Pitfall**: WebSocket không qua serverless function tốt (Vercel/Lambda kill connection sau 25-30s) — phải dedicated server (Railway, Render, Fly) hoặc managed service. SSE qua Vercel OK với edge runtime keep-alive. **Em không**: dùng polling 1s thay WebSocket — wasteful + slow; chấp nhận silent reconnect fail không UX feedback."

---

## Câu 4: IndexedDB — offline data storage `[Senior]`

### Câu hỏi

> Em lưu data offline 100MB+ (user photo, edit draft). localStorage không đủ. Em dùng IndexedDB thế nào?

### Giải thích lý thuyết

| Storage         | Capacity | API           | Sync/Async | Use case                        |
| --------------- | -------- | ------------- | ---------- | ------------------------------- |
| localStorage    | ~5MB     | Simple        | Sync       | Small key-value, preferences    |
| sessionStorage  | ~5MB     | Simple        | Sync       | Tab-scoped state                |
| IndexedDB       | ~50% disk| Complex       | Async      | Large data, structured, query   |
| Cache Storage   | ~50% disk| Service Worker| Async      | Network response cache          |
| Origin Private FS| Unlimited| Modern        | Async     | Tree of files (modern API)      |

IndexedDB pros:
- Lớn (~50% available disk).
- Indexed query (range, key).
- Transaction.
- Structured object (không phải JSON string).

Cons:
- API verbose → dùng wrapper (Dexie, idb).
- Async với callback (modern lib trả Promise).

### Code minh hoạ

```typescript
// 1. Dexie — wrapper popular nhất
import Dexie, { Table } from "dexie";

interface Photo {
  id: string;
  userId: string;
  blob: Blob;
  thumbnail: Blob;
  takenAt: Date;
  location?: { lat: number; lng: number };
  uploaded: boolean;
}

interface Draft {
  id: string;
  formId: string;
  data: any;
  updatedAt: Date;
}

class AppDB extends Dexie {
  photos!: Table<Photo>;
  drafts!: Table<Draft>;

  constructor() {
    super("AppDB");

    this.version(1).stores({
      photos: "id, userId, takenAt, uploaded",  // indexes
      drafts: "id, formId, updatedAt",
    });

    // Migration version 2
    this.version(2).stores({
      photos: "id, userId, takenAt, uploaded, [userId+uploaded]",  // compound index
      drafts: "id, formId, updatedAt",
    }).upgrade((tx) => {
      // Migration logic if needed
      return tx.table("photos").toCollection().modify((photo) => {
        if (!photo.location) photo.location = null;
      });
    });
  }
}

const db = new AppDB();

// 2. CRUD operations
async function savePhoto(file: File, userId: string) {
  const thumbnail = await generateThumbnail(file);  // resize 200x200

  const photo: Photo = {
    id: crypto.randomUUID(),
    userId,
    blob: file,
    thumbnail,
    takenAt: new Date(),
    uploaded: false,
  };

  await db.photos.add(photo);
  return photo.id;
}

async function getUserPhotos(userId: string): Promise<Photo[]> {
  return db.photos.where("userId").equals(userId).reverse().sortBy("takenAt");
}

async function getPendingUploads(userId: string): Promise<Photo[]> {
  // Compound index: [userId+uploaded]
  return db.photos.where(["userId", "uploaded"]).equals([userId, 0]).toArray();
}

async function markUploaded(photoId: string) {
  await db.photos.update(photoId, { uploaded: true });
}

async function deletePhoto(photoId: string) {
  await db.photos.delete(photoId);
}

// 3. Transaction (atomicity)
async function transferOwnership(photoId: string, fromUser: string, toUser: string) {
  await db.transaction("rw", db.photos, async () => {
    const photo = await db.photos.get(photoId);
    if (!photo) throw new Error("Not found");
    if (photo.userId !== fromUser) throw new Error("Permission denied");

    await db.photos.update(photoId, { userId: toUser });
    // Rollback tự động nếu throw
  });
}

// 4. Live query — React integration
import { useLiveQuery } from "dexie-react-hooks";

function PhotoGallery({ userId }: { userId: string }) {
  const photos = useLiveQuery(
    () => db.photos.where("userId").equals(userId).toArray(),
    [userId]
  );

  if (!photos) return <Spinner />;

  return (
    <div className="gallery">
      {photos.map((p) => (
        <PhotoThumbnail key={p.id} photo={p} />
      ))}
    </div>
  );
}
// useLiveQuery auto-update khi DB change — reactive

// 5. Display Blob
function PhotoThumbnail({ photo }: { photo: Photo }) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    const objectURL = URL.createObjectURL(photo.thumbnail);
    setUrl(objectURL);

    return () => URL.revokeObjectURL(objectURL);
  }, [photo.thumbnail]);

  return <img src={url} alt="" />;
}

// 6. Storage quota check
async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return null;

  const { quota, usage } = await navigator.storage.estimate();
  const percentUsed = (usage! / quota!) * 100;

  return {
    quota: quota! / 1024 / 1024,      // MB
    usage: usage! / 1024 / 1024,
    percentUsed,
    available: (quota! - usage!) / 1024 / 1024,
  };
}

// Request persistent storage (không bị evict)
async function requestPersistent() {
  if (!navigator.storage?.persist) return false;

  const isPersisted = await navigator.storage.persisted();
  if (isPersisted) return true;

  return navigator.storage.persist();  // browser show prompt
}

// 7. Sync to server when online
async function syncOfflinePhotos() {
  const pending = await db.photos.where("uploaded").equals(0).toArray();

  for (const photo of pending) {
    try {
      const formData = new FormData();
      formData.append("photo", photo.blob);
      formData.append("takenAt", photo.takenAt.toISOString());

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await markUploaded(photo.id);
      }
    } catch (e) {
      // Retry later (next sync)
    }
  }
}

// Trigger sync khi online
window.addEventListener("online", syncOfflinePhotos);

// Hoặc background sync (works khi tab closed)
if ("serviceWorker" in navigator && "SyncManager" in window) {
  navigator.serviceWorker.ready.then((reg) => reg.sync.register("sync-photos"));
}

// 8. Origin Private File System (newer API, simpler for files)
// Modern Chromium-based browser
async function savePhotoOPFS(file: File) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(file.name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();
}

async function getPhotoOPFS(filename: string): Promise<File> {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(filename);
  return fileHandle.getFile();
}
```

### Đáp án mẫu

> "Em dùng **Dexie** — wrapper IndexedDB phổ biến nhất. Schema rõ ràng với index, migration, transaction, compound index. **Capacity**: IndexedDB ~50% available disk (vài GB thường), so localStorage 5MB — đủ cho 100MB+ data. **Schema**: index field hay query (`userId`, `uploaded`), compound index cho query combine (`[userId+uploaded]`). **Migration version**: `version(2).upgrade()` cho schema change — không break user data. **Transaction**: atomic update — `db.transaction('rw', ...)` rollback nếu throw. **useLiveQuery** hook (Dexie React) — reactive, auto re-render khi DB change. **Storage Blob**: lưu File/Blob trực tiếp (không phải base64) — efficient. Render qua `URL.createObjectURL` + revoke khi unmount. **Quota management**: `navigator.storage.estimate()` check used/available, request `navigator.storage.persist()` để browser không evict cache (user prompt). **Sync to server**: pending upload queue, trigger sync khi `window.online` event hoặc Background Sync API (work khi tab closed). **Modern alternative**: **Origin Private File System (OPFS)** cho file storage đơn giản hơn — vài line code, không cần schema, available trên Chromium 109+. Use case của em: photo gallery offline, draft form, large dataset cache (10k+ row dropdown), e-reader content. Pitfall: IndexedDB transaction auto-commit khi await Promise non-Dexie — phải dùng Dexie await để giữ transaction context."

---

## Câu 5: Modern Web APIs — what's worth using? `[Senior]`

### Câu hỏi

> 2024-2025 có nhiều API mới (View Transitions, Speculation Rules, OPFS, WebGPU). Em dùng cái nào, skip cái nào?

### Giải thích lý thuyết

Modern API checklist (2024-2025):

| API                  | Status          | Use case                          | Browser support     |
| -------------------- | --------------- | --------------------------------- | ------------------- |
| **View Transitions** | Stable Chrome   | Page transitions smooth           | Chrome 111+, Safari 18+ |
| **Speculation Rules**| Chrome 121+     | Prefetch/prerender hint           | Chromium only       |
| **OPFS**             | All major       | File storage simple               | Chrome 102+         |
| **WebGPU**           | Chrome 113+     | High-perf graphics, ML            | Chrome 113+, Safari 18 |
| **Popover API**      | All major 2024  | Native modal/tooltip              | Chrome 114+, Safari 17 |
| **Anchor positioning**| Chrome 125+    | Tooltip/dropdown positioning      | Chrome only         |
| **CSS Container Queries** | Stable     | Component responsive              | Universal modern    |
| **CSS `:has()`**     | Stable          | Parent selector                   | Universal modern    |
| **`scroll-driven animations`** | Chrome | Scroll-linked animation           | Chrome only         |
| **WebAuthn / Passkeys** | All major    | Passwordless auth                 | Universal           |

### Code minh hoạ

```typescript
// 1. View Transitions — smooth navigation
// Native browser API, no library
async function navigate(href: string) {
  if (!document.startViewTransition) {
    location.href = href;
    return;
  }

  document.startViewTransition(async () => {
    const response = await fetch(href);
    const html = await response.text();
    document.body.innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .body.innerHTML;
  });
}

// CSS — control transition
::view-transition-old(root) { animation: fade-out 0.3s; }
::view-transition-new(root) { animation: fade-in 0.3s; }

// Element-level transition
.photo { view-transition-name: photo-hero; }
// Click photo → navigate → photo morph smooth to new layout

// Next.js App Router với View Transitions (experimental)
// next.config.js
experimental: { viewTransition: true }

// 2. Speculation Rules — prefetch + prerender
<script type="speculationrules">
{
  "prerender": [
    { "where": { "href_matches": "/products/*" }, "eagerness": "moderate" }
  ],
  "prefetch": [
    { "where": { "href_matches": "/*" }, "eagerness": "conservative" }
  ]
}
</script>
// Browser prerender link (full page render in background) — click feel instant
// Works only Chromium browser

// 3. Popover API — native modal
<button popovertarget="my-modal">Open</button>
<div id="my-modal" popover>
  <h2>Modal title</h2>
  <p>Content</p>
  <button popovertarget="my-modal" popovertargetaction="hide">Close</button>
</div>

// CSS
[popover] {
  border: none;
  border-radius: 12px;
  padding: 24px;
}
[popover]::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

// JS API
const modal = document.getElementById("my-modal");
modal.showPopover();
modal.hidePopover();

// Auto: Escape close, click backdrop close, focus management

// 4. CSS Anchor Positioning — tooltip/dropdown
<button id="trigger">Hover me</button>
<div id="tooltip" popover>Hello</div>

#trigger { anchor-name: --trigger; }
#tooltip {
  position-anchor: --trigger;
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
}
// Browser tự position tooltip relative anchor — không cần Floating UI lib

// 5. WebAuthn / Passkeys
// Register passkey
async function registerPasskey(userId: string, email: string) {
  const challenge = await fetch("/api/passkey/challenge").then(r => r.json());

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: new Uint8Array(challenge),
      rp: { name: "MyApp", id: "example.com" },
      user: {
        id: new TextEncoder().encode(userId),
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        userVerification: "required",
        residentKey: "preferred",
      },
      attestation: "none",
    },
  });

  // Send credential to server
  await fetch("/api/passkey/register", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

// Login với passkey
async function loginWithPasskey() {
  const challenge = await fetch("/api/passkey/login/challenge").then(r => r.json());

  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: new Uint8Array(challenge),
      rpId: "example.com",
      userVerification: "required",
    },
  });

  await fetch("/api/passkey/login/verify", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

// Phishing-resistant! Credential bind tới domain, không thể dùng cross-origin

// 6. CSS `:has()` — parent selector
/* Card có image — different padding */
.card:has(img) {
  padding: 0;
}

/* Form has error — show error state */
form:has(input:invalid) .submit-btn {
  background: gray;
  pointer-events: none;
}

/* List có > 5 item — switch to compact */
ul:has(li:nth-child(6)) {
  font-size: 0.875rem;
}

// 7. Scroll-driven animations (CSS only)
@keyframes parallax {
  to { transform: translateY(-100px); }
}

.hero-bg {
  animation: parallax linear;
  animation-timeline: scroll();
  animation-range: 0 50vh;
}
// Không cần JS, browser optimize

// 8. CSS Container Queries
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 2fr; }
}
// Component respond theo container width, không viewport
```

### Đáp án mẫu

> "Em đánh giá theo support + value. **Dùng ngay (universal modern support)**: **CSS Container Queries** — game-changer cho responsive component-level; **CSS `:has()`** — parent selector, eliminate nhiều JS workaround; **OPFS** cho file storage offline; **WebAuthn/Passkeys** — phishing-resistant auth, future of password. **Dùng có fallback (Chrome-first, Safari 18+)**: **View Transitions** — smooth page transition, fallback graceful (no transition cũng OK); **Popover API** — native modal/tooltip với focus management built-in, fallback to JS modal cho old browser. **Skip cho production (chỉ Chromium)**: **Speculation Rules** — chỉ benefit Chrome user (nhưng vì additive, không hurt nên enable luôn); **CSS Anchor Positioning** — chờ Safari support; **scroll-driven animations** — chờ universal. **Watch carefully**: **WebGPU** — game/ML/3D visualization niche use case, em chưa apply production. **Em không dùng**: feature alpha-stage không có spec stable. **Strategy**: progressive enhancement — base experience work everywhere, modern API add polish where supported. Detect feature: `if ('startViewTransition' in document) { ... }` — không assume. Khi có Vercel/Cloudflare CDN, dùng `Speculation Rules` cho free CTR boost trên Chrome user (60%+ traffic) — net positive."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Worker giải quyết mọi performance issue"              | Spawn cost + serialize cost — task ngắn không worth                  |
| "Service Worker = offline support"                     | Cache strategy + invalidation + update flow phức tạp hơn nhiều       |
| "WebSocket cho mọi realtime"                           | SSE đủ cho server-push only, đơn giản hơn                            |
| "localStorage cho large data"                          | 5MB limit; IndexedDB cho large + structured                          |
| "Modern API = chỉ Chrome chạy"                         | Phần lớn API có fallback path; progressive enhancement                |
| "Background Sync sẽ retry mãi mãi"                     | Browser policy; có thể bị throttle/skip                              |
| "View Transitions thay framer-motion"                  | View Transitions cho page navigation, framer-motion cho component   |
