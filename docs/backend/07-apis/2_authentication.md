---
sidebar_position: 2
title: "2. Authentication và Authorization"
---

# Authentication và Authorization

Authentication (xác thực) trả lời câu hỏi "bạn là ai?", còn Authorization (phân quyền) trả lời "bạn được làm gì?". Bài này giới thiệu các cách làm phổ biến như Session, JWT, OAuth 2.0, API Key, OpenID Connect và SAML. Đây là phần cực kỳ quan trọng vì một lỗi nhỏ về bảo mật có thể khiến toàn bộ tài khoản người dùng bị xâm phạm.

---

## Mục lục

- [Authentication vs Authorization](#authentication-vs-authorization)
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
