---
sidebar_position: 2
title: "2. Cai dat va thiet lap"
---

# Cài đặt và thiết lập

---


---

## Mục lục

- [1. Yêu cầu](#1-yêu-cầu)
- [2. Cài đặt](#2-cài-đặt)
- [3. Xác thực](#3-xác-thực)
- [4. Chạy Claude Code](#4-chạy-claude-code)
- [5. Cấu hình cơ bản](#5-cấu-hình-cơ-bản)
- [Commands](#commands)
- [Architecture](#architecture)
- [Rules](#rules)
- [6. Phím tắt cần nhớ](#6-phím-tắt-cần-nhớ)
- [7. Chạy thử](#7-chạy-thử)
- [Tổng kết](#tổng-kết)

---

## 1. Yêu cầu

- **Node.js** >= 18 (kiểm tra: `node --version`)
- **Tài khoản Anthropic** với API key, hoặc Claude Max/Pro subscription
- macOS, Linux, hoặc Windows (qua WSL)

---

## 2. Cài đặt

```bash
# Cài bằng npm (khuyến nghị)
npm install -g @anthropic-ai/claude-code

# Kiểm tra
claude --version
```

---

## 3. Xác thực

```bash
# Chạy lần đầu, Claude Code sẽ hướng dẫn đăng nhập
claude

# Hoặc set API key thủ công
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Hai cách xác thực:
- **OAuth** (Claude Pro/Max): Đăng nhập qua trình duyệt — đơn giản nhất
- **API Key**: Dùng key từ console.anthropic.com — cho team/enterprise

---

## 4. Chạy Claude Code

```bash
# Mở trong thư mục project
cd my-project
claude

# Claude Code đọc codebase và sẵn sàng
# Gõ yêu cầu bằng tiếng Việt hoặc tiếng Anh
```

### Giao diện

```
╭─────────────────────────────────────────╮
│ Claude Code                              │
│                                          │
│ > Bạn muốn tôi làm gì?                  │
│                                          │
│ Gõ yêu cầu hoặc /help để xem lệnh      │
╰─────────────────────────────────────────╯
```

---

## 5. Cấu hình cơ bản

### File cấu hình

| File | Phạm vi | Vị trí |
|------|---------|--------|
| `~/.claude/settings.json` | Toàn hệ thống | Home directory |
| `.claude/settings.json` | Từng project | Thư mục project |
| `CLAUDE.md` | Hướng dẫn cho AI | Root project |

### CLAUDE.md — File quan trọng nhất

Tạo file `CLAUDE.md` ở root project để hướng dẫn Claude Code:

```markdown
# CLAUDE.md

## Commands
npm start          # Dev server
npm run build      # Production build
npm test           # Run tests

## Architecture
- React 19 + TypeScript
- API routes in src/api/
- Components in src/components/

## Rules
- Use Vietnamese for comments
- Follow existing code style
- Always run tests before committing
```

Claude Code **tự đọc file này** mỗi khi bắt đầu session.

---

## 6. Phím tắt cần nhớ

| Phím | Chức năng |
|------|-----------|
| `Enter` | Gửi message |
| `Escape` | Huỷ / Thoát |
| `Ctrl+C` | Dừng task đang chạy |
| `/help` | Xem tất cả lệnh |
| `/clear` | Xoá lịch sử chat |
| `/model` | Đổi model (Opus/Sonnet/Haiku) |
| `Tab` | Autocomplete file path |

---

## 7. Chạy thử

Sau khi cài xong, thử ngay:

```bash
cd my-project
claude

# Gõ:
> Giải thích cấu trúc project này
> File nào là entry point?
> Liệt kê các dependencies chính
```

Claude Code sẽ tự tìm file, đọc, và trả lời.

---

## Tổng kết

```
1. npm install -g @anthropic-ai/claude-code
2. cd my-project
3. claude
4. Gõ yêu cầu → Claude Code làm việc
```
