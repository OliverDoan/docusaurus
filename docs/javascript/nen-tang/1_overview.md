---
sidebar_position: 1
title: "Tổng quan về JavaScript"
---

# Tổng quan về JavaScript

## JavaScript là gì?

**JavaScript** (viết tắt: JS) là một ngôn ngữ lập trình được dùng để tạo ra các trang web **tương tác** — nghĩa là trang web có thể phản hồi lại hành động của người dùng (click chuột, gõ bàn phím, cuộn trang...).

> **Ví dụ thực tế:** Hãy tưởng tượng một trang web là một căn nhà. HTML là bộ khung (tường, cửa, mái), CSS là sơn và trang trí, còn **JavaScript là hệ thống điện** — giúp đèn bật tắt, cửa tự động mở, chuông kêu khi có khách.

### Ba trụ cột của web

| Công nghệ | Vai trò | Ví dụ |
|-----------|---------|-------|
| **HTML** | Cấu trúc nội dung | Tiêu đề, đoạn văn, hình ảnh |
| **CSS** | Giao diện & trình bày | Màu sắc, font chữ, bố cục |
| **JavaScript** | Hành vi & tương tác | Nút bấm, form, animation |

## Tại sao JavaScript ra đời?

### Câu chuyện lịch sử

Năm **1995**, internet còn rất sơ khai. Các trang web chỉ là văn bản tĩnh — không có nút bấm, không có hiệu ứng, không có gì tương tác cả.

**Brendan Eich**, một lập trình viên tại công ty **Netscape** (trình duyệt phổ biến nhất thời đó), được giao nhiệm vụ:

> "Tạo một ngôn ngữ lập trình cho trình duyệt, để trang web có thể tương tác được."

Và ông đã tạo ra JavaScript chỉ trong **10 ngày**! Ban đầu nó có tên là **Mocha**, rồi đổi thành **LiveScript**, cuối cùng mới đổi thành **JavaScript**.

### Vấn đề mà JS giải quyết

Trước khi có JavaScript:
- Muốn kiểm tra form (email hợp lệ không?) phải gửi lên server rồi đợi server trả về lỗi
- Không có animation, menu dropdown, hay bất kỳ tương tác nào
- Trang web hoàn toàn tĩnh như đọc báo giấy

Sau khi có JavaScript:
- Kiểm tra form ngay trên trình duyệt (không cần gửi lên server)
- Tạo hiệu ứng, animation, game ngay trên trang web
- Trang web trở nên sống động và tương tác

## JavaScript KHÔNG phải Java

Đây là nhầm lẫn phổ biến nhất của người mới:

| | JavaScript | Java |
|---|-----------|------|
| **Tạo bởi** | Brendan Eich (Netscape) | James Gosling (Sun Microsystems) |
| **Năm** | 1995 | 1995 |
| **Kiểu ngôn ngữ** | Thông dịch (interpreted) | Biên dịch (compiled) |
| **Chạy ở đâu** | Trình duyệt + Server (Node.js) | Máy chủ, ứng dụng desktop, Android |
| **Cú pháp** | Linh hoạt, ít quy tắc | Nghiêm ngặt, nhiều quy tắc |

> Tên "JavaScript" được đặt vì lý do **marketing** — Java rất hot thời đó, nên Netscape muốn "ăn theo" sự nổi tiếng của Java. Thực tế hai ngôn ngữ **hoàn toàn khác nhau**.

## Cách chạy JavaScript

Có 3 cách phổ biến để chạy JavaScript:

### Cách 1: Console của trình duyệt

Mở trình duyệt (Chrome, Firefox...) → Nhấn `F12` hoặc `Ctrl + Shift + J` → Chọn tab **Console** → Gõ code:

```js
// Gõ dòng này vào Console rồi nhấn Enter
console.log("Xin chào JavaScript!");
// Kết quả: Xin chào JavaScript!

// Thử phép tính
2 + 3;
// Kết quả: 5

// Tạo một thông báo popup
alert("Đây là JavaScript!");
```

### Cách 2: Nhúng vào file HTML

Tạo file `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Học JavaScript</title>
</head>
<body>
  <h1>Trang web đầu tiên</h1>

  <!-- Cách 1: Viết JS trực tiếp trong thẻ script -->
  <script>
    console.log("Chào từ file HTML!");
    document.querySelector("h1").style.color = "blue";
  </script>

  <!-- Cách 2: Liên kết đến file JS bên ngoài (khuyên dùng) -->
  <script src="app.js"></script>
</body>
</html>
```

### Cách 3: Chạy bằng Node.js (trên máy tính, không cần trình duyệt)

```bash
# Cài Node.js từ https://nodejs.org
# Tạo file app.js
# Chạy bằng lệnh:
node app.js
```

```js
// File: app.js
console.log("Chạy JS trên máy tính bằng Node.js!");
```

### Client-side vs Server-side

| | Client-side (Trình duyệt) | Server-side (Node.js) |
|---|---------------------------|----------------------|
| **Chạy ở đâu** | Máy của người dùng | Máy chủ (server) |
| **Dùng để** | Giao diện, tương tác | API, database, xử lý logic |
| **Ví dụ** | Hiệu ứng click, form | Đăng nhập, lưu dữ liệu |
| **Công nghệ** | React, Vue, Angular | Express, NestJS |

## Khi nào dùng JavaScript?

JavaScript ngày nay có mặt **ở khắp mọi nơi**:

- **Web Frontend:** React, Vue, Angular
- **Web Backend:** Node.js, Express, NestJS
- **Mobile App:** React Native, Ionic
- **Desktop App:** Electron (VS Code được viết bằng Electron!)
- **Game:** Phaser, Three.js
- **AI/ML:** TensorFlow.js

## Lỗi thường gặp khi mới học

### 1. Quên dấu chấm phẩy hoặc ngoặc

```js
// ❌ Thiếu dấu ngoặc đóng
console.log("Hello"

// ✅ Đầy đủ
console.log("Hello");
```

### 2. Gõ sai tên hàm

```js
// ❌ Sai chính tả (viết hoa sai)
Console.log("Hello");    // Lỗi! Console viết hoa chữ C
consol.log("Hello");     // Lỗi! Thiếu chữ e

// ✅ Đúng chính tả
console.log("Hello");
```

### 3. Nhầm dấu nháy

```js
// ❌ Dùng dấu nháy cong (smart quotes) — thường xảy ra khi copy từ Word
console.log("Hello");  // Lỗi!

// ✅ Dùng dấu nháy thẳng
console.log("Hello");
console.log('Hello');
```

---

## Câu hỏi phỏng vấn

### Câu 1: JavaScript là ngôn ngữ biên dịch hay thông dịch?

**Đáp án:**

JavaScript là ngôn ngữ **thông dịch** (interpreted) — nghĩa là code được đọc và thực thi **từng dòng một**, không cần biên dịch toàn bộ trước khi chạy.

Tuy nhiên, các trình duyệt hiện đại sử dụng kỹ thuật **JIT (Just-In-Time) compilation** — kết hợp cả thông dịch và biên dịch để tối ưu tốc độ. Engine V8 của Chrome sẽ biên dịch các đoạn code "nóng" (chạy nhiều lần) thành mã máy để chạy nhanh hơn.

```js
// Code JS được thực thi từng dòng
console.log("Dòng 1"); // Chạy trước
console.log("Dòng 2"); // Chạy sau
console.log("Dòng 3"); // Chạy cuối
```

### Câu 2: JavaScript là single-threaded nghĩa là gì?

**Đáp án:**

**Single-threaded** nghĩa là JavaScript chỉ có **một luồng xử lý duy nhất** — tại một thời điểm chỉ có thể làm **một việc**.

> **Ví dụ thực tế:** Giống như một quán phở chỉ có 1 đầu bếp. Đầu bếp phải nấu xong tô phở cho khách A rồi mới nấu cho khách B. Nhưng trong lúc đợi nước sôi (tác vụ bất đồng bộ), đầu bếp có thể chuẩn bị rau cho khách B.

JavaScript xử lý tác vụ bất đồng bộ (async) thông qua **Event Loop** — cho phép "đợi" mà không bị "đứng hình":

```js
console.log("Bắt đầu");

// setTimeout là tác vụ bất đồng bộ — không chặn luồng chính
setTimeout(() => {
  console.log("Sau 2 giây");
}, 2000);

console.log("Kết thúc");

// Kết quả:
// "Bắt đầu"
// "Kết thúc"
// "Sau 2 giây" (sau 2 giây)
```

### Câu 3: JavaScript có thể chạy ở đâu?

**Đáp án:**

JavaScript có thể chạy ở **hai môi trường chính**:

1. **Trình duyệt (Client-side):** Mọi trình duyệt web đều có JS engine tích hợp sẵn (Chrome dùng V8, Firefox dùng SpiderMonkey). Đây là môi trường "gốc" của JS.

2. **Server (Server-side):** Nhờ **Node.js** (ra đời năm 2009), JavaScript có thể chạy trên máy chủ — xây dựng API, thao tác database, xử lý file...

Ngoài ra còn có thể chạy trên:
- **Mobile:** React Native, Ionic
- **Desktop:** Electron (VS Code, Discord, Slack đều dùng Electron)
- **IoT:** Johnny-Five (lập trình robot, Arduino)

### Câu 4: Sự khác nhau giữa JavaScript và ECMAScript là gì?

**Đáp án:**

- **ECMAScript (ES)** là **tiêu chuẩn** (specification) — giống như bản thiết kế
- **JavaScript** là **ngôn ngữ triển khai** tiêu chuẩn đó — giống như ngôi nhà được xây từ bản thiết kế

Các phiên bản quan trọng:

| Phiên bản | Năm | Tính năng nổi bật |
|-----------|-----|-------------------|
| ES5 | 2009 | `strict mode`, `JSON`, array methods |
| **ES6 / ES2015** | 2015 | `let`, `const`, arrow function, class, Promise |
| ES2017 | 2017 | `async/await` |
| ES2020 | 2020 | `?.` (optional chaining), `??` (nullish coalescing) |

Khi ai đó nói "ES6" hoặc "ES2015", họ đang nói về **phiên bản tiêu chuẩn** của JavaScript.
