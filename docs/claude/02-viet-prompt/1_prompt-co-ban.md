---
sidebar_position: 1
title: "1. Prompt là gì & nguyên tắc cơ bản"
---

# Prompt là gì & nguyên tắc cơ bản

Đây là bài quan trọng nhất khi học dùng Claude. Bạn không cần biết lập trình — chỉ cần biết **ra đề bài** cho Claude một cách rõ ràng. Bài này giải thích prompt là gì và 4 nguyên tắc giúp Claude trả lời đúng ý ngay từ lần đầu.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Prompt` là đoạn văn bản giao việc cho Claude** — prompt tốt → kết quả tốt, prompt mơ hồ → kết quả mơ hồ.
- **Coi Claude như cộng sự giỏi nhưng mới** — nó không tự đoán được ý bạn nếu bạn nói mơ hồ.
- **4 nguyên tắc cốt lõi** — Rõ ràng, Cụ thể, Đủ ngữ cảnh, Nêu định dạng.
- **Prompt tốt trả lời sẵn mọi câu Claude có thể hỏi lại** — ai, cái gì, dài bao nhiêu, định dạng nào.

:::

---

## Mục lục

- [Prompt là gì?](#prompt-là-gì)
- [Vì sao prompt quan trọng?](#vì-sao-prompt-quan-trọng)
- [4 nguyên tắc cốt lõi](#4-nguyên-tắc-cốt-lõi)
- [Ví dụ: prompt dở vs prompt tốt](#ví-dụ-prompt-dở-vs-prompt-tốt)
- [Tóm tắt](#tóm-tắt)

---

## Prompt là gì?

**Prompt** (câu lệnh / lời nhắc) là **đoạn văn bản bạn gửi cho Claude** để yêu cầu nó làm một việc gì đó. Mỗi tin nhắn bạn gõ vào ô chat chính là một prompt.

Hãy hình dung Claude như **một cộng sự rất giỏi nhưng mới vào làm**: thông minh, làm nhanh, nhưng **không tự đoán được ý bạn** nếu bạn nói mơ hồ. Prompt chính là cách bạn "giao việc" cho cộng sự đó.

> Ghi nhớ: Chất lượng câu trả lời phụ thuộc rất lớn vào chất lượng prompt. Prompt tốt → kết quả tốt. Prompt mơ hồ → kết quả mơ hồ.

---

## Vì sao prompt quan trọng?

Claude không biết:

- Bạn **là ai** và đang làm trong **lĩnh vực** gì
- **Mục đích** thật sự đằng sau câu hỏi
- Bạn muốn câu trả lời **dài hay ngắn**, **trang trọng hay thân mật**
- **Định dạng** mong muốn (đoạn văn, gạch đầu dòng, bảng, code...)

Tất cả những thứ này **bạn phải nói ra**. Claude rất giỏi làm theo chỉ dẫn chi tiết — bạn càng chỉ rõ, nó càng làm đúng.

---

## 4 nguyên tắc cốt lõi

Ghi nhớ 4 chữ: **Rõ ràng — Cụ thể — Ngữ cảnh — Định dạng**.

### 1. Rõ ràng (Clear)

Nói thẳng việc bạn muốn Claude làm. Tránh câu chung chung kiểu "giúp tôi việc này".

- Dở: "Nói về marketing."
- Tốt: "Giải thích 3 kênh marketing online phổ biến nhất cho quán cà phê nhỏ."

### 2. Cụ thể (Specific)

Thêm con số, phạm vi, đối tượng. Càng cụ thể, Claude càng đỡ phải đoán.

- Dở: "Viết bài quảng cáo."
- Tốt: "Viết 1 bài quảng cáo Facebook **dài 100 từ** cho khóa học tiếng Anh giao tiếp, **đối tượng là nhân viên văn phòng 25-35 tuổi**."

### 3. Đủ ngữ cảnh (Context)

**Ngữ cảnh** (context — thông tin nền) là những gì Claude cần biết để làm đúng: bạn là ai, dữ liệu liên quan, ràng buộc... Hãy dán (paste) sẵn thông tin cần thiết vào prompt.

- Dở: "Email này ổn chưa?" (Claude không thấy email nào cả.)
- Tốt: "Dưới đây là email tôi định gửi khách hàng. Hãy kiểm tra giọng văn có lịch sự không và sửa lỗi chính tả: [dán email vào đây]"

### 4. Nêu định dạng mong muốn (Format)

Nói rõ bạn muốn nhận về thứ gì: đoạn văn, danh sách gạch đầu dòng, bảng, đoạn code, JSON...

- Dở: "So sánh iPhone và Samsung."
- Tốt: "So sánh iPhone 15 và Samsung S24 theo **dạng bảng**, gồm các cột: giá, camera, pin, ưu điểm, nhược điểm."

---

## Ví dụ: prompt dở vs prompt tốt

### Ví dụ 1 — Viết email

Prompt DỞ:

```text
Viết email xin nghỉ phép.
```

Claude phải đoán: nghỉ mấy ngày? Lý do gì? Gửi cho ai? Giọng văn ra sao?

Prompt TỐT:

```text
Viết một email xin nghỉ phép gửi quản lý trực tiếp tên là chị Lan.
- Nghỉ 2 ngày: thứ Năm và thứ Sáu tuần này
- Lý do: việc gia đình
- Giọng văn: lịch sự, chuyên nghiệp, ngắn gọn (dưới 120 từ)
- Tiếng Việt, có lời chào và ký tên "Minh"
```

### Ví dụ 2 — Học một khái niệm

Prompt DỞ:

```text
Giải thích blockchain.
```

Prompt TỐT:

```text
Giải thích "blockchain" cho người hoàn toàn không rành công nghệ.
- Dùng một ví dụ đời thường (ví dụ sổ ghi nợ trong xóm)
- Độ dài khoảng 150 từ
- Tránh thuật ngữ kỹ thuật; nếu buộc phải dùng thì giải thích ngay
```

### Ví dụ 3 — Lập kế hoạch

Prompt DỞ:

```text
Lên kế hoạch tập gym.
```

Prompt TỐT:

```text
Lập kế hoạch tập gym 4 tuần cho người mới bắt đầu.
- Mục tiêu: giảm mỡ, tăng sức bền
- Tập được 3 buổi/tuần, mỗi buổi 45 phút
- Trình bày dạng bảng theo tuần và theo ngày
- Ghi rõ bài tập, số hiệp, số lần lặp
```

Bạn thấy điểm chung không? Prompt tốt luôn trả lời sẵn các câu hỏi mà Claude lẽ ra phải hỏi lại.

---

## Tóm tắt

- **Prompt** là đoạn văn bản bạn gửi cho Claude để giao việc.
- Coi Claude như cộng sự giỏi nhưng mới: nó **không tự đoán ý bạn**, bạn phải nói rõ.
- 4 nguyên tắc cốt lõi: **Rõ ràng — Cụ thể — Đủ ngữ cảnh — Nêu định dạng**.
- Prompt tốt trả lời sẵn mọi câu hỏi mà Claude có thể phải hỏi lại (ai, cái gì, dài bao nhiêu, định dạng nào).
- Bài tiếp theo sẽ học **công thức cấu trúc một prompt tốt** để áp dụng cho mọi tình huống.
