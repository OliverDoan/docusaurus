---
sidebar_position: 1
title: "1. Viet code voi Claude Code"
---

# Viết code với Claude Code

Bài này hướng dẫn workflow viết code hiệu quả: từ tạo file mới đến implement feature hoàn chỉnh.

---


---

## Mục lục

- [1. Tạo file mới](#1-tạo-file-mới)
- [2. Implement feature](#2-implement-feature)
- [3. Viết code theo pattern có sẵn](#3-viết-code-theo-pattern-có-sẵn)
- [4. Tạo types và interfaces](#4-tạo-types-và-interfaces)
- [5. Viết test](#5-viết-test)
- [6. Workflow khuyến nghị](#6-workflow-khuyến-nghị)
- [Tips](#tips)

---

## 1. Tạo file mới

```
> Tạo component Button với props: label, onClick, variant (primary/secondary), disabled
```

Claude Code sẽ:
1. Tạo file `Button.tsx`
2. Viết component với TypeScript types
3. Style theo pattern có sẵn trong project

**Tip**: Nếu project có sẵn component tương tự, nói rõ:

```
> Tạo component Button giống style của @src/components/Card.tsx
```

---

## 2. Implement feature

### Bước 1: Mô tả feature

```
> Thêm chức năng tìm kiếm sản phẩm:
  - Input search ở đầu trang Products
  - Lọc realtime khi gõ (debounce 300ms)
  - Hiển thị "Không tìm thấy" khi không có kết quả
```

### Bước 2: Review thay đổi

Claude Code sẽ hiện diff cho mỗi file:

```diff
+ import { useState } from 'react';
+ import { useDebounce } from '../hooks/useDebounce';
+
+ const [searchTerm, setSearchTerm] = useState('');
+ const debouncedSearch = useDebounce(searchTerm, 300);
```

**Bạn chọn**: `y` (chấp nhận) hoặc `n` (từ chối và yêu cầu sửa lại).

### Bước 3: Test

```
> Chạy test xem có gì bị fail không
```

---

## 3. Viết code theo pattern có sẵn

Claude Code hiểu pattern của project. Tận dụng điều này:

```
> Tạo page ProductDetail giống cấu trúc như @src/pages/UserDetail.tsx
  nhưng cho entity Product thay vì User

> Thêm endpoint DELETE /api/products/:id
  theo pattern như @src/api/users.ts
```

---

## 4. Tạo types và interfaces

```
> Tạo TypeScript types cho entity Order gồm:
  id, userId, items (array of {productId, quantity, price}),
  total, status (pending/confirmed/shipped/delivered), createdAt
```

---

## 5. Viết test

```
> Viết unit test cho function calculateTotal ở @src/utils/cart.ts
  Cover: giỏ hàng trống, 1 item, nhiều items, discount

> Viết test cho component @src/components/LoginForm.tsx
  Test: render, validation, submit thành công, submit lỗi
```

---

## 6. Workflow khuyến nghị

```
1. Mô tả feature rõ ràng
2. Để Claude Code implement
3. Review từng file thay đổi (y/n)
4. "Chạy test" → Fix nếu fail
5. "Chạy build" → Fix nếu lỗi TypeScript
6. Test thủ công trên browser
7. "Commit thay đổi"
```

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Cho ví dụ mẫu | "Giống như component X" |
| Chỉ rõ file | Mention `@file` |
| Review từng bước | Đừng accept tất cả không đọc |
| Chạy test sau mỗi feature | Phát hiện bug sớm |
| Commit thường xuyên | Dễ rollback nếu sai |
