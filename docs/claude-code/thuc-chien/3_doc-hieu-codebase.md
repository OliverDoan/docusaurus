---
sidebar_position: 3
title: "Doc hieu codebase"
---

# Đọc hiểu codebase

Vào project mới mà không hiểu gì? Claude Code giúp bạn hiểu codebase nhanh gấp 10 lần đọc thủ công.

---

## 1. Tổng quan project

```
> Giải thích cấu trúc thư mục project này.
  Mỗi thư mục chính chứa gì, làm gì?

> Tech stack project này là gì?
  Framework, database, state management?

> File entry point là file nào?
  Luồng khởi động ứng dụng như thế nào?
```

---

## 2. Hiểu 1 feature cụ thể

```
> Giải thích luồng authentication:
  Từ khi user nhấn Login → đến khi hiện trang Dashboard

> Flow thanh toán (checkout) đi qua những file nào?
  Liệt kê theo thứ tự

> API endpoint GET /api/products hoạt động thế nào?
  Từ route → controller → service → database
```

---

## 3. Hiểu 1 file / function

```
> Giải thích file @src/middleware/auth.ts
  Mỗi function làm gì?

> Function processOrder ở @src/services/order.ts
  hoạt động từng bước như thế nào?

> File @src/utils/helpers.ts có function nào không dùng?
```

---

## 4. Tìm code liên quan

```
> Tìm tất cả nơi sử dụng component UserCard

> File nào import từ @src/utils/format.ts?

> Tìm tất cả API calls đến endpoint /api/users

> Chỗ nào trong code gọi localStorage?
```

---

## 5. So sánh và đánh giá

```
> So sánh cách xử lý error trong @src/api/users.ts
  và @src/api/products.ts. Có nhất quán không?

> Review file @src/components/Dashboard.tsx
  Chỉ ra code smell hoặc cần cải thiện gì?

> Liệt kê dependencies không dùng trong package.json
```

---

## 6. Onboarding nhanh

Khi vào project mới, chạy lần lượt:

```
Prompt 1: "Tóm tắt project này trong 5 dòng:
           tech stack, mục đích, kiến trúc chính"

Prompt 2: "Liệt kê 10 file quan trọng nhất
           và vai trò của mỗi file"

Prompt 3: "Giải thích luồng chính của ứng dụng:
           user mở app → thấy gì → làm gì"

Prompt 4: "Conventions trong project:
           naming, folder structure, patterns"
```

Sau 4 prompt, bạn đã hiểu project đủ để bắt đầu code.

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Hỏi tổng quan trước | Hiểu big picture rồi mới đi sâu |
| Hỏi theo luồng | "Khi user click X → chuyện gì xảy ra?" |
| Dùng `@file` | Chỉ rõ file muốn hiểu |
| Hỏi "file nào?" | Để Claude tìm thay vì tự tìm |
| Ghi note | Lưu lại output để tham khảo sau |
