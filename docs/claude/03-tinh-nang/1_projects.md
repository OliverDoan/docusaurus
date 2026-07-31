---
sidebar_position: 1
title: "1. Projects"
---

# Projects

Projects là không gian làm việc trên claude.ai giúp bạn gom nhiều cuộc hội thoại quanh cùng một chủ đề, kèm tài liệu nền và chỉ dẫn riêng để Claude luôn nhớ ngữ cảnh xuyên suốt. Tính năng này rất hữu ích khi bạn làm việc dài hạn và muốn câu trả lời nhất quán. Bài này giải thích Projects là gì, hai thành phần cốt lõi và cách dùng hiệu quả.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Projects` gom nhiều hội thoại quanh một chủ đề** — Claude nhớ ngữ cảnh nền xuyên suốt mọi cuộc trò chuyện.
- **Hai thành phần cốt lõi** — `Knowledge` (tài liệu nền) và `Custom Instructions` (chỉ dẫn cách hành xử).
- **Dùng khi làm việc dài hạn** — có tài liệu nền cố định, muốn phong cách trả lời nhất quán.
- **Mẹo** — tài liệu gọn đúng trọng tâm, chỉ dẫn cụ thể, mỗi dự án một chủ đề.
- **Lưu ý** — có thể chỉ có ở gói trả phí; giao diện thay đổi theo cập nhật.

:::

---

## Mục lục

- [Projects là gì?](#projects-là-gì)
- [Khi nào nên dùng Projects?](#khi-nào-nên-dùng-projects)
- [Hai thành phần cốt lõi](#hai-thành-phần-cốt-lõi)
- [Cách tạo và dùng một Project](#cách-tạo-và-dùng-một-project)
- [Ví dụ thực tế](#ví-dụ-thực-tế)
- [Mẹo dùng hiệu quả](#mẹo-dùng-hiệu-quả)
- [Tóm tắt](#tóm-tắt)

---

## Projects là gì?

**Projects** (dự án) là một không gian làm việc trên claude.ai giúp bạn gom **nhiều cuộc hội thoại** (conversations) lại quanh **một chủ đề** chung.

Hãy hình dung Projects như một "thư mục thông minh": tất cả cuộc trò chuyện liên quan đến một mục tiêu (ví dụ: viết blog, học một môn học, chuẩn bị báo cáo) được đặt chung một chỗ. Quan trọng hơn, bạn có thể nạp sẵn cho dự án **tài liệu nền** và **chỉ dẫn riêng**, để Claude luôn nhớ ngữ cảnh xuyên suốt mọi cuộc hội thoại bên trong dự án đó.

Khác biệt so với chat thông thường:

| Chat thông thường | Trong một Project |
|-------------------|-------------------|
| Mỗi cuộc trò chuyện độc lập, Claude không nhớ chat khác | Mọi cuộc trò chuyện chia sẻ chung ngữ cảnh nền |
| Phải dán lại tài liệu mỗi lần | Tài liệu nền nạp một lần, dùng lại nhiều lần |
| Phải nhắc lại yêu cầu phong cách mỗi lần | Chỉ dẫn tuỳ chỉnh áp dụng tự động |

> Lưu ý: Projects có thể chỉ có ở một số gói trả phí và giao diện có thể thay đổi theo cập nhật. Hãy kiểm tra tài khoản của bạn (tuỳ gói/cập nhật).

---

## Khi nào nên dùng Projects?

Bạn nên cân nhắc dùng Projects khi:

- Bạn làm việc **dài hạn** trên một chủ đề và sẽ mở nhiều cuộc trò chuyện về nó.
- Bạn có **tài liệu nền cố định** mà cuộc nào cũng cần (ví dụ: hướng dẫn thương hiệu, đề cương môn học, tài liệu sản phẩm).
- Bạn muốn Claude luôn trả lời theo **một phong cách nhất quán** mà không phải nhắc lại mỗi lần.

Nếu chỉ là câu hỏi nhanh, dùng một lần thì chat thông thường là đủ — không cần tạo Project.

---

## Hai thành phần cốt lõi

### 1. Kiến thức nền (Knowledge)

Đây là kho **tài liệu/ngữ cảnh** bạn nạp vào dự án: file PDF, tài liệu văn bản, ghi chú, đoạn mã, hướng dẫn... Claude sẽ tham chiếu vào các tài liệu này khi trả lời trong mọi cuộc hội thoại của dự án.

Ví dụ về knowledge hữu ích:

- Hướng dẫn giọng văn và thương hiệu của công ty bạn.
- Tài liệu kỹ thuật của sản phẩm.
- Đề cương, giáo trình của môn học bạn đang ôn.

### 2. Chỉ dẫn tuỳ chỉnh (Custom Instructions)

Đây là phần bạn dặn dò Claude **cách hành xử** trong toàn bộ dự án. Ví dụ:

- "Luôn trả lời bằng tiếng Việt, giọng văn thân thiện."
- "Khi viết code, luôn kèm chú thích giải thích."
- "Trả lời ngắn gọn, gạch đầu dòng, không lan man."

Chỉ dẫn tuỳ chỉnh giống như "tính cách mặc định" của Claude trong dự án — bạn đặt một lần, áp dụng cho mọi cuộc trò chuyện bên trong.

---

## Cách tạo và dùng một Project

Các bước cơ bản (giao diện cụ thể tuỳ cập nhật):

1. Trên claude.ai, tìm mục **Projects** và chọn tạo dự án mới.
2. Đặt **tên** và **mô tả ngắn** cho dự án (ví dụ: "Blog du lịch cá nhân").
3. Thêm **kiến thức nền**: tải lên các file/tài liệu cần thiết.
4. Viết **chỉ dẫn tuỳ chỉnh**: dặn Claude phong cách, ngôn ngữ, định dạng mong muốn.
5. Bắt đầu một cuộc hội thoại trong dự án và làm việc bình thường.

Mỗi khi bạn quay lại dự án, mọi cuộc trò chuyện cũ vẫn còn đó và Claude vẫn "nhớ" tài liệu nền cùng chỉ dẫn của bạn.

---

## Ví dụ thực tế

### Ví dụ 1: Dự án viết blog

Bạn tạo Project tên **"Blog ẩm thực"**:

- **Knowledge**: tài liệu về phong cách viết bài, danh sách từ khoá SEO, vài bài mẫu bạn thích.
- **Custom Instructions**: "Viết tiếng Việt, giọng văn gần gũi, mỗi bài có tiêu đề hấp dẫn, mở bài lôi cuốn, 3–5 đoạn thân bài và một đoạn kết kêu gọi bình luận."

Từ đó, mỗi lần bạn mở cuộc trò chuyện mới chỉ cần gõ "Viết bài về món phở bò Hà Nội" là Claude đã biết đúng phong cách, không cần dặn lại.

### Ví dụ 2: Dự án học tập

Bạn tạo Project tên **"Ôn thi môn Lịch sử"**:

- **Knowledge**: tải lên đề cương ôn tập và tài liệu bài giảng.
- **Custom Instructions**: "Giải thích đơn giản như cho học sinh lớp 10, luôn kèm ví dụ và mốc thời gian, cuối mỗi câu trả lời tạo 2 câu hỏi tự kiểm tra."

Khi bạn hỏi "Tóm tắt nguyên nhân Chiến tranh thế giới thứ hai", Claude sẽ bám sát tài liệu bạn đã nạp và trả lời theo đúng cách bạn muốn.

---

## Mẹo dùng hiệu quả

- **Tài liệu nền gọn và đúng trọng tâm**: chỉ nạp tài liệu thực sự liên quan để Claude tập trung đúng ngữ cảnh.
- **Chỉ dẫn rõ ràng, cụ thể**: thay vì "viết hay", hãy ghi rõ độ dài, giọng văn, định dạng.
- **Một dự án = một chủ đề**: tránh nhồi nhiều chủ đề khác nhau vào cùng một dự án để ngữ cảnh không bị nhiễu.
- **Cập nhật tài liệu khi cần**: nếu thông tin nền thay đổi, hãy cập nhật lại knowledge để câu trả lời luôn chính xác.

---

## Tóm tắt

- **Projects** là không gian gom nhiều cuộc hội thoại quanh một chủ đề, giúp Claude nhớ ngữ cảnh xuyên suốt.
- Hai thành phần cốt lõi: **Knowledge** (tài liệu nền) và **Custom Instructions** (chỉ dẫn tuỳ chỉnh về cách hành xử).
- Dùng Projects khi bạn làm việc dài hạn, có tài liệu nền cố định, muốn phong cách trả lời nhất quán.
- Ví dụ điển hình: dự án viết blog, dự án ôn thi/học tập.
- Mẹo: tài liệu gọn đúng trọng tâm, chỉ dẫn cụ thể, mỗi dự án một chủ đề.
- Lưu ý: tính năng và giao diện có thể khác nhau tuỳ gói và tuỳ cập nhật.
