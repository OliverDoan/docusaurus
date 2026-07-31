---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình học Node.js

:::note[Ghi nhớ nhanh]

- ⭐ **Node.js là môi trường chạy JavaScript phía máy chủ** — dựng trên V8 engine, cho phép viết cả frontend lẫn backend bằng cùng một ngôn ngữ.
- **Nên nắm vững JavaScript cơ bản trước** — biến, hàm, mảng, đối tượng và bất đồng bộ (`Promise`, `async/await`).
- ⭐ **Lộ trình 5 nhóm** — Nền tảng → Express.js → Database → Xác thực & Bảo mật → Nâng cao.
- **Học lần lượt từ nhóm 1 đến 5** — mỗi nhóm là nền tảng cho nhóm tiếp theo.
- **Thực hành ở mỗi bước** — làm ví dụ nhỏ trước khi chuyển chủ đề mới, học chậm mà chắc.

:::

## Node.js là gì?

**Node.js** là một môi trường chạy JavaScript (JavaScript runtime — nơi để chạy mã JavaScript) phía máy chủ, tức là chạy JavaScript bên ngoài trình duyệt web.

Trước đây, JavaScript chỉ chạy được bên trong trình duyệt (browser) để làm cho trang web có tương tác. Node.js mang JavaScript ra ngoài trình duyệt, cho phép bạn chạy nó trực tiếp trên máy tính hoặc máy chủ (server). Node.js được xây dựng trên **V8** — chính là cỗ máy xử lý JavaScript bên trong trình duyệt Google Chrome.

## Vì sao nên dùng Node.js?

- **Viết backend bằng JavaScript:** Backend (phần xử lý phía máy chủ — nơi lưu dữ liệu, xử lý logic) thường được viết bằng các ngôn ngữ khác như Java, Python, PHP. Với Node.js, bạn có thể viết cả phần giao diện (frontend) lẫn phần máy chủ (backend) bằng cùng một ngôn ngữ là JavaScript.
- **Học một ngôn ngữ, làm được nhiều việc:** Không cần học thêm ngôn ngữ mới cho phía máy chủ.
- **Cộng đồng lớn:** Có sẵn rất nhiều thư viện (library — đoạn mã viết sẵn để tái sử dụng) thông qua **npm** (Node Package Manager — trình quản lý gói của Node).
- **Nhanh với nhiều kết nối:** Node.js xử lý tốt khi có nhiều người dùng truy cập cùng lúc.

**Ví dụ thực tế:** Bạn có thể dùng Node.js để xây dựng:

- Một máy chủ web (web server) trả về trang HTML.
- Một API (Application Programming Interface — giao diện để các chương trình nói chuyện với nhau) cho ứng dụng điện thoại.
- Một công cụ dòng lệnh (command-line tool) chạy trên máy tính.

## Cần biết gì trước khi học?

Bạn nên nắm vững **JavaScript cơ bản** trước khi học Node.js, bao gồm:

- Biến (variable), kiểu dữ liệu (data type), hàm (function).
- Mảng (array), đối tượng (object).
- Vòng lặp (loop), câu điều kiện (if/else).
- Lập trình bất đồng bộ (asynchronous — xử lý các tác vụ chạy song song) với `Promise` và `async/await`.

Node.js chính là JavaScript chạy ở một nơi mới, nên nền tảng JavaScript càng chắc thì học Node.js càng dễ.

## Lộ trình học

| # | Chủ đề | Mô tả |
|---|--------|-------|
| 1 | Nền tảng (Fundamentals) | Cách cài đặt Node.js, chạy file JavaScript, dùng module (mô-đun — cách chia mã thành nhiều file), npm, đọc/ghi file, và xử lý bất đồng bộ. |
| 2 | Express.js | Học framework (bộ khung — công cụ giúp viết mã nhanh hơn) **Express.js** để tạo máy chủ web và API: định tuyến (routing), middleware (lớp xử lý trung gian), nhận và trả dữ liệu. |
| 3 | Database (Cơ sở dữ liệu) | Lưu trữ dữ liệu lâu dài với cơ sở dữ liệu như MongoDB hoặc PostgreSQL, kết nối từ Node.js và thực hiện thao tác thêm/sửa/xóa/đọc. |
| 4 | Xác thực & Bảo mật (Authentication & Security) | Đăng nhập, đăng ký, quản lý người dùng, mã hóa mật khẩu, dùng token (mã định danh) và bảo vệ ứng dụng khỏi các lỗ hổng phổ biến. |
| 5 | Nâng cao (Advanced) | Kiểm thử (testing), xử lý lỗi nâng cao, tối ưu hiệu năng (performance), triển khai (deploy — đưa ứng dụng lên máy chủ thật) và làm việc theo kiến trúc lớn. |

## Học theo thứ tự nào?

Bạn nên học **lần lượt từ nhóm 1 đến nhóm 5**, vì mỗi nhóm là nền tảng cho nhóm tiếp theo:

1. Bắt đầu với **Nền tảng** để hiểu cách Node.js hoạt động và chạy được mã đầu tiên.
2. Sang **Express.js** để tạo được máy chủ web và API thực sự.
3. Thêm **Database** để ứng dụng có thể lưu và truy xuất dữ liệu.
4. Học **Xác thực & Bảo mật** để ứng dụng an toàn và có người dùng.
5. Cuối cùng là **Nâng cao** để hoàn thiện kỹ năng và đưa sản phẩm ra thực tế.

Lời khuyên: đừng vội. Hãy thực hành viết mã (code) ở mỗi bước, làm thử các ví dụ nhỏ trước khi chuyển sang chủ đề mới. Học chậm mà chắc sẽ giúp bạn đi xa hơn.
