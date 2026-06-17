---
sidebar_position: 3
title: "3. Tự tạo một Skill"
---

# Tự tạo một Skill

Bài này hướng dẫn **tạo một Skill từ đầu** trong Claude Code — đi qua từng bước:
tạo thư mục, viết `SKILL.md`, thử nghiệm, rồi nâng cấp với script và file phụ. Ta
sẽ làm một ví dụ cụ thể: Skill tóm tắt các thay đổi chưa commit và cảnh báo rủi
ro. Sau bài này bạn có thể tự đóng gói bất kỳ quy trình lặp lại nào của mình thành
một Skill dùng được trên mọi dự án.

> Bài này tập trung vào **Claude Code** vì đây là nơi tạo Skill dễ nhất (chỉ là
> file trên ổ đĩa, không cần tải lên đâu). Ôn lại Skill là gì ở bài trước nếu cần.

---

## Mục lục

- [Khi nào nên tạo Skill?](#khi-nào-nên-tạo-skill)
- [Bước 1: Tạo thư mục Skill](#bước-1-tạo-thư-mục-skill)
- [Bước 2: Viết SKILL.md](#bước-2-viết-skillmd)
- [Bước 3: Thử nghiệm](#bước-3-thử-nghiệm)
- [Skill nằm ở đâu: cá nhân vs dự án](#skill-nằm-ở-đâu-cá-nhân-vs-dự-án)
- [Nâng cấp: thêm file phụ và script](#nâng-cấp-thêm-file-phụ-và-script)
- [Vài trường frontmatter hữu ích](#vài-trường-frontmatter-hữu-ích)
- [Tóm tắt](#tóm-tắt)

---

## Khi nào nên tạo Skill?

Hãy tạo Skill khi:

- Bạn **dán đi dán lại** cùng một bộ hướng dẫn, checklist hay quy trình nhiều bước
  vào chat.
- Một phần trong `CLAUDE.md` đã phình to thành **một quy trình**, chứ không còn là
  một *sự thật* ngắn gọn về dự án.

Lợi thế so với `CLAUDE.md`: nội dung Skill **chỉ nạp khi được dùng**, nên tài liệu
tham khảo dài gần như không tốn ngữ cảnh cho tới lúc cần (nhờ progressive
disclosure ở bài trước).

## Bước 1: Tạo thư mục Skill

Mỗi Skill là một **thư mục**, tên thư mục chính là tên lệnh bạn gõ sau này. Tạo
Skill cá nhân (dùng được ở mọi dự án) trong `~/.claude/skills/`:

```bash
# Tạo thư mục cho Skill tên "summarize-changes"
mkdir -p ~/.claude/skills/summarize-changes
```

## Bước 2: Viết SKILL.md

Tạo file `SKILL.md` bên trong thư mục vừa tạo. Tối thiểu chỉ cần **frontmatter với
`description`** và phần hướng dẫn:

````markdown
---
description: Tóm tắt các thay đổi chưa commit và cảnh báo rủi ro. Dùng khi người dùng hỏi đã thay đổi gì, muốn viết commit message, hoặc muốn review diff.
---

## Thay đổi hiện tại

!`git diff HEAD`

## Hướng dẫn

Tóm tắt các thay đổi ở trên thành 2–3 gạch đầu dòng, sau đó liệt kê rủi ro bạn
thấy: thiếu xử lý lỗi, giá trị hardcode, hoặc test cần cập nhật. Nếu diff rỗng,
nói rằng không có thay đổi nào chưa commit.
````

Giải thích vài điểm:

- **`description`** là phần quan trọng nhất — Claude đọc nó để quyết định *khi
  nào* tự dùng Skill. Viết rõ cả "làm gì" lẫn "khi nào dùng".
- Dòng ``!`git diff HEAD` `` dùng kỹ thuật **chèn ngữ cảnh động** (dynamic context
  injection): Claude Code **chạy lệnh đó trước**, rồi thay dòng này bằng *kết quả*
  thật trước khi Claude đọc Skill. Nhờ vậy hướng dẫn đến tay Claude đã kèm sẵn diff
  hiện tại của bạn.
- Không bắt buộc có `name` trong Claude Code — nếu thiếu, tên lệnh lấy theo tên
  thư mục (`/summarize-changes`).

:::tip Giữ phần thân ngắn gọn
Khi Skill được nạp, nội dung của nó **nằm trong ngữ cảnh suốt các lượt sau** —
mỗi dòng là chi phí token lặp lại. Hãy viết "làm gì", đừng kể lể "vì sao/thế nào".
Tài liệu dài nên tách ra file phụ (xem phần nâng cấp bên dưới).
:::

## Bước 3: Thử nghiệm

Mở một dự án git, sửa nhẹ một file bất kỳ, rồi chạy `claude`. Có hai cách kích
hoạt Skill:

```text
# Cách 1: để Claude tự gọi — hỏi câu khớp với description
Tôi vừa thay đổi gì?

# Cách 2: gọi trực tiếp bằng tên Skill
/summarize-changes
```

Cả hai cách đều khiến Claude trả về bản tóm tắt ngắn kèm danh sách rủi ro.

:::note Cập nhật ngay không cần khởi động lại
Claude Code **theo dõi** các thư mục Skill: thêm/sửa/xoá một Skill có hiệu lực
ngay trong phiên hiện tại. Chỉ khi *tạo mới cả thư mục skills cấp cao nhất* (chưa
tồn tại lúc mở phiên) thì mới cần khởi động lại Claude Code.
:::

## Skill nằm ở đâu: cá nhân vs dự án

Vị trí lưu Skill quyết định **ai dùng được** nó:

| Vị trí | Đường dẫn | Áp dụng cho |
| --- | --- | --- |
| **Cá nhân** | `~/.claude/skills/<tên>/SKILL.md` | Mọi dự án của bạn |
| **Dự án** | `.claude/skills/<tên>/SKILL.md` | Chỉ dự án này (commit được, chia sẻ cho cả nhóm) |

Đặt Skill ở **dự án** khi nó gắn với quy trình riêng của dự án và bạn muốn cả
nhóm dùng chung (vì file được commit vào git). Đặt ở **cá nhân** cho các Skill bạn
muốn dùng ở khắp nơi.

> **Liên hệ với slash command**: ở Claude Code, slash command tuỳ chỉnh và Skill
> đã được **hợp nhất**. File `.claude/commands/deploy.md` và Skill
> `.claude/skills/deploy/SKILL.md` đều tạo ra lệnh `/deploy`. Skill là cách được
> khuyến nghị vì hỗ trợ thêm thư mục file phụ và nạp tự động.

## Nâng cấp: thêm file phụ và script

Khi Skill phức tạp hơn, hãy tách nội dung ra nhiều file để phần `SKILL.md` chính
luôn gọn. Một thư mục Skill đầy đủ có thể trông như sau:

```text
summarize-changes/
├── SKILL.md           # Hướng dẫn chính (bắt buộc)
├── template.md        # Mẫu để Claude điền vào
├── examples/
│   └── sample.md      # Ví dụ kết quả mong muốn
└── scripts/
    └── check.sh       # Script Claude chạy được
```

- **File hướng dẫn phụ** (vd `REFERENCE.md`): chỉ được nạp khi `SKILL.md` tham
  chiếu tới — tiết kiệm ngữ cảnh.
- **Script** (vd `check.sh`): Claude chạy qua bash và chỉ nhận *kết quả*; mã script
  **không** bị nạp vào ngữ cảnh → vừa tin cậy vừa tiết kiệm.
- **Tài nguyên**: mẫu, ví dụ, schema... để Claude tra cứu khi cần.

Quan trọng: hãy **tham chiếu các file này từ `SKILL.md`** (ghi rõ chúng chứa gì,
khi nào dùng) để Claude biết lúc nào cần mở.

## Vài trường frontmatter hữu ích

Ngoài `name` và `description`, Claude Code hỗ trợ thêm vài trường tuỳ chọn trong
frontmatter để điều chỉnh hành vi Skill:

| Trường | Công dụng |
| --- | --- |
| `disable-model-invocation: true` | Ngăn Claude tự kích hoạt; chỉ chạy khi bạn gõ `/tên`. Hợp với việc nhạy cảm như deploy. |
| `user-invocable: false` | Ẩn khỏi menu `/`; dùng cho kiến thức nền không cần gọi tay. |
| `allowed-tools` | Liệt kê công cụ Claude được dùng không cần hỏi phép khi Skill đang hoạt động. |
| `argument-hint` | Gợi ý tham số khi gõ lệnh, vd `[issue-number]`. |
| `context: fork` | Chạy Skill trong một subagent riêng (ngữ cảnh tách biệt). |

Ví dụ một Skill tác vụ chỉ chạy thủ công:

```markdown
---
name: deploy
description: Triển khai ứng dụng lên production
disable-model-invocation: true
---

Triển khai ứng dụng:
1. Chạy bộ test
2. Build ứng dụng
3. Đẩy lên môi trường triển khai
```

:::note Cấu hình có thể đổi theo phiên bản
Tập hợp trường frontmatter và đường dẫn có thể thay đổi giữa các phiên bản Claude
Code. Hãy tra cứu `code.claude.com/docs` để biết cấu hình chính xác cho phiên bản
bạn đang dùng.
:::

## Tóm tắt

- Tạo Skill = tạo **một thư mục** chứa file **`SKILL.md`**; tên thư mục thành tên
  lệnh `/`.
- `SKILL.md` cần ít nhất **`description`** rõ ràng (làm gì + khi nào dùng); phần
  thân là hướng dẫn, nên giữ **ngắn gọn**.
- Kỹ thuật ``!`lệnh` `` **chèn ngữ cảnh động** — chạy lệnh và nhúng kết quả vào
  Skill trước khi Claude đọc.
- Đặt Skill ở `~/.claude/skills/` (**cá nhân**, mọi dự án) hay `.claude/skills/`
  (**dự án**, chia sẻ nhóm qua git).
- Nâng cấp bằng **file phụ** và **script** — chỉ nạp/chạy khi cần, tiết kiệm ngữ
  cảnh.
- Các trường như `disable-model-invocation`, `allowed-tools`, `context: fork`
  giúp kiểm soát ai gọi, công cụ nào được dùng, chạy ở đâu.

Bài cuối sẽ **so sánh** agent, subagent, skill, slash command và MCP — để bạn biết
khi nào dùng cái nào.
