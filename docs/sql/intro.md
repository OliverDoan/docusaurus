---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình học SQL

## SQL là gì?

**SQL** (Structured Query Language - ngôn ngữ truy vấn có cấu trúc) là ngôn ngữ chuẩn dùng để
làm việc với **cơ sở dữ liệu** (database - nơi lưu trữ dữ liệu một cách có tổ chức). Bằng SQL,
bạn có thể thêm, sửa, xóa và truy vấn (lấy ra) dữ liệu theo đúng nhu cầu của mình.

Hãy tưởng tượng SQL giống như cách bạn ra lệnh cho máy tính bằng những câu gần với tiếng Anh
tự nhiên, ví dụ: "Cho tôi xem tất cả khách hàng ở Hà Nội" hay "Đếm số đơn hàng trong tháng này".

## Database và bảng là gì?

- **Database** (cơ sở dữ liệu): là một kho chứa lớn, gồm nhiều **bảng** (table) liên quan đến nhau.
- **Bảng** (table): là nơi lưu dữ liệu theo dạng hàng và cột, rất giống một trang **bảng tính Excel**.
  - Mỗi **cột** (column) là một loại thông tin, ví dụ: Họ tên, Email, Tuổi.
  - Mỗi **hàng** (row) là một bản ghi cụ thể, ví dụ: một khách hàng, một sản phẩm.

Ví dụ một bảng `khach_hang` trông như sau:

| id | ho_ten      | email             | thanh_pho |
|----|-------------|-------------------|-----------|
| 1  | Nguyễn An   | an@example.com    | Hà Nội    |
| 2  | Trần Bình   | binh@example.com  | Đà Nẵng   |
| 3  | Lê Cường    | cuong@example.com | Hà Nội    |

## Vì sao cần học SQL?

- **Dữ liệu ở khắp mọi nơi**: hầu hết ứng dụng (website, app điện thoại, phần mềm quản lý) đều
  lưu dữ liệu trong database và dùng SQL để truy cập.
- **Mạnh hơn Excel rất nhiều**: Excel xử lý tốt vài nghìn dòng, còn database có thể xử lý hàng
  triệu, hàng tỷ dòng một cách nhanh chóng.
- **Kỹ năng nền tảng**: lập trình viên, phân tích dữ liệu (data analyst), tester, quản trị
  hệ thống... đều cần biết SQL.
- **Dễ bắt đầu**: cú pháp gần với tiếng Anh, người mới hoàn toàn có thể học được.

## Lộ trình học

Dưới đây là 16 bài học được sắp xếp theo thứ tự từ dễ đến khó. Bạn nên học lần lượt từ trên xuống.

| #  | Bài | Mô tả |
|----|-----|-------|
| 1  | Kiến thức nền tảng | Hiểu database, bảng, hàng, cột và cách dữ liệu được tổ chức. |
| 2  | Cú pháp SQL cơ bản | Làm quen câu lệnh SELECT, WHERE, ORDER BY để lấy và lọc dữ liệu. |
| 3  | DDL (định nghĩa dữ liệu) | Tạo và thay đổi cấu trúc bảng với CREATE, ALTER, DROP. |
| 4  | DML (thao tác dữ liệu) | Thêm, sửa, xóa dữ liệu với INSERT, UPDATE, DELETE. |
| 5  | Hàm tổng hợp (Aggregate) | Tính toán trên nhiều hàng: COUNT, SUM, AVG, MIN, MAX, GROUP BY. |
| 6  | Ràng buộc (Constraints) | Đặt quy tắc cho dữ liệu: PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE. |
| 7  | Truy vấn con (Subqueries) | Lồng một truy vấn bên trong truy vấn khác để giải bài toán phức tạp. |
| 8  | Joins (kết bảng) | Kết hợp dữ liệu từ nhiều bảng với INNER JOIN, LEFT JOIN, RIGHT JOIN. |
| 9  | Hàm (Functions) | Sử dụng hàm xử lý chuỗi, số, ngày tháng có sẵn trong SQL. |
| 10 | Views | Tạo "bảng ảo" từ một truy vấn để dùng lại dễ dàng. |
| 11 | Indexes (chỉ mục) | Tăng tốc độ truy vấn bằng cách đánh chỉ mục cho cột. |
| 12 | Toàn vẹn & Bảo mật | Đảm bảo dữ liệu chính xác, an toàn và phân quyền truy cập. |
| 13 | Transactions (giao dịch) | Nhóm nhiều thao tác thành một khối an toàn với COMMIT, ROLLBACK. |
| 14 | Stored Procedures | Lưu sẵn nhóm câu lệnh SQL để gọi lại nhiều lần. |
| 15 | Performance (hiệu năng) | Tối ưu câu truy vấn để chạy nhanh và tiết kiệm tài nguyên. |
| 16 | SQL nâng cao | Các kỹ thuật cao cấp như window functions, CTE và truy vấn phức tạp. |

## Học theo thứ tự nào?

Hãy đi tuần tự từ **Bài 1 đến Bài 16**. Mỗi bài được xây dựng dựa trên kiến thức của bài trước:

1. **Bài 1 - 2**: Nắm vững khái niệm nền tảng và cách lấy dữ liệu. Đây là phần quan trọng nhất
   cho người mới, đừng vội bỏ qua.
2. **Bài 3 - 6**: Học cách tạo bảng, thêm/sửa/xóa dữ liệu, tính toán và đặt ràng buộc. Sau phần
   này bạn đã có thể tự quản lý một database nhỏ.
3. **Bài 7 - 11**: Nâng cao kỹ năng truy vấn với subquery, join nhiều bảng, hàm, view và index.
4. **Bài 12 - 16**: Các chủ đề chuyên sâu về bảo mật, giao dịch, thủ tục, hiệu năng và kỹ thuật
   nâng cao - dành cho khi bạn đã tự tin với phần cơ bản.

Lời khuyên: hãy **thực hành ngay** sau mỗi bài. Tự gõ lại câu lệnh, thử thay đổi điều kiện và
quan sát kết quả sẽ giúp bạn nhớ lâu hơn rất nhiều so với chỉ đọc lý thuyết. Chúc bạn học tốt!
