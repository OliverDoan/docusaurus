---
sidebar_position: 4
title: "4. Phân biệt: Agent, Subagent, Skill, Slash Command, MCP"
---

# Phân biệt: Agent, Subagent, Skill, Slash Command, MCP

Khi học về Claude Code bạn sẽ gặp một loạt thuật ngữ nghe na ná nhau: **agent**,
**subagent**, **skill**, **slash command**, **MCP**, **hook**. Bài này gom tất cả
lại, phân biệt rạch ròi từng cái và — quan trọng nhất — chỉ ra **khi nào nên dùng
cái nào**. Đây là bài tổng kết giúp bạn không còn nhầm lẫn giữa các khái niệm.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Một câu để nhớ**: Agent là *cách vận hành*; Skill/MCP/Subagent mở rộng *năng lực*; Slash command là *cách gọi nhanh*; Hook là *tự động hoá quanh thao tác*.
- **Skill dạy Claude BIẾT CÁCH làm; MCP cho Claude KẾT NỐI dữ liệu ngoài** — chúng bổ trợ nhau, không loại trừ.
- **Slash command đã hợp nhất vào Skill** ở Claude Code (Skill là phiên bản mạnh hơn, hỗ trợ file phụ + tự nạp).
- **CLAUDE.md**: sự thật ngắn luôn nạp mỗi phiên; **Skill**: quy trình dài, chỉ nạp khi cần.
- **Subagent**: trợ lý con ngữ cảnh riêng cho việc lớn/tốn ngữ cảnh; có **cây quyết định** giúp chọn đúng công cụ.

:::

---

## Mục lục

- [Nhìn nhanh: bảng tổng hợp](#nhìn-nhanh-bảng-tổng-hợp)
- [Agent vs Subagent](#agent-vs-subagent)
- [Skill vs Slash Command](#skill-vs-slash-command)
- [Skill vs MCP](#skill-vs-mcp)
- [Skill vs CLAUDE.md](#skill-vs-claudemd)
- [Cây quyết định: dùng cái nào?](#cây-quyết-định-dùng-cái-nào)
- [Tóm tắt](#tóm-tắt)

---

## Nhìn nhanh: bảng tổng hợp

| Khái niệm | Là gì | Trả lời câu hỏi |
| --- | --- | --- |
| **Agent** | Cách Claude *vận hành*: suy nghĩ → hành động → lặp lại | "Claude tự làm việc bằng cách nào?" |
| **Subagent** | Trợ lý con có **ngữ cảnh riêng** cho một việc lớn | "Giao việc tốn ngữ cảnh cho ai?" |
| **Skill** | Gói **kiến thức/quy trình** dạy Claude làm tốt một loại việc | "Dạy Claude *biết cách* làm gì?" |
| **Slash command** | Lệnh gõ nhanh `/...` đóng gói một prompt/hành động | "Gọi nhanh một việc bằng cách nào?" |
| **MCP** | Cầu nối cho Claude *kết nối* tới hệ thống/dữ liệu bên ngoài | "Cho Claude *truy cập* được gì?" |
| **Hook** | Đoạn lệnh tự chạy *quanh* hành động của Claude | "Tự động làm gì *trước/sau* một thao tác?" |

Một câu để nhớ:

> **Agent** là *cách vận hành*. **Skill/MCP/Subagent** mở rộng *năng lực*.
> **Slash command** là *cách gọi nhanh*. **Hook** là *tự động hoá quanh thao tác*.

## Agent vs Subagent

- **Agent** không phải một "thứ" bạn bật/tắt — đó là **chế độ vận hành** của
  Claude: nhận mục tiêu rồi tự lặp "suy nghĩ → hành động → quan sát". Claude Code
  chính là Claude chạy ở chế độ agent (xem bài 1).
- **Subagent** là một **agent con** mà agent chính giao cho một việc cụ thể, chạy
  với **ngữ cảnh riêng** và trả về tóm tắt.

| | Agent (chính) | Subagent |
| --- | --- | --- |
| Bản chất | Chế độ vận hành của phiên | Trợ lý con được giao việc |
| Ngữ cảnh | Phiên làm việc chính | Riêng biệt, trả về tóm tắt |
| Dùng khi | Mặc định | Việc con tốn ngữ cảnh / cần chuyên môn riêng / chạy song song |

> Liên hệ: một **Skill** có thể được cấu hình chạy trong subagent (`context:
> fork`) — tức là gói kiến thức (Skill) thực thi trong một ngữ cảnh tách biệt
> (subagent). Chúng bổ trợ nhau, không loại trừ nhau.

## Skill vs Slash Command

Đây là cặp dễ nhầm nhất — và ở Claude Code chúng đã được **hợp nhất**.

- Cả hai đều có thể gọi bằng `/tên`.
- **Khác biệt cốt lõi**: slash command (kiểu cũ, một file `.md`) **chỉ chạy khi
  bạn gõ lệnh**. **Skill** thì ngoài việc gọi tay, còn có thể được Claude **tự
  nạp khi phù hợp** (dựa vào `description`), và hỗ trợ **thư mục file phụ + script**.

| | Slash command (file đơn) | Skill (thư mục) |
| --- | --- | --- |
| Cấu trúc | Một file `.md` | Thư mục có `SKILL.md` + file phụ |
| Kích hoạt | Chỉ khi gõ `/tên` | Gõ `/tên` **hoặc** Claude tự nạp khi hợp |
| File phụ / script | Không | Có |
| Khuyến nghị | Dùng cho lệnh đơn giản | Dùng cho hầu hết trường hợp |

> Nói gọn: **Skill là phiên bản mạnh hơn của slash command**. File
> `.claude/commands/` cũ vẫn chạy, nhưng nên dùng Skill cho việc mới.

## Skill vs MCP

Hai thứ này giải quyết **vấn đề khác nhau**, rất hay bị gộp nhầm:

- **Skill** dạy Claude **BIẾT CÁCH làm** — quy trình, quy tắc, kiến thức (phần
  "know-how"). Nó là *hướng dẫn*.
- **MCP** (Model Context Protocol — giao thức kết nối ngữ cảnh) cho Claude **KẾT
  NỐI tới** hệ thống bên ngoài — cơ sở dữ liệu, Jira, Google Drive, API nội bộ
  (phần "tay nối dài"). Nó là *cánh cổng tới dữ liệu/công cụ*.

| | Skill | MCP |
| --- | --- | --- |
| Cung cấp | Kiến thức & quy trình | Kết nối tới dữ liệu & công cụ ngoài |
| Hình thức | Thư mục `SKILL.md` (+ file/script) | Một "server" Claude kết nối tới |
| Ví dụ | "Cách viết báo cáo theo chuẩn công ty" | "Đọc/ghi issue trong Jira của công ty" |

> Chúng thường **đi cùng nhau**: một Skill (biết *cách* lập báo cáo bán hàng) có
> thể yêu cầu Claude lấy số liệu qua một **MCP** (kết nối tới cơ sở dữ liệu bán
> hàng). Skill = biết cách; MCP = lấy được dữ liệu.

## Skill vs CLAUDE.md

Cả hai đều "dạy" Claude về dự án, nhưng khác về **cách nạp**:

- **`CLAUDE.md`** luôn được nạp vào ngữ cảnh ở **mọi phiên** — hợp cho **sự thật
  ngắn gọn, luôn cần**: lệnh build, quy ước đặt tên, cấu trúc thư mục.
- **Skill** chỉ nạp **khi được dùng** — hợp cho **quy trình dài, thỉnh thoảng mới
  cần**: cách deploy, checklist review, hướng dẫn nhiều bước.

> Quy tắc: nếu một mục trong `CLAUDE.md` phình to thành **một quy trình** (chứ
> không còn là sự thật ngắn), hãy tách nó ra thành **Skill** để khỏi tốn ngữ cảnh
> mỗi phiên.

## Cây quyết định: dùng cái nào?

```text
Bạn muốn gì?

├─ Dạy Claude một QUY TRÌNH / bộ quy tắc để dùng lại?
│     └─► SKILL
│
├─ Cho Claude TRUY CẬP dữ liệu / hệ thống bên ngoài (DB, Jira, Drive)?
│     └─► MCP
│
├─ Gọi NHANH một việc hay lặp lại bằng một lệnh ngắn?
│     └─► SLASH COMMAND (thực chất là một Skill)
│
├─ Giao một việc lớn, TỐN NGỮ CẢNH, cần kết quả tóm tắt?
│     └─► SUBAGENT
│
├─ Ghi một SỰ THẬT ngắn gọn về dự án, luôn cần mỗi phiên?
│     └─► CLAUDE.md
│
└─ Tự động chạy gì đó TRƯỚC/SAU một thao tác (vd format sau khi sửa file)?
      └─► HOOK
```

## Tóm tắt

- **Agent** là *cách Claude vận hành* (tự suy nghĩ–hành động–lặp lại); Claude Code
  là Claude ở chế độ agent.
- **Subagent**: trợ lý con ngữ cảnh riêng cho việc lớn/tốn ngữ cảnh/chạy song song.
- **Skill**: gói *kiến thức & quy trình* (know-how), nạp khi cần — dùng cho hầu
  hết tác vụ lặp lại.
- **Slash command**: cách gọi nhanh `/tên`; ở Claude Code đã hợp nhất vào Skill.
- **MCP**: cầu nối tới *dữ liệu/hệ thống ngoài* — Skill biết *cách*, MCP lấy được
  *dữ liệu*; chúng bổ trợ nhau.
- **CLAUDE.md**: sự thật ngắn, luôn nạp; **Skill**: quy trình dài, nạp khi cần.
- **Hook**: tự động hoá *trước/sau* một thao tác.

Đây là bài cuối của mục **AI Agent & Skill**. Giờ bạn đã có bức tranh đầy đủ:
Claude không chỉ là chatbot, mà là một **agent** có thể được trang bị **skill**,
kết nối **MCP**, và mở rộng bằng **subagent** để làm việc thực sự cho bạn.
