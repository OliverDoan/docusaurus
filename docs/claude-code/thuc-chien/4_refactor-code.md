---
sidebar_position: 4
title: "Refactor code"
---

# Refactor code

Refactor = cải thiện code mà không thay đổi behavior. Claude Code rất phù hợp cho việc này vì nó hiểu toàn bộ codebase.

---

## 1. Tách file lớn

```
> File @src/services/UserService.ts đang 500 dòng, quá lớn.
  Tách thành nhiều file nhỏ theo chức năng.
  Giữ nguyên behavior, đảm bảo imports ở các file khác vẫn hoạt động.
```

---

## 2. Extract logic ra hook / utility

```
> Component @src/pages/Products.tsx đang chứa quá nhiều logic.
  Extract phần fetch + filter + sort ra custom hook useProducts.

> Có 3 components đều có logic format tiền VNĐ giống nhau.
  Tạo utility function formatCurrency và refactor cả 3.
```

---

## 3. Cải thiện naming

```
> Review naming trong thư mục @src/utils/.
  Đổi tên function/variable mơ hồ thành tên rõ ràng hơn.
  Liệt kê thay đổi trước khi sửa.
```

---

## 4. Xoá code chết

```
> Tìm và liệt kê code không dùng trong project:
  - Components không import ở đâu
  - Functions không gọi
  - Dependencies không dùng trong package.json

> Xoá code chết trong thư mục src/utils/, giữ nguyên code đang dùng
```

---

## 5. Modernize code

```
> Chuyển component @src/components/UserList.tsx
  từ class component sang function component với hooks.
  Giữ nguyên behavior.

> Thay thế tất cả callback hell bằng async/await
  trong thư mục @src/api/

> Chuyển CommonJS (require) sang ES modules (import)
  trong thư mục @src/utils/
```

---

## 6. Cải thiện type safety

```
> Tìm tất cả chỗ dùng `any` trong project.
  Thay bằng type cụ thể.

> Thêm TypeScript types cho API responses
  trong thư mục @src/api/
```

---

## 7. Quy tắc refactor an toàn

| Quy tắc | Lý do |
|---------|-------|
| **Chạy test trước** refactor | Biết baseline |
| **Refactor từng bước nhỏ** | Dễ rollback |
| **Chạy test sau** mỗi bước | Phát hiện regression |
| **Commit sau** mỗi bước thành công | Checkpoint |
| **Không đổi behavior** | Refactor ≠ feature mới |

### Workflow

```
1. "Chạy test, đảm bảo tất cả pass"
2. "Refactor [mô tả]"
3. "Chạy test lại, fix nếu có lỗi"
4. "Commit refactor này"
5. Lặp lại cho bước tiếp theo
```

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| 1 refactor = 1 commit | Dễ review, dễ rollback |
| Nói "giữ behavior" | Nhắc Claude không thêm feature |
| Review kỹ diff | Refactor sai có thể gây bug ẩn |
| Refactor nhỏ trước | Naming → Extract → Restructure |
| Test coverage cao = refactor an toàn | Có test = an tâm sửa |
