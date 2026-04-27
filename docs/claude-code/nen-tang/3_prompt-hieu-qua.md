---
sidebar_position: 3
title: "3. Viet prompt hieu qua"
---

# Viết prompt hiệu quả

Prompt tốt = kết quả tốt. Bài này dạy bạn cách "ra lệnh" cho Claude Code đúng cách.

---


---

## Mục lục

- [1. Nguyên tắc vàng](#1-nguyên-tắc-vàng)
- [2. Các loại prompt hay dùng](#2-các-loại-prompt-hay-dùng)
- [3. Kỹ thuật prompt nâng cao](#3-kỹ-thuật-prompt-nâng-cao)
- [4. Prompt tiếng Việt vs tiếng Anh](#4-prompt-tiếng-việt-vs-tiếng-anh)
- [5. Những sai lầm phổ biến](#5-những-sai-lầm-phổ-biến)
- [6. Template prompt hay dùng](#6-template-prompt-hay-dùng)
- [Tổng kết](#tổng-kết)

---

## 1. Nguyên tắc vàng

### Rõ ràng > Ngắn gọn

```
❌ "Fix cái form"
✅ "Fix bug: form đăng ký không validate email trước khi submit"

❌ "Thêm feature"
✅ "Thêm nút dark mode toggle vào header, lưu preference vào localStorage"
```

### Nói MỤC ĐÍCH, không chỉ hành động

```
❌ "Thêm try-catch vào function fetchUsers"
✅ "Xử lý lỗi khi API /users trả về 500, hiện thông báo 'Lỗi server' cho user"
```

### Cho context khi cần

```
❌ "Tại sao build lỗi?"
✅ "Chạy npm run build bị lỗi TypeScript, fix giúp tôi"
```

---

## 2. Các loại prompt hay dùng

### Hỏi về codebase

```
"Giải thích cấu trúc thư mục project này"
"File nào xử lý authentication?"
"Function calculateTotal hoạt động như thế nào?"
"Tìm tất cả chỗ gọi API /users"
```

### Viết code mới

```
"Tạo component ProductCard hiển thị tên, giá, ảnh sản phẩm"
"Thêm endpoint POST /api/orders với validation bằng Zod"
"Viết unit test cho function formatCurrency"
```

### Fix bug

```
"Chạy test và fix những test bị fail"
"Nút submit bấm 2 lần tạo 2 order, fix giúp"
"Build bị lỗi TypeScript, sửa hết giúp"
```

### Refactor

```
"Refactor file UserService.ts, tách thành nhiều file nhỏ hơn"
"Chuyển component này từ class sang function component"
"Xoá code không dùng trong thư mục utils/"
```

### Git

```
"Commit những thay đổi vừa rồi"
"Tạo PR với title và description"
"Review PR #15, chỉ ra vấn đề"
```

---

## 3. Kỹ thuật prompt nâng cao

### Chain of thought — Chia nhỏ task lớn

Thay vì:
```
"Tạo hệ thống authentication hoàn chỉnh"
```

Chia thành:
```
"Bước 1: Tạo model User với email và password (hashed)"
"Bước 2: Tạo endpoint POST /auth/register"
"Bước 3: Tạo endpoint POST /auth/login trả về JWT"
"Bước 4: Tạo middleware verifyToken"
```

### Ví dụ mẫu — Cho Claude Code thấy output mong muốn

```
"Tạo function formatPrice, ví dụ:
  formatPrice(1000000) → '1.000.000 ₫'
  formatPrice(500) → '500 ₫'
  formatPrice(0) → 'Miễn phí'"
```

### Giới hạn phạm vi — Tránh Claude Code sửa quá nhiều

```
"Chỉ sửa file src/components/Header.tsx, không sửa file khác"
"Fix lỗi TypeScript trong thư mục src/utils/ thôi"
"Thêm field phone vào form, KHÔNG thay đổi styling"
```

---

## 4. Prompt tiếng Việt vs tiếng Anh

Claude Code hiểu **cả hai**. Dùng gì cũng được:

```
# Tiếng Việt
"Thêm validation cho form đăng ký: email phải hợp lệ, mật khẩu ít nhất 8 ký tự"

# Tiếng Anh
"Add validation to signup form: valid email, password min 8 chars"

# Mix (phổ biến nhất)
"Thêm error handling cho API calls, dùng try-catch và show toast notification"
```

**Tip**: Dùng tiếng Anh cho thuật ngữ kỹ thuật, tiếng Việt cho phần giải thích.

---

## 5. Những sai lầm phổ biến

### Prompt quá mơ hồ

```
❌ "Cải thiện code"
❌ "Làm cho tốt hơn"
❌ "Fix bug"

✅ "Cải thiện performance: memoize danh sách products để tránh re-render"
✅ "Fix bug: click nút Delete không xoá item khỏi danh sách"
```

### Prompt quá rộng

```
❌ "Viết lại toàn bộ project theo best practices"
   → Claude Code sẽ sửa hàng chục file, khó review

✅ "Refactor component UserList: tách logic ra custom hook useUsers"
   → Phạm vi rõ ràng, dễ kiểm tra kết quả
```

### Không kiểm tra kết quả

```
❌ Gõ prompt → Accept hết → Next task
✅ Gõ prompt → Review thay đổi → Test → Chấp nhận
```

---

## 6. Template prompt hay dùng

```
# Feature mới
"Thêm [feature] vào [component/page].
 Yêu cầu: [chi tiết].
 Không thay đổi [phạm vi giới hạn]."

# Fix bug
"Bug: [mô tả hiện tượng].
 Expected: [kết quả mong muốn].
 File liên quan: [nếu biết]."

# Refactor
"Refactor [file/component]: [mục tiêu].
 Giữ nguyên behavior hiện tại."

# Test
"Viết unit test cho [function/component].
 Cover các case: [liệt kê]."
```

---

## Tổng kết

| Nguyên tắc | Ví dụ |
|-----------|-------|
| **Rõ ràng** | Nói cụ thể cần gì |
| **Có context** | Mô tả bug, expected behavior |
| **Giới hạn phạm vi** | Chỉ sửa file X, không động Y |
| **Chia nhỏ** | Task lớn → nhiều prompt nhỏ |
| **Cho ví dụ** | Input → Output mong muốn |
| **Review kết quả** | Luôn kiểm tra trước khi accept |
