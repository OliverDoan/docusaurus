---
sidebar_position: 4
title: "HTTP/2/3, CORS, Cookies, JWT, OAuth"
---

# HTTP/2/3, CORS, Cookies, JWT, OAuth

Đây là nhóm câu hỏi mà bất kỳ frontend developer nào cũng phải nắm vững. Từ HTTP protocol, CORS (cái mà 90% dev đã từng gặp lỗi), cho đến authentication -- interviewer hỏi để đánh giá bạn có hiểu "bức tranh toàn cảnh" client-server communication hay chỉ biết gọi `fetch()`.

---

## Câu 1: So sánh HTTP/1.1, HTTP/2, và HTTP/3. Tại sao HTTP/2 nhanh hơn? `[Intermediate]`

### Giải thích lý thuyết

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| **Year** | 1997 | 2015 | 2022 |
| **Transport** | TCP | TCP | **QUIC (UDP)** |
| **Multiplexing** | Không (1 request/connection) | Có (nhiều request/connection) | Có + không head-of-line blocking |
| **Header** | Text, lặp lại mỗi request | Binary, HPACK compression | Binary, QPACK compression |
| **Server Push** | Không | Có | Có (ít dùng) |
| **Connection** | 6 connections/domain | 1 connection đủ | 1 connection, không handshake TCP |
| **TLS** | Optional (HTTPS riêng) | Thực tế bắt buộc | TLS 1.3 tích hợp sẵn |
| **Head-of-line blocking** | Có (TCP + HTTP level) | TCP level vẫn có | Không (QUIC giải quyết) |

**Tại sao HTTP/2 nhanh hơn HTTP/1.1:**

1. **Multiplexing**: Gửi nhiều request cùng lúc trên 1 TCP connection, thay vì mở 6 connections và chờ lần lượt
2. **Header compression**: HPACK nén headers lặp lại (cookie, user-agent...) -- giảm bandwidth
3. **Binary framing**: Dữ liệu chia thành frames nhỏ, trộn lẫn trên cùng connection
4. **Server Push**: Server gửi resource trước khi client yêu cầu (ví dụ: push CSS khi client request HTML)

**Tại sao HTTP/3 (QUIC) tốt hơn HTTP/2:**
- HTTP/2 vẫn dùng TCP -- nếu 1 packet bị mất, **tất cả streams** đều bị block (TCP head-of-line blocking)
- QUIC (UDP) giải quyết: mỗi stream độc lập, packet loss 1 stream không ảnh hưởng stream khác
- Handshake nhanh hơn: QUIC kết hợp transport + TLS handshake (0-RTT reconnect)

### Code ví dụ

```javascript
// Kiểm tra HTTP protocol version
fetch('https://api.example.com/data')
  .then(response => {
    // Không có API trực tiếp để check HTTP version trong fetch
    // Nhưng có thể xem trong DevTools -> Network -> Protocol column
    console.log(response.headers);
  });

// HTTP/2 Server Push hint (từ server)
// Server response header:
// Link: </styles.css>; rel=preload; as=style
// Link: </app.js>; rel=preload; as=script

// Client-side: Resource Hints (tương tự ý tưởng)
// Preconnect: thiết lập connection sớm
// <link rel="preconnect" href="https://api.example.com" />

// Prefetch: tải resource cho navigation tiếp theo
// <link rel="prefetch" href="/next-page.js" />

// Preload: tải resource cho page hiện tại
// <link rel="preload" href="/critical.css" as="style" />
```

```html
<!-- Resource hints trong HTML -->
<head>
  <!-- DNS prefetch: resolve DNS sớm -->
  <link rel="dns-prefetch" href="https://cdn.example.com" />

  <!-- Preconnect: DNS + TCP + TLS handshake sớm -->
  <link rel="preconnect" href="https://api.example.com" />

  <!-- Preload: tải critical resources ngay -->
  <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/critical.css" as="style" />

  <!-- Prefetch: tải resources cho trang tiếp theo (low priority) -->
  <link rel="prefetch" href="/about-page-bundle.js" />

  <!-- HTTP/2: không cần domain sharding, sprite sheets,
       hay concatenate files nữa -->
  <!-- HTTP/1.1 hack: dùng cdn1.example.com, cdn2.example.com để tăng connections -->
  <!-- HTTP/2: 1 connection xử lý hết -> những hack trên phản tác dụng -->
</head>
```

### Đáp án mẫu

> "HTTP/1.1 gửi 1 request per connection, giới hạn 6 connections/domain. HTTP/2 dùng multiplexing -- nhiều requests trên 1 TCP connection, plus header compression và binary framing. HTTP/3 dùng QUIC (UDP-based) để giải quyết TCP head-of-line blocking -- khi 1 packet mất, chỉ stream đó bị ảnh hưởng, không block toàn bộ. Với HTTP/2, những optimization tricks của HTTP/1.1 như domain sharding, CSS sprites, file concatenation trở nên không cần thiết hoặc phản tác dụng."

---

## Câu 2: CORS là gì? Giải thích preflight request, simple request vs complex request `[Intermediate]`

### Giải thích lý thuyết

**CORS (Cross-Origin Resource Sharing)** là cơ chế bảo mật cho phép server kiểm soát **ai được gọi API** từ browser.

**Same-origin**: hai URLs có cùng **protocol + domain + port**.
```
https://example.com/api    -- same origin với https://example.com/page
https://example.com:3000   -- KHÁC origin (port khác)
http://example.com         -- KHÁC origin (protocol khác)
https://api.example.com    -- KHÁC origin (subdomain khác)
```

**Simple request vs Preflight request:**

| | Simple Request | Preflight (Complex) Request |
|---|---|---|
| **Gửi trực tiếp?** | Có | Không -- gửi OPTIONS trước |
| **Method** | GET, HEAD, POST | PUT, DELETE, PATCH, hoặc custom |
| **Content-Type** | text/plain, multipart/form-data, application/x-www-form-urlencoded | application/json, hoặc custom |
| **Custom headers?** | Không | Có (Authorization, X-Custom-*) |
| **Preflight?** | Không | Có (OPTIONS request) |

**Preflight flow:**
```
1. Browser gửi OPTIONS request (tự động, không phải dev viết code)
   -> Origin: https://myapp.com
   -> Access-Control-Request-Method: PUT
   -> Access-Control-Request-Headers: Content-Type, Authorization

2. Server trả về (nếu cho phép):
   -> Access-Control-Allow-Origin: https://myapp.com
   -> Access-Control-Allow-Methods: GET, PUT, POST, DELETE
   -> Access-Control-Allow-Headers: Content-Type, Authorization
   -> Access-Control-Max-Age: 86400 (cache preflight 24h)

3. Browser gửi actual request (PUT)

4. Server trả response + CORS headers
```

### Code ví dụ

```javascript
// Phía client: fetch gửi CORS request tự động
// Browser tự thêm Origin header và xử lý preflight

// Simple request (không trigger preflight)
fetch('https://api.example.com/data', {
  method: 'GET',
  // Không custom headers -> simple request
});

// Complex request (trigger preflight OPTIONS)
fetch('https://api.example.com/data', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json', // -> trigger preflight
    'Authorization': 'Bearer token123',  // -> trigger preflight
  },
  body: JSON.stringify({ name: 'John' }),
});

// Gửi cookies cross-origin
fetch('https://api.example.com/data', {
  method: 'GET',
  credentials: 'include', // Gửi cookies cross-origin
  // Server phải trả: Access-Control-Allow-Credentials: true
  // VÀ Access-Control-Allow-Origin KHÔNG được là * (phải specific origin)
});
```

```
# Server-side CORS headers (ví dụ response headers)

# Cho phép 1 origin cụ thể
Access-Control-Allow-Origin: https://myapp.com

# Cho phép tất cả origins (KHÔNG dùng cho production có auth!)
Access-Control-Allow-Origin: *

# Cho phép methods
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS

# Cho phép headers
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID

# Cho phép gửi cookies
Access-Control-Allow-Credentials: true

# Cache preflight response (giây)
Access-Control-Max-Age: 86400

# Expose headers cho JavaScript đọc
Access-Control-Expose-Headers: X-Total-Count, X-Page-Count
```

```javascript
// Common CORS errors và cách fix

// Error: "No 'Access-Control-Allow-Origin' header"
// Fix: Server cần thêm header Access-Control-Allow-Origin

// Error: "The value of the 'Access-Control-Allow-Origin' header
//         must not be the wildcard '*' when credentials mode is 'include'"
// Fix: Đổi từ * sang specific origin khi dùng credentials

// Error: "Request header field authorization is not allowed"
// Fix: Server cần thêm Authorization vào Access-Control-Allow-Headers

// Development proxy (tránh CORS khi dev)
// Vite config:
// export default {
//   server: {
//     proxy: {
//       '/api': {
//         target: 'https://api.example.com',
//         changeOrigin: true,
//       }
//     }
//   }
// }
```

### Đáp án mẫu

> "CORS là cơ chế browser cho phép server kiểm soát cross-origin requests. Same-origin = cùng protocol + domain + port. Simple requests (GET/POST với standard content-type, không custom headers) gửi trực tiếp. Complex requests (PUT/DELETE, `application/json`, custom headers) trigger preflight OPTIONS request để hỏi server trước. Server trả về `Access-Control-Allow-Origin`, `Allow-Methods`, `Allow-Headers` để cho phép. Lưu ý: khi dùng `credentials: 'include'`, `Allow-Origin` không được là wildcard `*`."

---

## Câu 3: So sánh Cookie attributes -- SameSite, Secure, HttpOnly. Tại sao chúng quan trọng cho bảo mật? `[Intermediate]`

### Giải thích lý thuyết

| Attribute | Giá trị | Mục đích |
|---|---|---|
| **HttpOnly** | boolean | JS **không đọc được** cookie (chống XSS steal token) |
| **Secure** | boolean | Chỉ gửi qua **HTTPS** (chống sniffing) |
| **SameSite** | Strict / Lax / None | Kiểm soát cookie gửi **cross-site** (chống CSRF) |
| **Domain** | string | Cookie gửi cho domain nào |
| **Path** | string | Cookie gửi cho path nào |
| **Max-Age / Expires** | number / date | Thời gian sống (session cookie nếu không set) |

**SameSite chi tiết:**

| Value | Cookie gửi khi | Use case |
|---|---|---|
| `Strict` | Chỉ same-site requests | Banking, sensitive actions |
| `Lax` (mặc định) | Same-site + top-level navigation (click link) | Hầu hết use cases |
| `None` | Tất cả requests (cần Secure) | Third-party cookies, OAuth |

**Bảo mật cookie checklist:**
- Session token: `HttpOnly` + `Secure` + `SameSite=Lax`
- CSRF token: `SameSite=Strict`
- Third-party: `SameSite=None; Secure` (bắt buộc cả hai)

### Code ví dụ

```
# Server set cookie (response header)

# Session cookie bảo mật
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400

# CSRF token (strict)
Set-Cookie: csrf_token=xyz789; HttpOnly; Secure; SameSite=Strict; Path=/

# Third-party cookie (OAuth callback)
Set-Cookie: oauth_state=random123; Secure; SameSite=None; Path=/auth

# WRONG: Cookie không bảo mật
Set-Cookie: session_id=abc123
# Không HttpOnly -> JS đọc được (XSS steal)
# Không Secure -> gửi qua HTTP (sniffing)
# Không SameSite -> gửi cross-site (CSRF)
```

```javascript
// Client-side cookie API (chỉ đọc được cookie KHÔNG có HttpOnly)
document.cookie; // "theme=dark; language=vi"
// session_id KHÔNG xuất hiện ở đây nếu có HttpOnly

// Set cookie từ JavaScript (không thể set HttpOnly)
document.cookie = "theme=dark; path=/; max-age=31536000; SameSite=Lax";

// Đọc cookie cụ thể
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

// Xóa cookie
document.cookie = "theme=; path=/; max-age=0";

// Fetch với cookies
fetch('https://api.example.com/profile', {
  credentials: 'include', // Gửi cookies cross-origin
  // 'same-origin' (mặc định): chỉ gửi cho same-origin
  // 'include': gửi cho cả cross-origin
  // 'omit': không gửi cookies
});
```

### Đáp án mẫu

> "Cookie có 3 attributes bảo mật quan trọng: `HttpOnly` ngăn JavaScript đọc cookie (chống XSS steal token), `Secure` chỉ gửi qua HTTPS (chống sniffing), `SameSite` kiểm soát cross-site requests (chống CSRF). Session token nên có cả 3: `HttpOnly; Secure; SameSite=Lax`. SameSite có 3 giá trị: Strict (chỉ same-site), Lax (same-site + top-level navigation, mặc định), None (tất cả, bắt buộc kèm Secure)."

---

## Câu 4: JWT là gì? Structure, ưu nhược điểm, và lưu trữ ở đâu? `[Intermediate]`

### Giải thích lý thuyết

**JWT (JSON Web Token)** là một token tự chứa thông tin (self-contained), dùng để authenticate và authorize mà **không cần server lưu session**.

**JWT structure:** 3 phần, ngăn cách bằng dấu chấm:
```
xxxxx.yyyyy.zzzzz
Header.Payload.Signature
```

| Part | Chứa | Ví dụ (decoded) |
|---|---|---|
| **Header** | Algorithm + token type | `{"alg": "HS256", "typ": "JWT"}` |
| **Payload** | Claims (data) | `{"sub": "1234", "name": "John", "exp": 1700000000}` |
| **Signature** | Chữ ký xác thực | `HMACSHA256(base64(header) + "." + base64(payload), secret)` |

**Ưu nhược điểm:**

| Ưu điểm | Nhược điểm |
|---|---|
| Stateless (server không lưu session) | Không thể revoke ngay (phải đợi hết hạn) |
| Scale tốt (không cần shared session store) | Payload lớn hơn session ID |
| Cross-domain dễ dàng | Payload dễ decode (base64, không encrypt) |
| Chứa thông tin user (giảm DB queries) | Cần refresh token strategy |

**Lưu trữ JWT ở đâu?**

| Cách | XSS safe? | CSRF safe? | Recommendation |
|---|---|---|---|
| localStorage | Không (JS đọc được) | Có | Không khuyến khích cho auth tokens |
| sessionStorage | Không (JS đọc được) | Có | Tạm OK, mất khi đóng tab |
| HttpOnly Cookie | Có | Không (cần SameSite/CSRF token) | **Khuyến khích nhất** |
| Memory (JS variable) | Có (mất khi refresh) | Có | Kết hợp refresh token |

### Code ví dụ

```javascript
// JWT decode (KHÔNG PHẢI verify -- chỉ đọc payload)
function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT');
  }

  const payload = parts[1];
  // Base64url decode
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}

// Kiểm tra JWT expired
function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000; // exp là seconds, Date.now() là ms
}

// Strategy 1: HttpOnly cookie (server set, client không cần xử lý)
// Server set cookie sau login:
// Set-Cookie: access_token=eyJhbG...; HttpOnly; Secure; SameSite=Lax; Max-Age=900
// Set-Cookie: refresh_token=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

// Client chỉ cần gửi credentials
async function fetchProfile() {
  const res = await fetch('/api/profile', {
    credentials: 'include', // Browser tự gửi cookie
  });
  return res.json();
}

// Strategy 2: Memory + Refresh token (SPA)
let accessToken = null;

async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Refresh token trong HttpOnly cookie
  });
  const data = await res.json();
  accessToken = data.accessToken; // Access token trong memory
}

async function fetchWithAuth(url, options = {}) {
  // Kiểm tra expired
  if (!accessToken || isTokenExpired(accessToken)) {
    await refreshAccessToken(); // Dùng refresh token cookie
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

async function refreshAccessToken() {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Gửi refresh token cookie
  });

  if (!res.ok) {
    // Refresh token hết hạn -> redirect to login
    window.location.href = '/login';
    return;
  }

  const data = await res.json();
  accessToken = data.accessToken;
}
```

### Đáp án mẫu

> "JWT gồm 3 phần: Header (algorithm), Payload (claims/data), Signature (chữ ký xác thực). JWT là stateless -- server không cần lưu session, token tự chứa thông tin user. Ưu điểm: scale tốt, cross-domain dễ. Nhược điểm: không revoke được ngay, payload decode dễ dàng. Về storage: tốt nhất là HttpOnly cookie (chống XSS) kết hợp SameSite/CSRF token (chống CSRF). Hoặc dùng pattern: access token trong memory + refresh token trong HttpOnly cookie."

---

## Câu 5: Mô tả OAuth 2.0 Authorization Code Flow. Tại sao cần Authorization Code thay vì trả token trực tiếp? `[Senior]`

### Giải thích lý thuyết

**OAuth 2.0** là protocol cho phép app (client) truy cập resources của user trên service khác (resource server) **mà không cần biết password** của user.

**4 roles trong OAuth:**
1. **Resource Owner**: User (chủ tài khoản)
2. **Client**: App muốn truy cập (ví dụ: app của bạn)
3. **Authorization Server**: Server cấp token (ví dụ: Google Auth)
4. **Resource Server**: Server chứa data (ví dụ: Google API)

**Authorization Code Flow (phổ biến nhất cho web apps):**

```
1. User click "Login with Google"
2. Client redirect user đến Authorization Server:
   GET https://accounts.google.com/oauth/authorize
     ?response_type=code
     &client_id=YOUR_CLIENT_ID
     &redirect_uri=https://yourapp.com/callback
     &scope=openid email profile
     &state=random_csrf_string

3. User đăng nhập + đồng ý (consent)

4. Authorization Server redirect về client kèm code:
   GET https://yourapp.com/callback?code=AUTH_CODE&state=random_csrf_string

5. Client (backend) đổi code lấy tokens:
   POST https://oauth2.googleapis.com/token
     code=AUTH_CODE
     &client_id=YOUR_CLIENT_ID
     &client_secret=YOUR_SECRET   <-- chỉ backend biết!
     &grant_type=authorization_code
     &redirect_uri=https://yourapp.com/callback

6. Authorization Server trả về:
   { access_token, refresh_token, id_token }

7. Client dùng access_token gọi API
```

**Tại sao cần Authorization Code (bước trung gian)?**
- Code chỉ dùng 1 lần, hết hạn nhanh (thường 10 phút)
- Token được trao đổi qua **backend channel** (server-to-server), không qua browser URL
- Browser URL bar và history **có thể bị lộ** -- nếu trả token trực tiếp qua URL = token bị expose
- `client_secret` chỉ backend biết, không bao giờ gửi đến browser

### Code ví dụ

```javascript
// Frontend: Initiate OAuth flow
function loginWithGoogle() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: 'YOUR_CLIENT_ID',
    redirect_uri: 'https://yourapp.com/callback',
    scope: 'openid email profile',
    state: generateRandomState(), // CSRF protection
  });

  // Lưu state để verify khi callback
  sessionStorage.setItem('oauth_state', params.get('state'));

  // Redirect to Google
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Frontend: Handle callback
async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  // Verify state (CSRF protection)
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('CSRF attack detected! State mismatch.');
  }
  sessionStorage.removeItem('oauth_state');

  // Gửi code lên backend để đổi lấy tokens
  const response = await fetch('/api/auth/google/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    credentials: 'include',
  });

  if (response.ok) {
    // Backend đã set session cookie
    window.location.href = '/dashboard';
  }
}

// PKCE (Proof Key for Code Exchange) -- cho SPA/mobile
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

### Đáp án mẫu

> "OAuth 2.0 Authorization Code Flow: user redirect đến auth server, đăng nhập và đồng ý, nhận authorization code qua redirect URL, client backend dùng code + client_secret đổi lấy tokens qua server-to-server request. Cần bước trung gian (code) vì: code chỉ dùng 1 lần và hết hạn nhanh, token được trao đổi qua backend channel an toàn hơn, tránh token xuất hiện trong browser URL. Cho SPA/mobile apps, thêm PKCE extension để bảo vệ code exchange mà không cần client_secret."

---

## Câu 6: So sánh Session-based và Token-based authentication `[Intermediate]`

### Giải thích lý thuyết

| Tiêu chí | Session-based | Token-based (JWT) |
|---|---|---|
| **State** | Stateful (server lưu session) | Stateless (token tự chứa info) |
| **Storage (server)** | Session store (Redis, DB) | Không cần (chỉ lưu secret key) |
| **Storage (client)** | Session ID trong cookie | Token trong cookie/memory/localStorage |
| **Scaling** | Cần shared session store | Dễ scale (bất kỳ server nào verify được) |
| **Revocation** | Dễ (xóa session) | Khó (phải dùng blacklist hoặc đợi expire) |
| **Cross-domain** | Khó (cookie-based) | Dễ (token gửi qua header) |
| **Size** | Nhỏ (chỉ session ID) | Lớn (payload chứa claims) |
| **Mobile support** | Phức tạp | Tốt (gửi qua Authorization header) |
| **CSRF** | Cần CSRF token | Không cần nếu dùng Authorization header |
| **XSS** | An toàn hơn (HttpOnly cookie) | Phụ thuộc cách lưu trữ |

**Khi nào dùng cái nào:**
- **Session-based**: Traditional web apps, cần revoke ngay, server render
- **Token-based**: SPAs, mobile apps, microservices, cross-domain

### Code ví dụ

```javascript
// Session-based authentication flow
// 1. Login
async function loginSession(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Nhận session cookie
  });
  // Server set cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax
  return res.json();
}

// 2. Authenticated request (cookie tự gửi)
async function getProfile() {
  const res = await fetch('/api/profile', {
    credentials: 'include', // Browser tự gửi session cookie
  });
  return res.json();
}

// Token-based authentication flow
// 1. Login
async function loginToken(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.accessToken; // Server trả token trong response body
}

// 2. Authenticated request (token gửi manual)
async function getProfileToken(token) {
  const res = await fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`, // Gửi token trong header
    },
  });
  return res.json();
}

// Hybrid: Token trong HttpOnly cookie (best of both worlds)
// Server set: Set-Cookie: token=eyJhbG...; HttpOnly; Secure; SameSite=Lax
// Client không cần xử lý token, chỉ cần credentials: 'include'
```

### Đáp án mẫu

> "Session-based là stateful: server lưu session, client giữ session ID trong cookie. Token-based (JWT) là stateless: token chứa thông tin user, server chỉ cần verify signature. Session dễ revoke nhưng khó scale (cần shared session store). Token dễ scale nhưng khó revoke. Trong thực tế, tôi thường dùng hybrid: JWT trong HttpOnly cookie -- được lợi ích stateless của JWT nhưng an toàn như session cookie."

---

## Bảng so sánh authentication methods

| Method | Security | Complexity | Scalability | Mobile | Use case |
|---|---|---|---|---|---|
| Session + Cookie | Cao | Thấp | Trung bình | Khó | Traditional web |
| JWT in localStorage | Thấp (XSS) | Thấp | Cao | Tốt | Quick prototype |
| JWT in HttpOnly Cookie | Cao | Trung bình | Cao | Trung bình | Production SPA |
| JWT in Memory + Refresh | Cao | Cao | Cao | Tốt | Production SPA |
| OAuth 2.0 + PKCE | Rất cao | Cao | Cao | Tốt | Third-party auth |

---

## Lỗi thường gặp khi trả lời

1. **Nói "CORS là lỗi bảo mật"**: CORS là **cơ chế bảo mật**, không phải lỗi. Nó bảo vệ user khỏi cross-origin requests trái phép. Lỗi CORS nghĩa là server chưa cho phép origin của bạn.

2. **Không phân biệt simple request và preflight**: Nhiều bạn nghĩ mọi cross-origin request đều có preflight. Simple requests (GET/POST standard) không trigger preflight.

3. **Lưu JWT trong localStorage rồi nói "an toàn"**: localStorage dễ bị XSS tấn công. Bất kỳ script nào inject vào page đều đọc được. HttpOnly cookie an toàn hơn nhiều.

4. **Nhầm JWT encode với encrypt**: JWT chỉ base64 encode, **KHÔNG encrypt**. Bất kỳ ai cũng decode được payload. Không bao giờ đặt sensitive data (password) trong JWT payload.

5. **Quên `state` parameter trong OAuth**: `state` parameter dùng để chống CSRF trong OAuth flow. Nhiều bạn skip step này khi implement.

6. **Nói "HTTP/2 luôn nhanh hơn HTTP/1.1"**: Không phải lúc nào. HTTP/2 vẫn bị TCP head-of-line blocking. Với connection chất lượng kém (mất packet), HTTP/2 có thể chậm hơn HTTP/1.1 (có 6 connections song song).
