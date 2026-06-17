---
sidebar_position: 2
title: "2. CSRF (Cross-Site Request Forgery)"
---

# CSRF — Cross-Site Request Forgery

**CSRF** (Cross-Site Request Forgery — giả mạo yêu cầu xuyên trang) là tấn công
**lừa trình duyệt của nạn nhân tự gửi một request** tới site mà nạn nhân đang đăng
nhập, để thực hiện hành động ngoài ý muốn. Bài này giải thích cơ chế tấn công và
các cách phòng thủ hiện đại: **SameSite cookie**, **CSRF token**, và kiểm tra
nguồn gốc request.

---

## Mục lục

- [CSRF hoạt động thế nào?](#csrf-hoạt-động-thế-nào)
- [Vì sao tấn công thành công?](#vì-sao-tấn-công-thành-công)
- [Phòng thủ 1: SameSite cookie](#phòng-thủ-1-samesite-cookie)
- [Phòng thủ 2: CSRF token](#phòng-thủ-2-csrf-token)
- [Phòng thủ 3: kiểm tra Origin/Referer](#phòng-thủ-3-kiểm-tra-originreferer)
- [CSRF vs XSS](#csrf-vs-xss)
- [Tóm tắt](#tóm-tắt)

---

## CSRF hoạt động thế nào?

Hãy hình dung nạn nhân đang đăng nhập `bank.com` (cookie phiên còn hiệu lực). Kẻ
tấn công dụ họ truy cập trang độc `evil.com`, trong đó có:

```html
<!-- Trên evil.com: tự động gửi request chuyển tiền tới bank.com -->
<form action="https://bank.com/transfer" method="POST" id="f">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000000" />
</form>
<script>document.getElementById('f').submit()</script>
```

Khi trang evil.com tải, form **tự submit** tới `bank.com`. Trình duyệt **tự động
đính kèm cookie** của `bank.com` vào request → server tưởng đây là yêu cầu hợp lệ
của nạn nhân và thực hiện chuyển tiền.

> Điểm cốt lõi: kẻ tấn công **không cần đọc** cookie — chúng chỉ cần trình duyệt
> *tự gửi kèm* cookie như thường lệ.

## Vì sao tấn công thành công?

Vì hai điều cộng lại:

1. Trình duyệt **tự động gửi cookie** theo mọi request tới đúng domain, kể cả khi
   request bắt nguồn từ một site khác.
2. Server **chỉ dựa vào cookie** để xác định danh tính, mà **không kiểm tra
   request có thực sự đến từ giao diện của mình hay không**.

## Phòng thủ 1: SameSite cookie

Thuộc tính **`SameSite`** trên cookie kiểm soát việc cookie có được gửi kèm khi
request đến từ **site khác** hay không:

| Giá trị | Hành vi |
| --- | --- |
| `Strict` | Không bao giờ gửi cookie cho request từ site khác |
| `Lax` | Chỉ gửi với điều hướng GET top-level (vd click link), không gửi cho POST từ site khác |
| `None` | Luôn gửi (bắt buộc kèm `Secure`) — dùng khi cần cross-site thật sự |

```js
// Express: đặt cookie phiên an toàn chống CSRF
res.cookie('session', token, {
  httpOnly: true,   // JS không đọc được (chống XSS đánh cắp)
  secure: true,     // chỉ gửi qua HTTPS
  sameSite: 'lax',  // chống CSRF cho hầu hết trường hợp
})
```

> **`SameSite=Lax`** (mặc định của trình duyệt hiện đại) đã chặn được phần lớn
> CSRF kiểu POST. Đây là lớp phòng thủ nền tảng nên luôn bật.

## Phòng thủ 2: CSRF token

**CSRF token** (token chống CSRF, còn gọi *synchronizer token*) là một giá trị
ngẫu nhiên, bí mật mà **chỉ giao diện hợp lệ của bạn mới biết**. Server cấp token,
nhúng vào form, và **kiểm tra lại** khi nhận request:

```js
// Server cấp token (gắn với phiên) và nhúng vào form
const csrfToken = generateRandomToken()
// <input type="hidden" name="_csrf" value="{{csrfToken}}" />

// Khi nhận POST: token trong body phải khớp token của phiên
function verifyCsrf(req, res, next) {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send('CSRF token không hợp lệ')
  }
  next()
}
```

Site `evil.com` **không thể đoán** token này (và không đọc được do same-origin
policy), nên request giả mạo sẽ bị từ chối.

> Nhiều framework có sẵn cơ chế này. Một biến thể phổ biến cho SPA là
> **double-submit cookie**: gửi token vừa trong cookie vừa trong header, server
> kiểm tra hai giá trị khớp nhau.

## Phòng thủ 3: kiểm tra Origin/Referer

Server có thể kiểm tra header **`Origin`** (hoặc `Referer`) để chắc rằng request
đến từ chính domain của mình:

```js
function checkOrigin(req, res, next) {
  const origin = req.get('origin') || req.get('referer') || ''
  if (!origin.startsWith('https://myapp.com')) {
    return res.status(403).send('Nguồn request không hợp lệ')
  }
  next()
}
```

> Đây là lớp **bổ sung**, không thay thế hai cách trên (header có thể thiếu trong
> vài trường hợp). Kết hợp nhiều lớp = phòng thủ nhiều lớp.

## CSRF vs XSS

Hai cái hay bị nhầm nhưng khác hẳn nhau:

| | CSRF | XSS |
| --- | --- | --- |
| Kẻ tấn công làm gì | Lừa trình duyệt **gửi request** thay nạn nhân | Chạy **script** trong trình duyệt nạn nhân |
| Cần đọc dữ liệu? | Không (chỉ cần trình duyệt gửi cookie) | Có (đọc được cookie/DOM...) |
| Phòng thủ chính | SameSite cookie, CSRF token | Escape/sanitize output, CSP |

> Lưu ý: nếu site dính **XSS**, kẻ tấn công thường **vượt qua được** mọi biện pháp
> chống CSRF (vì script chạy ngay trong origin của bạn). Vì vậy chống XSS là ưu
> tiên hàng đầu.

## Tóm tắt

- **CSRF** lừa trình duyệt nạn nhân **tự gửi request** (kèm cookie) tới site họ
  đang đăng nhập, thực hiện hành động ngoài ý muốn — không cần đọc cookie.
- Nguyên nhân: trình duyệt tự gửi cookie + server chỉ dựa vào cookie để xác thực.
- Phòng thủ: **`SameSite` cookie** (nền tảng), **CSRF token** (synchronizer /
  double-submit), và **kiểm tra Origin/Referer** (bổ sung).
- **CSRF ≠ XSS**; và XSS có thể phá vỡ phòng thủ CSRF → ưu tiên chống XSS trước.

Bài tiếp theo: **Injection** — SQL injection và command injection.
