---
sidebar_position: 1
title: "1. CLAUDE.md va custom instructions"
---

# CLAUDE.md và Custom Instructions

CLAUDE.md là "bộ não" cố định của Claude Code cho project. Config đúng giúp Claude Code hiểu project và làm việc chính xác hơn.

---

## 1. CLAUDE.md là gì?

File `CLAUDE.md` ở root project được Claude Code **tự đọc** mỗi khi bắt đầu session. Nó chứa thông tin về project mà bạn muốn Claude Code luôn biết.

```
project/
├── CLAUDE.md        ← Claude Code đọc file này
├── package.json
├── src/
└── ...
```

---

## 2. Template CLAUDE.md

```markdown
# CLAUDE.md

## Commands
npm start          # Dev server (port 3000)
npm run build      # Production build
npm test           # Jest tests
npm run lint       # ESLint check

## Architecture
- Framework: React 19 + TypeScript
- State: Zustand
- Styling: Tailwind CSS
- API: REST (src/api/)
- Database: PostgreSQL + Prisma

## Project Structure
src/
├── components/    # Reusable UI components
├── pages/         # Route pages
├── api/           # API client functions
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript types
└── stores/        # Zustand stores

## Conventions
- File naming: PascalCase for components, camelCase for utils
- Components: Functional only (no class components)
- Tests: Co-located (Button.tsx → Button.test.tsx)
- Imports: Absolute paths (@/components/...)

## Rules
- Always use TypeScript
- Write tests for new features
- No console.log in production code
- Handle errors with try-catch
- Use Vietnamese for UI text, English for code
```

---

## 3. Quy tắc viết CLAUDE.md tốt

### Ngắn gọn

```
✅ 30-50 dòng — thông tin quan trọng nhất
❌ 200 dòng — essay về project history
```

CLAUDE.md chiếm context cố định. Càng dài → càng ít chỗ cho chat.

### Cụ thể

```
✅ "npm test — Jest, file *.test.ts"
❌ "Chạy tests bằng cách thực thi lệnh test"
```

### Cập nhật khi project thay đổi

Đổi tech stack? Thêm convention mới? → Cập nhật CLAUDE.md.

---

## 4. Nhiều cấp CLAUDE.md

Claude Code đọc CLAUDE.md ở **nhiều cấp**:

```
~/.claude/CLAUDE.md              # Toàn bộ máy (mọi project)
project/CLAUDE.md                # Project level
project/src/CLAUDE.md            # Thư mục con (tuỳ chọn)
```

| Cấp | Dùng cho |
|-----|---------|
| Global (`~/.claude/`) | Style cá nhân, rules chung |
| Project root | Tech stack, conventions, commands |
| Subdirectory | Rules đặc biệt cho thư mục đó |

---

## 5. Settings file

Ngoài CLAUDE.md, có thể config thêm trong `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run build)",
      "Bash(npm run lint)"
    ]
  }
}
```

Cho phép Claude Code chạy lệnh cụ thể **không cần hỏi** → nhanh hơn.

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Bắt đầu đơn giản | Commands + Architecture đủ rồi |
| Cập nhật dần | Thêm rules khi gặp vấn đề lặp lại |
| Commit vào git | Team cùng dùng CLAUDE.md |
| Không chứa secrets | CLAUDE.md có thể public |
