---
sidebar_position: 2
title: "2. Cấu trúc một prompt tốt"
---

# Cấu trúc một prompt tốt

Ở bài trước bạn đã biết 4 nguyên tắc. Bài này biến chúng thành một **công thức** dễ nhớ, áp dụng được cho gần như mọi yêu cầu. Bạn sẽ học cách sắp xếp prompt theo từng phần, và cách dùng "thẻ" để chia vùng cho rõ ràng.

---

## Mục lục

- [Công thức 5 phần](#công-thức-5-phần)
- [Giải thích từng phần](#giải-thích-từng-phần)
- [Phân vùng prompt bằng thẻ XML hoặc Markdown](#phân-vùng-prompt-bằng-thẻ-xml-hoặc-markdown)
- [Ví dụ prompt đầy đủ](#ví-dụ-prompt-đầy-đủ)
- [Mẫu prompt để bạn copy](#mẫu-prompt-để-bạn-copy)
- [Tóm tắt](#tóm-tắt)

---

## Công thức 5 phần

> **Vai trò + Bối cảnh + Nhiệm vụ + Định dạng + Ràng buộc**

Không phải prompt nào cũng cần đủ 5 phần. Với câu hỏi đơn giản, chỉ cần Nhiệm vụ là đủ. Nhưng với yêu cầu quan trọng, càng đủ phần thì kết quả càng sát ý.

| Phần | Trả lời câu hỏi | Ví dụ ngắn |
|------|------------------|------------|
| **Vai trò** | Claude đóng vai ai? | "Bạn là chuyên gia tuyển dụng" |
| **Bối cảnh** | Có thông tin nền gì? | "Tôi đang ứng tuyển vị trí kế toán" |
| **Nhiệm vụ** | Cần làm gì? | "Viết lại đoạn mô tả kinh nghiệm" |
| **Định dạng** | Trả về dạng gì? | "Gạch đầu dòng, mỗi ý 1 dòng" |
| **Ràng buộc** | Giới hạn nào? | "Dưới 80 từ, tiếng Việt trang trọng" |

---

## Giải thích từng phần

### Vai trò (Role)

Gán cho Claude một "vai" giúp nó chọn đúng giọng văn và kiến thức.

```text
Bạn là một giáo viên tiếng Anh giàu kinh nghiệm dạy người mới.
```

### Bối cảnh (Context)

Cung cấp thông tin nền: bạn là ai, dữ liệu liên quan, tình huống. Đây là phần hay bị bỏ quên nhất.

```text
Học viên của tôi 40 tuổi, chưa từng học tiếng Anh, sợ ngữ pháp.
```

### Nhiệm vụ (Task)

Nói rõ việc cần làm. Dùng động từ mệnh lệnh: "viết", "tóm tắt", "so sánh", "phân tích"...

```text
Hãy thiết kế bài học đầu tiên để tạo cảm hứng, không gây áp lực.
```

### Định dạng (Format)

Mô tả cấu trúc đầu ra: đoạn văn, danh sách, bảng, code, JSON...

```text
Trình bày theo từng bước, đánh số 1, 2, 3.
```

### Ràng buộc (Constraints)

Các giới hạn: độ dài, ngôn ngữ, giọng văn, điều cần tránh.

```text
Tối đa 200 từ. Tiếng Việt. Không dùng thuật ngữ ngữ pháp khó.
```

---

## Phân vùng prompt bằng thẻ XML hoặc Markdown

Khi prompt dài và có nhiều phần (ví dụ kèm theo một đoạn dữ liệu cần xử lý), bạn nên **chia vùng** để Claude phân biệt đâu là chỉ dẫn, đâu là dữ liệu. Claude hỗ trợ tốt cả hai cách dưới đây.

### Cách 1 — Dùng thẻ XML

**Thẻ XML** (XML tag) là cặp nhãn dạng `<tên>...</tên>` để bọc một khối nội dung. Tên thẻ do bạn tự đặt sao cho dễ hiểu.

```text
<bối_cảnh>
Tôi quản lý một fanpage bán hoa tươi, 5.000 lượt thích.
</bối_cảnh>

<nhiệm_vụ>
Viết 3 ý tưởng nội dung đăng cho dịp Ngày của Mẹ.
</nhiệm_vụ>

<định_dạng>
Mỗi ý tưởng gồm: tiêu đề ngắn + 2 câu mô tả.
</định_dạng>
```

Cách này đặc biệt hữu ích khi bạn dán một văn bản dài và muốn nói rõ "đây là dữ liệu cần xử lý":

```text
Hãy tóm tắt bài viết trong thẻ <bài_viết> thành 5 gạch đầu dòng.

<bài_viết>
[dán toàn bộ bài viết dài vào đây...]
</bài_viết>
```

### Cách 2 — Dùng tiêu đề Markdown

**Markdown** là cách định dạng văn bản đơn giản bằng ký hiệu, ví dụ `##` tạo tiêu đề. Bạn dùng tiêu đề để tách phần:

```text
## Vai trò
Bạn là biên tập viên nội dung.

## Nhiệm vụ
Sửa đoạn văn dưới cho mạch lạc hơn.

## Văn bản cần sửa
[dán văn bản vào đây]
```

> Mẹo: Cả hai cách đều tốt. Người mới thường thấy thẻ XML rõ ràng hơn khi cần tách "dữ liệu" khỏi "chỉ dẫn".

---

## Ví dụ prompt đầy đủ

Áp dụng đủ 5 phần cho một tình huống thực tế:

```text
<vai_trò>
Bạn là chuyên gia tư vấn nghề nghiệp, từng đọc hàng nghìn CV.
</vai_trò>

<bối_cảnh>
Tôi tốt nghiệp ngành Marketing, có 1 năm kinh nghiệm chạy quảng cáo
Facebook cho một shop quần áo. Tôi đang ứng tuyển vị trí
"Digital Marketing Executive" tại một công ty thương mại điện tử.
</bối_cảnh>

<nhiệm_vụ>
Viết lại phần "Kinh nghiệm làm việc" trong CV cho ấn tượng và
nhấn mạnh kết quả đo lường được (số liệu).
</nhiệm_vụ>

<định_dạng>
Trình bày dạng gạch đầu dòng, mỗi dòng bắt đầu bằng một động từ
mạnh (ví dụ: Tối ưu, Tăng trưởng, Quản lý).
</định_dạng>

<ràng_buộc>
- Tối đa 5 gạch đầu dòng
- Tiếng Việt, giọng chuyên nghiệp
- Nếu thiếu số liệu, hãy để chỗ trống dạng [____] để tôi tự điền
</ràng_buộc>
```

Prompt này gần như không thể bị hiểu sai: Claude biết đóng vai ai, hoàn cảnh của bạn, việc cần làm, định dạng và mọi giới hạn.

---

## Mẫu prompt để bạn copy

Lưu mẫu này lại và điền vào chỗ trống mỗi khi cần:

```text
Vai trò: Bạn là [chuyên gia/nghề gì].
Bối cảnh: [tôi là ai, tình huống, dữ liệu liên quan].
Nhiệm vụ: [việc cụ thể cần làm].
Định dạng: [đoạn văn / gạch đầu dòng / bảng / code...].
Ràng buộc: [độ dài, ngôn ngữ, giọng văn, điều cần tránh].
```

---

## Tóm tắt

- Công thức vàng: **Vai trò + Bối cảnh + Nhiệm vụ + Định dạng + Ràng buộc**.
- Câu hỏi đơn giản chỉ cần Nhiệm vụ; yêu cầu quan trọng nên dùng đủ 5 phần.
- Dùng **thẻ XML** (`<tên>...</tên>`) hoặc **tiêu đề Markdown** (`##`) để chia vùng, đặc biệt khi dán dữ liệu dài.
- Giữ sẵn một **mẫu prompt** để điền nhanh.
- Bài tiếp theo: các **kỹ thuật nâng cao** giúp Claude suy nghĩ sâu và làm việc khó hơn.
