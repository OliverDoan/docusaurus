---
sidebar_position: 4
title: "4. Web Search & Extended Thinking"
---

# Web Search & Extended Thinking

Bài này giới thiệu hai tính năng giúp Claude trả lời tốt hơn trong những tình huống khó: **Web Search** giúp Claude lấy thông tin mới trên Internet (vượt qua mốc dữ liệu huấn luyện), còn **Extended Thinking** giúp Claude suy nghĩ kỹ theo nhiều bước trước khi trả lời. Hiểu khi nào nên bật từng tính năng sẽ giúp bạn nhận câu trả lời cập nhật và chính xác hơn; chi tiết nằm bên dưới.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Web Search` lấy thông tin mới trên web** — vượt qua mốc dữ liệu huấn luyện; dùng cho tin tức, dữ liệu cập nhật, thông tin dễ thay đổi.
- ⭐ **`Extended Thinking` giúp suy luận sâu nhiều bước** — dùng cho bài toán khó, phân tích phức tạp, lập kế hoạch, gỡ lỗi.
- **Hai tính năng giải quyết hai vấn đề khác nhau** — thiếu thông tin mới vs. bài toán khó; có thể dùng cùng nhau khi cần.
- **Lưu ý** — luôn kiểm chứng thông tin quan trọng, không lạm dụng Extended Thinking cho việc đơn giản.

:::

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Web Search là gì?](#web-search-là-gì)
- [Khi nào nên dùng Web Search](#khi-nào-nên-dùng-web-search)
- [Extended Thinking là gì?](#extended-thinking-là-gì)
- [Khi nào nên bật Extended Thinking](#khi-nào-nên-bật-extended-thinking)
- [Kết hợp hai tính năng](#kết-hợp-hai-tính-năng)
- [Lưu ý quan trọng](#lưu-ý-quan-trọng)
- [Tóm tắt](#tóm-tắt)

---

## Tổng quan

Trang này giới thiệu hai tính năng giúp Claude trả lời tốt hơn trong những tình huống đặc biệt:

- **Web Search** (tìm kiếm web): giúp Claude lấy thông tin **mới** từ Internet.
- **Extended Thinking** (suy luận mở rộng): giúp Claude **suy nghĩ kỹ hơn** trước khi trả lời các bài toán khó.

Cả hai đều giải quyết một giới hạn tự nhiên của mô hình AI: nó được huấn luyện đến một mốc thời gian nhất định, và đôi khi câu hỏi quá khó để trả lời "ngay lập tức".

> Lưu ý: sự có mặt, tên gọi và cách bật/tắt của các tính năng này có thể khác nhau tuỳ gói và tuỳ cập nhật (tuỳ gói/cập nhật).

---

## Web Search là gì?

Mặc định, Claude trả lời dựa trên dữ liệu nó đã học trong quá trình huấn luyện — và dữ liệu này chỉ cập nhật đến một **mốc thời gian** nhất định. Vì vậy, với những thông tin xảy ra **sau mốc đó**, Claude có thể không biết hoặc không chắc chắn.

**Web Search** cho phép Claude **tìm thông tin mới trên web** khi cần, vượt qua mốc dữ liệu huấn luyện. Khi bật, Claude có thể tra cứu thông tin hiện tại và đưa vào câu trả lời.

---

## Khi nào nên dùng Web Search

Hãy dùng Web Search khi câu hỏi liên quan đến thông tin **mới** hoặc **thay đổi theo thời gian**:

- **Tin tức, sự kiện gần đây**: "Có sự kiện gì đáng chú ý tuần này?"
- **Dữ liệu cập nhật**: giá cả, tỷ giá, lịch sự kiện, thông tin sản phẩm mới.
- **Thông tin có thể đã thay đổi**: phiên bản phần mềm mới nhất, chính sách mới.
- **Khi bạn cần nguồn**: để Claude tham chiếu thông tin thực tế thay vì dựa hoàn toàn vào trí nhớ.

Ngược lại, **không cần** Web Search cho những việc dựa trên kiến thức ổn định, ví dụ: giải thích khái niệm, viết văn, tóm tắt tài liệu bạn đã cung cấp, hay làm toán cơ bản.

**Ví dụ tình huống:** Bạn hỏi "Phiên bản mới nhất của một phần mềm là gì?" — đây là thông tin có thể đã thay đổi sau mốc huấn luyện, nên bật Web Search sẽ cho câu trả lời cập nhật và đáng tin cậy hơn.

---

## Extended Thinking là gì?

**Extended Thinking** (suy luận mở rộng) là chế độ cho phép Claude **suy nghĩ kỹ hơn, theo nhiều bước**, trước khi đưa ra câu trả lời cuối cùng. Thay vì trả lời ngay, Claude dành thêm "công sức suy luận" để phân tích vấn đề cẩn thận.

Hãy hình dung sự khác biệt giống như con người: với câu hỏi dễ ta trả lời ngay; với bài toán khó ta cần ngồi nháp, suy đi tính lại rồi mới kết luận. Extended Thinking giúp Claude làm điều tương tự.

---

## Khi nào nên bật Extended Thinking

Bật Extended Thinking cho những bài toán **khó, nhiều bước, dễ sai nếu vội**:

- **Bài toán logic hoặc toán nhiều bước**: cần suy luận tuần tự, không được nhảy cóc.
- **Phân tích phức tạp**: so sánh nhiều phương án, cân nhắc ưu nhược điểm.
- **Lập kế hoạch chi tiết**: chia một mục tiêu lớn thành các bước nhỏ hợp lý.
- **Gỡ lỗi khó**: tìm nguyên nhân của một vấn đề có nhiều khả năng.

Với câu hỏi đơn giản (định nghĩa, dịch một câu, viết một email ngắn), bạn **không cần** bật Extended Thinking — trả lời thường vẫn nhanh và chính xác, lại tiết kiệm thời gian.

**Ví dụ tình huống:** Bạn nhờ Claude lập kế hoạch ngân sách cá nhân với nhiều ràng buộc (thu nhập, khoản tiết kiệm, chi tiêu cố định). Đây là bài toán nhiều bước, nên Extended Thinking giúp lời giải mạch lạc và ít sai sót hơn.

---

## Kết hợp hai tính năng

Hai tính năng giải quyết hai vấn đề **khác nhau**:

| Tính năng | Giải quyết vấn đề | Khi nào dùng |
|-----------|-------------------|--------------|
| Web Search | Thiếu thông tin mới | Câu hỏi cần dữ liệu cập nhật |
| Extended Thinking | Bài toán khó, cần suy luận sâu | Câu hỏi phức tạp, nhiều bước |

Trong một số trường hợp bạn có thể cần cả hai — ví dụ phân tích một xu hướng mới (cần Web Search lấy dữ liệu) rồi suy luận sâu để rút ra kết luận (cần Extended Thinking).

---

## Lưu ý quan trọng

- **Vẫn nên kiểm chứng**: thông tin từ web có thể chưa chính xác hoặc lỗi thời; hãy đối chiếu với nguồn đáng tin nếu quan trọng.
- **Không lạm dụng**: bật Extended Thinking cho câu hỏi đơn giản chỉ làm chậm hơn mà không cần thiết.
- **Quyền riêng tư**: cân nhắc khi để Claude tìm kiếm các nội dung nhạy cảm trên web.
- Sự có mặt và cách bật/tắt của các tính năng có thể thay đổi tuỳ gói và tuỳ cập nhật.

---

## Tóm tắt

- **Web Search** giúp Claude lấy **thông tin mới** trên web, vượt mốc dữ liệu huấn luyện — dùng cho tin tức, dữ liệu cập nhật, thông tin dễ thay đổi.
- **Extended Thinking** giúp Claude **suy luận sâu, nhiều bước** — dùng cho bài toán khó, phân tích phức tạp, lập kế hoạch, gỡ lỗi.
- Hai tính năng giải quyết hai vấn đề khác nhau và có thể dùng cùng nhau khi cần.
- Lưu ý: luôn kiểm chứng thông tin quan trọng, không lạm dụng Extended Thinking cho việc đơn giản.
- Tính năng và cách bật có thể khác nhau tuỳ gói và tuỳ cập nhật.
