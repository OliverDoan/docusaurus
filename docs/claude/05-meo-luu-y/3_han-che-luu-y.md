---
sidebar_position: 3
title: "3. Hạn chế & Lưu ý quan trọng"
---

# Hạn chế & Lưu ý quan trọng

Claude rất mạnh, nhưng **không phải lúc nào cũng đúng**. Hiểu rõ giới hạn của nó giúp bạn dùng an toàn và không bị "lừa" bởi những câu trả lời nghe rất thuyết phục nhưng sai. Đây là bài quan trọng nhất về an toàn cho người mới.

---

## Mục lục

- [1. Hallucination — Claude có thể "bịa"](#1-hallucination--claude-có-thể-bịa)
- [2. Knowledge cutoff — kiến thức có mốc thời gian](#2-knowledge-cutoff--kiến-thức-có-mốc-thời-gian)
- [3. Sai số liệu và phép tính](#3-sai-số-liệu-và-phép-tính)
- [4. Bảo mật dữ liệu](#4-bảo-mật-dữ-liệu)
- [5. Luôn kiểm chứng thông tin quan trọng](#5-luôn-kiểm-chứng-thông-tin-quan-trọng)
- [Tóm tắt](#tóm-tắt)

---

## 1. Hallucination — Claude có thể "bịa"

**Hallucination** (ảo giác / bịa thông tin) là hiện tượng Claude đưa ra thông tin **nghe rất hợp lý nhưng thực ra sai hoặc không có thật**. Ví dụ: bịa ra một tên sách, một con số thống kê, một điều luật, hay một đường link không tồn tại — và trình bày chúng một cách đầy tự tin.

Vì sao xảy ra? Claude tạo câu trả lời dựa trên các mẫu ngôn ngữ nó đã học, chứ không phải tra cứu một cơ sở dữ liệu sự thật. Khi không chắc, nó vẫn có xu hướng "điền vào chỗ trống" cho mượt câu.

### Cách giảm hallucination

Thêm một câu yêu cầu Claude thừa nhận khi không chắc:

```text
Trả lời câu hỏi sau. Nếu bạn không chắc chắn hoặc không có đủ thông tin,
hãy nói thẳng "Tôi không chắc" thay vì đoán. Đừng bịa ra số liệu hay nguồn.

Câu hỏi: [câu hỏi của bạn]
```

Các cách khác:

- Yêu cầu Claude **trích dẫn cơ sở** cho mỗi khẳng định quan trọng.
- Cung cấp sẵn tài liệu và yêu cầu chỉ trả lời **dựa trên tài liệu đó**.
- Cảnh giác đặc biệt với tên riêng, con số, ngày tháng, trích dẫn và đường link.

## 2. Knowledge cutoff — kiến thức có mốc thời gian

**Knowledge cutoff** (mốc thời gian kiến thức) là thời điểm mà dữ liệu huấn luyện của Claude dừng lại. Những sự kiện xảy ra **sau mốc đó**, Claude có thể không biết hoặc biết không chính xác.

Ví dụ Claude có thể không nắm được: tin tức mới nhất, giá cả hiện tại, kết quả thể thao tuần này, hay phiên bản phần mềm vừa phát hành.

> Lưu ý: Một số phiên bản Claude có thể **tìm kiếm web** (web search) khi được bật. Khi đó nó tra cứu được thông tin mới. Nhưng nếu không bật, hãy mặc định rằng nó **không biết** chuyện vừa xảy ra.

Mẹo: với câu hỏi nhạy cảm về thời gian, hãy hỏi thẳng: "Thông tin này tính đến thời điểm nào? Bạn có chắc nó còn đúng ở hiện tại không?"

## 3. Sai số liệu và phép tính

Claude là mô hình ngôn ngữ, **không phải máy tính**. Với phép tính nhiều chữ số, thống kê phức tạp, hoặc số liệu cụ thể, nó có thể nhầm.

- Với phép tính quan trọng: tự kiểm tra lại bằng máy tính hoặc bảng tính.
- Yêu cầu Claude **trình bày từng bước** để bạn dễ soi lỗi:

```text
Tính giúp tôi: nếu vay 50 triệu, lãi 12%/năm, trả trong 24 tháng thì mỗi
tháng trả bao nhiêu? Hãy trình bày từng bước tính toán để tôi kiểm tra lại.
```

## 4. Bảo mật dữ liệu

**Không đưa thông tin nhạy cảm hoặc bí mật** vào prompt, ví dụ:

- Mật khẩu, mã OTP, số thẻ ngân hàng, mã CVV.
- Thông tin định danh cá nhân (số CCCD, hộ chiếu) của bạn hoặc người khác.
- Bí mật kinh doanh, dữ liệu khách hàng, hợp đồng chưa công bố.
- Mã nguồn nội bộ thuộc sở hữu công ty nếu chưa được phép.

Nếu cần Claude xử lý dữ liệu nhạy cảm, hãy **ẩn danh** trước: thay tên thật bằng "Khách hàng A", thay số tài khoản bằng "XXXX". Khi nghi ngờ, đừng dán vào.

## 5. Luôn kiểm chứng thông tin quan trọng

Quy tắc vàng: **Claude là trợ lý nháp, không phải nguồn sự thật cuối cùng.** Với mọi thông tin quan trọng — pháp lý, y tế, tài chính, số liệu, trích dẫn — hãy kiểm chứng từ nguồn đáng tin cậy trước khi sử dụng.

Mức độ cần kiểm chứng:

- **Cao** (bắt buộc kiểm tra): tư vấn y tế, pháp luật, đầu tư; số liệu công bố; tên người/sự kiện cụ thể.
- **Trung bình**: gợi ý kỹ thuật, công thức, hướng dẫn từng bước — nên thử nghiệm trước.
- **Thấp**: brainstorm ý tưởng, viết nháp văn bản, gợi ý từ ngữ — rủi ro nhỏ.

---

## Tóm tắt

- **Hallucination**: Claude có thể bịa thông tin nghe hợp lý nhưng sai — yêu cầu nó nói "không chắc" khi không biết, và cảnh giác với tên, số, link.
- **Knowledge cutoff**: kiến thức có mốc thời gian; nó có thể không biết sự kiện mới trừ khi bật web search.
- **Sai số liệu/toán**: Claude không phải máy tính — tự kiểm tra phép tính quan trọng.
- **Bảo mật**: không bao giờ đưa mật khẩu, dữ liệu cá nhân hay bí mật vào prompt; ẩn danh khi cần.
- **Luôn kiểm chứng** thông tin quan trọng từ nguồn đáng tin cậy. Coi Claude là trợ lý nháp, không phải chân lý.
