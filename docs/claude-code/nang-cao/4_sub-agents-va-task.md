---
sidebar_position: 4
title: "4. Sub-agents va Task"
---

# Sub-agents và Task

Khi task phức tạp, Claude Code có thể tạo "sub-agents" — các agent phụ chạy song song để xử lý nhanh hơn.

---


---

## Mục lục

- [1. Sub-agents là gì?](#1-sub-agents-là-gì)
- [2. Khi nào Claude Code dùng sub-agents?](#2-khi-nào-claude-code-dùng-sub-agents)
- [3. Gợi ý Claude Code dùng sub-agents](#3-gợi-ý-claude-code-dùng-sub-agents)
- [4. Extended Thinking](#4-extended-thinking)
- [5. Plan mode](#5-plan-mode)
- [6. Task tracking](#6-task-tracking)
- [Tips](#tips)

---

## 1. Sub-agents là gì?

```
Claude Code (agent chính)
  ├── Sub-agent 1: Tìm kiếm file liên quan
  ├── Sub-agent 2: Đọc documentation
  └── Sub-agent 3: Phân tích code pattern

→ Chạy song song → Tổng hợp kết quả → Trả lời bạn
```

Claude Code **tự quyết định** khi nào cần sub-agent. Bạn không cần cấu hình.

---

## 2. Khi nào Claude Code dùng sub-agents?

| Tình huống | Sub-agent làm gì |
|-----------|------------------|
| Tìm file trong codebase lớn | Explore agent tìm kiếm |
| Đọc hiểu nhiều file | Đọc song song |
| Task phức tạp nhiều bước | Chia nhỏ và xử lý |
| Research trước khi code | Tìm pattern, docs |

---

## 3. Gợi ý Claude Code dùng sub-agents

Bạn có thể gợi ý bằng cách mô tả task phức tạp:

```
> Phân tích toàn bộ project:
  1. Tìm tất cả API endpoints
  2. Liệt kê components không dùng
  3. Tìm potential security issues
  4. Đánh giá test coverage
```

Claude Code có thể chạy nhiều sub-agents song song cho 4 tasks trên.

---

## 4. Extended Thinking

Với task phức tạp, Claude Code dùng "extended thinking" — suy nghĩ sâu hơn trước khi trả lời:

```
> Thiết kế kiến trúc cho hệ thống notification:
  - Push notification
  - Email
  - In-app
  - Cần queue system
  - Cần retry khi fail
```

Claude Code sẽ suy nghĩ kỹ hơn trước khi đề xuất giải pháp.

**Toggle**: `/model` → chọn Opus cho task cần suy nghĩ sâu.

---

## 5. Plan mode

Với feature lớn, Claude Code có thể vào "Plan mode" — lên kế hoạch trước khi code:

```
> Implement hệ thống authentication với JWT.
  Bao gồm: register, login, refresh token, middleware.

Claude Code:
  1. Phân tích codebase
  2. Đề xuất kế hoạch (plan)
  3. Hỏi bạn confirm
  4. Implement từng bước
```

**Tip**: Với feature lớn, nói "lên kế hoạch trước, đừng code ngay":

```
> Tôi muốn thêm hệ thống payment.
  Hãy phân tích và đề xuất kế hoạch trước.
  Chưa cần code.
```

---

## 6. Task tracking

Claude Code có thể tự tạo task list để theo dõi tiến độ:

```
> Implement CRUD cho entity Product:
  - Model
  - API endpoints (GET, POST, PUT, DELETE)
  - Validation
  - Tests
  - Frontend components
```

Claude Code sẽ tạo checklist và đánh dấu hoàn thành từng bước.

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Task lớn → chia nhỏ | Claude Code xử lý tốt hơn |
| Dùng Opus cho task phức tạp | Suy nghĩ sâu hơn |
| "Lên kế hoạch trước" | Tránh code sai hướng |
| Review từng bước | Không accept cả đống |
