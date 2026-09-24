---
sidebar_position: 1
title: "1. Hashing và Network Security"
---

# Hashing và Network Security

Bài này nói về hai mảng nền tảng giúp giữ an toàn cho hệ thống backend: hashing (cách biến mật khẩu và dữ liệu thành chuỗi không thể đảo ngược) và bảo mật tầng mạng (HTTPS/TLS, CORS, CSP). Hiểu rõ những thứ này giúp bạn lưu mật khẩu an toàn, mã hóa đường truyền giữa client và server, và chặn các kiểu tấn công phổ biến trên web. Đây là kiến thức bắt buộc trước khi đưa bất kỳ ứng dụng nào lên môi trường thật.

[![Sơ đồ tóm tắt bài: Hashing và Network Security](/img/backend/hashing-network.webp)](pathname:///img/backend/hashing-network.webp)

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
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Hashing là gì?

**Hash function** — biến input → string độ dài cố định, **không thể đảo ngược**.

:::tip[Ví dụ đời thường]

Hash giống **cái cối xay thịt**: bỏ miếng bò vào, quay ra mớ thịt xay. Cùng miếng thịt đó, cùng cái cối đó thì lần nào cũng ra mớ thịt xay y hệt — nhưng **không ai xay ngược** được mớ thịt xay thành lại miếng bò.

Và chỉ cần đổi tí xíu đầu vào — thêm một hạt tiêu — thì mớ ra **khác hoàn toàn**, chứ không phải khác một chút.

Nhờ vậy server không cần biết password của bạn: nó chỉ xay lại rồi so hai mớ có giống nhau không.

:::

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

:::tip[Ví dụ đời thường]

Nghĩ tới cái **khóa số**: kẻ trộm dò từng tổ hợp. Nếu mỗi lần thử chỉ tốn một phần triệu giây (`MD5`, `SHA-256`), nó dò hết cả triệu tổ hợp trong nháy mắt. Loại khóa dành cho password (`bcrypt`, `Argon2id`) cố tình làm **cái núm quay nặng và chậm** — mỗi lần thử tốn cả phần giây.

Bạn đăng nhập ngày vài lần nên chậm 300ms chẳng ảnh hưởng gì; kẻ dò cả tỉ lần thì hết đời cũng chưa xong. Đó là cái giá được trả **có chủ đích**.

Còn `salt` là **nhúm gia vị riêng cho từng người**: hai người cùng đặt mật khẩu "123456" nhưng gia vị khác nhau nên hash ra khác nhau — kẻ trộm không thể dùng chung một cuốn sổ tra sẵn cho cả database.

:::

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

:::tip[Ví dụ đời thường]

Bạn muốn gửi thư mật cho một ngân hàng chưa từng gặp mặt:

1. Bạn nhắn trước: "tôi biết mấy kiểu mã hóa này" (ClientHello).
2. Ngân hàng gửi lại **giấy chứng nhận có công chứng** của một văn phòng công chứng uy tín (CA), để chứng minh đúng là họ chứ không phải kẻ giả danh.
3. Bạn soi con dấu công chứng đó có thật không.
4. Hai bên cùng nghĩ ra **một ổ khóa chung** mà người đứng giữa nghe lén không đoán ra được.
5. Từ đó mọi lá thư đều bỏ vào hộp và khóa bằng ổ khóa chung ấy.

Màn bắt tay này chỉ tốn công **lần đầu**; sau đó thư đi lại nhanh như thường.

:::

```
1. Client: ClientHello (cipher suites, random)
2. Server: ServerHello + certificate + random
3. Client verify cert chain (CA).
4. Key exchange (ECDHE) — derive shared secret.
5. Encrypted traffic dùng AES-GCM.
```

**Nhà cung cấp cert phổ biến**:

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

:::tip[Ví dụ đời thường]

CORS giống **ông bảo vệ tòa nhà văn phòng** chặn bạn lại hỏi: "anh từ công ty nào tới?". Chỉ công ty có tên trong danh sách dán ở quầy mới được lên.

Nhưng nhớ kỹ: ông bảo vệ này đứng **ở phía trình duyệt, không phải phía server**. Ai gọi bằng `curl` hay Postman là đi cửa sau, chẳng có ai hỏi han gì cả.

Nên CORS chỉ bảo vệ user của bạn khỏi trang web độc hại, **không thay thế** việc server tự kiểm token và quyền.

:::

Server set header:

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Preflight request** — browser tự gửi `OPTIONS` trước khi request thật:

:::tip[Ví dụ đời thường]

Trước khi chở nguyên xe hàng tới, tài xế **gọi điện hỏi trước**: "chiều nay tôi mang loại hàng này tới, kho có nhận không?". Kho gật đầu thì mới chất hàng lên xe chạy.

`OPTIONS` chính là cuộc gọi đó — tránh chở cả xe tới nơi rồi bị đuổi về.

Cái giá phải trả: mỗi request "lạ" tốn thêm một vòng đi-về, nên server hay đặt `Access-Control-Max-Age` để bảo "khỏi gọi lại trong một ngày".

:::

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

:::tip[Ví dụ đời thường]

CSP là **danh sách khách mời** đưa cho bảo vệ đứng cửa tiệc: chỉ ai có tên trong danh sách (domain được allow) hoặc cầm đúng **tấm thiệp in mã riêng của tối nay** (`nonce`) mới được vào.

Kẻ lạ có lén nhét được tờ giấy vào trong nhà cũng vô dụng, vì không ai chịu làm theo.

Cái giá phải trả: siết quá tay thì **khách quen cũng bị chặn** — nên người ta bật chế độ "ghi sổ mà chưa đuổi" (`Report-Only`) vài tuần trước khi chặn thật.

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Hashing`, `encryption` và `encoding` khác nhau ở chỗ nào? Cho ví dụ dùng sai mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Mục đích | Đảo ngược được? | Cần key? |
|---|---|---|---|
| **Hashing** | Toàn vẹn, xác thực password | Không (one-way) | Không |
| **Encryption** | Giữ bí mật nội dung | Có, nếu có key | Có |
| **Encoding** | Đổi định dạng cho dễ truyền | Có, ai cũng làm được | Không |

Ví dụ dùng sai:

- **Encoding thay cho encryption:** lưu password dạng `Base64` rồi tưởng là an toàn — bất kỳ ai cũng decode trong một dòng lệnh.
- **Encryption thay cho hashing:** mã hoá password bằng AES để "lúc cần lấy lại". Key rò rỉ là toàn bộ password về plaintext; đúng ra phải hash một chiều.
- **Hashing thay cho encryption:** hash số thẻ tín dụng rồi cần đọc lại để đối soát — không bao giờ khôi phục được.

Mẹo nhớ: encoding không liên quan gì tới bảo mật, encryption bảo vệ bí mật, hashing chứng minh mà không cần biết.

</details>

**2. Một hàm hash tốt cần những tính chất gì? Giải thích `avalanche effect` và `collision resistance`.**

<details className="qa">
<summary>Xem đáp án</summary>

Năm tính chất bài đã nêu:

- **Deterministic** — cùng input luôn ra cùng output, nếu không thì không verify được.
- **Nhanh** (hash thường) hoặc **chậm có chủ đích** (password hash).
- **One-way** — từ output không suy ngược ra input.
- **Avalanche effect** — đổi một bit ở input thì output thay đổi hoàn toàn, khoảng một nửa số bit lật. Nhờ vậy không thể "dò dần" bằng cách nhìn xem hash gần giống nhau tới đâu.
- **Collision resistance** — khó tìm hai input khác nhau cho ra cùng một hash.

```
"hello" → SHA256 → 2cf24dba5fb0a30e...
"helo"  → SHA256 → b3a8e0e1f9ab1bfe...
```

Hai chuỗi chỉ khác một ký tự nhưng hash không có điểm chung nào — đó chính là avalanche. Mất collision resistance thì chữ ký số và checksum vô nghĩa: kẻ tấn công tạo được file độc có cùng hash với file sạch, đúng như chuyện đã xảy ra với `MD5` và `SHA-1`.

</details>

**3. Vì sao tuyệt đối không lưu password dạng plaintext, và cũng không lưu dạng mã hoá có thể giải ngược?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do cốt lõi: **server không cần biết password của user**, nó chỉ cần chứng minh được user biết password. Bài ví hash như cái cối xay thịt — server xay lại rồi so hai mớ, thế là đủ.

- **Plaintext:** một lần rò rỉ database là mất toàn bộ tài khoản. Tệ hơn, người dùng hay xài chung mật khẩu nên kẻ tấn công lấy được luôn email, ngân hàng của họ (credential stuffing).
- **Encryption reversible:** an toàn của toàn bộ password phụ thuộc vào một key duy nhất. Key nằm trong env, trong code, trong backup, trong KMS — chỉ cần một chỗ rò là hỏng tất. Nhân viên có quyền truy cập cũng đọc được.
- Hash một chiều thì kẻ trộm cầm được DB vẫn phải brute force từng account, và nếu dùng slow hash thì chi phí đó là không khả thi.

Ngoại lệ: những thứ *cần* đọc lại như API key của bên thứ ba thì mới encrypt, còn password người dùng thì luôn hash.

</details>

**4. `MD5` và `SHA-256` đều là one-way, vậy vì sao vẫn không được dùng để hash password?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì chúng **quá nhanh** — đúng cái ưu điểm khiến chúng hợp cho checksum lại là tử huyệt khi làm password hash. Bài đã đưa con số:

- `MD5`/`SHA`: khoảng 5 tỷ hash mỗi giây trên GPU → password 8 ký tự dò hết trong vài giờ.
- `bcrypt` cost 12: khoảng 5 hash mỗi giây → cùng password đó mất hàng nghìn năm.

Kẻ tấn công steal được DB sẽ brute force **offline**, không bị rate limit, không bị khoá tài khoản, chạy song song trên hàng chục GPU. Với hash nhanh thì rainbow table và wordlist quét sạch phần lớn mật khẩu thật.

Password hash được thiết kế **chậm có chủ đích**, và `Argon2` còn **memory-hard** để GPU/ASIC không nhân bản được hàng nghìn lõi rẻ tiền. Cái giá là login chậm vài trăm ms — user đăng nhập vài lần một ngày nên không cảm nhận được, còn kẻ dò hàng tỉ lần thì phá sản.

Kết luận: `SHA-256` để checksum, HMAC, fingerprint — không bao giờ cho password.

</details>

**5. `salt` giải quyết vấn đề gì (`rainbow table`, hai user cùng đặt một mật khẩu)? Salt có cần giữ bí mật không, lưu ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`salt` là chuỗi ngẫu nhiên **riêng cho từng user**, nối vào password trước khi hash. Bài ví nó như nhúm gia vị riêng của mỗi người.

Nó giải quyết hai vấn đề:

- **Rainbow table** — bảng tra sẵn hash của hàng tỉ mật khẩu phổ biến. Salt ngẫu nhiên khiến bảng dựng sẵn vô dụng, vì kẻ tấn công phải dựng lại bảng riêng cho từng salt.
- **Hai user cùng mật khẩu** — không salt thì hai người cùng đặt "123456" sẽ có hash giống hệt nhau, lộ ngay là ai xài mật khẩu yếu và crack một lần trúng nhiều account. Có salt thì hash khác nhau hoàn toàn.

Salt **không cần bí mật** — nó chỉ cần *duy nhất và ngẫu nhiên*. Với `bcrypt` và `Argon2` bạn không phải quản lý gì cả: chúng tự sinh salt và nhúng thẳng vào chuỗi hash lưu trong DB, lúc verify tự đọc ra dùng lại. Thứ cần giữ bí mật là `pepper`, không phải salt.

</details>

**6. `pepper` khác `salt` thế nào và vì sao phải để pepper ngoài database?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `salt` | `pepper` |
|---|---|---|
| Phạm vi | Riêng từng user | Chung toàn hệ thống |
| Bí mật? | Không | **Có** |
| Lưu ở đâu | Trong chuỗi hash, cùng DB | Env var / secret manager, **ngoài DB** |
| Chống gì | Rainbow table, trùng mật khẩu | Brute force khi DB bị rò |

Cách dùng như bài trình bày:

```ts
const peppered = password + process.env.PEPPER;
const hash = await bcrypt.hash(peppered, 12);
```

Toàn bộ giá trị của pepper nằm ở chỗ nó **không nằm cùng nơi với dữ liệu bị đánh cắp**. Kịch bản rò rỉ phổ biến nhất là SQL injection hay backup DB lọt ra ngoài — lúc đó kẻ tấn công có hash nhưng thiếu pepper thì không brute force được gì cả. Nếu bạn lưu pepper vào một bảng trong chính DB đó, nó thoái hoá thành salt và mất sạch tác dụng.

Đổi lại, xoay vòng pepper rất phiền vì phải re-hash; thường người ta version pepper và migrate dần lúc user login.

</details>

**7. `bcrypt` lưu salt ở đâu? Bóc tách chuỗi `$2b$12$...` xem gồm những thành phần gì.**

<details className="qa">
<summary>Xem đáp án</summary>

`bcrypt` lưu salt **ngay trong chuỗi hash**, nên bạn chỉ cần một cột trong DB, không cần cột salt riêng.

```
$2b$12$abcdefghijklmnopqrstuv.XyZ...
 │  │  └──────────┬──────────┘└──┬──┘
 │  │         salt (22 ký tự)  hash (31 ký tự)
 │  └── cost factor = 12 → 2^12 vòng lặp
 └── version của thuật toán (2a / 2b / 2y)
```

Chuỗi đầy đủ dài 60 ký tự, các phần ngăn nhau bằng `$`, dùng bảng mã base64 riêng của bcrypt.

Nhờ cấu trúc này, `bcrypt.compare(input, stored)` tự đọc version + cost + salt từ chuỗi đã lưu, hash lại input theo đúng tham số đó rồi so sánh. Đó cũng là lý do bạn **đổi cost được mà không hỏng dữ liệu cũ**: hash cũ cost 10 và hash mới cost 12 sống chung trong một bảng, mỗi dòng tự mang tham số của nó. `Argon2` cũng theo ý tưởng tương tự, chuỗi `$argon2id$v=19$m=...,t=...,p=...$salt$hash` còn ghi rõ cả memory và parallelism.

</details>

**8. `cost factor` / `work factor` là gì? Chọn cost bao nhiêu, và vì sao phải tăng dần theo thời gian?**

<details className="qa">
<summary>Xem đáp án</summary>

`cost factor` là tham số điều chỉnh **độ chậm** của hàm hash. Với `bcrypt`, cost là số mũ: cost 12 nghĩa là `2^12` vòng lặp, tăng cost thêm 1 là thời gian gấp đôi. Với `Argon2` thì có ba núm vặn: `memoryCost`, `timeCost`, `parallelism`.

Khuyến nghị trong bài:

- `bcrypt`: **12 rounds** là chuẩn hiện nay, 10 chỉ để tương thích hệ thống cũ.
- `Argon2id`: `memoryCost` khoảng 19 MB, `timeCost` 2, `parallelism` 1.

Cách chọn thực tế: đo trên chính phần cứng production, chỉnh sao cho một lần hash tốn **khoảng 200–500 ms**. Chậm hơn nữa thì endpoint login dễ thành điểm nghẽn và thành cửa ngõ cho DoS.

Phải tăng dần vì phần cứng của kẻ tấn công mỗi năm một mạnh, trong khi hash cũ nằm im trong DB với cost cũ. Cứ vài năm nên nâng một nấc, và nâng **transparent**: lúc user login thành công, bạn đã có password plaintext trong tay, cứ re-hash bằng cost mới rồi ghi đè.

</details>

**9. So sánh `bcrypt`, `scrypt`, `Argon2id`, `PBKDF2`. "Memory-hard" nghĩa là gì và nó vô hiệu hoá loại phần cứng tấn công nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuật toán | Khuyến nghị | Đặc điểm |
|---|---|---|
| **Argon2id** | Tốt nhất hiện nay | Thắng Password Hashing Competition, chỉnh được cả memory lẫn time |
| **bcrypt** | Có | Đã chinh chiến 25+ năm, thư viện có ở mọi ngôn ngữ |
| **scrypt** | Được | Memory-hard, ít phổ biến hơn |
| **PBKDF2** | Tạm chấp nhận | Chuẩn NIST, dùng khi bị ràng buộc compliance/FIPS |
| **MD5, SHA-256** | **Không** | Quá nhanh |

**Memory-hard** nghĩa là thuật toán cố tình đòi một lượng RAM lớn cho mỗi lần tính hash (ví dụ 19 MB). CPU thường thì thoải mái, nhưng kẻ tấn công muốn chạy song song hàng nghìn phép tính lại phải nhân số RAM đó lên — và RAM thì đắt, khó nhồi vào chip.

Nó vô hiệu hoá chính **GPU, FPGA và ASIC**: sức mạnh của các phần cứng này nằm ở hàng nghìn lõi tính toán nhỏ dùng chung bộ nhớ ít ỏi. `PBKDF2` chỉ tốn CPU nên bị GPU bẻ rất hiệu quả; `bcrypt` cần khoảng 4 KB nên kháng GPU ở mức vừa; `Argon2id`/`scrypt` kháng mạnh nhất.

</details>

**10. Bạn muốn nâng cost cho toàn bộ user cũ nhưng không biết password của họ — làm cách nào để migrate mà user không phải đổi mật khẩu?**

<details className="qa">
<summary>Xem đáp án</summary>

Bạn không thể re-hash hàng loạt vì trong DB chỉ có hash, không có password. Cách chuẩn là **re-hash lazy lúc login** — thời điểm duy nhất bạn cầm được plaintext:

```ts
const valid = await bcrypt.compare(input, user.passwordHash);
if (!valid) throw new Error("Sai mật khẩu");

// Hash cũ yếu hơn chuẩn hiện tại → nâng cấp ngay, user không hay biết
if (bcrypt.getRounds(user.passwordHash) < 12) {
  const newHash = await bcrypt.hash(input, 12);
  await db.user.update(user.id, { passwordHash: newHash });
}
```

Cách này chạy được vì mỗi chuỗi hash tự mang cost của nó, nên hash cũ và mới sống chung thoải mái.

Cách này cũng dùng được khi **đổi hẳn thuật toán** (bcrypt sang Argon2id): lưu thêm cột đánh dấu thuật toán, verify theo thuật toán cũ rồi ghi lại bằng thuật toán mới.

Phần còn lại là những account không bao giờ login nữa. Sau vài tháng, thống kê xem còn bao nhiêu hash cũ; với nhóm tồn đọng thì gửi email mời đổi mật khẩu, hoặc force reset nếu thuật toán cũ thực sự nguy hiểm.

</details>

**11. `Timing attack` là gì? Vì sao mọi thao tác so sánh password/token/HMAC phải `constant-time`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Timing attack` khai thác chỗ **thời gian phản hồi tiết lộ thông tin**. So sánh chuỗi thông thường dừng ngay tại byte đầu tiên khác nhau, nên đoán đúng ký tự đầu sẽ chậm hơn đoán sai một chút xíu. Kẻ tấn công gửi hàng nghìn request, đo thống kê và dò dần từng ký tự — biến bài toán mũ thành bài toán tuyến tính.

```ts
// SAI — thoát sớm, thời gian phụ thuộc vào số ký tự khớp
if (input === storedToken) { ... }

// ĐÚNG — luôn duyệt hết, thời gian không đổi
crypto.timingSafeEqual(Buffer.from(input), Buffer.from(storedToken));

// bcrypt.compare cũng đã constant-time sẵn
await bcrypt.compare(input, user.passwordHash);
```

`constant-time` nghĩa là thời gian chỉ phụ thuộc độ dài, không phụ thuộc nội dung — thường cài bằng cách XOR toàn bộ byte rồi OR kết quả lại.

Áp dụng cho mọi thứ bí mật đem đi so sánh: password, session token, API key, chữ ký HMAC của webhook, mã OTP. Lưu ý `timingSafeEqual` ném lỗi nếu hai buffer khác độ dài, nên hãy hash cả hai về cùng độ dài trước khi so.

</details>

**12. Khi nào dùng `HMAC` thay vì hash thường? Verify chữ ký webhook của Stripe/GitHub hoạt động ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hash thường chỉ chứng minh **toàn vẹn**: ai cũng tính được nên ai cũng sửa nội dung rồi tính lại hash mới. `HMAC` thêm một **secret key** vào công thức, nên nó chứng minh cả toàn vẹn lẫn **nguồn gốc** — chỉ người biết key mới tạo được chữ ký hợp lệ.

Dùng HMAC khi dữ liệu đi qua kênh không tin cậy và bạn cần biết ai gửi: webhook, signed URL, signed cookie, JWT với thuật toán `HS256`.

Luồng verify webhook:

```ts
const expected = crypto
  .createHmac("sha256", process.env.WEBHOOK_SECRET)
  .update(rawBody)          // body thô, chưa qua JSON.parse
  .digest("hex");

const ok = crypto.timingSafeEqual(
  Buffer.from(expected),
  Buffer.from(signatureFromHeader),
);
```

Ba chỗ hay sai: dùng body đã parse rồi serialize lại (thừa/thiếu khoảng trắng là sai chữ ký), so sánh bằng `===` thay vì constant-time, và quên kiểm timestamp trong header — thiếu bước này thì kẻ tấn công phát lại đúng request cũ (replay attack) vẫn qua.

</details>

**13. `MD5` và `SHA-1` bị coi là "broken" nghĩa là gì cụ thể? Chúng còn dùng được cho việc gì?**

<details className="qa">
<summary>Xem đáp án</summary>

"Broken" ở đây nói về **collision resistance**, không phải về tính one-way. Người ta đã tạo được hai file khác nhau cho ra cùng một hash: `MD5` gãy từ những năm 2000 và giờ tạo collision chỉ tốn vài giây, `SHA-1` bị phá bằng tấn công SHAttered năm 2017 với hai file PDF cùng hash.

Hậu quả thực tế: không được dùng chúng ở chỗ nào mà kẻ tấn công **kiểm soát được nội dung** — chữ ký số, certificate, verify bản cài đặt tải về, content addressing chống giả mạo. Kẻ tấn công chuẩn bị sẵn một file sạch để bạn ký và một file độc cùng hash.

Chúng vẫn còn chỗ dùng ở những việc **không mang tính bảo mật**:

- Checksum phát hiện lỗi truyền/lưu trữ ngẫu nhiên.
- Khoá cache, dedupe file, chia shard.
- Etag, fingerprint nội bộ.
- `SHA-1` trong Git vì lý do lịch sử (Git đã thêm lớp phát hiện collision).

Mặc định cho việc mới: `SHA-256`, hoặc Blake2/Blake3 nếu cần nhanh.

</details>

**14. HTTPS khác HTTP ở điểm nào? Mô tả `TLS handshake`: hai bên trao đổi những gì và khoá phiên được sinh ra thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTPS chính là HTTP chạy bên trên TLS. Nó thêm ba bảo đảm mà HTTP trần không có: **bí mật** (nghe lén không đọc được), **toàn vẹn** (sửa gói tin giữa đường sẽ bị phát hiện) và **xác thực** (bạn chắc đang nói chuyện đúng server).

Handshake rút gọn như bài mô tả:

```
1. Client: ClientHello (danh sách cipher suite, random)
2. Server: ServerHello + certificate + random
3. Client verify cert chain tới CA gốc
4. Key exchange (ECDHE) → derive shared secret
5. Traffic mã hoá bằng AES-GCM
```

Điểm hay nhất nằm ở bước 4: khoá phiên **không hề được gửi qua mạng**. Hai bên mỗi người sinh một cặp khoá tạm, chỉ trao đổi phần public, rồi mỗi bên tự tính ra cùng một secret chung — kẻ nghe lén thấy đủ mọi thứ bay qua vẫn không tính ra được. Secret đó trộn với hai giá trị random rồi dẫn xuất thành khoá đối xứng cho phiên.

Bài ví như hai bên cùng nghĩ ra một ổ khóa chung. Handshake tốn công một lần, sau đó dùng mã hoá đối xứng nên nhanh gần như HTTP thường.

</details>

**15. Chứng chỉ do `CA` cấp giải quyết vấn đề gì? Trình duyệt verify `certificate chain` theo trình tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: mã hoá thôi chưa đủ. Nếu bạn bắt tay với kẻ đứng giữa mà không biết, mọi thứ vẫn được mã hoá — chỉ là mã hoá với **nhầm người** (man-in-the-middle). Certificate giải bài toán "làm sao tin server đúng là chủ của domain này", bằng cách nhờ một bên thứ ba mà cả hai cùng tin: **CA** — đúng như hình ảnh văn phòng công chứng trong bài.

Trình duyệt verify theo trình tự:

1. Cert này có đúng cho domain đang truy cập không (kiểm trường SAN, không phải CN nữa).
2. Còn hạn không — kiểm `notBefore` / `notAfter`.
3. Chữ ký của cert có khớp với public key của **intermediate CA** cấp nó không.
4. Lặp lên trên theo chuỗi cho tới khi chạm một **root CA** nằm trong trust store của hệ điều hành/trình duyệt.
5. Kiểm cert có bị thu hồi chưa (OCSP stapling / CRL).

Chỉ cần một mắt xích gãy là báo lỗi. Đó cũng là lý do cert self-signed bị cảnh báo: không có mắt xích nào dẫn về root được tin sẵn. Lỗi triển khai thường gặp nhất là **quên gửi kèm intermediate cert**, khiến chuỗi đứt giữa chừng.

</details>

**16. `TLS 1.3` cải thiện gì so với `TLS 1.2` (số round-trip, những cipher suite bị loại bỏ)?**

<details className="qa">
<summary>Xem đáp án</summary>

| | TLS 1.2 | TLS 1.3 |
|---|---|---|
| Handshake | 2 round-trip | **1 round-trip** |
| Kết nối lại | Session resumption 1-RTT | **0-RTT** (có điều kiện) |
| Cipher suite | Hàng trăm tổ hợp, nhiều cái yếu | 5 tổ hợp, chỉ AEAD |
| Forward secrecy | Tuỳ chọn | **Bắt buộc** |

TLS 1.3 dọn sạch những thứ đã gây ra hàng loạt lỗ hổng: RSA key exchange (không có forward secrecy), static Diffie-Hellman, chế độ CBC, RC4, 3DES, MD5/SHA-1 làm chữ ký, nén TLS, và renegotiation. Chỉ còn AEAD như AES-GCM và ChaCha20-Poly1305.

Nhanh hơn vì client **đoán trước** tham số key exchange và gửi ngay trong ClientHello thay vì chờ thoả thuận xong mới trao đổi khoá. Bớt một vòng đi-về là bớt vài chục tới vài trăm ms cho mỗi kết nối mới — rất đáng kể trên mạng di động.

Lưu ý về 0-RTT: dữ liệu gửi trong 0-RTT có thể bị replay, nên chỉ dùng cho request idempotent, không dùng cho POST thay đổi dữ liệu.

Khuyến nghị của bài: tối thiểu TLS 1.2, ưu tiên 1.3.

</details>

**17. `Forward secrecy` là gì? `ECDHE` mang lại điều đó bằng cách nào, và vì sao key exchange kiểu RSA cũ thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

`Forward secrecy` (PFS): kẻ tấn công ghi lại toàn bộ traffic mã hoá hôm nay, mai mốt lấy được private key của server thì **vẫn không giải mã được** những phiên đã ghi. Mỗi phiên có khoá riêng, lộ khoá dài hạn không kéo theo lộ lịch sử.

Với **RSA key exchange kiểu cũ**, client tự sinh pre-master secret rồi mã hoá bằng public key trong certificate và gửi đi. Nghĩa là secret của phiên *nằm ngay trong gói tin đã ghi lại*, chỉ khoá bởi private key dài hạn của server. Ai có private key đó — hacker, hay toà án yêu cầu — giải mã được mọi phiên từ trước tới nay. Đây chính là kịch bản "harvest now, decrypt later".

Với **ECDHE**, mỗi phiên hai bên sinh một cặp khoá elliptic curve **tạm thời** (chữ E cuối là ephemeral), chỉ trao đổi phần public rồi mỗi bên tự tính ra shared secret. Private key của server chỉ dùng để **ký** vào phần trao đổi đó nhằm chống MITM, chứ không tham gia tạo khoá phiên. Khoá tạm bị xoá khi phiên kết thúc, nên không còn gì để giải mã ngược.

TLS 1.3 vì vậy bỏ hẳn RSA key exchange, chỉ giữ ECDHE.

</details>

**18. `HSTS` chặn được tấn công nào? `preload` list dùng làm gì và rủi ro khi lỡ bật là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

HSTS bảo trình duyệt: từ nay tới hết `max-age`, với domain này **chỉ được đi HTTPS**, gõ `http://` cũng tự đổi, và gặp lỗi certificate thì chặn thẳng chứ không cho bấm "tôi vẫn vào".

Nó chặn **SSL stripping / downgrade attack**: người dùng gõ `example.com` thì request đầu tiên đi bằng HTTP, kẻ ngồi cùng WiFi chặn ngay redirect đó và giữ nạn nhân ở HTTP suốt phiên.

Nhưng HSTS có lỗ hổng "lần đầu": trình duyệt chưa từng vào site thì chưa có header, nên vẫn dính đúng phát đầu tiên. `preload` list vá chỗ đó — danh sách domain được nhúng sẵn trong bản build của Chrome, Firefox, Safari, nên trình duyệt biết phải dùng HTTPS ngay cả trước lần truy cập đầu.

Rủi ro: vào list thì dễ, **ra thì rất lâu** — phải đăng ký gỡ rồi chờ nhiều tháng cho các bản trình duyệt mới lan ra. Nếu có subdomain nội bộ chưa có cert mà bạn lỡ bật `includeSubDomains; preload`, các subdomain đó chết cứng. Cách an toàn: bắt đầu `max-age` nhỏ, xác nhận mọi subdomain đều chạy HTTPS, rồi mới nâng lên một năm và đăng ký preload.

</details>

**19. Đội bạn dùng cert Let's Encrypt hạn 90 ngày. Bạn thiết kế quy trình renew và cảnh báo hết hạn ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **renew phải tự động**, việc của con người chỉ là nhận cảnh báo khi tự động hỏng.

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Certbot tự cài timer renew; kiểm thử trước khi tin
sudo certbot renew --dry-run
```

Thiết kế đầy đủ:

- **Renew sớm** — chạy thử hai lần mỗi ngày, certbot chỉ thực sự gia hạn khi cert còn dưới 30 ngày. Còn nguyên một tháng để xử lý nếu có trục trặc.
- **Reload service sau renew** — dùng `--deploy-hook` để `nginx -s reload`. Lỗi kinh điển là cert đã mới nhưng process vẫn giữ cert cũ trong bộ nhớ.
- **Giám sát từ ngoài** — một job độc lập mở TLS tới domain thật, đọc ngày hết hạn, cảnh báo ở mốc 21 và 7 ngày. Phải đo từ bên ngoài vì nó bắt được cả trường hợp file mới mà server chưa nạp.
- **Cảnh báo cả khi renew fail** — job renew im lặng cũng là một dạng hỏng.
- **Kiểm luôn wildcard/DNS challenge** nếu có, vì nó phụ thuộc API của nhà cung cấp DNS.

Cách rẻ nhất là đẩy TLS ra tầng trước: Cloudflare hoặc AWS ACM lo hết phần gia hạn.

</details>

**20. `Same-origin policy` định nghĩa "origin" bằng những thành phần nào? `https://app.com` và `https://api.app.com` có cùng origin không?**

<details className="qa">
<summary>Xem đáp án</summary>

Origin gồm **ba thành phần**, phải khớp cả ba: **protocol + host + port**.

`https://app.com` và `https://api.app.com` **không cùng origin** — host khác nhau, dù chung domain gốc. Bài nói rõ: subdomain khác là origin khác.

Vài cặp khác để đối chiếu với `https://app.com`:

| URL | Cùng origin? | Vì sao |
|---|---|---|
| `https://app.com/users` | Có | Path không tính vào origin |
| `http://app.com` | Không | Khác protocol |
| `https://app.com:8443` | Không | Khác port |
| `https://api.app.com` | Không | Khác host |

Lưu ý dễ nhầm: cookie **không** theo luật này — cookie tính theo domain và path, nên cookie đặt cho `.app.com` vẫn gửi sang `api.app.com` dù hai bên khác origin. Vì vậy same-origin policy và phạm vi cookie là hai chuyện tách biệt, và đó là lý do vẫn cần chống CSRF dù đã có CORS.

</details>

**21. `CORS` bảo vệ ai? Vì sao nói CORS không phải cơ chế bảo mật phía server — gọi bằng `curl`/Postman thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

CORS bảo vệ **người dùng của bạn**, không bảo vệ API của bạn. Nó ngăn một trang độc hại mà nạn nhân lỡ mở dùng phiên đăng nhập sẵn của họ để gọi API của bạn rồi **đọc kết quả**.

Điểm mấu chốt: **chỉ trình duyệt thi hành CORS**. Bài ví nó như ông bảo vệ đứng ở phía trình duyệt chứ không phải phía server. Request vẫn được gửi đi và server vẫn xử lý bình thường; trình duyệt chỉ chặn *đoạn JavaScript của trang kia đọc response* khi thiếu header cho phép.

Gọi bằng `curl` hay Postman thì không có ai hỏi han gì cả — chúng không phải trình duyệt, không có khái niệm origin, không quan tâm header `Access-Control-Allow-Origin`. Response trả về đầy đủ.

Hệ quả thực tế:

- Đừng bao giờ coi CORS là lớp phân quyền. Server vẫn phải verify token và kiểm quyền trên từng request.
- CORS chặt cũng không giấu được endpoint khỏi kẻ tấn công.
- Và CORS **không** chống CSRF, vì request ghi vẫn đi tới server dù response bị chặn.

</details>

**22. Khi nào browser gửi `preflight OPTIONS`? Thế nào là một "simple request" không cần preflight? `Access-Control-Max-Age` giúp gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bài ví preflight như cú điện thoại hỏi kho trước khi chở hàng tới. Trình duyệt gửi `OPTIONS` trước để hỏi server có chấp nhận method và header sắp dùng không.

**Simple request** — không cần preflight khi thoả đủ:

- Method là `GET`, `HEAD` hoặc `POST`.
- `Content-Type` thuộc `application/x-www-form-urlencoded`, `multipart/form-data` hoặc `text/plain`.
- Không có header tuỳ chỉnh (`Authorization`, `X-Api-Key`... đều làm mất tư cách simple).

Nghĩa là đa số API thật đều cần preflight: chỉ riêng `Content-Type: application/json` là đã đủ kích hoạt.

```
OPTIONS /api/users
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

Server trả OK thì trình duyệt mới gửi POST thật.

`Access-Control-Max-Age: 86400` bảo trình duyệt **cache kết quả preflight** trong một ngày, khỏi hỏi lại cho mỗi request — tránh nhân đôi số round-trip. Lưu ý các trình duyệt có trần riêng (Chrome giới hạn khoảng 2 giờ), nên đặt số lớn hơn cũng bị cắt.

</details>

**23. Vì sao `Access-Control-Allow-Origin: *` không đi chung được với `Access-Control-Allow-Credentials: true`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì tổ hợp đó sẽ biến mọi API có đăng nhập thành API công khai cho bất kỳ website nào. `*` nghĩa là "origin nào cũng được", `credentials: true` nghĩa là "cứ kèm cookie và header `Authorization` của user". Ghép lại: một trang độc hại bất kỳ gọi API của bạn bằng phiên đăng nhập của nạn nhân và **đọc được response**. Đúng nghĩa CSRF có kèm khả năng đọc dữ liệu.

Nên chuẩn CORS cấm thẳng: khi request có credentials, trình duyệt **từ chối** response nào có `Access-Control-Allow-Origin: *`, bắt buộc phải echo lại đúng một origin cụ thể.

```ts
// SAI — browser reject
app.use(cors({ origin: "*", credentials: true }));

// ĐÚNG — whitelist rồi echo đúng origin đang gọi
const allowed = ["https://app.example.com", "https://admin.example.com"];
app.use(cors({
  origin: (origin, cb) =>
    !origin || allowed.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS")),
  credentials: true,
}));
```

Nhớ thêm `Vary: Origin` khi echo động, nếu không CDN có thể cache nhầm header của origin này cho origin khác.

</details>

**24. Server reflect thẳng header `Origin` của request vào `Access-Control-Allow-Origin` — cách này sai ở đâu và bị khai thác thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Reflect vô điều kiện tương đương với `*` nhưng còn tệ hơn, vì nó **vượt được cả ràng buộc credentials**:

```ts
// RẤT SAI
res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
res.setHeader("Access-Control-Allow-Credentials", "true");
```

Khai thác: kẻ tấn công dựng `https://evil.com`, dụ nạn nhân đang đăng nhập mở trang đó. JavaScript trên trang gọi `fetch` tới API của bạn kèm cookie. Server thấy `Origin: https://evil.com` và phản chiếu lại y nguyên, trình duyệt tưởng bạn cho phép, thế là `evil.com` đọc trọn dữ liệu riêng tư của nạn nhân.

Biến thể tinh vi của cùng lỗi này là whitelist kiểm bằng so chuỗi lỏng lẻo:

- `origin.endsWith("example.com")` → `evil-example.com` lọt.
- `origin.includes("example.com")` → `example.com.evil.com` lọt.
- Quên chuẩn hoá protocol → `http://app.example.com` lọt.

Cách đúng là **so khớp chính xác** với một danh sách cố định, như pattern `allowed.includes(origin)` trong bài, và luôn kèm `Vary: Origin`.

</details>

**25. Frontend báo lỗi CORS khi gọi API. Bạn debug theo trình tự nào để biết lỗi ở preflight, ở header thiếu, hay thực ra là lỗi 500 của server?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình tự thực dụng:

1. **Mở tab Network, tìm request `OPTIONS`.** Có `OPTIONS` và nó fail thì lỗi ở preflight; không có `OPTIONS` mà request thật vẫn đỏ thì lỗi ở header của response chính.
2. **Đọc status của request thật.** Trình duyệt hay che lỗi server thành "CORS error", vì response 500 do exception thường đi ra ngoài middleware CORS nên mất luôn header. Thấy 500 thì đó là bug server, không phải chuyện CORS.
3. **Gọi lại bằng `curl` kèm `-H "Origin: https://app.example.com" -i`** và xem server trả về header gì. `curl` không thi hành CORS nên phân tách rõ hai chuyện: server có chạy không, và server có gửi đúng header không.
4. **Đối chiếu từng header** — `Access-Control-Allow-Origin` khớp chính xác origin (không thừa dấu `/`), `Allow-Methods` có method đang dùng, `Allow-Headers` có `Content-Type` và `Authorization`.
5. **Kiểm `credentials`** — nếu frontend gửi cookie mà server trả `*` thì trình duyệt sẽ reject.
6. **Kiểm thứ tự middleware và tầng proxy** — middleware CORS phải đăng ký trước route, và Nginx/CDN ở trước có thể nuốt hoặc ghi đè header.

</details>

**26. `CSP` chặn `XSS` bằng cơ chế nào? So sánh `nonce`, `hash` và `'unsafe-inline'`.**

<details className="qa">
<summary>Xem đáp án</summary>

CSP là danh sách khách mời đưa cho trình duyệt: script chỉ được chạy nếu **nguồn của nó nằm trong allowlist**. Kẻ tấn công có chèn được thẻ script vào HTML thì trình duyệt cũng từ chối thực thi — tức CSP không ngăn việc chèn, nó ngăn việc chèn đó có tác dụng. Đây là lớp phòng thủ thứ hai, không thay thế việc escape output.

| Cách cho phép inline script | Mức an toàn | Ghi chú |
|---|---|---|
| `nonce` | Tốt | Mã ngẫu nhiên sinh mới **mỗi request**, phải khớp giữa header và thẻ script |
| `hash` | Tốt | Băm nội dung script; hợp với script tĩnh không đổi, đổi một ký tự là phải tính lại |
| `'unsafe-inline'` | Tệ | Cho phép mọi inline script, xoá sạch tác dụng chống XSS của CSP |

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
  frame-ancestors 'none';
```

Nonce **bắt buộc phải ngẫu nhiên theo từng request** — nonce cố định thì kẻ tấn công đọc HTML là biết và dùng lại được. Cũng nên tránh `'unsafe-eval'`, và cẩn thận với `'unsafe-inline'` ở `style-src` vì nó vẫn cho phép vài kiểu tấn công rò rỉ dữ liệu.

</details>

**27. Vì sao nên chạy `Content-Security-Policy-Report-Only` một thời gian trước khi enforce? Quy trình siết CSP dần gồm những bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì CSP siết quá tay thì **khách quen cũng bị chặn**: analytics, widget chat, font bên ngoài, script của bộ phận marketing gắn qua tag manager, ảnh từ CDN. Enforce ngay là nguy cơ vỡ trang trên production mà có khi chỉ một nhóm người dùng gặp. `Report-Only` cho bạn thấy trước đúng những gì *sẽ* bị chặn mà không chặn thật.

Quy trình bốn bước như bài hướng dẫn:

1. **Bắt đầu lỏng** — `default-src 'self' 'unsafe-inline'`, đủ để không vỡ gì.
2. **Bật Report-Only vài tuần** và thu thập violation qua endpoint báo cáo.

```
Content-Security-Policy-Report-Only: <policy>
Report-To: { "group": "csp", "endpoints": [{ "url": "/csp-report" }] }
```

3. **Siết dần** — phân loại báo cáo, bỏ `'unsafe-inline'`, thêm nonce cho inline script còn lại, đưa domain thật sự cần vào allowlist.
4. **Enforce** khi luồng báo cáo đã sạch false positive, và giữ endpoint báo cáo chạy tiếp để theo dõi.

Lưu ý: nhiều violation đến từ extension của trình duyệt chứ không phải site của bạn, nên đừng vội nới policy theo mọi báo cáo.

</details>

**28. `frame-ancestors` khác `X-Frame-Options` thế nào và chặn được loại tấn công gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cùng chống **clickjacking**: kẻ tấn công nhúng site của bạn vào một iframe trong suốt, đặt lên trên giao diện mồi, người dùng tưởng đang bấm nút của trang kia nhưng thực ra bấm vào nút "Chuyển tiền" hay "Cấp quyền" trên site bạn.

| | `X-Frame-Options` | `frame-ancestors` |
|---|---|---|
| Thuộc về | Header riêng, chuẩn cũ | Directive của CSP, chuẩn hiện hành |
| Giá trị | `DENY`, `SAMEORIGIN` | Danh sách origin, hỗ trợ wildcard |
| Nhiều domain cha | Không làm được | Liệt kê thoải mái |
| Ưu tiên | Bị bỏ qua nếu có `frame-ancestors` | Thắng khi cả hai cùng có mặt |

```
Content-Security-Policy: frame-ancestors 'none';
X-Frame-Options: DENY
```

Thực tế nên đặt cả hai: `frame-ancestors` cho trình duyệt hiện đại, `X-Frame-Options` để phòng client cũ. Nếu có đối tác thật sự cần nhúng, dùng `frame-ancestors https://partner.example.com` thay vì mở toang. Lưu ý `X-Frame-Options: ALLOW-FROM` đã bị khai tử, nên nhu cầu nhiều domain bắt buộc phải dùng `frame-ancestors`.

</details>

**29. Ngoài CSP và HSTS, bạn còn bật những security header nào ở production và mỗi cái chống gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bộ header thường dùng:

- `X-Content-Type-Options: nosniff` — cấm trình duyệt tự đoán kiểu nội dung. Chặn kiểu tấn công upload file "ảnh" nhưng chứa HTML/JS rồi được thực thi.
- `Referrer-Policy: strict-origin-when-cross-origin` — không rò URL đầy đủ (kèm token, id) sang site khác qua header `Referer`.
- `Permissions-Policy` — tắt sẵn camera, micro, geolocation, thanh toán nếu site không dùng, giới hạn cả iframe con.
- `X-Frame-Options: DENY` — chống clickjacking cho client cũ, đi kèm `frame-ancestors`.
- `Cross-Origin-Opener-Policy` và `Cross-Origin-Resource-Policy` — cô lập trang khỏi cửa sổ khác và chặn site lạ nhúng tài nguyên của bạn.
- `Cache-Control: no-store` cho response chứa dữ liệu nhạy cảm.

Kèm theo là cấu hình cookie: `HttpOnly`, `Secure`, `SameSite=Lax` hoặc `Strict`.

Cách làm gọn nhất là dùng thư viện như `helmet` cho Express, hoặc đặt ở tầng Nginx/CDN để áp cho toàn bộ ứng dụng, rồi kiểm lại bằng công cụ chấm điểm header trực tuyến.

</details>
