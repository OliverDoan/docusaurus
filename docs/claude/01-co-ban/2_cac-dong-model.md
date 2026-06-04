---
sidebar_position: 2
title: "2. Các dòng model Claude"
---

# Các dòng model Claude

---

## Mục lục

- [Vì sao có nhiều dòng model?](#vì-sao-có-nhiều-dòng-model)
- [Ba dòng model chính](#ba-dòng-model-chính)
- [Bảng so sánh nhanh](#bảng-so-sánh-nhanh)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- [Hiểu về số phiên bản](#hiểu-về-số-phiên-bản)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có nhiều dòng model?

Không phải công việc nào cũng cần "bộ não" mạnh nhất. Viết một câu chào mừng đơn giản và thiết kế kiến trúc một hệ thống lớn là hai việc rất khác nhau về độ khó.

Vì vậy Anthropic cung cấp nhiều dòng model với cân bằng khác nhau giữa **sức mạnh suy luận**, **tốc độ**, và **chi phí**. Bạn chọn model phù hợp để vừa tiết kiệm vừa đạt chất lượng mong muốn.

Dòng model hiện tại là **Claude 4.x**, gồm ba nhánh: **Opus**, **Sonnet** và **Haiku**.

## Ba dòng model chính

### Opus — mạnh nhất

**Opus** là dòng model có khả năng **suy luận sâu** nhất. Nó phù hợp với những việc khó, đòi hỏi nhiều bước suy nghĩ, phân tích phức tạp hoặc sáng tạo cao.

Đổi lại, Opus thường **chậm hơn** và **tốn chi phí hơn** so với hai dòng kia. Bạn nên để dành Opus cho những bài toán thực sự khó.

### Sonnet — cân bằng

**Sonnet** cân bằng tốt giữa **tốc độ** và **chất lượng**. Đây là lựa chọn "dùng hằng ngày" cho phần lớn công việc. Đặc biệt, Sonnet **viết code rất tốt**, nên nhiều lập trình viên chọn nó làm mặc định.

Nếu chưa biết chọn gì, Sonnet thường là điểm khởi đầu hợp lý.

### Haiku — nhanh và tiết kiệm nhất

**Haiku** là dòng **nhanh nhất** và **tiết kiệm chi phí nhất**. Nó phù hợp với các việc đơn giản, lặp đi lặp lại, hoặc cần xử lý với **tần suất cao** (ví dụ: phân loại hàng loạt tin nhắn, trả lời câu hỏi ngắn).

Với việc dễ, Haiku cho kết quả nhanh mà vẫn đủ tốt, giúp bạn không phải trả nhiều cho sức mạnh không cần thiết.

## Bảng so sánh nhanh

| Tiêu chí | Opus | Sonnet | Haiku |
|---|---|---|---|
| Sức mạnh suy luận | Cao nhất | Tốt | Vừa đủ |
| Tốc độ | Chậm hơn | Nhanh | Nhanh nhất |
| Chi phí | Cao hơn | Trung bình | Thấp nhất |
| Phù hợp với | Việc khó, phức tạp | Việc hằng ngày, code | Việc đơn giản, tần suất cao |
| Bản mới nhất (khi viết) | Opus 4.8 | Sonnet 4.6 | Haiku 4.5 |

> Lưu ý: số liệu chi phí cụ thể và giới hạn thay đổi theo thời gian — vui lòng xem trang chính thức của Anthropic để biết thông tin cập nhật.

## Khi nào dùng cái nào?

Dưới đây là vài tình huống thực tế để bạn dễ hình dung.

### Nên dùng Opus khi...

- Thiết kế kiến trúc cho một dự án phần mềm lớn.
- Phân tích một tài liệu pháp lý/kỹ thuật dài và phức tạp để rút ra kết luận.
- Giải một bài toán logic nhiều bước, hoặc sửa một lỗi khó mà các model khác chưa làm được.

Ví dụ: *"Đọc toàn bộ báo cáo tài chính này và đề xuất chiến lược cắt giảm chi phí kèm rủi ro của từng phương án."*

### Nên dùng Sonnet khi...

- Viết và sửa code cho công việc hằng ngày.
- Soạn email, tài liệu, bài viết có độ dài vừa phải.
- Tóm tắt, giải thích, brainstorm ý tưởng ở mức phổ thông.

Ví dụ: *"Viết một hàm Python kiểm tra email hợp lệ và viết luôn vài test cho nó."*

### Nên dùng Haiku khi...

- Phân loại nhanh hàng loạt: ví dụ gắn nhãn "tích cực / tiêu cực" cho nhiều bình luận.
- Trả lời các câu hỏi ngắn, tra cứu nhanh.
- Tác vụ chạy lặp lại nhiều lần, cần tiết kiệm chi phí và độ trễ thấp.

Ví dụ: *"Phân loại 500 phản hồi khách hàng này thành 3 nhóm: khen, chê, hỏi thông tin."*

## Hiểu về số phiên bản

Tên model thường gồm hai phần: **dòng** (Opus / Sonnet / Haiku) và **số phiên bản** (ví dụ 4.8, 4.6, 4.5).

- Phần dòng cho biết định vị về sức mạnh/tốc độ/chi phí.
- Phần số cho biết thế hệ và lần cập nhật. Số càng mới thường càng được cải thiện.

Khi Anthropic ra phiên bản mới, tên và con số có thể thay đổi. Vì vậy hãy xem trang chính thức của Anthropic để biết model mới nhất đang khả dụng.

## Tóm tắt

- Có ba dòng model chính: **Opus** (mạnh nhất, việc khó), **Sonnet** (cân bằng, dùng hằng ngày, code tốt), **Haiku** (nhanh & rẻ nhất, việc đơn giản tần suất cao).
- Chọn model theo độ khó công việc để cân bằng **chất lượng — tốc độ — chi phí**.
- Nếu phân vân, **Sonnet** là điểm khởi đầu an toàn.
- Bản mới nhất khi viết tài liệu: Opus 4.8, Sonnet 4.6, Haiku 4.5 — nhưng hãy kiểm tra trang chính thức của Anthropic vì thông tin thay đổi theo thời gian.
