---
sidebar_position: 2
title: "2. Authentication và Authorization"
---

# Authentication và Authorization

Authentication (xác thực) trả lời câu hỏi "bạn là ai?", còn Authorization (phân quyền) trả lời "bạn được làm gì?". Bài này giới thiệu các cách làm phổ biến như Session, JWT, OAuth 2.0, API Key, OpenID Connect và SAML. Đây là phần cực kỳ quan trọng vì một lỗi nhỏ về bảo mật có thể khiến toàn bộ tài khoản người dùng bị xâm phạm.

[![Sơ đồ tóm tắt bài: Authentication và Authorization](/img/backend/authentication.webp)](pathname:///img/backend/authentication.webp)

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
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Authentication vs Authorization

- **Authentication (AuthN)** — **Bạn là ai?** Đăng nhập, verify identity.
- **Authorization (AuthZ)** — **Bạn được làm gì?** Permission, role.

:::tip[Ví dụ đời thường]

Bạn tới một toà nhà văn phòng:

- **Authentication** — lễ tân xem CMND, đối chiếu ảnh: **bạn đúng là bạn**. Không qua được bước này thì đứng ngoài cửa.
- **Authorization** — cái **thẻ từ** lễ tân đưa: quẹt thang máy chỉ lên nổi tầng 5, không mở được phòng server tầng 12.

Hai việc tách rời hẳn nhau: vào được toà nhà không có nghĩa mở được mọi cánh cửa. Lỗi hay gặp nhất trong code cũng y hệt — kiểm tra rất kỹ "đã đăng nhập chưa" rồi quên hỏi "user này có quyền sửa đơn hàng của **người khác** không".

:::

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

:::tip[Ví dụ đời thường]

Session ID là **vé gửi xe**. Bác giữ xe đưa bạn mảnh giấy ghi số `137`, còn "xe nào, của ai, gửi lúc mấy giờ" thì nằm trong **cuốn sổ của bác**. Mảnh giấy tự nó **chẳng nói lên điều gì** (`opaque`) — kẻ nhặt được cũng phải mò đúng bãi đó mới xài được.

Ưu điểm: muốn huỷ phiên thì bác **gạch dòng 137 trong sổ**, tấm vé thành giấy lộn ngay lập tức.

Cái giá phải trả: bác phải **ôm cuốn sổ** (server giữ state). Mở thêm bãi thứ hai, thứ ba thì các bác buộc phải **dùng chung một cuốn sổ** (session store như Redis), không thì bạn gửi ở bãi A lại không rút được xe ở bãi B.

:::

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

:::tip[Ví dụ đời thường]

Vẫn toà nhà văn phòng đó: lễ tân không đưa bạn tấm thẻ xài được cả tháng, mà đưa **thẻ khách hết hạn sau 1 giờ** (`access token`). Hết giờ, bạn quay lại quầy, chìa **giấy hẹn dài hạn** (`refresh token`) để đổi thẻ mới.

Lý do tách làm hai rất đời thường: tấm thẻ bạn **cầm đi khắp toà nhà**, quẹt hàng trăm cánh cửa nên dễ rơi — nhưng rơi thì kẻ nhặt được cũng chỉ xài tới cuối giờ. Còn tờ giấy hẹn **nằm im trong ví**, mỗi tiếng mới lôi ra một lần nên ít cơ hội rơi hơn; và nếu nghi bị mất, lễ tân chỉ cần xoá tên bạn khỏi sổ là mọi lần đổi thẻ sau đều bị từ chối.

:::

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

:::tip[Ví dụ đời thường]

Nếu session ID là tấm vé gửi xe phải tra sổ mới biết của ai, thì JWT là **cái bằng lái có dấu nổi và tem chống giả**. Mọi thứ cần biết — tên bạn, hạng bằng, ngày hết hạn — **in thẳng trên thẻ**; người kiểm tra chỉ cần soi con dấu là tin, **không phải gọi điện về sở** để tra.

Nhanh và khỏi ôm sổ, nhưng cái giá thì nặng: **thẻ đã phát ra rồi thì không đòi lại được**. Hôm nay bạn bị tước bằng, tấm thẻ trong ví vẫn nguyên dấu nổi và vẫn qua mặt được người kiểm tra cho tới **đúng ngày ghi hết hạn**. Vì thế JWT luôn để hạn thật ngắn, hoặc phải lập thêm một "danh sách đen".

Và nhớ: dấu nổi chỉ **chống sửa**, không **che nội dung** — ai cầm thẻ cũng đọc được chữ in trên đó, nên đừng in bí mật lên.

:::

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

:::tip[Ví dụ đời thường]

Bạn nhờ người quen sang nhà **lấy hộ kiện hàng**. Có hai cách:

- **Thời chưa có OAuth** — đưa luôn **chìa khoá nhà**. Người ta vào được mọi phòng, mở được cả két, và muốn đòi lại quyền thì phải **thay ổ khoá** (đổi mật khẩu, mà đổi rồi thì mọi app khác cũng chết theo).
- **Có OAuth** — bạn ra **ban quản lý** (Google, Facebook…), tự tay xác nhận, rồi xin một **giấy uỷ quyền** ghi rõ: chỉ được nhận kiện hàng ở sảnh, có hiệu lực trong hôm nay. Người quen cầm tờ giấy đó và **không hề biết mật khẩu nhà bạn**.

Điểm mấu chốt: nơi cấp quyền là **ban quản lý**, không phải người quen — bạn gõ mật khẩu trên trang của Google, app kia chỉ nhận được tờ giấy. Muốn cắt quyền thì báo ban quản lý huỷ giấy, nhà cửa không phải thay khoá.

:::

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

:::tip[Ví dụ đời thường]

API key là **thẻ hội viên phòng gym**. Nó không chứng minh bạn là ai về mặt nhân thân — nó chỉ nói "thẻ này thuộc gói X", để quầy **quẹt đếm lượt** và tính tiền cuối tháng. Đó là lý do API key định danh **ứng dụng**, không phải người dùng.

Và vì chỉ là tấm thẻ tĩnh nên **ai nhặt được cũng vào tập được**. Nên phòng gym mới: in mã đầu thẻ để nhìn là biết thẻ loại gì (`sk_live_...`), lưu ở quầy dưới dạng **đã băm** chứ không chép nguyên số, giới hạn thẻ chỉ vào được khu nào, và **khoá thẻ ngay** khi hội viên báo mất.

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `authentication` và `authorization`. Cho một ví dụ lỗi thực tế khi code kiểm rất kỹ "đã đăng nhập chưa" nhưng quên bước còn lại.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Authentication (AuthN)** — *"bạn là ai?"*: xác minh danh tính, thường qua password, OTP, social login. Thất bại trả `401`.
- **Authorization (AuthZ)** — *"bạn được làm gì?"*: kiểm tra quyền trên tài nguyên cụ thể. Thất bại trả `403`.

Ví dụ toà nhà: lễ tân đối chiếu CMND là authentication; tấm thẻ từ chỉ lên nổi tầng 5 là authorization. Vào được toà nhà không có nghĩa mở được mọi cánh cửa.

**Lỗi thực tế kinh điển — IDOR (Insecure Direct Object Reference):**

```ts
// SAI: chỉ kiểm tra đã đăng nhập
app.get("/api/orders/:id", requireAuth, async (req, res) => {
  const order = await db.order.findUnique({ where: { id: req.params.id } });
  res.json(order); // user A đổi id thành đơn của user B là xem được!
});

// ĐÚNG: kiểm tra quyền sở hữu
const order = await db.order.findFirst({
  where: { id: req.params.id, userId: req.user.id },
});
if (!order) return res.status(404).end();
```

Quy tắc: **mọi truy vấn phải gắn điều kiện chủ sở hữu hoặc quyền**, không chỉ chặn ở tầng middleware đăng nhập.

</details>

**2. HTTP là `stateless`, vậy server "nhớ" được bạn đã đăng nhập bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTP không có khái niệm "phiên" — mỗi request là một cuộc gọi độc lập, server không biết request này với request trước có cùng một người hay không. Để "nhớ", client phải **tự mang theo bằng chứng đã đăng nhập ở mọi request**. Có hai họ giải pháp:

- **Tham chiếu (session ID)** — sau khi login, server sinh một chuỗi random vô nghĩa (`opaque`), lưu ánh xạ `session_id → user_id, expires` vào Redis/DB, rồi trả về browser qua `Set-Cookie`. Browser tự đính kèm cookie mọi request; server lookup trong store để biết bạn là ai. Giống **vé gửi xe**: mảnh giấy tự nó vô nghĩa, thông tin nằm trong sổ của bác giữ xe.
- **Tự chứa (JWT / token)** — server đóng gói thông tin (`sub`, `role`, `exp`) và **ký số**, gửi cho client. Mỗi request client gửi lại qua header `Authorization: Bearer ...`; server chỉ verify chữ ký, không cần tra DB. Giống **bằng lái có dấu nổi**.

Điểm chung: trạng thái đăng nhập nằm ở **thứ client mang theo**, còn giao thức HTTP vẫn stateless như cũ.

</details>

**3. Mô tả flow `session-based auth` từ lúc user submit form login tới lúc request tiếp theo được nhận diện. Server lưu gì, client giữ gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```
1. POST /login với email + password.
2. Server tra DB, so password với hash (bcrypt/argon2id).
3. Hợp lệ → sinh session ID random đủ dài (≥128 bit entropy).
4. Server lưu: session_id → { user_id, created_at, expires, ip, user_agent }
   vào Redis/DB.
5. Trả về: Set-Cookie: session_id=abc; HttpOnly; Secure; SameSite=Lax; Max-Age=...
6. Request sau: browser TỰ đính kèm cookie.
7. Server lookup session ID trong store → biết user → check permission.
8. Logout → xoá record khỏi store (cookie thành vô dụng ngay).
```

**Server giữ:** toàn bộ dữ liệu phiên (user id, thời hạn, metadata) trong session store.

**Client giữ:** chỉ mỗi **session ID** — một chuỗi vô nghĩa, không mang thông tin gì, không tự giải mã ra được.

Lưu ý khi scale: nhiều instance phải **dùng chung một session store** (Redis), nếu không user login ở instance A sẽ không được nhận diện ở instance B. Nên sinh session ID mới sau khi login thành công để chống **session fixation**.

</details>

**4. Các cookie flag `HttpOnly`, `Secure`, `SameSite`, `Max-Age` mỗi cái chặn được rủi ro nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Flag | Tác dụng | Rủi ro chặn được |
|---|---|---|
| `HttpOnly` | JavaScript không đọc được cookie (`document.cookie`) | **XSS** đánh cắp session — script chèn vào trang không lấy được token |
| `Secure` | Chỉ gửi cookie qua HTTPS | **Nghe lén trên mạng** (man-in-the-middle, Wi-Fi công cộng) |
| `SameSite` | Giới hạn gửi cookie khi request đến từ site khác | **CSRF** — `Strict` chặn hoàn toàn, `Lax` cho phép điều hướng GET top-level, `None` phải kèm `Secure` |
| `Max-Age` / `Expires` | Đặt tuổi thọ cookie | Giới hạn **cửa sổ thiệt hại** khi cookie bị lộ; không có thì thành session cookie mất khi đóng browser |

```ts
res.cookie("session_id", sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
});
```

Bổ sung: `Domain`/`Path` thu hẹp phạm vi gửi cookie; tiền tố `__Host-` bắt buộc cookie phải có `Secure`, `Path=/` và không có `Domain`, chống subdomain ghi đè cookie.

</details>

**5. `JWT` gồm mấy phần? `signature` được tạo ra sao, và nó bảo đảm điều gì — quan trọng hơn là không bảo đảm điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

JWT gồm **ba phần** ngăn bởi dấu chấm: `header.payload.signature`, mỗi phần là base64url.

```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload
{ "sub": "user-123", "role": "admin", "iat": 1717200000, "exp": 1717286400 }

// Signature
HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

Với thuật toán đối xứng (`HS256`) chữ ký là HMAC bằng secret chung; với bất đối xứng (`RS256`, `ES256`) là chữ ký bằng private key, ai cũng verify được bằng public key.

**Bảo đảm:** tính **toàn vẹn** và **nguồn gốc** — nội dung không bị sửa, và token do bên giữ khoá phát ra. Sửa một ký tự trong payload là chữ ký sai ngay.

**KHÔNG bảo đảm:** tính **bí mật**. Payload chỉ được **encode base64, không mã hoá** — ai cầm token cũng decode đọc được toàn bộ nội dung. Cũng không bảo đảm token còn hiệu lực về mặt nghiệp vụ: chữ ký đúng không có nghĩa user chưa bị khoá hay chưa logout.

</details>

**6. Vì sao nói payload của `JWT` không phải chỗ để giấu bí mật? Bạn nên và không nên đặt claim gì vào đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì payload chỉ **base64url encode**, không hề encrypt. Bất kỳ ai chặn được token — hoặc chính người dùng mở DevTools — đều dán vào jwt.io là đọc sạch nội dung. Chữ ký chỉ **chống sửa**, không **che nội dung**, đúng như ẩn dụ tấm bằng lái: con dấu nổi chống làm giả nhưng chữ in trên thẻ thì ai cũng đọc được.

```js
// SAI
const token = jwt.sign({ password: hashedPw, ssn: "...", salary: 5000 }, secret);
```

**Nên đặt:** `sub` (user id), `role`/`scope` cơ bản, `iat`, `exp`, `iss`, `aud`, `jti` (id token để blacklist), và vài field hiển thị không nhạy cảm.

**Không nên đặt:** password dù đã hash, số CMND/CCCD, số thẻ, thông tin y tế, lương, khoá API, dữ liệu nội bộ tiết lộ kiến trúc hệ thống. Cũng nên tránh nhồi quá nhiều quyền chi tiết vào token — token phình to (đi kèm mọi request) và quyền bị "đóng băng" tới khi hết hạn.

Nếu thật sự cần giấu nội dung, dùng **JWE** (JSON Web Encryption) hoặc đơn giản là quay về opaque token và tra ở server.

</details>

**7. So sánh `session ID` với `JWT` ở bốn khía cạnh: cách verify, khả năng revoke, chi phí scale, và nơi lưu phía browser. Khi nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | **Session ID** | **JWT** |
|---|---|---|
| **Verify** | Lookup store (Redis/DB) mỗi request | Verify chữ ký bằng secret/public key, không chạm DB |
| **Revoke** | Tức thì — xoá record khỏi store | Khó — token còn hiệu lực tới `exp`, phải thêm blacklist hoặc token version |
| **Scale** | Cần session store dùng chung; thêm một round-trip mỗi request | Stateless, scale ngang dễ, nhưng token to hơn và đi kèm mọi request |
| **Nơi lưu (browser)** | Cookie `HttpOnly` | Tốt nhất **cũng là** cookie `HttpOnly` (không dùng localStorage) |

**Chọn session** khi: web app truyền thống render phía server, single domain, yêu cầu bảo mật cao cần khoá phiên tức thì (banking, admin panel), số lượng session vừa phải.

**Chọn JWT** khi: API cho mobile/third-party, kiến trúc microservices cần verify độc lập không gọi về auth service, cần cross-domain.

**Thực tế 2026 thường lai cả hai:** JWT access token sống rất ngắn (5–15 phút) + refresh token lưu server-side (revoke được như session). Lấy được ưu điểm stateless mà vẫn kiểm soát được phiên đăng nhập.

</details>

**8. User bấm logout nhưng `JWT` của họ còn hạn 20 phút. Làm sao chặn token đó ngay lập tức? Nêu ít nhất ba cách và đánh đổi của từng cách.**

<details className="qa">
<summary>Xem đáp án</summary>

Bản chất vấn đề: JWT tự chứng minh tính hợp lệ, server không giữ danh sách token đã phát nên mặc định **không thể thu hồi**.

- **Blacklist / denylist** — lưu `jti` của token đã logout vào Redis với TTL bằng thời gian còn lại. Verify xong phải tra thêm Redis.
  *Đánh đổi:* mất tính stateless, thêm một lookup mỗi request — nhưng TTL ngắn nên store rất nhỏ.

- **Token version / `tokenVersion` trong DB** — mỗi user có một số phiên bản; token mang theo version lúc phát. Logout toàn bộ thiết bị chỉ cần tăng version.
  *Đánh đổi:* vẫn phải tra DB (hoặc cache) mỗi request; không thu hồi riêng lẻ từng thiết bị nếu chỉ có một biến đếm.

- **Access token sống rất ngắn + refresh token server-side** — cách phổ biến nhất. Access token 5–15 phút, logout chỉ cần xoá refresh token.
  *Đánh đổi:* còn cửa sổ vài phút token cũ dùng được — chấp nhận được với hầu hết ứng dụng.

- **Quay về opaque token / session** cho các luồng cần revoke tuyệt đối.
  *Đánh đổi:* mất lợi ích stateless hoàn toàn.

</details>

**9. Vì sao phải tách `access token` và `refresh token`? Đặt thời hạn mỗi loại bao nhiêu và lý do?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do tách là **giảm bề mặt rủi ro**:

- **Access token** đi kèm **mọi request** tới API, qua nhiều tầng proxy, log, thiết bị — xác suất bị lộ cao. Nên nó phải **sống ngắn**: lộ thì thiệt hại chỉ giới hạn trong vài phút.
- **Refresh token** chỉ xuất hiện khi đổi token mới, gửi tới **một endpoint duy nhất** (`/refresh`) — ít di chuyển nên ít rủi ro hơn, vì vậy được phép sống dài.

Đúng như ẩn dụ toà nhà: thẻ khách 1 giờ bạn cầm đi quẹt khắp nơi nên dễ rơi; tờ giấy hẹn dài hạn nằm im trong ví.

Thời hạn thường dùng:

| Loại | Thời hạn điển hình | Lý do |
|---|---|---|
| Access token | 5–15 phút (tối đa ~1 giờ) | Cửa sổ thiệt hại ngắn khi bị lộ |
| Refresh token | 7–30 ngày (web), có thể lâu hơn cho mobile | Tránh bắt user đăng nhập lại liên tục |

Refresh token nên **lưu server-side** (hash trong DB) để revoke được, đặt trong cookie `HttpOnly` với `Path` giới hạn ở endpoint refresh, và áp dụng **rotation + reuse detection**. Ứng dụng nhạy cảm (ngân hàng) rút ngắn cả hai và thêm idle timeout.

</details>

**10. Lưu token ở `localStorage`, cookie `httpOnly`, hay biến trong memory? Phân tích đánh đổi giữa `XSS` và `CSRF` cho từng lựa chọn.**

<details className="qa">
<summary>Xem đáp án</summary>

| Nơi lưu | Bị XSS? | Bị CSRF? | Ghi chú |
|---|---|---|---|
| **localStorage** | **Có** — JS đọc được, script độc lấy token trong một dòng | Không (phải tự gắn header) | Tiện cho SPA nhưng rủi ro cao nhất |
| **Cookie `httpOnly`** | Không đọc được trực tiếp | **Có** — browser tự gửi kèm | An toàn nhất, nhưng phải chống CSRF |
| **Biến trong memory** | Khó lấy hơn, nhưng XSS vẫn can thiệp được | Không | Mất khi reload tab → phải xin lại token |

**Đánh đổi cốt lõi:** XSS và CSRF là hai mối đe doạ khác nhau, và **XSS nguy hiểm hơn** — nếu đã dính XSS thì kẻ tấn công thực thi code trong ngữ cảnh trang của bạn và gần như mọi biện pháp đều bị vượt qua. Vì vậy ưu tiên chống XSS trước.

Pattern được khuyến nghị: **cookie `httpOnly` + `secure` + `sameSite=lax`**, và với thao tác ghi thì thêm **CSRF token** (hoặc double-submit cookie). `SameSite` đã chặn phần lớn CSRF nhưng không nên là lớp phòng thủ duy nhất.

Biến thể phổ biến cho SPA: **access token giữ trong memory** + **refresh token trong cookie `httpOnly`** — reload trang thì gọi `/refresh` lấy lại access token.

</details>

**11. Giải thích `algorithm confusion attack` (`alg: none`, đổi `RS256` sang `HS256`). Verify token thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Lỗ hổng nằm ở chỗ **header của token do chính kẻ tấn công kiểm soát**, mà một số thư viện lại tin vào trường `alg` trong đó để chọn cách verify.

- **`alg: none`** — attacker sửa header thành `{"alg":"none"}`, xoá phần chữ ký. Thư viện cũ hiểu là "token không cần ký" và chấp nhận payload tuỳ ý, kể cả `"role":"admin"`.
- **Đổi `RS256` sang `HS256`** — hệ thống dùng cặp khoá bất đối xứng, **public key ai cũng lấy được**. Attacker đổi header sang `HS256` rồi ký token bằng chính public key đó. Server gọi `verify(token, publicKey)`, thấy `alg=HS256` nên dùng public key làm **secret HMAC** — và chữ ký khớp.

**Verify đúng:**

```js
// SAI — để thư viện tự đọc alg từ header
jwt.verify(token, key);

// ĐÚNG — chỉ định tường minh thuật toán chấp nhận
jwt.verify(token, key, {
  algorithms: ["RS256"],
  issuer: "https://auth.example.com",
  audience: "my-api",
});
```

Nguyên tắc: **thuật toán do server quyết định, không do token khai báo**; không bao giờ cho phép `none`; dùng khoá riêng biệt cho từng thuật toán; và dùng thư viện được bảo trì, cập nhật thường xuyên.

</details>

**12. Ngoài `exp`, khi verify `JWT` bạn còn phải kiểm những claim nào (`iss`, `aud`, `sub`, `nbf`) và vì sao bỏ qua chúng lại nguy hiểm?**

<details className="qa">
<summary>Xem đáp án</summary>

| Claim | Ý nghĩa | Bỏ qua thì sao |
|---|---|---|
| `iss` (issuer) | Ai phát hành token | Chấp nhận token từ một IdP khác hoặc tenant khác; kẻ tấn công tự dựng issuer của mình |
| `aud` (audience) | Token dành cho dịch vụ nào | Token cấp cho **service A** lại dùng được ở **service B** — leo quyền ngang giữa các hệ thống |
| `sub` (subject) | Định danh user | Không xác định được chủ thể; phải dùng cặp `iss + sub` mới duy nhất trên toàn hệ thống |
| `nbf` (not before) | Chưa hiệu lực trước thời điểm này | Token phát trước cho tương lai dùng được sớm hơn dự kiến |
| `iat` (issued at) | Thời điểm phát hành | Không phát hiện được token quá cũ; không áp được chính sách "yêu cầu đăng nhập lại sau X" |
| `jti` | Id duy nhất của token | Không blacklist/chống replay theo từng token được |

Ngoài ra khi dùng OIDC còn phải kiểm `nonce` (chống replay `id_token`) và, nếu khoá xoay vòng, phải chọn đúng khoá theo `kid` từ JWKS endpoint.

Kịch bản nguy hiểm điển hình: hệ thống có nhiều microservice cùng dùng chung một auth server. Nếu service thanh toán không kiểm `aud`, token được cấp cho service chat (scope thấp) sẽ mở được cả API thanh toán.

</details>

**13. Mô tả flow `OAuth 2.0 Authorization Code`. Vì sao phải đổi `authorization code` lấy token ở server thay vì trả token thẳng về browser?**

<details className="qa">
<summary>Xem đáp án</summary>

```
1. User click "Login with Google".
2. App redirect → Google /authorize?client_id=...&scope=...&redirect_uri=...&state=...
3. User đăng nhập Google và đồng ý cấp quyền.
4. Google redirect về redirect_uri kèm ?code=...&state=...
5. App (server-side) POST /token với code + client_id + client_secret.
6. Google trả access_token (+ refresh_token, id_token nếu là OIDC).
7. App dùng access_token gọi Google API.
```

Điểm mấu chốt: user gõ mật khẩu **trên trang của Google**, app không bao giờ thấy password — đúng như ẩn dụ "xin giấy uỷ quyền ở ban quản lý thay vì đưa chìa khoá nhà".

**Vì sao đổi code ở server:**

- `code` đi qua **URL và lịch sử trình duyệt**, có thể lọt vào log của proxy/server và header `Referer`. Nếu đó đã là token thì token bị lộ ngay.
- `code` **dùng một lần, sống rất ngắn** (thường 30–60 giây) và vô dụng nếu không kèm `client_secret` — kẻ chặn được code cũng không đổi ra token được.
- `client_secret` phải nằm ở **backend**, không thể giấu trong JS của browser hay trong app mobile đã build.
- Bước đổi ở server còn cho phép app tự kiểm soát việc lưu token, gắn với phiên của mình và thu hồi khi cần.

Với client công khai (SPA, mobile) không giữ được secret thì dùng **PKCE** thay cho `client_secret`.

</details>

**14. `PKCE` sinh ra để vá lỗ hổng nào trên mobile/SPA? `code_verifier` và `code_challenge` hoạt động ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗ hổng:** client công khai (app mobile, SPA) **không giữ được `client_secret`** — ai cũng có thể giải nén APK hoặc đọc bundle JS để lấy. Trên mobile, `redirect_uri` dùng custom scheme (`myapp://callback`) mà **nhiều app có thể cùng đăng ký một scheme**; một app độc hại chặn được callback sẽ cướp `authorization code` và tự đổi ra token.

**Cách PKCE hoạt động:**

```
1. Client sinh code_verifier: chuỗi random 43–128 ký tự.
2. code_challenge = BASE64URL( SHA256(code_verifier) )
3. /authorize?...&code_challenge=<...>&code_challenge_method=S256
   → Authorization server ghi nhớ challenge kèm code.
4. Nhận code → POST /token với code + code_verifier (bản gốc).
5. Server tự tính SHA256(code_verifier) và so với challenge đã lưu.
   Khớp → phát token. Không khớp → từ chối.
```

Kẻ cướp được `code` trên đường callback **không có `code_verifier`** (nó chưa bao giờ rời khỏi bộ nhớ của client hợp lệ), nên không đổi ra token được. Thực chất PKCE là một `client_secret` **sinh động cho từng lần đăng nhập**.

Luôn dùng `code_challenge_method=S256`, không dùng `plain`. **OAuth 2.1 bắt buộc PKCE cho mọi client**, kể cả client bí mật.

</details>

**15. Tham số `state` trong OAuth dùng để làm gì? Bỏ nó đi thì bị tấn công kiểu gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`state` là một giá trị **random, không đoán được**, do client sinh trước khi redirect sang authorization server; server trả lại y nguyên ở callback. Client so sánh giá trị nhận được với giá trị đã lưu trong session — không khớp thì huỷ luồng đăng nhập.

Hai công dụng: **chống CSRF trên luồng OAuth** (*login CSRF* / *session fixation*) — đây là mục đích chính; và **mang theo ngữ cảnh** (nhớ trang user định vào trước khi bị đẩy đi đăng nhập).

**Nếu bỏ `state`:** kẻ tấn công tự khởi tạo luồng OAuth với tài khoản **của hắn**, lấy được `code`, rồi lừa nạn nhân mở link `https://app.com/callback?code=<code_cua_attacker>`. App của nạn nhân đổi code ra token và **liên kết tài khoản của attacker vào phiên của nạn nhân**. Hậu quả: nạn nhân tưởng đang dùng tài khoản mình, mọi thao tác (upload tài liệu, nhập thẻ) thực ra diễn ra trên tài khoản kẻ tấn công — và hắn đăng nhập vào xem được tất cả.

Lưu ý: `state` chống CSRF, **`nonce`** (của OIDC) chống replay `id_token` — hai thứ khác nhau, nên dùng cả hai.

</details>

**16. `OAuth 2.0` khác `OpenID Connect` chỗ nào? `access_token` và `id_token` mỗi cái dùng vào việc gì, và vì sao không nên dùng `access_token` để xác định danh tính?**

<details className="qa">
<summary>Xem đáp án</summary>

**OAuth 2.0 chỉ là authorization** — nó cấp cho app quyền *truy cập tài nguyên* thay mặt user, chứ không nói "user này là ai". **OIDC là một lớp identity mỏng đặt trên OAuth 2.0**, bổ sung `id_token` cùng scope `openid`, endpoint `/userinfo` và discovery document.

| | `access_token` | `id_token` |
|---|---|---|
| Dành cho | **Resource server** (API) | **Chính app client** |
| Trả lời | "Được phép làm gì" | "Người dùng là ai" |
| Định dạng | Có thể opaque hoặc JWT | Luôn là JWT |
| Nội dung | scope, quyền | `sub`, `email`, `name`, `iss`, `aud`, `nonce` |

**Vì sao không dùng `access_token` để xác định danh tính:**

- `access_token` **không được thiết kế để client đọc** — nó có thể là chuỗi opaque, và định dạng có thể đổi bất cứ lúc nào mà không coi là breaking change.
- `aud` của nó trỏ tới **API**, không trỏ tới app của bạn. Nếu bạn nhận `access_token` từ client rồi coi đó là bằng chứng danh tính, kẻ tấn công có thể đưa token nó lấy được từ **một app khác** cùng authorization server — đây chính là *confused deputy* / token substitution.
- Nó không có `nonce` nên không chống được replay.

Đúng cách: xác thực bằng `id_token` (kiểm `iss`, `aud`, `nonce`, chữ ký) hoặc gọi `/userinfo` bằng access token ở **backend**, không tin dữ liệu client tự khai.

</details>

**17. Vì sao `OAuth 2.1` khai tử `Implicit grant` và `Password grant`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Implicit grant** (trả `access_token` thẳng về browser qua fragment của URL) bị loại vì:

- Token nằm trong **URL** → lọt vào lịch sử trình duyệt, log của proxy, header `Referer`.
- **Không có refresh token** an toàn → buộc để access token sống dài, hoặc dùng iframe ẩn (nay hỏng vì trình duyệt chặn third-party cookie).
  → Thay thế bằng **Authorization Code + PKCE**, hoạt động tốt cho cả SPA.

**Password grant** (Resource Owner Password Credentials — app tự thu password của user rồi gửi đi) bị loại vì:

- **Phá vỡ đúng lý do OAuth tồn tại**: app lại chạm vào password của user.
- Không tương thích với **MFA**, passkey, captcha.
- Tạo thói quen nguy hiểm: người dùng quen gõ mật khẩu vào giao diện bên thứ ba → mồi ngon cho phishing, và không dùng được với federation/SSO.
  → Thay thế bằng Authorization Code + PKCE (kể cả app "của chính mình"), hoặc Device Code flow cho thiết bị không có trình duyệt.

OAuth 2.1 đồng thời **bắt buộc PKCE** và yêu cầu `redirect_uri` so khớp chính xác.

</details>

**18. Khi nào dùng `Client Credentials grant` thay vì `Authorization Code grant`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ranh giới rất rõ: có **con người** trong luồng hay không.

- **Authorization Code (+ PKCE)** — khi app hành động **thay mặt một người dùng** và cần sự đồng ý của họ. Có bước redirect, màn hình đăng nhập, màn hình cấp quyền. Token gắn với `sub` là user.
- **Client Credentials** — khi **không có user nào cả**: một service tự xác thực bằng `client_id` + `client_secret` (hoặc mTLS, private key JWT) để lấy token đại diện cho **chính nó**.

```
POST /token
grant_type=client_credentials
&client_id=service-a&client_secret=...&scope=orders:read
```

Trường hợp dùng Client Credentials:

- **Service-to-service / machine-to-machine**: backend gọi backend, microservice gọi microservice.
- **Cron job, worker, batch ETL** chạy nền.
- **CLI/daemon nội bộ** truy cập API của chính tổ chức mình.

Lưu ý: grant này chỉ dành cho **confidential client** giữ được secret ở phía server — tuyệt đối không dùng trong SPA hay app mobile, vì secret sẽ lộ. Quyền nên cấp theo scope tối thiểu, token sống ngắn, không phát refresh token (cứ hết hạn thì xin lại), và secret phải rotate định kỳ.

</details>

**19. `API key` khác token của người dùng ở điểm nào? Bạn lưu, verify, phân scope và rotate API key trong DB ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Khác biệt cốt lõi:** API key định danh **ứng dụng/tổ chức**, không phải con người; nó là **secret tĩnh sống rất lâu**, không có thời hạn tự nhiên, không đại diện cho một phiên đăng nhập. Token người dùng (JWT/session) gắn với một danh tính cụ thể, sống ngắn và sinh ra từ một lần xác thực. Giống **thẻ hội viên phòng gym**: dùng để đếm lượt và tính tiền, không chứng minh nhân thân.

**Lưu:** không bao giờ lưu plaintext. Sinh khoá đủ entropy, hiển thị cho user **đúng một lần**, DB chỉ giữ bản băm:

```ts
const key = crypto.randomBytes(32).toString("hex");
const hashed = await bcrypt.hash(key, 10);
await db.apiKey.create({ data: { hash: hashed, userId, scopes } });
return { key }; // user thấy 1 lần, sau đó chỉ còn hash
```

**Verify:** thêm **prefix** để nhận diện (`sk_live_`, `pk_test_`) và lưu kèm một phần định danh công khai để tra đúng bản ghi thay vì quét toàn bảng. So sánh phải dùng hàm **constant-time**.

**Scope:** mỗi key gắn danh sách quyền tối thiểu (`orders:read`), giới hạn theo IP/domain nếu được, và rate limit riêng từng key.

**Rotate:** cho phép một tài khoản có **nhiều key hoạt động song song** để xoay không downtime — tạo key mới, chuyển dần traffic, theo dõi `last_used_at`, rồi thu hồi key cũ. Revoke ngay khi nghi lộ, và ghi audit log mọi lần tạo/xoá.

</details>

**20. `SAML` và `OIDC` khác nhau thế nào? Vì sao khách hàng enterprise B2B vẫn đòi SAML?**

<details className="qa">
<summary>Xem đáp án</summary>

| | **SAML 2.0** | **OIDC** |
|---|---|---|
| Năm | 2005 | 2014 |
| Định dạng | XML assertion ký số | JWT (`id_token`) |
| Nền tảng | Giao thức riêng, dựa trên XML-DSig | Xây trên OAuth 2.0 + REST/JSON |
| Truyền tải | Form POST / redirect với XML | HTTP redirect + JSON endpoint |
| Hợp với | Web app doanh nghiệp, trình duyệt | Web, SPA, mobile, API |
| Cấu hình | Metadata XML, chứng chỉ, thủ công nhiều | Discovery document tự động, JWKS |
| Độ nặng | Verbose, khó debug | Gọn, dễ tích hợp |

**Vì sao B2B vẫn đòi SAML:**

- **Hạ tầng IdP đã có sẵn** — Active Directory Federation Services, Okta, OneLogin, Ping đã chạy SAML cả chục năm; đội IT có sẵn quy trình cấp phát và audit.
- **Đội bảo mật/compliance quen SAML** — có tài liệu, có checklist kiểm toán, đưa vào hợp đồng và yêu cầu mua hàng.
- **Tính năng doanh nghiệp** — attribute mapping phong phú, ánh xạ nhóm/phòng ban, IdP-initiated login (user bấm icon app từ dashboard của Okta), kết hợp SCIM để tự động cấp/thu hồi tài khoản.
- **Chi phí đổi rất cao** — hàng trăm ứng dụng nội bộ đang tích hợp SAML, không ai muốn migrate.

Thực dụng: đừng tự implement SAML. Dùng WorkOS, Auth0, Keycloak để nhận SAML ở ngoài rìa rồi quy về một mô hình phiên thống nhất bên trong.

</details>

**21. Tình huống: bạn nghi `refresh token` của một user bị đánh cắp. Thiết kế `refresh token rotation` + `reuse detection` để phát hiện và giới hạn thiệt hại.**

<details className="qa">
<summary>Xem đáp án</summary>

**Rotation:** mỗi lần gọi `/refresh`, server phát **refresh token mới** và **vô hiệu hoá token vừa dùng**. Một refresh token chỉ dùng được đúng một lần.

**Reuse detection:** nếu một token đã bị đánh dấu "đã dùng" lại xuất hiện lần nữa → chắc chắn có hai bên cùng giữ token → **coi như bị đánh cắp**, huỷ toàn bộ **family** token của phiên đó, bắt user đăng nhập lại và gửi cảnh báo.

Mô hình dữ liệu:

```
refresh_tokens(
  id, user_id,
  family_id,          -- gắn cả chuỗi xoay vòng của một phiên đăng nhập
  token_hash,         -- luôn lưu hash, không lưu plaintext
  used_at, revoked_at, expires_at,
  ip, user_agent
)
```

Luồng xử lý:

1. Nhận refresh token → tra theo hash.
2. Không tồn tại / hết hạn → từ chối.
3. Đã `used_at` hoặc `revoked_at` → **reuse!** → revoke toàn bộ `family_id`, ghi audit log, cảnh báo user, trả `401`.
4. Hợp lệ → đánh dấu đã dùng, phát access token mới + refresh token mới cùng `family_id`.

Bổ sung: đặt refresh token trong cookie `HttpOnly` với `Path` giới hạn ở `/refresh`, xử lý `/refresh` trong transaction hoặc có lock để tránh race khi client gửi nhiều request song song (thường cho một khoảng ân hạn vài giây), giới hạn tổng thời gian sống của family, và ghi nhận bất thường về IP/thiết bị.

</details>

**22. Password phải hash bằng thuật toán nào và vì sao không dùng `SHA-256`? Login endpoint cần thêm phòng thủ gì (rate limit, lockout, thông báo lỗi mơ hồ)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Dùng:** `argon2id` (ưu tiên), `bcrypt` (cost 12+), hoặc `scrypt`/`PBKDF2` khi bị ràng buộc bởi chuẩn tuân thủ.

**Vì sao không dùng `SHA-256`:** nó **được thiết kế để chạy nhanh** — đúng thứ ta không muốn. GPU băm SHA-256 hàng tỉ lần mỗi giây, nên database bị lộ có thể bị dò trong thời gian ngắn. Thuật toán password hashing ngược lại **chậm có chủ đích**, có tham số điều chỉnh số vòng lặp và **bộ nhớ tiêu tốn** (argon2/scrypt buộc tốn RAM khiến GPU mất lợi thế), kèm **salt tự động** nên rainbow table vô dụng.

**Phòng thủ cho login endpoint:**

- **Rate limit** theo IP **và** theo tài khoản (5 lần / 15 phút), exponential backoff.
- **Lockout tạm thời** sau X lần sai — cẩn thận vì lockout cứng có thể bị lợi dụng để khoá tài khoản người khác (DoS).
- **Thông báo lỗi mơ hồ**: luôn trả "Email hoặc mật khẩu không đúng" — tránh cho kẻ tấn công dò danh sách tài khoản. Nên hash một giá trị giả cả khi user không tồn tại để **thời gian phản hồi như nhau**.
- **CAPTCHA** sau vài lần thất bại, **2FA**, cảnh báo email khi đăng nhập từ thiết bị lạ.

</details>

**23. Thiết kế luồng `password reset` qua email và `2FA` bằng `TOTP` — những chỗ nào dễ làm sai?**

<details className="qa">
<summary>Xem đáp án</summary>

**Password reset:**

```
1. POST /forgot-password { email }
   → LUÔN trả cùng một thông báo, dù email có tồn tại hay không.
2. Sinh token random đủ entropy (≥32 byte), lưu HASH vào DB
   kèm user_id, expires_at (15–60 phút), used_at.
3. Gửi link: https://app.com/reset?token=...
4. POST /reset-password { token, newPassword }
   → tra hash, kiểm hạn, kiểm chưa dùng → đổi password
   → đánh dấu token đã dùng, HUỶ TOÀN BỘ session/refresh token hiện có
   → gửi email thông báo "mật khẩu vừa được đổi".
```

Chỗ dễ sai: token đoán được hoặc lưu plaintext; token không hết hạn hoặc dùng lại được nhiều lần; tiết lộ email có tồn tại hay không; quên huỷ các phiên cũ (kẻ tấn công vẫn còn session); đặt token trong URL bị rò qua `Referer`; không rate limit nên endpoint bị dùng để spam mail.

**TOTP 2FA:** server sinh secret, hiển thị QR (`otpauth://`), user quét bằng Google Authenticator; mã 6 số đổi mỗi 30 giây, tính từ secret + thời gian.

Chỗ dễ sai: không cho **cửa sổ lệch giờ** (nên chấp nhận ±1 bước) hoặc cho quá rộng; **không chặn tái sử dụng mã** trong cùng chu kỳ (phải lưu mã/bước đã dùng); **không rate limit** bước nhập mã khiến brute-force 6 số khả thi; lưu secret không mã hoá; **quên bắt xác thực 2FA khi tắt 2FA** hoặc khi đổi số điện thoại; và quan trọng nhất — **không phát mã dự phòng (recovery codes)**, hoặc phát nhưng lưu plaintext. Ngoài ra luồng reset password không được là đường vòng để bỏ qua 2FA.

</details>

**24. `Passkeys`/`WebAuthn` chống `phishing` gần như tuyệt đối nhờ cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Passkey thay password bằng **cặp khoá bất đối xứng**: khi đăng ký, thiết bị sinh private key và **giữ trong phần cứng bảo mật** (Secure Enclave, TPM), chỉ gửi **public key** cho server. Khi đăng nhập, server gửi một `challenge` ngẫu nhiên, thiết bị ký bằng private key sau khi user xác nhận bằng sinh trắc học hoặc PIN.

Ba cơ chế cộng lại tạo ra khả năng chống phishing:

- **Không có secret nào để gõ ra** — không có mật khẩu hay OTP để user vô tình nhập vào trang giả. Private key không bao giờ rời thiết bị.
- **Gắn chặt với origin (quan trọng nhất)** — mỗi credential đăng ký với đúng một `rpId` (tên miền). Trình duyệt **tự kiểm tra tên miền hiện tại** trước khi ký; trang `g00gle.com` xin chữ ký cho `google.com` bị từ chối ngay ở tầng browser, user không có cơ hội sai. Đây là điểm khiến passkey mạnh hơn TOTP và SMS OTP, vốn vẫn bị chuyển tiếp qua trang giả theo thời gian thực.
- **Challenge ngẫu nhiên mỗi lần** — chữ ký không tái sử dụng được, chống replay.

Kèm theo đó: database bị lộ cũng chỉ mất public key (vô hại).

</details>
