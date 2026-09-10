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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Phân biệt `authentication` và `authorization`. Cho một ví dụ lỗi thực tế khi code kiểm rất kỹ "đã đăng nhập chưa" nhưng quên bước còn lại.
2. HTTP là `stateless`, vậy server "nhớ" được bạn đã đăng nhập bằng cách nào?
3. Mô tả flow `session-based auth` từ lúc user submit form login tới lúc request tiếp theo được nhận diện. Server lưu gì, client giữ gì?
4. Các cookie flag `HttpOnly`, `Secure`, `SameSite`, `Max-Age` mỗi cái chặn được rủi ro nào?
5. `JWT` gồm mấy phần? `signature` được tạo ra sao, và nó bảo đảm điều gì — quan trọng hơn là **không** bảo đảm điều gì?
6. Vì sao nói payload của `JWT` không phải chỗ để giấu bí mật? Bạn nên và không nên đặt claim gì vào đó?
7. So sánh `session ID` với `JWT` ở bốn khía cạnh: cách verify, khả năng revoke, chi phí scale, và nơi lưu phía browser. Khi nào bạn chọn cái nào?
8. User bấm logout nhưng `JWT` của họ còn hạn 20 phút. Làm sao chặn token đó ngay lập tức? Nêu ít nhất ba cách và đánh đổi của từng cách.
9. Vì sao phải tách `access token` và `refresh token`? Đặt thời hạn mỗi loại bao nhiêu và lý do?
10. Lưu token ở `localStorage`, cookie `httpOnly`, hay biến trong memory? Phân tích đánh đổi giữa `XSS` và `CSRF` cho từng lựa chọn.
11. Giải thích `algorithm confusion attack` (`alg: none`, đổi `RS256` sang `HS256`). Verify token thế nào cho đúng?
12. Ngoài `exp`, khi verify `JWT` bạn còn phải kiểm những claim nào (`iss`, `aud`, `sub`, `nbf`) và vì sao bỏ qua chúng lại nguy hiểm?
13. Mô tả flow `OAuth 2.0 Authorization Code`. Vì sao phải đổi `authorization code` lấy token ở server thay vì trả token thẳng về browser?
14. `PKCE` sinh ra để vá lỗ hổng nào trên mobile/SPA? `code_verifier` và `code_challenge` hoạt động ra sao?
15. Tham số `state` trong OAuth dùng để làm gì? Bỏ nó đi thì bị tấn công kiểu gì?
16. `OAuth 2.0` khác `OpenID Connect` chỗ nào? `access_token` và `id_token` mỗi cái dùng vào việc gì, và vì sao không nên dùng `access_token` để xác định danh tính?
17. Vì sao `OAuth 2.1` khai tử `Implicit grant` và `Password grant`?
18. Khi nào dùng `Client Credentials grant` thay vì `Authorization Code grant`?
19. `API key` khác token của người dùng ở điểm nào? Bạn lưu, verify, phân scope và rotate API key trong DB ra sao?
20. `SAML` và `OIDC` khác nhau thế nào? Vì sao khách hàng enterprise B2B vẫn đòi SAML?
21. Tình huống: bạn nghi `refresh token` của một user bị đánh cắp. Thiết kế `refresh token rotation` + `reuse detection` để phát hiện và giới hạn thiệt hại.
22. Password phải hash bằng thuật toán nào và vì sao không dùng `SHA-256`? Login endpoint cần thêm phòng thủ gì (rate limit, lockout, thông báo lỗi mơ hồ)?
23. Thiết kế luồng `password reset` qua email và `2FA` bằng `TOTP` — những chỗ nào dễ làm sai?
24. `Passkeys`/`WebAuthn` chống `phishing` gần như tuyệt đối nhờ cơ chế nào?
