---
sidebar_position: 2
title: "2. Authentication và Authorization"
---

# Authentication và Authorization

Authentication (xác thực) trả lời câu hỏi "bạn là ai?", còn Authorization (phân quyền) trả lời "bạn được làm gì?". Bài này giới thiệu các cách làm phổ biến như Session, JWT, OAuth 2.0, API Key, OpenID Connect và SAML. Đây là phần cực kỳ quan trọng vì một lỗi nhỏ về bảo mật có thể khiến toàn bộ tài khoản người dùng bị xâm phạm.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Authentication` = "bạn là ai?", `Authorization` = "bạn được làm gì?"** — hai khái niệm tách biệt.
- **Auth tiến hóa qua thời gian**: Basic → Session+Cookie → API Key → SAML → OAuth → JWT → OIDC → PKCE/Passkeys.
- **`Session ID`** (stateful, revoke tức thì) vs **`JWT`** (stateless, khó revoke); xu hướng 2026 là lai cả hai.
- ⭐ **JWT pitfalls**: khó revoke, nên lưu ở cookie `httpOnly` (không localStorage), không để sensitive data, chỉ định explicit algorithm.
- **Đừng tự viết auth** — dùng provider mature (Clerk, Auth0, Better Auth); hash password bằng `bcrypt`/`argon2id`.

:::

---

## Mục lục

- [Authentication vs Authorization](#authentication-vs-authorization)
- [Lịch sử tiến hóa của Authentication](#lịch-sử-tiến-hóa-của-authentication)
- [Session-based Auth (Cookie)](#session-based-auth-cookie)
- [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
- [OAuth 2.0 / OAuth 2.1](#oauth-20--oauth-21)
- [API Key / Token Authentication](#api-key--token-authentication)
- [OpenID Connect](#openid-connect)
- [SAML](#saml)

---

## Authentication vs Authorization

- **Authentication (AuthN)** — **Bạn là ai?** Đăng nhập, verify identity.
- **Authorization (AuthZ)** — **Bạn được làm gì?** Permission, role.

Flow web app:

```
1. User submit login → server check password.
2. Server tạo session/token → trả về client.
3. Client gửi session/token mỗi request.
4. Server verify session/token → biết user.
5. Server check permission → cho/từ chối action.
```

---

## Lịch sử tiến hóa của Authentication

Mỗi phương pháp auth sinh ra để giải quyết hạn chế của phương pháp trước đó. Nắm được dòng lịch sử này giúp hiểu **tại sao** mỗi pattern tồn tại và khi nào nên dùng.

```
1996 ──► HTTP Basic Auth        (gửi user:pass mỗi request)
1997 ──► Digest Auth            (hash thay vì plain text)
~1995-2000 ──► Cookie + Session ID  (server-side session)
~2005 ──► API Key               (Flickr, Google Maps mở public API)
2005 ──► SAML 2.0               (enterprise SSO, XML)
2007-2010 ──► OAuth 1.0/1.0a    (chữ ký HMAC phức tạp)
2012 ──► OAuth 2.0              (access token + refresh token, bearer)
2014 ──► OpenID Connect         (OAuth 2.0 + id_token)
2015 ──► JWT chuẩn hóa (RFC 7519) + PKCE (RFC 7636)
2019+ ──► WebAuthn / Passkeys   (passwordless, sinh trắc học)
2024+ ──► OAuth 2.1             (gom best practices, bắt buộc PKCE)
```

### Giai đoạn 1 — HTTP Basic Auth (1996)

Mỗi request gửi kèm `Authorization: Basic base64(username:password)`. **Không có token, không có session** — password đi qua mạng mọi request. Ngày nay chỉ còn dùng cho tool nội bộ, registry, CI (luôn kèm HTTPS).

### Giai đoạn 2 — Session ID + Cookie (cuối thập niên 90)

HTTP vốn stateless — khái niệm **session ID** ra đời để server "nhớ" user giữa các request:

```
1. Login thành công → server tạo chuỗi random (session ID).
2. Server lưu: session_id → { user_id, expires } (memory/Redis/DB).
3. Trả về browser qua Set-Cookie: session_id=abc123; HttpOnly.
4. Browser tự đính kèm cookie mọi request.
5. Server lookup session ID trong store → biết user là ai.
```

Điểm cốt lõi: **session ID là chuỗi vô nghĩa (opaque)** — chỉ là "chìa khóa" trỏ tới dữ liệu trên server. Muốn revoke? Xóa record trong store là user bị logout ngay. Đổi lại server phải **giữ state**, scale nhiều instance phải share session store.

### Giai đoạn 3 — API Key (~2005)

Các công ty mở public API (Flickr, Google Maps) cần cách đơn giản nhận diện developer: một chuỗi secret tĩnh gắn vào header. Không phải danh tính user — là danh tính **ứng dụng**, dùng cho rate limit và billing. Vẫn sống khỏe đến giờ (Stripe `sk_live_...`).

### Giai đoạn 4 — SAML (2005)

Doanh nghiệp cần đăng nhập một lần cho nhiều hệ thống nội bộ (SSO). SAML dùng XML assertion ký số, trao đổi giữa Identity Provider (Okta, AD FS) và Service Provider. Nặng nề nhưng vẫn là chuẩn de facto cho B2B enterprise.

### Giai đoạn 5 — OAuth 1.0 (2007): khai sinh access token

Trước OAuth, muốn app A đọc Gmail của bạn thì... đưa luôn password Gmail cho app A. OAuth sinh ra **access token**: app nhận token có scope giới hạn thay vì password. Nhược điểm: mỗi request phải ký HMAC-SHA1 — implement rất dễ sai.

### Giai đoạn 6 — OAuth 2.0 (2012): bearer token + refresh token

Đơn giản hóa triệt để: bỏ chữ ký, dựa vào TLS, token trở thành **bearer token** ("ai cầm là dùng được"). Mô hình 2 token ra đời:

- **Access token** — sống ngắn (15 phút – 1 giờ), gửi kèm mọi request đến API.
- **Refresh token** — sống dài (ngày/tuần), chỉ dùng để xin access token mới.

Lý do tách đôi: access token bị lộ thì thiệt hại giới hạn trong vài phút; refresh token ít di chuyển trên mạng nên ít rủi ro lộ hơn.

### Giai đoạn 7 — JWT (2015): token tự chứa thông tin

Access token ban đầu là opaque (server phải lookup). JWT chứa luôn payload (`sub`, `role`, `exp`) và chữ ký — server chỉ verify chữ ký, **không cần lookup DB**. Hoàn hảo cho microservices/stateless, đổi lại không revoke được ngay (chi tiết pitfall ở [phần JWT](#jwt-json-web-tokens)).

### Giai đoạn 8 — OpenID Connect (2014)

OAuth 2.0 chỉ là **authorization** (cấp quyền truy cập data), không phải authentication. OIDC bổ sung `id_token` (một JWT) chứa danh tính user — chính là thứ chạy phía sau mọi nút "Login with Google/Apple/GitHub".

### Giai đoạn 9 — PKCE, OAuth 2.1 và Passkeys (hiện tại)

- **PKCE** (2015): vá lỗ hổng đánh cắp authorization code trên mobile/SPA — client tạo `code_verifier` random, không cần `client_secret`. OAuth 2.1 bắt buộc PKCE cho mọi public client, khai tử Implicit và Password grant.
- **WebAuthn / Passkeys** (2019+): bỏ luôn password — cặp khóa public/private gắn với thiết bị + sinh trắc học. Chống phishing tuyệt đối vì không có secret nào để gõ nhầm vào trang giả.

:::info[Phân tích]

**Session ID vs Access Token (JWT) — so sánh trực diện**:

| | **Session ID** | **Access Token (JWT)** |
|---|---|---|
| Bản chất | Chuỗi random vô nghĩa, trỏ tới state trên server | Tự chứa data + chữ ký, server không giữ state |
| Verify | Lookup store (Redis/DB) mỗi request | Verify chữ ký, không cần DB |
| Revoke | Tức thì (xóa khỏi store) | Khó — chờ hết hạn hoặc blacklist |
| Scale | Cần share session store | Stateless, scale ngang dễ |
| Nơi lưu (browser) | Cookie `HttpOnly` | Tốt nhất cũng là cookie `HttpOnly` (tránh localStorage) |
| Hợp với | Web truyền thống, single domain, banking | API, mobile, microservices, third-party |

Xu hướng thực tế 2026 là **lai cả hai**: JWT access token sống ngắn + refresh token lưu server-side (revoke được như session) — lấy ưu điểm stateless mà vẫn kiểm soát được phiên đăng nhập.

:::

---

## Session-based Auth (Cookie)

**Pattern truyền thống** — server store session, client giữ session ID.

```
1. POST /login với email + password.
2. Server verify, tạo session ID, lưu vào Redis/DB.
3. Server set cookie:
   Set-Cookie: session_id=abc; HttpOnly; Secure; SameSite=Lax
4. Browser tự gửi cookie mọi request.
5. Server lookup session ID → biết user.
6. Logout → xóa session khỏi store.
```

**Cookie flags quan trọng**:

- `HttpOnly` — JS không đọc được (chống XSS).
- `Secure` — chỉ HTTPS.
- `SameSite=Lax|Strict` — chống CSRF.
- `Max-Age` — lifetime.

```ts
// Express
res.cookie("session_id", sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
});
```

:::info[Phân tích]

**Session-based pros vs cons**:

**Ưu**:

- **Server control** — revoke session ngay lập tức.
- **Small cookie** (chỉ ID).
- **Mature** — pattern web 20+ năm.

**Nhược**:

- **Stateful** — server cần store (Redis/DB).
- **Khó scale** distributed — share session giữa instance.
- **Không phù hợp** mobile, API third-party.

**Khi nào dùng?**

- App web traditional với UI render server.
- Single domain.
- Critical security (banking) — cần revoke ngay.

:::

---

## JWT (JSON Web Tokens)

**Token tự chứa thông tin** — không cần server store.

```
header.payload.signature
```

Decoded:

```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload
{
  "sub": "user-123",
  "email": "an@example.com",
  "role": "admin",
  "iat": 1717200000,
  "exp": 1717286400
}

// Signature
HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

Server verify chỉ cần `secret` — không lookup DB.

**Flow**:

```
1. POST /login → server tạo JWT (sign).
2. Client lưu JWT (localStorage / cookie).
3. Mỗi request: Authorization: Bearer <jwt>.
4. Server verify signature → biết user.
```

**Code example**:

```ts
import jwt from "jsonwebtoken";

// Sign
const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

// Verify
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  // payload.sub, payload.role
} catch (err) {
  // Invalid or expired
}
```

:::warning[Cần lưu ý]

**JWT pitfalls phổ biến**:

**1. Không revoke được dễ** — token valid đến `exp`, dù user logout.

Workaround:
- **Short expiration** (15min) + refresh token.
- **Blacklist** revoked token trong Redis.
- **Token version** trong DB — verify version match.

**2. Lưu ở đâu?**

| Nơi lưu | An toàn? | Bị XSS? | Bị CSRF? |
|---------|----------|---------|----------|
| **localStorage** | Khá | **Có** (JS đọc được) | Không |
| **Cookie httpOnly** | **An toàn nhất** | Không | Có (cần SameSite + CSRF token) |
| Memory (variable) | OK | Không (mất khi reload) | Không |

→ **Cookie httpOnly + secure + sameSite=lax** là pattern an toàn nhất.

**3. Đừng cho secret data trong payload**:

```js
// SAI
const token = jwt.sign({ password: hashedPw, ssn: "..." }, secret);
```

JWT payload **base64-encoded, không encrypt**. Ai cũng đọc được.

Chỉ put: user id, role, basic info — không sensitive data.

**4. Algorithm confusion attack**:

```js
// SAI — algorithms: ["HS256", "RS256"]
jwt.verify(token, secret); // attacker switch alg → RS256 với public key

// ĐÚNG — explicit allowed algorithms
jwt.verify(token, secret, { algorithms: ["HS256"] });
```

:::

---

## OAuth 2.0 / OAuth 2.1

**Authorization framework** — third-party access user data without password.

**Flow** kinh điển — "Login with Google":

```
1. User click "Login with Google".
2. Redirect → Google authorize URL với client_id, scope, redirect_uri.
3. User login Google + grant permission.
4. Google redirect về app với authorization code.
5. App exchange code → access_token (server-side, dùng client_secret).
6. App dùng access_token gọi Google API.
```

**OAuth 2.0 grant types**:

| Grant | Use case |
|-------|---------|
| **Authorization Code** | Web/mobile app (most common) |
| **Authorization Code + PKCE** | SPA, mobile (no client_secret) |
| **Client Credentials** | Service-to-service |
| **Refresh Token** | Renew access token |

**OAuth 2.1** (2024+) — consolidate best practices:

- Bắt buộc PKCE cho mọi public client.
- Loại bỏ Implicit grant (deprecated).
- Loại bỏ Password grant.

:::info[Phân tích]

**OAuth provider phổ biến**:

- **Auth0** (Okta) — managed auth provider.
- **Clerk** — modern, dev-friendly.
- **WorkOS** — enterprise SSO.
- **Supabase Auth** — open source + Postgres.
- **Firebase Auth** — Google ecosystem.
- **Lucia** — DIY library.
- **Auth.js (NextAuth)** — Node/Next.js.
- **Better Auth** — modern, framework-agnostic.

Roll your own auth? **Đừng** — trừ khi học hoặc edge case. Auth có hàng
chục pitfall security. Dùng provider mature.

:::

---

## API Key / Token Authentication

**Đơn giản nhất** — string secret static.

```
GET /api/users
Authorization: Bearer api_key_abc123

# Hoặc
X-API-Key: api_key_abc123
```

Use case:

- **Server-to-server** API.
- **Public API** với rate limit per key.
- **Bot, webhook** integration.

**Best practice**:

- **Hash key trong DB** — không plain text.
- **Prefix** để identify (`sk_live_`, `pk_test_`).
- **Permission scope** mỗi key.
- **Rate limit** per key.
- **Rotate** định kỳ.
- **Revoke** ngay khi leak.

```ts
// Hash khi tạo
const key = crypto.randomBytes(32).toString("hex");
const hashed = await bcrypt.hash(key, 10);
await db.apiKey.create({ data: { hash: hashed, userId, scopes } });
return { key }; // user thấy 1 lần, sau đó chỉ hash

// Verify
const keys = await db.apiKey.findMany({ where: { userId } });
const valid = await Promise.any(
  keys.map(k => bcrypt.compare(submittedKey, k.hash))
);
```

---

## OpenID Connect

**OAuth 2.0 + identity layer** — thêm `id_token` (JWT) chứa user info.

OAuth chỉ authorize → access_token. OIDC thêm authenticate → id_token có:

```json
{
  "sub": "google-user-123",
  "email": "user@example.com",
  "name": "An Nguyen",
  "picture": "https://...",
  "iss": "https://accounts.google.com",
  "aud": "your-client-id",
  "exp": 1234567890
}
```

→ App biết "ai là người dùng" mà không phải gọi API riêng.

**Provider OIDC**:

- Google, Microsoft, Facebook, Apple, GitHub.
- Auth0, Okta, Keycloak.

Hầu hết "Login with X" dùng OIDC.

---

## SAML

**Enterprise SSO** — XML-based, lâu năm.

Phù hợp:

- **Corporate intranet** (Active Directory, Okta).
- **B2B SSO** — customer enterprise yêu cầu.

Setup phức tạp. Hầu hết auth provider (Auth0, WorkOS) handle SAML cho bạn.

:::tip[Mẹo]

**Auth strategy 2026 cho app**:

```
B2C consumer app?
├─ Social login (Google, Apple, GitHub) → OIDC
├─ Email + password local → Lucia/Better Auth + JWT cookie
└─ Magic link / passwordless → Clerk, Resend

B2B SaaS?
├─ Email + password + Google SSO → Auth0, Clerk, WorkOS
└─ Enterprise SSO (SAML) → WorkOS, Auth0

API for developer?
├─ API key (simple) → bcrypt hash + scopes
└─ OAuth (advanced) → Auth0 với client credentials
```

**Stack hot 2026**:

- **Better Auth** + Drizzle/Prisma — self-host, modern.
- **Clerk** — managed, đẹp UI.
- **Lucia Auth** — minimal, learn auth deeply.

Đừng tự viết hash password, session, JWT lib — dùng package mature.

:::

:::warning[Cần lưu ý]

**Auth security checklist tối thiểu**:

- [ ] Password hash với **bcrypt** (cost 10+) hoặc **argon2id**.
- [ ] Session/cookie: `httpOnly + secure + sameSite=lax`.
- [ ] CSRF token cho form submit cookie-based.
- [ ] Rate limit login endpoint (5/15min).
- [ ] **2FA** option (TOTP).
- [ ] **Email verification** trước active.
- [ ] **Password reset** qua email link expire.
- [ ] **Lockout** sau X lần fail.
- [ ] **Audit log** — login, logout, sensitive action.
- [ ] **HTTPS** mandatory.
- [ ] **No password in URL** (query string).
- [ ] **Strong password** policy nhưng không quá strict (NIST guide).

Một lỗi auth = compromise toàn user. Test kỹ.

:::
