---
sidebar_position: 4
title: "4. Web Security & Risk Management"
---

# Web Security & Risk Management

> *Câu hỏi security ở vòng Senior không hỏi định nghĩa CORS — hỏi em **đã từng bị bug security gì**, em **prevent** thế nào trên production, em đánh giá **risk** ra sao. Hỏi lý thuyết suông là dấu hiệu junior interviewer.*

---

## Câu 1: OWASP Top 10 — em quan tâm những gì cho FE? `[Senior]`

### Câu hỏi

> OWASP Top 10 — em không cần liệt kê hết. Cho anh 5 cái em thực sự xử lý hằng ngày trong FE.

### Giải thích lý thuyết

OWASP Top 10 chủ yếu BE-focused, nhưng FE đụng vào 5 cái thường xuyên:

| OWASP Item                        | FE trách nhiệm                                          |
| --------------------------------- | ------------------------------------------------------- |
| **A01: Broken Access Control**   | Route guard, hide UI, never trust client check         |
| **A03: Injection (XSS)**         | Escape user input, CSP, no `dangerouslySetInnerHTML`   |
| **A05: Security Misconfiguration**| Security headers, CORS, cookie attributes              |
| **A07: Identification & Auth**   | Cookie httpOnly/secure, token storage, MFA flow        |
| **A08: Software/Data Integrity** | Supply chain, SRI, dependency audit                    |

### Code minh hoạ

```typescript
// A01 — Broken Access Control: client check + server enforce
function AdminButton() {
  const { user } = useAuth();
  // UI hide — convenience, NOT security
  if (user.role !== "admin") return null;
  return <button onClick={deletePost}>Delete</button>;
}

// Server BẮT BUỘC re-check (client có thể bypass DevTools)
"use server";
async function deletePost(id: string) {
  const session = await auth();
  if (session.user.role !== "admin") {
    throw new Error("Forbidden"); // ← THIS is the real guard
  }
  await db.post.delete({ where: { id } });
}

// A03 — XSS protection
import DOMPurify from "isomorphic-dompurify";

function UserComment({ html }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "a", "p"],
    ALLOWED_ATTR: ["href"],
    ALLOWED_URI_REGEXP: /^https?:/,
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// A05 — Security headers (Next.js)
// next.config.js
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'nonce-X'" },
    ],
  }];
}

// A07 — Auth cookie
cookieStore.set("session", token, {
  httpOnly: true,    // không đọc qua JS
  secure: true,      // HTTPS only
  sameSite: "lax",   // CSRF mitigation
  maxAge: 60 * 60,
});

// A08 — Supply chain
// package.json
"scripts": {
  "audit": "pnpm audit --audit-level=moderate",
  "audit-fix": "pnpm audit --fix"
}
// CI fails nếu có high/critical vulnerability
```

### Đáp án mẫu

> "5 cái em đụng hằng ngày: **A01 — Broken Access Control**, em luôn nhớ client check chỉ là UX convenience, server BẮT BUỘC re-check; **A03 — XSS**, DOMPurify cho `dangerouslySetInnerHTML`, CSP header, escape URL trong href; **A05 — Security Misconfig**, security header set trong `next.config.js` (CSP, X-Frame, HSTS, Referrer-Policy); **A07 — Authentication**, cookie httpOnly + secure + sameSite, không lưu token localStorage; **A08 — Supply Chain**, pnpm audit trong CI, Dependabot, lock file commit. Em không học OWASP để recite — em học để biết khi review PR thì check gì."

---

## Câu 2: CSRF — em hiểu sâu thế nào? `[Senior]`

### Câu hỏi

> CSRF attack hoạt động ra sao? Tại sao `sameSite=lax` đã default mà vẫn cần CSRF token?

### Giải thích lý thuyết

**CSRF**: attacker dùng cookie của victim (browser auto-attach cookie cross-site) để gửi request thay user.

```
1. User login bank.com → cookie session
2. User vào evil.com
3. evil.com chứa form tự submit POST tới bank.com/transfer
4. Browser tự attach cookie session → bank.com nghĩ user submit
```

**SameSite=lax**: cookie chỉ gửi cross-site với **top-level navigation GET**, không gửi với POST/iframe/AJAX cross-site → block phần lớn CSRF.

**Vẫn cần CSRF token** khi:
- Cần `sameSite=none` (cross-domain app + API).
- Defense in depth (giả sử browser bug).
- Backward compat với browser cũ.
- Subdomain attack (`evil.bank.com` vẫn same-site với `bank.com`).

### Code minh hoạ

```typescript
// Double Submit Cookie pattern
"use server";
import { cookies } from "next/headers";

// Generate token khi user login
async function login(user) {
  const csrfToken = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set("csrf", csrfToken, {
    secure: true,
    sameSite: "lax",
    // KHÔNG httpOnly — client cần đọc để inject vào form
  });
}

// Client gửi token trong header
async function transfer(amount: number) {
  const csrf = getCookie("csrf"); // đọc từ document.cookie
  await fetch("/api/transfer", {
    method: "POST",
    headers: { "X-CSRF-Token": csrf },
    body: JSON.stringify({ amount }),
  });
}

// Server verify match
"use server";
async function transfer(amount: number) {
  const cookieStore = await cookies();
  const headerToken = headers().get("x-csrf-token");
  const cookieToken = cookieStore.get("csrf")?.value;

  if (!headerToken || headerToken !== cookieToken) {
    throw new Error("CSRF token mismatch");
  }

  await processTransfer(amount);
}

// Pattern thay thế: synchronizer token (token tạo per request)
// Hoặc dùng Next.js Server Action — đã built-in CSRF protection qua origin check
```

### Đáp án mẫu

> "CSRF là attacker dùng cookie victim để gửi request thay user — vì browser auto-attach cookie cross-site cho mọi request cùng domain. `sameSite=lax` mặc định block phần lớn case (POST cross-site không kèm cookie). Nhưng vẫn cần CSRF token với 3 lý do: thứ nhất, nếu app + API khác domain phải dùng `sameSite=none`; thứ hai, defense-in-depth (browser bug); thứ ba, **subdomain attack** — `evil.example.com` vẫn same-site với `bank.example.com`, sameSite không protect. Pattern em dùng: **Double Submit Cookie** — server set CSRF token trong cookie (không httpOnly), client gửi cùng token trong custom header, server verify match. Hoặc dùng Next.js Server Action — built-in origin check, không cần token thủ công."

---

## Câu 3: Authentication attacks — em prevent gì? `[Senior]`

### Câu hỏi

> Liệt kê 5 kiểu attack vào auth flow. Em mitigate mỗi cái như thế nào?

### Giải thích lý thuyết

| Attack                           | Cách hoạt động                                     | Mitigation                                    |
| -------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| **Brute force**                  | Try nhiều password                                | Rate limit, account lockout, CAPTCHA          |
| **Credential stuffing**          | Reuse leaked password từ breach khác             | MFA, breach check (haveibeenpwned)            |
| **Session hijack**               | Steal cookie/token                                 | httpOnly, secure, short TTL, refresh rotation |
| **Session fixation**             | Force user dùng session ID đã biết                | Regenerate session ID sau login               |
| **Phishing**                     | Giả site, lấy credential                         | Passkey/WebAuthn, password manager habit      |
| **Token replay**                 | Capture token, reuse                              | Short expiry, JTI claim, nonce                |
| **Account enumeration**          | Discover email tồn tại qua error message          | Generic error: "credentials invalid"          |
| **Magic link interception**      | Steal magic link từ email                         | Short TTL, single-use, IP/UA check            |

### Code minh hoạ

```typescript
// 1. Rate limit + account lockout
import { Ratelimit } from "@upstash/ratelimit";

const loginLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 lần / 15 phút per IP
});

const accountLimiter = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 lần / 1h per account
});

"use server";
async function login(email: string, password: string, ip: string) {
  const ipCheck = await loginLimiter.limit(ip);
  if (!ipCheck.success) throw new Error("Too many attempts. Try later.");

  const accountCheck = await accountLimiter.limit(`acc:${email}`);
  if (!accountCheck.success) throw new Error("Too many attempts. Try later.");

  const user = await db.user.findUnique({ where: { email } });

  // Generic error (account enumeration prevention)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("Invalid credentials"); // KHÔNG "user not found"
  }

  // Check leaked password
  const breached = await checkHaveIBeenPwned(password);
  if (breached) {
    await sendBreachAlert(user.email);
    throw new Error("Password compromised. Reset required.");
  }

  // Regenerate session ID (prevent fixation)
  await db.session.deleteMany({ where: { userId: user.id } });
  const sessionId = generateSecureToken();

  // ... set cookie
}

// 2. Refresh token rotation
"use server";
async function refresh(refreshToken: string) {
  const stored = await db.refreshToken.findUnique({
    where: { token: hash(refreshToken) },
    include: { user: true },
  });

  if (!stored) {
    // Token không tồn tại — có thể replay attack
    // Invalidate TẤT CẢ refresh token của user (paranoia)
    await db.refreshToken.deleteMany({ where: { userId: knownUserId } });
    throw new Error("Token invalid");
  }

  if (stored.usedAt) {
    // Token đã dùng rồi — token replay
    // Invalidate hết → force logout mọi device
    await db.refreshToken.deleteMany({ where: { userId: stored.userId } });
    await alertSecurityTeam(stored.userId, "Token replay detected");
    throw new Error("Token reuse detected");
  }

  // Mark dùng + tạo mới
  await db.refreshToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } });
  return generateNewTokens(stored.user);
}

// 3. MFA / Passkey với WebAuthn
async function registerPasskey() {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: new Uint8Array(/* from server */),
      rp: { name: "MyApp" },
      user: { id: userIdBytes, name: email, displayName: name },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: { userVerification: "required" },
    },
  });
  // Send credential.response.publicKey to server
}

// 4. Generic timing-safe error
import { timingSafeEqual } from "crypto";

function verifyToken(input: string, expected: string): boolean {
  if (input.length !== expected.length) {
    // Cũng phải làm operation tốn time tương đương để không leak qua timing
    timingSafeEqual(Buffer.from(input.padEnd(64)), Buffer.from(expected.padEnd(64)));
    return false;
  }
  return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}
```

### Đáp án mẫu

> "Em mitigate 5 nhóm. **Brute force**: Upstash rate limit sliding window — 5 attempt / 15 phút per IP + 10 / 1h per account. **Credential stuffing**: check password với HaveIBeenPwned API, force reset nếu breach. **Session hijack**: httpOnly + secure + short TTL access (15 phút) + refresh token rotation. **Token replay**: nếu refresh token bị dùng lại → invalidate TẤT CẢ token của user + alert security (vì có thể attacker đã steal token). **Account enumeration**: error message generic 'Invalid credentials' — không 'user not found' vs 'wrong password'. **Phishing** — em recommend Passkey/WebAuthn với touch ID/Face ID; phishing-resistant by design vì credential bind tới domain. **Session fixation**: regenerate session ID sau khi login. Tất cả đều log audit để forensic sau incident."

---

## Câu 4: Supply chain attack — em handle thế nào? `[Senior]`

### Câu hỏi

> Em đọc news một npm package phổ biến bị compromised, có code malicious. Em làm gì để protect dự án em?

### Giải thích lý thuyết

Supply chain attack: attacker compromise dependency của em (npm package, GitHub Action, CDN script) → inject malicious code vào build em.

Famous cases:
- `event-stream` (2018) — backdoor steal crypto wallet.
- `ua-parser-js` (2021) — coinminer + password stealer.
- `colors.js` / `faker.js` (2022) — maintainer protest.
- `polyfill.io` (2024) — domain bought, serve malware.

Mitigation layers:

1. **Lockfile** commit (pnpm-lock, package-lock).
2. **Audit** tự động (`pnpm audit`, Snyk, Socket.dev).
3. **Vendor selection** — prefer popular + maintained package.
4. **Minimum dependencies** — không install nếu có thể viết tay.
5. **SRI** (Subresource Integrity) cho CDN script.
6. **Version pinning** — không `^` cho critical dep.
7. **Sandboxing** — third-party script trong iframe.
8. **Build verification** — `npm ci` thay `npm install` ở CI.

### Code minh hoạ

```html
<!-- SRI cho CDN script -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>
<!-- Browser verify hash trước khi execute. Hash mismatch → block -->

<!-- Generate SRI hash -->
<!-- openssl dgst -sha384 -binary script.js | openssl base64 -A -->
```

```json
// package.json — pin critical deps
{
  "dependencies": {
    "next": "15.0.3",           // pinned (không có ^)
    "react": "19.0.0",           // pinned
    "@stripe/stripe-js": "^4.0.0" // ^ OK cho non-critical
  }
}
```

```yaml
# .github/workflows/security.yml
name: Security
on: [pull_request, schedule]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=moderate

  socket:
    # Socket.dev — detect suspicious package behavior
    runs-on: ubuntu-latest
    steps:
      - uses: SocketDev/socket-security@v1

  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: snyk/actions/node@master
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }} }

on:
  schedule:
    - cron: "0 9 * * 1" # weekly Monday 9am
```

```javascript
// .npmrc — disable post-install script cho package không trust
// Nhiều supply chain attack qua post-install script
ignore-scripts=true
// Sau đó manually allow per package em trust:
// pnpm install --include-scripts=esbuild,prisma
```

```typescript
// CSP block external script không whitelist
"Content-Security-Policy": `
  script-src 'self' 'nonce-${nonce}' https://js.stripe.com;
  connect-src 'self' https://api.stripe.com;
`
// Nếu attacker inject script qua npm package, script vẫn bị CSP block
// vì script được serve từ origin của em (self-hosted) → cần nonce
// Nếu attacker chỉ thêm fetch tới C2 server → CSP connect-src block
```

```javascript
// Detect suspicious behavior — monitor outgoing request
// Production: log mọi network request, alert nếu hit domain unknown
window.fetch = new Proxy(window.fetch, {
  apply(target, thisArg, args) {
    const url = args[0];
    const allowed = ["self", "api.example.com", "stripe.com"];
    if (!allowed.some(d => url.includes(d))) {
      sendAlert({ type: "suspicious_fetch", url });
    }
    return Reflect.apply(target, thisArg, args);
  },
});
```

### Đáp án mẫu

> "Em handle layered. **Layer 1 — Prevention**: lock file commit, `pnpm install --frozen-lockfile` ở CI; pin version critical (next, react, stripe-js) thay vì `^`; minimum dependency — không install nếu viết tay được 50 dòng. **Layer 2 — Detection**: pnpm audit weekly + Snyk + **Socket.dev** (Socket detect suspicious behavior, ví dụ package mới add network call tới domain lạ). **Layer 3 — Containment**: CSP với `nonce` chặn arbitrary script; `script-src` chỉ whitelist domain biết; `connect-src` chặn fetch tới domain unknown — kể cả attacker inject được script qua package, runtime cũng block. **Layer 4 — Sandboxing**: CDN script dùng SRI (`integrity` hash); third-party widget (chat, analytics) trong iframe sandbox. **Layer 5 — Detection runtime**: log mọi outgoing fetch tới domain ngoài whitelist, alert security. **Khi có news package compromised**: em check ngay `pnpm why <package>` xem có transitive dep không, rollback nếu có, audit log production check exfiltration."

---

## Câu 5: Subdomain takeover & DNS attacks `[Senior]`

### Câu hỏi

> Em nghe về 'subdomain takeover'. Đó là gì? Tại sao nguy hiểm? Em prevent thế nào?

### Giải thích lý thuyết

**Subdomain takeover**: subdomain trỏ CNAME tới service đã không còn (Heroku app deleted, S3 bucket xoá), attacker claim resource đó → control subdomain em.

Risk:
- Phish user qua subdomain "official" (`secure-login.yourcompany.com`).
- Cookie với `Domain=.yourcompany.com` bị steal (cookie scope tới subdomain).
- CORS origin trust subdomain → API bypass.
- OAuth redirect URI whitelist subdomain → token theft.

### Code minh hoạ

```bash
# Detect dangling CNAME
dig subdomain.example.com CNAME
# CNAME: my-app.herokuapp.com
curl -I https://my-app.herokuapp.com
# 404 — Heroku app không tồn tại nữa → vulnerable

# Tools
# - subjack, subzy, takeover (CLI tools)
# - dnsTwist (typosquatting detect)
```

```typescript
// Prevention 1: Cookie scope hẹp
cookieStore.set("session", token, {
  // ❌ Domain: ".example.com" — share mọi subdomain
  // ✅ KHÔNG set Domain — chỉ origin tạo cookie đọc được
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});

// Prevention 2: CORS strict
const ALLOWED_ORIGINS = [
  "https://example.com",
  "https://www.example.com",
  "https://app.example.com",
  // KHÔNG dùng pattern *.example.com
];

export function middleware(req) {
  const origin = req.headers.get("origin");
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }
}

// Prevention 3: OAuth redirect URI whitelist exact
// OAuth provider config:
// ❌ https://*.example.com/callback
// ✅ https://app.example.com/callback (exact)

// Prevention 4: CAA record DNS
// example.com.    IN CAA 0 issue "letsencrypt.org"
// → Chỉ Let's Encrypt được issue cert cho domain này
// Tránh attacker tự issue cert cho subdomain takeover

// Prevention 5: Subdomain inventory
// Maintain list subdomain → service, audit định kỳ
// Tools: chaos.projectdiscovery.io, securitytrails.com
```

```bash
# Audit định kỳ — script CI
#!/bin/bash
SUBDOMAINS=("api" "app" "www" "blog" "old-staging")
for sub in "${SUBDOMAINS[@]}"; do
  CNAME=$(dig +short ${sub}.example.com CNAME)
  if [ -n "$CNAME" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${CNAME%?}")
    if [ "$STATUS" = "404" ]; then
      echo "DANGER: ${sub}.example.com → ${CNAME} returns 404"
    fi
  fi
done
```

### Đáp án mẫu

> "Subdomain takeover xảy ra khi subdomain CNAME trỏ tới service đã không còn (Heroku app deleted, S3 bucket xoá), attacker claim service đó với cùng name → control subdomain em. Nguy hiểm vì: (1) phish user với URL trông official, (2) cookie scope `Domain=.example.com` bị steal nếu app set vậy, (3) CORS pattern `*.example.com` bị bypass, (4) OAuth redirect URI dạng wildcard subdomain bị steal token. **Prevention**: cookie KHÔNG set `Domain` (chỉ origin tạo cookie đọc), CORS whitelist exact origin không pattern, OAuth redirect URI exact, **CAA DNS record** để chỉ CA em chọn được issue cert. **Detection**: maintain subdomain inventory + script CI weekly check dangling CNAME (dig + curl 404). Tool: subjack, subzy. Khi audit thấy dangling — delete DNS record ngay, hoặc point về domain em control."

---

## Câu 6: File upload security `[Senior]`

### Câu hỏi

> User upload avatar lên app em. List risk + cách handle.

### Giải thích lý thuyết

Risk file upload:

1. **Stored XSS** — upload SVG có `<script>`, served as image.
2. **RCE** — upload `.php`, `.jsp` execute server.
3. **Path traversal** — filename `../../etc/passwd`.
4. **Storage exhaustion** — upload nhiều file lớn.
5. **Malware distribution** — host malware.
6. **Image bomb** — file PNG 100KB nhưng decompress 10GB (zip bomb cho image).
7. **EXIF metadata leak** — GPS, device info.
8. **MIME confusion** — file `.jpg` thực ra là HTML.

### Code minh hoạ

```typescript
"use server";
import sharp from "sharp";
import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSIONS = { width: 4000, height: 4000 };

async function uploadAvatar(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("avatar") as File;

  // 1. Size limit
  if (file.size > MAX_SIZE) {
    throw new Error("File too large (max 5MB)");
  }

  // 2. MIME type check — KHÔNG trust file.type (client set được)
  const buffer = Buffer.from(await file.arrayBuffer());

  // Check magic bytes (file signature)
  const detectedType = await detectFileType(buffer);
  if (!ALLOWED_MIME.includes(detectedType)) {
    throw new Error("Invalid file type");
  }

  // 3. Process + re-encode (strip metadata, prevent image bomb)
  let processed: Buffer;
  try {
    processed = await sharp(buffer, { failOn: "warning" })
      .resize(512, 512, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer({ resolveWithObject: true })
      .then(r => {
        // Image bomb check
        if (r.info.size > 1024 * 1024) throw new Error("Suspicious file size");
        return r.data;
      });
  } catch (e) {
    throw new Error("Invalid or corrupted image");
  }

  // 4. Generate safe filename (không trust user filename)
  const ext = "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;

  // 5. Upload to separate domain / bucket (no cookie scope)
  await s3.putObject({
    Bucket: "user-uploads",        // separate bucket, không phải app bucket
    Key: `avatars/${filename}`,
    Body: processed,
    ContentType: "image/jpeg",
    ContentDisposition: "inline",
    CacheControl: "public, max-age=31536000, immutable",
  });

  // 6. Serve qua subdomain riêng (no cookie scope sang)
  // https://cdn.example.com/avatars/...
  // KHÔNG https://example.com/avatars/... (same origin với app)
  const url = `https://cdn.example.com/avatars/${filename}`;

  await db.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: url },
  });
}

// Magic bytes detection
async function detectFileType(buffer: Buffer): Promise<string> {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  // WebP: RIFF ... WEBP
  if (buffer.slice(8, 12).toString() === "WEBP") return "image/webp";
  return "unknown";
}

// Hoặc dùng lib `file-type`
import { fileTypeFromBuffer } from "file-type";
const type = await fileTypeFromBuffer(buffer);

// SVG đặc biệt — nếu cần allow SVG, sanitize XML
import DOMPurify from "isomorphic-dompurify";
function sanitizeSVG(svgContent: string): string {
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject"],
    FORBID_ATTR: ["onload", "onerror", "onclick"],
  });
}
```

```typescript
// CDN/Bucket headers prevent execution
// S3 bucket policy
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::user-uploads/*",
  "Condition": {
    "StringEquals": {
      "s3:ResponseContentType": ["image/jpeg", "image/png"]
    }
  }
}

// Force content-disposition: attachment cho file unknown type
// Force x-content-type-options: nosniff
// Force CSP: default-src 'none' trên CDN domain
```

### Đáp án mẫu

> "Em handle 8 risk. **Size limit** + **MIME type check qua magic bytes** (KHÔNG trust `file.type` client). **Re-encode** qua Sharp — strip EXIF metadata, prevent image bomb (Sharp throw nếu file decompress vượt threshold). **Filename**: dùng `crypto.randomUUID()` không trust user filename → prevent path traversal. **Storage tách biệt**: upload S3 bucket riêng, serve qua **subdomain CDN** (`cdn.example.com`) — không cùng origin với app, cookie không scope sang → kể cả XSS qua SVG cũng không steal session. **Headers CDN**: `X-Content-Type-Options: nosniff`, `Content-Disposition: inline`, force content-type. **SVG đặc biệt** — em block SVG hoặc sanitize XML với DOMPurify (forbid script tag, event handler). **Virus scan** với ClamAV cho file user-facing (download). Em cũng **không** serve avatar từ unpredictable URL — predictable URL `cdn.example.com/u/<userId>.jpg` để delete cũng dễ."

---

## Câu 7: Risk Assessment — em đánh giá thế nào? `[Senior]`

### Câu hỏi

> Em discover security bug trong code. Em báo ngay hay điều tra trước? Em quyết định severity thế nào?

### Giải thích lý thuyết

Framework đánh giá risk:

**CVSS** (Common Vulnerability Scoring System) — tiêu chuẩn industry:

| Metric              | Câu hỏi                                                   |
| ------------------- | --------------------------------------------------------- |
| Attack Vector       | Local / Adjacent / Network                                |
| Attack Complexity   | Low / High                                                |
| Privileges Required | None / Low / High                                         |
| User Interaction    | None / Required                                           |
| Scope               | Unchanged / Changed                                       |
| Confidentiality     | None / Low / High impact                                  |
| Integrity           | None / Low / High impact                                  |
| Availability        | None / Low / High impact                                  |

Score 0-10:
- **Critical** (9.0-10.0) — patch ngay, có thể disable feature.
- **High** (7.0-8.9) — patch trong 7 ngày.
- **Medium** (4.0-6.9) — patch trong 30 ngày.
- **Low** (0.1-3.9) — backlog, fix khi convenient.

### Code minh hoạ

```typescript
// Example risk assessment process
interface SecurityFinding {
  title: string;
  description: string;
  reproduction: string[];

  // CVSS factors
  attackVector: "network" | "adjacent" | "local" | "physical";
  attackComplexity: "low" | "high";
  privilegesRequired: "none" | "low" | "high";
  userInteraction: "none" | "required";
  confidentialityImpact: "none" | "low" | "high";
  integrityImpact: "none" | "low" | "high";
  availabilityImpact: "none" | "low" | "high";

  // Business context
  affectedUsers: number;
  dataExposed: string[];
  exploitability: "theoretical" | "known-poc" | "active-exploit";

  // Mitigation
  immediateAction: string;
  longTermFix: string;
  estimatedFixTime: string;
}

// Example: cookie missing httpOnly
const finding: SecurityFinding = {
  title: "Session cookie missing httpOnly flag",
  description: "Cookie 'session' không có httpOnly → XSS có thể đọc",
  reproduction: [
    "1. Login bình thường",
    "2. document.cookie console → thấy session token",
  ],
  attackVector: "network",          // qua web
  attackComplexity: "high",          // cần XSS chain
  privilegesRequired: "none",
  userInteraction: "required",       // user click malicious link
  confidentialityImpact: "high",     // session hijack
  integrityImpact: "high",
  availabilityImpact: "none",
  affectedUsers: 50_000,
  dataExposed: ["session-token", "user-data"],
  exploitability: "theoretical",     // chưa có active XSS
  immediateAction: "Add httpOnly flag",
  longTermFix: "Audit tất cả cookie attributes",
  estimatedFixTime: "1 hour fix + 1 day rollout",
};

// → CVSS ~7.5 (High) — patch trong 7 ngày
```

```typescript
// Triage process em dùng
async function triageSecurityFinding(finding: SecurityFinding) {
  // 1. Reproduce — confirm không phải false positive
  await verifyReproduction(finding);

  // 2. Score CVSS
  const score = calculateCVSS(finding);

  // 3. Determine response timeline
  if (score >= 9.0) {
    // CRITICAL — incident response immediately
    await pageOncall();
    await convene_war_room();
    await considerDisableFeature();
  } else if (score >= 7.0) {
    // HIGH — patch trong 7 ngày
    await createPriorityTicket();
    await notifySecurityTeam();
  } else {
    // MEDIUM/LOW — normal backlog
    await createBacklogTicket();
  }

  // 4. Check if already exploited
  await searchLogs(finding.indicators); // IoC search

  // 5. Document
  await writeFinding({ ...finding, score });
}
```

### Đáp án mẫu

> "Em **không** panic broadcast — em **triage first**. Quy trình: thứ nhất, **reproduce** confirm không false positive. Thứ hai, **score CVSS** — đánh giá attack vector, complexity, privilege required, user interaction, impact CIA (confidentiality/integrity/availability). Thứ ba, **business context** — bao nhiêu user affected, data nào expose, có active exploit không. Threshold response: Critical (9.0+) page oncall + war room + có thể disable feature; High (7.0+) patch 7 ngày; Medium (4.0+) 30 ngày. Thứ tư, **search logs** — check indicators of compromise xem bug đã bị exploit chưa. Thứ năm, **document**. Quan trọng: em report theo channel đúng (security@ email, security Slack channel private) — KHÔNG public Slack/Github issue trước khi patch. **Responsible disclosure** với external researcher: acknowledge trong 24h, fix timeline, credit họ public sau patch. Em từng triage finding — initial paranoid score 9.0, sau khi reproduce kỹ realize cần XSS chain với multiple precondition → downgrade 6.5. Cẩn thận về **inflated severity** — gây false alarm, future report bị ignore."

---

## Câu 8: Production incident response `[Senior]`

### Câu hỏi

> 3 giờ sáng em được page: app bị attack, data đang leak. Em làm gì 30 phút đầu?

### Giải thích lý thuyết

**Incident Response framework** (NIST):

1. **Preparation** — runbook, oncall rotation, comm channel sẵn.
2. **Detection & Analysis** — confirm incident, scope.
3. **Containment** — stop bleeding (short-term + long-term).
4. **Eradication** — remove root cause.
5. **Recovery** — restore service.
6. **Lessons Learned** — postmortem.

30 phút đầu = Detection + Containment.

### Code minh hoạ

```typescript
// Runbook — incident response checklist

// PHASE 1: Detect & Triage (0-10 phút)
interface IncidentTriage {
  whatIsHappening: string;
  howKnow: string;
  whenStarted: Date;
  whoAffected: string;
  currentlyOngoing: boolean;
}

// Check alerts:
// - Sentry: spike error
// - Datadog: anomaly traffic, latency
// - Cloudflare: DDoS, attack
// - Database: query log unusual

// Quick assessment:
// - Bleeding? Yes → containment NOW
// - Internal? External attacker?
// - Data leak? Service down?

// PHASE 2: Communicate (5-10 phút)
async function declareIncident(severity: "sev0" | "sev1" | "sev2") {
  // Open incident channel
  await slack.createChannel(`#incident-${Date.now()}`);

  // Page IC (Incident Commander)
  if (severity === "sev0") await pagerDuty.page(["engineering-lead", "security-lead", "cto"]);

  // Status page
  await statusPage.update("investigating");

  // Comm template:
  /*
   ## Incident — [TIME]
   - Status: Investigating
   - IC: @name
   - Impact: [users affected]
   - Updates: every 15 minutes
   */
}

// PHASE 3: Contain (10-30 phút)
async function containDataLeak() {
  // Stop bleeding
  if (suspectedEndpoint) {
    await deployFeatureFlag(suspectedEndpoint, false); // disable endpoint
  }

  if (suspectedAttacker) {
    await firewall.blockIp(attackerIPs);
    await db.session.deleteMany({ where: { ip: { in: attackerIPs } } });
  }

  // If exfiltration ongoing, drastic:
  // - Disable affected service
  // - Force logout all users
  // - Rotate compromised credentials
  await rotateSecrets(["database-password", "api-key", "jwt-signing-key"]);

  // Preserve evidence
  await snapshot.create("forensics-" + Date.now());
  await logs.export("incident-window", "s3://forensics-bucket/");

  // Notify legal IF data breach (GDPR: 72h notification)
  if (personalDataAffected) {
    await notify.legal();
    await notify.dpoEmail();
  }
}

// Logging em check
const incidentChecklist = [
  // Auth
  "Auth logs — unusual login locations, time",
  "Failed login spike",
  "Account locked count",
  "MFA bypass attempts",

  // Network
  "Egress traffic spike (data exfiltration)",
  "Unusual API endpoint hit",
  "Geographic anomaly",
  "User-agent unusual",

  // Database
  "Slow query log — possible injection",
  "Connection count spike",
  "Bulk export queries",

  // Application
  "Error rate spike",
  "Specific endpoint anomaly",
  "Permissions denied logs",
];

// Communication template trong channel
/*
 [TIME] Alert received: spike in failed auth from IP 1.2.3.4
 [TIME+2m] Confirmed: ~5000 attempts in 2 minutes
 [TIME+5m] IC declared, severity sev1
 [TIME+7m] Blocking IP at firewall
 [TIME+10m] Block confirmed, spike stopped
 [TIME+12m] Investigating if any account compromised
 [TIME+15m] No successful logins from IP, likely bot
 [TIME+20m] Rate limit hardened: 10/min → 3/min per IP
 [TIME+25m] Updating status page: resolved
 [TIME+30m] Schedule postmortem T+24h
*/
```

### Đáp án mẫu

> "30 phút đầu em chia 3 phase. **0-10 phút — Triage**: confirm không phải false alarm. Check Sentry, Datadog, Cloudflare. 4 câu hỏi: 'cái gì xảy ra', 'làm sao biết', 'bắt đầu khi nào', 'ai affected'. Critical: 'còn đang bleeding không?' — nếu có thì containment trước, investigate sau. **10-15 phút — Communicate**: declare incident severity (sev0/1/2), open Slack channel `#incident-X`, page IC + security lead + CTO (nếu sev0), update status page 'investigating'. Comm cadence 15 phút, không silent. **15-30 phút — Contain**: stop bleeding cụ thể. Nếu endpoint bị attack — feature flag disable. Nếu IP attacker — Cloudflare block. Nếu data leak ongoing — disable affected service, force logout all user, rotate secrets (DB password, API key, JWT signing key). **Preserve evidence**: snapshot DB, export logs sang forensics bucket — KHÔNG delete để postmortem điều tra sau. **Notify legal** nếu personal data affected (GDPR 72h notification window). Em **KHÔNG** investigate root cause sâu trong 30 phút đầu — đó là sau khi bleeding dừng. Em **KHÔNG** patch ad-hoc trong panic — risk introduce bug mới. Mantra: 'Triage → Communicate → Contain'. Root cause + permanent fix là day 2."

---

## Câu 9: Session vs JWT vs OAuth2 vs OIDC -- chọn cái nào? `[Senior]`

### Câu hỏi

> App em có web + mobile + 3rd party integration. Em chọn auth scheme nào, vì sao?

### Giải thích lý thuyết

| Scheme            | Token type            | Server state | Best for                                    |
| ----------------- | --------------------- | ------------ | ------------------------------------------- |
| **Session**       | Opaque session ID     | Có (DB/Redis)| Monolith web, single domain                 |
| **JWT**           | Self-contained signed | Không        | API stateless, microservice, mobile         |
| **OAuth2**        | Access + refresh      | Phụ thuộc    | Delegated access (3rd party)                |
| **OIDC**          | OAuth2 + ID token     | Phụ thuộc    | Authentication + delegated (social login)   |

**Hiểu nhầm thường gặp:**

- **OAuth2 KHÔNG phải authentication** -- là **authorization** (cấp quyền). OIDC ngồi trên OAuth2 để add authentication (ID token).
- **JWT KHÔNG tự động an toàn** -- nếu lưu localStorage = XSS đọc được. JWT chỉ là format, security phụ thuộc cách dùng.
- **Session không "lỗi thời"** -- vẫn là cách an toàn nhất cho web monolith.

### Code minh hoạ

```typescript
// 1. SESSION -- Next.js + Redis
// Login
const sessionId = crypto.randomUUID();
await redis.set(`session:${sessionId}`, JSON.stringify({ userId }), "EX", 3600);
cookieStore.set("session", sessionId, {
  httpOnly: true, secure: true, sameSite: "lax",
});

// Verify (middleware)
const sessionId = cookieStore.get("session")?.value;
const data = await redis.get(`session:${sessionId}`);
if (!data) throw new Error("Unauthorized");

// Logout -- revoke ngay
await redis.del(`session:${sessionId}`);

// 2. JWT -- API stateless
import { SignJWT, jwtVerify } from "jose";

const token = await new SignJWT({ userId, role })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("15m")    // ngắn vì không revoke được
  .setJti(crypto.randomUUID())  // JTI cho replay protection
  .sign(secret);

const { payload } = await jwtVerify(token, secret);

// 3. OAuth2 + PKCE (mobile/SPA)
// PKCE = Proof Key for Code Exchange — chống intercept code
const verifier = generateRandomString();         // client giữ
const challenge = base64url(sha256(verifier));   // gửi auth server

// Step 1: redirect
window.location = `https://auth.com/authorize?client_id=X&code_challenge=${challenge}&code_challenge_method=S256`;

// Step 2: callback có ?code=
const { access_token } = await fetch("https://auth.com/token", {
  method: "POST",
  body: JSON.stringify({ code, code_verifier: verifier }),
});

// 4. OIDC (Auth0, Clerk, Cognito)
// ID token = JWT chứa user info (sub, email, name)
// Access token = dùng gọi API
// Refresh token = lấy access token mới
```

### Đáp án mẫu

> "Em quyết theo 3 trục: **stateful vs stateless**, **first-party vs 3rd-party**, **revocation requirement**. App có web monolith chính + mobile + 3rd party integration: em chọn **session cho web (httpOnly cookie)** vì revoke instant + an toàn nhất, **JWT short-lived (15 phút) + refresh token rotation cho mobile/API** vì stateless scale tốt, **OIDC với provider như Clerk/Auth0 cho social login** -- không tự host. JWT em **không** lưu localStorage -- access token in memory, refresh token httpOnly cookie. Em **KHÔNG** dùng JWT cho session web -- không revoke được, attacker steal token = 15 phút free access tới khi expire. Trade-off em chấp nhận: session cần Redis (state) nhưng có thể logout-everywhere, revoke instant khi user bị compromise."

---

## Câu 10: Token storage -- httpOnly cookie vs localStorage vs memory? `[Senior]`

### Câu hỏi

> JWT access token lưu ở đâu? localStorage, sessionStorage, cookie, hay memory? Em defend choice với 3 attack vector.

### Giải thích lý thuyết

| Storage         | XSS đọc được? | CSRF risk? | Persist? | Cross-tab? |
| --------------- | ------------- | ---------- | -------- | ---------- |
| **localStorage**| ✅ Có          | ❌ Không   | ✅ Có    | ✅ Có      |
| **sessionStorage**| ✅ Có        | ❌ Không   | ❌ Tab close| ❌ Không|
| **httpOnly cookie**| ❌ Không   | ⚠️ Có (cần CSRF protect)| ✅ Có | ✅ Có |
| **Memory (JS var)**| ❌ Không   | ❌ Không   | ❌ Refresh mất| ❌ Không|

**XSS > CSRF** về độ nguy hiểm: XSS = attacker chạy code trong browser victim, đọc mọi thứ. CSRF chỉ trigger được request có sẵn.

### Code minh hoạ

```typescript
// ❌ ANTI-PATTERN: token in localStorage
localStorage.setItem("accessToken", jwt);  // XSS đọc được toàn bộ tài khoản
const token = localStorage.getItem("accessToken");

// ✅ PATTERN khuyến nghị 2024+: Token rotation pattern
// - Access token: SHORT-LIVED (15m), in memory
// - Refresh token: LONG-LIVED (7d), httpOnly cookie + sameSite=strict

// Server response sau login
res.cookies.set("refreshToken", refreshJwt, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/api/auth/refresh",  // chỉ gửi tới refresh endpoint
  maxAge: 60 * 60 * 24 * 7,
});
res.json({ accessToken });  // client cầm in memory

// Client cầm in memory
let accessToken: string | null = null;

async function fetchWithAuth(url: string) {
  try {
    return await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    if (e.status === 401) {
      // Auto refresh
      const { accessToken: newToken } = await fetch("/api/auth/refresh", {
        credentials: "include",  // gửi httpOnly cookie
      }).then(r => r.json());
      accessToken = newToken;
      return fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  }
}

// Reload page → accessToken null → call /refresh → silent re-auth
// XSS: không đọc được accessToken (memory) hay refreshToken (httpOnly)
```

### Đáp án mẫu

> "Em **KHÔNG bao giờ** lưu access token vào localStorage hay sessionStorage -- XSS đọc được. Pattern em dùng: **access token short-lived (15 phút) in memory**, **refresh token long-lived (7 ngày) httpOnly cookie + sameSite=strict + path=/api/auth/refresh**. Reload page = access token mất → call `/refresh` silent → cookie tự gửi (httpOnly) → server trả access token mới. Defend 3 vector: **XSS** không đọc được vì memory + httpOnly; **CSRF** mitigated với sameSite=strict cộng path scope cookie chỉ gửi tới refresh endpoint; **Token replay** với refresh rotation -- mỗi lần refresh issue refresh token mới, invalidate cũ, nếu dùng lại refresh token cũ = signal compromise → revoke toàn user. Trade-off: 15 phút expire user có thể phải re-login nếu offline lâu -- em accept vì security > convenience. Khi user logout: clear access token memory + call API revoke refresh token server-side, server delete cookie."

---

## Câu 11: Refresh Token Rotation -- flow đúng `[Senior]`

### Câu hỏi

> Refresh token bị steal -- attacker dùng để lấy access token vô hạn. Em design flow để detect + mitigate?

### Giải thích lý thuyết

**Refresh Token Rotation** = mỗi lần refresh, **issue token mới + invalidate token cũ**. Nếu token cũ bị dùng lại = signal compromise.

```
User              Server
 │                  │
 │── refresh(RT1) ─→│  RT1 valid, mark used
 │←─ AT2, RT2 ─────│  Issue new pair
 │                  │
 (attacker steal RT1, cố dùng lại)
 │                  │
 │── refresh(RT1) ─→│  RT1 already used!
 │←─ 401 + alert ──│  Revoke entire family (all RTs of user)
```

**Reuse Detection** = bảo vệ mạnh nhất với refresh token.

### Code minh hoạ

```typescript
// Schema: track refresh token family
type RefreshToken = {
  id: string;
  userId: string;
  familyId: string;     // mọi token cùng family share root
  parentId: string | null;
  createdAt: Date;
  usedAt: Date | null;
  expiresAt: Date;
  revoked: boolean;
};

// Login → tạo family mới
async function login(userId: string) {
  const familyId = crypto.randomUUID();
  const refreshToken = await issueRefreshToken({
    userId,
    familyId,
    parentId: null,
  });
  return { accessToken: issueAccess(userId), refreshToken };
}

// Refresh endpoint
async function refresh(rtPlain: string) {
  const rt = await db.refreshToken.findUnique({
    where: { id: hashToken(rtPlain) },
  });

  if (!rt) {
    throw new Error("Invalid token");
  }

  // CRITICAL: detect reuse
  if (rt.usedAt) {
    // Token đã được dùng → reuse attempt → compromise!
    await db.refreshToken.updateMany({
      where: { familyId: rt.familyId },
      data: { revoked: true },
    });
    await logSecurityEvent("RT_REUSE_DETECTED", { userId: rt.userId });
    await sendUserAlert(rt.userId, "Suspicious login detected");
    throw new Error("Token reuse detected, all sessions revoked");
  }

  if (rt.revoked || rt.expiresAt < new Date()) {
    throw new Error("Token expired/revoked");
  }

  // Mark used + issue new token cùng family
  await db.refreshToken.update({
    where: { id: rt.id },
    data: { usedAt: new Date() },
  });

  const newRT = await issueRefreshToken({
    userId: rt.userId,
    familyId: rt.familyId,
    parentId: rt.id,
  });

  return {
    accessToken: issueAccess(rt.userId),
    refreshToken: newRT,
  };
}

// Auto cleanup expired tokens (cron)
async function cleanupTokens() {
  await db.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ],
    },
  });
}
```

### Đáp án mẫu

> "Em design **rotation + reuse detection**. Mỗi refresh token có **family ID** -- mọi token issue từ chain refresh chung family. Khi refresh: mark token cũ `used`, issue token mới cùng family. **Critical logic**: nếu token đã `used` được dùng lại = ai đó stole token, đã dùng (legitimate user hoặc attacker) + giờ token kia đang dùng → **revoke toàn family** (đá hết session của user đó) + alert security + force re-login. User có thể không tiện 1 lần nhưng attacker bị đá ngay. Em set TTL refresh token 7 ngày, access token 15 phút. Database store **hash** của refresh token, không plain (giống password). Có cron cleanup expired. Khi user logout: revoke family hiện tại, không revoke family khác (user có thể dùng nhiều device). Trade-off: cần state DB cho refresh token -- em accept vì security với JWT pure không revoke được."

---

## Câu 12: Passkey / WebAuthn -- thay password? `[Senior]`

### Câu hỏi

> Passkey đang được Apple, Google, Microsoft push. Em implement thế nào? Trade-off vs password truyền thống?

### Giải thích lý thuyết

**WebAuthn / FIDO2** = authentication không password, dùng **public key cryptography**:

- User device generate keypair (private giữ secure enclave/TPM, public gửi server)
- Login: server send challenge → device sign với private key → server verify với public key
- **Phishing-resistant**: credential bind tới origin domain → attacker không clone được
- **No password to steal** -- DB breach không leak password
- **Biometric (Face ID, Touch ID, Windows Hello)** unlock private key locally

| Aspect              | Password              | Passkey                       |
| ------------------- | --------------------- | ----------------------------- |
| Phishing resistant  | ❌ (user gõ vào fake) | ✅ (origin-bound)             |
| DB breach impact    | ⚠️ (hash crack)       | ✅ (chỉ public key, vô hại)   |
| User UX             | Type password         | Touch ID / Face ID            |
| Cross-device sync   | Manual                | iCloud Keychain, Google PM    |
| Account recovery    | Email reset           | Phức tạp (need backup)        |

### Code minh hoạ

```typescript
// Server-side với SimpleWebAuthn library
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

// 1. REGISTRATION
// Server: generate challenge
async function getRegisterOptions(userId: string) {
  const options = await generateRegistrationOptions({
    rpName: "MyApp",
    rpID: "myapp.com",
    userID: userId,
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",         // tạo discoverable credential
      userVerification: "required",    // bắt buộc biometric/PIN
      authenticatorAttachment: "platform", // device built-in
    },
  });

  // Lưu challenge tạm (Redis 5 phút)
  await redis.set(`webauthn:${userId}`, options.challenge, "EX", 300);
  return options;
}

// Client: gọi browser API
const options = await fetch("/webauthn/register").then(r => r.json());
const credential = await navigator.credentials.create({ publicKey: options });
await fetch("/webauthn/register/verify", {
  method: "POST",
  body: JSON.stringify(credential),
});

// Server: verify response
async function verifyRegister(userId: string, response: any) {
  const challenge = await redis.get(`webauthn:${userId}`);
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: "https://myapp.com",
    expectedRPID: "myapp.com",
  });

  if (verification.verified) {
    await db.credential.create({
      data: {
        userId,
        credentialID: verification.registrationInfo.credentialID,
        publicKey: verification.registrationInfo.credentialPublicKey,
        counter: verification.registrationInfo.counter,
      },
    });
  }
}

// 2. AUTHENTICATION (giống nhưng dùng credentials.get + verifyAuthentication)
// 3. RECOVERY: backup codes hoặc passkey trên nhiều device
```

### Đáp án mẫu

> "Passkey em implement với library SimpleWebAuthn cho Node hoặc native browser API + Cloudflare/AWS service. Flow: **register** -- server generate challenge, browser gọi `navigator.credentials.create()` → device tạo keypair, private trong secure enclave, public gửi server lưu DB; **login** -- challenge → device sign → server verify với public key. **Trade-off vs password**: thắng về phishing (origin-bound, attacker clone domain không sign được), DB breach không nguy hiểm (chỉ public key), UX nhanh (Touch ID 1 chạm). Thua về: **account recovery phức tạp** (mất device = mất account, cần backup codes hoặc passkey trên nhiều device, hoặc fallback email magic link); **cross-platform sync** còn vendor lock-in (iCloud Keychain trong Apple, Google PM trong Chrome -- chưa interop hoàn toàn); **enterprise** cần security key (YubiKey) hoặc fallback OTP. Em implement passkey **bổ sung** password trong giai đoạn chuyển tiếp 1-2 năm: user có thể chọn, force passkey cho admin/sensitive role, password cho mass user. Đo adoption rate, sau 1 năm có thể deprecate password. **Trick implementation**: `userVerification: 'required'` để force biometric, không cho fallback nhập text -- nếu không attacker steal device thông thường vẫn login."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Client check là đủ vì user thường không bypass"       | Mọi check client là UX, server BẮT BUỘC re-check                     |
| "HTTPS đủ secure, không cần header khác"               | HSTS, CSP, X-Frame, COOP layer khác nhau                             |
| "JWT trong localStorage cho tiện"                      | XSS đọc được; httpOnly cookie                                        |
| "npm package phổ biến luôn safe"                       | Supply chain attack target chính là package phổ biến (event-stream) |
| "Báo bug security ngay public github issue"            | Responsible disclosure qua channel private                           |
| "Severity cao = critical, lên TV news"                 | CVSS có scale; inflated severity gây cry wolf                        |
| "Trong incident, debug code đầu tiên"                  | Triage → Communicate → Contain trước. Root cause sau                |
| "OAuth2 là authentication"                             | OAuth2 = authorization. OIDC mới là authentication                   |
| "JWT lưu localStorage tiện hơn"                        | XSS đọc được. Memory + httpOnly refresh cookie                       |
| "JWT không revoke được nên dùng session"               | Hybrid: short-lived JWT (15m) + refresh rotation                     |
| "Passkey replace password ngay"                        | Cần fallback 1-2 năm chuyển tiếp + recovery flow                     |
