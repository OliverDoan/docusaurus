---
sidebar_position: 1
title: "1. Hashing và Network Security"
---

# Hashing và Network Security

Bài này nói về hai mảng nền tảng giúp giữ an toàn cho hệ thống backend: hashing (cách biến mật khẩu và dữ liệu thành chuỗi không thể đảo ngược) và bảo mật tầng mạng (HTTPS/TLS, CORS, CSP). Hiểu rõ những thứ này giúp bạn lưu mật khẩu an toàn, mã hóa đường truyền giữa client và server, và chặn các kiểu tấn công phổ biến trên web. Đây là kiến thức bắt buộc trước khi đưa bất kỳ ứng dụng nào lên môi trường thật.

---

:::note[Ghi nhớ nhanh]

- ⭐ **KHÔNG lưu password plaintext** — hash bằng slow function `Argon2id` hoặc `bcrypt` (cost 12+), tránh MD5/SHA (quá nhanh, dễ brute force).
- **`bcrypt`/`Argon2` tự sinh salt** lưu trong hash; có thể thêm `pepper` (secret ngoài DB); verify phải constant-time.
- **General hash** (`SHA-256`, Blake2/3) chỉ dùng cho checksum/HMAC/fingerprint, **KHÔNG** cho password.
- ⭐ **`HTTPS/TLS` bắt buộc ở production** — Let's Encrypt miễn phí, thêm `HSTS`, tối thiểu TLS 1.2 (prefer 1.3).
- **`CORS` chỉ browser enforce** (whitelist origin, không `*` khi có credentials); **`CSP`** chặn XSS (dùng nonce cho inline script).

:::

---

## Mục lục

- [Hashing là gì?](#hashing-là-gì)
- [Password hashing](#password-hashing)
- [General hashing (MD5, SHA)](#general-hashing-md5-sha)
- [HTTPS / TLS](#https--tls)
- [CORS](#cors)
- [CSP](#csp)

---

## Hashing là gì?

**Hash function** — biến input → string độ dài cố định, **không thể đảo ngược**.

Đặc tính:

1. **Deterministic** — cùng input → cùng output.
2. **Fast** (đa số) hoặc **slow on purpose** (password hash).
3. **One-way** — không decode được.
4. **Avalanche effect** — đổi 1 bit input → output thay đổi hoàn toàn.
5. **Collision-resistant** — khó tìm 2 input cùng hash.

```
"hello" → SHA256 → 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
"helo"  → SHA256 → b3a8e0e1f9ab1bfe3a36f231f676f78bb30a519d2b21e6c530c0eee8ebb4a5d0
```

---

## Password hashing

**KHÔNG bao giờ** lưu password plaintext. Luôn hash với **slow function**.

| Algorithm | Khuyến nghị? | Note |
|-----------|--------------|------|
| **Argon2id** | **Có** (best 2026) | Winner Password Hashing Competition |
| **bcrypt** | **Có** | Battle-tested 25+ năm |
| **scrypt** | Có | Memory-hard, ít phổ biến |
| **PBKDF2** | Acceptable | NIST standard, fallback |
| **MD5, SHA-256** | **KHÔNG** | Quá nhanh, dễ brute force |

**bcrypt** (phổ biến nhất):

```ts
import bcrypt from "bcrypt";

// Hash khi đăng ký
const password = "user-password";
const saltRounds = 12;  // 2^12 iterations
const hashed = await bcrypt.hash(password, saltRounds);
// $2b$12$abcdefghijklmnopqrstuv...

// Verify khi login
const valid = await bcrypt.compare(password, hashed);
```

**Argon2id** (modern, recommended):

```ts
import argon2 from "argon2";

const hashed = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,  // 19 MB
  timeCost: 2,
  parallelism: 1,
});

const valid = await argon2.verify(hashed, password);
```

:::info[Phân tích]

**Tại sao password hash phải slow?**

Attacker steal DB → brute force offline:

- **MD5/SHA**: ~5 tỷ hash/second trên GPU → 8-char password vài giờ.
- **bcrypt cost 12**: ~5 hash/second → 8-char password hàng nghìn năm.

Slow hash = vô hiệu hóa brute force. Trade-off: login chậm vài trăm ms
(acceptable).

**Cost tuning**:

- bcrypt: 12 rounds (2025+ standard). 10 cho legacy.
- Argon2: memoryCost 19MB, timeCost 2.

Mỗi 2-3 năm, tăng cost theo Moore's law. Khi user login, có thể
**re-hash with higher cost** transparent.

**Salt** — bcrypt và Argon2 **tự generate salt** lưu vào hash string.
Không phải lưu salt riêng. Salt khác nhau mỗi user → rainbow table
không work.

:::

:::warning[Cần lưu ý]

**Pitfall**:

**1. Đừng nhồi salt thủ công**:

```ts
// SAI — bcrypt đã có salt built-in
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);

// Đúng — pass cost number, bcrypt tự salt
const hash = await bcrypt.hash(password, 12);
```

**2. Pepper** — secret ngoài DB, optional:

```ts
const peppered = password + process.env.PEPPER;
const hash = await bcrypt.hash(peppered, 12);
```

Pepper trong env, không trong DB → attacker steal DB chưa đủ.

**3. Constant-time compare**:

```ts
// SAI — early return có thể leak qua timing
if (input === stored) { ... }

// ĐÚNG — bcrypt.compare là constant-time
await bcrypt.compare(input, stored);
```

Timing attack đo response time để guess char-by-char. Mọi password
verify phải constant-time.

:::

---

## General hashing (MD5, SHA)

**Không dùng cho password**, dùng cho:

- **Checksum** — verify file integrity.
- **Fingerprint** — Etag, dedupe.
- **Signature** — HMAC.
- **Content addressing** — Git, IPFS.

```ts
import crypto from "crypto";

// SHA-256 (modern default)
const hash = crypto.createHash("sha256").update(data).digest("hex");

// HMAC (authenticated)
const hmac = crypto.createHmac("sha256", secret).update(data).digest("hex");

// SHA-512 — nhiều bit, an toàn hơn
const sha512 = crypto.createHash("sha512").update(data).digest("hex");
```

| Algorithm | Status | Use case |
|-----------|--------|---------|
| **MD5** | Broken (collision) | Checksum non-security |
| **SHA-1** | Deprecated | Git (legacy) |
| **SHA-256** | **OK** | General use |
| **SHA-512** | **OK** | Higher security |
| **SHA-3** | OK | Modern, post-quantum prep |
| **Blake2/Blake3** | **OK, faster** | High performance |

---

## HTTPS / TLS

**HTTPS = HTTP over TLS** — encrypt traffic giữa client và server.

**TLS handshake** (simplified):

```
1. Client: ClientHello (cipher suites, random)
2. Server: ServerHello + certificate + random
3. Client verify cert chain (CA).
4. Key exchange (ECDHE) — derive shared secret.
5. Encrypted traffic dùng AES-GCM.
```

**Cert mời thường**:

- **Let's Encrypt** (free, auto renew via Certbot).
- **Cloudflare** (free khi qua CF proxy).
- **AWS Certificate Manager** (free trong AWS).
- **DigiCert, Sectigo** (paid, EV cert).

**Setup Let's Encrypt với Nginx**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Tự cài cert + renew cron
```

**HSTS** — buộc HTTPS, prevent downgrade attack:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Sau khi client thấy HSTS → từ chối HTTP forever (cho tới max-age).

:::tip[Mẹo]

**HTTPS production checklist**:

- [ ] Cert valid, không self-signed.
- [ ] **Redirect HTTP → HTTPS** ở tầng load balancer/server.
- [ ] **HSTS** header + preload list.
- [ ] **TLS 1.2 minimum**, prefer **TLS 1.3**.
- [ ] **Strong cipher suites** — disable RC4, 3DES, MD5.
- [ ] Auto **renew cert** (Let's Encrypt 90 ngày).
- [ ] **Test** với https://www.ssllabs.com/ssltest/ — target A+ grade.

Cloudflare làm hộ phần lớn — free SSL + HSTS + auto renew.

:::

---

## CORS

**CORS (Cross-Origin Resource Sharing)** — browser security rule cho
cross-origin request.

**Same-origin policy**:
- Protocol + host + port phải match.
- `https://app.com` ≠ `https://api.app.com` (subdomain khác).

**Cross-origin request** bị browser chặn trừ khi server cho phép via CORS.

Server set header:

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Preflight request** — browser tự gửi `OPTIONS` trước khi request thật:

```
OPTIONS /api/users
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

Server respond OK → browser mới gửi POST thật.

**Code example** (Express):

```ts
import cors from "cors";

app.use(cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
```

:::warning[Cần lưu ý]

**Đừng dùng `*` cho production API có auth**:

```ts
// SAI — public + credentials không kết hợp được
app.use(cors({ origin: "*", credentials: true })); // browser reject

// SAI — public API có auth → ai cũng dùng được
res.setHeader("Access-Control-Allow-Origin", "*");
```

Pattern đúng — whitelist:

```ts
const allowed = ["https://app.example.com", "https://admin.example.com"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
```

CORS **không phải security ở server** — chỉ browser enforce. Server vẫn
phải check auth, không dựa CORS bảo vệ.

:::

---

## CSP

**Content Security Policy** — chặn XSS, restrict script/resource load.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

Block:

- Inline script không có nonce → chặn XSS.
- Script từ domain không trong allowlist.
- iframe wrap site (clickjacking).

**Reporting** — log violation:

```
Content-Security-Policy-Report-Only: <policy>
Report-To: { "group": "csp", "endpoints": [{ "url": "/csp-report" }] }
```

Test CSP với `Report-Only` trước khi enforce.

:::tip[Mẹo]

**Setup CSP step-by-step**:

1. **Start permissive** — `default-src 'self' 'unsafe-inline'`.
2. **Report-only mode** vài tuần → collect violation.
3. **Tighten** dần — remove `unsafe-inline`, add nonce.
4. **Enforce** sau khi không có violation false positive.

Pattern modern với Next.js 19+:

```tsx
// app/layout.tsx
import { headers } from "next/headers";

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get("x-nonce");

  return (
    <html>
      <body>
        <Script
          src="https://example.com/script.js"
          nonce={nonce}
        />
        {children}
      </body>
    </html>
  );
}
```

Middleware generate nonce per request → inject vào CSP header + script tag.

:::
