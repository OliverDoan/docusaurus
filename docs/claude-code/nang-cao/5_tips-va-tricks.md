---
sidebar_position: 5
title: "Tips va tricks tong hop"
---

# Tips và tricks tổng hợp

Tổng hợp các tips hay nhất để dùng Claude Code hiệu quả hơn.

---

## 1. Pipe input vào Claude Code

```bash
# Pipe error log
cat error.log | claude "giải thích lỗi này"

# Pipe git diff để review
git diff | claude "review thay đổi này"

# Pipe PR để review
gh pr diff 42 | claude "review PR, chỉ ra vấn đề"

# Pipe test output
npm test 2>&1 | claude "fix tests bị fail"
```

---

## 2. One-shot commands

Chạy 1 lệnh rồi thoát (không cần interactive):

```bash
# Giải thích file
claude "giải thích cấu trúc project này" --print

# Fix nhanh
claude "fix lỗi TypeScript trong project"

# Generate
claude "tạo .gitignore cho project Node.js + TypeScript"
```

---

## 3. Tiếp tục session trước

```bash
# Tiếp tục đúng chỗ đã dừng
claude --continue

# Hữu ích khi: Terminal bị đóng, muốn tiếp task cũ
```

---

## 4. Dùng tiếng Việt hiệu quả

Claude Code hiểu tiếng Việt tốt. Một vài tips:

```
# Dùng tiếng Việt cho mô tả, tiếng Anh cho thuật ngữ
"Thêm middleware check authentication,
 nếu token expired thì trả 401 Unauthorized"

# Dùng tiếng Việt hoàn toàn cũng OK
"Tạo trang hiển thị danh sách sản phẩm,
 mỗi sản phẩm có tên, giá, ảnh.
 Có phân trang 10 sản phẩm mỗi trang."
```

---

## 5. Review trước khi accept

**Quy tắc số 1**: Luôn đọc diff trước khi chấp nhận.

```
Claude Code: "Tôi sẽ sửa file X..."
  [diff hiển thị]

Bạn:
  y → Chấp nhận (đã đọc và đồng ý)
  n → Từ chối ("Không, hãy làm cách khác...")
```

Đừng `y` liên tục mà không đọc. Claude Code mạnh nhưng không hoàn hảo.

---

## 6. Khi Claude Code sai

Claude Code có thể sai. Cách xử lý:

```
# Nói rõ sai ở đâu
> Cách này sai vì [lý do]. Hãy dùng [approach khác] thay thế.

# Undo thay đổi
> Undo thay đổi vừa rồi ở file X

# Chỉ hướng cụ thể
> Đừng dùng useEffect cho việc này. Hãy dùng useMemo thay thế.
```

---

## 7. Tối ưu chi phí

| Tip | Tiết kiệm |
|-----|-----------|
| Dùng Haiku cho task đơn giản | Chi phí thấp nhất |
| `/compact` thường xuyên | Ít token per request |
| Prompt ngắn gọn, rõ ràng | Ít token, kết quả tốt hơn |
| 1 session = 1 task | Tránh context dài không cần |
| Mention `@file` | Claude đọc đúng file, không search |

---

## 8. Workflow hàng ngày

```
Sáng:
  claude --continue          # Tiếp session hôm qua (nếu có)
  # hoặc
  claude                     # Session mới

Trong ngày:
  "Fix bug X"                → Test → Commit
  /compact                   → Giải phóng context
  "Thêm feature Y"          → Test → Commit
  /compact

Cuối ngày:
  "Commit và push thay đổi"
  /quit
```

---

## 9. Checklist dùng Claude Code hiệu quả

- [ ] Có CLAUDE.md trong project
- [ ] Prompt rõ ràng, có context
- [ ] `/compact` sau mỗi task
- [ ] Review diff trước khi accept
- [ ] Chạy test sau mỗi thay đổi
- [ ] Commit thường xuyên
- [ ] Dùng `@file` khi biết file cần sửa
- [ ] Chia task lớn thành nhiều prompt nhỏ
- [ ] Dùng model phù hợp (Haiku/Sonnet/Opus)

---

## 10. Tổng kết: 5 quy tắc vàng

| # | Quy tắc |
|---|---------|
| 1 | **Prompt rõ ràng** — Nói cụ thể cần gì, giới hạn phạm vi |
| 2 | **Review kết quả** — Đọc diff, đừng accept mù quáng |
| 3 | **Test thường xuyên** — Chạy test sau mỗi thay đổi |
| 4 | **Commit sớm** — Checkpoint thường xuyên |
| 5 | **Quản lý context** — `/compact`, chia session, CLAUDE.md ngắn |
