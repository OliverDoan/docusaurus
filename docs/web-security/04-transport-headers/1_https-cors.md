---
sidebar_position: 1
title: "1. HTTPS, Same-Origin & CORS"
---

# HTTPS, Same-Origin & CORS

Bài này bàn về **tầng vận chuyển** và **chính sách nguồn gốc** của trình duyệt:
**HTTPS/TLS** (mã hoá đường truyền), **Same-Origin Policy** (luật cách ly giữa các
nguồn), và **CORS** (cơ chế nới lỏng luật đó một cách có kiểm soát). Ba thứ này
hay bị hiểu nhầm, đặc biệt CORS thường bị tưởng là "lỗi" thay vì "tính năng bảo
mật".

---

## Mục lục

- [HTTPS & TLS](#https--tls)
- [Same-Origin Policy](#same-origin-policy)
- [CORS là gì và KHÔNG là gì?](#cors-là-gì-và-không-là-gì)
- [Cấu hình CORS đúng cách](#cấu-hình-cors-đúng-cách)
- [Sai lầm CORS thường gặp](#sai-lầm-cors-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## HTTPS & TLS

**HTTPS** là HTTP chạy trên **TLS** (Transport Layer Security — lớp bảo mật vận
chuyển), mã hoá toàn bộ dữ liệu giữa trình duyệt và server. Nó đảm bảo:

- **Confidentiality** — kẻ nghe lén trên đường truyền không đọc được nội dung.
- **Integrity** — dữ liệu không bị sửa giữa đường.
- **Authentication** — chứng chỉ (certificate) xác minh bạn đang nói chuyện đúng
  server, không phải kẻ giả mạo.

Nếu không có HTTPS, tấn công **man-in-the-middle** (kẻ đứng giữa) có thể đọc và
sửa mọi thứ — kể cả đánh cắp cookie/mật khẩu.

> Ngày nay HTTPS là **bắt buộc**, không phải tuỳ chọn. Chứng chỉ miễn phí qua
> **Let's Encrypt**; nền tảng host hiện đại (Vercel, Netlify...) bật HTTPS sẵn.

Củng cố thêm bằng header **HSTS** (xem bài Security Headers): buộc trình duyệt
**luôn** dùng HTTPS cho domain của bạn.

## Same-Origin Policy

**Same-Origin Policy (SOP)** là luật nền tảng của trình duyệt: mặc định, một
trang chỉ được **đọc dữ liệu** từ **cùng origin** với nó. Đây là lý do một site
độc không thể tự ý đọc dữ liệu từ tài khoản ngân hàng đang mở của bạn ở tab khác.

**Origin** = bộ ba: **scheme + host + port**. Khác một trong ba → khác origin:

```text
https://app.com           (gốc)
https://app.com/profile   ✅ cùng origin (chỉ khác path)
http://app.com            ❌ khác scheme (http vs https)
https://api.app.com       ❌ khác host (subdomain)
https://app.com:8080      ❌ khác port
```

## CORS là gì và KHÔNG là gì?

**CORS** (Cross-Origin Resource Sharing — chia sẻ tài nguyên xuyên nguồn) là cơ
chế cho phép server **chủ động nới lỏng** Same-Origin Policy, để cho phép một số
origin khác được đọc phản hồi của mình.

:::warning Hiểu đúng về CORS
- CORS **KHÔNG** bảo vệ server của bạn — nó là luật của **trình duyệt** áp lên
  trang web khác. Kẻ tấn công dùng `curl`/script ngoài trình duyệt **bỏ qua CORS**
  hoàn toàn.
- "Lỗi CORS" bạn thấy ở console **không phải lỗ hổng** — đó là trình duyệt đang
  **bảo vệ người dùng** đúng như thiết kế.
- Nới lỏng CORS quá tay (`*`) mới là rủi ro, chứ bản thân CORS là tính năng an
  toàn.
:::

Khi trang ở origin A gọi API ở origin B, trình duyệt kiểm tra header
**`Access-Control-Allow-Origin`** từ B. Nếu B không cho phép A, trình duyệt
**chặn trang A đọc** phản hồi.

## Cấu hình CORS đúng cách

```js
// Express + cors: chỉ cho phép các origin tin cậy (KHÔNG dùng '*')
const cors = require('cors')

const allowedOrigins = ['https://app.mysite.com', 'https://admin.mysite.com']

app.use(cors({
  origin(origin, callback) {
    // Cho phép nếu origin nằm trong danh sách trắng
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS: origin không được phép'))
  },
  credentials: true, // cho phép gửi cookie kèm request cross-origin
}))
```

Nguyên tắc:

- **Danh sách trắng origin cụ thể**, không dùng `*` cho API có dữ liệu/đăng nhập.
- Khi cần gửi cookie (`credentials: true`), **không được** dùng `*` — trình duyệt
  bắt buộc origin phải cụ thể.
- Chỉ mở **các method/header thực sự cần**.

## Sai lầm CORS thường gặp

:::danger Đừng "tắt CORS" bằng cách mở toang
Gặp lỗi CORS, nhiều người vội đặt `Access-Control-Allow-Origin: *` **cùng với**
cho phép credentials, hoặc phản chiếu (reflect) bất kỳ origin nào gửi tới. Điều
này **vô hiệu hoá** lớp bảo vệ và có thể cho site độc đọc dữ liệu người dùng. Hãy
**luôn dùng danh sách trắng** origin cụ thể.
:::

- ❌ `Access-Control-Allow-Origin: *` cho API cần đăng nhập.
- ❌ Phản chiếu nguyên `Origin` header của request mà không kiểm tra.
- ❌ Tưởng CORS bảo vệ server (nó bảo vệ *người dùng trình duyệt*, không bảo vệ
  API khỏi client phi-trình-duyệt).

## Tóm tắt

- **HTTPS/TLS** mã hoá đường truyền (bảo mật + toàn vẹn + xác thực server), chống
  man-in-the-middle — nay là **bắt buộc**; củng cố bằng **HSTS**.
- **Same-Origin Policy** mặc định cách ly các **origin** (scheme + host + port) —
  nền tảng an toàn của trình duyệt.
- **CORS** cho server **nới lỏng có kiểm soát** SOP; nó bảo vệ **người dùng trình
  duyệt**, **không** bảo vệ API khỏi client ngoài trình duyệt.
- Cấu hình CORS bằng **danh sách trắng origin cụ thể**, không `*` cho API có dữ
  liệu/đăng nhập; cẩn thận với `credentials`.

Bài tiếp theo: **Security Headers & CSP** — các header tăng cường bảo mật.
