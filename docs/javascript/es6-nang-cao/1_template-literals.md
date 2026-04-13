---
sidebar_position: 1
title: "1. Template Literals"
---

# Template Literals

## Template Literals là gì?

Template Literals (hay Template Strings) là cách viết chuỗi (string) mới trong JavaScript, sử dụng dấu **backtick** (`` ` ``) thay vì dấu nháy đơn (`'`) hoặc nháy kép (`"`).

Hãy tưởng tượng bạn đang viết một **bức thư mẫu**. Trong thư có những chỗ trống để điền tên, ngày tháng. Template Literals giống như bức thư mẫu đó -- bạn có **khung sẵn** và chỉ cần **điền thông tin vào chỗ trống** bằng cú pháp `${}`.

```javascript
// Cách cũ: nối chuỗi bằng dấu +
const ten = "Minh";
const tuoi = 25;
const loiChao = "Xin chao, toi la " + ten + ", nam nay " + tuoi + " tuoi.";

// Cách mới: Template Literal
const loiChaoMoi = `Xin chao, toi la ${ten}, nam nay ${tuoi} tuoi.`;

console.log(loiChaoMoi); // "Xin chao, toi la Minh, nam nay 25 tuoi."
```

**Điểm khác biệt chính:**
- Dùng dấu **backtick** `` ` `` (phím bên trái số 1 trên bàn phím)
- Chèn biến/biểu thức vào chuỗi bằng `${...}` (gọi là **string interpolation**)
- Hỗ trợ **xuống dòng** trực tiếp (multi-line strings)

---

## Tại sao Template Literals ra đời?

Trước ES6 (2015), để nối chuỗi trong JavaScript phải dùng dấu `+`, rất **khó đọc** và **dễ sai**:

```javascript
// Trước ES6 -- nối chuỗi phức tạp, khó đọc
var hoTen = "Nguyen Van A";
var diemThi = 8.5;
var monHoc = "Toan";

var ketQua = "Hoc sinh " + hoTen + " dat " + diemThi + " diem mon " + monHoc + ".";
// Rất dễ thiếu dấu cách, thiếu dấu chấm, nhầm lẫn dấu nháy
```

**Vấn đề của cách cũ:**

| Vấn đề | Mô tả |
|--------|-------|
| Khó đọc | Nhiều dấu `+` và dấu nháy lẫn lộn |
| Dễ sai | Quên dấu cách, thừa/thiếu dấu nháy |
| Không xuống dòng | Phải dùng `\n` để xuống dòng |
| Không tính toán | Phải tính trước rồi mới nối chuỗi |

ES6 giới thiệu Template Literals để giải quyết tất cả vấn đề này.

---

## Cách sử dụng

### 1. String Interpolation (chèn biến vào chuỗi)

```javascript
const sanPham = "Laptop";
const gia = 15000000;

// ❌ Cách cũ: khó đọc
const thongBaoCu = "San pham: " + sanPham + ", gia: " + gia + " VND";

// ✅ Cách mới: dễ đọc, dễ hiểu
const thongBaoMoi = `San pham: ${sanPham}, gia: ${gia} VND`;

console.log(thongBaoMoi); // "San pham: Laptop, gia: 15000000 VND"
```

### 2. Multi-line Strings (chuỗi nhiều dòng)

```javascript
// ❌ Cách cũ: phải dùng \n để xuống dòng
const thuCu = "Kinh gui Anh/Chi,\n" +
              "Toi xin gui don xin nghi phep.\n" +
              "Tran trong cam on.";

// ✅ Cách mới: xuống dòng tự nhiên
const thuMoi = `Kinh gui Anh/Chi,
Toi xin gui don xin nghi phep.
Tran trong cam on.`;

console.log(thuMoi);
// Kinh gui Anh/Chi,
// Toi xin gui don xin nghi phep.
// Tran trong cam on.
```

### 3. Expression trong $\{}

Bạn có thể đặt **bất kỳ biểu thức JavaScript nào** bên trong `${}`:

```javascript
const a = 10;
const b = 20;

// Phép tính
console.log(`Tong cua ${a} va ${b} la ${a + b}`);
// "Tong cua 10 va 20 la 30"

// Gọi hàm
const ten = "minh";
console.log(`Xin chao ${ten.toUpperCase()}!`);
// "Xin chao MINH!"

// Biểu thức điều kiện (ternary)
const diem = 7;
console.log(`Ket qua: ${diem >= 5 ? "Dau" : "Rot"}`);
// "Ket qua: Dau"

// Gọi hàm phức tạp
function tinhThue(gia) {
  return gia * 0.1;
}
const giaSanPham = 500000;
console.log(`Thue: ${tinhThue(giaSanPham).toLocaleString()} VND`);
// "Thue: 50,000 VND"
```

### 4. Tạo HTML động

Template Literals rất hữu ích khi tạo HTML:

```javascript
const user = { ten: "Lan", tuoi: 22, email: "lan@email.com" };

// ❌ Cách cũ: rất khó đọc
const htmlCu = "<div class='card'>" +
  "<h2>" + user.ten + "</h2>" +
  "<p>Tuoi: " + user.tuoi + "</p>" +
  "<p>Email: " + user.email + "</p>" +
  "</div>";

// ✅ Cách mới: giống như viết HTML thật
const htmlMoi = `
  <div class="card">
    <h2>${user.ten}</h2>
    <p>Tuoi: ${user.tuoi}</p>
    <p>Email: ${user.email}</p>
  </div>
`;
```

### 5. Tagged Template Literals (nâng cao)

Tagged Template là khi bạn đặt **tên hàm** trước template literal. Hàm đó sẽ nhận các phần chuỗi và các giá trị riêng biệt:

```javascript
// Hàm "tag" nhận 2 tham số:
// - strings: mảng các phần chuỗi tĩnh (không đổi)
// - ...values: các giá trị được chèn vào
function highlight(strings, ...values) {
  let result = "";
  strings.forEach((str, i) => {
    result += str;
    if (i < values.length) {
      result += `<strong>${values[i]}</strong>`;
    }
  });
  return result;
}

const ten = "Minh";
const monHoc = "JavaScript";

// Gọi hàm bằng cách đặt tên trước template literal (KHÔNG có dấu ngoặc)
const ketQua = highlight`Hoc sinh ${ten} xuat sac mon ${monHoc}`;
console.log(ketQua);
// "Hoc sinh <strong>Minh</strong> xuat sac mon <strong>JavaScript</strong>"
```

**Ứng dụng thực tế của Tagged Template:**
- Thư viện `styled-components` trong React dùng tagged template để viết CSS
- Chống tấn công SQL Injection khi tạo truy vấn database
- Quốc tế hóa (i18n) -- dịch chuỗi tự động

---

## Khi nào dùng?

| Trường hợp | Ví dụ |
|------------|-------|
| Chèn biến vào chuỗi | `` `Xin chao ${ten}` `` |
| Chuỗi nhiều dòng | Tạo HTML, email template |
| Tính toán trong chuỗi | `` `Tong: ${a + b}` `` |
| Tạo URL động | `` `api/users/${userId}/posts` `` |
| Log/debug | `` `[ERROR] User ${id}: ${message}` `` |

---

## Lỗi thường gặp

### Lỗi 1: Dùng nháy đơn thay vì backtick

```javascript
// ❌ SAI: nháy đơn không hỗ trợ ${}
const ten = "Minh";
const chao = 'Xin chao ${ten}';
console.log(chao); // "Xin chao ${ten}" -- in ra nguyên văn!

// ✅ ĐÚNG: dùng backtick
const chaoDung = `Xin chao ${ten}`;
console.log(chaoDung); // "Xin chao Minh"
```

### Lỗi 2: Quên dấu $

```javascript
// ❌ SAI: thiếu dấu $
const tuoi = 25;
console.log(`Tuoi: {tuoi}`); // "Tuoi: {tuoi}"

// ✅ ĐÚNG: có dấu $
console.log(`Tuoi: ${tuoi}`); // "Tuoi: 25"
```

### Lỗi 3: Backtick trong template literal

```javascript
// ❌ SAI: backtick bên trong làm kết thúc chuỗi
const code = `Dung dau ` de tao template`; // Lỗi cú pháp!

// ✅ ĐÚNG: dùng \` để escape
const code = `Dung dau \` de tao template`;
```

---

## Câu hỏi phỏng vấn

### Câu 1: Template Literal khác gì string thường?

**Đáp án:**

| Đặc điểm | String thường (`'` / `"`) | Template Literal (`` ` ``) |
|----------|---------------------------|----------------------------|
| Chèn biến | Dùng `+` để nối | Dùng `${}` |
| Xuống dòng | Cần `\n` | Xuống dòng trực tiếp |
| Biểu thức | Phải tính trước | Đặt trực tiếp trong `${}` |
| Tagged | Không hỗ trợ | Hỗ trợ tagged templates |

```javascript
const x = 10;

// String thường
const a = "Ket qua: " + (x * 2); // Phải nối chuỗi

// Template Literal
const b = `Ket qua: ${x * 2}`; // Gọn hơn, dễ đọc hơn
```

---

### Câu 2: Có thể đặt gì bên trong $\{}?

**Đáp án:** Bất kỳ **biểu thức JavaScript hợp lệ** nào đều được -- biến, phép tính, gọi hàm, toán tử ba ngôi, truy cập thuộc tính object:

```javascript
const arr = [1, 2, 3];
const obj = { ten: "Minh" };

console.log(`Do dai mang: ${arr.length}`);          // Thuộc tính
console.log(`Ten: ${obj.ten.toUpperCase()}`);        // Gọi method
console.log(`Ngau nhien: ${Math.random()}`);         // Gọi hàm
console.log(`Chan/le: ${5 % 2 === 0 ? "Chan" : "Le"}`); // Ternary
```

> **Lưu ý:** Không nên đặt logic phức tạp trong `${}`. Nếu biểu thức dài, hãy tính trước rồi chèn biến vào.

---

### Câu 3: Tagged Template Literal là gì? Cho ví dụ thực tế.

**Đáp án:** Tagged Template là hàm được gọi với template literal. Hàm nhận mảng các chuỗi tĩnh và các giá trị động, cho phép **xử lý tùy chỉnh** trước khi trả về kết quả.

```javascript
// Ví dụ: hàm chống XSS (cross-site scripting)
function safeHTML(strings, ...values) {
  let result = "";
  strings.forEach((str, i) => {
    result += str;
    if (i < values.length) {
      // Escape ký tự nguy hiểm
      const escaped = String(values[i])
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      result += escaped;
    }
  });
  return result;
}

const userInput = '<script>alert("hack")</script>';
const html = safeHTML`<p>Noi dung: ${userInput}</p>`;
console.log(html);
// "<p>Noi dung: &lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;</p>"
// An toàn! Script không chạy được
```

---

### Câu 4: Template Literal có tạo ra kiểu dữ liệu mới không?

**Đáp án:** **Không.** Template Literal vẫn trả về một **string bình thường**. Nó chỉ là **cú pháp mới** (syntactic sugar) để viết chuỗi dễ dàng hơn:

```javascript
const a = `Hello`;
const b = "Hello";

console.log(typeof a); // "string"
console.log(typeof b); // "string"
console.log(a === b);  // true -- hoàn toàn giống nhau
```

---

### Câu 5: Nếu không truyền biến vào, Template Literal có khác gì string thường?

**Đáp án:** Nếu không dùng `${}` hay multi-line, **kết quả hoàn toàn giống nhau**. Tuy nhiên, nhiều team quy ước: chỉ dùng backtick khi **cần** interpolation hoặc multi-line, dùng nháy đơn/kép cho chuỗi tĩnh để phân biệt rõ ràng:

```javascript
// ✅ Quy ước tốt: dùng '' cho chuỗi tĩnh
const label = 'Ho va ten';

// ✅ Dùng `` khi cần chèn biến
const greeting = `Xin chao ${label}`;

// ❌ Không cần thiết dùng `` cho chuỗi tĩnh (vẫn dùng được, nhưng không rõ ràng)
const label2 = `Ho va ten`;
```
