---
sidebar_position: 1
title: "DOM là gì?"
---

# DOM là gì?

## DOM là gì?

**DOM (Document Object Model)** là **bản đồ cây gia phả của trang web**. Khi trình duyệt đọc file HTML, nó sẽ xây dựng một "cây" đại diện cho toàn bộ trang web -- gọi là **DOM tree**. JavaScript dùng cây này để **đọc, thay đổi, thêm hoặc xóa** bất kỳ phần tử nào trên trang.

**Ví dụ thực tế:** Hãy tưởng tượng trang web là một **ngôi nhà**. HTML là bản thiết kế ngôi nhà (tường, cửa, bàn ghế...). DOM là **mô hình 3D** của ngôi nhà đó -- bạn có thể nhìn thấy từng phòng, từng đồ vật và **di chuyển, thêm, xóa** bất kỳ thứ gì trong mô hình.

```
Trình duyệt đọc HTML --> Xây dựng DOM tree --> JavaScript thao tác DOM --> Trang web thay đổi
```

---

## Cấu trúc DOM Tree

DOM tree có cấu trúc **phân cấp từ cha đến con**, giống như cây gia phả:

```
document
└── html
    ├── head
    │   ├── title
    │   └── meta
    └── body
        ├── h1
        ├── p
        └── div
            ├── span
            └── a
```

**Tương ứng với HTML:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Trang của tôi</title>
  </head>
  <body>
    <h1>Xin chào</h1>
    <p>Đây là đoạn văn bản</p>
    <div>
      <span>Nội dung</span>
      <a href="#">Liên kết</a>
    </div>
  </body>
</html>
```

Mỗi "ô" trong cây gọi là một **Node** (nút). Các node có mối quan hệ **cha - con - anh em**:

| Quan hệ | Ví dụ |
|---------|-------|
| **Parent (cha)** | `body` là cha của `h1`, `p`, `div` |
| **Child (con)** | `h1` là con của `body` |
| **Sibling (anh em)** | `h1` và `p` là anh em (cùng cha `body`) |

---

## Các loại Node trong DOM

DOM có nhiều loại node khác nhau:

| Loại Node | Mô tả | Ví dụ |
|-----------|-------|-------|
| **Element Node** | Thẻ HTML | `<div>`, `<p>`, `<h1>` |
| **Text Node** | Nội dung văn bản bên trong thẻ | `"Xin chào"` trong `<h1>Xin chào</h1>` |
| **Attribute Node** | Thuộc tính của thẻ | `class="btn"`, `id="main"` |
| **Comment Node** | Ghi chú trong HTML | `<!-- Đây là comment -->` |

```html
<!-- Đây là comment node -->
<p id="gioi-thieu" class="text">Xin chào bạn!</p>
<!--
  p            --> Element Node
  id, class    --> Attribute Node
  "Xin chào bạn!" --> Text Node
  Đây là comment  --> Comment Node
-->
```

---

## document và window

Hai đối tượng quan trọng nhất khi làm việc với DOM:

### window -- Cửa sổ trình duyệt

`window` là đối tượng **lớn nhất**, đại diện cho **toàn bộ cửa sổ trình duyệt**. Mọi thứ trong JavaScript đều nằm bên trong `window`.

```javascript
// window chứa mọi thứ
console.log(window.innerWidth);  // Chiều rộng cửa sổ
console.log(window.innerHeight); // Chiều cao cửa sổ

// alert, setTimeout, console... đều là thuộc tính của window
window.alert("Xin chào!");  // Tương đương alert("Xin chào!")
```

### document -- Tài liệu HTML

`document` là **một thuộc tính của window**, đại diện cho **nội dung trang web** (HTML). Đây là điểm bắt đầu để thao tác DOM.

```javascript
// document là gốc của DOM tree
console.log(document.title);        // Tiêu đề trang web
console.log(document.URL);          // Địa chỉ trang web
console.log(document.body);         // Thẻ <body>
console.log(document.head);         // Thẻ <head>
```

### So sánh window vs document

| Đặc điểm | `window` | `document` |
|----------|----------|------------|
| **Đại diện cho** | Cửa sổ trình duyệt | Nội dung HTML |
| **Phạm vi** | Toàn bộ trình duyệt | Chỉ DOM tree |
| **Ví dụ** | `window.innerWidth`, `window.location` | `document.title`, `document.body` |
| **Quan hệ** | Đối tượng cha (global) | `window.document` |

```javascript
// Minh họa quan hệ
console.log(window.document === document); // true
// document là thuộc tính của window
```

---

## Tại sao DOM ra đời?

### Vấn đề trước khi có DOM

Trong những ngày đầu của web (năm 1990), trang web chỉ là **HTML tĩnh** -- không thể thay đổi sau khi tải xong. Người dùng muốn thay đổi nội dung? Phải **tải lại toàn bộ trang**.

```
Người dùng click --> Gửi request đến server --> Server trả HTML mới --> Tải lại trang
```

Điều này **chậm** và **khó chịu** cho người dùng.

### Giải pháp: DOM

Năm 1998, **W3C** (Tổ chức chuẩn web) tạo ra tiêu chuẩn DOM để:

1. **Cầu nối giữa HTML và JavaScript** -- JS có thể "nói chuyện" với HTML
2. **Thay đổi trang web mà không cần tải lại** -- Cập nhật nội dung ngay lập tức
3. **Tạo trang web tương tác** -- Phản hồi khi người dùng click, gõ phím, cuộn trang

```javascript
// Trước DOM: Phải tải lại trang để thay đổi nội dung
// Sau DOM: Thay đổi ngay lập tức!
document.getElementById("ten").textContent = "Nguyễn Văn A";
// --> Tên trên trang web thay đổi ngay, không cần tải lại
```

### Dòng thời gian

| Năm | Sự kiện |
|-----|---------|
| **1995** | JavaScript ra đời (Netscape) |
| **1996** | Mỗi trình duyệt có DOM riêng (không tương thích) |
| **1998** | W3C tạo **DOM Level 1** -- chuẩn thống nhất |
| **2000** | DOM Level 2 -- thêm Events, CSS |
| **2004** | DOM Level 3 -- thêm keyboard events, XPath |
| **Hiện nay** | DOM Living Standard -- cập nhật liên tục |

---

## Cách truy cập DOM cơ bản

```html
<!DOCTYPE html>
<html>
<body>
  <h1 id="tieu-de">Xin chào</h1>
  <p class="noi-dung">Đây là trang web của tôi</p>

  <script>
    // Lấy phần tử bằng ID
    var tieuDe = document.getElementById("tieu-de");
    console.log(tieuDe.textContent); // "Xin chào"

    // Lấy phần tử bằng class
    var noiDung = document.querySelector(".noi-dung");
    console.log(noiDung.textContent); // "Đây là trang web của tôi"

    // Thay đổi nội dung
    tieuDe.textContent = "Chào mừng bạn!";
    // --> Trên trang web, h1 sẽ hiện "Chào mừng bạn!" thay vì "Xin chào"
  </script>
</body>
</html>
```

---

## Khi nào dùng?

| Tình huống | Ví dụ |
|------------|-------|
| **Thay đổi nội dung trang** | Cập nhật tên người dùng sau khi đăng nhập |
| **Tạo giao diện động** | Hiện/ẩn menu, modal, dropdown |
| **Xử lý form** | Kiểm tra dữ liệu trước khi gửi |
| **Hoạt hình** | Di chuyển, thay đổi màu sắc phần tử |
| **SPA (Single Page Application)** | React, Vue -- thao tác DOM là nền tảng |

---

## Lỗi thường gặp

### Lỗi 1: Truy cập DOM trước khi HTML tải xong

```javascript
// ❌ SAI: Script nằm trong <head>, HTML chưa tải xong
// <head>
//   <script>
//     var btn = document.getElementById("nut-bam");
//     console.log(btn); // null -- vì HTML chưa có #nut-bam
//   </script>
// </head>

// ✅ ĐÚNG: Đặt script cuối <body> hoặc dùng DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("nut-bam");
  console.log(btn); // <button id="nut-bam">...</button>
});
```

### Lỗi 2: Nhầm lẫn document và window

```javascript
// ❌ SAI: Dùng document để lấy kích thước cửa sổ
console.log(document.innerWidth); // undefined

// ✅ ĐÚNG: Dùng window để lấy kích thước cửa sổ
console.log(window.innerWidth); // 1920 (hoặc giá trị thực tế)
```

### Lỗi 3: Không kiểm tra phần tử tồn tại

```javascript
// ❌ SAI: Truy cập thuộc tính của null
var phanTu = document.getElementById("khong-ton-tai");
phanTu.textContent = "ABC"; // Lỗi! Cannot read properties of null

// ✅ ĐÚNG: Kiểm tra trước khi dùng
var phanTu = document.getElementById("khong-ton-tai");
if (phanTu) {
  phanTu.textContent = "ABC";
} else {
  console.log("Phần tử không tồn tại");
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: DOM là gì? Giải thích đơn giản.

**Đáp án:**

DOM (Document Object Model) là mô hình đối tượng tài liệu -- một giao diện lập trình cho phép JavaScript truy cập và thay đổi nội dung, cấu trúc, và style của trang web. Khi trình duyệt đọc HTML, nó tạo ra một cây (DOM tree) đại diện cho toàn bộ trang. JavaScript dùng cây này để thao tác với trang web.

```javascript
// DOM cho phép JS tương tác với HTML
document.getElementById("tieu-de").textContent = "Nội dung mới";
```

---

### Câu 2: DOM tree là gì? Mô tả cấu trúc của nó.

**Đáp án:**

DOM tree là cấu trúc phân cấp hình cây, với `document` là gốc (root). Mỗi thẻ HTML trở thành một node trong cây. Các node có quan hệ cha-con-anh em.

```
document (root)
└── html (root element)
    ├── head
    │   └── title --> "Trang web"
    └── body
        ├── h1 --> "Tiêu đề"
        └── p  --> "Nội dung"
```

Các loại node: Element Node (thẻ HTML), Text Node (văn bản), Attribute Node (thuộc tính), Comment Node (ghi chú).

---

### Câu 3: Phân biệt document và window.

**Đáp án:**

| | `window` | `document` |
|-|----------|------------|
| **Là gì** | Đối tượng global của trình duyệt | Đối tượng đại diện cho HTML |
| **Phạm vi** | Bao gồm mọi thứ: DOM, BOM, JS | Chỉ phần nội dung trang web |
| **Ví dụ** | `window.innerWidth`, `window.setTimeout` | `document.body`, `document.querySelector` |
| **Quan hệ** | `document` là thuộc tính của `window` | `window.document === document` |

```javascript
// window -- thông tin trình duyệt
console.log(window.location.href); // URL hiện tại
console.log(window.innerWidth);    // Chiều rộng cửa sổ

// document -- thông tin trang web
console.log(document.title);       // Tiêu đề trang
console.log(document.body);        // Nội dung <body>
```

---

### Câu 4: Tại sao cần phải hiểu DOM khi đã có React/Vue?

**Đáp án:**

React và Vue **thao tác DOM phía sau** (Virtual DOM). Hiểu DOM giúp:

1. **Debug hiệu quả hơn** -- biết tại sao phần tử không hiển thị, tại sao style không áp dụng
2. **Hiểu hiệu suất** -- biết tại sao thao tác DOM trực tiếp chậm, tại sao Virtual DOM nhanh hơn
3. **Làm việc với thư viện bên ngoài** -- nhiều thư viện (chart, map, animation) thao tác DOM trực tiếp
4. **Phỏng vấn** -- câu hỏi DOM xuất hiện thường xuyên trong phỏng vấn frontend

---

### Câu 5: Các bước trình duyệt render trang web từ HTML đến hiển thị là gì?

**Đáp án:**

```
1. Tải HTML          --> Trình duyệt nhận file HTML từ server
2. Parse HTML        --> Đọc HTML và xây dựng DOM tree
3. Parse CSS         --> Đọc CSS và xây dựng CSSOM tree
4. Kết hợp           --> DOM + CSSOM = Render Tree
5. Layout            --> Tính toán vị trí, kích thước từng phần tử
6. Paint             --> Vẽ từng pixel lên màn hình
7. JavaScript        --> Chạy JS, có thể thay đổi DOM --> quay lại bước 5-6
```

```javascript
// Khi JS thay đổi DOM, trình duyệt phải tính lại layout và vẽ lại
document.getElementById("hop").style.width = "500px";
// --> Trình duyệt tính lại layout (reflow) và vẽ lại (repaint)
```

Đây là lý do thao tác DOM nhiều sẽ làm trang web **chậm** -- mỗi lần thay đổi đều có thể gây **reflow** và **repaint**.
