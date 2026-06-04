---
sidebar_position: 1
title: "1. Claude Code là gì & Cài đặt"
---

# Claude Code là gì & Cài đặt

---

## Mục lục

- [Claude Code là gì?](#claude-code-là-gì)
- [Khác gì so với chat thường?](#khác-gì-so-với-chat-thường)
- [Yêu cầu trước khi cài](#yêu-cầu-trước-khi-cài)
- [Cài đặt qua npm](#cài-đặt-qua-npm)
- [Chạy lần đầu & xác thực](#chạy-lần-đầu--xác-thực)
- [Kiểm tra cài đặt thành công](#kiểm-tra-cài-đặt-thành-công)

---

## Claude Code là gì?

**Claude Code** là công cụ dòng lệnh (CLI - Command Line Interface, giao diện
gõ lệnh trong terminal) chính thức của Anthropic. Nó giúp bạn trò chuyện với
Claude ngay bên trong thư mục dự án của bạn.

Điểm khác biệt cốt lõi: Claude Code không chỉ "trả lời câu hỏi" mà còn có thể
**hành động trực tiếp** trên máy bạn:

- Đọc và hiểu mã nguồn (source code) trong dự án.
- Sửa file, tạo file mới, xoá file.
- Chạy lệnh trong terminal (vd: chạy test, build, cài thư viện).
- Thao tác Git (xem diff, commit, tạo nhánh).

Vì chạy trong terminal nên Claude Code phù hợp với mọi ngôn ngữ và mọi loại dự
án. Ngoài terminal, Claude Code còn tích hợp được vào IDE (môi trường lập trình
như VS Code, JetBrains) để hiển thị thay đổi trực quan hơn.

## Khác gì so với chat thường?

Chat thường (như giao diện web claude.ai) chỉ trao đổi văn bản: bạn dán code
vào, Claude trả lời, rồi bạn tự copy kết quả về dán vào dự án. Claude Code cắt
bỏ bước thủ công đó.

| Tiêu chí | Chat thường (web) | Claude Code (CLI) |
| --- | --- | --- |
| Đọc file dự án | Bạn phải copy/dán | Tự đọc trực tiếp |
| Sửa code | Bạn tự áp dụng | Sửa file trực tiếp |
| Chạy lệnh/test | Không thể | Chạy được trong terminal |
| Thao tác Git | Không | Commit, diff, branch |
| Ngữ cảnh dự án | Hạn chế | Hiểu cả cấu trúc thư mục |

Nói ngắn gọn: chat thường là "trợ lý nói chuyện", còn Claude Code là "lập trình
viên cặp đôi (pair programmer) ngồi cạnh bạn", có quyền thao tác thật trên dự án
(luôn xin phép trước khi làm thay đổi quan trọng).

## Yêu cầu trước khi cài

Trước khi cài, máy bạn cần có:

- **Node.js** phiên bản 18 trở lên (khuyến nghị bản LTS mới nhất). Node.js là
  môi trường chạy JavaScript ngoài trình duyệt, đi kèm công cụ `npm`.
- **npm** (Node Package Manager - trình quản lý gói của Node), thường được cài
  sẵn cùng Node.js.
- Một **terminal** (Terminal trên macOS/Linux, hoặc PowerShell/Windows Terminal
  trên Windows).
- Một **tài khoản** dùng được với Claude (tài khoản Claude hoặc Anthropic API).

Kiểm tra Node.js và npm đã có chưa:

```bash
# Kiểm tra phiên bản Node.js (cần >= 18)
node --version

# Kiểm tra phiên bản npm
npm --version
```

Nếu hai lệnh trên báo lỗi "command not found", bạn cần cài Node.js trước (tải từ
trang chủ nodejs.org).

## Cài đặt qua npm

Claude Code được phát hành dưới dạng gói npm tên `@anthropic-ai/claude-code`.
Cách cài phổ biến nhất là cài toàn cục (global) để dùng được ở mọi thư mục:

```bash
# Cài đặt Claude Code toàn cục bằng npm
npm install -g @anthropic-ai/claude-code
```

Sau khi cài, lệnh `claude` sẽ có sẵn trong terminal.

:::tip Luôn xem tài liệu chính thức
Cách cài đặt và tên gói có thể thay đổi theo thời gian. Khi gặp vấn đề, hãy xem
hướng dẫn cập nhật tại **docs.claude.com**. Một số hệ thống còn cung cấp cách
cài bằng script cài đặt riêng — ưu tiên làm theo tài liệu chính thức.
:::

Nếu gặp lỗi quyền (permission) khi cài toàn cục trên macOS/Linux, tránh dùng
`sudo`; thay vào đó hãy cấu hình thư mục npm global cho người dùng hiện tại, hoặc
dùng trình quản lý phiên bản Node như `nvm`.

## Chạy lần đầu & xác thực

Di chuyển vào thư mục dự án của bạn rồi khởi động Claude Code:

```bash
# Vào thư mục dự án (ví dụ)
cd ~/projects/my-app

# Khởi động Claude Code trong thư mục hiện tại
claude
```

Lần chạy đầu tiên, Claude Code sẽ yêu cầu **xác thực (authentication)**. Bạn làm
theo hướng dẫn hiện trên màn hình — thường là mở một liên kết trên trình duyệt để
đăng nhập tài khoản, hoặc nhập API key (khoá truy cập API). Sau khi xác thực
thành công, thông tin đăng nhập được lưu lại nên các lần sau không cần làm lại.

:::warning Bảo mật khoá truy cập
Nếu dùng API key, **tuyệt đối không** dán key vào mã nguồn hay commit lên Git.
Để Claude Code tự quản lý phần xác thực, hoặc dùng biến môi trường.
:::

## Kiểm tra cài đặt thành công

Sau khi xác thực, bạn đã ở trong một **phiên (session)** làm việc. Thử gõ một
lệnh trợ giúp để xác nhận mọi thứ hoạt động:

```bash
# Trong phiên Claude Code, gõ lệnh trợ giúp
/help
```

Lệnh `/help` liệt kê các lệnh có sẵn. Nếu nó hiển thị danh sách lệnh, nghĩa là
bạn đã sẵn sàng. Để thoát khỏi phiên, gõ `/exit` hoặc nhấn `Ctrl+C` hai lần.

Bạn cũng có thể kiểm tra phiên bản đã cài từ bên ngoài phiên:

```bash
# Xem phiên bản Claude Code đã cài
claude --version
```

## Tóm tắt

- **Claude Code** là CLI chính thức của Anthropic, chạy trong terminal, cho phép
  Claude đọc/sửa code, chạy lệnh và thao tác Git ngay trong dự án.
- Khác với chat web (phải copy/dán thủ công), Claude Code hành động trực tiếp như
  một pair programmer.
- Yêu cầu **Node.js >= 18** và **npm**; cài qua `npm install -g
  @anthropic-ai/claude-code`.
- Lần chạy đầu cần **xác thực** (đăng nhập tài khoản hoặc API key); thông tin
  được lưu cho các lần sau.
- Dùng `/help` để xem lệnh, `/exit` để thoát. Khi nghi ngờ, hãy tra cứu tài liệu
  chính thức tại **docs.claude.com**.
