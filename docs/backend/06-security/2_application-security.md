---
sidebar_position: 2
title: "2. Application Security: SQL Injection, XSS, CSRF"
---

# Application Security: SQL Injection, XSS, CSRF

Bài này giới thiệu các lỗ hổng bảo mật hay gặp nhất ở tầng ứng dụng như SQL Injection, XSS, CSRF cùng cách phòng chống chúng. Đây đều là những lỗi kinh điển khiến hacker có thể đánh cắp dữ liệu, chiếm tài khoản người dùng hoặc phá hủy database của bạn. Nắm được những kiến thức này giúp bạn viết code an toàn ngay từ đầu thay vì sửa lỗi sau khi bị tấn công.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`SQL Injection`**: luôn dùng parameterized query / ORM; whitelist cho column/table name động; validate type để chống NoSQL injection.
- ⭐ **`XSS`**: escape output — framework modern auto-escape (cẩn thận `dangerouslySetInnerHTML`), sanitize HTML bằng DOMPurify, bật CSP.
- **`CSRF`**: dùng CSRF token, cookie `SameSite=Lax`, custom header, kiểm `Origin`/`Referer`.
- **`Rate limiting`** (fixed/sliding window, token bucket) chặn abuse — áp theo endpoint (login 5/15 phút).
- **Security là defense in depth**: auth + authorize + validate + sanitize + audit; cẩn thận `SSRF` (block private IP + metadata endpoint).

:::

---

## Mục lục

- [OWASP Top 10](#owasp-top-10)
- [SQL Injection](#sql-injection)
- [XSS (Cross-Site Scripting)](#xss-cross-site-scripting)
- [CSRF (Cross-Site Request Forgery)](#csrf-cross-site-request-forgery)
- [Rate Limiting](#rate-limiting)
- [API Security Best Practices](#api-security-best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

:::tip[Ví dụ đời thường]

Bạn đưa nhân viên ngân hàng một tờ giấy: *"Rút 500k từ tài khoản số ___"*, chỗ trống để khách tự điền. Khách ranh ma điền vào: *"12345. Và chuyển hết tiền của mọi tài khoản khác sang cho tôi"*.

Nếu nhân viên **đọc cả tờ giấy như một mệnh lệnh liền mạch**, họ làm luôn cả câu ghép thêm. Đó đúng là SQL Injection.

Cách chặn (`parameterized query`): tờ giấy in sẵn **có ô vuông riêng**, thứ khách viết trong ô đó **luôn chỉ được hiểu là số tài khoản**, dù có viết cả bài văn vào cũng vậy.

:::

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

:::tip[Ví dụ đời thường]

Chung cư có **bảng thông báo** ai dán giấy lên cũng được. Kẻ xấu dán một tờ trông y hệt thông báo của ban quản lý: *"Phí tháng này nộp vào số tài khoản sau"*.

Cư dân đi qua đọc và tin, đơn giản vì nó nằm trên bảng chính thức. XSS y hệt: code của kẻ tấn công chạy **dưới danh nghĩa trang web của bạn**, nên trình duyệt tin tưởng và giao luôn cookie, session cho nó.

Cách chặn: ban quản lý **đóng khung kính**, mọi tờ giấy nhét vào chỉ được hiển thị như *chữ để đọc*, không bao giờ được coi là thông báo chính thức (escape output).

:::

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

:::tip[Ví dụ đời thường]

Bạn có **con dấu công ty** để sẵn trong túi, và ngân hàng thì cứ thấy con dấu là làm theo. Kẻ xấu chẳng cần trộm con dấu — nó chỉ cần **dúi cho bạn một tờ giấy** rồi lừa bạn đóng dấu lên.

Cookie phiên đăng nhập chính là con dấu đó: trình duyệt **tự động đính kèm** mỗi khi gửi request tới `bank.com`, kể cả khi request được bấm từ trang của kẻ xấu.

Cách chặn: ngân hàng bắt phải có thêm **mã số chỉ in trên tờ đơn do chính họ phát ra** (`CSRF token`) — kẻ xấu tự soạn giấy thì không tài nào biết mã đó.

:::

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

:::tip[Ví dụ đời thường]

Quán phở đông khách nên **phát số thứ tự**, mỗi người một tô một lượt. Không có nó thì một ông bê nguyên nồi, cả quán nhịn đói.

Rate limit cũng vậy: nó không phân biệt khách tốt khách xấu, chỉ nói "mỗi người bằng đó lượt trong bằng đó phút".

Cái giá phải trả: siết quá tay thì **khách thật cũng bị chặn** — nên login siết mạnh (5 lần / 15 phút), còn API thường thì nới tay hơn.

:::

**Strategies**:

- **Fixed Window** — N request / 1 phút.
- **Sliding Window** — N request / 60s gần nhất.
- **Token Bucket** — fill rate + bucket size.
- **Leaky Bucket** — process rate cố định.

:::tip[Ví dụ đời thường]

Bốn kiểu bác bảo vệ đếm lượt vào cổng:

| Cách | Bác bảo vệ làm gì | Điểm yếu |
|---|---|---|
| **Fixed Window** | Cứ tới đầu giờ là **xóa bảng đếm** làm lại từ 0 | Dồn 10 lượt cuối giờ này + 10 lượt đầu giờ sau = 20 lượt trong một phút |
| **Sliding Window** | Luôn nhìn lại **60 giây vừa qua** | Phải nhớ giờ của từng lượt, tốn công hơn |
| **Token Bucket** | Có **xô vé**, nhỏ đều 1 vé/giây, ai vào lấy một vé | Cho phép "xả một cục" khi xô đang đầy |
| **Leaky Bucket** | Cho vào **nhỏ giọt đều tay**, ai tới sớm phải xếp hàng đợi | Không chịu nổi burst, khách phải chờ |

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `OWASP Top 10` là gì và dùng để làm gì? Vì sao `Broken Access Control` đứng đầu bảng?
2. Giải thích `SQL Injection` bằng một ví dụ cụ thể. Vì sao việc ghép chuỗi input vào câu SQL lại nguy hiểm đến vậy?
3. `Parameterized query` chặn SQL injection bằng cơ chế nào? Nó khác việc "escape ký tự đặc biệt" ở chỗ nào?
4. Dùng ORM thì có miễn nhiễm SQL injection không? Chỉ ra những chỗ ORM vẫn dính.
5. Tên cột / tên bảng động (ví dụ `ORDER BY` theo query param) không parameterize được — bạn xử lý thế nào?
6. `Blind SQL injection` là gì? Attacker moi dữ liệu ra sao khi ứng dụng không in kết quả hay lỗi ra màn hình?
7. `NoSQL injection` xảy ra thế nào với MongoDB (ví dụ `{"$ne": ""}` ở field password)? Vì sao validate kiểu dữ liệu lại chặn được?
8. Ngoài parameterized query, còn tầng phòng thủ nào cho database (least privilege cho DB user, tách read/write, không trả lỗi SQL ra client)?
9. `XSS` là gì? Phân biệt `Reflected`, `Stored`, `DOM-based` — loại nào nguy hiểm nhất và vì sao?
10. Vì sao chống XSS phải `escape` ở lúc render output chứ không chỉ lọc lúc nhận input?
11. Escape trong HTML body, trong attribute, trong URL và trong JS context khác nhau ra sao? Giải thích context-aware escaping.
12. React/Vue đã auto-escape thì XSS còn lọt ở đâu? Kể các trường hợp `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `href="javascript:"`.
13. Sản phẩm cần cho user nhập rich text (bình luận có định dạng). Bạn làm gì để vừa giữ được HTML vừa an toàn?
14. Cookie `HttpOnly` có "chống được XSS" không, hay chỉ giảm thiệt hại? Khi attacker đã chạy được JS trên trang, họ còn làm được gì?
15. `CSRF` hoạt động thế nào? Vì sao attacker gây hại được mà **không cần đọc** được response trả về?
16. `CSRF token` chặn tấn công bằng nguyên lý gì? So sánh `synchronizer token` với `double-submit cookie`.
17. `SameSite=Strict|Lax|None` mỗi giá trị chặn được gì? Vì sao chỉ dựa vào `SameSite` vẫn chưa đủ?
18. Vì sao API dùng `JWT` trong header `Authorization` thường không cần CSRF token, còn dùng cookie thì cần?
19. Kiểm `Origin` / `Referer` có đủ chống CSRF không? Những tình huống nào hai header này vắng mặt hoặc không tin được?
20. So sánh `XSS` và `CSRF`: mục tiêu tấn công, hướng tấn công, và cách phòng thủ khác nhau ra sao?
21. `IDOR` / `Broken Access Control` là gì? Bạn test endpoint `GET /orders/:id` như thế nào để phát hiện lỗi này?
22. So sánh `fixed window`, `sliding window`, `token bucket`, `leaky bucket`. Fixed window bị burst gấp đôi ở ranh giới cửa sổ như thế nào?
23. Rate limit theo IP có vấn đề gì (NAT, mobile carrier, proxy, `X-Forwarded-For` giả mạo)? Bạn chọn khoá để đếm ra sao?
24. Hệ thống chạy nhiều instance thì implement rate limit phân tán thế nào? Trả về status code và header gì cho client?
25. `SSRF` là gì? Vì sao endpoint metadata `169.254.169.254` lại nguy hiểm, và chặn thế nào cho đủ (whitelist, chặn private IP, chặn redirect, DNS rebinding)?
26. Chức năng nào trong sản phẩm dễ dính SSRF nhất (webhook do user cấu hình, URL preview, sinh PDF/ảnh từ URL) và bạn thiết kế phòng thủ ra sao?
27. `Mass assignment` / over-posting là gì? Gán thẳng `req.body` vào model gây hậu quả gì?
28. Thông báo lỗi và log phải viết thế nào để không rò rỉ thông tin nhạy cảm mà vẫn đủ để debug production?
29. Bạn kiểm soát rủi ro từ dependency bên thứ ba ra sao (`Dependabot`, `Snyk`, lockfile, supply chain attack)?
30. `Defense in depth` nghĩa là gì với một request đi qua middleware → service → database? Kể các tầng kiểm tra và lý do không được bỏ tầng nào.
