---
sidebar_position: 1
title: "1. Claude là gì?"
---

# Claude là gì?

Claude là một trợ lý AI do công ty Anthropic phát triển, thuộc loại mô hình ngôn ngữ lớn (LLM). Bạn trò chuyện với Claude bằng ngôn ngữ tự nhiên để nhờ viết lách, lập trình, học tập hay phân tích — không cần biết kỹ thuật. Bài này giới thiệu Claude là gì, làm được gì và vài khái niệm nền tảng cần nắm trước khi dùng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Claude là trợ lý AI của `Anthropic`, thuộc loại `LLM`** — mô hình ngôn ngữ lớn học từ khối lượng văn bản khổng lồ.
- **Dùng bằng ngôn ngữ tự nhiên** — chỉ cần gõ câu hỏi/yêu cầu, không cần biết kỹ thuật.
- **Làm được nhiều việc** — viết lách, lập trình, học tập, phân tích dữ liệu/tài liệu.
- **Điểm mạnh** — hiểu ngữ cảnh dài, ưu tiên an toàn/trung thực, diễn đạt rõ ràng.
- **Ba khái niệm nền** — `token` (đơn vị văn bản) và `context window` (lượng nội dung Claude thấy cùng lúc).

:::

---

## Mục lục

- [Giới thiệu nhanh](#giới-thiệu-nhanh)
- [Anthropic là ai?](#anthropic-là-ai)
- [Claude làm được những gì?](#claude-làm-được-những-gì)
- [Điểm mạnh của Claude](#điểm-mạnh-của-claude)
- [Hiểu các khái niệm nền tảng](#hiểu-các-khái-niệm-nền-tảng)
- [Một ví dụ thực tế](#một-ví-dụ-thực-tế)
- [Tóm tắt](#tóm-tắt)

---

## Giới thiệu nhanh

Claude là một trợ lý trí tuệ nhân tạo (AI) do công ty **Anthropic** phát triển. Bạn trò chuyện với Claude bằng ngôn ngữ tự nhiên — y như nhắn tin cho một người bạn am hiểu nhiều lĩnh vực — và Claude trả lời, giúp bạn viết lách, lập trình, học tập, phân tích dữ liệu và nhiều việc khác.

Về bản chất kỹ thuật, Claude là một **LLM** (Large Language Model — mô hình ngôn ngữ lớn). Đây là loại mô hình AI được huấn luyện trên một khối lượng văn bản khổng lồ để học cách hiểu và tạo ra ngôn ngữ giống con người.

Bạn không cần biết lập trình hay kiến thức kỹ thuật để dùng Claude. Chỉ cần gõ câu hỏi hoặc yêu cầu, Claude sẽ phản hồi.

## Anthropic là ai?

**Anthropic** là công ty nghiên cứu và phát triển AI đứng sau Claude. Một trong những giá trị cốt lõi mà Anthropic theo đuổi là xây dựng AI **an toàn** và **hữu ích**: AI nên trả lời trung thực, hạn chế gây hại, và từ chối những yêu cầu nguy hiểm.

Điều này có nghĩa là khi dùng Claude, bạn sẽ thấy nó cố gắng:

- Trả lời thẳng thắn, thừa nhận khi không chắc chắn thay vì bịa đặt.
- Từ chối lịch sự những yêu cầu có hại hoặc vi phạm.
- Giải thích rõ ràng, dễ hiểu thay vì phô trương.

## Claude làm được những gì?

Claude là một trợ lý đa năng. Dưới đây là những nhóm việc phổ biến nhất:

### Viết lách

- Soạn email, bài đăng mạng xã hội, bài blog.
- Viết lại cho gọn hơn, trang trọng hơn hoặc thân thiện hơn.
- Tóm tắt một văn bản dài thành vài gạch đầu dòng.

### Lập trình (code)

- Viết hàm, lớp, hoặc cả module nhỏ theo yêu cầu.
- Giải thích đoạn code bạn không hiểu.
- Tìm lỗi (bug) và đề xuất cách sửa.

### Học tập

- Giải thích một khái niệm khó bằng ngôn ngữ đơn giản.
- Tạo ví dụ minh hoạ, câu hỏi luyện tập.
- Đóng vai gia sư, kiểm tra hiểu biết của bạn.

### Phân tích

- Đọc một tài liệu dài rồi rút ra ý chính.
- So sánh nhiều phương án dựa trên tiêu chí bạn đưa ra.
- Sắp xếp, phân loại thông tin lộn xộn.

## Điểm mạnh của Claude

### Hiểu ngữ cảnh dài

Claude có thể đọc và ghi nhớ một lượng lớn nội dung trong cùng một cuộc trò chuyện — ví dụ cả một tài liệu nhiều trang. Nhờ đó nó trả lời sát với bối cảnh bạn cung cấp, thay vì chỉ dựa vào câu hỏi cuối cùng.

### Ưu tiên an toàn và trung thực

Claude được thiết kế để hạn chế đưa ra thông tin sai lệch và từ chối các yêu cầu gây hại. Nếu không chắc, nó thường nói rõ là không chắc.

### Diễn đạt tự nhiên, rõ ràng

Claude giỏi trình bày mạch lạc, chia ý thành đoạn, gạch đầu dòng, và điều chỉnh văn phong theo yêu cầu (trang trọng, thân thiện, ngắn gọn...).

## Hiểu các khái niệm nền tảng

Khi dùng Claude, bạn sẽ gặp ba khái niệm sau. Hiểu sơ qua sẽ giúp bạn dùng hiệu quả hơn.

### LLM (mô hình ngôn ngữ lớn)

LLM (Large Language Model) là loại mô hình AI học từ rất nhiều văn bản để dự đoán và tạo ra ngôn ngữ. Claude là một LLM. Bạn có thể hình dung nó như một "bộ não ngôn ngữ" đã đọc rất nhiều và nhờ đó biết cách viết, giải thích, suy luận.

### Token (đơn vị xử lý văn bản)

**Token** là đơn vị nhỏ mà mô hình dùng để xử lý văn bản. Một token có thể là một từ ngắn, một phần của từ, hoặc một dấu câu. Ví dụ tương đối: câu "Claude rất hữu ích" có thể được chia thành vài token.

Vì sao cần quan tâm? Vì lượng văn bản bạn gửi và nhận đều được đo bằng token, và mỗi cuộc trò chuyện có giới hạn token nhất định.

### Context window (cửa sổ ngữ cảnh)

**Context window** (cửa sổ ngữ cảnh) là lượng token tối đa mà Claude có thể "nhìn thấy" cùng lúc trong một cuộc trò chuyện — bao gồm cả những gì bạn gửi lẫn những gì Claude đã trả lời.

Hình dung như một chiếc bàn làm việc: bàn càng rộng thì càng để được nhiều giấy tờ cùng lúc. Khi nội dung vượt quá cửa sổ ngữ cảnh, phần cũ nhất có thể không còn được Claude lưu ý đến nữa.

## Một ví dụ thực tế

Giả sử bạn dán vào một email khách hàng dài và yêu cầu:

> "Tóm tắt email này thành 3 ý chính và gợi ý cách trả lời lịch sự."

Claude sẽ đọc toàn bộ email (nằm trong cửa sổ ngữ cảnh), hiểu nội dung, rồi trả về 3 ý chính kèm một đoạn trả lời mẫu. Bạn không cần ra lệnh từng bước — chỉ cần mô tả mong muốn rõ ràng.

## Tóm tắt

- Claude là trợ lý AI do **Anthropic** phát triển, thuộc loại **LLM** (mô hình ngôn ngữ lớn).
- Bạn dùng Claude bằng cách trò chuyện ngôn ngữ tự nhiên, không cần biết kỹ thuật.
- Claude giúp **viết lách, lập trình, học tập, phân tích** và nhiều việc khác.
- Điểm mạnh nổi bật: hiểu ngữ cảnh dài, ưu tiên an toàn/trung thực, diễn đạt rõ ràng.
- Ba khái niệm nền tảng: **token** (đơn vị văn bản), **context window** (cửa sổ ngữ cảnh — lượng nội dung Claude nhìn thấy cùng lúc), và **LLM**.
