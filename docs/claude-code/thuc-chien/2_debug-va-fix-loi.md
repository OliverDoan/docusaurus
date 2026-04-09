---
sidebar_position: 2
title: "Debug va fix loi"
---

# Debug và fix lỗi

Claude Code rất mạnh trong việc tìm và fix bug. Bài này dạy cách tận dụng điều đó.

---

## 1. Fix lỗi TypeScript / Build

```
> Chạy npm run build và fix tất cả lỗi TypeScript
```

Claude Code sẽ:
1. Chạy build
2. Đọc error output
3. Tìm file lỗi
4. Sửa từng lỗi
5. Build lại để verify

---

## 2. Fix test fail

```
> Chạy npm test và fix những test bị fail
```

Claude Code sẽ:
1. Chạy tests
2. Đọc test output
3. Phân biệt: test sai hay code sai
4. Sửa code (hoặc test nếu test outdated)
5. Chạy test lại

---

## 3. Fix bug từ mô tả

Mô tả bug càng chi tiết → fix càng nhanh:

### Bug đơn giản

```
> Bug: Click nút "Thêm vào giỏ" không hoạt động trên trang ProductDetail
```

### Bug phức tạp

```
> Bug: User login thành công nhưng sau khi refresh trang thì bị logout.
  Expected: Sau refresh vẫn giữ trạng thái đăng nhập.
  Tôi đoán liên quan đến lưu token.
```

### Bug với error log

```
> Trang /dashboard báo lỗi này:
  "TypeError: Cannot read properties of undefined (reading 'map')"
  Fix giúp
```

Hoặc pipe log trực tiếp:

```bash
cat error.log | claude "giải thích và fix lỗi này"
```

---

## 4. Debug từng bước

Khi bug phức tạp, không rõ nguyên nhân:

```
> Bước 1: Giải thích luồng hoạt động khi user click "Submit Order"
  từ frontend đến backend

> Bước 2: Tìm chỗ nào có thể gây ra lỗi "Order not created"

> Bước 3: Thêm console.log vào các điểm nghi ngờ để debug

> Bước 4: (Sau khi chạy và thấy log) — Fix bug dựa trên thông tin debug
```

---

## 5. Fix performance

```
> Trang Products load chậm (3 giây).
  Phân tích và đề xuất cách tối ưu.
  Không thay đổi quá nhiều, chỉ fix phần quan trọng nhất.
```

```
> Component UserList re-render liên tục khi gõ search.
  Fix bằng useMemo/useCallback.
```

---

## 6. Pattern fix lỗi hiệu quả

```
Bước 1: Mô tả triệu chứng
        "Trang X hiện lỗi Y khi làm Z"

Bước 2: Cung cấp error message (nếu có)
        "Console báo: TypeError..."

Bước 3: Nói expected behavior
        "Đáng lẽ phải hiện danh sách users"

Bước 4: Để Claude Code fix
        → Review thay đổi
        → Test lại
```

---

## Tips debug

| Tip | Giải thích |
|-----|-----------|
| Paste error message | Claude Code hiểu error nhanh hơn mô tả |
| Nói expected behavior | "Đáng lẽ phải..." giúp Claude hiểu mục tiêu |
| Giới hạn phạm vi | "Chỉ fix file X" tránh sửa lan |
| Chạy test sau fix | Đảm bảo fix không gây bug mới |
| 1 bug = 1 prompt | Đừng gộp nhiều bug vào 1 prompt |
