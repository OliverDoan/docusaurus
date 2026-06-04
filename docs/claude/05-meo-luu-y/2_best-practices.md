---
sidebar_position: 2
title: "2. Best Practices"
---

# Best Practices (Thực hành tốt nhất)

Biết Claude làm được gì là một chuyện; dùng nó **hiệu quả** lại là chuyện khác. Bài này tổng hợp 7 nguyên tắc thực hành tốt nhất (best practices) giúp bạn nhận được câu trả lời chất lượng cao ngay từ những lần đầu sử dụng.

---

## Mục lục

- [1. Rõ ràng và cụ thể](#1-rõ-ràng-và-cụ-thể)
- [2. Cung cấp đủ ngữ cảnh](#2-cung-cấp-đủ-ngữ-cảnh)
- [3. Lặp lại và tinh chỉnh](#3-lặp-lại-và-tinh-chỉnh)
- [4. Chia nhỏ việc lớn](#4-chia-nhỏ-việc-lớn)
- [5. Yêu cầu định dạng cụ thể](#5-yêu-cầu-định-dạng-cụ-thể)
- [6. Nhờ Claude tự đánh giá / phản biện](#6-nhờ-claude-tự-đánh-giá--phản-biện)
- [7. Tách hội thoại theo chủ đề](#7-tách-hội-thoại-theo-chủ-đề)
- [Tóm tắt](#tóm-tắt)

---

## 1. Rõ ràng và cụ thể

Đây là nguyên tắc quan trọng nhất. Nói thẳng việc bạn muốn, kèm con số và phạm vi cụ thể. Claude không đoán được những gì bạn không nói ra.

- Mơ hồ: "Viết gì đó về du lịch Đà Nẵng."
- Cụ thể: "Viết lịch trình du lịch Đà Nẵng 3 ngày 2 đêm cho gia đình có 2 trẻ nhỏ, ngân sách 10 triệu."

## 2. Cung cấp đủ ngữ cảnh

**Ngữ cảnh** (context — thông tin nền) là dữ liệu Claude cần để làm đúng. Hãy dán (paste) sẵn văn bản liên quan, nói rõ bạn là ai và mục đích là gì.

```text
Tôi là chủ một shop quần áo online nhỏ. Khách vừa nhắn phàn nàn vì giao
hàng trễ 3 ngày. Hãy viết tin nhắn xin lỗi, giữ khách, có đề nghị tặng
mã giảm giá 10% cho lần mua sau. Giọng văn chân thành, dưới 100 từ.
```

So với chỉ gõ "viết tin nhắn xin lỗi khách", phiên bản trên cho kết quả sát ý hơn rất nhiều.

## 3. Lặp lại và tinh chỉnh

Đừng kỳ vọng hoàn hảo ngay lần đầu. Hãy xem câu trả lời đầu tiên là **bản nháp**, rồi yêu cầu chỉnh sửa từng chút một trong cùng cuộc trò chuyện.

```text
Tốt rồi, nhưng hãy viết ngắn lại còn một nửa và bỏ phần chào hỏi dài dòng.
```

Claude nhớ ngữ cảnh trong cùng cuộc trò chuyện, nên bạn không cần lặp lại yêu cầu ban đầu.

## 4. Chia nhỏ việc lớn

Với một nhiệm vụ lớn (ví dụ "viết cả một cuốn ebook"), hãy chia thành các bước nhỏ và làm tuần tự. Việc lớn gộp một lần dễ khiến kết quả sơ sài.

- Bước 1: "Lập dàn ý cho ebook gồm 6 chương về nấu ăn cho người bận rộn."
- Bước 2: "Viết chi tiết chương 1 dựa trên dàn ý trên."
- Bước 3: "Viết tiếp chương 2..."

## 5. Yêu cầu định dạng cụ thể

Nói rõ bạn muốn nhận về thứ gì: đoạn văn, danh sách gạch đầu dòng, **bảng**, đoạn code, hay JSON. Định dạng đúng giúp bạn dùng kết quả ngay.

```text
So sánh 3 gói cước điện thoại A, B, C theo dạng bảng,
gồm cột: giá, dung lượng data, ưu điểm, phù hợp với ai.
```

## 6. Nhờ Claude tự đánh giá / phản biện

Một mẹo mạnh mà ít người biết: sau khi Claude trả lời, hãy nhờ nó **tự soi lại** chính câu trả lời của mình. Điều này thường giúp lộ ra điểm yếu hoặc lỗi.

```text
Hãy đọc lại câu trả lời vừa rồi và chỉ ra 3 điểm có thể chưa chính xác
hoặc cần kiểm chứng thêm.
```

Hoặc yêu cầu nó đóng hai vai để phản biện:

```text
Hãy đưa ra lập luận ủng hộ và lập luận phản đối cho ý tưởng kinh doanh này,
rồi kết luận khách quan.
```

## 7. Tách hội thoại theo chủ đề

Mỗi cuộc trò chuyện nên tập trung vào **một chủ đề**. Khi chuyển sang việc hoàn toàn khác, hãy mở cuộc trò chuyện mới. Lý do:

- Tránh để ngữ cảnh cũ làm "nhiễu" câu trả lời cho chủ đề mới.
- Dễ tìm lại nội dung sau này.
- Câu trả lời tập trung và chính xác hơn.

Ví dụ: đang nhờ viết email công việc thì đừng hỏi tiếp về công thức nấu ăn trong cùng cuộc trò chuyện — hãy mở chat mới.

---

## Tóm tắt

- **Rõ ràng & cụ thể** là nguyên tắc số một: nói thẳng, kèm con số và phạm vi.
- **Cung cấp đủ ngữ cảnh** — dán sẵn dữ liệu, nói rõ bạn là ai và mục đích.
- **Lặp lại tinh chỉnh**: coi câu trả lời đầu là bản nháp rồi sửa dần.
- **Chia nhỏ việc lớn** thành các bước tuần tự.
- **Yêu cầu định dạng** cụ thể (bảng, danh sách, code...).
- **Nhờ Claude tự phản biện** để lộ điểm yếu và lỗi.
- **Tách hội thoại theo chủ đề** để câu trả lời tập trung và dễ tìm lại.
