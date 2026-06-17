---
sidebar_position: 3
title: "3. Injection (SQL & Command)"
---

# Injection — SQL & Command

**Injection** (tiêm mã) là khi dữ liệu do người dùng cung cấp bị **trộn vào một
câu lệnh** (SQL, lệnh hệ điều hành...) khiến hệ thống thực thi điều kẻ tấn công
muốn. Đây là nhóm rủi ro kinh điển trong OWASP Top 10. Bài này tập trung vào hai
dạng nguy hiểm nhất: **SQL injection** và **command injection** — cùng cách phòng
thủ bằng tham số hoá.

---

## Mục lục

- [Bản chất của injection](#bản-chất-của-injection)
- [SQL Injection](#sql-injection)
- [Phòng thủ SQLi: tham số hoá truy vấn](#phòng-thủ-sqli-tham-số-hoá-truy-vấn)
- [Xử lý tên cột/bảng động](#xử-lý-tên-cộtbảng-động)
- [Command Injection](#command-injection)
- [Tóm tắt](#tóm-tắt)

---

## Bản chất của injection

Mọi lỗ hổng injection có chung một gốc: **trộn lẫn "lệnh" với "dữ liệu"**. Khi bạn
ghép chuỗi input người dùng vào một câu lệnh, kẻ tấn công có thể thêm cú pháp để
biến *dữ liệu* của họ thành *lệnh*.

> Giải pháp tổng quát: **tách bạch lệnh và dữ liệu**. Đưa dữ liệu cho hệ thống
> *dưới dạng tham số*, không bao giờ *ghép chuỗi* nó vào lệnh.

## SQL Injection

**SQL injection (SQLi)** xảy ra khi input người dùng được ghép vào câu truy vấn
SQL. Ví dụ kinh điển ở màn đăng nhập:

```js
// LỖ HỔNG: ghép chuỗi input vào SQL
const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${pw}'`

// Kẻ tấn công nhập email = ' OR '1'='1' --
// → SELECT * FROM users WHERE email = '' OR '1'='1' -- ' AND password = '...'
// '1'='1' luôn đúng, "--" biến phần sau thành chú thích → đăng nhập không cần mật khẩu
```

Hậu quả SQLi: vượt xác thực, đọc/sửa/xoá toàn bộ dữ liệu, đôi khi chiếm cả máy
chủ DB.

## Phòng thủ SQLi: tham số hoá truy vấn

Cách phòng thủ chuẩn là **parameterized query** (truy vấn tham số hoá, còn gọi
*prepared statement*): bạn viết câu lệnh với chỗ giữ chỗ (`?` hoặc `$1`), và đưa
dữ liệu **tách riêng**. Driver DB đảm bảo dữ liệu **không bao giờ** được hiểu là
cú pháp SQL.

```js
// ĐÚNG: tham số hoá — dữ liệu đi tách khỏi câu lệnh
// node-postgres
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
  [email, passwordHash]
)

// mysql2
const [rows] = await conn.execute(
  'SELECT * FROM users WHERE email = ? AND password_hash = ?',
  [email, passwordHash]
)
```

Tốt hơn nữa, dùng **ORM/query builder** (Prisma, Drizzle, TypeORM...) — chúng tham
số hoá tự động:

```js
// Prisma: an toàn mặc định, không ghép chuỗi
const user = await prisma.user.findUnique({ where: { email } })
```

:::danger Tuyệt đối không ghép chuỗi vào SQL
Đừng bao giờ dùng template string / nối chuỗi để dựng SQL từ input. Kể cả khi
"chắc chắn dữ liệu là số", hãy vẫn tham số hoá — đó là thói quen an toàn nhất.
:::

## Xử lý tên cột/bảng động

Tham số hoá chỉ áp dụng cho **giá trị**, không áp dụng cho **tên cột/bảng** (vd
`ORDER BY <cột>`). Với phần này, dùng **danh sách trắng (whitelist)**:

```js
// LỖ HỔNG: nhét tên cột từ input thẳng vào SQL
const sql = `SELECT * FROM users ORDER BY ${req.query.sortBy}` // nguy hiểm!

// ĐÚNG: chỉ chấp nhận giá trị trong danh sách trắng
const ALLOWED = new Set(['name', 'email', 'created_at'])
const sortBy = ALLOWED.has(req.query.sortBy) ? req.query.sortBy : 'created_at'
const sql = `SELECT * FROM users ORDER BY ${sortBy}` // sortBy đã được kiểm soát
```

## Command Injection

**Command injection** xảy ra khi input người dùng được ghép vào **lệnh hệ điều
hành** chạy trên server.

```js
// LỖ HỔNG: ghép input vào lệnh shell
const { exec } = require('child_process')
exec(`ping -c 1 ${req.query.host}`) // kẻ tấn công: host = "8.8.8.8; rm -rf /"
```

Phòng thủ:

```js
// ĐÚNG: dùng execFile, truyền tham số dạng MẢNG (không qua shell)
const { execFile } = require('child_process')
execFile('ping', ['-c', '1', host], (err, stdout) => { /* ... */ })
```

Nguyên tắc:

- **Tránh gọi shell** khi có thể; ưu tiên `execFile`/`spawn` với **mảng tham số**
  (không để shell diễn giải chuỗi).
- **Validate chặt** input (vd host phải khớp định dạng IP/tên miền).
- Áp dụng **đặc quyền tối thiểu** cho tiến trình chạy lệnh.

> Cùng tư duy với SQLi: **tách lệnh khỏi dữ liệu**. Truyền tham số dạng mảng tương
> đương với tham số hoá truy vấn.

## Tóm tắt

- **Injection** = trộn "lệnh" với "dữ liệu"; kẻ tấn công biến dữ liệu thành lệnh.
- **SQL injection**: chống bằng **truy vấn tham số hoá** (prepared statement) hoặc
  **ORM**; **không bao giờ ghép chuỗi** input vào SQL.
- Tên cột/bảng động: dùng **danh sách trắng**, vì không tham số hoá được.
- **Command injection**: tránh shell, dùng `execFile`/`spawn` với **mảng tham
  số**, validate chặt, đặc quyền tối thiểu.
- Tư duy chung cho mọi injection: **tách bạch lệnh và dữ liệu**.

Bài tiếp theo: **SSRF & Clickjacking** — hai tấn công quan trọng còn lại.
