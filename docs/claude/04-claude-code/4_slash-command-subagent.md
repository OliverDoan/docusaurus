---
sidebar_position: 4
title: "4. Slash Commands & Subagents"
---

# Slash Commands & Subagents

Bài này giới thiệu hai khái niệm giúp bạn dùng Claude Code hiệu quả hơn: **slash command** là các lệnh gõ nhanh bắt đầu bằng dấu `/` (như `/help`, `/clear`), còn **subagent** là trợ lý con chuyên biệt chạy với ngữ cảnh riêng để xử lý các việc lớn. Hiểu hai công cụ này giúp bạn thao tác nhanh và giữ phiên làm việc gọn gàng; chi tiết nằm bên dưới.

---

## Mục lục

- [Slash command là gì?](#slash-command-là-gì)
- [Các slash command phổ biến](#các-slash-command-phổ-biến)
- [Tạo slash command tuỳ chỉnh](#tạo-slash-command-tuỳ-chỉnh)
- [Subagent là gì?](#subagent-là-gì)
- [Khi nào dùng subagent?](#khi-nào-dùng-subagent)
- [Slash command vs Subagent](#slash-command-vs-subagent)

---

## Slash command là gì?

**Slash command** (lệnh gạch chéo) là lệnh bạn gõ trong phiên Claude Code, bắt
đầu bằng dấu `/`. Đây là các lệnh điều khiển bản thân Claude Code (không phải gửi
cho mô hình AI suy nghĩ), giúp bạn thao tác nhanh.

Ví dụ khi gõ `/help`, Claude Code hiển thị danh sách lệnh; nó không "suy nghĩ" mà
chỉ thực thi chức năng có sẵn.

## Các slash command phổ biến

Dưới đây là vài lệnh bạn sẽ dùng thường xuyên:

```bash
/help     # Hiển thị danh sách lệnh và trợ giúp
/init     # Quét dự án và tạo file CLAUDE.md
/clear    # Xoá ngữ cảnh (context) của phiên hiện tại, bắt đầu lại sạch
/exit     # Thoát khỏi phiên Claude Code
```

Đáng chú ý nhất là **`/clear`**. Trong một phiên dài, ngữ cảnh tích tụ nhiều nội
dung cũ không còn liên quan. Khi bạn chuyển sang một nhiệm vụ hoàn toàn khác, gõ
`/clear` để xoá ngữ cảnh cũ — giúp Claude tập trung và phản hồi chính xác hơn.

:::tip Danh sách lệnh có thể khác nhau
Tập hợp slash command có thể thay đổi theo phiên bản. Hãy gõ `/help` để xem danh
sách chính xác trong phiên bản bạn đang dùng.
:::

## Tạo slash command tuỳ chỉnh

Ngoài lệnh có sẵn, bạn có thể **tự tạo slash command** cho các tác vụ lặp lại
trong dự án. Một slash command tuỳ chỉnh thực chất là một file Markdown chứa sẵn
lời nhắc (prompt) — khi gõ lệnh, nội dung file được gửi cho Claude.

Cách làm phổ biến: tạo file Markdown trong thư mục lệnh của dự án (thường là
`.claude/commands/`). Tên file chính là tên lệnh.

```markdown
<!-- File: .claude/commands/review.md -->
<!-- Khi gõ /review, nội dung dưới đây được gửi cho Claude -->

Hãy xem lại các thay đổi chưa commit trong dự án.
Tìm: lỗi tiềm ẩn, vấn đề bảo mật, và chỗ vi phạm quy ước trong CLAUDE.md.
Báo cáo theo mức độ nghiêm trọng, kèm gợi ý sửa.
```

Sau khi tạo file trên, trong phiên bạn chỉ cần gõ:

```bash
# Gọi slash command tuỳ chỉnh vừa tạo
/review
```

Slash command tuỳ chỉnh giúp đóng gói những lời nhắc dài hoặc quy trình lặp lại
thành một lệnh ngắn gọn, dùng lại cho cả nhóm (vì file nằm trong dự án và commit
được).

:::note Vị trí có thể thay đổi
Đường dẫn thư mục lệnh và cú pháp có thể khác giữa các phiên bản. Hãy tra cứu
docs.claude.com để biết cấu hình chính xác cho phiên bản của bạn.
:::

## Subagent là gì?

**Subagent** (agent phụ) là một "trợ lý con" chuyên biệt mà Claude Code giao cho
một nhiệm vụ con cụ thể. Mỗi subagent chạy với **ngữ cảnh riêng** của nó, độc lập
với phiên chính.

Ví dụ về subagent thường gặp:

- **code-reviewer** — chuyên xem lại code và chỉ ra vấn đề.
- **planner** — chuyên lập kế hoạch trước khi triển khai tính năng lớn.
- **tester / test runner** — chuyên viết và chạy test.

Khi một subagent làm xong việc, nó trả kết quả tóm tắt về phiên chính. Điều này
giúp **giữ ngữ cảnh chính gọn gàng**: các chi tiết phụ (vd quá trình đọc hàng
chục file để review) nằm trong ngữ cảnh riêng của subagent, không làm "phình"
phiên chính.

## Khi nào dùng subagent?

Dùng subagent khi nhiệm vụ con:

- **Tốn nhiều ngữ cảnh** (đọc nhiều file) nhưng bạn chỉ cần kết quả tóm tắt — vd
  review toàn bộ thay đổi, hay tìm kiếm trong codebase lớn.
- **Cần chuyên môn tách biệt** — vd để một subagent "lập kế hoạch", một subagent
  khác "kiểm thử".
- **Chạy song song nhiều việc độc lập** — vd cùng lúc phân tích bảo mật ở module
  A và rà soát hiệu năng ở module B.

Với việc nhỏ, đơn giản thì không cần subagent — hỏi trực tiếp trong phiên chính
là đủ.

## Slash command vs Subagent

| Tiêu chí | Slash command | Subagent |
| --- | --- | --- |
| Bản chất | Lệnh điều khiển / prompt đóng gói | Trợ lý con có ngữ cảnh riêng |
| Cách gọi | Gõ `/ten-lenh` | Claude tự giao, hoặc bạn yêu cầu |
| Ngữ cảnh | Dùng chung phiên hiện tại | Riêng biệt, trả về tóm tắt |
| Dùng cho | Thao tác/prompt lặp lại nhanh | Việc con lớn, chuyên biệt |

## Tóm tắt

- **Slash command** là lệnh gõ trong phiên, bắt đầu bằng `/` (vd `/help`,
  `/init`, `/clear`, `/exit`).
- **`/clear`** rất hữu ích để xoá ngữ cảnh khi chuyển chủ đề.
- Bạn có thể **tạo slash command tuỳ chỉnh** bằng file Markdown trong
  `.claude/commands/` để đóng gói prompt lặp lại.
- **Subagent** là trợ lý con chuyên biệt, chạy với **ngữ cảnh riêng** và trả về
  tóm tắt — giúp giữ phiên chính gọn gàng.
- Dùng subagent cho việc con **tốn ngữ cảnh**, **cần chuyên môn riêng**, hoặc
  **chạy song song**.
