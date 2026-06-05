---
sidebar_position: 1
title: "1. XMLHttpRequest, Fetch API"
---

# XMLHttpRequest, Fetch API

Khi muốn lấy dữ liệu từ máy chủ (server) mà không tải lại trang, JavaScript dùng các **API** (Application Programming Interface — giao diện lập trình ứng dụng) để gửi yêu cầu qua mạng. **XMLHttpRequest** là cách cũ và khá rườm rà, còn **Fetch API** là cách hiện đại, gọn gàng hơn và trả về **Promise** (đối tượng đại diện cho kết quả sẽ có trong tương lai). Bài này giúp bạn mới học hiểu cách trình duyệt giao tiếp với server để gửi và nhận dữ liệu.

---

## Mục lục

- [XMLHttpRequest (cũ)](#xmlhttprequest-cũ)
- [Fetch API](#fetch-api)
- [Request và Response](#request-và-response)
- [Error handling](#error-handling)
- [Abort request](#abort-request)
- [Thư viện hiện đại](#thư-viện-hiện-đại)

---

## XMLHttpRequest (cũ)

API legacy — vẫn hỗ trợ nhưng **không nên dùng trong code mới**:

```js
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/users");
xhr.responseType = "json";

xhr.onload = () => {
  if (xhr.status === 200) {
    console.log(xhr.response);
  }
};

xhr.onerror = () => console.error("Network error");
xhr.send();
```

Vấn đề:

- API callback-based, không Promise.
- Verbose, dễ sai.
- Khó hủy đúng cách.

XHR vẫn cần khi:
- Theo dõi **progress** upload (Fetch không hỗ trợ tốt).
- Hỗ trợ trình duyệt **rất cũ** (IE).

---

## Fetch API

API hiện đại, dựa trên Promise:

```js
// GET
const res = await fetch("/api/users");
const users = await res.json();

// POST với JSON
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "An" }),
});

const data = await res.json();
```

**Options thường dùng:**

```js
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify(payload),
  credentials: "include",  // gửi cookie cross-origin
  cache: "no-cache",
  mode: "cors",
  redirect: "follow",
  signal: abortController.signal,
});
```

---

## Request và Response

`Response` có các method **tiêu thụ body** (chỉ gọi 1 lần):

```js
const res = await fetch(url);

await res.json();       // parse JSON
await res.text();       // string thuần
await res.blob();       // file binary
await res.arrayBuffer(); // raw bytes
await res.formData();    // FormData
```

Inspect response:

```js
res.ok;          // true nếu status 200-299
res.status;      // 200, 404, 500...
res.statusText;  // "OK", "Not Found"
res.headers.get("Content-Type");
res.url;
```

:::warning[Cần lưu ý]

**`fetch` không reject với HTTP error** (4xx, 5xx) — chỉ reject với
**network error**:

```js
const res = await fetch("/not-exist");
// res.status = 404, NHƯNG không throw

// Sai
try {
  const data = await fetch("/not-exist").then(r => r.json());
} catch (err) {
  // chỉ bắt được network error, không bắt 404/500
}

// Đúng
const res = await fetch("/not-exist");
if (!res.ok) {
  throw new Error(`HTTP ${res.status}`);
}
const data = await res.json();
```

Đây là behavior **theo design** — nhưng dễ gây bug. Wrapper hàm chung
xử lý sớm:

```js
async function api(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}
```

:::

---

## Error handling

```js
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Cancelled");
      return null;
    }
    console.error("Network error", err);
    throw err;
  }
}
```

---

## Abort request

`AbortController` — hủy fetch khi cần:

```js
const ctrl = new AbortController();

fetch("/api/slow", { signal: ctrl.signal })
  .then(r => r.json())
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Cancelled");
    }
  });

// Hủy sau 5s
setTimeout(() => ctrl.abort(), 5000);

// Hoặc user click cancel
button.onclick = () => ctrl.abort();
```

`AbortSignal.timeout(ms)` (ES2022+) — shortcut:

```js
fetch(url, { signal: AbortSignal.timeout(5000) });
```

`AbortSignal.any([s1, s2])` — kết hợp nhiều signal:

```js
const userCancel = new AbortController();
const timeout = AbortSignal.timeout(5000);

fetch(url, { signal: AbortSignal.any([userCancel.signal, timeout]) });
```

---

## Thư viện hiện đại

| Thư viện | Đặc điểm |
|----------|----------|
| **Axios** | Lâu đời, có interceptor, transform sẵn |
| **ky** | Wrapper Fetch gọn, hooks, retry |
| **ofetch** | Universal (browser + Node), retry, từ Nuxt team |
| **redaxios** | Axios API nhưng dùng Fetch, ~1KB |
| **wretch** | Fluent API, lightweight |

```js
// ofetch — pattern hiện đại
import { ofetch } from "ofetch";

const data = await ofetch("/api/users", {
  method: "POST",
  body: { name: "An" }, // tự stringify
  retry: 3,
  onResponseError({ response }) {
    console.error("API error", response.status);
  },
});
```

:::info[Phân tích]

**Khi nào dùng thư viện vs fetch trực tiếp?**

**Dùng fetch khi:**

- Project nhỏ, ít HTTP call.
- Không cần feature đặc biệt.
- Bundle size critical (mỗi KB quan trọng).

**Dùng thư viện khi:**

- Cần **interceptor** (auth header, refresh token, logging).
- Cần **retry** với exponential backoff.
- Cần **timeout** mặc định.
- Cần **transform** request/response.
- Codebase lớn — muốn API thống nhất.

Trong codebase 2026, **tRPC** hoặc **Hono client** thường thay thế HTTP
client thường — type-safe end-to-end, không phải khai báo type response.

:::

:::tip[Mẹo]

**Pattern wrapper `api` cho project**:

```js
async function api(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401) {
    await refreshToken();
    return api(path, opts); // retry
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(res.status, error.message);
  }

  return res.json();
}

// Dùng
const users = await api("/users");
const user = await api("/users", { method: "POST", body: { name: "An" } });
```

Một wrapper duy nhất xử lý: auth, error format, refresh token, retry —
không lặp ở mọi call site.

:::
