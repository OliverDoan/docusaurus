---
sidebar_position: 5
title: "5. Quan ly context hieu qua"
---

# Quản lý context hiệu quả

Context window là "bộ nhớ ngắn hạn" của Claude Code. Quản lý tốt = kết quả tốt hơn, ít lỗi hơn.

---

## 1. Context window là gì?

Claude Code có giới hạn lượng thông tin có thể "nhớ" trong 1 session:

```
┌─────────────────────────────────────┐
│         Context Window               │
│                                      │
│  System prompt (CLAUDE.md, rules)    │
│  + Lịch sử hội thoại                │
│  + File đã đọc                       │
│  + Output của lệnh đã chạy          │
│  + Code đã sửa                       │
│                                      │
│  → Càng chat nhiều → Càng đầy       │
│  → Đầy → Claude Code "quên"         │
└─────────────────────────────────────┘
```

---

## 2. Dấu hiệu context đầy

- Claude Code "quên" những gì đã thảo luận trước đó
- Trả lời lặp lại hoặc mâu thuẫn
- Bắt đầu sửa sai file
- Hiện cảnh báo context gần đầy

---

## 3. Cách quản lý context

### /compact — Nén hội thoại

```
> /compact

# Claude Code tóm tắt:
# "Đã hoàn thành: thêm auth module, fix bug login.
#  Đang làm: thêm validation cho form đăng ký."
```

**Quy tắc**: Dùng `/compact` sau mỗi task hoàn thành.

### /clear — Reset hoàn toàn

```
> /clear

# Xoá tất cả, bắt đầu mới
# Dùng khi chuyển sang task HOÀN TOÀN KHÁC
```

### Chia session theo task

```
Session 1: "Fix bug authentication"
  → Hoàn thành → /compact hoặc mở session mới

Session 2: "Thêm feature dark mode"
  → Hoàn thành → /compact hoặc mở session mới

Session 3: "Refactor API layer"
```

Đừng dồn tất cả vào 1 session dài.

---

## 4. CLAUDE.md — Context cố định

File `CLAUDE.md` ở root project được Claude Code **luôn đọc** mỗi session. Đây là nơi đặt thông tin quan trọng:

```markdown
# CLAUDE.md

## Commands
npm start          # Dev server (port 3000)
npm run build      # Production build
npm test           # Jest tests
npm run lint       # ESLint

## Architecture
- React 19 + TypeScript + Vite
- State management: Zustand
- API: REST with Axios
- Database: PostgreSQL with Prisma

## Conventions
- Components: PascalCase (UserCard.tsx)
- Hooks: camelCase với prefix "use" (useAuth.ts)
- API calls: src/api/
- Types: src/types/

## Rules
- Always write TypeScript (no .js files)
- Use functional components only
- Test files: *.test.ts alongside source
```

### Tip: Giữ CLAUDE.md ngắn gọn

```
✅ Liệt kê lệnh, kiến trúc, quy tắc quan trọng
❌ Viết essay dài về lịch sử project
```

CLAUDE.md chiếm context cố định. Càng dài → càng ít chỗ cho hội thoại.

---

## 5. Mention file thay vì để Claude tự tìm

```
# ❌ Claude Code phải tìm kiếm → tốn context
"Fix bug trong component hiển thị user"

# ✅ Chỉ thẳng file → tiết kiệm context
"Fix bug trong @src/components/UserCard.tsx"
```

---

## 6. Tóm tắt best practices

| Kỹ thuật | Khi nào |
|---------|--------|
| `/compact` | Sau mỗi task hoàn thành |
| `/clear` | Khi chuyển task hoàn toàn khác |
| Chia session | 1 session = 1 task/feature |
| CLAUDE.md ngắn | Chỉ info cần thiết |
| Mention `@file` | Khi biết file cần sửa |
| Prompt ngắn gọn | Nói đủ ý, không lặp |

---

## Tổng kết

```
Context = bộ nhớ có hạn
→ Dùng /compact thường xuyên
→ 1 session = 1 task
→ CLAUDE.md ngắn gọn, đúng trọng tâm
→ Mention @file thay vì để AI tìm
```
