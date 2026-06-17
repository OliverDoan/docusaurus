---
sidebar_position: 1
title: "1. Authentication & Authorization"
---

# Authentication & Authorization

Hai khái niệm nghe giống nhau nhưng khác hẳn: **authentication** (xác thực — *bạn
là ai?*) và **authorization** (phân quyền — *bạn được làm gì?*). Hiểu sai hoặc làm
ẩu hai phần này dẫn tới **Broken Access Control** — rủi ro đứng đầu OWASP. Bài này
phân biệt rõ và nêu các lỗi phân quyền thường gặp cùng cách phòng.

---

## Mục lục

- [Phân biệt Authentication vs Authorization](#phân-biệt-authentication-vs-authorization)
- [Broken Access Control — rủi ro số 1](#broken-access-control--rủi-ro-số-1)
- [Lỗi điển hình: IDOR](#lỗi-điển-hình-idor)
- [Kiểm tra quyền ở đâu?](#kiểm-tra-quyền-ở-đâu)
- [Các mô hình phân quyền](#các-mô-hình-phân-quyền)
- [Chống brute-force khi đăng nhập](#chống-brute-force-khi-đăng-nhập)
- [Tóm tắt](#tóm-tắt)

---

## Phân biệt Authentication vs Authorization

| | Authentication (AuthN) | Authorization (AuthZ) |
| --- | --- | --- |
| Trả lời | *Bạn là ai?* | *Bạn được phép làm gì?* |
| Xảy ra khi | Đăng nhập, xác minh danh tính | Mỗi lần truy cập tài nguyên |
| Ví dụ | Nhập email + mật khẩu đúng | Chỉ admin mới xoá được bài viết |
| Kết quả | Xác định danh tính | Cho phép / từ chối hành động |

> Thứ tự: **xác thực trước, phân quyền sau**. Biết bạn là ai (AuthN) rồi mới quyết
> định bạn được làm gì (AuthZ).

## Broken Access Control — rủi ro số 1

**Broken Access Control** (kiểm soát truy cập hỏng) là khi người dùng làm được
việc **ngoài quyền** của họ — đây là rủi ro đứng đầu OWASP Top 10 hiện nay.

Ví dụ kinh điển: ẩn nút "Xoá" trên giao diện với người dùng thường, nhưng **API
xoá lại không kiểm tra quyền** ở server. Kẻ tấn công gọi thẳng API là xoá được.

:::danger Bảo mật ở client KHÔNG phải bảo mật
Ẩn nút, vô hiệu hoá menu, kiểm tra quyền bằng JavaScript trên trình duyệt — tất
cả chỉ là **trải nghiệm**, không phải bảo mật. Kẻ tấn công bỏ qua giao diện và gọi
thẳng API. **Mọi kiểm tra quyền phải nằm ở server.**
:::

## Lỗi điển hình: IDOR

**IDOR** (Insecure Direct Object Reference — tham chiếu đối tượng trực tiếp không
an toàn) là dạng phổ biến nhất của Broken Access Control: server cho truy cập tài
nguyên **chỉ dựa vào ID** mà **không kiểm tra ID đó có thuộc về người dùng hiện
tại không**.

```js
// LỖ HỔNG: ai có orderId là xem được, kể cả đơn của người khác
app.get('/orders/:id', async (req, res) => {
  const order = await db.getOrder(req.params.id)
  res.json(order) // không kiểm tra order.userId === người đang đăng nhập!
})

// Kẻ tấn công đổi /orders/123 → /orders/124 để xem đơn người khác
```

```js
// ĐÚNG: luôn kiểm tra quyền sở hữu
app.get('/orders/:id', requireAuth, async (req, res) => {
  const order = await db.getOrder(req.params.id)
  if (!order || order.userId !== req.user.id) {
    return res.status(404).send('Không tìm thấy') // 404 để không lộ sự tồn tại
  }
  res.json(order)
})
```

> Mẹo: trả **404** (không tìm thấy) thay vì **403** (cấm) khi người dùng không có
> quyền, để không tiết lộ rằng tài nguyên đó tồn tại.

## Kiểm tra quyền ở đâu?

- **Luôn ở phía server**, tại **mỗi endpoint** truy cập tài nguyên.
- **Mặc định từ chối** (deny by default): chưa cấp quyền rõ ràng thì không cho.
- Kiểm tra **cả quyền hành động lẫn quyền sở hữu** (được làm hành động này + trên
  đúng tài nguyên của mình).

```js
// Middleware kiểm tra vai trò, mặc định từ chối
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send('Không đủ quyền')
    }
    next()
  }
}

app.delete('/posts/:id', requireAuth, requireRole('admin'), deletePost)
```

## Các mô hình phân quyền

| Mô hình | Ý tưởng | Hợp với |
| --- | --- | --- |
| **RBAC** (Role-Based) | Phân quyền theo **vai trò** (admin, editor, user) | Đa số ứng dụng |
| **ABAC** (Attribute-Based) | Theo **thuộc tính** (phòng ban, giờ, vị trí...) | Quy tắc phức tạp |
| **ReBAC** (Relationship-Based) | Theo **quan hệ** (chủ sở hữu, thành viên nhóm) | Chia sẻ tài nguyên, cộng tác |

> Bắt đầu với **RBAC** cho đơn giản; nâng lên ABAC/ReBAC khi nhu cầu phức tạp hơn.

## Chống brute-force khi đăng nhập

Xác thực mạnh tới đâu cũng vô nghĩa nếu kẻ tấn công **thử mật khẩu vô hạn lần**.
Cần:

- **Rate limiting** (giới hạn số lần) cho endpoint đăng nhập (xem mục 5).
- **Khoá tạm** tài khoản/IP sau nhiều lần sai liên tiếp.
- **MFA** (Multi-Factor Authentication — xác thực đa yếu tố): thêm yếu tố thứ hai
  (mã OTP, app authenticator) ngoài mật khẩu.
- **Thông báo lỗi mơ hồ**: nói "email hoặc mật khẩu sai", đừng nói rõ "email không
  tồn tại" (tránh lộ email nào đã đăng ký).

## Tóm tắt

- **Authentication** = *bạn là ai*; **Authorization** = *bạn được làm gì*. Xác
  thực trước, phân quyền sau.
- **Broken Access Control** là rủi ro số 1; **mọi kiểm tra quyền phải ở server**,
  client chỉ là trải nghiệm.
- **IDOR**: luôn kiểm tra **quyền sở hữu** tài nguyên, không chỉ dựa vào ID; trả
  404 để không lộ sự tồn tại.
- Kiểm tra quyền tại **mỗi endpoint**, **mặc định từ chối**; chọn mô hình **RBAC**
  (đơn giản) → ABAC/ReBAC (phức tạp).
- Chống brute-force: **rate limit, khoá tạm, MFA, thông báo lỗi mơ hồ**.

Bài tiếp theo: **Session, Cookie & JWT** — cách giữ trạng thái đăng nhập an toàn.
