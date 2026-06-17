---
sidebar_position: 2
title: "2. Session, Cookie & JWT"
---

# Session, Cookie & JWT

Sau khi đăng nhập, làm sao server "nhớ" được bạn ở các request sau? Bài này so
sánh hai cách giữ phiên phổ biến — **session phía server** và **JWT** (token tự
chứa) — cùng cách cấu hình **cookie an toàn**. Hiểu rõ giúp bạn chọn đúng và tránh
các lỗi lưu token nguy hiểm.

---

## Mục lục

- [Vấn đề: HTTP không có trạng thái](#vấn-đề-http-không-có-trạng-thái)
- [Cách 1: Session phía server](#cách-1-session-phía-server)
- [Cách 2: JWT (token tự chứa)](#cách-2-jwt-token-tự-chứa)
- [Cookie an toàn](#cookie-an-toàn)
- [Lưu token ở đâu? Cookie vs localStorage](#lưu-token-ở-đâu-cookie-vs-localstorage)
- [So sánh & khi nào dùng gì](#so-sánh--khi-nào-dùng-gì)
- [Tóm tắt](#tóm-tắt)

---

## Vấn đề: HTTP không có trạng thái

**HTTP là stateless** (không trạng thái): mỗi request độc lập, server không tự
nhớ request trước. Vậy sau khi đăng nhập, cần một cơ chế để chứng minh "tôi là
người vừa đăng nhập" ở các request sau. Có hai hướng chính.

## Cách 1: Session phía server

Server tạo một **session** (phiên) lưu trong bộ nhớ/DB/Redis, rồi gửi cho client
một **session ID** (thường qua cookie). Mỗi request sau, client gửi kèm ID này,
server tra ngược ra danh tính.

```text
Đăng nhập → server tạo session {id: abc, userId: 7} và lưu lại
         → trả cookie: session=abc
Request sau → client gửi cookie session=abc
            → server tra abc → biết userId = 7
```

- ✅ **Thu hồi dễ**: xoá session ở server là người dùng bị đăng xuất ngay.
- ✅ Session ID không chứa dữ liệu → không lộ thông tin.
- ❌ Server phải **lưu trạng thái** (cần Redis/DB khi scale nhiều máy).

## Cách 2: JWT (token tự chứa)

**JWT** (JSON Web Token) là một token **tự chứa thông tin** và **được ký số**.
Server không cần lưu gì — chỉ cần **xác minh chữ ký** là tin được nội dung.

Cấu trúc JWT gồm 3 phần ngăn bởi dấu `.`:

```text
header.payload.signature
  │       │        └─ chữ ký (ký bằng secret/khoá riêng của server)
  │       └─ payload: dữ liệu (vd userId, role, hạn dùng) — chỉ ĐƯỢC MÃ HOÁ BASE64, KHÔNG bí mật!
  └─ header: thuật toán ký
```

:::warning Payload của JWT KHÔNG bí mật
Phần payload chỉ được **encode base64**, ai cũng giải mã đọc được. **Đừng bao giờ
đặt dữ liệu nhạy cảm** (mật khẩu, thông tin thẻ) trong JWT. Chữ ký chỉ đảm bảo
*toàn vẹn* (không bị sửa), không đảm bảo *bí mật*.
:::

- ✅ **Không cần lưu trạng thái** → hợp hệ phân tán, nhiều dịch vụ.
- ❌ **Khó thu hồi**: token còn hạn là còn hiệu lực, dù người dùng đã "đăng xuất".
  Phải dùng thêm cơ chế (danh sách đen, hạn ngắn + refresh token).

```js
// Phát và xác minh JWT (jsonwebtoken)
import jwt from 'jsonwebtoken'

const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: '15m', // hạn NGẮN để giảm rủi ro khi token bị lộ
})

// Xác minh ở mỗi request
const payload = jwt.verify(token, process.env.JWT_SECRET) // ném lỗi nếu sai/hết hạn
```

> Mẫu phổ biến: **access token** hạn ngắn (vài phút) + **refresh token** hạn dài
> (lưu an toàn) để cấp lại access token. Giúp dung hoà giữa tiện và an toàn.

## Cookie an toàn

Dù dùng session hay JWT, **gửi token qua cookie có các cờ an toàn** là lựa chọn
tốt:

```js
res.cookie('session', value, {
  httpOnly: true,   // JavaScript KHÔNG đọc được → chống XSS đánh cắp token
  secure: true,     // chỉ gửi qua HTTPS → chống nghe lén
  sameSite: 'lax',  // chống CSRF (xem bài CSRF)
  maxAge: 1000 * 60 * 60, // thời hạn
  path: '/',
})
```

| Cờ | Bảo vệ khỏi |
| --- | --- |
| `httpOnly` | XSS đánh cắp token (JS không đọc được cookie) |
| `secure` | Nghe lén qua HTTP (chỉ gửi trên HTTPS) |
| `sameSite` | CSRF (không gửi cookie cho request cross-site) |

## Lưu token ở đâu? Cookie vs localStorage

Một câu hỏi gây tranh cãi cho SPA. So sánh:

| | Cookie `httpOnly` | `localStorage` |
| --- | --- | --- |
| JS đọc được? | **Không** | Có |
| Chống XSS đánh cắp | ✅ Tốt | ❌ Kém (XSS đọc thẳng được) |
| Tự gửi kèm request | Có (cần lo CSRF) | Không (tự gắn header) |

:::tip Ưu tiên cookie `httpOnly` cho token nhạy cảm
Lưu token trong `localStorage` khiến **bất kỳ lỗ hổng XSS nào cũng đánh cắp được
token** ngay lập tức. Cookie `httpOnly` an toàn hơn trước XSS (đổi lại phải lo
CSRF bằng `SameSite` + CSRF token). Nhìn chung, **cookie `httpOnly` được khuyến
nghị** cho token phiên.
:::

## So sánh & khi nào dùng gì

| | Session phía server | JWT |
| --- | --- | --- |
| Trạng thái | Lưu ở server | Không cần (tự chứa) |
| Thu hồi | Dễ (xoá session) | Khó (cần danh sách đen / hạn ngắn) |
| Scale ngang | Cần store chung (Redis) | Dễ (không state) |
| Phù hợp | App truyền thống, cần thu hồi nhanh | API/microservices, hệ phân tán |

> Không có lựa chọn "đúng tuyệt đối". App đơn giản, cần kiểm soát phiên chặt →
> **session**. Hệ nhiều dịch vụ, cần không-trạng-thái → **JWT** (kèm refresh token
> + hạn ngắn).

## Tóm tắt

- HTTP **không trạng thái** → cần cơ chế nhớ đăng nhập: **session** hoặc **JWT**.
- **Session phía server**: thu hồi dễ, nhưng phải lưu trạng thái (Redis khi scale).
- **JWT**: tự chứa, không cần lưu, hợp hệ phân tán; nhưng **khó thu hồi** và
  **payload không bí mật** — dùng hạn ngắn + refresh token.
- **Cookie an toàn** cần `httpOnly` + `secure` + `sameSite`.
- **Ưu tiên cookie `httpOnly`** hơn `localStorage` cho token (chống XSS đánh cắp).

Bài tiếp theo: **lưu mật khẩu an toàn** — hashing đúng cách.
