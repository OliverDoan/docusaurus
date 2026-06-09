---
sidebar_position: 5
title: "5. MCP, Hooks & Permissions"
---

# MCP, Hooks & Permissions

Bài này giới thiệu ba tính năng nâng cao của Claude Code: **MCP** giúp kết nối Claude với công cụ và dữ liệu bên ngoài (database, API), **Hooks** là script tự chạy để tự động hoá các việc như format code, còn **Permissions** là cơ chế xin phép trước khi Claude làm thay đổi. Hiểu chúng giúp bạn mở rộng và kiểm soát Claude Code an toàn; chi tiết nằm bên dưới.

---

## Mục lục

- [MCP là gì?](#mcp-là-gì)
- [Ví dụ dùng MCP](#ví-dụ-dùng-mcp)
- [Hooks là gì?](#hooks-là-gì)
- [Ví dụ một hook tự động format](#ví-dụ-một-hook-tự-động-format)
- [Cơ chế xin quyền (Permissions)](#cơ-chế-xin-quyền-permissions)
- [Plan mode (chế độ lập kế hoạch)](#plan-mode-chế-độ-lập-kế-hoạch)

---

## MCP là gì?

**MCP (Model Context Protocol)** là một chuẩn (protocol) để kết nối Claude với
các **công cụ và dữ liệu bên ngoài** — như cơ sở dữ liệu (database), API, hệ
thống tệp, hay các dịch vụ web.

Bình thường Claude Code chỉ thấy những gì trong thư mục dự án. Với MCP, bạn cắm
thêm các "**MCP server**" (máy chủ MCP) để mở rộng khả năng: ví dụ một MCP server
cho phép Claude truy vấn database, một server khác cho phép đọc issue trên hệ
thống quản lý dự án.

Mô hình hoạt động:

- **MCP server**: chương trình cung cấp một nhóm công cụ/dữ liệu (vd "truy vấn
  Postgres", "đọc tài liệu Google Drive").
- **Claude Code (MCP client)**: kết nối tới server và dùng các công cụ đó khi cần.

Nhờ là chuẩn chung, một MCP server viết một lần có thể dùng với nhiều ứng dụng AI
khác nhau, không riêng Claude Code.

## Ví dụ dùng MCP

Bạn khai báo MCP server cho Claude Code (thường qua lệnh hoặc file cấu hình). Cấu
trúc khai báo nhìn đại khái như sau:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    }
  }
}
```

Sau khi kết nối, bạn có thể yêu cầu Claude dùng công cụ đó bằng tiếng Việt:

```markdown
Dùng MCP để truy vấn database: liệt kê 5 đơn hàng mới nhất trong bảng orders.
```

:::warning Bảo mật khi cấu hình MCP
Khối JSON trên chỉ minh hoạ. **Không** ghi mật khẩu/khoá thật trực tiếp vào cấu
hình; dùng biến môi trường. Cú pháp và tên server thay đổi theo phiên bản — xem
docs.claude.com và tài liệu của từng MCP server.
:::

## Hooks là gì?

**Hooks** (móc nối) là các **script tự chạy** tại những thời điểm xác định trong
vòng đời phiên Claude Code. Chúng giúp **tự động hoá** các việc bạn muốn xảy ra
một cách nhất quán, không phụ thuộc vào việc Claude có "nhớ" làm hay không.

Các thời điểm phổ biến để gắn hook:

- **PreToolUse** — chạy *trước* khi Claude dùng một công cụ (vd kiểm tra, chặn
  thao tác nguy hiểm).
- **PostToolUse** — chạy *sau* khi dùng công cụ (vd tự động format code sau khi
  sửa file).
- **Stop** — chạy khi phiên kết thúc (vd kiểm tra lần cuối).

Vì hook do hệ thống thực thi (không phải Claude tự quyết), nó đảm bảo hành động
luôn xảy ra — phù hợp cho format, lint (kiểm lỗi tĩnh), kiểm tra kiểu, hoặc quét
bảo mật.

## Ví dụ một hook tự động format

Ý tưởng: sau mỗi lần Claude sửa file JavaScript/TypeScript, tự động chạy trình
format. Cấu hình hook (thường trong file settings) nhìn đại khái như sau:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "command": "npx prettier --write \"$FILE_PATH\""
      }
    ]
  }
}
```

Diễn giải:

- `PostToolUse`: chạy sau khi dùng công cụ.
- `matcher: "Edit"`: chỉ kích hoạt khi công cụ là sửa file.
- `command`: lệnh thực thi — ở đây dùng Prettier để format file vừa sửa.

:::note Cú pháp cụ thể
Cách khai báo hook (tên trường, biến như `$FILE_PATH`) khác nhau theo phiên bản.
Hãy xem docs.claude.com để có cú pháp chính xác trước khi cấu hình thật.
:::

## Cơ chế xin quyền (Permissions)

Claude Code **luôn xin phép** trước khi làm những việc có ảnh hưởng: sửa file,
chạy lệnh trong terminal, gọi công cụ ngoài. Bạn sẽ thấy lời nhắc kiểu "Claude
muốn chạy lệnh X — cho phép?" và chọn đồng ý hoặc từ chối.

Có các **chế độ quyền (permission modes)**:

- **Hỏi từng lần** (mặc định): an toàn nhất, bạn duyệt mọi hành động.
- **Tự duyệt cho thao tác tin cậy**: cho phép tự động một số loại thao tác bạn
  tin tưởng (vd chạy lệnh đọc dữ liệu), giảm số lần bị hỏi.

:::warning Cẩn trọng với tự duyệt
Chỉ bật tự duyệt cho các thao tác và bối cảnh bạn thực sự tin tưởng. **Tránh**
dùng cờ bỏ qua mọi kiểm tra quyền — nó có thể khiến Claude chạy lệnh nguy hiểm mà
không hỏi.
:::

## Plan mode (chế độ lập kế hoạch)

**Plan mode** là chế độ mà Claude **chỉ lập kế hoạch, không sửa code**. Claude
phân tích yêu cầu, đề xuất các bước sẽ làm, và bạn duyệt kế hoạch trước. Chỉ khi
bạn đồng ý, Claude mới chuyển sang thực thi.

Plan mode đặc biệt hữu ích cho **việc lớn, nhiều file**: bạn kiểm soát phạm vi và
hướng đi trước khi bất kỳ thay đổi nào được áp dụng, tránh "đi sai đường" tốn
thời gian.

```markdown
# Trong plan mode, bạn nêu yêu cầu:
Tôi muốn thêm chức năng đăng nhập bằng Google.

# Claude trả về KẾ HOẠCH (chưa sửa code):
1. Thêm thư viện OAuth.
2. Tạo route callback.
3. Lưu phiên đăng nhập.
...
# Bạn duyệt -> Claude mới bắt đầu thực thi.
```

## Tóm tắt

- **MCP (Model Context Protocol)** là chuẩn kết nối Claude với công cụ/dữ liệu
  ngoài qua các **MCP server** (database, API, dịch vụ).
- **Hooks** là script tự chạy ở các thời điểm (PreToolUse, PostToolUse, Stop) để
  tự động hoá format, lint, kiểm tra — đảm bảo hành động luôn xảy ra.
- **Permissions**: Claude Code xin phép trước khi sửa file/chạy lệnh; có chế độ
  hỏi từng lần và chế độ tự duyệt cho thao tác tin cậy (dùng cẩn trọng).
- **Plan mode** cho Claude lập kế hoạch trước, bạn duyệt rồi mới thực thi — lý
  tưởng cho việc lớn.
- Với cú pháp cấu hình cụ thể, luôn tham khảo **docs.claude.com**.
