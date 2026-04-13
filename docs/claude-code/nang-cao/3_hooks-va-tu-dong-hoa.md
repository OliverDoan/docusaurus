---
sidebar_position: 3
title: "3. Hooks va tu dong hoa"
---

# Hooks và tự động hoá

Hooks cho phép bạn chạy lệnh tự động khi Claude Code thực hiện các thao tác. Giống git hooks nhưng cho Claude Code.

---

## 1. Hooks là gì?

```
Claude Code sửa file .tsx
       ↓ (PostToolUse hook)
Tự động chạy Prettier format code
       ↓
Tự động chạy TypeScript check
       ↓
Kết quả: Code đã format + type-safe
```

Bạn không cần gõ "format code" hay "check types" — hooks làm tự động.

---

## 2. Các loại Hook

| Hook | Khi nào chạy | Ví dụ |
|------|-------------|-------|
| **PreToolUse** | Trước khi Claude dùng tool | Validate params |
| **PostToolUse** | Sau khi Claude dùng tool | Auto-format, lint |
| **Stop** | Khi session kết thúc | Final checks |

---

## 3. Cấu hình Hooks

Trong `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH"
          }
        ]
      }
    ]
  }
}
```

### Ví dụ: Auto-format sau khi edit

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH"
          }
        ]
      }
    ]
  }
}
```

**Kết quả**: Mỗi lần Claude Code sửa file → Prettier tự format.

### Ví dụ: TypeScript check sau edit file .ts/.tsx

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

---

## 4. Biến môi trường trong Hooks

| Biến | Giá trị |
|------|---------|
| `$CLAUDE_FILE_PATH` | Đường dẫn file vừa edit |
| `$CLAUDE_TOOL_NAME` | Tên tool (Edit, Write, Bash) |

---

## 5. Khi nào dùng Hooks?

| Tình huống | Hook |
|-----------|------|
| Code luôn cần format | PostToolUse → Prettier |
| Muốn check TypeScript liên tục | PostToolUse → tsc |
| Cảnh báo console.log | PostToolUse → grep check |
| Review trước khi push | PreToolUse trên Bash(git push) |

---

## 6. Lưu ý

- Hooks chạy **mỗi lần** Claude Code dùng tool → Nên nhanh (< 5 giây)
- Hook lỗi sẽ hiện warning cho bạn
- Bắt đầu đơn giản: chỉ Prettier là đủ cho hầu hết project

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Bắt đầu với Prettier | Hook hữu ích nhất |
| Giữ hook nhanh | < 5 giây mỗi hook |
| Test hook thủ công trước | Chạy lệnh bằng tay trước khi config |
| Commit config | `.claude/settings.json` vào git |
