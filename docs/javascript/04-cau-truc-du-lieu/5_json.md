---
sidebar_position: 5
title: "5. JSON"
---

# JSON


---

## Mục lục

- [JSON là gì?](#json-là-gì)
- [Tại sao JSON ra đời?](#tại-sao-json-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [JSON vs JavaScript Object](#json-vs-javascript-object)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## JSON là gì?

Hãy tưởng tượng bạn muốn gửi **thông tin cá nhân** cho bạn bè qua tin nhắn. Bạn không thể gửi nguyên một "đối tượng người" qua mạng, mà phải viết thành **văn bản** (text):

```
Tên: An, Tuổi: 25, Email: an@email.com
```

**JSON (JavaScript Object Notation)** chính là **một cách viết dữ liệu thành văn bản** theo format chuẩn mà cả người và máy đều đọc hiểu được.

```json
{
  "ten": "An",
  "tuoi": 25,
  "email": "an@email.com"
}
```

> JSON giống như **ngôn ngữ chung** giữa các hệ thống. Ứng dụng web, mobile, server... đều dùng JSON để "nói chuyện" với nhau.

## Tại sao JSON ra đời?

Trước JSON, **XML** là định dạng phổ biến để trao đổi dữ liệu:

```xml
<!-- XML — dài dòng, khó đọc -->
<nguoiDung>
  <ten>An</ten>
  <tuoi>25</tuoi>
  <email>an@email.com</email>
</nguoiDung>
```

```json
// JSON — ngắn gọn, dễ đọc hơn
{
  "ten": "An",
  "tuoi": 25,
  "email": "an@email.com"
}
```

JSON ra đời năm 2001, được Douglas Crockford phát triển nhằm tạo ra định dạng:
- **Nhẹ hơn** XML (ít ký tự hơn)
- **Dễ đọc** hơn cho con người
- **Dễ parse** (phân tích) cho máy
- **Tương thích** với JavaScript (vì dựa trên cú pháp object JS)

Ngày nay, JSON là **tiêu chuẩn số 1** cho việc trao đổi dữ liệu trên web.

## Cách sử dụng

### Quy tắc JSON

```js
// ✅ JSON hợp lệ
{
  "ten": "An",          // key PHẢI có dấu ngoặc kép
  "tuoi": 25,           // số không cần ngoặc kép
  "laHocSinh": true,    // boolean
  "diaChi": null,       // null
  "sothich": ["đọc sách", "bơi"],  // mảng
  "diem": {             // object lồng nhau
    "toan": 9,
    "van": 8
  }
}
```

```js
// ❌ JSON KHÔNG hợp lệ
{
  ten: "An",             // ❌ key thiếu ngoặc kép
  'tuoi': 25,            // ❌ key dùng ngoặc đơn
  "ngaySinh": new Date(), // ❌ không có function/constructor
  "chaoHoi": function() {}, // ❌ không có function
  "tuoi": undefined,     // ❌ không có undefined
  // Đây là comment      // ❌ không có comment
}
```

### Bảng kiểu dữ liệu JSON hỗ trợ

| Kiểu          | Ví dụ                        | Hỗ trợ |
|---------------|------------------------------|--------|
| String        | `"Xin chào"`                 | ✅     |
| Number        | `42`, `3.14`                 | ✅     |
| Boolean       | `true`, `false`              | ✅     |
| Null          | `null`                       | ✅     |
| Array         | `[1, 2, 3]`                  | ✅     |
| Object        | `{"key": "value"}`           | ✅     |
| undefined     | `undefined`                  | ❌     |
| Function      | `function() {}`              | ❌     |
| Date          | `new Date()`                 | ❌     |
| RegExp        | `/abc/g`                     | ❌     |
| Symbol        | `Symbol("id")`               | ❌     |

### JSON.stringify() — Object sang chuỗi JSON

```js
let nguoiDung = {
  ten: "An",
  tuoi: 25,
  sothich: ["đọc sách", "bơi"],
};

// Chuyển object → chuỗi JSON
let jsonString = JSON.stringify(nguoiDung);
console.log(jsonString);
// '{"ten":"An","tuoi":25,"sothich":["đọc sách","bơi"]}'

console.log(typeof jsonString); // "string"

// Format đẹp với khoảng trắng (thường dùng khi debug)
let jsonDep = JSON.stringify(nguoiDung, null, 2);
console.log(jsonDep);
// {
//   "ten": "An",
//   "tuoi": 25,
//   "sothich": [
//     "đọc sách",
//     "bơi"
//   ]
// }
```

### JSON.parse() — Chuỗi JSON sang Object

```js
let chuoiJSON = '{"ten":"Bình","tuoi":28,"thanhPho":"HCM"}';

// Chuyển chuỗi JSON → object
let obj = JSON.parse(chuoiJSON);

console.log(obj.ten);      // "Bình"
console.log(obj.tuoi);     // 28
console.log(obj.thanhPho); // "HCM"
console.log(typeof obj);   // "object"
```

### Ví dụ thực tế: localStorage

```js
// Lưu dữ liệu vào localStorage (chỉ chấp nhận string)
let caiDat = {
  theme: "dark",
  fontSize: 16,
  ngonNgu: "vi",
};

// Lưu: object → JSON string → localStorage
localStorage.setItem("caiDat", JSON.stringify(caiDat));

// Đọc: localStorage → JSON string → object
let caiDatDoc = JSON.parse(localStorage.getItem("caiDat"));
console.log(caiDatDoc.theme); // "dark"
```

### Ví dụ thực tế: API communication

```js
// Gửi dữ liệu lên server (stringify)
let duLieuGui = {
  ten: "An",
  email: "an@email.com",
};

fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(duLieuGui), // phải stringify trước khi gửi
});

// Nhận dữ liệu từ server (parse tự động với .json())
fetch("https://api.example.com/users/1")
  .then(function (response) {
    return response.json(); // tự động parse JSON → object
  })
  .then(function (data) {
    console.log(data.ten); // dữ liệu từ server
  });
```

## JSON vs JavaScript Object

| Đặc điểm        | JSON                          | JavaScript Object            |
|-----------------|-------------------------------|------------------------------|
| Key             | PHẢI có dấu ngoặc kép `"key"` | Không bắt buộc `key` hoặc `"key"` |
| Value           | String, Number, Boolean, null, Array, Object | Mọi kiểu dữ liệu kể cả function |
| Function        | Không hỗ trợ                  | Hỗ trợ                       |
| Comment         | Không có                      | Có                           |
| Trailing comma  | Không cho phép                | Cho phép                     |
| Mục đích        | Trao đổi dữ liệu             | Lập trình                    |

```js
// JavaScript Object — linh hoạt hơn
let jsObj = {
  ten: "An",           // key không cần ngoặc kép
  chaoHoi: function() { return "Xin chào!"; }, // có function
  tuoi: 25,            // trailing comma OK
};

// JSON — chặt chẽ hơn
let jsonString = '{"ten": "An", "tuoi": 25}';
// Không có function, key phải có ngoặc kép, không trailing comma
```

## Khi nào dùng?

- **API communication**: Gửi/nhận dữ liệu giữa client và server
- **localStorage/sessionStorage**: Lưu dữ liệu trên trình duyệt
- **Config files**: `package.json`, `tsconfig.json`, `settings.json`
- **Trao đổi dữ liệu**: Giữa các hệ thống, ngôn ngữ khác nhau
- **Debug**: Xem nội dung object dưới dạng chuỗi

## Lỗi thường gặp

### Lỗi 1: Parse chuỗi không đúng format JSON

```js
// ❌ Sai — chuỗi không phải JSON hợp lệ
let data = JSON.parse("hello"); // SyntaxError!
let data2 = JSON.parse("{'ten': 'An'}"); // SyntaxError! — dùng ngoặc đơn

// ✅ Đúng — luôn dùng try-catch khi parse
try {
  let data = JSON.parse(chuoiNhapVao);
  console.log(data);
} catch (error) {
  console.log("JSON không hợp lệ:", error.message);
}
```

### Lỗi 2: Stringify mất dữ liệu

```js
let obj = {
  ten: "An",
  tuoi: 25,
  chaoHoi: function () { return "Hi"; }, // function
  ngaySinh: undefined,                    // undefined
  id: Symbol("id"),                       // Symbol
};

let json = JSON.stringify(obj);
console.log(json);
// '{"ten":"An","tuoi":25}'
// ❌ function, undefined, Symbol đều bị BỎ QUA!
```

### Lỗi 3: Quên stringify khi lưu localStorage

```js
let user = { ten: "An", tuoi: 25 };

// ❌ Sai — localStorage tự chuyển object thành "[object Object]"
localStorage.setItem("user", user);
console.log(localStorage.getItem("user")); // "[object Object]" — mất dữ liệu!

// ✅ Đúng — stringify trước khi lưu
localStorage.setItem("user", JSON.stringify(user));
let userDoc = JSON.parse(localStorage.getItem("user"));
console.log(userDoc.ten); // "An"
```

---

## Câu hỏi phỏng vấn

### Câu 1: JSON.stringify() có xử lý được function không?

**Đáp án:** Không! `JSON.stringify()` sẽ **bỏ qua** (skip) các property có giá trị là `function`, `undefined`, hoặc `Symbol`:

```js
let obj = {
  ten: "An",
  chaoHoi: function () { return "Hi"; },
  tuoi: undefined,
  id: Symbol("abc"),
  email: "an@email.com",
};

console.log(JSON.stringify(obj));
// '{"ten":"An","email":"an@email.com"}'
// → chaoHoi, tuoi, id đều bị bỏ qua!
```

Lý do: JSON là định dạng **dữ liệu thuần** (data-only), không lưu trữ logic (function) hay giá trị đặc biệt (undefined, Symbol).

### Câu 2: Có thể deep clone object bằng JSON không?

**Đáp án:** Có thể dùng `JSON.parse(JSON.stringify(obj))` để deep clone, nhưng có **nhiều hạn chế**:

```js
// ✅ Hoạt động tốt với dữ liệu đơn giản
let goc = { ten: "An", diaChi: { thanhPho: "HN" } };
let clone = JSON.parse(JSON.stringify(goc));
clone.diaChi.thanhPho = "HCM";
console.log(goc.diaChi.thanhPho); // "HN" — không bị ảnh hưởng!

// ❌ Mất dữ liệu với kiểu đặc biệt
let complex = {
  ngay: new Date(),      // → string, mất kiểu Date
  regex: /abc/g,         // → {} (object rỗng)
  ham: function () {},   // → bị bỏ qua
  undef: undefined,      // → bị bỏ qua
  inf: Infinity,         // → null
};
let clone2 = JSON.parse(JSON.stringify(complex));
console.log(clone2);
// { ngay: "2024-01-15T...", regex: {}, inf: null }
```

Nên dùng `structuredClone()` cho deep clone chính xác hơn.

### Câu 3: Hạn chế của JSON là gì?

**Đáp án:**

1. **Không hỗ trợ function**, undefined, Symbol, RegExp, Date (mất kiểu)
2. **Không có comment** — khó chú thích trong file config
3. **Circular reference** gây lỗi:

```js
let a = {};
a.self = a; // tham chiếu vòng

// JSON.stringify(a); // TypeError: Converting circular structure to JSON
```

4. **Key phải là string** — không hỗ trợ key dạng number hay Symbol
5. **Không trailing comma** — dễ gây lỗi syntax khi thêm/xóa dòng

### Câu 4: JSON.stringify() với tham số thứ 2 (replacer) hoạt động thế nào?

**Đáp án:** Tham số thứ 2 cho phép **lọc** hoặc **biến đổi** dữ liệu khi stringify:

```js
let user = {
  ten: "An",
  tuoi: 25,
  matKhau: "secret123",
  email: "an@email.com",
};

// Cách 1: Mảng — chỉ giữ các key được chỉ định
let safe = JSON.stringify(user, ["ten", "email"]);
console.log(safe);
// '{"ten":"An","email":"an@email.com"}' — matKhau bị loại!

// Cách 2: Function — biến đổi giá trị
let masked = JSON.stringify(user, function (key, value) {
  if (key === "matKhau") return "***"; // ẩn mật khẩu
  return value;
});
console.log(masked);
// '{"ten":"An","tuoi":25,"matKhau":"***","email":"an@email.com"}'
```

### Câu 5: Sự khác nhau giữa JSON.parse() và eval() để parse JSON?

**Đáp án:** **KHÔNG BAO GIỜ** dùng `eval()` để parse JSON! `eval()` thực thi code JavaScript, tạo lỗ hổng bảo mật nghiêm trọng:

```js
let jsonString = '{"ten": "An"}';

// ❌ NGUY HIỂM — eval() thực thi bất kỳ code nào
// Nếu jsonString chứa mã độc: '(function(){/* xóa dữ liệu */})()'
// eval("(" + jsonString + ")"); // KHÔNG BAO GIỜ LÀM THẾ NÀY!

// ✅ AN TOÀN — JSON.parse() chỉ parse dữ liệu
let obj = JSON.parse(jsonString);
console.log(obj.ten); // "An"
```

`JSON.parse()` chỉ chấp nhận JSON hợp lệ. Nếu dữ liệu chứa code JavaScript, nó sẽ throw error thay vì thực thi.
