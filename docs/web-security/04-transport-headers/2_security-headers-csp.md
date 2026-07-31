---
sidebar_position: 2
title: "2. Security Headers & CSP"
---

# Security Headers & CSP

**Security headers** là các HTTP header bạn gửi kèm phản hồi để **chỉ thị trình
duyệt bật các cơ chế bảo vệ**. Chúng là cách *rẻ và hiệu quả* để tăng cường bảo
mật theo tinh thần phòng thủ nhiều lớp. Bài này điểm qua các header quan trọng và
đi sâu vào **CSP** (Content Security Policy) — lớp phòng thủ mạnh chống XSS.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Security headers chỉ thị trình duyệt bật cơ chế bảo vệ** — cách rẻ & hiệu quả theo phòng thủ nhiều lớp; thiếu chúng là `Security Misconfiguration`.
- ⭐ **`CSP` kiểm soát nguồn tài nguyên được tải/chạy** — lớp chống XSS thứ hai; tránh `'unsafe-inline'`/`'unsafe-eval'`, ưu tiên **nonce/hash**.
- **`HSTS`** buộc trình duyệt luôn dùng HTTPS (bật khi mọi thứ đã ổn định trên HTTPS).
- **Header khác** — `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **Dùng `Helmet` (Express) hoặc `headers()` (Next.js)** để đặt header nhanh và đúng.

:::

---

## Mục lục

- [Các security header quan trọng](#các-security-header-quan-trọng)
- [HSTS — buộc dùng HTTPS](#hsts--buộc-dùng-https)
- [CSP — Content Security Policy](#csp--content-security-policy)
- [Các chỉ thị CSP thường dùng](#các-chỉ-thị-csp-thường-dùng)
- [Đặt header dễ dàng với Helmet](#đặt-header-dễ-dàng-với-helmet)
- [Tóm tắt](#tóm-tắt)

---

## Các security header quan trọng

| Header | Tác dụng |
| --- | --- |
| `Strict-Transport-Security` (HSTS) | Buộc trình duyệt luôn dùng HTTPS cho domain |
| `Content-Security-Policy` (CSP) | Kiểm soát nguồn tài nguyên được tải/chạy → chống XSS |
| `X-Frame-Options` | Chống clickjacking (cấm nhúng vào iframe) |
| `X-Content-Type-Options: nosniff` | Cấm trình duyệt "đoán" kiểu file → chống vài kiểu tấn công |
| `Referrer-Policy` | Kiểm soát thông tin referrer gửi đi → đỡ rò rỉ URL nội bộ |
| `Permissions-Policy` | Bật/tắt API trình duyệt (camera, mic, vị trí...) |

> Đây đều thuộc nhóm **defense in depth** — mỗi header bịt một loại rủi ro. Thiếu
> chúng thường bị xếp vào lỗi **Security Misconfiguration** của OWASP.

## HSTS — buộc dùng HTTPS

**HSTS** (HTTP Strict Transport Security) nói với trình duyệt: "với domain này,
**chỉ** dùng HTTPS, kể cả khi người dùng gõ `http://`". Chống tấn công hạ cấp về
HTTP và một số kiểu man-in-the-middle.

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

- `max-age` — thời gian (giây) trình duyệt nhớ quy tắc (vd 1 năm).
- `includeSubDomains` — áp dụng cho cả subdomain.

> Chỉ bật HSTS khi bạn **chắc chắn** mọi thứ (gồm subdomain) đã chạy HTTPS ổn
> định, vì trình duyệt sẽ từ chối HTTP trong suốt `max-age`.

## CSP — Content Security Policy

**CSP** là header mạnh nhất nhóm này. Nó khai báo **nguồn nào được phép** tải
script, style, ảnh, font... Ngay cả khi kẻ tấn công nhét được mã (XSS), CSP có thể
**chặn trình duyệt thực thi** mã đó — lớp phòng thủ thứ hai sau escaping.

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
```

Nghĩa là: mặc định chỉ tải tài nguyên từ **chính origin** (`'self'`), script cũng
chỉ từ origin này, và cấm hoàn toàn `<object>`/plugin.

:::tip CSP bổ sung, không thay thế
CSP là **lớp thứ hai**. Vẫn phải **escape/sanitize** output đúng cách (bài XSS).
CSP giúp giảm thiệt hại khi lớp đầu sơ hở, chứ không phải lý do để bỏ qua escaping.
:::

## Các chỉ thị CSP thường dùng

| Chỉ thị | Kiểm soát |
| --- | --- |
| `default-src` | Mặc định cho mọi loại nếu không khai riêng |
| `script-src` | Nguồn JavaScript được phép chạy |
| `style-src` | Nguồn CSS |
| `img-src` | Nguồn hình ảnh |
| `connect-src` | Đích cho fetch/XHR/WebSocket |
| `frame-ancestors` | Ai được nhúng trang này vào iframe (chống clickjacking) |
| `object-src` | Nguồn `<object>`/`<embed>` (nên đặt `'none'`) |

Các giá trị nguồn hay gặp: `'self'` (cùng origin), `'none'` (cấm hết), domain cụ
thể (`https://cdn.example.com`).

:::danger Tránh `'unsafe-inline'` và `'unsafe-eval'`
Hai giá trị này cho phép chạy inline script và `eval()` — **vô hiệu hoá phần lớn
lợi ích chống XSS** của CSP. Nếu buộc phải dùng inline script, hãy dùng **nonce**
(số dùng một lần) hoặc **hash** thay vì `'unsafe-inline'`.
:::

```text
# Cho phép inline script cụ thể qua nonce thay vì mở toang 'unsafe-inline'
Content-Security-Policy: script-src 'self' 'nonce-r4nd0m123'
```

```html
<!-- Chỉ script mang đúng nonce mới được chạy -->
<script nonce="r4nd0m123">/* ... */</script>
```

## Đặt header dễ dàng với Helmet

Trong Node/Express, thư viện **Helmet** đặt sẵn nhiều security header hợp lý chỉ
với một dòng:

```js
const helmet = require('helmet')

// Bật bộ header an toàn mặc định (HSTS, X-Frame-Options, nosniff, ...)
app.use(helmet())

// Tuỳ chỉnh CSP theo nhu cầu
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  })
)
```

> Với **Next.js**, bạn đặt các header này trong `headers()` của `next.config.js`,
> hoặc qua middleware. Nguyên tắc giống nhau, chỉ khác nơi cấu hình.

## Tóm tắt

- **Security headers** chỉ thị trình duyệt bật cơ chế bảo vệ — cách rẻ và hiệu
  quả theo tinh thần phòng thủ nhiều lớp; thiếu chúng là **Security
  Misconfiguration**.
- **HSTS** buộc luôn dùng HTTPS (bật khi mọi thứ đã ổn định trên HTTPS).
- **CSP** kiểm soát nguồn tài nguyên được tải/chạy → **lớp chống XSS thứ hai**;
  tránh `'unsafe-inline'`/`'unsafe-eval'`, ưu tiên **nonce/hash**.
- Các header khác: `X-Frame-Options`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`.
- Dùng **Helmet** (Express) hoặc `headers()` (Next.js) để đặt nhanh và đúng.

Hết mục Transport & Headers. Mục cuối: **Secrets & Chuỗi cung ứng**.
