---
sidebar_position: 4
title: "4. Fetch API"
---

# Fetch API


---

## Mục lục

- [Fetch là gì?](#fetch-là-gì)
- [Tại sao Fetch ra đời?](#tại-sao-fetch-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Response Object](#response-object)
- [Headers và CORS](#headers-và-cors)
- [Error Handling — Điểm QUAN TRỌNG NHẤT](#error-handling-điểm-quan-trọng-nhất)
- [Khi nào dùng Fetch?](#khi-nào-dùng-fetch)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Fetch là gì?

**Fetch API** là cách hiện đại để **gửi request (yêu cầu) đến server và nhận response (phản hồi)** trong JavaScript. Nó dựa trên Promise, thay thế cho XMLHttpRequest cũ.

> **Ví dụ thực tế:** Fetch giống như **gửi thư qua bưu điện:**
> - Bạn viết thư (request) và gửi đi (fetch)
> - Bưu điện vận chuyển (internet)
> - Người nhận đọc thư và gửi thư trả lời (response)
> - Bạn nhận thư trả lời và đọc nội dung (response.json())

```javascript
// Gửi "thư" đến server và nhận "thư trả lời"
fetch("https://api.example.com/users")      // Gửi thư
  .then(response => response.json())         // Mở thư, đọc nội dung
  .then(data => console.log("Dữ liệu:", data)) // Xử lý nội dung
  .catch(error => console.error("Lỗi:", error));
```

## Tại sao Fetch ra đời?

### Trước đây: XMLHttpRequest (XHR) — phức tạp, khó dùng

```javascript
// XMLHttpRequest — code dài dòng, khó hiểu
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.example.com/users");
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      console.log(data);
    } else {
      console.error("Lỗi:", xhr.status);
    }
  }
};
xhr.onerror = function() {
  console.error("Network error");
};
xhr.send();
```

### Fetch API (ES2015) — đơn giản, dùng Promise

```javascript
// Fetch — ngắn gọn, dễ hiểu
fetch("https://api.example.com/users")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

| Tiêu chí | XMLHttpRequest | Fetch API |
|----------|---------------|-----------|
| Cú pháp | Phức tạp, nhiều bước | Đơn giản, 1 dòng |
| Promise | Không (dùng callback) | Có (built-in) |
| Stream | Không | Có (ReadableStream) |
| Cancel | abort() | AbortController |
| Ra đời | 1999 | 2015 |

## Cách sử dụng

### GET Request — Lấy dữ liệu

```javascript
// Cách 1: Dùng .then()
fetch("https://jsonplaceholder.typicode.com/users")
  .then(response => {
    // Kiểm tra response có OK không
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json(); // Chuyển response thành JSON
  })
  .then(users => {
    console.log("Số lượng users:", users.length);
    users.forEach(user => console.log(user.name));
  })
  .catch(error => {
    console.error("Lỗi:", error.message);
  });

// Cách 2: Dùng async/await (khuyên dùng)
async function layDanhSachUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const users = await response.json();
    console.log("Users:", users);
    return users;
  } catch (error) {
    console.error("Không thể tải users:", error.message);
    return [];
  }
}
```

### POST Request — Gửi dữ liệu

```javascript
async function taoUserMoi(userData) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users", {
      method: "POST",                          // Phương thức HTTP
      headers: {
        "Content-Type": "application/json",    // Định dạng dữ liệu gửi đi
      },
      body: JSON.stringify({                   // Dữ liệu gửi lên server
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi tạo user: ${response.status}`);
    }

    const newUser = await response.json();
    console.log("User mới:", newUser);
    return newUser;
  } catch (error) {
    console.error("Lỗi:", error.message);
    return null;
  }
}

// Sử dụng
taoUserMoi({
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0123456789",
});
```

### PUT / PATCH / DELETE

```javascript
// PUT — Cập nhật TOÀN BỘ dữ liệu
async function capNhatUser(userId, userData) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData), // Gửi toàn bộ dữ liệu mới
  });
  return response.json();
}

// PATCH — Cập nhật MỘT PHẦN dữ liệu
async function capNhatEmail(userId, email) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }), // Chỉ gửi trường cần cập nhật
  });
  return response.json();
}

// DELETE — Xóa dữ liệu
async function xoaUser(userId) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log("Đã xóa user thành công");
  }
}
```

## Response Object

Khi fetch thành công, bạn nhận được **Response object** với nhiều thuộc tính và phương thức:

```javascript
async function phanTichResponse() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users/1");

  // Thuộc tính
  console.log("Status code:", response.status);     // 200, 404, 500...
  console.log("Status text:", response.statusText);  // "OK", "Not Found"...
  console.log("OK?", response.ok);                   // true (200-299), false (400+)
  console.log("URL:", response.url);
  console.log("Type:", response.type);               // "cors", "basic"...

  // Headers
  console.log("Content-Type:", response.headers.get("Content-Type"));

  // Đọc nội dung (CHỈ GỌI ĐƯỢC 1 LẦN!)
  const data = await response.json();   // Chuyển thành JavaScript object
  // const text = await response.text(); // Chuyển thành string
  // const blob = await response.blob(); // Chuyển thành file/hình ảnh
}
```

**Quan trọng:** `response.json()`, `response.text()` chỉ gọi được **1 lần** vì body là stream (đọc xong là hết).

```javascript
// BAD: Gọi 2 lần → lỗi
const json = await response.json();
const text = await response.text(); // TypeError: body already consumed!

// GOOD: Clone nếu cần đọc 2 lần
const clone = response.clone();
const json = await response.json();
const text = await clone.text();
```

## Headers và CORS

### Custom Headers

```javascript
const response = await fetch("/api/data", {
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9...", // Token xác thực
    "X-Custom-Header": "giá-trị-bất-kỳ",
  },
});
```

### CORS (Cross-Origin Resource Sharing)

**CORS** là cơ chế bảo mật của browser, chỉ cho phép trang web gửi request đến **cùng domain** mặc định.

```
Trang web: https://mysite.com
     │
     ├─ fetch("/api/data")                     → ĐƯỢC (cùng domain)
     ├─ fetch("https://mysite.com/api/data")   → ĐƯỢC (cùng domain)
     └─ fetch("https://api.other.com/data")    → BỊ CHẶN! (khác domain)
                                                  → Cần server cho phép CORS
```

```javascript
// Khi bị lỗi CORS:
// Access to fetch at 'https://api.other.com' has been blocked by CORS policy

// Giải pháp 1: Server thêm header cho phép
// (phía server) Access-Control-Allow-Origin: https://mysite.com

// Giải pháp 2: Dùng mode "no-cors" (hạn chế, không đọc được response)
fetch("https://api.other.com/data", {
  mode: "no-cors", // Gửi được nhưng KHÔNG đọc được response
});

// Giải pháp 3: Dùng proxy server (khuyên dùng khi phát triển)
fetch("/api/proxy?url=https://api.other.com/data");
```

## Error Handling — Điểm QUAN TRỌNG NHẤT

### Fetch KHÔNG throw error cho HTTP 404/500!

Đây là **sai lầm phổ biến nhất** khi dùng Fetch:

```javascript
// BAD: Tưởng .catch() bắt được lỗi 404
fetch("https://api.example.com/khong-ton-tai") // URL không tồn tại
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Lỗi:", error));
// .catch() KHÔNG chạy! Vì fetch chỉ throw error khi NETWORK LỖI

// GOOD: Kiểm tra response.ok TRƯỚC
fetch("https://api.example.com/khong-ton-tai")
  .then(response => {
    if (!response.ok) {
      // Tự throw error cho HTTP 4xx, 5xx
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error("Lỗi:", error));
// Bây giờ .catch() BẮT ĐƯỢC lỗi 404!
```

**Fetch chỉ throw error khi:**
- Không có kết nối mạng (network failure)
- DNS lỗi
- Request bị block (CORS)

**Fetch KHÔNG throw error khi:**
- HTTP 404 (Not Found)
- HTTP 500 (Server Error)
- HTTP 401 (Unauthorized)
- Bất kỳ HTTP error status nào

### Hàm helper xử lý lỗi đúng cách

```javascript
// Tạo hàm helper để dùng lại
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  // Kiểm tra HTTP status
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}. Body: ${errorBody}`
    );
  }

  return response.json();
}

// Sử dụng — đơn giản và an toàn
async function layUsers() {
  try {
    const users = await fetchJSON("/api/users");
    console.log("Users:", users);
  } catch (error) {
    console.error("Lỗi:", error.message);
  }
}
```

### Cancel Request với AbortController

```javascript
// Hủy request nếu mất quá lâu
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();

  // Tự động hủy sau timeoutMs
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal, // Kết nối với AbortController
    });
    clearTimeout(timeoutId); // Xóa timeout nếu fetch thành công
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`Request bị hủy sau ${timeoutMs}ms`);
    } else {
      console.error("Lỗi khác:", error);
    }
    return null;
  }
}

// Sử dụng
const data = await fetchWithTimeout("/api/slow-endpoint", 3000);
```

## Khi nào dùng Fetch?

- Gọi REST API (GET, POST, PUT, DELETE)
- Tải dữ liệu JSON từ server
- Upload file (dùng FormData)
- Bất kỳ giao tiếp client-server nào

**Khi nào dùng thư viện (axios, ky)?**
- Cần interceptors (xử lý token tự động)
- Cần auto-retry khi thất bại
- Cần progress tracking (upload/download)
- Cần tự động throw error cho HTTP 4xx/5xx

## Lỗi thường gặp

### Lỗi 1: Không kiểm tra response.ok

```javascript
// BAD: Tưởng fetch đã thành công = dữ liệu đúng
const response = await fetch("/api/users/99999"); // User không tồn tại
const data = await response.json(); // Có thể trả về { error: "Not found" }
console.log(data.name); // undefined — không có lỗi nhưng dữ liệu sai!

// GOOD: Kiểm tra response.ok
const response = await fetch("/api/users/99999");
if (!response.ok) {
  throw new Error(`User không tồn tại (${response.status})`);
}
const data = await response.json();
```

### Lỗi 2: Quên JSON.stringify cho body

```javascript
// BAD: Gửi object trực tiếp — server nhận "[object Object]"
fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: { name: "Test" }, // SAI! Phải stringify
});

// GOOD: Dùng JSON.stringify()
fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test" }), // ĐÚNG!
});
```

### Lỗi 3: Gọi response.json() 2 lần

```javascript
// BAD: Body chỉ đọc được 1 lần
const response = await fetch("/api/data");
const json = await response.json();
const text = await response.text(); // TypeError: body already consumed

// GOOD: Clone trước khi đọc
const response = await fetch("/api/data");
const clone = response.clone();
const json = await response.json();
const text = await clone.text();
```

---

## Câu hỏi phỏng vấn

### Câu 1: Fetch và XMLHttpRequest khác nhau như thế nào?

**Đáp án:**

| Tiêu chí | XMLHttpRequest | Fetch |
|----------|---------------|-------|
| API | Event-based (callback) | Promise-based |
| Cú pháp | Phức tạp, nhiều bước | Đơn giản, 1 dòng |
| Throw lỗi HTTP | Không (tương tự) | Không (cần check response.ok) |
| Stream | Không | Có (ReadableStream) |
| Cancel | xhr.abort() | AbortController |
| Cookie | Mặc định gửi | Cần `credentials: "include"` cho cross-origin |
| Progress | Có (onprogress) | Hạn chế (cần ReadableStream) |

```javascript
// XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/data");
xhr.onload = () => console.log(JSON.parse(xhr.responseText));
xhr.send();

// Fetch — ngắn gọn hơn
const data = await fetch("/api/data").then(r => r.json());
```

### Câu 2: Fetch có throw error cho HTTP 404 không? Tại sao?

**Đáp án:**

**KHÔNG.** Fetch chỉ throw error khi có **network failure** (mất mạng, DNS lỗi, CORS). Với HTTP 404 hay 500, fetch vẫn **resolve thành công** vì browser đã nhận được response từ server.

```javascript
// Fetch vẫn resolve với 404
const response = await fetch("/api/khong-ton-tai");
console.log(response.status); // 404
console.log(response.ok);     // false (vì status không nằm trong 200-299)

// Phải TỰ kiểm tra
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
```

**Tại sao thiết kế như vậy?** Vì 404 hay 500 vẫn là response hợp lệ từ server — bạn vẫn có thể đọc body, headers. Chỉ có network error mới thật sự không có response.

### Câu 3: Làm sao hủy (cancel) một fetch request?

**Đáp án:**

Dùng `AbortController`:

```javascript
const controller = new AbortController();

// Bắt đầu fetch với signal
fetch("/api/data", { signal: controller.signal })
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === "AbortError") {
      console.log("Request đã bị hủy");
    }
  });

// Hủy request bất cứ lúc nào
controller.abort();
```

**Use case thực tế:** Trong React, hủy fetch khi component unmount:

```javascript
useEffect(() => {
  const controller = new AbortController();

  fetch("/api/data", { signal: controller.signal })
    .then(r => r.json())
    .then(data => setData(data))
    .catch(error => {
      if (error.name !== "AbortError") {
        setError(error);
      }
    });

  // Cleanup: hủy fetch khi component unmount
  return () => controller.abort();
}, []);
```

### Câu 4: Làm sao gửi file lên server bằng Fetch?

**Đáp án:**

Dùng `FormData`:

```javascript
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);             // File từ input
  formData.append("description", "Ảnh đại diện"); // Dữ liệu thêm

  const response = await fetch("/api/upload", {
    method: "POST",
    // KHÔNG set Content-Type! Browser tự động thêm boundary
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload thất bại: ${response.status}`);
  }

  return response.json();
}

// Sử dụng với input file
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  uploadFile(file);
});
```

**Quan trọng:** Khi dùng FormData, **KHÔNG** set `Content-Type` header. Browser sẽ tự động thêm `multipart/form-data` với boundary đúng.

### Câu 5: So sánh Fetch với thư viện Axios. Khi nào nên dùng cái nào?

**Đáp án:**

| Tiêu chí | Fetch (built-in) | Axios (thư viện) |
|----------|-------------------|-------------------|
| Cài đặt | Không cần | npm install axios |
| HTTP error | Không throw | Tự động throw cho 4xx/5xx |
| JSON | Cần response.json() | Tự động parse |
| Interceptors | Không có | Có (request/response) |
| Cancel | AbortController | CancelToken / AbortController |
| Timeout | Tự viết | Built-in |
| Progress | Hạn chế | Có onUploadProgress |
| Kích thước | 0 KB (built-in) | ~13 KB |

```javascript
// Fetch — cần viết thêm code
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test" }),
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();

// Axios — ngắn gọn hơn
const { data } = await axios.post("/api/users", { name: "Test" });
// Tự động: JSON stringify, JSON parse, throw lỗi HTTP
```

**Dùng Fetch khi:** Dự án nhỏ, ít request, muốn giữ nhẹ (0 dependencies).
**Dùng Axios khi:** Dự án lớn, nhiều API calls, cần interceptors (xử lý token), cần xử lý lỗi toàn cục.
