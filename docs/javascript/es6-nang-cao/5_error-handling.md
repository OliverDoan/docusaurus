---
sidebar_position: 5
title: "5. Xử lý lỗi (Error Handling)"
---

# Xử lý lỗi (Error Handling)

## Xử lý lỗi là gì?

**Error Handling** (xử lý lỗi) là cách để chương trình **phát hiện và xử lý** các tình huống bất thường thay vì **bị crash** (dừng đột ngột).

Hãy tưởng tượng bạn là một **phi công**. Khi máy bay gặp sự cố (thời tiết xấu, động cơ hỏng), phi công không **bỏ tay** mà **theo quy trình xử lý khẩn cấp**: chuyển sang động cơ dự phòng, hạ độ cao, thông báo hành khách. **Error Handling** chính là **quy trình xử lý khẩn cấp** của chương trình.

```javascript
// Không có error handling: chương trình CRASH
const data = JSON.parse("day khong phai JSON"); // Error! Chương trình dừng

// Có error handling: chương trình VẪN CHẠY
try {
  const data = JSON.parse("day khong phai JSON");
} catch (error) {
  console.log("Du lieu khong hop le, vui long thu lai");
  // Chương trình vẫn tiếp tục chạy bình thường
}
```

---

## Tại sao cần xử lý lỗi?

| Không xử lý lỗi | Có xử lý lỗi |
|-----------------|-------------|
| App crash, mất trắng trang | App hiển thị thông báo lỗi thân thiện |
| User không biết chuyện gì xảy ra | User biết cần làm gì tiếp theo |
| Dữ liệu bị mất | Dữ liệu được bảo toàn |
| Khó debug | Log chi tiết giúp tìm lỗi nhanh |

**Những tình huống luôn có thể gặp lỗi:**
- Gọi API (mạng yếu, server chết)
- Đọc dữ liệu từ người dùng (nhập sai định dạng)
- Xử lý file (file không tồn tại)
- Parse JSON (dữ liệu không hợp lệ)
- Truy cập thuộc tính của `null`/`undefined`

---

## Cách sử dụng

### 1. try / catch / finally

```javascript
try {
  // Code có thể gặp lỗi
  const ketQua = thucHienGiDo();
  console.log(ketQua);
} catch (error) {
  // Chạy khi có lỗi xảy ra trong try
  console.error("Co loi:", error.message);
} finally {
  // LUÔN LUÔN chạy, dù có lỗi hay không
  console.log("Da hoan tat xu ly");
}
```

**Thứ tự thực thi:**

```javascript
// Trường hợp KHÔNG có lỗi:
// try -> finally (catch bị bỏ qua)

// Trường hợp CÓ lỗi:
// try (đến dòng lỗi) -> catch -> finally
```

Ví dụ thực tế:

```javascript
function docFile(duongDan) {
  let file = null;
  try {
    file = moFile(duongDan);          // Có thể lỗi: file không tồn tại
    const noiDung = file.read();       // Có thể lỗi: file bị hỏng
    return noiDung;
  } catch (error) {
    console.error(`Khong doc duoc file ${duongDan}: ${error.message}`);
    return null;
  } finally {
    // Luôn đóng file dù thành công hay thất bại
    if (file) {
      file.close();
    }
  }
}
```

### 2. Các loại Error có sẵn

JavaScript có nhiều loại Error, mỗi loại báo hiệu một vấn đề khác nhau:

| Loại Error | Khi nào xảy ra | Ví dụ |
|-----------|----------------|-------|
| **TypeError** | Thao tác trên sai kiểu dữ liệu | `null.toString()` |
| **ReferenceError** | Dùng biến chưa khai báo | `console.log(x)` khi x chưa khai báo |
| **SyntaxError** | Cú pháp sai | `JSON.parse("{sai}")` |
| **RangeError** | Giá trị ngoài phạm vi | `new Array(-1)` |
| **URIError** | Hàm URI sai | `decodeURI('%')` |
| **EvalError** | Liên quan đến eval() | Hiếm gặp |

```javascript
// TypeError
try {
  const x = null;
  x.toString(); // Không thể gọi method trên null
} catch (error) {
  console.log(error.name);    // "TypeError"
  console.log(error.message); // "Cannot read properties of null"
}

// ReferenceError
try {
  console.log(bienChuaKhaiBao);
} catch (error) {
  console.log(error.name); // "ReferenceError"
}

// SyntaxError (trong JSON.parse)
try {
  JSON.parse("{ sai: }");
} catch (error) {
  console.log(error.name); // "SyntaxError"
}
```

### 3. throw -- tự tạo lỗi

```javascript
function chia(a, b) {
  // Kiểm tra trước và ném lỗi nếu dữ liệu không hợp lệ
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Ca 2 tham so phai la so");
  }
  if (b === 0) {
    throw new RangeError("Khong the chia cho 0");
  }
  return a / b;
}

try {
  console.log(chia(10, 0));
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
  // "RangeError: Khong the chia cho 0"
}

try {
  console.log(chia(10, "abc"));
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
  // "TypeError: Ca 2 tham so phai la so"
}
```

### 4. Custom Error (lỗi tự định nghĩa)

```javascript
// Tạo class Error riêng cho ứng dụng
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} voi ID ${id} khong ton tai`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
  }
}

// Sử dụng Custom Error
function taoNguoiDung(data) {
  if (!data.email) {
    throw new ValidationError("email", "Email khong duoc de trong");
  }
  if (!data.email.includes("@")) {
    throw new ValidationError("email", "Email khong hop le");
  }
  // ...tạo người dùng
}

try {
  taoNguoiDung({ email: "sai-format" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Loi truong "${error.field}": ${error.message}`);
    // "Loi truong "email": Email khong hop le"
  } else {
    throw error; // Ném lại lỗi không xử lý được
  }
}
```

### 5. Error Handling trong Async Code

#### Với Promise (.catch)

```javascript
// Dùng .catch() để bắt lỗi từ Promise
function layDuLieu(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Du lieu:", data);
    })
    .catch((error) => {
      console.error("Loi khi lay du lieu:", error.message);
    });
}
```

#### Với async/await (try/catch)

```javascript
// ✅ Cách hiện đại: async/await + try/catch
async function layDuLieu(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Du lieu:", data);
    return data;
  } catch (error) {
    if (error.name === "TypeError") {
      // Lỗi mạng (không kết nối được)
      console.error("Khong co ket noi mang");
    } else {
      console.error("Loi:", error.message);
    }
    return null;
  }
}
```

#### Xử lý lỗi nhiều Promise đồng thời

```javascript
async function layNhieuDuLieu() {
  try {
    // Promise.allSettled: không throw lỗi, trả về trạng thái từng promise
    const ketQua = await Promise.allSettled([
      fetch("/api/users"),
      fetch("/api/products"),
      fetch("/api/orders"),
    ]);

    ketQua.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`API ${index}: thanh cong`);
      } else {
        console.error(`API ${index}: that bai - ${result.reason.message}`);
      }
    });
  } catch (error) {
    console.error("Loi khong mong doi:", error.message);
  }
}
```

---

## Khi nào dùng?

| Trường hợp | Cách xử lý |
|------------|-----------|
| Gọi API | try/catch với async/await |
| Parse JSON | try/catch quanh JSON.parse |
| Đọc dữ liệu người dùng | Validate trước, throw nếu sai |
| Thao tác file/database | try/catch/finally (dọn dẹp ở finally) |
| Nhiều thao tác cùng lúc | Promise.allSettled |
| Lỗi nghiệp vụ cụ thể | Custom Error class |

---

## Lỗi thường gặp

### Lỗi 1: Bắt lỗi nhưng không xử lý (nuốt lỗi)

```javascript
// ❌ SAI: "nuốt" lỗi -- không biết lỗi gì xảy ra
try {
  const data = await fetchAPI();
} catch (error) {
  // Không làm gì cả! Lỗi bị ẩn
}

// ✅ ĐÚNG: luôn log hoặc xử lý lỗi
try {
  const data = await fetchAPI();
} catch (error) {
  console.error("Loi fetchAPI:", error.message);
  hienThiThongBaoLoi("Khong lay duoc du lieu. Vui long thu lai.");
}
```

### Lỗi 2: try/catch không bắt được lỗi trong callback/setTimeout

```javascript
// ❌ SAI: try/catch KHÔNG bắt lỗi trong setTimeout
try {
  setTimeout(() => {
    throw new Error("Loi!"); // Lỗi này KHÔNG bị catch bắt
  }, 1000);
} catch (error) {
  console.log("Se khong bao gio chay den day");
}

// ✅ ĐÚNG: đặt try/catch BÊN TRONG callback
setTimeout(() => {
  try {
    throw new Error("Loi!");
  } catch (error) {
    console.error("Bat duoc loi:", error.message);
  }
}, 1000);
```

### Lỗi 3: Quên return sau khi xử lý lỗi

```javascript
// ❌ SAI: code vẫn chạy tiếp sau catch
async function layUser(id) {
  let data;
  try {
    data = await fetch(`/api/users/${id}`);
  } catch (error) {
    console.error("Loi");
    // Quên return! Code bên dưới vẫn chạy với data = undefined
  }
  const user = await data.json(); // TypeError: Cannot read properties of undefined
}

// ✅ ĐÚNG: return trong catch
async function layUser(id) {
  let data;
  try {
    data = await fetch(`/api/users/${id}`);
  } catch (error) {
    console.error("Loi");
    return null; // Dừng tại đây
  }
  return await data.json();
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: try/catch/finally thực thi theo thứ tự nào?

**Đáp án:**

- **Không có lỗi:** `try` -> `finally` (catch bị bỏ qua)
- **Có lỗi:** `try` (đến dòng lỗi) -> `catch` -> `finally`
- `finally` **LUÔN CHẠY** trong mọi trường hợp, kể cả khi có `return` trong try/catch

```javascript
function viDu() {
  try {
    console.log("1. try bat dau");
    throw new Error("Loi!");
    console.log("Dong nay KHONG chay");
  } catch (error) {
    console.log("2. catch: " + error.message);
    return "gia tri tu catch"; // return bị "tạm dừng"
  } finally {
    console.log("3. finally LUON chay");
    // Nếu finally có return, nó SẼ GHI ĐÈ return của catch!
  }
}

viDu();
// Output:
// "1. try bat dau"
// "2. catch: Loi!"
// "3. finally LUON chay"
```

---

### Câu 2: Làm sao tạo Custom Error?

**Đáp án:** Kế thừa từ class `Error` có sẵn:

```javascript
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);         // Gọi constructor Error
    this.name = "ApiError"; // Đặt tên cho error
    this.statusCode = statusCode;
  }
}

// Sử dụng
async function goiAPI(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(res.status, `API loi: ${res.statusText}`);
  }
  return res.json();
}

try {
  await goiAPI("/api/users");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(`Loi API (${error.statusCode}): ${error.message}`);
  } else {
    console.log("Loi khac:", error.message);
  }
}
```

---

### Câu 3: Cách xử lý lỗi trong Promise?

**Đáp án:** Có 3 cách:

```javascript
// Cách 1: .catch()
fetchData()
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

// Cách 2: tham số thứ 2 của .then()
fetchData().then(
  (data) => console.log(data),     // thành công
  (error) => console.error(error)  // thất bại
);

// Cách 3: async/await + try/catch (KHUYÊN DÙNG)
async function layDuLieu() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

**Điểm khác biệt:** `.catch()` bắt lỗi của **toàn bộ chuỗi .then()**, còn tham số thứ 2 của `.then()` chỉ bắt lỗi của **promise trước đó**.

---

### Câu 4: Error.name, Error.message và Error.stack là gì?

**Đáp án:**

| Thuộc tính | Mô tả | Ví dụ |
|-----------|-------|-------|
| `name` | Tên loại lỗi | `"TypeError"`, `"RangeError"` |
| `message` | Mô tả lỗi | `"Cannot read properties of null"` |
| `stack` | Vị trí lỗi trong code | Danh sách các dòng code (stack trace) |

```javascript
try {
  null.toString();
} catch (error) {
  console.log(error.name);    // "TypeError"
  console.log(error.message); // "Cannot read properties of null (reading 'toString')"
  console.log(error.stack);   // Chi tiết dòng code gây lỗi
}
```

`error.stack` rất hữu ích khi **debug** -- nó cho biết chính xác dòng nào, file nào gây ra lỗi.

---

### Câu 5: Global error handling trong JavaScript?

**Đáp án:** Để bắt **tất cả lỗi chưa xử lý** trong ứng dụng:

```javascript
// Trình duyệt: bắt lỗi toàn cục
window.addEventListener("error", (event) => {
  console.error("Loi toan cuc:", event.message);
  // Gửi log về server để theo dõi
});

// Bắt Promise rejection chưa xử lý
window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise bi reject ma khong co catch:", event.reason);
  event.preventDefault(); // Ngăn thông báo mặc định của trình duyệt
});

// Node.js
process.on("uncaughtException", (error) => {
  console.error("Loi chua xu ly:", error);
  process.exit(1); // Nên thoát sau khi log
});

process.on("unhandledRejection", (reason) => {
  console.error("Promise rejection:", reason);
});
```

> **Lưu ý:** Global error handler là **lưới an toàn cuối cùng**. Luôn xử lý lỗi tại nơi xảy ra (local) trước, chỉ dùng global handler để log và theo dõi.
