---
sidebar_position: 3
title: "3. Sự kiện (Events)"
---

# Sự kiện (Events)


---

## Mục lục

- [Event là gì?](#event-là-gì)
- [Tại sao Event ra đời?](#tại-sao-event-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Event là gì?

**Event (sự kiện)** là **bất kỳ hành động nào xảy ra** trên trang web -- người dùng click chuột, gõ phím, cuộn trang, tải trang xong... JavaScript có thể **lắng nghe** các sự kiện này và **phản hồi** bằng cách chạy một hàm (gọi là **event handler**).

**Ví dụ thực tế:** Hãy tưởng tượng bạn ở trong nhà. Khi ai đó **nhấn chuông cửa** (sự kiện), bạn **đi ra mở cửa** (phản hồi). Chuông cửa là **event**, hành động mở cửa là **event handler**.

```
Người dùng hành động (click, gõ phím...)  -->  Trình duyệt phát hiện sự kiện
                                           -->  Gọi hàm xử lý (event handler)
                                           -->  Trang web phản hồi
```

---

## Tại sao Event ra đời?

Trong những ngày đầu, trang web **không thể phản hồi** người dùng. Event ra đời để:

1. **Tạo tương tác** -- click nút, gửi form, kéo thả
2. **Web động** -- thay đổi giao diện theo hành động người dùng
3. **Trải nghiệm người dùng** -- phản hồi ngay lập tức, không cần tải trang
4. **Ứng dụng phức tạp** -- game, chat, editor, bản đồ... đều cần event

---

## Cách sử dụng

### 1. addEventListener -- Cách chuẩn (KHUYÊN DÙNG)

```html
<button id="nut-bam">Click vào đây!</button>
```

```javascript
var nutBam = document.getElementById("nut-bam");

// Cú pháp: element.addEventListener(tênSựKiện, hàmXửLý)
nutBam.addEventListener("click", function() {
  alert("Bạn đã click!");
});

// Hoặc dùng hàm có tên (dễ hơn khi cần xóa listener)
function xuLyClick() {
  alert("Bạn đã click!");
}
nutBam.addEventListener("click", xuLyClick);
```

### 2. Inline Event -- Cách cũ (KHÔNG NÊN DÙNG)

```html
<!-- ❌ KHÔNG NÊN: Inline event trong HTML -->
<button onclick="alert('Click!')">Click</button>
<button onclick="xuLyClick()">Click</button>

<!-- ✅ NÊN DÙNG: Tách HTML và JavaScript riêng biệt -->
<button id="nut-bam">Click</button>
<script>
  document.getElementById("nut-bam").addEventListener("click", function() {
    alert("Click!");
  });
</script>
```

**Tại sao addEventListener tốt hơn inline event?**

| Đặc điểm | Inline (`onclick="..."`) | `addEventListener` |
|----------|--------------------------|---------------------|
| **Tách biệt** | HTML và JS trộn lẫn | HTML và JS riêng biệt |
| **Nhiều handler** | Chỉ 1 handler / sự kiện | Nhiều handler / sự kiện |
| **Xóa handler** | Khó xóa | Dễ xóa bằng `removeEventListener` |
| **Bảo mật** | Nguy cơ XSS | An toàn hơn |

```javascript
var nut = document.getElementById("nut");

// addEventListener: Có thể gán NHIỀU handler cho cùng 1 sự kiện
nut.addEventListener("click", function() {
  console.log("Handler 1"); // Chạy
});
nut.addEventListener("click", function() {
  console.log("Handler 2"); // Cũng chạy!
});

// Inline chỉ giữ được 1:
nut.onclick = function() { console.log("Handler 1"); };
nut.onclick = function() { console.log("Handler 2"); }; // Ghi đè Handler 1!
```

---

### 3. Các loại Event thường dùng

#### Event chuột (Mouse Events)

```html
<button id="nut">Nút bấm</button>
<div id="vung" style="width:200px; height:200px; background:lightblue;">
  Di chuột vào đây
</div>
```

```javascript
var nut = document.getElementById("nut");
var vung = document.getElementById("vung");

// click -- Khi click chuột
nut.addEventListener("click", function() {
  console.log("Đã click!");
});

// dblclick -- Khi double-click
nut.addEventListener("dblclick", function() {
  console.log("Đã double-click!");
});

// mouseenter -- Khi chuột đi vào phần tử
vung.addEventListener("mouseenter", function() {
  vung.style.background = "lightgreen";
});

// mouseleave -- Khi chuột rời khỏi phần tử
vung.addEventListener("mouseleave", function() {
  vung.style.background = "lightblue";
});
```

#### Event bàn phím (Keyboard Events)

```html
<input id="o-nhap" type="text" placeholder="Gõ gì đó...">
```

```javascript
var oNhap = document.getElementById("o-nhap");

// keydown -- Khi nhấn phím (chạy liên tục khi giữ phím)
oNhap.addEventListener("keydown", function(e) {
  console.log("Phím nhấn:", e.key); // "a", "Enter", "Escape"...
});

// keyup -- Khi thả phím
oNhap.addEventListener("keyup", function(e) {
  console.log("Phím thả:", e.key);
});

// Ví dụ: Nhấn Enter để gửi
oNhap.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    console.log("Gửi nội dung:", oNhap.value);
  }
});
```

#### Event form

```html
<form id="form-dang-ky">
  <input id="ten" type="text" placeholder="Nhập tên">
  <select id="thanh-pho">
    <option value="">Chọn thành phố</option>
    <option value="hn">Hà Nội</option>
    <option value="hcm">Hồ Chí Minh</option>
  </select>
  <button type="submit">Đăng ký</button>
</form>
```

```javascript
var form = document.getElementById("form-dang-ky");
var inputTen = document.getElementById("ten");
var selectTP = document.getElementById("thanh-pho");

// submit -- Khi gửi form
form.addEventListener("submit", function(e) {
  e.preventDefault(); // Ngăn form gửi và tải lại trang (RẤT QUAN TRỌNG!)
  console.log("Tên:", inputTen.value);
  console.log("Thành phố:", selectTP.value);
});

// input -- Khi giá trị thay đổi (chạy NGAY khi gõ)
inputTen.addEventListener("input", function(e) {
  console.log("Đang gõ:", e.target.value);
});

// change -- Khi giá trị thay đổi và MẤT FOCUS (hoặc chọn option)
selectTP.addEventListener("change", function(e) {
  console.log("Đã chọn:", e.target.value);
});
```

#### Event tải trang (Load Events)

```javascript
// DOMContentLoaded -- HTML đã tải xong (CHƯA đợi hình ảnh, CSS)
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM đã sẵn sàng!");
  // An toàn để thao tác DOM ở đây
});

// load -- TẤT CẢ tải xong (hình ảnh, CSS, font...)
window.addEventListener("load", function() {
  console.log("Toàn bộ trang đã tải xong!");
});
```

**Bảng tổng hợp Event thường dùng:**

| Nhóm | Event | Khi nào xảy ra |
|------|-------|----------------|
| **Chuột** | `click`, `dblclick` | Click, double-click |
| **Chuột** | `mouseenter`, `mouseleave` | Chuột vào/ra phần tử |
| **Phím** | `keydown`, `keyup` | Nhấn/thả phím |
| **Form** | `submit` | Gửi form |
| **Form** | `input` | Gõ phím trong input (real-time) |
| **Form** | `change` | Thay đổi giá trị và mất focus |
| **Form** | `focus`, `blur` | Click vào/ra input |
| **Trang** | `DOMContentLoaded` | HTML tải xong |
| **Trang** | `load` | Tất cả tải xong |
| **Cuộn** | `scroll` | Cuộn trang |

---

### 4. Event Object (đối tượng sự kiện)

Mỗi khi sự kiện xảy ra, trình duyệt tự động truyền một **Event object** (thường gọi là `e` hoặc `event`) vào hàm xử lý. Object này chứa **thông tin chi tiết** về sự kiện.

```javascript
document.getElementById("nut").addEventListener("click", function(e) {
  // e là Event object -- chứa thông tin về sự kiện click

  console.log(e.type);      // "click" -- loại sự kiện
  console.log(e.target);    // <button id="nut">... -- phần tử được click
  console.log(e.clientX);   // 150 -- tọa độ X của chuột
  console.log(e.clientY);   // 200 -- tọa độ Y của chuột
  console.log(e.timeStamp); // 12345.67 -- thời gian sự kiện xảy ra
});
```

#### e.target vs e.currentTarget

```html
<div id="cha" style="padding: 20px; background: lightblue;">
  <button id="con">Click con</button>
</div>
```

```javascript
var cha = document.getElementById("cha");

cha.addEventListener("click", function(e) {
  console.log("target:", e.target);        // Phần tử được click THẬT SỰ
  console.log("currentTarget:", e.currentTarget); // Phần tử GẮN listener (luôn là cha)
});

// Khi click vào button "con":
// target: <button id="con">       -- phần tử được click
// currentTarget: <div id="cha">   -- phần tử gắn listener
```

#### e.preventDefault() -- Ngăn hành vi mặc định

```javascript
// Ngăn form gửi và tải lại trang
document.getElementById("form").addEventListener("submit", function(e) {
  e.preventDefault();
  console.log("Form không gửi, xử lý bằng JavaScript");
});

// Ngăn link chuyển trang
document.querySelector("a").addEventListener("click", function(e) {
  e.preventDefault();
  console.log("Link không chuyển trang");
});
```

#### e.stopPropagation() -- Ngăn sự kiện nổi bọt (bubbling)

```html
<div id="ngoai" style="padding: 30px; background: coral;">
  Ngoài
  <div id="trong" style="padding: 20px; background: lightgreen;">
    Trong
    <button id="nut">Click</button>
  </div>
</div>
```

```javascript
document.getElementById("ngoai").addEventListener("click", function() {
  console.log("Ngoài được click");
});

document.getElementById("trong").addEventListener("click", function() {
  console.log("Trong được click");
});

document.getElementById("nut").addEventListener("click", function(e) {
  console.log("Nút được click");
  e.stopPropagation(); // DỪNG! Không nổi bọt lên cha nữa
});

// Khi click nút:
// Không có stopPropagation: "Nút" -> "Trong" -> "Ngoài" (nổi bọt lên)
// Có stopPropagation:       Chỉ "Nút" (dừng lại)
```

---

### 5. removeEventListener -- Xóa event listener

```javascript
function xuLyClick() {
  console.log("Đã click!");
}

var nut = document.getElementById("nut");

// Thêm listener
nut.addEventListener("click", xuLyClick);

// Xóa listener (PHẢI dùng CÙNG HÀM ĐÃ ĐĂNG KÝ)
nut.removeEventListener("click", xuLyClick);
```

```javascript
// ❌ SAI: Không thể xóa hàm ẩn danh (anonymous function)
nut.addEventListener("click", function() {
  console.log("Click!");
});
nut.removeEventListener("click", function() {
  console.log("Click!");
}); // KHÔNG HOẠT ĐỘNG! Đây là 2 hàm KHÁC NHAU trong bộ nhớ

// ✅ ĐÚNG: Dùng hàm có tên
function hamClick() {
  console.log("Click!");
}
nut.addEventListener("click", hamClick);
nut.removeEventListener("click", hamClick); // OK -- cùng 1 hàm
```

---

## Khi nào dùng?

| Event | Tình huống |
|-------|-----------|
| `click` | Nút bấm, menu, link, card |
| `submit` | Gửi form đăng ký, đăng nhập, tìm kiếm |
| `input` | Tìm kiếm real-time, đếm ký tự |
| `keydown` | Phím tắt (Ctrl+S, Escape), game |
| `change` | Chọn option, checkbox, radio |
| `scroll` | Lazy loading, navbar cố định, "back to top" |
| `DOMContentLoaded` | Khởi tạo ứng dụng JavaScript |
| `mouseenter/leave` | Tooltip, hover effect |

---

## Lỗi thường gặp

### Lỗi 1: Quên preventDefault khi xử lý form

```javascript
// ❌ SAI: Form gửi và tải lại trang
form.addEventListener("submit", function() {
  console.log("Xử lý form..."); // Chạy nhưng trang tải lại ngay!
});

// ✅ ĐÚNG: Ngăn hành vi mặc định
form.addEventListener("submit", function(e) {
  e.preventDefault(); // Ngăn tải lại trang
  console.log("Xử lý form...");
});
```

### Lỗi 2: Nhầm e.target và e.currentTarget

```javascript
// ❌ SAI: Dùng e.target khi muốn lấy phần tử gắn listener
cha.addEventListener("click", function(e) {
  e.target.classList.add("active"); // Có thể là phần tử con bên trong!
});

// ✅ ĐÚNG: Dùng e.currentTarget để lấy chính phần tử gắn listener
cha.addEventListener("click", function(e) {
  e.currentTarget.classList.add("active"); // Luôn là phần tử gắn listener
});
```

### Lỗi 3: Không thể xóa anonymous function

```javascript
// ❌ SAI: Không thể xóa được
nut.addEventListener("click", function() { /* ... */ });
// Không có cách nào removeEventListener!

// ✅ ĐÚNG: Dùng named function nếu cần xóa sau
function hamXuLy() { /* ... */ }
nut.addEventListener("click", hamXuLy);
// Sau này có thể xóa: nut.removeEventListener("click", hamXuLy);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Event bubbling và event capturing là gì?

**Đáp án:**

Khi sự kiện xảy ra, nó đi qua **3 giai đoạn**:

```
1. Capturing (bắt) : window --> document --> html --> body --> div --> button (từ ngoài vào)
2. Target          : button (phần tử được click)
3. Bubbling (nổi bọt): button --> div --> body --> html --> document --> window (từ trong ra)
```

```javascript
var cha = document.getElementById("cha");
var con = document.getElementById("con");

// Bubbling (mặc định) -- từ con lên cha
cha.addEventListener("click", function() {
  console.log("Cha - bubbling");
});

// Capturing -- từ cha xuống con (tham số thứ 3 = true)
cha.addEventListener("click", function() {
  console.log("Cha - capturing");
}, true); // true = capturing phase

// Khi click "con":
// "Cha - capturing"  (1. capturing - từ ngoài vào)
// "Cha - bubbling"   (3. bubbling - từ trong ra)
```

Mặc định, `addEventListener` lắng nghe ở **giai đoạn bubbling**. Thêm `true` làm tham số thứ 3 để lắng nghe ở **giai đoạn capturing**.

---

### Câu 2: preventDefault và stopPropagation khác nhau thế nào?

**Đáp án:**

| | `preventDefault()` | `stopPropagation()` |
|-|---------------------|---------------------|
| **Tác dụng** | Ngăn **hành vi mặc định** của trình duyệt | Ngăn sự kiện **nổi bọt lên cha** |
| **Ví dụ** | Ngăn form gửi, ngăn link chuyển trang | Ngăn sự kiện click truyền từ con lên cha |
| **Sự kiện vẫn truyền?** | Có -- sự kiện vẫn nổi bọt | Không -- dừng lại ngay |

```javascript
// preventDefault: Ngăn link chuyển trang, nhưng sự kiện vẫn nổi bọt
link.addEventListener("click", function(e) {
  e.preventDefault();  // Link không chuyển trang
  // Sự kiện vẫn nổi bọt lên các phần tử cha
});

// stopPropagation: Ngăn sự kiện nổi bọt, nhưng hành vi mặc định vẫn xảy ra
nut.addEventListener("click", function(e) {
  e.stopPropagation(); // Cha không nhận sự kiện
  // Nhưng hành vi mặc định (nếu có) vẫn xảy ra
});

// Dùng cả hai:
form.addEventListener("submit", function(e) {
  e.preventDefault();    // Không gửi form
  e.stopPropagation();   // Không nổi bọt
});
```

---

### Câu 3: Làm thế nào để xóa event listener? Tại sao không xóa được với anonymous function?

**Đáp án:**

Để xóa listener, bạn phải truyền **chính xác cùng hàm** đã dùng khi đăng ký:

```javascript
// ✅ Có thể xóa -- dùng named function
function hamClick() { console.log("Click!"); }
nut.addEventListener("click", hamClick);
nut.removeEventListener("click", hamClick); // OK!

// ❌ Không thể xóa -- anonymous function
nut.addEventListener("click", function() { console.log("Click!"); });
nut.removeEventListener("click", function() { console.log("Click!"); });
// KHÔNG hoạt động vì 2 function() \{\} là 2 OBJECT KHÁC NHAU trong bộ nhớ
// Giống như: \{\} === \{\} là false
```

Giải pháp thay thế khi dùng anonymous function -- dùng **AbortController** (ES2020):

```javascript
var controller = new AbortController();

nut.addEventListener("click", function() {
  console.log("Click!");
}, { signal: controller.signal });

// Xóa listener
controller.abort(); // Xóa tất cả listener được gắn với signal này
```

---

### Câu 4: DOMContentLoaded và load khác nhau thế nào?

**Đáp án:**

| | `DOMContentLoaded` | `load` |
|-|---------------------|--------|
| **Khi nào** | HTML **đã parse xong**, DOM sẵn sàng | **Tất cả** tài nguyên đã tải xong (hình, CSS, font...) |
| **Nhanh hơn?** | Có -- không đợi hình ảnh | Chậm hơn -- đợi tất cả |
| **Dùng khi** | Cần thao tác DOM | Cần kích thước hình, font đã tải |

```javascript
document.addEventListener("DOMContentLoaded", function() {
  // DOM sẵn sàng, có thể thao tác
  // Hình ảnh có thể CHƯA tải xong
  console.log("DOM ready!");
});

window.addEventListener("load", function() {
  // TẤT CẢ đã tải xong, kể cả hình ảnh
  var img = document.querySelector("img");
  console.log("Kích thước ảnh:", img.naturalWidth, img.naturalHeight);
});
```

**Thực tế:** 90% trường hợp dùng `DOMContentLoaded` là đủ. Chỉ dùng `load` khi cần kích thước hình ảnh hoặc cần đảm bảo mọi thứ đã tải xong.

---

### Câu 5: Giải thích luồng đi của event khi click một button nằm trong nhiều div lồng nhau.

**Đáp án:**

```html
<div id="ong">
  <div id="cha">
    <button id="nut">Click</button>
  </div>
</div>
```

Khi click button, sự kiện đi qua 3 giai đoạn:

```
=== CAPTURING (bắt - từ ngoài vào trong) ===
window -> document -> html -> body -> #ong -> #cha -> #nut

=== TARGET ===
#nut (phần tử được click)

=== BUBBLING (nổi bọt - từ trong ra ngoài) ===
#nut -> #cha -> #ong -> body -> html -> document -> window
```

```javascript
document.getElementById("ong").addEventListener("click", function() {
  console.log("1. Ông - capturing");
}, true);

document.getElementById("cha").addEventListener("click", function() {
  console.log("2. Cha - capturing");
}, true);

document.getElementById("nut").addEventListener("click", function() {
  console.log("3. Nút - target");
});

document.getElementById("cha").addEventListener("click", function() {
  console.log("4. Cha - bubbling");
});

document.getElementById("ong").addEventListener("click", function() {
  console.log("5. Ông - bubbling");
});

// Kết quả khi click nút:
// 1. Ông - capturing
// 2. Cha - capturing
// 3. Nút - target
// 4. Cha - bubbling
// 5. Ông - bubbling
```
