---
sidebar_position: 2
title: "2. Application Security: SQL Injection, XSS, CSRF"
---

# Application Security: SQL Injection, XSS, CSRF

Bài này giới thiệu các lỗ hổng bảo mật hay gặp nhất ở tầng ứng dụng như SQL Injection, XSS, CSRF cùng cách phòng chống chúng. Đây đều là những lỗi kinh điển khiến hacker có thể đánh cắp dữ liệu, chiếm tài khoản người dùng hoặc phá hủy database của bạn. Nắm được những kiến thức này giúp bạn viết code an toàn ngay từ đầu thay vì sửa lỗi sau khi bị tấn công.

[![Sơ đồ tóm tắt bài: Application Security: SQL Injection, XSS, CSRF](/img/backend/application-security.webp)](pathname:///img/backend/application-security.webp)

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `OWASP Top 10` là gì và dùng để làm gì? Vì sao `Broken Access Control` đứng đầu bảng?**

<details className="qa">
<summary>Xem đáp án</summary>

`OWASP Top 10` là danh sách mười nhóm rủi ro bảo mật web phổ biến và nghiêm trọng nhất, do tổ chức phi lợi nhuận OWASP tổng hợp từ dữ liệu thực tế và cập nhật vài năm một lần. Nó không phải tiêu chuẩn tuân thủ mà là **danh sách ưu tiên**: dùng làm checklist review code, làm khung đào tạo cho đội, và làm cơ sở cho kiểm thử trước khi deploy.

Bản 2021 xếp `Broken Access Control` đứng đầu, với con số đáng chú ý là 94% ứng dụng được kiểm có dạng lỗi này. Lý do nó phổ biến:

- Phân quyền là logic **riêng của từng nghiệp vụ**, không có thư viện nào làm hộ như cách ORM làm hộ chuyện SQL injection.
- Mỗi endpoint mới là một cơ hội quên kiểm, và số endpoint thì tăng liên tục.
- Lỗi rất khó phát hiện bằng công cụ tự động, vì request vẫn hợp lệ về cú pháp — chỉ là sai người.
- Hậu quả trực tiếp: đổi một con số trên URL là đọc được dữ liệu người khác (IDOR).

</details>

**2. Giải thích `SQL Injection` bằng một ví dụ cụ thể. Vì sao việc ghép chuỗi input vào câu SQL lại nguy hiểm đến vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

SQL Injection xảy ra khi dữ liệu người dùng được ghép thẳng vào câu SQL, khiến database **hiểu dữ liệu đó thành lệnh**:

```js
const id = req.query.id;
db.execute(`SELECT * FROM users WHERE id = ${id}`);

// User gửi: id=1; DROP TABLE users; --
// Câu chạy thật: SELECT * FROM users WHERE id = 1; DROP TABLE users; --
```

Bài ví như tờ giấy rút tiền để chỗ trống: khách điền thêm cả một mệnh lệnh, mà nhân viên lại đọc cả tờ như một câu liền mạch.

Nguy hiểm vì ranh giới giữa **code và data bị xoá**. Database không có cách nào biết đoạn nào là câu lệnh do lập trình viên viết, đoạn nào là chuỗi do người lạ gửi lên. Từ một lỗ nhỏ, kẻ tấn công có thể đọc toàn bộ bảng bằng `UNION SELECT`, bỏ qua đăng nhập bằng một mệnh đề luôn đúng, sửa hoặc xoá dữ liệu, thậm chí đọc file và chạy lệnh hệ thống nếu DB user có quyền cao.

</details>

**3. `Parameterized query` chặn SQL injection bằng cơ chế nào? Nó khác việc "escape ký tự đặc biệt" ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Parameterized query gửi **câu lệnh và dữ liệu đi riêng**. Driver gửi trước phần khung có placeholder, database phân tích và lập kế hoạch thực thi cho khung đó; sau đó giá trị mới được gửi tới và gắn vào như **một giá trị đơn thuần**, không bao giờ được parse lại thành SQL.

```js
await db.query("SELECT * FROM users WHERE id = $1", [req.query.id]);
```

Người dùng có gửi `1; DROP TABLE users; --` thì cả chuỗi đó chỉ được so sánh như một giá trị của cột `id` — đúng như hình ảnh tờ giấy có ô vuông riêng trong bài.

Khác với escape ở chỗ căn bản:

| | Escape thủ công | Parameterized |
|---|---|---|
| Nguyên lý | Vẫn ghép chuỗi, chỉ thêm dấu thoát | Không ghép, tách hẳn code và data |
| Rủi ro | Sót một ký tự, sai charset, sai context là thủng | Không có ranh giới để phá |
| Ai chịu trách nhiệm | Lập trình viên nhớ đúng mọi trường hợp | Driver và database |

Escape là vá triệu chứng, parameterize là loại bỏ nguyên nhân.

</details>

**4. Dùng ORM thì có miễn nhiễm SQL injection không? Chỉ ra những chỗ ORM vẫn dính.**

<details className="qa">
<summary>Xem đáp án</summary>

Không miễn nhiễm. ORM hiện đại như Prisma hay Drizzle **tự parameterize** cho các truy vấn thông thường, nên phần lớn code an toàn mặc định — nhưng vẫn còn những lối thoát hiểm:

```ts
// Vulnerable — interpolate vào raw query
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${id}`);

// An toàn — template tag, Prisma tự tách tham số
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`;
```

Những chỗ hay dính:

- **Raw query** — `$queryRawUnsafe`, `sequelize.query`, `db.execute` với chuỗi ghép.
- **Tên cột, tên bảng, hướng sắp xếp động** — không parameterize được, buộc phải whitelist.
- **Fragment SQL thô** nhét vào mệnh đề `where`, `having`, hoặc hàm `sql.raw`.
- **`LIMIT` / `OFFSET`** nhận thẳng query param ở một số driver cũ.
- **NoSQL injection** ở tầng ODM khi nhận nguyên object từ `req.body`.

Nguyên tắc: hễ thấy dấu ghép chuỗi hoặc chữ `raw`/`unsafe` trong tên hàm thì đó là chỗ cần soi kỹ.

</details>

**5. Tên cột / tên bảng động (ví dụ `ORDER BY` theo query param) không parameterize được — bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Placeholder chỉ thay được **giá trị**, không thay được định danh, vì database phải biết tên cột ngay lúc lập kế hoạch truy vấn. Cách duy nhất an toàn là **whitelist**: không lọc cái xấu, mà chỉ chấp nhận đúng những giá trị đã biết trước.

```js
const ALLOWED_SORT = ["name", "email", "created_at"];
const ALLOWED_DIR = ["ASC", "DESC"];

const sort = ALLOWED_SORT.includes(req.query.sort) ? req.query.sort : "created_at";
const dir = ALLOWED_DIR.includes(req.query.dir?.toUpperCase()) ? req.query.dir : "ASC";

db.query(`SELECT * FROM users ORDER BY ${sort} ${dir}`);
```

Vài lưu ý khi làm thật:

- Nên **map** từ khoá do client gửi sang tên cột thật, thay vì để client biết trực tiếp tên cột trong DB.
- Có giá trị mặc định an toàn khi input không hợp lệ, hoặc trả lỗi 400 — đừng ném luôn chuỗi lạ vào SQL.
- Đừng thay whitelist bằng regex kiểu "chỉ cho chữ và gạch dưới"; nó chặn được cú pháp nhưng vẫn cho phép sắp xếp theo cột nhạy cảm.
- Nếu ORM có API xây dựng định danh an toàn, ưu tiên dùng API đó.

</details>

**6. `Blind SQL injection` là gì? Attacker moi dữ liệu ra sao khi ứng dụng không in kết quả hay lỗi ra màn hình?**

<details className="qa">
<summary>Xem đáp án</summary>

`Blind SQL injection` là khi lỗ hổng vẫn tồn tại nhưng ứng dụng **không trả kết quả truy vấn hay thông báo lỗi** ra cho kẻ tấn công. Không đọc được dữ liệu trực tiếp, họ chuyển sang hỏi database từng câu đúng/sai và quan sát phản ứng.

Hai kỹ thuật chính:

- **Boolean-based** — chèn điều kiện rồi so sánh phản hồi. Trang trả về bình thường nghĩa là điều kiện đúng, trả về trống nghĩa là sai. Hỏi kiểu "ký tự đầu của mật khẩu admin có lớn hơn `m` không" rồi tìm nhị phân, mỗi ký tự chỉ tốn vài request.
- **Time-based** — khi phản hồi không khác gì nhau, chèn hàm làm database ngủ và đo thời gian đáp. Chậm 5 giây nghĩa là điều kiện đúng.

Còn biến thể **out-of-band**: ép database tự gửi một truy vấn DNS hoặc HTTP mang theo dữ liệu tới máy chủ của kẻ tấn công.

Bài học: **giấu lỗi không phải là bản vá**. Không hiện lỗi SQL ra client là điều nên làm, nhưng lỗ hổng vẫn bị khai thác trọn vẹn, chỉ chậm hơn. Cách chữa vẫn là parameterized query.

</details>

**7. `NoSQL injection` xảy ra thế nào với MongoDB (ví dụ `{"$ne": ""}` ở field password)? Vì sao validate kiểu dữ liệu lại chặn được?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở MongoDB, truy vấn là **object** chứ không phải chuỗi, nên kẻ tấn công không chèn cú pháp mà chèn **toán tử**:

```js
db.users.find({ email: req.body.email, password: req.body.password });

// Client gửi JSON: { "email": "a@b.c", "password": { "$ne": "" } }
// Điều kiện thành: password khác rỗng → luôn đúng → đăng nhập lọt
```

Body parser nhận JSON và dựng ra object lồng nhau, ứng dụng nhét thẳng vào query, thế là `$ne` được MongoDB hiểu như toán tử thật. Các toán tử hay bị lạm dụng khác gồm `$gt`, `$regex` (dò từng ký tự mật khẩu), `$where` (chạy được JS).

Validate kiểu dữ liệu chặn được vì nó khôi phục đúng giả định mà code đang ngầm dựa vào — rằng `password` là một chuỗi:

```ts
const schema = z.object({
  email: z.string().email(),
  password: z.string(),  // object bị reject ngay
});
const { email, password } = schema.parse(req.body);
```

Chỉ cần giá trị không còn là object thì không có cách nào biến nó thành toán tử.

</details>

**8. Ngoài parameterized query, còn tầng phòng thủ nào cho database (least privilege cho DB user, tách read/write, không trả lỗi SQL ra client)?**

<details className="qa">
<summary>Xem đáp án</summary>

Parameterized query là tầng chính, nhưng theo tinh thần **defense in depth** thì vẫn cần các tầng phía sau để giảm thiệt hại nếu tầng đầu thủng:

- **Least privilege** — DB user của ứng dụng chỉ có `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên đúng schema cần thiết. Không `DROP`, không `SUPERUSER`, không quyền đọc file. Injection thành công cũng không wipe được database.
- **Tách read/write** — chức năng chỉ đọc dùng connection tới replica với tài khoản read-only.
- **Không trả lỗi SQL ra client** — thông điệp lỗi chi tiết giúp kẻ tấn công vẽ lại cấu trúc bảng; production chỉ trả mã lỗi chung, chi tiết ghi vào log.
- **Row Level Security** ở PostgreSQL cho ứng dụng multi-tenant.
- **Validate input bằng schema** trước khi chạm tới tầng DB.
- **Giới hạn kết quả trả về** và timeout truy vấn, tránh bị rút cả bảng trong một request.
- **Log và cảnh báo** truy vấn bất thường, kèm rate limit trên endpoint tìm kiếm.
- **Mã hoá cột nhạy cảm** và hash password, để dữ liệu lấy được vẫn ít giá trị.

</details>

**9. `XSS` là gì? Phân biệt `Reflected`, `Stored`, `DOM-based` — loại nào nguy hiểm nhất và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`XSS` là việc chèn được script của kẻ tấn công vào trang, để nó chạy trong trình duyệt của người dùng khác **dưới danh nghĩa website của bạn** — nên trình duyệt tin tưởng và giao cả cookie lẫn session cho nó, đúng như hình ảnh tờ giấy giả dán trên bảng thông báo chung cư.

| Loại | Payload nằm ở đâu | Cách phát tán |
|---|---|---|
| **Reflected** | Trong URL, server echo lại ngay | Phải dụ nạn nhân bấm link |
| **Stored** | Lưu trong database | Tự động hiện với mọi người xem |
| **DOM-based** | Không qua server, do JS client xử lý sai | Qua link hoặc fragment `#` |

**Stored nguy hiểm nhất**: payload nằm sẵn trong nội dung hợp lệ của site, tự lây tới mọi người mở trang mà không cần lừa ai bấm gì. Nếu nó nằm ở trang mà admin hay xem thì kẻ tấn công chiếm được tài khoản quyền cao; vài trường hợp còn lan theo cấp số nhân như sâu.

DOM-based khó phát hiện vì payload có thể nằm sau dấu `#` nên **không bao giờ tới server**, log server sạch bong.

</details>

**10. Vì sao chống XSS phải `escape` ở lúc render output chứ không chỉ lọc lúc nhận input?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì một chuỗi chỉ **nguy hiểm trong một ngữ cảnh cụ thể**, mà lúc nhận input bạn chưa biết nó sẽ được hiển thị ở đâu. Cùng dữ liệu đó có thể đi vào HTML body, vào attribute, vào URL, vào JSON cho app mobile, hay ra file CSV — mỗi nơi cần một cách thoát khác nhau.

Các lý do khác:

- **Dữ liệu vào hệ thống từ nhiều cửa**: import file, job nền, message queue, migration, API nội bộ. Lọc ở một endpoint không phủ hết.
- **Lọc input làm hỏng dữ liệu thật** — người tên "O'Brien", bình luận về toán học có dấu nhỏ hơn, tất cả bị cắt xén không khôi phục lại được.
- **Blacklist luôn thiếu**. Bộ lọc gỡ chữ `script` thì kẻ tấn công dùng `onerror` trên thẻ `img`.
- **Escape lúc render thì luôn đúng thời điểm**: bạn biết chính xác đang render vào đâu.

Nguyên tắc thực hành: **lưu dữ liệu thô, escape khi xuất**. Validate input vẫn cần, nhưng để đảm bảo dữ liệu đúng nghiệp vụ, không phải để chống XSS.

</details>

**11. Escape trong HTML body, trong attribute, trong URL và trong JS context khác nhau ra sao? Giải thích context-aware escaping.**

<details className="qa">
<summary>Xem đáp án</summary>

`Context-aware escaping` nghĩa là chọn cách thoát **theo đúng nơi dữ liệu được chèn vào**, vì mỗi ngữ cảnh có bộ ký tự phá vỡ cú pháp riêng.

| Ngữ cảnh | Cần xử lý | Ví dụ thủng nếu sai |
|---|---|---|
| HTML body | Đổi `&`, `<`, `>` thành entity | Chèn được thẻ mới |
| Attribute | Thêm `"` và `'`; luôn bọc giá trị trong nháy | Thoát khỏi nháy rồi thêm `onerror=` |
| URL / query | `encodeURIComponent`, kiểm cả scheme | `javascript:` chạy khi bấm link |
| Trong thẻ script | Không nhét dữ liệu vào code; dùng `JSON.stringify` và thoát `<` | Đóng sớm thẻ script |
| CSS | Tránh hẳn dữ liệu người dùng trong style | `url()` gọi ra ngoài |

Hàm `escapeHtml` trong bài đủ cho HTML body và attribute có nháy, nhưng **không** cứu được attribute `href`: giá trị `javascript:alert(1)` chẳng có ký tự đặc biệt nào để escape. Chỗ đó phải validate scheme bằng `new URL` như ví dụ `safeUrl`.

Vì vậy trong thực tế nên để template engine có auto-escape theo ngữ cảnh lo phần này, thay vì tự nối chuỗi HTML.

</details>

**12. React/Vue đã auto-escape thì XSS còn lọt ở đâu? Kể các trường hợp `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `href="javascript:"`.**

<details className="qa">
<summary>Xem đáp án</summary>

React, Vue, Svelte escape mặc định mọi giá trị nội suy, nên `<p>Hello, {user.name}</p>` là an toàn. XSS còn lọt ở những chỗ bạn **chủ động bước ra khỏi cơ chế đó**:

- **`dangerouslySetInnerHTML` và `v-html`** — nhận HTML thô. Chỉ dùng với nội dung đã qua sanitize.
- **DOM thủ công** — `el.innerHTML = userInput`, `document.write`, hoặc thư viện bên thứ ba tự chèn HTML.
- **URL không kiểm scheme**:

```jsx
<a href={user.website}>Website</a>
// user.website = "javascript:alert(1)" → bấm vào là dính
```

Cách chữa là hàm `safeUrl` trong bài: parse bằng `new URL` rồi chỉ chấp nhận `http:` và `https:`.

- **Template phía server không escape** — EJS, Pug dùng sai cú pháp là in HTML thô.
- **Trải object vào props** hoặc gán thuộc tính động không kiểm soát.
- **Dữ liệu server nhúng vào HTML** để hydrate, nếu serialize không thoát `<`.

Ngoài ra, sanitize bằng `DOMPurify` và bật CSP để còn lớp chắn cuối cùng khi một trong những chỗ trên lỡ lọt.

</details>

**13. Sản phẩm cần cho user nhập rich text (bình luận có định dạng). Bạn làm gì để vừa giữ được HTML vừa an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Không tự viết bộ lọc HTML — đây là bài toán đã có thư viện chuyên trách, và mọi bộ lọc tự chế đều bị bypass. Dùng `DOMPurify` với **allowlist** thẻ và thuộc tính:

```ts
import DOMPurify from "isomorphic-dompurify";

const safe = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ["p", "b", "i", "a", "ul", "li"],
  ALLOWED_ATTR: ["href"],
});
```

Những điểm cần lưu ý:

- **Sanitize ở server**, không chỉ ở client — client hoàn toàn bỏ qua được.
- **Allowlist chứ không blocklist**: liệt kê thẻ được phép, mặc định từ chối phần còn lại.
- **Kiểm scheme của `href`** để chặn `javascript:` và `data:`; thêm `rel="noopener noreferrer"` cho link ra ngoài.
- Cân nhắc lưu **Markdown hoặc JSON có cấu trúc** thay vì HTML thô, rồi render sang HTML ở phía mình — an toàn hơn hẳn vì bạn kiểm soát đầu ra.
- Sanitize lại **lúc render** chứ không chỉ lúc lưu, phòng khi dữ liệu cũ được lưu bằng phiên bản luật lỏng hơn.
- Bật **CSP** làm lớp chắn cuối.

</details>

**14. Cookie `HttpOnly` có "chống được XSS" không, hay chỉ giảm thiệt hại? Khi attacker đã chạy được JS trên trang, họ còn làm được gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ **giảm thiệt hại**, không chống XSS. `HttpOnly` khiến JavaScript không đọc được cookie qua `document.cookie`, nên token không bị gửi thẳng về máy chủ của kẻ tấn công. Nhưng lỗ hổng vẫn nguyên, script vẫn chạy.

Khi đã chạy được JS trong trang, kẻ tấn công còn làm được rất nhiều:

- **Gửi request thay người dùng** ngay trong phiên đó — trình duyệt tự đính kèm cookie, nên đọc cookie hay không cũng chẳng quan trọng. Chuyển tiền, đổi email, tạo API key đều làm được.
- **Đọc mọi nội dung trên trang**: dữ liệu cá nhân, danh sách đơn hàng, kể cả CSRF token.
- **Keylogger** — gắn listener đọc những gì người dùng gõ, kể cả mật khẩu và OTP.
- **Vẽ lại giao diện** để lừa đăng nhập lại (phishing ngay trên đúng domain thật).
- **Đọc `localStorage`**, nơi nhiều app lỡ lưu JWT — đây là lý do cookie `HttpOnly` vẫn hơn `localStorage`.

Vì vậy `HttpOnly` là một lớp trong defense in depth, còn cách chữa gốc vẫn là escape output, sanitize và CSP.

</details>

**15. `CSRF` hoạt động thế nào? Vì sao attacker gây hại được mà không cần đọc được response trả về?**

<details className="qa">
<summary>Xem đáp án</summary>

CSRF lợi dụng việc trình duyệt **tự động đính kèm cookie** theo đích đến, bất kể request được phát ra từ trang nào:

```html
<!-- Trang của kẻ tấn công -->
<img src="https://bank.com/transfer?to=attacker&amount=1000000" />
```

Người dùng đang đăng nhập `bank.com` mà mở trang này thì trình duyệt gửi request kèm cookie phiên, server thấy cookie hợp lệ và tưởng chính chủ chủ động thao tác. Bài ví như con dấu để sẵn trong túi: kẻ xấu không cần trộm dấu, chỉ cần dúi cho bạn tờ giấy để bạn đóng lên.

Không cần đọc response vì **tác hại nằm ở tác dụng phụ của request, không nằm ở dữ liệu trả về**. Tiền đã chuyển, email đã đổi, quyền admin đã cấp — kẻ tấn công không cần nhìn thấy trang xác nhận. Chính vì vậy CORS không cứu được: CORS chỉ chặn việc *đọc* response, còn request thì vẫn tới server và vẫn được xử lý.

Hệ quả: mọi endpoint làm thay đổi trạng thái đều cần phòng CSRF, và không bao giờ dùng `GET` cho hành động gây tác dụng phụ.

</details>

**16. `CSRF token` chặn tấn công bằng nguyên lý gì? So sánh `synchronizer token` với `double-submit cookie`.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên lý: yêu cầu request mang theo một **bí mật mà chỉ trang thật mới biết**. Trình duyệt tự gửi cookie, nhưng không tự gửi token nằm trong HTML; trang của kẻ tấn công lại không đọc được nội dung trang bạn vì bị same-origin policy chặn. Đó là hình ảnh mã số chỉ in trên đơn do chính ngân hàng phát ra.

| | `Synchronizer token` | `Double-submit cookie` |
|---|---|---|
| Server lưu gì | Token gắn với session ở server | Không lưu gì (stateless) |
| So khớp | Token trong form với token trong session | Token trong cookie với token trong form/header |
| Độ an toàn | Cao hơn | Yếu hơn nếu có subdomain bị chiếm |
| Chi phí | Cần session store | Nhẹ, hợp hệ thống phân tán |

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random-token-from-session" />
</form>
```

Điểm yếu của double-submit: kẻ tấn công chiếm được một subdomain có thể ghi cookie cho domain cha rồi tự đặt cả hai vế khớp nhau. Khắc phục bằng cách ký token gắn với session (signed double-submit) và dùng tiền tố `__Host-` cho cookie.

</details>

**17. `SameSite=Strict|Lax|None` mỗi giá trị chặn được gì? Vì sao chỉ dựa vào `SameSite` vẫn chưa đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị | Hành vi | Đánh đổi |
|---|---|---|
| `Strict` | Không gửi cookie trong mọi request cross-site | Từ link ngoài vào là thấy như chưa đăng nhập |
| `Lax` | Gửi cho điều hướng cấp cao bằng `GET`, không gửi cho `POST` cross-site | Mặc định của trình duyệt hiện nay, chặn phần lớn CSRF |
| `None` | Gửi trong mọi trường hợp, bắt buộc kèm `Secure` | Cần cho SSO, widget nhúng — mở lại nguy cơ CSRF |

Chỉ dựa vào `SameSite` chưa đủ vì:

- **`Lax` vẫn cho `GET` cross-site đi kèm cookie**. Endpoint nào lỡ thay đổi trạng thái bằng `GET` là vẫn dính nguyên.
- **Phụ thuộc trình duyệt** — client cũ, một số WebView hoặc app trong ứng dụng khác không xử lý đúng.
- **Same-site rộng hơn same-origin**: các subdomain được coi là cùng site, nên một subdomain bị chiếm là tấn công được.
- Nhiều hệ thống buộc phải đặt `None` cho luồng tích hợp.

Nên `SameSite` là lớp bổ trợ rất tốt, nhưng endpoint quan trọng vẫn cần CSRF token hoặc kiểm `Origin`.

</details>

**18. Vì sao API dùng `JWT` trong header `Authorization` thường không cần CSRF token, còn dùng cookie thì cần?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì gốc rễ của CSRF là **trình duyệt tự động đính kèm thông tin xác thực**. Cookie thuộc loại đó: cứ đúng domain là gửi, không quan tâm ai phát ra request. Header `Authorization` thì ngược lại — nó phải do JavaScript **chủ động gắn vào** từng request.

Trang của kẻ tấn công không thể gắn header đó vào request tới API của bạn theo cách hữu ích, vì:

- Form HTML không đặt được header tuỳ chỉnh.
- `fetch` có đặt được, nhưng header tuỳ chỉnh làm request mất tư cách "simple" nên trình duyệt bắt buộc gửi **preflight**, và server không cho phép origin lạ thì dừng ngay ở đó.
- Quan trọng nhất: kẻ tấn công **không đọc được token** của nạn nhân, vì token nằm trong bộ nhớ hoặc storage của origin khác.

Đây cũng là lý do bài nói API-only backend ít phải lo CSRF, chỉ web form dùng session cookie mới cần token.

Lưu ý ngược lại: lưu JWT trong `localStorage` giúp tránh CSRF nhưng lại phơi token ra XSS. Combo bài khuyên là cookie `HttpOnly` + `SameSite=Lax` + CSRF token.

</details>

**19. Kiểm `Origin` / `Referer` có đủ chống CSRF không? Những tình huống nào hai header này vắng mặt hoặc không tin được?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là một lớp phòng thủ tốt và rẻ, nhưng không nên là lớp **duy nhất**:

```ts
if (req.headers.origin !== "https://app.example.com") {
  return res.status(403).send("CSRF check failed");
}
```

Những tình huống header vắng hoặc không đáng tin:

- **`Origin` vắng** ở một số request `GET` và điều hướng cùng site. Code từ chối khi thiếu thì hỏng chức năng, mà cho qua khi thiếu thì thủng — đó chính là chỗ khó.
- **`Referer` bị lược** bởi `Referrer-Policy`, bởi proxy doanh nghiệp, phần mềm diệt virus, hoặc khi đi từ HTTPS sang HTTP.
- **So khớp lỏng** — dùng `startsWith` hay `includes` khiến `app.example.com.evil.com` lọt.
- **Client không phải trình duyệt** tự đặt header gì cũng được; nhưng lúc đó không còn là CSRF vì không có cookie của nạn nhân.
- **Subdomain bị chiếm** vẫn gửi origin trông có vẻ hợp lệ nếu whitelist quá rộng.

Cách dùng đúng: so khớp chính xác, **từ chối khi thiếu** trên các endpoint thay đổi trạng thái, và vẫn giữ CSRF token cùng `SameSite` làm các lớp song song.

</details>

**20. So sánh `XSS` và `CSRF`: mục tiêu tấn công, hướng tấn công, và cách phòng thủ khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `XSS` | `CSRF` |
|---|---|---|
| Bản chất | Chạy code của kẻ tấn công trong trang của bạn | Mượn phiên đăng nhập để gửi request thay người dùng |
| Lợi dụng | Site tin dữ liệu người dùng | Site tin cookie mà trình duyệt tự gửi |
| Đọc được response? | Có — toàn quyền trong trang | Không cần, chỉ cần tác dụng phụ |
| Phòng thủ chính | Escape output, sanitize HTML, CSP | CSRF token, `SameSite`, kiểm `Origin` |
| Mức nguy hiểm | Cao hơn | Thấp hơn, phạm vi hẹp hơn |

Điểm quan trọng nhất về quan hệ giữa hai lỗi: **có XSS thì mọi biện pháp chống CSRF đều vô nghĩa**. Script chạy ngay trong origin của bạn nên nó đọc được CSRF token trên trang, gửi được request same-site nên `SameSite` không chặn, và header `Origin` thì hoàn toàn hợp lệ.

Vì vậy thứ tự ưu tiên khi sửa là diệt XSS trước. Ngược lại, chống CSRF tốt không giúp gì cho XSS — hai cơ chế phòng thủ hoàn toàn độc lập và đều phải có.

</details>

**21. `IDOR` / `Broken Access Control` là gì? Bạn test endpoint `GET /orders/:id` như thế nào để phát hiện lỗi này?**

<details className="qa">
<summary>Xem đáp án</summary>

`IDOR` (Insecure Direct Object Reference) là khi endpoint nhận định danh của một tài nguyên rồi trả về luôn mà **không kiểm người gọi có quyền với tài nguyên đó không**. Server chỉ xác thực (bạn là ai) mà quên phân quyền (bạn được xem cái gì) — nhánh phổ biến nhất của `Broken Access Control`.

Cách test `GET /orders/:id`:

1. Đăng nhập tài khoản A, tạo đơn hàng, ghi lại `id`.
2. Đăng nhập tài khoản B, gọi thẳng đơn của A. Kỳ vọng 403 hoặc 404, nhận 200 là thủng.
3. Thử **không gửi token** và thử token đã hết hạn.
4. Thử tài khoản thường gọi **endpoint admin** với cùng `id`.
5. Thử đổi method: đọc thì chặn nhưng `PUT` và `DELETE` có khi quên kiểm.
6. Thử **id lân cận** nếu là số tăng dần, và thử id ở tenant khác.
7. Soi cả response xem có lộ trường nội bộ không.

Phòng thủ: luôn truy vấn kèm ràng buộc chủ sở hữu, đặt kiểm quyền ở tầng service chứ không rải rác ở controller, dùng UUID thay số tăng dần, và viết test tự động cho các luồng trên.

</details>

**22. So sánh `fixed window`, `sliding window`, `token bucket`, `leaky bucket`. Fixed window bị burst gấp đôi ở ranh giới cửa sổ như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuật toán | Cách hoạt động | Điểm yếu |
|---|---|---|
| **Fixed window** | Đếm trong mỗi khung thời gian cố định, hết khung reset về 0 | Burst gấp đôi ở ranh giới |
| **Sliding window** | Luôn nhìn lại N giây gần nhất | Tốn bộ nhớ vì phải nhớ mốc từng request |
| **Token bucket** | Xô vé được nạp đều, mỗi request tiêu một vé | Cho phép xả một cục khi xô đầy |
| **Leaky bucket** | Xử lý với tốc độ cố định, request xếp hàng | Không chịu được burst, tăng độ trễ |

Vấn đề ranh giới của fixed window: giả sử giới hạn 10 request mỗi phút. Kẻ gọi dồn 10 request vào giây 59 của phút thứ nhất, rồi 10 request nữa vào giây 01 của phút thứ hai. Mỗi cửa sổ đều hợp lệ, nhưng trong **khoảng hai giây thực tế server nhận 20 request** — gấp đôi giới hạn mong muốn.

Sliding window sinh ra để trị đúng chỗ này, đổi lại tốn bộ nhớ hơn. Trong thực tế hay dùng **sliding window counter** (nội suy giữa hai cửa sổ kề) vì rẻ gần bằng fixed mà mượt gần bằng sliding, đúng như `Ratelimit.slidingWindow` trong ví dụ của bài.

</details>

**23. Rate limit theo IP có vấn đề gì (NAT, mobile carrier, proxy, `X-Forwarded-For` giả mạo)? Bạn chọn khoá để đếm ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề của khoá theo IP:

- **NAT và mạng carrier** — cả một văn phòng hay hàng nghìn thuê bao di động dùng chung một IP công cộng. Siết chặt là chặn nhầm người dùng thật.
- **IPv6** — một người dùng có sẵn cả khối địa chỉ, đổi IP mỗi request là thoát; nên tính theo prefix chứ không theo địa chỉ đơn.
- **`X-Forwarded-For` giả mạo** — header do client đặt được. Đọc mù quáng phần tử đầu tiên thì ai cũng vượt giới hạn bằng cách bịa IP.
- **Cloud proxy** — lượng lớn traffic hợp lệ đi qua một dải IP chung.

Cách chọn khoá thực tế:

- Đã đăng nhập thì đếm theo **user id** hoặc **API key** — chính xác nhất.
- Chưa đăng nhập thì đếm theo IP, nhưng phải lấy IP đáng tin: chỉ tin phần `X-Forwarded-For` do proxy của chính bạn thêm vào, cấu hình đúng số hop tin cậy.
- Kết hợp nhiều tầng: theo tài khoản, theo IP, theo endpoint. Ví dụ login siết theo cả tài khoản (chống dò mật khẩu) lẫn IP (chống credential stuffing).
- Chọn ngưỡng theo endpoint như bảng trong bài: login 5 lần mỗi 15 phút, API thường 100 lần mỗi phút.

</details>

**24. Hệ thống chạy nhiều instance thì implement rate limit phân tán thế nào? Trả về status code và header gì cho client?**

<details className="qa">
<summary>Xem đáp án</summary>

Đếm trong bộ nhớ từng instance là sai, vì N instance sẽ cho qua gấp N lần giới hạn. Cần một **kho đếm dùng chung**, phổ biến nhất là Redis với thao tác nguyên tử (`INCR` kèm `EXPIRE`, hoặc một Lua script cho sliding window):

```ts
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const { success } = await ratelimit.limit(ip);
if (!success) return res.status(429).json({ error: "Too many requests" });
```

Vài lưu ý vận hành: đẩy rate limit ra tầng gateway/CDN cho traffic lớn; quyết định trước hành vi khi Redis chết (thường là cho qua để không sập dịch vụ, nhưng vẫn giữ giới hạn cục bộ làm chặn thô).

Phản hồi cho client:

- **`429 Too Many Requests`** cho vượt giới hạn; đừng dùng `403`.
- **`Retry-After`** — số giây client nên chờ.
- **`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`** để client tự điều tiết.
- Body lỗi rõ ràng, và khuyến nghị client retry có `exponential backoff` kèm jitter.

</details>

**25. `SSRF` là gì? Vì sao endpoint metadata `169.254.169.254` lại nguy hiểm, và chặn thế nào cho đủ (whitelist, chặn private IP, chặn redirect, DNS rebinding)?**

<details className="qa">
<summary>Xem đáp án</summary>

`SSRF` là khi ứng dụng gọi một URL do **người dùng kiểm soát**, biến server thành cầu nối để kẻ tấn công chạm tới những nơi họ không tự tới được:

```ts
const data = await fetch(req.query.url); // URL do user đưa
```

`169.254.169.254` là endpoint metadata của máy ảo trên cloud. Nó nguy hiểm vì nằm trong mạng nội bộ, **không đòi xác thực** (bản IMDSv1), và trả về cả thông tin cấu hình lẫn **IAM credentials tạm thời** của instance. Lấy được credentials đó là kẻ tấn công thao tác được trên tài khoản cloud.

Chặn cho đủ cần nhiều lớp, vì mỗi lớp đều có cách lách:

- **Whitelist domain** được phép gọi — mạnh nhất, nên ưu tiên.
- **Chặn dải private và loopback** (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`) và chỉ cho `http`/`https`.
- **Kiểm lại sau mỗi redirect**, không chỉ kiểm URL ban đầu.
- **Chống DNS rebinding** — resolve DNS trước, kiểm IP, rồi kết nối tới đúng IP đó để domain không kịp đổi sang IP nội bộ giữa hai bước.
- **Tách mạng**: đẩy request ra qua egress proxy, bật IMDSv2.

</details>

**26. Chức năng nào trong sản phẩm dễ dính SSRF nhất (webhook do user cấu hình, URL preview, sinh PDF/ảnh từ URL) và bạn thiết kế phòng thủ ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Bài liệt kê đúng ba nhóm rủi ro nhất, đều có chung đặc điểm: **người dùng đưa URL, server đi gọi**.

- **Webhook do user cấu hình** — hệ thống gọi ra định kỳ, lại thường mang theo payload.
- **URL preview** kiểu Slack — dán link là server fetch ngay.
- **Sinh PDF/ảnh từ URL** — nguy hiểm nhất vì headless browser còn chạy JS, đọc được cả `file://` nếu cấu hình lỏng.

Ngoài ra còn import từ URL, avatar theo link, và tích hợp "kết nối server của bạn".

Thiết kế phòng thủ theo lớp:

- **Validate lúc cấu hình**: chỉ `https`, chặn IP nội bộ và tên miền nội bộ, chặn cổng lạ.
- **Validate lại lúc gọi** — DNS có thể đã đổi từ lúc lưu tới lúc dùng.
- **Gọi ra từ worker cô lập**, không có quyền vào mạng nội bộ, đi qua egress proxy có allowlist.
- **Không đi theo redirect**, hoặc kiểm lại từng chặng.
- **Giới hạn timeout, kích thước và kiểu nội dung** trả về.
- **Không trả body thô về cho người dùng** — chỉ trả trạng thái, tránh biến nó thành cổng đọc dữ liệu nội bộ.
- Với webhook, ký payload bằng HMAC và ghi log đầy đủ.

</details>

**27. `Mass assignment` / over-posting là gì? Gán thẳng `req.body` vào model gây hậu quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`Mass assignment` là khi code lấy nguyên object từ client rồi gán thẳng vào model hoặc câu update. Người dùng gửi thêm những trường mà giao diện không hề có, và chúng vẫn được ghi vào database:

```ts
// SAI — client gửi gì cũng ghi
await db.user.update({ where: { id }, data: req.body });

// Client gửi: { "name": "A", "role": "admin", "emailVerified": true }
// → tự nâng mình lên admin
```

Hậu quả điển hình: tự cấp quyền admin, đổi `userId` của bản ghi sang người khác, bỏ qua xác minh email, sửa giá hoặc số dư, đổi trạng thái đơn hàng sang "đã thanh toán".

Cách chữa:

```ts
const schema = z.object({ name: z.string(), avatarUrl: z.string().url() });
const data = schema.parse(req.body);  // trường lạ bị loại
await db.user.update({ where: { id }, data });
```

Nguyên tắc: **allowlist trường được phép ghi**, đừng blacklist. Tách DTO cho từng thao tác thay vì dùng chung một model, và tách hẳn endpoint cho những thao tác nhạy cảm như đổi vai trò, đổi mật khẩu — kèm kiểm quyền riêng.

</details>

**28. Thông báo lỗi và log phải viết thế nào để không rò rỉ thông tin nhạy cảm mà vẫn đủ để debug production?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng chính: **tách hai kênh**. Client nhận thông điệp chung chung, hệ thống log giữ chi tiết đầy đủ, nối hai bên bằng một mã định danh.

Phía client:

- Thông điệp chung, không stack trace, không câu SQL, không tên bảng, không đường dẫn file, không phiên bản thư viện.
- Kèm một `requestId` để người dùng báo lại cho support.
- **Không phân biệt** "email không tồn tại" với "sai mật khẩu" — chỉ nói "thông tin đăng nhập không đúng", tránh cho phép dò danh sách tài khoản. Tương tự với chức năng quên mật khẩu và đăng ký.
- Lỗi phân quyền nên cân nhắc trả `404` thay vì `403` để không xác nhận tài nguyên có tồn tại.

Phía log:

- Ghi đủ ngữ cảnh: `requestId`, user id, endpoint, tham số đã lọc, stack trace.
- **Che dữ liệu nhạy cảm**: mật khẩu, token, số thẻ, OTP, thông tin cá nhân. Đặt danh sách trường bị che ngay trong logger.
- Log có cấu trúc để truy vấn được, đặt thời hạn lưu trữ và giới hạn quyền truy cập.
- Ghi riêng **audit log** cho hành động nhạy cảm như đăng nhập và thanh toán.

</details>

**29. Bạn kiểm soát rủi ro từ dependency bên thứ ba ra sao (`Dependabot`, `Snyk`, lockfile, supply chain attack)?**

<details className="qa">
<summary>Xem đáp án</summary>

Dependency không patch nằm hẳn trong OWASP Top 10, và phần lớn code chạy trên production là code người khác viết. Cách kiểm soát:

- **Lockfile bắt buộc commit**, và CI cài bằng `npm ci` để build tái lập được đúng cây phụ thuộc.
- **Quét tự động** — `Dependabot` hoặc `Snyk` mở PR khi có CVE; `npm audit` chạy trong CI.
- **Chốt phiên bản** cho dependency quan trọng, tránh dải phiên bản quá rộng khiến một bản vá nhỏ tự vào production.
- **Giảm số lượng phụ thuộc** — cân nhắc trước khi thêm package cho một hàm vài dòng; ưu tiên thư viện có người duy trì thật, cập nhật đều.
- **Chống supply chain attack**: bật `ignore-scripts` để chặn script cài đặt, để một khoảng trễ trước khi nâng lên bản vừa phát hành, cảnh giác với typosquatting, dùng đăng ký nội bộ hoặc mirror.
- **Ký và kiểm tra provenance**, sinh SBOM để biết mình đang chạy những gì.
- **Quy trình phản ứng**: có người trực, có SLA vá theo mức nghiêm trọng, và khả năng deploy nhanh khi lỗ hổng nghiêm trọng xuất hiện.

</details>

**30. `Defense in depth` nghĩa là gì với một request đi qua middleware → service → database? Kể các tầng kiểm tra và lý do không được bỏ tầng nào.**

<details className="qa">
<summary>Xem đáp án</summary>

`Defense in depth` là **xếp nhiều lớp phòng thủ độc lập**, chấp nhận rằng lớp nào cũng có thể hỏng, nên kẻ tấn công phải phá được tất cả mới thành công.

Với một request:

- **Tầng biên** — HTTPS, security header, CORS, rate limit, chặn payload quá lớn.
- **Middleware** — xác thực token, gắn danh tính vào request, kiểm CSRF.
- **Validate input** bằng schema, chỉ nhận đúng các trường cho phép.
- **Service** — phân quyền theo nghiệp vụ: user này có được động vào tài nguyên này không. Đây là tầng không công cụ nào làm hộ.
- **Truy cập dữ liệu** — parameterized query, truy vấn kèm ràng buộc chủ sở hữu, DB user quyền tối thiểu.
- **Đầu ra** — chỉ trả trường cần thiết, escape khi render.
- **Quan sát** — audit log và cảnh báo cho hành động nhạy cảm.

Không bỏ được tầng nào vì mỗi tầng chặn một kiểu thất bại khác nhau: middleware bị bỏ qua khi có route đăng ký sai thứ tự, validate ở biên không phủ được job nền và message queue, còn quyền tối thiểu ở DB chính là thứ giữ lại thiệt hại khi mọi tầng trên đã thủng. Như bài nhấn mạnh: đừng over-trust framework.

</details>
