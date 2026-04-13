---
sidebar_position: 4
title: "4. Slash commands va phim tat"
---

# Slash commands và phím tắt

Slash commands (`/command`) là các lệnh đặc biệt giúp bạn làm việc nhanh hơn trong Claude Code.

---

## 1. Các lệnh cơ bản

| Lệnh | Chức năng |
|-------|-----------|
| `/help` | Xem danh sách lệnh |
| `/clear` | Xoá lịch sử hội thoại |
| `/compact` | Tóm tắt hội thoại để tiết kiệm context |
| `/model` | Chuyển model (Opus / Sonnet / Haiku) |
| `/cost` | Xem chi phí session hiện tại |
| `/quit` | Thoát Claude Code |

---

## 2. Lệnh hay dùng nhất

### /compact — Tiết kiệm context

Khi chat dài, context window đầy → Claude Code "quên" những gì đã nói. `/compact` tóm tắt lại:

```
> /compact

Claude Code tóm tắt toàn bộ hội thoại thành vài dòng
→ Giải phóng context window
→ Có thể tiếp tục làm việc
```

**Tip**: Dùng `/compact` sau mỗi task hoàn thành.

### /model — Đổi model

```
> /model

Chọn:
1. Claude Opus 4    → Task phức tạp
2. Claude Sonnet 4  → Code hàng ngày (mặc định)
3. Claude Haiku 4   → Task nhanh, đơn giản
```

**Khi nào đổi model?**

| Tình huống | Model |
|-----------|-------|
| Thiết kế kiến trúc hệ thống | Opus |
| Code feature, fix bug | Sonnet |
| Hỏi nhanh, task nhỏ | Haiku |

### /clear — Reset hội thoại

```
> /clear

Xoá toàn bộ lịch sử → Bắt đầu session mới
Dùng khi: Chuyển sang task hoàn toàn khác
```

---

## 3. Phím tắt quan trọng

### Trong hội thoại

| Phím | Chức năng |
|------|-----------|
| `Enter` | Gửi message |
| `Shift+Enter` | Xuống dòng (không gửi) |
| `Ctrl+C` | Dừng Claude Code đang xử lý |
| `Escape` | Huỷ input hiện tại |
| `↑` / `↓` | Lịch sử message đã gõ |
| `Tab` | Autocomplete đường dẫn file |

### Xác nhận thay đổi

Khi Claude Code muốn sửa file hoặc chạy lệnh:

| Phím | Ý nghĩa |
|------|---------|
| `y` | Chấp nhận |
| `n` | Từ chối |
| `a` | Chấp nhận tất cả (auto-accept phần còn lại) |

---

## 4. Chạy Claude Code với options

```bash
# Chat bình thường (interactive)
claude

# Chạy 1 lệnh rồi thoát
claude "fix lỗi TypeScript trong project"

# Chạy với model cụ thể
claude --model opus

# Tiếp tục session trước
claude --continue

# Đọc từ stdin (pipe)
cat error.log | claude "giải thích lỗi này"
git diff | claude "review thay đổi này"
```

### Flags hữu ích

| Flag | Chức năng |
|------|-----------|
| `--model opus` | Dùng model cụ thể |
| `--continue` | Tiếp tục session trước |
| `--print` | Chỉ in output, không interactive |
| `--verbose` | Hiện chi tiết tool calls |

---

## 5. Mention file với @

Dùng `@` để chỉ định file cụ thể trong prompt:

```
> Fix lỗi trong @src/components/Header.tsx

> Giải thích function ở @src/utils/format.ts dòng 42

> So sánh @src/old/auth.ts và @src/new/auth.ts
```

Claude Code sẽ đọc file đó trước khi trả lời, đảm bảo context chính xác.

---

## Tổng kết nhanh

```
/compact  → Tiết kiệm context (dùng thường xuyên!)
/model    → Đổi model theo task
/clear    → Reset session
Ctrl+C    → Dừng ngay
Tab       → Autocomplete file
@file     → Chỉ định file cụ thể
```
