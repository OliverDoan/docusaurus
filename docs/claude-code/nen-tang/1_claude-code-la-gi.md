---
sidebar_position: 1
title: "1. Claude Code la gi?"
---

# Claude Code là gì?

## Tóm tắt 1 dòng

**Claude Code** là AI coding assistant chạy trực tiếp trong terminal, có thể đọc, viết, chạy code và dùng git — như có một lập trình viên senior ngồi cạnh bạn.

---

## 1. Claude Code vs Claude Chat

| | Claude Chat (claude.ai) | Claude Code (CLI) |
|---|---|---|
| **Chạy ở đâu** | Trình duyệt | Terminal |
| **Đọc code** | Copy-paste thủ công | Tự đọc toàn bộ project |
| **Viết code** | Copy output ra | Tự tạo/sửa file |
| **Chạy lệnh** | Không | Chạy được (npm, git, docker...) |
| **Git** | Không | Commit, tạo PR, push |
| **Context** | Giới hạn cửa sổ chat | Toàn bộ codebase |

**Nói đơn giản**: Claude Chat = hỏi đáp. Claude Code = **làm việc cùng bạn** trong project thật.

---

## 2. Claude Code làm được gì?

### Đọc hiểu codebase

```bash
# "Giải thích cấu trúc project này"
# "File nào xử lý authentication?"
# "Function này hoạt động như thế nào?"
```

Claude Code tự tìm file, đọc code, và giải thích — bạn không cần chỉ file nào.

### Viết và sửa code

```bash
# "Thêm endpoint GET /api/users"
# "Fix bug: nút login không hoạt động"
# "Refactor component này dùng custom hook"
```

Claude Code tự tạo file mới hoặc sửa file có sẵn.

### Chạy lệnh và test

```bash
# "Chạy test và fix lỗi"
# "Build project và xem có lỗi gì không"
# "Cài thêm thư viện axios"
```

### Git workflow

```bash
# "Commit những thay đổi vừa rồi"
# "Tạo PR cho feature này"
# "Review PR #42"
```

---

## 3. Khi nào dùng Claude Code?

### Nên dùng

- Bạn đang code trong project thật (không phải hỏi lý thuyết)
- Cần sửa bug, thêm feature, refactor
- Muốn AI hiểu context toàn bộ project
- Cần tự động hoá: commit, test, deploy

### Nên dùng Claude Chat thay thế

- Hỏi kiến thức chung ("giải thích REST API là gì")
- Brainstorm ý tưởng
- Viết nội dung không liên quan code (email, báo cáo)

---

## 4. Cách hoạt động

```
Bạn gõ yêu cầu bằng tiếng Việt hoặc tiếng Anh
       ↓
Claude Code đọc codebase để hiểu context
       ↓
Đề xuất thay đổi (tạo file, sửa file, chạy lệnh)
       ↓
Bạn xác nhận (y/n) → Claude Code thực thi
       ↓
Kết quả: code đã thay đổi, test đã chạy, commit đã tạo
```

**Quan trọng**: Claude Code luôn **hỏi xác nhận** trước khi sửa file hoặc chạy lệnh. Bạn kiểm soát hoàn toàn.

---

## 5. Các model trong Claude Code

| Model | Đặc điểm | Khi nào dùng |
|-------|-----------|-------------|
| **Opus** | Sâu nhất, suy luận tốt nhất | Task phức tạp, kiến trúc |
| **Sonnet** | Cân bằng tốc độ và chất lượng | Code hàng ngày (mặc định) |
| **Haiku** | Nhanh nhất, rẻ nhất | Task đơn giản, nhanh |

Chuyển model: gõ `/model` trong Claude Code.

---

## Tổng kết

| Câu hỏi | Trả lời |
|---------|---------|
| Claude Code là gì? | AI assistant chạy trong terminal, code cùng bạn |
| Khác Claude Chat? | Đọc/viết file thật, chạy lệnh, dùng git |
| Ai nên dùng? | Developer đang làm project thật |
| Có an toàn? | Luôn hỏi xác nhận trước khi thay đổi |
