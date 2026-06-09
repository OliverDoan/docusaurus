---
sidebar_position: 2
title: "2. Application Security: SQL Injection, XSS, CSRF"
---

# Application Security: SQL Injection, XSS, CSRF

Bài này giới thiệu các lỗ hổng bảo mật hay gặp nhất ở tầng ứng dụng như SQL Injection, XSS, CSRF cùng cách phòng chống chúng. Đây đều là những lỗi kinh điển khiến hacker có thể đánh cắp dữ liệu, chiếm tài khoản người dùng hoặc phá hủy database của bạn. Nắm được những kiến thức này giúp bạn viết code an toàn ngay từ đầu thay vì sửa lỗi sau khi bị tấn công.

---

## Mục lục

- [OWASP Top 10](#owasp-top-10)
- [SQL Injection](#sql-injection)
- [XSS (Cross-Site Scripting)](#xss-cross-site-scripting)
- [CSRF (Cross-Site Request Forgery)](#csrf-cross-site-request-forgery)
- [Rate Limiting](#rate-limiting)
- [API Security Best Practices](#api-security-best-practices)

---

## OWASP Top 10

**OWASP Top 10** — danh sách lỗ hổng phổ biến nhất, update mỗi vài năm.

OWASP Top 10 2021:

1. **Broken Access Control** — phổ biến nhất (94% app có).
2. **Cryptographic Failures** — weak crypto, expose data.
3. **Injection** — SQL, NoSQL, command, LDAP.
4. **Insecure Design** — flaw architecture.
5. **Security Misconfiguration**.
6. **Vulnerable Components** — dependency không patch.
7. **Identification and Authentication Failures**.
8. **Software and Data Integrity Failures** — supply chain.
9. **Security Logging and Monitoring Failures**.
10. **Server-Side Request Forgery (SSRF)**.

Đọc kỹ tại https://owasp.org/Top10/

---

## SQL Injection

**Bug kinh điển** — user input ghép vào SQL chưa sanitize.

**Bug**:

```js
const id = req.query.id;
const query = `SELECT * FROM users WHERE id = ${id}`;
db.execute(query);

// User submit: id=1; DROP TABLE users; --
// Query: SELECT * FROM users WHERE id = 1; DROP TABLE users; --
```

→ Database bị wipe!

**Fix — Parameterized query**:

```js
// node-postgres
const result = await db.query(
  "SELECT * FROM users WHERE id = $1",
  [req.query.id]
);

// Prisma — tự parameterize
const user = await prisma.user.findUnique({ where: { id: req.query.id } });

// Drizzle
const user = await db.select().from(users).where(eq(users.id, req.query.id));
```

ORM modern **tự handle** — chỉ raw query mới có rủi ro.

:::warning[Cần lưu ý]

**Trường hợp dễ quên**:

**1. Dynamic column/table name**:

```js
// Parameterize chỉ value, không column
const sort = req.query.sort;
db.query(`SELECT * FROM users ORDER BY ${sort}`); // VULN!

// Fix — whitelist
const ALLOWED_SORT = ["name", "email", "created_at"];
if (!ALLOWED_SORT.includes(sort)) throw new Error("Invalid sort");
db.query(`SELECT * FROM users ORDER BY ${sort}`);
```

**2. Raw query trong ORM**:

```ts
// Prisma raw — vẫn vulnerable nếu interpolate
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${id}`);

// Đúng — dùng template tag
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`;
```

**3. NoSQL injection**:

```js
// MongoDB
db.users.find({ email: req.body.email, password: req.body.password });

// User submit: { "email": "a@b.c", "password": { "$ne": "" } }
// → MongoDB query trả về user đầu tiên, bypass password check!

// Fix — validate type với schema (Zod, Joi)
const schema = z.object({
  email: z.string(),
  password: z.string(),  // ép string, reject object
});
const { email, password } = schema.parse(req.body);
```

:::

---

## XSS (Cross-Site Scripting)

**Inject script** vào page, chạy ở browser user khác.

**3 loại**:

- **Reflected** — script từ URL, server echo lại.
- **Stored** — script lưu DB, hiển thị lại cho mọi user.
- **DOM-based** — JS client xử lý sai input.

**Bug**:

```html
<!-- Server render -->
<p>Hello, ${user.name}</p>

<!-- User name = <script>alert(document.cookie)</script> -->
<p>Hello, <script>alert(document.cookie)</script></p>
```

→ Mọi user xem page bị steal cookie.

**Fix**:

**1. Escape khi render HTML**:

```js
// Manual escape
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// React/Vue/Svelte — auto escape mặc định
<p>Hello, {user.name}</p>  // an toàn

// Trừ khi dùng dangerouslySetInnerHTML
```

**2. Content Security Policy** — chặn inline script (xem CSP).

**3. Sanitize HTML user** (rich text, comment):

```ts
import DOMPurify from "isomorphic-dompurify";

const safe = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ["p", "b", "i", "a"],
  ALLOWED_ATTR: ["href"],
});
```

**4. HttpOnly cookie** — JS không đọc → token không leak qua XSS.

:::info[Phân tích]

**Modern framework + XSS**:

React, Vue, Svelte **auto escape** — phần lớn XSS không xảy ra trong app
hiện đại trừ khi:

- Dùng `dangerouslySetInnerHTML` / `v-html` với user input.
- Server-side template không escape (EJS, Pug — check kỹ).
- DOM manipulation thủ công (`innerHTML = userInput`).
- URL injection (`<a href={userUrl}>`) — check `javascript:` scheme.

```jsx
// SAI
<a href={user.website}>Website</a>
// user.website = "javascript:alert(1)" → click bị XSS

// ĐÚNG — validate URL
function safeUrl(url: string) {
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return "#";
    return url;
  } catch {
    return "#";
  }
}

<a href={safeUrl(user.website)}>Website</a>
```

:::

---

## CSRF (Cross-Site Request Forgery)

**Force user** thực hiện action ngoài ý muốn khi đang logged in.

**Bug scenario**:

```html
<!-- Attacker site -->
<img src="https://bank.com/transfer?to=attacker&amount=1000000" />
```

User logged in `bank.com` → browser **tự gửi cookie** → server tưởng user
chủ động.

**Fix**:

**1. CSRF token**:

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random-token-from-session" />
  <input name="amount" />
</form>
```

Server check `csrf_token` match session — attacker không có token.

Lib hỗ trợ:

- **Node**: `csurf` (deprecated), `csrf-csrf`, `lusca`.
- **Django/Rails**: built-in CSRF middleware.

**2. SameSite cookie**:

```
Set-Cookie: session=abc; SameSite=Lax
```

- `Strict` — không gửi cookie cross-site.
- `Lax` — gửi cho navigation GET, không cross-site POST.
- `None` — gửi mọi case (cần `Secure`).

Browser modern default `Lax` → block phần lớn CSRF.

**3. Custom header**:

```
X-Requested-With: XMLHttpRequest
```

Browser không tự thêm header này từ HTML form → kiểm tra header presence
filter được nhiều CSRF.

**4. Same-origin check** — verify `Origin` / `Referer`:

```ts
if (req.headers.origin !== "https://app.example.com") {
  return res.status(403).send("CSRF check failed");
}
```

:::tip[Mẹo]

**Modern Next.js / framework**:

- **Server Actions** — Next.js auto CSRF protection (encrypted form data).
- **JWT trong Authorization header** — không CSRF (browser không tự thêm
  custom header cross-site).
- **Cookie httpOnly + SameSite=Lax** + JWT — combo an toàn.

API-only backend ít CSRF — chỉ web form session-based mới cần CSRF token.

:::

---

## Rate Limiting

Chặn abuse — limit số request per user/IP.

**Strategies**:

- **Fixed Window** — N request / 1 phút.
- **Sliding Window** — N request / 60s gần nhất.
- **Token Bucket** — fill rate + bucket size.
- **Leaky Bucket** — process rate cố định.

**Implementation với Redis**:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// Middleware
const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
const { success } = await ratelimit.limit(ip);

if (!success) {
  return res.status(429).json({ error: "Too many requests" });
}
```

**Áp dụng theo endpoint**:

| Endpoint | Limit |
|----------|-------|
| Login | 5 / 15 min |
| Password reset | 3 / 1 hour |
| Search | 30 / 1 min |
| General API | 100 / 1 min |
| File upload | 5 / 1 min |

---

## API Security Best Practices

**Checklist tổng**:

- [ ] **HTTPS** mandatory production.
- [ ] **Auth** mọi endpoint trừ public docs.
- [ ] **Authorize** check ownership / role mỗi mutation.
- [ ] **Validate input** với schema (Zod, Joi, Pydantic).
- [ ] **Sanitize output** — không leak internal data (password hash, internal ID).
- [ ] **Rate limit** auth + heavy endpoint.
- [ ] **CORS** whitelist origin.
- [ ] **CSP** strict.
- [ ] **Security headers** (HSTS, X-Frame-Options, X-Content-Type-Options).
- [ ] **Error message** không leak stack trace production.
- [ ] **Logging** sensitive action (login, payment).
- [ ] **Dependency** update — Dependabot, Snyk.
- [ ] **Secret rotation** định kỳ.
- [ ] **Audit** từng endpoint với security checklist trước deploy.

:::info[Phân tích]

**SSRF (Server-Side Request Forgery)** — bug đang phổ biến:

```ts
// Bug
app.get("/proxy", async (req, res) => {
  const data = await fetch(req.query.url); // user-controlled URL
  res.send(await data.text());
});

// User submit: url=http://169.254.169.254/latest/meta-data/
// → AWS EC2 metadata service → steal IAM credentials!
```

→ App backend gọi URL **user control** = SSRF.

Fix:

- **Whitelist** domain được phép fetch.
- **Block private IP** (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.1`,
  metadata endpoint).
- **Block redirect** đến internal.
- **Use proxy** chỉ allow outbound.

Lib hỗ trợ:

- **`ssrf-req-filter`** (Node).
- **`undici` interceptor**.

Đặc biệt nguy hiểm với:

- Webhook URL config bởi user.
- URL preview (Slack, Discord-like).
- PDF/image generator từ URL.

:::

:::warning[Cần lưu ý]

**Đừng over-trust framework** — security là **defense in depth**:

- Auth ở edge (middleware).
- Authorize lại ở service layer.
- Validate input lại trước DB.
- Sanitize output.
- Audit log.

Mỗi tầng có thể fail. Nhiều tầng = attacker phải bypass cả.

Đọc thêm:

- **OWASP Top 10**.
- **OWASP API Security Top 10**.
- **OWASP Cheat Sheet Series**.

Free, comprehensive — nguồn học security web cốt lõi nhất.

:::
