---
sidebar_position: 3
title: "3. Kỹ thuật prompt nâng cao"
---

# Kỹ thuật prompt nâng cao

Khi đã quen với cấu trúc cơ bản, 5 kỹ thuật trong bài này sẽ giúp bạn "nâng cấp" chất lượng câu trả lời rõ rệt — nhất là với việc khó, dài hoặc cần độ chính xác cao. Mỗi kỹ thuật đều có ví dụ thực tế để bạn dùng ngay.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Role prompting`** — gán cho Claude vai chuyên gia để trả lời đúng tông và sâu hơn.
- ⭐ **`Few-shot`** — đưa 1-3 ví dụ mẫu để Claude bắt chước đúng phong cách, định dạng.
- **`Chain-of-thought`** — thêm "hãy suy nghĩ từng bước" để giảm sai sót cho bài toán, logic.
- **`Prompt chaining`** — chia việc lớn thành các bước nhỏ, kiểm soát từng bước.
- **Cho phép hỏi lại** — bảo Claude hỏi khi thiếu thông tin thay vì đoán sai.

:::

---

## Mục lục

- [Gán vai trò (Role Prompting)](#gán-vai-trò-role-prompting)
- [Cho ví dụ mẫu (Few-shot)](#cho-ví-dụ-mẫu-few-shot)
- [Yêu cầu suy nghĩ từng bước (Chain-of-Thought)](#yêu-cầu-suy-nghĩ-từng-bước-chain-of-thought)
- [Chia nhỏ nhiệm vụ (Prompt Chaining)](#chia-nhỏ-nhiệm-vụ-prompt-chaining)
- [Yêu cầu Claude hỏi lại khi thiếu thông tin](#yêu-cầu-claude-hỏi-lại-khi-thiếu-thông-tin)
- [Tóm tắt](#tóm-tắt)

---

## Gán vai trò (Role Prompting)

**Role prompting** (gán vai trò) là việc bảo Claude đóng vai một chuyên gia cụ thể. Điều này giúp nó chọn đúng kiến thức, giọng văn và mức độ chuyên sâu.

Không có vai trò:

```text
Góp ý cho bài thuyết trình của tôi.
```

Có vai trò:

```text
Bạn là một huấn luyện viên thuyết trình chuyên nghiệp, từng đào tạo
diễn giả TED. Hãy góp ý cho dàn ý bài thuyết trình của tôi dưới đây,
tập trung vào cách mở đầu gây chú ý: [dán dàn ý]
```

Cùng một câu hỏi, vai trò càng rõ thì câu trả lời càng "đúng tông" và sâu hơn.

---

## Cho ví dụ mẫu (Few-shot)

**Few-shot** (cho vài ví dụ mẫu) là kỹ thuật đưa cho Claude **1-3 ví dụ về kết quả bạn muốn**, để nó bắt chước đúng phong cách. Đây là cách nhanh nhất để "dạy" Claude định dạng mong muốn mà không cần mô tả dài dòng.

```text
Hãy viết khẩu hiệu (slogan) cho các sản phẩm theo đúng phong cách
của các ví dụ dưới đây:

Ví dụ:
- Sản phẩm: cà phê rang xay → Slogan: "Tỉnh táo từ ngụm đầu tiên."
- Sản phẩm: bình giữ nhiệt → Slogan: "Giữ nóng cả ngày, giữ chất cả đời."

Bây giờ viết slogan cho:
- Sản phẩm: bánh mì nguyên cám
- Sản phẩm: tai nghe chống ồn
```

Claude sẽ học theo nhịp điệu, độ dài và giọng văn trong ví dụ. Few-shot cực kỳ hữu ích khi bạn muốn đầu ra **đồng nhất** qua nhiều lần.

> Mẹo: Nếu kết quả chưa đúng phong cách, hãy thêm 1-2 ví dụ nữa. Ví dụ tốt "đáng giá" hơn cả đoạn mô tả dài.

---

## Yêu cầu suy nghĩ từng bước (Chain-of-Thought)

**Chain-of-thought** (chuỗi suy luận) là kỹ thuật yêu cầu Claude **trình bày quá trình suy nghĩ trước khi đưa đáp án**. Với bài toán logic, tính toán, hoặc quyết định nhiều bước, cách này giúp giảm sai sót đáng kể.

Chỉ cần thêm câu: **"Hãy suy nghĩ từng bước trước khi trả lời."**

Không dùng:

```text
Một cửa hàng giảm giá 20%, sau đó giảm thêm 10% trên giá đã giảm.
Tổng cộng giảm bao nhiêu phần trăm so với giá gốc?
```

Có dùng:

```text
Một cửa hàng giảm giá 20%, sau đó giảm thêm 10% trên giá đã giảm.
Tổng cộng giảm bao nhiêu phần trăm so với giá gốc?

Hãy suy nghĩ từng bước, tính toán rõ ràng, rồi mới đưa ra đáp án cuối.
```

Khi Claude "nói ra" từng bước, nó tự kiểm tra logic và ít sai hơn. Bạn cũng dễ phát hiện chỗ sai để góp ý.

> Áp dụng tốt cho: bài toán, phân tích ưu/nhược điểm, ra quyết định, gỡ lỗi (debug) logic.

---

## Chia nhỏ nhiệm vụ (Prompt Chaining)

**Prompt chaining** (nối chuỗi prompt) là chia một việc lớn thành **nhiều bước nhỏ**, làm lần lượt qua nhiều tin nhắn, mỗi bước dùng kết quả của bước trước. Việc càng phức tạp, chia nhỏ càng hiệu quả hơn nhồi tất cả vào một prompt.

Ví dụ viết một bài blog. Thay vì:

```text
Viết cho tôi một bài blog hoàn chỉnh 1500 từ về du lịch Đà Lạt.
```

Hãy làm theo chuỗi:

```text
Bước 1: Hãy đề xuất 5 chủ đề bài blog về du lịch Đà Lạt cho gia đình
có trẻ nhỏ.
```

(Bạn chọn 1 chủ đề, rồi gửi tiếp.)

```text
Bước 2: Với chủ đề "[chủ đề đã chọn]", hãy lập dàn ý chi tiết gồm
mở bài, 4 phần thân bài và kết bài.
```

(Duyệt dàn ý, rồi tiếp.)

```text
Bước 3: Dựa trên dàn ý trên, hãy viết hoàn chỉnh phần thân bài thứ
nhất, khoảng 300 từ, giọng thân thiện.
```

Lợi ích: bạn **kiểm soát từng bước**, chỉnh sửa kịp thời, và kết quả cuối cùng chất lượng hơn hẳn so với yêu cầu "một phát ăn ngay".

---

## Yêu cầu Claude hỏi lại khi thiếu thông tin

Một mẹo cực hữu ích cho người mới: **chủ động cho phép Claude hỏi lại** thay vì để nó tự đoán và làm sai.

```text
Tôi muốn lập kế hoạch tài chính cá nhân. Trước khi đưa lời khuyên,
hãy hỏi tôi tối đa 5 câu hỏi cần thiết để hiểu rõ tình hình của tôi.
Chỉ hỏi, đừng đưa kế hoạch vội.
```

Claude sẽ đặt câu hỏi, bạn trả lời, rồi nó mới đưa giải pháp **sát với bạn** thay vì chung chung. Kỹ thuật này biến cuộc trò chuyện thành một buổi tư vấn thực thụ.

Bạn cũng có thể thêm câu này vào cuối bất kỳ prompt nào:

```text
Nếu có chi tiết nào chưa rõ, hãy hỏi lại tôi trước khi bắt đầu.
```

---

## Tóm tắt

- **Gán vai trò**: cho Claude đóng vai chuyên gia → đúng tông, sâu hơn.
- **Few-shot**: đưa 1-3 ví dụ mẫu → Claude bắt chước đúng phong cách, định dạng.
- **Chain-of-thought**: thêm "hãy suy nghĩ từng bước" → giảm sai sót cho bài toán, logic.
- **Prompt chaining**: chia việc lớn thành các bước nhỏ → kiểm soát và chất lượng cao hơn.
- **Cho phép hỏi lại**: bảo Claude hỏi khi thiếu thông tin → tránh đoán sai.
- Bài cuối nhóm này sẽ điểm danh các **lỗi prompt thường gặp** và cách sửa.
