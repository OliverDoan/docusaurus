---
sidebar_position: 4
title: "4. Lỗi prompt thường gặp"
---

# Lỗi prompt thường gặp

Hầu hết những lần "Claude trả lời không đúng ý" đều bắt nguồn từ prompt, chứ không phải Claude "dở". Bài này liệt kê 5 lỗi phổ biến nhất của người mới, kèm cách sửa cụ thể qua so sánh prompt DỞ và prompt TỐT.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Đa số lỗi "Claude trả lời sai ý" đến từ prompt** — không phải do Claude "dở".
- **5 lỗi phổ biến** — mơ hồ, thiếu ngữ cảnh, hỏi quá nhiều thứ, không nêu định dạng, không tinh chỉnh.
- **Cách sửa chung** — cụ thể hóa, dán đủ dữ liệu, tách nhỏ việc, ghi rõ định dạng, và lặp lại để tinh chỉnh.
- **Coi câu trả lời đầu là bản nháp** — phản hồi cụ thể điều cần sửa thay vì làm lại từ đầu.

:::

---

## Mục lục

- [Lỗi 1: Prompt mơ hồ](#lỗi-1-prompt-mơ-hồ)
- [Lỗi 2: Thiếu ngữ cảnh](#lỗi-2-thiếu-ngữ-cảnh)
- [Lỗi 3: Hỏi quá nhiều thứ cùng lúc](#lỗi-3-hỏi-quá-nhiều-thứ-cùng-lúc)
- [Lỗi 4: Không nêu định dạng](#lỗi-4-không-nêu-định-dạng)
- [Lỗi 5: Không tinh chỉnh sau câu trả lời đầu](#lỗi-5-không-tinh-chỉnh-sau-câu-trả-lời-đầu)
- [Bảng tổng hợp](#bảng-tổng-hợp)
- [Tóm tắt](#tóm-tắt)

---

## Lỗi 1: Prompt mơ hồ

Dùng từ chung chung khiến Claude phải đoán, và thường đoán không trúng.

DỞ:

```text
Giúp tôi cải thiện cái này.
```

Claude không biết "cái này" là gì, "cải thiện" theo hướng nào.

TỐT:

```text
Hãy rút gọn đoạn giới thiệu công ty dưới đây xuống còn 3 câu, giữ
lại thông tin về lĩnh vực hoạt động và năm thành lập: [dán đoạn văn]
```

**Cách sửa**: thay từ mơ hồ ("cái này", "cải thiện", "hay hơn") bằng động từ và mục tiêu cụ thể (rút gọn còn 3 câu, giữ thông tin X).

---

## Lỗi 2: Thiếu ngữ cảnh

Hỏi mà quên cung cấp thông tin nền hoặc dữ liệu liên quan. Claude không đọc được suy nghĩ của bạn.

DỞ:

```text
Câu trả lời của khách thế này có ổn không?
```

(Claude chẳng thấy câu trả lời nào, cũng không biết bối cảnh.)

TỐT:

```text
Tôi làm chăm sóc khách hàng. Khách phàn nàn giao hàng trễ 2 ngày.
Đây là phản hồi tôi định gửi: "[dán phản hồi]".
Hãy đánh giá phản hồi có đủ đồng cảm và chuyên nghiệp không, và đề
xuất cách viết lại nếu cần.
```

**Cách sửa**: dán sẵn dữ liệu cần xử lý + nói rõ bạn là ai, tình huống là gì.

---

## Lỗi 3: Hỏi quá nhiều thứ cùng lúc

Nhồi nhiều yêu cầu không liên quan vào một prompt khiến câu trả lời bị loãng, mỗi phần đều hời hợt.

DỞ:

```text
Viết kế hoạch kinh doanh quán cà phê, thiết kế logo, gợi ý tên,
tính chi phí mở quán, viết bài đăng Facebook khai trương và lập
lịch nội dung 1 tháng.
```

TỐT — tách thành các prompt riêng, làm lần lượt:

```text
Bước 1: Gợi ý 10 cái tên cho quán cà phê phong cách vintage, kèm
giải thích ngắn ý nghĩa mỗi tên.
```

Xong bước này mới sang bước tiếp (chi phí, rồi bài đăng...). Đây chính là kỹ thuật **chia nhỏ nhiệm vụ** đã học ở bài trước.

**Cách sửa**: mỗi prompt chỉ tập trung **một nhiệm vụ chính**. Việc lớn thì chia chuỗi.

---

## Lỗi 4: Không nêu định dạng

Không nói rõ muốn nhận về dạng gì, dẫn đến Claude trả về một đoạn văn dài trong khi bạn cần bảng hoặc danh sách.

DỞ:

```text
Liệt kê ưu nhược điểm của làm việc từ xa.
```

(Có thể nhận về một đoạn văn khó tra cứu.)

TỐT:

```text
Liệt kê ưu và nhược điểm của làm việc từ xa dưới dạng bảng 2 cột:
"Ưu điểm" và "Nhược điểm", mỗi cột 5 ý ngắn gọn.
```

**Cách sửa**: luôn nêu rõ định dạng — bảng, gạch đầu dòng, đánh số, độ dài, ngôn ngữ.

---

## Lỗi 5: Không tinh chỉnh sau câu trả lời đầu

Nhiều người thấy kết quả chưa ưng là xóa đi gõ lại từ đầu, hoặc bỏ cuộc. Thực ra **trò chuyện là quá trình lặp** — bạn nên yêu cầu Claude chỉnh sửa tiếp dựa trên kết quả trước.

DỞ — bỏ cuộc hoặc làm lại từ đầu:

```text
(Xóa hết, gõ lại một prompt mới hoàn toàn.)
```

TỐT — tinh chỉnh ngay trên kết quả vừa có:

```text
Tốt rồi, nhưng hãy:
- Làm cho giọng văn thân thiện hơn
- Rút ngắn còn một nửa
- Bỏ đoạn nói về giá
```

Claude nhớ ngữ cảnh trong cùng cuộc trò chuyện, nên bạn chỉ cần nói **điều cần thay đổi**. Vài vòng tinh chỉnh thường cho kết quả tốt hơn nhiều so với một prompt hoàn hảo ngay lần đầu.

**Cách sửa**: coi câu trả lời đầu là bản nháp. Phản hồi cụ thể điều muốn sửa thay vì làm lại.

---

## Bảng tổng hợp

| Lỗi | Dấu hiệu | Cách sửa |
|-----|----------|----------|
| Mơ hồ | Dùng "cái này", "hay hơn" | Động từ + mục tiêu cụ thể |
| Thiếu ngữ cảnh | Hỏi mà không dán dữ liệu | Dán dữ liệu + nói rõ tình huống |
| Hỏi quá nhiều | Nhiều yêu cầu trong 1 prompt | Mỗi prompt 1 nhiệm vụ; chia chuỗi |
| Không nêu định dạng | Nhận về dạng không mong muốn | Ghi rõ bảng/danh sách/độ dài |
| Không tinh chỉnh | Làm lại từ đầu khi chưa ưng | Phản hồi cụ thể điều cần sửa |

---

## Tóm tắt

- Đa số lỗi "Claude trả lời sai ý" đến từ **prompt**, không phải từ Claude.
- 5 lỗi phổ biến: **mơ hồ, thiếu ngữ cảnh, hỏi quá nhiều, không nêu định dạng, không tinh chỉnh**.
- Cách sửa chung: cụ thể hóa, dán đủ dữ liệu, tách nhỏ việc, ghi rõ định dạng, và **lặp lại để tinh chỉnh**.
- Khi gặp kết quả chưa ưng, hãy tự hỏi: "Prompt của mình đã đủ rõ 4 nguyên tắc chưa?" trước khi đổ lỗi cho Claude.
- Bạn đã hoàn thành nhóm quan trọng nhất. Hãy luyện tập bằng chính công việc thực tế của mình.
