---
sidebar_position: 2
title: "2. Skill (Agent Skills) là gì?"
---

# Skill (Agent Skills) là gì?

Bài này giới thiệu **Skill** (kỹ năng) — còn gọi là **Agent Skills** — một cách
"dạy nghề" cho Claude: đóng gói hướng dẫn, quy trình và tài nguyên vào một thư mục
để Claude tự dùng khi gặp việc phù hợp. Bạn sẽ hiểu Skill là gì, file `SKILL.md`
gồm những gì, cơ chế **progressive disclosure** (nạp dần) giúp tiết kiệm ngữ cảnh
ra sao, và Skill dùng được ở đâu (claude.ai, Claude Code, API). Hiểu Skill giúp
bạn biến Claude từ trợ lý chung chung thành chuyên gia cho đúng công việc của bạn.

---

## Mục lục

- [Vấn đề: lặp đi lặp lại cùng một hướng dẫn](#vấn-đề-lặp-đi-lặp-lại-cùng-một-hướng-dẫn)
- [Skill là gì?](#skill-là-gì-1)
- [File SKILL.md](#file-skillmd)
- [Progressive disclosure: nạp dần để tiết kiệm ngữ cảnh](#progressive-disclosure-nạp-dần-để-tiết-kiệm-ngữ-cảnh)
- [Skill dùng được ở đâu?](#skill-dùng-được-ở-đâu)
- [Skill có sẵn từ Anthropic](#skill-có-sẵn-từ-anthropic)
- [Lưu ý bảo mật](#lưu-ý-bảo-mật)
- [Tóm tắt](#tóm-tắt)

---

## Vấn đề: lặp đi lặp lại cùng một hướng dẫn

Giả sử mỗi lần nhờ Claude viết báo cáo, bạn phải dán lại cùng một bộ quy tắc: định
dạng tiêu đề ra sao, dùng giọng văn nào, chèn bảng kiểu gì. Lần nào cũng vậy —
mất công và dễ quên.

**Prompt** (lời nhắc) chỉ áp dụng cho *một* cuộc trò chuyện. Còn **Skill** giải
quyết đúng vấn đề này: bạn viết hướng dẫn **một lần**, đóng gói lại, và Claude tự
lấy ra dùng **mỗi khi** gặp việc phù hợp — ở mọi cuộc trò chuyện.

## Skill là gì?

**Skill** (Agent Skill — kỹ năng của agent) là một **thư mục** chứa hướng dẫn và
tài nguyên giúp Claude làm tốt một loại việc cụ thể. Hãy hình dung nó như **cẩm
nang hướng dẫn** (onboarding guide) bạn soạn cho một nhân viên mới: "gặp việc này
thì làm theo các bước sau, dùng mẫu này, chạy script kia".

Một Skill có thể chứa ba loại nội dung:

- **Hướng dẫn (instructions)** — văn bản chỉ cho Claude quy trình, quy tắc, best
  practice.
- **Mã (code/scripts)** — các script Claude chạy được để làm việc chính xác,
  đáng tin (vd một script xử lý PDF).
- **Tài nguyên (resources)** — tài liệu tham khảo: mẫu (template), ví dụ, schema
  cơ sở dữ liệu, tài liệu API...

Điểm mấu chốt: Claude **tự quyết định** khi nào dùng Skill dựa trên phần mô tả của
nó — bạn không cần ra lệnh thủ công (dù vẫn gọi tay được).

## File SKILL.md

Mọi Skill đều bắt buộc có một file tên `SKILL.md`. File này gồm hai phần:

1. **Frontmatter** — khối YAML giữa hai dấu `---` ở đầu file, chứa **siêu dữ
   liệu** (metadata) để Claude biết Skill này làm gì và *khi nào* dùng.
2. **Nội dung** — phần Markdown bên dưới, chứa hướng dẫn chi tiết Claude làm theo
   khi Skill được kích hoạt.

````markdown
---
name: pdf-processing
description: Trích xuất văn bản và bảng từ file PDF, điền form, gộp tài liệu. Dùng khi người dùng nhắc tới file PDF, biểu mẫu, hoặc trích xuất tài liệu.
---

# Xử lý PDF

## Bắt đầu nhanh

Dùng thư viện pdfplumber để trích xuất văn bản:

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

Để điền biểu mẫu nâng cao, xem thêm file FORMS.md.
````

Hai trường quan trọng nhất trong frontmatter:

| Trường | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `name` | Có (theo chuẩn API) | Tên Skill: chỉ chữ thường, số và dấu `-`; tối đa 64 ký tự; không chứa "claude"/"anthropic" |
| `description` | Có | Mô tả Skill **làm gì** và **khi nào dùng** — đây là thứ Claude đọc để quyết định có kích hoạt Skill không |

:::tip `description` quyết định Skill có được dùng hay không
Claude chọn Skill dựa hoàn toàn vào `description`. Hãy viết rõ **cả hai vế**: nó
làm gì *và* khi nào nên dùng (kèm từ khoá/tình huống gợi ý). Mô tả mơ hồ → Claude
không biết khi nào lấy ra dùng.
:::

## Progressive disclosure: nạp dần để tiết kiệm ngữ cảnh

Đây là ý tưởng thông minh nhất của Skill. **Progressive disclosure** (tiết lộ dần
/ nạp dần) nghĩa là Claude **chỉ nạp nội dung khi thật sự cần**, theo từng cấp,
thay vì nhồi hết mọi thứ vào ngữ cảnh ngay từ đầu.

> **Ngữ cảnh (context)**: bộ nhớ làm việc của Claude trong một phiên. Nó có giới
> hạn — càng nhồi nhiều thứ không cần thiết, Claude càng dễ "loãng" và tốn chi
> phí. Xem lại khái niệm này ở mục Claude Code.

Có ba cấp nạp:

| Cấp | Khi nào nạp | Chi phí ngữ cảnh | Nội dung |
| --- | --- | --- | --- |
| **1. Metadata** | Luôn nạp (lúc khởi động) | Rất nhỏ (~100 token/Skill) | `name` + `description` |
| **2. Hướng dẫn** | Khi Skill được kích hoạt | Vừa (dưới ~5k token) | Toàn bộ phần thân `SKILL.md` |
| **3. Tài nguyên** | Khi cần tới | Gần như không giới hạn | Các file phụ, script chạy qua bash |

Cách hoạt động: ngay từ đầu Claude **chỉ biết tên + mô tả** của mọi Skill (cấp 1,
rất nhẹ). Khi yêu cầu của bạn khớp với mô tả một Skill, Claude mới đọc phần thân
`SKILL.md` (cấp 2). Nếu phần thân tham chiếu tới file khác hay script, Claude mới
mở/chạy chúng (cấp 3).

> Nhờ vậy bạn có thể cài **rất nhiều Skill** mà không "ngốn" ngữ cảnh — vì nội
> dung nặng chỉ được nạp đúng lúc cần. Đặc biệt, **script được chạy qua bash**:
> Claude chỉ nhận *kết quả* chứ không nạp toàn bộ mã script vào ngữ cảnh.

## Skill dùng được ở đâu?

Skill hoạt động trên nhiều sản phẩm của Claude, nhưng có vài khác biệt:

| Nơi dùng | Hỗ trợ | Cách thêm Skill tuỳ chỉnh |
| --- | --- | --- |
| **claude.ai** (web) | Skill có sẵn + Skill tuỳ chỉnh | Tải lên file `.zip` trong **Settings → Features** (cần gói Pro/Max/Team/Enterprise có bật code execution) |
| **Claude Code** (CLI) | Chỉ Skill tuỳ chỉnh | Tạo thư mục Skill trong `~/.claude/skills/` (cá nhân) hoặc `.claude/skills/` (dự án) |
| **Claude API** | Skill có sẵn + tuỳ chỉnh | Tải lên qua Skills API; cần các beta header tương ứng |

:::caution Skill không tự đồng bộ giữa các nơi
Skill tải lên claude.ai **không** tự xuất hiện trên API hay Claude Code, và ngược
lại. Mỗi nơi quản lý riêng. Trên Claude Code, Skill nằm trên ổ đĩa của bạn (không
cần tải lên đâu cả).
:::

Ngoài ra, môi trường chạy cũng khác: trên **Claude Code**, Skill có toàn quyền
truy cập mạng như mọi chương trình trên máy bạn; còn trên **Claude API**, Skill
chạy trong môi trường cô lập, **không** truy cập internet và chỉ dùng được các gói
đã cài sẵn.

## Skill có sẵn từ Anthropic

Anthropic cung cấp sẵn một số Skill cho các tác vụ tài liệu phổ biến — bạn không
cần làm gì, Claude tự dùng khi phù hợp:

- **pptx** — tạo và chỉnh sửa bản trình chiếu PowerPoint.
- **xlsx** — tạo bảng tính Excel, phân tích dữ liệu, vẽ biểu đồ.
- **docx** — tạo và chỉnh sửa tài liệu Word.
- **pdf** — tạo file PDF có định dạng.

Anthropic cũng công bố các Skill mã nguồn mở tại kho `github.com/anthropics/skills`.

## Lưu ý bảo mật

Skill rất mạnh vì nó trao cho Claude **hướng dẫn và mã chạy được**. Điều đó cũng
có nghĩa một Skill độc hại có thể khiến Claude làm việc nguy hiểm (rò rỉ dữ liệu,
chạy lệnh có hại).

:::danger Chỉ dùng Skill từ nguồn tin cậy
Hãy coi việc cài một Skill **như cài phần mềm**: chỉ dùng Skill do bạn tự viết
hoặc lấy từ nguồn đáng tin (như Anthropic). Nếu buộc phải dùng Skill từ nguồn lạ,
hãy **đọc kỹ toàn bộ file** (`SKILL.md`, script, tài nguyên) trước, đặc biệt cảnh
giác các Skill gọi ra URL/mạng bên ngoài.
:::

## Tóm tắt

- **Skill** (Agent Skill) là một **thư mục** đóng gói hướng dẫn + script + tài
  nguyên để dạy Claude làm tốt một loại việc; viết một lần, dùng lại nhiều lần.
- Mọi Skill bắt buộc có file **`SKILL.md`** gồm **frontmatter** (`name`,
  `description`) và phần **nội dung** hướng dẫn.
- **`description`** quyết định khi nào Claude tự kích hoạt Skill — viết rõ "làm
  gì + khi nào dùng".
- **Progressive disclosure** nạp nội dung theo 3 cấp (metadata → hướng dẫn → tài
  nguyên), chỉ khi cần, nên cài nhiều Skill không tốn ngữ cảnh.
- Skill chạy trên **claude.ai, Claude Code, API** nhưng **không tự đồng bộ** giữa
  các nơi; môi trường chạy (mạng, gói cài sẵn) cũng khác nhau.
- **Bảo mật**: chỉ dùng Skill từ nguồn tin cậy, đọc kỹ trước khi dùng.

Bài tiếp theo sẽ hướng dẫn **tự tạo một Skill** từng bước trong Claude Code.
