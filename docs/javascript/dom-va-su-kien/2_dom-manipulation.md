---
sidebar_position: 2
title: "Thao tác DOM"
---

# Thao tác DOM

## Thao tác DOM là gì?

**Thao tác DOM (DOM Manipulation)** là việc dùng JavaScript để **tìm, thay đổi, thêm hoặc xóa** các phần tử trên trang web. Đây là kỹ năng cơ bản nhất của lập trình frontend.

**Ví dụ thực tế:** Hãy tưởng tượng trang web là một **bảng tin**. Thao tác DOM giống như bạn **dán thêm giấy ghi chú**, **xóa giấy cũ**, **thay đổi nội dung giấy** hoặc **đổi vị trí các giấy** trên bảng tin đó.

---

## Tại sao thao tác DOM ra đời?

Trước đây, web chỉ là trang tĩnh -- người dùng không thể tương tác. Thao tác DOM ra đời để:

1. **Tạo trang web động** -- thay đổi nội dung mà không cần tải lại trang
2. **Phản hồi người dùng** -- hiện kết quả khi click, gõ phím, chọn menu
3. **Xây dựng SPA** -- React, Vue đều xây dựng trên thao tác DOM
4. **Trải nghiệm tốt hơn** -- trang web mượt mà, nhanh, giống ứng dụng

---

## Cách sử dụng

### 1. Tìm phần tử (Querying)

Trước khi thay đổi bất kỳ phần tử nào, bạn phải **tìm** nó trước.

```html
<div id="hop-chinh">
  <h1 class="tieu-de">Xin chào</h1>
  <p class="noi-dung">Đoạn văn 1</p>
  <p class="noi-dung">Đoạn văn 2</p>
  <span data-role="badge">Mới</span>
</div>
```

```javascript
// === getElementById: Tìm bằng ID (trả về 1 phần tử) ===
var hop = document.getElementById("hop-chinh");
console.log(hop); // <div id="hop-chinh">...</div>

// === querySelector: Tìm bằng CSS selector (trả về phần tử ĐẦU TIÊN) ===
var tieuDe = document.querySelector(".tieu-de");
console.log(tieuDe); // <h1 class="tieu-de">Xin chào</h1>

var badge = document.querySelector("[data-role='badge']");
console.log(badge); // <span data-role="badge">Mới</span>

// === querySelectorAll: Tìm TẤT CẢ phần tử khớp (trả về NodeList) ===
var cacNoiDung = document.querySelectorAll(".noi-dung");
console.log(cacNoiDung.length); // 2
cacNoiDung.forEach(function(p) {
  console.log(p.textContent);
});
// "Đoạn văn 1"
// "Đoạn văn 2"

// === getElementsByClassName: Tìm bằng class (trả về HTMLCollection) ===
var cacNoiDung2 = document.getElementsByClassName("noi-dung");
console.log(cacNoiDung2.length); // 2
```

**So sánh các phương pháp tìm:**

| Phương pháp | Trả về | Live/Static | Khi nào dùng |
|-------------|--------|-------------|--------------|
| `getElementById` | 1 phần tử hoặc `null` | -- | Biết chính xác ID |
| `querySelector` | 1 phần tử đầu tiên hoặc `null` | Static | CSS selector phức tạp |
| `querySelectorAll` | NodeList (nhiều phần tử) | Static | Lấy nhiều phần tử |
| `getElementsByClassName` | HTMLCollection | Live | Cần danh sách tự cập nhật |

> **Live vs Static:** HTMLCollection tự cập nhật khi DOM thay đổi. NodeList thì không (giống "chụp hình" tại thời điểm gọi).

---

### 2. Thay đổi nội dung

```html
<h1 id="tieu-de">Nội dung cũ</h1>
<div id="hop">Nội dung <b>đậm</b> đây</div>
```

```javascript
var tieuDe = document.getElementById("tieu-de");
var hop = document.getElementById("hop");

// === textContent: Lấy/thay đổi văn bản thuần (AN TOÀN) ===
tieuDe.textContent = "Nội dung mới";
console.log(tieuDe.textContent); // "Nội dung mới"

// === innerHTML: Lấy/thay đổi HTML bên trong (CẨN THẬN!) ===
hop.innerHTML = "Nội dung <em>nghiêng</em> mới";
// --> <div id="hop">Nội dung <em>nghiêng</em> mới</div>

// === innerText: Giống textContent nhưng "nhìn thấy" CSS (chậm hơn) ===
console.log(hop.innerText); // "Nội dung nghiêng mới" (văn bản nhìn thấy)
```

**innerHTML vs textContent -- Bảo mật XSS:**

```javascript
var duLieuNguoiDung = '<img src="x" onerror="alert(\'Hack!\')">';

// ❌ SAI: innerHTML với dữ liệu người dùng --> XSS ATTACK!
document.getElementById("hop").innerHTML = duLieuNguoiDung;
// --> Trình duyệt chạy code độc hại!

// ✅ ĐÚNG: textContent tự động escape HTML
document.getElementById("hop").textContent = duLieuNguoiDung;
// --> Hiển thị văn bản thuần, không chạy code
// Hiển thị: <img src="x" onerror="alert('Hack!')">
```

| Thuộc tính | Xử lý HTML | Hiệu suất | Bảo mật |
|------------|-----------|-----------|---------|
| `textContent` | Không (văn bản thuần) | Nhanh | An toàn |
| `innerHTML` | Có (parse HTML) | Chậm hơn | Nguy hiểm với dữ liệu người dùng |
| `innerText` | Không (văn bản nhìn thấy) | Chậm nhất (tính CSS) | An toàn |

---

### 3. Thay đổi Style

```html
<div id="hop" class="hop-xanh">Nội dung</div>
```

```javascript
var hop = document.getElementById("hop");

// === Thay đổi trực tiếp qua style (inline style) ===
hop.style.backgroundColor = "yellow"; // Đổi màu nền
hop.style.fontSize = "20px";          // Đổi cỡ chữ
hop.style.border = "2px solid red";   // Thêm viền

// === classList: Quản lý class CSS (CÁCH TỐT HƠN!) ===
hop.classList.add("noi-bat");      // Thêm class
hop.classList.remove("hop-xanh");  // Xóa class
hop.classList.toggle("an");        // Thêm nếu chưa có, xóa nếu đã có
hop.classList.contains("noi-bat"); // Kiểm tra --> true
```

```javascript
// ❌ SAI: Dùng style trực tiếp cho nhiều thuộc tính
hop.style.backgroundColor = "blue";
hop.style.color = "white";
hop.style.padding = "10px";
hop.style.borderRadius = "8px";

// ✅ ĐÚNG: Định nghĩa class trong CSS, dùng classList
// Trong CSS: .hop-dep { background: blue; color: white; padding: 10px; border-radius: 8px; }
hop.classList.add("hop-dep"); // Một dòng thay vì bốn dòng
```

---

### 4. Thay đổi Attributes

```html
<img id="hinh" src="cu.jpg" alt="Hình cũ">
<a id="lien-ket" href="https://google.com">Google</a>
<input id="o-nhap" type="text" disabled>
```

```javascript
var hinh = document.getElementById("hinh");
var lienKet = document.getElementById("lien-ket");
var oNhap = document.getElementById("o-nhap");

// === getAttribute: Lấy giá trị thuộc tính ===
console.log(hinh.getAttribute("src")); // "cu.jpg"
console.log(lienKet.getAttribute("href")); // "https://google.com"

// === setAttribute: Thay đổi thuộc tính ===
hinh.setAttribute("src", "moi.jpg");
hinh.setAttribute("alt", "Hình mới đẹp");

// === removeAttribute: Xóa thuộc tính ===
oNhap.removeAttribute("disabled"); // Cho phép nhập lại

// === Truy cập trực tiếp (chỉ với thuộc tính chuẩn) ===
console.log(hinh.src);    // URL đầy đủ: "https://example.com/moi.jpg"
hinh.alt = "Hình khác";
lienKet.href = "https://github.com";
```

---

### 5. Tạo và xóa phần tử

Đây là phần **mạnh mẽ nhất** -- bạn có thể **tạo toàn bộ giao diện** bằng JavaScript.

```html
<ul id="danh-sach">
  <li>Học HTML</li>
  <li>Học CSS</li>
</ul>
<button id="nut-them">Thêm môn học</button>
<button id="nut-xoa">Xóa môn cuối</button>
```

```javascript
var danhSach = document.getElementById("danh-sach");

// === createElement + appendChild: Tạo và thêm phần tử MỚI ===
var monMoi = document.createElement("li");  // Tạo thẻ <li> mới (chưa nằm trong DOM)
monMoi.textContent = "Học JavaScript";      // Đặt nội dung
monMoi.classList.add("mon-moi");            // Thêm class
danhSach.appendChild(monMoi);               // Thêm vào cuối danh sách

// Kết quả:
// <ul id="danh-sach">
//   <li>Học HTML</li>
//   <li>Học CSS</li>
//   <li class="mon-moi">Học JavaScript</li>  <-- Mới thêm
// </ul>

// === insertBefore: Chèn trước một phần tử ===
var monDau = document.createElement("li");
monDau.textContent = "Học Lập trình cơ bản";
var monDauTien = danhSach.firstElementChild; // <li>Học HTML</li>
danhSach.insertBefore(monDau, monDauTien);  // Chèn trước "Học HTML"

// === removeChild: Xóa phần tử con ===
var monCuoi = danhSach.lastElementChild;
danhSach.removeChild(monCuoi); // Xóa phần tử cuối cùng

// === remove(): Phần tử tự xóa chính nó ===
var monCanXoa = document.querySelector(".mon-moi");
if (monCanXoa) {
  monCanXoa.remove(); // Tự xóa, không cần gọi removeChild của cha
}
```

**Ví dụ hoàn chỉnh -- Thêm môn học bằng nút bấm:**

```html
<!DOCTYPE html>
<html>
<body>
  <ul id="danh-sach">
    <li>Học HTML</li>
    <li>Học CSS</li>
  </ul>
  <input id="o-nhap" type="text" placeholder="Nhập môn học...">
  <button id="nut-them">Thêm</button>

  <script>
    var danhSach = document.getElementById("danh-sach");
    var oNhap = document.getElementById("o-nhap");
    var nutThem = document.getElementById("nut-them");

    nutThem.addEventListener("click", function() {
      var giaTri = oNhap.value.trim(); // Lấy nội dung và xóa khoảng trắng

      if (giaTri === "") {
        alert("Vui lòng nhập tên môn học!");
        return; // Dừng lại nếu ô nhập rỗng
      }

      // Tạo phần tử mới
      var monMoi = document.createElement("li");
      monMoi.textContent = giaTri;

      // Thêm vào danh sách
      danhSach.appendChild(monMoi);

      // Xóa nội dung ô nhập
      oNhap.value = "";
      oNhap.focus(); // Đặt con trỏ lại ô nhập
    });
  </script>
</body>
</html>
```

---

## Khi nào dùng?

| Thao tác | Tình huống thực tế |
|----------|--------------------|
| **Tìm phần tử** | Lấy giá trị form, kiểm tra phần tử tồn tại |
| **Thay đổi nội dung** | Cập nhật số lượng giỏ hàng, hiển thị kết quả tìm kiếm |
| **Thay đổi style** | Highlight dòng được chọn, ẩn/hiện menu |
| **Thay đổi attribute** | Đổi hình ảnh, vô hiệu hóa nút bấm |
| **Tạo phần tử** | Thêm bình luận, thêm sản phẩm vào giỏ hàng |
| **Xóa phần tử** | Xóa item khỏi danh sách, đóng thông báo |

---

## Lỗi thường gặp

### Lỗi 1: Dùng innerHTML với dữ liệu người dùng

```javascript
// ❌ SAI: Lỗ hổng bảo mật XSS
var tenNguoiDung = '<script>alert("Hack!")<\/script>';
document.getElementById("ten").innerHTML = tenNguoiDung;

// ✅ ĐÚNG: Dùng textContent cho dữ liệu người dùng
document.getElementById("ten").textContent = tenNguoiDung;
```

### Lỗi 2: Quên kiểm tra null

```javascript
// ❌ SAI: Lỗi nếu phần tử không tồn tại
document.getElementById("abc").style.color = "red";
// TypeError: Cannot read properties of null

// ✅ ĐÚNG: Kiểm tra trước
var phanTu = document.getElementById("abc");
if (phanTu) {
  phanTu.style.color = "red";
}
```

### Lỗi 3: Nhầm lẫn style JavaScript và CSS

```javascript
// ❌ SAI: Dùng tên CSS trong JavaScript
hop.style.background-color = "red";  // Lỗi cú pháp! (dấu trừ)
hop.style.font-size = "20px";        // Lỗi cú pháp!

// ✅ ĐÚNG: Dùng camelCase trong JavaScript
hop.style.backgroundColor = "red";   // background-color --> backgroundColor
hop.style.fontSize = "20px";         // font-size --> fontSize
```

### Lỗi 4: Lặp qua HTMLCollection như array

```javascript
var cacPhanTu = document.getElementsByClassName("item");

// ❌ SAI: HTMLCollection không có forEach
cacPhanTu.forEach(function(el) { /* ... */ });
// TypeError: cacPhanTu.forEach is not a function

// ✅ ĐÚNG: Chuyển sang Array trước
Array.from(cacPhanTu).forEach(function(el) {
  el.style.color = "blue";
});

// Hoặc dùng querySelectorAll (trả về NodeList có forEach)
document.querySelectorAll(".item").forEach(function(el) {
  el.style.color = "blue";
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: querySelector và getElementById khác nhau thế nào?

**Đáp án:**

| Đặc điểm | `getElementById` | `querySelector` |
|----------|-------------------|-----------------|
| **Tham số** | Chỉ nhận ID | Bất kỳ CSS selector nào |
| **Trả về** | 1 phần tử hoặc `null` | 1 phần tử đầu tiên hoặc `null` |
| **Hiệu suất** | Nhanh hơn (tối ưu hóa) | Chậm hơn một chút (parse selector) |
| **Linh hoạt** | Chỉ tìm bằng ID | Tìm bằng class, attribute, pseudo... |

```javascript
// getElementById -- chỉ tìm bằng ID
document.getElementById("main");

// querySelector -- CSS selector bất kỳ
document.querySelector("#main");          // Bằng ID
document.querySelector(".btn.primary");   // Nhiều class
document.querySelector("div > p:first-child"); // Selector phức tạp
```

**Kết luận:** Dùng `getElementById` khi biết ID. Dùng `querySelector` cho các trường hợp phức tạp.

---

### Câu 2: innerHTML và textContent khác nhau thế nào?

**Đáp án:**

```javascript
// HTML: <div id="hop">Xin <b>chào</b> bạn</div>
var hop = document.getElementById("hop");

console.log(hop.innerHTML);    // "Xin <b>chào</b> bạn" -- giữ HTML tags
console.log(hop.textContent);  // "Xin chào bạn" -- chỉ văn bản thuần
```

Điểm quan trọng nhất: `innerHTML` có thể gây **lỗ hổng bảo mật XSS** khi dùng với dữ liệu người dùng. Luôn dùng `textContent` cho dữ liệu không tin cậy.

---

### Câu 3: Làm thế nào để tạo một element mới và thêm vào DOM?

**Đáp án:**

```javascript
// Bước 1: Tạo element
var div = document.createElement("div");

// Bước 2: Thêm nội dung và thuộc tính
div.textContent = "Phần tử mới";
div.classList.add("thong-bao");
div.setAttribute("data-id", "123");

// Bước 3: Thêm vào DOM
document.body.appendChild(div);          // Thêm vào cuối body
// hoặc
var cha = document.getElementById("container");
cha.insertBefore(div, cha.firstChild);   // Thêm vào đầu container
```

---

### Câu 4: NodeList và HTMLCollection khác nhau thế nào?

**Đáp án:**

| Đặc điểm | NodeList | HTMLCollection |
|----------|----------|----------------|
| **Trả về bởi** | `querySelectorAll` | `getElementsByClassName`, `getElementsByTagName` |
| **Live/Static** | Static (không tự cập nhật) | Live (tự cập nhật khi DOM thay đổi) |
| **forEach** | Có | Không (cần chuyển sang Array) |

```javascript
// HTMLCollection (live) -- tự cập nhật
var items = document.getElementsByClassName("item");
console.log(items.length); // 3

document.querySelector(".item").remove(); // Xóa 1 item
console.log(items.length); // 2 -- tự động giảm!

// NodeList (static) -- không thay đổi
var items2 = document.querySelectorAll(".item");
console.log(items2.length); // 2 (tại thời điểm gọi)
// Kể cả thêm/xóa phần tử, items2 vẫn giữ nguyên
```

---

### Câu 5: Tại sao thao tác DOM nhiều lại làm trang web chậm?

**Đáp án:**

Mỗi lần thay đổi DOM, trình duyệt phải thực hiện:

1. **Recalculate Style** -- Tính lại CSS
2. **Reflow (Layout)** -- Tính lại vị trí, kích thước phần tử
3. **Repaint** -- Vẽ lại pixel trên màn hình

```javascript
// ❌ SAI: 100 lần reflow + repaint
for (var i = 0; i < 100; i++) {
  var li = document.createElement("li");
  li.textContent = "Item " + i;
  danhSach.appendChild(li); // Mỗi lần thêm --> reflow + repaint
}

// ✅ ĐÚNG: Dùng DocumentFragment -- chỉ 1 lần reflow + repaint
var fragment = document.createDocumentFragment();
for (var i = 0; i < 100; i++) {
  var li = document.createElement("li");
  li.textContent = "Item " + i;
  fragment.appendChild(li); // Thêm vào fragment (chưa nằm trong DOM)
}
danhSach.appendChild(fragment); // 1 lần duy nhất --> 1 lần reflow + repaint
```

Đây là lý do React dùng **Virtual DOM** -- gộp nhiều thay đổi thành 1 lần cập nhật DOM thật.
