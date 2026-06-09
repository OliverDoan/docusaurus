---
sidebar_position: 6
title: "6. Mẹo dùng Claude Code hiệu quả"
---

# Mẹo dùng Claude Code hiệu quả

Bài này tổng hợp các mẹo thực hành giúp bạn dùng Claude Code hiệu quả hơn: dùng plan mode cho việc lớn, `/clear` khi đổi chủ đề, viết CLAUDE.md tốt, chia nhỏ task, luôn kiểm tra diff trước khi commit, và quản lý ngữ cảnh. Áp dụng những mẹo này giúp Claude làm đúng từ đầu và tiết kiệm thời gian; chi tiết kèm checklist nhanh nằm bên dưới.

---

## Mục lục

- [Dùng plan mode cho việc lớn](#dùng-plan-mode-cho-việc-lớn)
- [Dùng /clear khi đổi chủ đề](#dùng-clear-khi-đổi-chủ-đề)
- [Viết CLAUDE.md tốt](#viết-claudemd-tốt)
- [Chia nhỏ task](#chia-nhỏ-task)
- [Luôn kiểm tra diff trước khi commit](#luôn-kiểm-tra-diff-trước-khi-commit)
- [Quản lý ngữ cảnh (context)](#quản-lý-ngữ-cảnh-context)
- [Checklist nhanh](#checklist-nhanh)

---

## Dùng plan mode cho việc lớn

Với nhiệm vụ ảnh hưởng nhiều file (vd thêm tính năng, refactor lớn), hãy để Claude
**lập kế hoạch trước** khi sửa code. Bạn duyệt kế hoạch, điều chỉnh hướng đi, rồi
mới cho thực thi.

```markdown
Trước khi sửa, hãy trình bày kế hoạch các bước để thêm tính năng "giỏ hàng".
Liệt kê file sẽ tạo/sửa. Đợi tôi duyệt rồi mới làm.
```

Lợi ích: tránh việc Claude lao vào sửa hàng loạt file theo hướng sai, gây tốn thời
gian sửa lại.

## Dùng /clear khi đổi chủ đề

Mỗi phiên tích luỹ ngữ cảnh (context) từ những gì đã trao đổi. Khi bạn chuyển sang
một nhiệm vụ **hoàn toàn khác**, ngữ cảnh cũ trở thành nhiễu — làm Claude chậm và
dễ lẫn lộn.

```bash
# Xoá ngữ cảnh cũ trước khi bắt đầu nhiệm vụ mới
/clear
```

Quy tắc đơn giản: **xong một việc lớn → /clear → bắt đầu việc tiếp theo**. Ngữ
cảnh sạch giúp câu trả lời chính xác và nhanh hơn.

## Viết CLAUDE.md tốt

CLAUDE.md tốt là khoản đầu tư hiệu quả nhất. Nó giúp Claude làm đúng ngay từ đầu
mà không cần bạn nhắc lại mỗi phiên.

- Ghi **lệnh thường dùng** (build, test, lint) để Claude khỏi đoán.
- Ghi **quy ước code** và **ràng buộc** quan trọng (vd "comment bằng tiếng
  Việt", "không commit secret").
- Giữ **ngắn gọn, hành động được**; cập nhật khi dự án thay đổi.
- Dùng `/init` để tạo bản nháp rồi tự chỉnh.

```markdown
## Ràng buộc (ví dụ một mục nên có)
- Luôn chạy `npm test` trước khi báo hoàn thành.
- Không sửa file trong thư mục generated/.
```

## Chia nhỏ task

Một yêu cầu khổng lồ ("xây cả module thanh toán") dễ khiến kết quả lệch hướng.
Hãy tách thành các bước nhỏ, kiểm tra được:

```markdown
# THAY VÌ một câu lớn, làm theo từng bước:
1. Tạo model dữ liệu cho đơn hàng + test.
2. Thêm API tạo đơn hàng + test.
3. Thêm giao diện danh sách đơn hàng.
```

Sau mỗi bước, chạy test và xem kết quả. Cách này giúp phát hiện sai sót sớm, dễ
quay lui (rollback) khi cần.

## Luôn kiểm tra diff trước khi commit

Đừng commit "mù". Trước khi lưu vào Git, hãy xem lại toàn bộ thay đổi:

```markdown
Cho tôi xem diff của tất cả thay đổi chưa commit.
```

Khi xem diff, chú ý:

- Có thay đổi ngoài ý muốn không (file lạ, code dư thừa)?
- Có lộ secret/khoá nào không?
- Code có theo đúng quy ước trong CLAUDE.md không?

Chỉ commit khi bạn hiểu và đồng ý với mọi thay đổi. Nên commit trên **nhánh
riêng** thay vì sửa thẳng nhánh chính.

## Quản lý ngữ cảnh (context)

Ngữ cảnh là tài nguyên có giới hạn; quản lý tốt giúp Claude làm việc chính xác:

- **Dùng /clear** giữa các nhiệm vụ không liên quan.
- **Giao việc tốn ngữ cảnh cho subagent** (vd review toàn bộ codebase) để giữ
  phiên chính gọn.
- **Tham chiếu file cụ thể** thay vì bắt Claude đọc cả dự án: "Xem file
  src/utils/date.ts" tốt hơn "tìm hàm xử lý ngày đâu đó".
- **Để CLAUDE.md gánh ngữ cảnh nền** (lệnh, quy ước) thay vì lặp lại mỗi phiên.

:::tip Phiên gọn, kết quả tốt
Ngữ cảnh càng tập trung vào việc đang làm, Claude càng ít "phân tâm" và phản hồi
càng chuẩn. Khi thấy câu trả lời bắt đầu lan man, đó là dấu hiệu nên `/clear`.
:::

## Checklist nhanh

```markdown
[ ] Việc lớn? -> Dùng plan mode, duyệt kế hoạch trước.
[ ] Đổi chủ đề? -> /clear.
[ ] Có CLAUDE.md đầy đủ lệnh + ràng buộc chưa?
[ ] Đã chia task thành bước nhỏ kiểm tra được?
[ ] Đã chạy test sau mỗi thay đổi?
[ ] Đã xem diff kỹ trước khi commit?
[ ] Phiên có bị "phình" ngữ cảnh không liên quan không?
```

## Tóm tắt

- **Plan mode** cho việc lớn: duyệt kế hoạch trước khi sửa code.
- **/clear** khi đổi chủ đề để xoá ngữ cảnh cũ gây nhiễu.
- **CLAUDE.md tốt** (lệnh, quy ước, ràng buộc) giúp Claude làm đúng từ đầu.
- **Chia nhỏ task** và chạy test sau mỗi bước để phát hiện lỗi sớm.
- **Luôn xem diff** trước khi commit; ưu tiên nhánh riêng.
- **Quản lý ngữ cảnh** chủ động: dùng subagent cho việc tốn context, tham chiếu
  file cụ thể, để CLAUDE.md gánh ngữ cảnh nền.
