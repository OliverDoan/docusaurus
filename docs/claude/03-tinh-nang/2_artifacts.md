---
sidebar_position: 2
title: "2. Artifacts"
---

# Artifacts

---

## Mục lục

- [Artifacts là gì?](#artifacts-là-gì)
- [Artifacts dùng cho gì?](#artifacts-dùng-cho-gì)
- [Cách yêu cầu Claude tạo Artifact](#cách-yêu-cầu-claude-tạo-artifact)
- [Cách chỉnh sửa Artifact](#cách-chỉnh-sửa-artifact)
- [Ví dụ thực tế](#ví-dụ-thực-tế)
- [Mẹo dùng hiệu quả](#mẹo-dùng-hiệu-quả)
- [Tóm tắt](#tóm-tắt)

---

## Artifacts là gì?

**Artifacts** (tạm dịch: "sản phẩm tạo ra") là một **cửa sổ riêng bên phải** màn hình, hiển thị nội dung mà Claude tạo ra một cách **tách biệt khỏi khung chat**.

Thông thường, câu trả lời của Claude nằm trộn lẫn trong dòng hội thoại. Nhưng khi nội dung đủ lớn và bạn cần xem, chỉnh, hoặc tái sử dụng (như một đoạn code dài, một bài viết hoàn chỉnh, một trang web), Claude sẽ đưa nó vào một panel Artifact riêng. Ở đó bạn có thể:

- **Xem rõ ràng** nội dung mà không bị trôi mất trong dòng chat.
- **Chỉnh sửa trực tiếp** hoặc yêu cầu Claude cập nhật.
- **Theo dõi qua nhiều lượt**: cùng một Artifact được cập nhật dần qua nhiều lần trao đổi, thay vì tạo lại từ đầu.

> Lưu ý: việc Artifact có sẵn hay không và cách hiển thị có thể thay đổi theo gói và theo cập nhật (tuỳ gói/cập nhật).

---

## Artifacts dùng cho gì?

Artifacts phù hợp với những nội dung "có hình hài" mà bạn muốn dùng lại:

- **Mã nguồn (code)**: một đoạn script Python, một hàm JavaScript, một file cấu hình...
- **Tài liệu văn bản**: bài viết, email, kế hoạch, hợp đồng mẫu, bản tóm tắt dài.
- **Trang web**: một trang HTML/CSS đơn giản mà bạn có thể xem trước trực tiếp.
- **Biểu đồ và sơ đồ**: ví dụ sơ đồ luồng, biểu đồ minh hoạ.

Điểm chung: đây là những thứ bạn thường muốn **sao chép ra ngoài** hoặc **chỉnh đi chỉnh lại** nhiều lần.

---

## Cách yêu cầu Claude tạo Artifact

Trong nhiều trường hợp, Claude **tự động** đưa nội dung phù hợp vào Artifact. Nhưng bạn cũng có thể chủ động yêu cầu rõ ràng:

- "Viết cho tôi một trang web giới thiệu quán cà phê, để trong artifact."
- "Tạo một đoạn code Python tính tổng các số chẵn từ 1 đến 100."
- "Soạn một email xin nghỉ phép, trình bày thành tài liệu hoàn chỉnh."

Khi nội dung xuất hiện ở panel bên phải, bạn đang làm việc với một Artifact.

---

## Cách chỉnh sửa Artifact

Sức mạnh lớn nhất của Artifacts là **chỉnh sửa lặp lại** qua nhiều lượt mà không phải làm lại từ đầu. Bạn chỉ cần nói tiếp trong khung chat:

- "Đổi màu nền trang web sang xanh nhạt."
- "Thêm phần giá vào bảng menu."
- "Rút gọn email này còn 3 câu."
- "Trong đoạn code, thêm xử lý trường hợp danh sách rỗng."

Claude sẽ **cập nhật chính Artifact đó**, giữ nguyên những phần khác. Bạn theo dõi được sự thay đổi ngay trên panel.

Ngoài ra, nhiều phiên bản giao diện cho phép bạn **chỉnh trực tiếp** trong Artifact và **sao chép** nội dung ra ngoài để dùng.

---

## Ví dụ thực tế

### Ví dụ 1: Làm trang web đơn giản

Bạn nhắn: "Tạo một trang web một trang giới thiệu CV của tôi, gồm tên, kỹ năng và liên hệ."

Claude tạo một Artifact HTML và bạn xem trước ngay. Sau đó bạn tinh chỉnh:

- "Thêm mục Kinh nghiệm làm việc với 2 dòng."
- "Cho phần tiêu đề chữ to và in đậm hơn."

Mỗi yêu cầu cập nhật ngay vào trang web đó, đến khi ưng ý thì sao chép code ra dùng.

### Ví dụ 2: Soạn và tinh chỉnh tài liệu

Bạn nhắn: "Viết một bản kế hoạch học tiếng Anh trong 30 ngày."

Claude tạo Artifact tài liệu. Bạn chỉnh dần:

- "Chia thành 4 tuần rõ ràng."
- "Thêm cột mục tiêu cho mỗi tuần."
- "Rút gọn phần mở đầu."

Kết quả là một tài liệu hoàn chỉnh, gọn gàng, dễ tải về.

---

## Mẹo dùng hiệu quả

- **Yêu cầu chỉnh từng phần nhỏ**: thay vì "làm lại hết", hãy nói rõ phần nào cần đổi để Claude giữ nguyên phần còn lại.
- **Nói rõ định dạng mong muốn**: ví dụ "dạng bảng", "dạng danh sách", "trang web một cột".
- **Tận dụng xem trước**: với trang web, hãy xem trước trực tiếp trong Artifact trước khi sao chép ra ngoài.
- **Lưu lại bản cuối**: khi đã ưng ý, sao chép nội dung Artifact ra nơi bạn cần (editor, tài liệu, dự án) để dùng lâu dài.

---

## Tóm tắt

- **Artifacts** là cửa sổ bên phải hiển thị nội dung Claude tạo, tách khỏi khung chat.
- Dùng tốt cho: **code**, **tài liệu**, **trang web**, **biểu đồ/sơ đồ**.
- Bạn có thể **xem, chỉnh trực tiếp** và yêu cầu **cập nhật qua nhiều lượt** trên cùng một Artifact.
- Mẹo: yêu cầu chỉnh từng phần nhỏ, nói rõ định dạng, tận dụng xem trước, lưu lại bản cuối.
- Lưu ý: tính năng và cách hiển thị có thể khác nhau tuỳ gói và tuỳ cập nhật.
