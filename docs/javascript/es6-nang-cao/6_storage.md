---
sidebar_position: 6
title: "6. LocalStorage & SessionStorage"
---

# LocalStorage & SessionStorage


---

## Mục lục

- [Web Storage API là gì?](#web-storage-api-là-gì)
- [Tại sao Web Storage ra đời?](#tại-sao-web-storage-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [localStorage vs sessionStorage vs Cookies -- bảng so sánh](#localstorage-vs-sessionstorage-vs-cookies-bảng-so-sánh)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Web Storage API là gì?

**Web Storage API** cho phép trình duyệt lưu trữ dữ liệu **ngay trên máy tính của người dùng** dưới dạng **key-value** (khóa-giá trị). Có 2 loại:

- **localStorage**: dữ liệu tồn tại **vĩnh viễn** (cho đến khi bị xóa thủ công)
- **sessionStorage**: dữ liệu chỉ tồn tại trong **phiên làm việc** (đóng tab là mất)

Hãy tưởng tượng như 2 loại **tủ đồ** trong nhà bạn:
- **localStorage** = **tủ sắt** (tủ có khóa) -- đồ đạc cất vào sẽ ở đó **mãi mãi**, cho đến khi bạn tự tay lấy ra
- **sessionStorage** = **tủ ngăn kéo tạm** -- bạn cất đồ vào, nhưng khi **ra khỏi phòng** (đóng tab), đồ đạc sẽ **biến mất**

```javascript
// Lưu tên người dùng vào localStorage
localStorage.setItem("ten", "Minh");

// Đọc tên từ localStorage
const ten = localStorage.getItem("ten");
console.log(ten); // "Minh" -- vẫn còn dù đóng/mở trình duyệt nhiều lần!
```

---

## Tại sao Web Storage ra đời?

Trước đây, trình duyệt chỉ có **cookies** để lưu dữ liệu phía client. Nhưng cookies có nhiều hạn chế:

| Vấn đề của Cookies | Web Storage giải quyết |
|-------------------|----------------------|
| Dung lượng nhỏ (~4KB) | Dung lượng lớn (~5-10MB) |
| Gửi kèm mọi HTTP request (tốn băng thông) | Chỉ lưu trên client, không gửi đi |
| Cú pháp phức tạp (document.cookie) | Cú pháp đơn giản (setItem/getItem) |
| Cần set hạn sử dụng thủ công | localStorage: vĩnh viễn, sessionStorage: tự động |

Web Storage API được giới thiệu trong **HTML5** để cung cấp cách lưu trữ phía client **đơn giản, dung lượng lớn, và bảo mật hơn cookies**.

---

## Cách sử dụng

### 1. localStorage -- dữ liệu vĩnh viễn

```javascript
// === LƯU DỮ LIỆU ===
localStorage.setItem("tenNguoiDung", "Nguyen Van A");
localStorage.setItem("giaoDien", "dark");
localStorage.setItem("ngonNgu", "vi");

// === ĐỌC DỮ LIỆU ===
const ten = localStorage.getItem("tenNguoiDung");
console.log(ten); // "Nguyen Van A"

// Nếu key không tồn tại -> trả về null
const email = localStorage.getItem("email");
console.log(email); // null

// === KIỂM TRA KEY TỒN TẠI ===
if (localStorage.getItem("giaoDien") !== null) {
  console.log("Da co thiet lap giao dien");
}

// === XÓA MỘT KEY ===
localStorage.removeItem("ngonNgu");

// === XÓA TẤT CẢ ===
localStorage.clear(); // Xóa hết dữ liệu trong localStorage
```

### 2. sessionStorage -- dữ liệu tạm thời

Cú pháp **hoàn toàn giống localStorage**, chỉ khác về **thời gian tồn tại**:

```javascript
// Lưu thông tin phiên làm việc
sessionStorage.setItem("buoc_hien_tai", "3");
sessionStorage.setItem("gio_hang_tam", '[{"id":1,"ten":"Ao"}]');

// Đọc dữ liệu
const buoc = sessionStorage.getItem("buoc_hien_tai");
console.log(buoc); // "3"

// Khi người dùng ĐÓNG TAB -> tất cả dữ liệu mất!
// Mở tab mới -> sessionStorage TRỐNG RỖNG
```

### 3. Lưu Object và Array (QUAN TRỌNG)

Web Storage **chỉ lưu được string**. Để lưu Object/Array, phải dùng `JSON.stringify` và `JSON.parse`:

```javascript
// ❌ SAI: lưu object trực tiếp -> bị chuyển thành "[object Object]"
const user = { ten: "Minh", tuoi: 25 };
localStorage.setItem("user", user);
console.log(localStorage.getItem("user")); // "[object Object]" -- SAI!

// ✅ ĐÚNG: chuyển sang JSON string trước khi lưu
const userDung = { ten: "Minh", tuoi: 25 };
localStorage.setItem("user", JSON.stringify(userDung));

// Đọc ra: chuyển JSON string thành object
const userDocRa = JSON.parse(localStorage.getItem("user"));
console.log(userDocRa.ten); // "Minh"
console.log(userDocRa.tuoi); // 25
```

```javascript
// Lưu và đọc Array
const gioHang = [
  { id: 1, ten: "Laptop", gia: 15000000 },
  { id: 2, ten: "Chuot", gia: 500000 },
];

// Lưu
localStorage.setItem("gioHang", JSON.stringify(gioHang));

// Đọc
const gioHangDocRa = JSON.parse(localStorage.getItem("gioHang"));
console.log(gioHangDocRa.length); // 2
console.log(gioHangDocRa[0].ten); // "Laptop"
```

### 4. Hàm tiện ích an toàn

```javascript
// Hàm lưu dữ liệu an toàn (tự động JSON.stringify)
function luuDuLieu(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Xử lý khi hết dung lượng hoặc bị chặn (private mode)
    console.error("Khong luu duoc:", error.message);
    return false;
  }
}

// Hàm đọc dữ liệu an toàn (tự động JSON.parse)
function docDuLieu(key, giaTriMacDinh = null) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : giaTriMacDinh;
  } catch (error) {
    console.error("Khong doc duoc:", error.message);
    return giaTriMacDinh;
  }
}

// Sử dụng
luuDuLieu("caiDat", { theme: "dark", fontSize: 16 });
const caiDat = docDuLieu("caiDat", { theme: "light", fontSize: 14 });
console.log(caiDat.theme); // "dark"
```

### 5. Duyệt tất cả dữ liệu trong Storage

```javascript
// Duyệt tất cả key trong localStorage
console.log(`Tong so key: ${localStorage.length}`);

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}
```

---

## localStorage vs sessionStorage vs Cookies -- bảng so sánh

| Tiêu chí | localStorage | sessionStorage | Cookies |
|----------|-------------|----------------|---------|
| Dung lượng | ~5-10 MB | ~5-10 MB | ~4 KB |
| Thời gian tồn tại | Vĩnh viễn | Đóng tab là mất | Tùy hạn sử dụng |
| Gửi kèm HTTP request | **Không** | **Không** | **Có** (mọi request) |
| Truy cập từ server | Không | Không | **Có** |
| Cú pháp | Đơn giản | Đơn giản | Phức tạp |
| Chia sẻ giữa tab | **Có** (cùng domain) | **Không** | **Có** |
| Khi nào dùng | Cài đặt, theme, token | Dữ liệu tạm (form, wizard) | Authentication, tracking |

---

## Khi nào dùng?

| Trường hợp | Nên dùng | Ví dụ |
|------------|---------|-------|
| Lưu cài đặt giao diện | localStorage | Dark mode, ngôn ngữ, font size |
| Lưu giỏ hàng | localStorage | Giỏ hàng e-commerce |
| Lưu tiến độ form nhiều bước | sessionStorage | Form đăng ký nhiều trang |
| Lưu dữ liệu tạm để so sánh | sessionStorage | So sánh sản phẩm |
| Token xác thực | localStorage (hoặc cookies) | JWT token |
| Theo dõi người dùng | Cookies | Analytics, session ID |

---

## Lỗi thường gặp

### Lỗi 1: Quên JSON.stringify khi lưu Object

```javascript
const config = { theme: "dark", lang: "vi" };

// ❌ SAI: lưu trực tiếp object
localStorage.setItem("config", config);
console.log(localStorage.getItem("config")); // "[object Object]"

// ✅ ĐÚNG: chuyển thành JSON string
localStorage.setItem("config", JSON.stringify(config));
const configDocLai = JSON.parse(localStorage.getItem("config"));
console.log(configDocLai.theme); // "dark"
```

### Lỗi 2: Không kiểm tra null khi đọc dữ liệu

```javascript
// ❌ SAI: không kiểm tra null
const user = JSON.parse(localStorage.getItem("user")); // Nếu key không tồn tại -> JSON.parse(null) -> null
console.log(user.ten); // TypeError: Cannot read properties of null

// ✅ ĐÚNG: kiểm tra trước khi sử dụng
const userData = localStorage.getItem("user");
if (userData) {
  const user = JSON.parse(userData);
  console.log(user.ten);
} else {
  console.log("Chua co du lieu nguoi dung");
}
```

### Lỗi 3: Lưu dữ liệu nhạy cảm

```javascript
// ❌ TUYỆT ĐỐI KHÔNG lưu dữ liệu nhạy cảm trong localStorage
localStorage.setItem("matKhau", "123456");        // NGUY HIỂM!
localStorage.setItem("soTheTinDung", "4111..."); // NGUY HIỂM!
// localStorage có thể đọc bởi bất kỳ script nào trên trang (XSS attack)

// ✅ Dữ liệu nhạy cảm nên xử lý trên server
// Chỉ lưu thông tin không nhạy cảm ở client
localStorage.setItem("giaoDien", "dark"); // OK
localStorage.setItem("ngonNgu", "vi");    // OK
```

### Lỗi 4: Không xử lý khi Storage đầy hoặc bị chặn

```javascript
// ❌ SAI: không xử lý ngoại lệ
localStorage.setItem("data", duLieuRatLon); // Có thể throw QuotaExceededError

// ✅ ĐÚNG: luôn try/catch
try {
  localStorage.setItem("data", JSON.stringify(duLieuLon));
} catch (error) {
  if (error.name === "QuotaExceededError") {
    console.error("Het dung luong! Can xoa bot du lieu cu.");
    localStorage.removeItem("duLieuCu");
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: localStorage và sessionStorage khác nhau như thế nào?

**Đáp án:**

| Tiêu chí | localStorage | sessionStorage |
|----------|-------------|----------------|
| Thời gian tồn tại | Vĩnh viễn | Hết khi đóng tab |
| Chia sẻ giữa tab | Có (cùng domain) | Không (riêng từng tab) |
| Khi nào dùng | Cài đặt lâu dài | Dữ liệu tạm thời |

```javascript
// localStorage: lưu cài đặt -- vẫn còn khi mở lại trình duyệt
localStorage.setItem("theme", "dark");

// sessionStorage: lưu bước form -- mất khi đóng tab
sessionStorage.setItem("currentStep", "2");
```

Mở 2 tab cùng website:
- `localStorage.getItem("theme")` -> cả 2 tab đều thấy "dark"
- `sessionStorage.getItem("currentStep")` -> mỗi tab có giá trị **riêng biệt**

---

### Câu 2: Dung lượng tối đa của Web Storage là bao nhiêu?

**Đáp án:** Khoảng **5-10 MB** mỗi origin (domain + protocol + port), tùy trình duyệt:

| Trình duyệt | localStorage | sessionStorage |
|-------------|-------------|----------------|
| Chrome | ~5 MB | ~5 MB |
| Firefox | ~10 MB | ~10 MB |
| Safari | ~5 MB | ~5 MB |

**Lưu ý:** Dung lượng tính theo **ký tự string**, không phải byte. Unicode có thể chiếm nhiều byte hơn.

```javascript
// Kiểm tra dung lượng đã dùng (ước lượng)
function dungLuongDaDung() {
  let tongKichThuoc = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    tongKichThuoc += key.length + value.length;
  }
  return (tongKichThuoc * 2) / 1024; // Ước tính KB (UTF-16 = 2 bytes/char)
}

console.log(`Da dung: ${dungLuongDaDung().toFixed(2)} KB`);
```

---

### Câu 3: localStorage có bảo mật không?

**Đáp án:** **Không bảo mật cao.** Vì:

1. **Bất kỳ script nào** chạy trên trang đều đọc được (XSS vulnerability)
2. Dữ liệu **không mã hóa** -- mở DevTools là thấy
3. **Không gửi qua HTTPS** -- nhưng có thể bị đọc qua XSS

**Quy tắc:**
- **KHÔNG** lưu: mật khẩu, số thẻ tín dụng, dữ liệu cá nhân nhạy cảm
- **CÓ THỂ** lưu: JWT token (cần các biện pháp chống XSS), cài đặt giao diện, giỏ hàng

```javascript
// ❌ KHÔNG BAO GIỜ
localStorage.setItem("password", "myPass123");
localStorage.setItem("creditCard", "4111-1111-1111-1111");

// ✅ AN TOÀN
localStorage.setItem("theme", "dark");
localStorage.setItem("language", "vi");
localStorage.setItem("cartItems", JSON.stringify([{id: 1, qty: 2}]));
```

---

### Câu 4: Sự kiện "storage" là gì?

**Đáp án:** Khi localStorage thay đổi ở **một tab**, các **tab khác cùng domain** sẽ nhận sự kiện `storage`:

```javascript
// Tab A: thay đổi dữ liệu
localStorage.setItem("thongBao", "Ban co tin nhan moi!");

// Tab B: lắng nghe sự kiện storage
window.addEventListener("storage", (event) => {
  console.log("Key thay doi:", event.key);        // "thongBao"
  console.log("Gia tri cu:", event.oldValue);      // null (nếu mới tạo)
  console.log("Gia tri moi:", event.newValue);     // "Ban co tin nhan moi!"
  console.log("URL nguon:", event.url);            // URL của tab A
});

// Lưu ý: sự kiện NẰM Ở TAB KHÁC, không phải tab thay đổi dữ liệu
// => Dùng để đồng bộ dữ liệu giữa các tab
```

**Ứng dụng:** đồng bộ đăng xuất -- khi user logout ở tab A, các tab khác cũng tự động logout.

---

### Câu 5: Khi nào dùng localStorage, sessionStorage, và cookies?

**Đáp án:**

| Dữ liệu | Nên dùng | Lý do |
|---------|---------|-------|
| Theme, cài đặt giao diện | localStorage | Cần lưu lâu dài, không nhạy cảm |
| Giỏ hàng | localStorage | User mong đợi dữ liệu còn khi quay lại |
| Tiến độ form nhiều bước | sessionStorage | Chỉ cần trong phiên hiện tại |
| Tab đang mở | sessionStorage | Riêng từng tab |
| Session ID (xác thực) | Cookies (httpOnly) | Server cần đọc, bảo mật hơn |
| Token CSRF | Cookies | Tự động gửi kèm request |
| Theo dõi analytics | Cookies | Cần gửi về server |

```javascript
// Cài đặt giao diện -> localStorage
localStorage.setItem("fontSize", "16");

// Bước hiện tại trong wizard -> sessionStorage
sessionStorage.setItem("step", "3");

// Session cookie (xác thực) -> server tự set
// Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```
