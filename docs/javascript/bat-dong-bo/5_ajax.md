---
sidebar_position: 5
title: "5. Ajax & XMLHttpRequest"
---

# Ajax & XMLHttpRequest


---

## Mục lục

- [Ajax là gì?](#ajax-là-gì)
- [XMLHttpRequest — Cách cổ điển](#xmlhttprequest--cách-cổ-điển)
- [Các method HTTP phổ biến](#các-method-http-phổ-biến)
- [Xử lý Response](#xử-lý-response)
- [Từ Ajax đến Fetch đến Axios](#từ-ajax-đến-fetch-đến-axios)
- [Axios — Thư viện phổ biến](#axios--thư-viện-phổ-biến)
- [So sánh XMLHttpRequest vs Fetch vs Axios](#so-sánh-xmlhttprequest-vs-fetch-vs-axios)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Ajax là gì?

**Ajax** (Asynchronous JavaScript And XML) là kỹ thuật cho phép trang web **gửi và nhận dữ liệu từ server mà không cần reload lại toàn bộ trang**. Mặc dù tên chứa "XML", ngày nay Ajax chủ yếu dùng **JSON** thay vì XML.

> **Ví dụ thực tế:** Khi bạn gõ tìm kiếm trên Google, danh sách gợi ý xuất hiện **ngay lập tức** mà trang không reload — đó là Ajax. Trước Ajax, mỗi lần cần dữ liệu mới, cả trang phải tải lại từ đầu.

```
Trước Ajax:                    Sau Ajax:
┌──────────┐                  ┌──────────┐
│ Click    │                  │ Click    │
│ ↓        │                  │ ↓        │
│ Reload   │                  │ Gửi      │
│ TOÀN BỘ  │                  │ request  │
│ trang    │                  │ ↓        │
│ ↓        │                  │ Cập nhật │
│ Hiển thị │                  │ MỘT PHẦN │
│ trang mới│                  │ trang    │
└──────────┘                  └──────────┘
  Chậm, giật                    Nhanh, mượt
```

---

## XMLHttpRequest — Cách cổ điển

**XMLHttpRequest (XHR)** là API đầu tiên cho phép gửi HTTP request từ JavaScript. Ra đời từ năm 2006, đây là nền tảng của Ajax.

### GET Request

```javascript
// Tạo request object
const xhr = new XMLHttpRequest();

// Mở kết nối: method, URL, async
xhr.open("GET", "https://jsonplaceholder.typicode.com/users/1", true);

// Lắng nghe khi request hoàn tất
xhr.onload = function() {
  if (xhr.status === 200) {
    const user = JSON.parse(xhr.responseText);
    console.log("Tên:", user.name);
    console.log("Email:", user.email);
  } else {
    console.error("Lỗi:", xhr.status, xhr.statusText);
  }
};

// Lắng nghe lỗi mạng
xhr.onerror = function() {
  console.error("Lỗi kết nối mạng!");
};

// Gửi request
xhr.send();
```

### POST Request

```javascript
const xhr = new XMLHttpRequest();
xhr.open("POST", "https://jsonplaceholder.typicode.com/users", true);

// Set header cho JSON
xhr.setRequestHeader("Content-Type", "application/json");

xhr.onload = function() {
  if (xhr.status === 201) {
    const newUser = JSON.parse(xhr.responseText);
    console.log("Đã tạo user:", newUser);
  }
};

// Gửi dữ liệu JSON
xhr.send(JSON.stringify({
  name: "Minh Nguyen",
  email: "minh@example.com"
}));
```

### Các trạng thái của XHR (readyState)

```javascript
const xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
  console.log("readyState:", xhr.readyState);
  // 0 — UNSENT: Chưa gọi open()
  // 1 — OPENED: Đã gọi open()
  // 2 — HEADERS_RECEIVED: Đã nhận headers
  // 3 — LOADING: Đang tải body
  // 4 — DONE: Hoàn tất
};

xhr.open("GET", "https://api.example.com/data", true);
xhr.send();
```

> **Lưu ý:** `onreadystatechange` là cách cũ. Nên dùng `onload` (readyState === 4) và `onerror` cho code gọn hơn.

---

## Các method HTTP phổ biến

| Method | Mục đích | Request Body | Ví dụ |
|:---:|:---|:---:|:---|
| `GET` | Lấy dữ liệu | ❌ Không | Lấy danh sách users |
| `POST` | Tạo mới | ✅ Có | Tạo user mới |
| `PUT` | Cập nhật toàn bộ | ✅ Có | Cập nhật thông tin user |
| `PATCH` | Cập nhật một phần | ✅ Có | Đổi email user |
| `DELETE` | Xóa | ❌ Thường không | Xóa user |

```javascript
// PUT — Cập nhật toàn bộ
const xhr = new XMLHttpRequest();
xhr.open("PUT", "https://api.example.com/users/1", true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.onload = function() {
  console.log("Đã cập nhật:", JSON.parse(xhr.responseText));
};
xhr.send(JSON.stringify({
  name: "Minh Updated",
  email: "minh.new@example.com"
}));

// DELETE — Xóa
const xhrDel = new XMLHttpRequest();
xhrDel.open("DELETE", "https://api.example.com/users/1", true);
xhrDel.onload = function() {
  if (xhrDel.status === 200 || xhrDel.status === 204) {
    console.log("Đã xóa thành công");
  }
};
xhrDel.send();
```

---

## Xử lý Response

### Các kiểu response

```javascript
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.example.com/data", true);

// Chỉ định kiểu response mong muốn
xhr.responseType = "json"; // "text", "json", "blob", "arraybuffer", "document"

xhr.onload = function() {
  if (xhr.responseType === "json") {
    // Không cần JSON.parse — tự động parse
    console.log(xhr.response.name);
  }
};

xhr.send();
```

### Theo dõi tiến trình (Progress)

```javascript
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://example.com/large-file.zip", true);
xhr.responseType = "blob";

// Theo dõi tiến trình download
xhr.onprogress = function(event) {
  if (event.lengthComputable) {
    const phanTram = (event.loaded / event.total) * 100;
    console.log(`Đã tải: ${phanTram.toFixed(1)}%`);
  }
};

xhr.onload = function() {
  console.log("Tải xong!");
};

xhr.send();
```

---

## Từ Ajax đến Fetch đến Axios

Quá trình phát triển của cách gọi API trong JavaScript:

### 1. XMLHttpRequest (2006) — Phức tạp

```javascript
// Callback-based, code dài dòng
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/users", true);
xhr.onload = function() {
  if (xhr.status === 200) {
    const users = JSON.parse(xhr.responseText);
    // Gọi tiếp API khác → callback hell
    const xhr2 = new XMLHttpRequest();
    xhr2.open("GET", "/api/users/" + users[0].id + "/posts", true);
    xhr2.onload = function() {
      const posts = JSON.parse(xhr2.responseText);
      console.log(posts);
    };
    xhr2.send();
  }
};
xhr.send();
```

### 2. Fetch API (ES2015) — Promise-based

```javascript
// Sạch hơn với Promise, nhưng phải kiểm tra response.ok thủ công
fetch("/api/users")
  .then(response => {
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.json();
  })
  .then(users => fetch("/api/users/" + users[0].id + "/posts"))
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(error => console.error(error));
```

> **Tham khảo:** Xem chi tiết Fetch API tại bài [Fetch API](../bat-dong-bo/4_fetch-api.md) và cách làm việc với JSON tại bài [JSON](../mang-va-object/6_json.md).

### 3. Axios (Thư viện bên thứ 3) — Tốt nhất

```javascript
// Tự động parse JSON, tự throw lỗi, interceptors
import axios from "axios";

try {
  const { data: users } = await axios.get("/api/users");
  const { data: posts } = await axios.get(`/api/users/${users[0].id}/posts`);
  console.log(posts);
} catch (error) {
  console.error(error.response?.data || error.message);
}
```

---

## Axios — Thư viện phổ biến

### Cài đặt

```bash
npm install axios
```

### GET request

```javascript
import axios from "axios";

// Cách 1: async/await
async function layUsers() {
  try {
    const response = await axios.get("https://api.example.com/users");
    console.log(response.data);    // Dữ liệu (tự parse JSON)
    console.log(response.status);  // 200
    console.log(response.headers); // Headers
  } catch (error) {
    console.error(error.response?.status, error.message);
  }
}

// Cách 2: Promise
axios.get("https://api.example.com/users")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### POST request

```javascript
async function taoUser(userData) {
  try {
    const response = await axios.post("https://api.example.com/users", {
      name: userData.name,
      email: userData.email
    });
    console.log("Đã tạo:", response.data);
  } catch (error) {
    if (error.response) {
      // Server trả về lỗi (4xx, 5xx)
      console.error("Lỗi server:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request gửi đi nhưng không nhận được response
      console.error("Lỗi mạng:", error.message);
    }
  }
}
```

### Tạo Axios instance (Base config)

```javascript
// Tạo instance với config mặc định
const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor — xử lý trước/sau mỗi request
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log("Token hết hạn — chuyển về trang login");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Sử dụng — URL chỉ cần path
const users = await api.get("/users");
const newUser = await api.post("/users", { name: "Minh" });
```

---

## So sánh XMLHttpRequest vs Fetch vs Axios

| Tiêu chí | XMLHttpRequest | Fetch API | Axios |
|----------|---------------|-----------|-------|
| Cú pháp | Callback, dài dòng | Promise, gọn | Promise, gọn nhất |
| Parse JSON | Thủ công (`JSON.parse`) | `.json()` (2 bước) | Tự động |
| Xử lý lỗi HTTP | Kiểm tra `status` thủ công | Kiểm tra `response.ok` thủ công | Tự throw cho 4xx/5xx |
| Interceptors | ❌ | ❌ | ✅ |
| Cancel request | `xhr.abort()` | `AbortController` | `CancelToken` / `AbortController` |
| Progress | `onprogress` ✅ | ❌ (ReadableStream phức tạp) | `onUploadProgress` / `onDownloadProgress` |
| Timeout | `xhr.timeout` | ❌ (tự implement) | `timeout` option ✅ |
| Browser support | Tất cả | Modern browsers | Tất cả (polyfill) |
| Cài đặt | Built-in | Built-in | Cần cài npm |

### Khi nào dùng gì?

- **XMLHttpRequest:** Hiếm khi dùng trực tiếp. Chỉ cần hiểu để phỏng vấn và debug legacy code.
- **Fetch API:** Dự án nhỏ, không cần interceptors, muốn zero dependencies.
- **Axios:** Dự án thực tế, cần interceptors, error handling tốt, cancel request.

---

## Lỗi thường gặp

### 1. Quên set Content-Type cho POST

```javascript
// ❌ Sai — server không biết body là JSON
const xhr = new XMLHttpRequest();
xhr.open("POST", "/api/users", true);
xhr.send(JSON.stringify({ name: "Minh" })); // Server nhận text, không phải JSON!

// ✅ Đúng — set Content-Type
xhr.setRequestHeader("Content-Type", "application/json");
xhr.send(JSON.stringify({ name: "Minh" }));
```

### 2. Fetch không throw lỗi cho 4xx/5xx

```javascript
// ❌ Sai — fetch KHÔNG throw lỗi cho HTTP 404, 500
fetch("/api/not-found")
  .then(response => response.json()) // Vẫn chạy dù 404!
  .catch(error => console.error(error)); // Không catch 404

// ✅ Đúng — kiểm tra response.ok
fetch("/api/not-found")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .catch(error => console.error(error)); // Catch HTTP 404
```

### 3. Không xử lý CORS

```javascript
// ❌ Gọi API khác domain mà không có CORS headers → bị chặn
fetch("https://other-domain.com/api/data")
  .then(response => response.json())
  .catch(error => console.error(error));
// Access to fetch blocked by CORS policy

// ✅ Server phải trả header: Access-Control-Allow-Origin
// Hoặc dùng proxy trong development
```

---

## Câu hỏi phỏng vấn

### Câu 1: Ajax là gì? Tại sao nó quan trọng?

**Đáp án:** Ajax (Asynchronous JavaScript And XML) là kỹ thuật gửi/nhận dữ liệu từ server **không cần reload trang**. Nó tạo nên trải nghiệm người dùng mượt mà (SPA, real-time search, infinite scroll). Trước Ajax, mọi tương tác đều yêu cầu tải lại toàn bộ trang.

### Câu 2: Sự khác nhau giữa XMLHttpRequest và Fetch API?

**Đáp án:** Fetch API là phiên bản hiện đại hơn: dùng Promise thay vì callback, cú pháp gọn hơn, hỗ trợ `async/await`, dùng `Request`/`Response` objects. Tuy nhiên, Fetch không tự throw lỗi cho HTTP 4xx/5xx (cần kiểm tra `response.ok`), không có built-in timeout, và không hỗ trợ progress tracking dễ dàng như XHR.

### Câu 3: Fetch API có vấn đề gì trong xử lý lỗi?

**Đáp án:** Fetch chỉ reject Promise khi có **lỗi mạng** (network error). Với HTTP errors (404, 500), Fetch vẫn **resolve** bình thường — chỉ set `response.ok = false`. Developer phải tự kiểm tra `response.ok` hoặc `response.status` và throw error thủ công. Đây là khác biệt lớn so với Axios (tự throw cho tất cả non-2xx status).

### Câu 4: Interceptor trong Axios là gì? Cho ví dụ use case.

**Đáp án:** Interceptor là hàm chạy **trước mỗi request** (request interceptor) hoặc **sau mỗi response** (response interceptor). Use cases:
- **Request interceptor:** Tự động gắn JWT token vào header, thêm loading spinner
- **Response interceptor:** Redirect về login khi nhận 401, transform data format, log errors
- **Retry logic:** Tự động retry khi gặp lỗi mạng tạm thời

### Câu 5: Làm thế nào để cancel (hủy) một HTTP request?

**Đáp án:**
- **XMLHttpRequest:** Gọi `xhr.abort()`
- **Fetch API:** Dùng `AbortController` — tạo controller, truyền `signal` vào fetch options, gọi `controller.abort()` khi muốn hủy
- **Axios:** Dùng `AbortController` (mới) hoặc `CancelToken` (deprecated)

```javascript
// Fetch với AbortController
const controller = new AbortController();
fetch("/api/data", { signal: controller.signal })
  .catch(err => { if (err.name === "AbortError") console.log("Đã hủy"); });

// Hủy sau 5 giây
setTimeout(() => controller.abort(), 5000);
```
