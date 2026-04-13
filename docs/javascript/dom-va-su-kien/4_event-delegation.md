---
sidebar_position: 4
title: "4. Event Delegation"
---

# Event Delegation

## Event Delegation là gì?

**Event Delegation** là kỹ thuật **gắn 1 event listener lên phần tử CHA**, thay vì gắn listener cho **từng phần tử con** riêng lẻ. Khi sự kiện xảy ra trên phần tử con, nó sẽ **nổi bọt (bubble)** lên cha, và cha sẽ xử lý sự kiện đó.

**Ví dụ thực tế:** Hãy tưởng tượng một tòa nhà chung cư có 100 phòng. Thay vì **gắn chuông cửa cho từng phòng** (100 chuông), bạn **gắn 1 chuông ở sảnh chính**. Khi ai đó bấm chuông, bảo vệ ở sảnh sẽ kiểm tra: "Khách đến phòng nào?" và xử lý tương ứng. Tiết kiệm 99 cái chuông!

```
❌ Không dùng Delegation:  100 phần tử = 100 listener (tốn bộ nhớ)
✅ Dùng Delegation:        100 phần tử = 1 listener (tiết kiệm!)
```

---

## Tại sao Event Delegation ra đời?

### Vấn đề 1: Hiệu suất với nhiều phần tử

```javascript
// ❌ Vấn đề: Danh sách 1000 sản phẩm, mỗi sản phẩm có nút "Mua"
var cacNut = document.querySelectorAll(".nut-mua");
cacNut.forEach(function(nut) {
  nut.addEventListener("click", function() {
    muaSanPham(this);
  });
});
// --> 1000 listener trong bộ nhớ! Trang web CHẬM
```

### Vấn đề 2: Phần tử động (dynamic elements)

```javascript
// ❌ Vấn đề: Thêm sản phẩm mới sau khi trang tải xong
var nutMoi = document.createElement("button");
nutMoi.className = "nut-mua";
nutMoi.textContent = "Mua";
danhSach.appendChild(nutMoi);

// Nút mới KHÔNG có event listener! Vì addEventListener đã chạy trước đó
nutMoi.addEventListener("click", function() { /* ... */ }); // Phải gắn THÊM
```

### Giải pháp: Event Delegation

Dựa trên **event bubbling** -- sự kiện từ phần tử con **nổi bọt lên cha**. Chỉ cần lắng nghe ở cha là bắt được sự kiện của tất cả con.

```javascript
// ✅ Giải pháp: 1 listener trên cha, xử lý tất cả con
danhSach.addEventListener("click", function(e) {
  if (e.target.classList.contains("nut-mua")) {
    muaSanPham(e.target);
  }
});
// --> 1 listener cho 1000 (hoặc 10000) sản phẩm!
// --> Phần tử mới thêm vào cũng hoạt động tự động!
```

---

## Event Bubbling -- Nền tảng của Delegation

Event Delegation hoạt động được nhờ **event bubbling** (sự kiện nổi bọt). Khi click một phần tử, sự kiện sẽ **truyền từ phần tử đó lên từng cấp cha** cho đến `document`.

```html
<div id="ong">
  <div id="cha">
    <button id="con">Click tôi</button>
  </div>
</div>
```

```javascript
// Sự kiện nổi bọt: con --> cha --> ông --> body --> html --> document --> window
document.getElementById("con").addEventListener("click", function() {
  console.log("1. Con");
});
document.getElementById("cha").addEventListener("click", function() {
  console.log("2. Cha"); // Nhận sự kiện từ con nổi bọt lên!
});
document.getElementById("ong").addEventListener("click", function() {
  console.log("3. Ông"); // Nhận sự kiện tiếp tục nổi bọt!
});

// Khi click "con":
// "1. Con"
// "2. Cha"
// "3. Ông"
```

---

## Cách sử dụng

### Ví dụ 1: Todo List

```html
<div id="ung-dung">
  <h2>Danh sách việc cần làm</h2>
  <input id="o-nhap" type="text" placeholder="Nhập việc...">
  <button id="nut-them">Thêm</button>
  <ul id="danh-sach">
    <li>
      Học HTML
      <button class="nut-xoa">Xóa</button>
    </li>
    <li>
      Học CSS
      <button class="nut-xoa">Xóa</button>
    </li>
  </ul>
</div>
```

```javascript
var danhSach = document.getElementById("danh-sach");
var oNhap = document.getElementById("o-nhap");
var nutThem = document.getElementById("nut-them");

// ✅ EVENT DELEGATION: Gắn listener lên <ul> cha
// Bắt sự kiện click của TẤT CẢ nút "Xóa" (kể cả nút thêm vào sau)
danhSach.addEventListener("click", function(e) {
  // Kiểm tra: phần tử được click có phải nút xóa không?
  if (e.target.classList.contains("nut-xoa")) {
    // Tìm phần tử <li> cha gần nhất và xóa nó
    var li = e.target.closest("li"); // closest() tìm cha gần nhất khớp selector
    if (li) {
      li.remove();
    }
  }
});

// Thêm việc mới
nutThem.addEventListener("click", function() {
  var giaTri = oNhap.value.trim();
  if (giaTri === "") return;

  var li = document.createElement("li");
  li.innerHTML = giaTri + ' <button class="nut-xoa">Xóa</button>';
  danhSach.appendChild(li);

  oNhap.value = "";
  oNhap.focus();

  // Nút "Xóa" trong <li> mới TỰ ĐỘNG hoạt động!
  // Vì đã có listener trên <ul> cha rồi (event delegation)
});
```

### Ví dụ 2: Bảng dữ liệu (Table)

```html
<table id="bang-nhan-vien">
  <thead>
    <tr>
      <th>Tên</th>
      <th>Phòng ban</th>
      <th>Hành động</th>
    </tr>
  </thead>
  <tbody id="than-bang">
    <tr data-id="1">
      <td>Nguyễn Văn A</td>
      <td>IT</td>
      <td>
        <button class="nut-sua">Sửa</button>
        <button class="nut-xoa">Xóa</button>
      </td>
    </tr>
    <tr data-id="2">
      <td>Trần Thị B</td>
      <td>HR</td>
      <td>
        <button class="nut-sua">Sửa</button>
        <button class="nut-xoa">Xóa</button>
      </td>
    </tr>
  </tbody>
</table>
```

```javascript
var thanBang = document.getElementById("than-bang");

// ✅ 1 listener cho TẤT CẢ nút trong bảng
thanBang.addEventListener("click", function(e) {
  // Tìm dòng (tr) chứa nút được click
  var dong = e.target.closest("tr");
  if (!dong) return; // Click vào vùng trống, bỏ qua

  var id = dong.getAttribute("data-id"); // Lấy ID nhân viên

  // Xử lý theo loại nút
  if (e.target.classList.contains("nut-xoa")) {
    if (confirm("Bạn có chắc muốn xóa?")) {
      dong.remove();
      console.log("Đã xóa nhân viên ID:", id);
    }
  }

  if (e.target.classList.contains("nut-sua")) {
    console.log("Sửa nhân viên ID:", id);
    // Mở form chỉnh sửa...
  }
});
```

### Ví dụ 3: Menu điều hướng (Navigation)

```html
<nav id="menu">
  <ul>
    <li><a href="#trang-chu" data-page="home">Trang chủ</a></li>
    <li><a href="#gioi-thieu" data-page="about">Giới thiệu</a></li>
    <li><a href="#lien-he" data-page="contact">Liên hệ</a></li>
  </ul>
</nav>
<div id="noi-dung">Trang chủ</div>
```

```javascript
var menu = document.getElementById("menu");
var noiDung = document.getElementById("noi-dung");

// ✅ 1 listener cho tất cả link trong menu
menu.addEventListener("click", function(e) {
  // Tìm thẻ <a> gần nhất (phòng trường hợp click vào thẻ con bên trong <a>)
  var link = e.target.closest("a");
  if (!link) return;

  e.preventDefault(); // Ngăn chuyển trang

  // Xóa class active cũ
  var linkCu = menu.querySelector(".active");
  if (linkCu) {
    linkCu.classList.remove("active");
  }

  // Thêm class active cho link mới
  link.classList.add("active");

  // Cập nhật nội dung
  var trang = link.getAttribute("data-page");
  noiDung.textContent = "Bạn đang xem: " + trang;
});
```

---

## So sánh: Gắn listener từng element vs Delegation

```html
<ul id="danh-sach">
  <li class="item">Môn 1</li>
  <li class="item">Môn 2</li>
  <li class="item">Môn 3</li>
  <!-- Có thể có 100+ item -->
</ul>
```

### Cách 1: Gắn listener từng element (KHÔNG KHUYÊN DÙNG)

```javascript
// ❌ KHÔNG NÊN: N phần tử = N listener
var cacItem = document.querySelectorAll(".item");
cacItem.forEach(function(item) {
  item.addEventListener("click", function() {
    console.log("Click:", this.textContent);
  });
});

// Vấn đề:
// 1. 100 item = 100 listener -> tốn bộ nhớ
// 2. Item thêm mới không có listener -> phải gắn thêm
// 3. Khó quản lý khi số lượng item thay đổi
```

### Cách 2: Event Delegation (KHUYÊN DÙNG)

```javascript
// ✅ NÊN DÙNG: 1 listener cho tất cả
var danhSach = document.getElementById("danh-sach");
danhSach.addEventListener("click", function(e) {
  // Kiểm tra click vào item hay vùng trống
  var item = e.target.closest(".item");
  if (!item) return; // Click vùng trống, bỏ qua

  console.log("Click:", item.textContent);
});

// Ưu điểm:
// 1. 100 hoặc 10000 item = chỉ 1 listener
// 2. Item thêm mới TỰ ĐỘNG hoạt động
// 3. Dễ quản lý và bảo trì
```

**Bảng so sánh:**

| Tiêu chí | Gắn từng element | Event Delegation |
|----------|------------------|-----------------|
| **Số listener** | N listener (N phần tử) | 1 listener |
| **Bộ nhớ** | Tốn nhiều | Tiết kiệm |
| **Phần tử động** | Không tự hoạt động | Tự động hoạt động |
| **Code** | Nhiều code | Ít code |
| **Khi nào dùng** | 1-2 phần tử cố định | Danh sách, bảng, menu |

---

## Khi nào dùng?

| Tình huống | Ví dụ |
|------------|-------|
| **Danh sách động** | Todo list, danh sách sản phẩm, bình luận |
| **Bảng dữ liệu** | Bảng nhân viên, bảng đơn hàng |
| **Menu/Tab** | Navbar, sidebar, tab navigation |
| **Form nhiều input** | Form động thêm/xóa trường |
| **Game** | Bàn cờ, puzzle, grid game |

**Khi nào KHÔNG cần delegation:**

- Phần tử đơn lẻ (1 nút bấm duy nhất, không cần delegation)
- Phần tử không bao giờ thay đổi
- Cần xử lý sự kiện không bubble (vd: `focus`, `blur` -- dùng `focusin`, `focusout` thay thế)

---

## Lỗi thường gặp

### Lỗi 1: Không kiểm tra e.target đúng cách

```javascript
// ❌ SAI: Click vào text bên trong <li> thì e.target là text node, không phải <li>
danhSach.addEventListener("click", function(e) {
  if (e.target.tagName === "LI") { // Có thể không bắt được!
    console.log(e.target.textContent);
  }
});

// <li><strong>Quan trọng</strong> nội dung</li>
// Click vào "Quan trọng" --> e.target là <strong>, KHÔNG PHẢI <li>!

// ✅ ĐÚNG: Dùng closest() để tìm phần tử cha gần nhất
danhSach.addEventListener("click", function(e) {
  var item = e.target.closest("li");
  if (item) {
    console.log(item.textContent);
  }
});
```

### Lỗi 2: Delegation với sự kiện không bubble

```javascript
// ❌ SAI: focus và blur KHÔNG bubble
form.addEventListener("focus", function(e) {
  e.target.style.border = "2px solid blue"; // KHÔNG hoạt động!
});

// ✅ ĐÚNG: Dùng focusin/focusout (có bubble) hoặc capture phase
form.addEventListener("focusin", function(e) {
  e.target.style.border = "2px solid blue"; // OK!
});

form.addEventListener("focusout", function(e) {
  e.target.style.border = ""; // Xóa border khi mất focus
});
```

### Lỗi 3: stopPropagation phá hỏng delegation

```javascript
// ❌ SAI: stopPropagation ngăn sự kiện nổi bọt --> delegation KHÔNG hoạt động
document.querySelector(".item").addEventListener("click", function(e) {
  e.stopPropagation(); // Sự kiện KHÔNG nổi bọt lên <ul> cha!
});

// Listener trên <ul> sẽ KHÔNG nhận được sự kiện
danhSach.addEventListener("click", function(e) {
  // KHÔNG BAO GIỜ chạy khi click .item có stopPropagation
});

// ✅ ĐÚNG: Tránh stopPropagation khi dùng delegation
// Nếu cần ngăn xử lý, dùng cờ (flag) hoặc kiểm tra điều kiện thay vì stopPropagation
```

### Lỗi 4: Quên giới hạn phạm vi delegation

```javascript
// ❌ SAI: Gắn listener trên document cho mọi thứ
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("nut-xoa")) {
    // Xóa item... nhưng bắt MỌI nút có class "nut-xoa" trên TOÀN BỘ trang!
  }
});

// ✅ ĐÚNG: Gắn listener trên phần tử cha GẦN NHẤT
var danhSach = document.getElementById("danh-sach-cu-the");
danhSach.addEventListener("click", function(e) {
  if (e.target.classList.contains("nut-xoa")) {
    // Chỉ bắt nút trong danh sách này
  }
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: Event Delegation là gì? Tại sao nên dùng?

**Đáp án:**

Event Delegation là kỹ thuật gắn **1 event listener trên phần tử cha** để xử lý sự kiện của **tất cả phần tử con**. Dựa trên cơ chế **event bubbling** -- sự kiện từ con nổi bọt lên cha.

**Tại sao dùng:**

1. **Hiệu suất** -- 1 listener thay vì hàng trăm/nghìn listener
2. **Phần tử động** -- phần tử thêm mới tự động hoạt động, không cần gắn thêm listener
3. **Ít code** -- dễ bảo trì và quản lý

```javascript
// 1 listener xử lý tất cả nút trong danh sách
document.getElementById("danh-sach").addEventListener("click", function(e) {
  var nut = e.target.closest("button");
  if (!nut) return;

  if (nut.classList.contains("xoa")) {
    nut.closest("li").remove();
  }
  if (nut.classList.contains("sua")) {
    // Xử lý sửa...
  }
});
```

---

### Câu 2: Event bubbling và event capturing khác nhau thế nào?

**Đáp án:**

| | Bubbling | Capturing |
|-|----------|-----------|
| **Hướng** | Từ trong ra ngoài (con --> cha) | Từ ngoài vào trong (cha --> con) |
| **Mặc định** | Có (addEventListener mặc định) | Không (phải thêm `true`) |
| **Thứ tự** | Capturing chạy TRƯỚC, bubbling chạy SAU |

```javascript
// Capturing: cha bắt sự kiện TRƯỚC con
cha.addEventListener("click", function() {
  console.log("1. Cha (capturing)");
}, true); // true = capturing

// Bubbling: cha bắt sự kiện SAU con
cha.addEventListener("click", function() {
  console.log("3. Cha (bubbling)");
}); // mặc định = bubbling

con.addEventListener("click", function() {
  console.log("2. Con (target)");
});

// Click con --> "1. Cha (capturing)" --> "2. Con" --> "3. Cha (bubbling)"
```

**Event Delegation** sử dụng **bubbling** (mặc định). Hiểu bubbling là nền tảng để hiểu delegation.

---

### Câu 3: Cho ví dụ thực tế sử dụng Event Delegation.

**Đáp án:**

**Bài toán:** Giỏ hàng mua sắm -- người dùng có thể thêm, xóa, thay đổi số lượng sản phẩm. Danh sách sản phẩm là **động** (thay đổi liên tục).

```html
<div id="gio-hang">
  <div class="san-pham" data-id="1">
    <span>Áo thun - 200.000đ</span>
    <button class="tang">+</button>
    <span class="so-luong">1</span>
    <button class="giam">-</button>
    <button class="xoa">Xóa</button>
  </div>
  <!-- Nhiều sản phẩm khác được thêm động -->
</div>
```

```javascript
var gioHang = document.getElementById("gio-hang");

gioHang.addEventListener("click", function(e) {
  var sanPham = e.target.closest(".san-pham");
  if (!sanPham) return;

  var id = sanPham.getAttribute("data-id");
  var soLuong = sanPham.querySelector(".so-luong");
  var hienTai = parseInt(soLuong.textContent);

  if (e.target.classList.contains("tang")) {
    soLuong.textContent = hienTai + 1;
  }

  if (e.target.classList.contains("giam")) {
    if (hienTai > 1) {
      soLuong.textContent = hienTai - 1;
    }
  }

  if (e.target.classList.contains("xoa")) {
    sanPham.remove();
  }
});

// Sản phẩm mới thêm vào giỏ hàng TỰ ĐỘNG hoạt động
// Không cần gắn thêm bất kỳ listener nào!
```

---

### Câu 4: closest() là gì và tại sao nó quan trọng trong delegation?

**Đáp án:**

`closest(selector)` tìm phần tử **cha gần nhất** (kể cả chính nó) khớp với CSS selector. Trả về `null` nếu không tìm thấy.

```javascript
// HTML: <ul><li><strong>Nội dung</strong></li></ul>

// Khi click vào <strong>:
// e.target = <strong> (KHÔNG PHẢI <li>!)

// ❌ Không có closest: phải kiểm tra nhiều cấp
if (e.target.tagName === "LI") { /* ... */ }
else if (e.target.parentElement.tagName === "LI") { /* ... */ }
else if (e.target.parentElement.parentElement.tagName === "LI") { /* ... */ }
// Rất dài và dễ sai!

// ✅ Có closest: gọn gàng và chính xác
var item = e.target.closest("li");
if (item) {
  // Tìm thấy <li> cha gần nhất, bất kể click vào đâu bên trong
}
```

`closest()` **quan trọng** vì khi dùng delegation, `e.target` có thể là **bất kỳ phần tử con nào** bên trong -- không nhất thiết là phần tử bạn muốn. `closest()` giúp tìm đúng phần tử cần xử lý.

---

### Câu 5: Khi nào KHÔNG nên dùng Event Delegation?

**Đáp án:**

1. **Phần tử đơn lẻ** -- 1 nút bấm duy nhất, không cần delegation

```javascript
// Không cần delegation cho 1 nút
document.getElementById("nut-gui").addEventListener("click", function() {
  guiForm();
});
```

2. **Sự kiện không bubble** -- `focus`, `blur`, `scroll` (của phần tử con) không nổi bọt

```javascript
// focus không bubble --> delegation KHÔNG hoạt động
// Dùng focusin (có bubble) thay thế
container.addEventListener("focusin", function(e) {
  e.target.classList.add("dang-nhap");
});
```

3. **Cần stopPropagation** -- Nếu logic yêu cầu ngăn bubbling, delegation sẽ bị ảnh hưởng

4. **Hiệu suất selector phức tạp** -- Nếu kiểm tra `closest()` với selector rất phức tạp trên mỗi sự kiện, có thể chậm hơn gắn trực tiếp

**Nguyên tắc:** Dùng delegation khi có **nhiều phần tử cùng loại** hoặc phần tử **động**. Gắn trực tiếp khi chỉ có **1-2 phần tử cố định**.
