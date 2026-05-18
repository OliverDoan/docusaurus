---
sidebar_position: 2
title: "2. Promise"
---

# Promise


---

## Mục lục

- [Promise là gì?](#promise-là-gì)
- [3 trạng thái của Promise](#3-trạng-thái-của-promise)
- [Tại sao Promise ra đời?](#tại-sao-promise-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Promise Static Methods](#promise-static-methods)
- [Khi nào dùng Promise?](#khi-nào-dùng-promise)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Promise là gì?

**Promise** là một đối tượng đại diện cho **kết quả của một tác vụ bất đồng bộ** — tác vụ đó có thể **thành công** hoặc **thất bại** trong tương lai.

> **Ví dụ thực tế:** Bạn đặt hàng online. Cửa hàng gửi bạn **một lời hứa**: "Chúng tôi sẽ giao hàng trong 3 ngày."
> - **Pending (Đang chờ):** Đơn hàng đang được xử lý
> - **Fulfilled (Thành công):** Hàng đã giao, bạn nhận được sản phẩm
> - **Rejected (Thất bại):** Hết hàng, đơn bị hủy

```javascript
// Promise giống như một "lời hứa" của cửa hàng
const donHang = new Promise((resolve, reject) => {
  const conHang = true;

  if (conHang) {
    resolve("Sản phẩm của bạn đây!"); // Thành công
  } else {
    reject("Xin lỗi, hết hàng rồi!");  // Thất bại
  }
});
```

## 3 trạng thái của Promise

```
           new Promise()
                │
                ▼
         ┌──────────┐
         │ PENDING   │  ← Trạng thái ban đầu, đang chờ kết quả
         │ (Đang chờ)│
         └─────┬─────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐ ┌──────────────┐
│ FULFILLED   │ │  REJECTED    │
│ (Thành công)│ │ (Thất bại)   │
│ resolve()   │ │ reject()     │
└─────────────┘ └──────────────┘
```

**Quan trọng:** Khi Promise đã chuyển sang Fulfilled hoặc Rejected, nó **KHÔNG THỂ thay đổi** trạng thái nữa. Đây gọi là **settled** (đã xác định).

## Tại sao Promise ra đời?

### Vấn đề: Callback Hell

Trước khi có Promise (trước ES6/2015), để xử lý nhiều tác vụ bất đồng bộ liên tiếp, ta phải dùng **callback lồng nhau**:

```javascript
// BAD: Callback Hell — "Kim tự tháp của sự khó đọc"
getUser(userId, function(user) {
  getOrders(user.id, function(orders) {
    getOrderDetails(orders[0].id, function(details) {
      getShippingInfo(details.shippingId, function(shipping) {
        console.log("Thông tin vận chuyển:", shipping);
        // Thêm callback nữa??? KHÔNG THỂ ĐỌC ĐƯỢC!
      });
    });
  });
});
```

### Giải pháp: Promise (ES6 — 2015)

```javascript
// GOOD: Promise chain — phẳng, dễ đọc
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => getShippingInfo(details.shippingId))
  .then(shipping => console.log("Thông tin vận chuyển:", shipping))
  .catch(error => console.error("Có lỗi:", error));
```

## Cách sử dụng

### Tạo Promise

```javascript
const myPromise = new Promise((resolve, reject) => {
  // Giả lập gọi API mất 2 giây
  setTimeout(() => {
    const thanhCong = true;

    if (thanhCong) {
      resolve({ name: "iPhone 15", price: 25000000 }); // Trả về kết quả
    } else {
      reject(new Error("Không thể tải dữ liệu")); // Trả về lỗi
    }
  }, 2000);
});
```

### Sử dụng: .then(), .catch(), .finally()

```javascript
myPromise
  .then(data => {
    // Chạy khi Promise THÀNH CÔNG (fulfilled)
    console.log("Sản phẩm:", data.name);
    console.log("Giá:", data.price.toLocaleString(), "VND");
  })
  .catch(error => {
    // Chạy khi Promise THẤT BẠI (rejected)
    console.error("Lỗi:", error.message);
  })
  .finally(() => {
    // LUÔN LUÔN chạy, dù thành công hay thất bại
    console.log("Đã hoàn tất xử lý!");
  });
```

### Promise Chaining (Chuỗi Promise)

Mỗi `.then()` trả về một **Promise mới**, cho phép nối chuỗi:

```javascript
// Mỗi .then() nhận kết quả của .then() trước đó
fetch("https://api.example.com/users/1")
  .then(response => {
    console.log("Bước 1: Nhận response");
    return response.json(); // Trả về Promise mới
  })
  .then(user => {
    console.log("Bước 2: User =", user.name);
    return fetch(`https://api.example.com/posts?userId=${user.id}`);
  })
  .then(response => response.json())
  .then(posts => {
    console.log("Bước 3: Số bài viết =", posts.length);
  })
  .catch(error => {
    // Bắt LỖI của BẤT KỲ bước nào trong chuỗi
    console.error("Có lỗi ở một bước nào đó:", error);
  });
```

## Promise Static Methods

### Promise.all() — Chờ TẤT CẢ thành công

Chạy nhiều Promise **song song**, trả về kết quả khi **TẤT CẢ** thành công. Nếu **1 cái thất bại** → tất cả thất bại.

```javascript
// Tải dữ liệu từ 3 API cùng lúc
const promise1 = fetch("/api/users").then(r => r.json());
const promise2 = fetch("/api/products").then(r => r.json());
const promise3 = fetch("/api/orders").then(r => r.json());

Promise.all([promise1, promise2, promise3])
  .then(([users, products, orders]) => {
    console.log("Users:", users.length);
    console.log("Products:", products.length);
    console.log("Orders:", orders.length);
  })
  .catch(error => {
    // Nếu BẤT KỲ 1 fetch nào lỗi → vào đây
    console.error("Một trong các API bị lỗi:", error);
  });
```

### Promise.allSettled() — Chờ TẤT CẢ hoàn tất (kể cả lỗi)

Không quan tâm thành công hay thất bại, chờ **tất cả** xong mới trả kết quả:

```javascript
const promises = [
  fetch("/api/users").then(r => r.json()),
  fetch("/api/KHONG-TON-TAI").then(r => r.json()), // Sẽ lỗi!
  fetch("/api/products").then(r => r.json()),
];

Promise.allSettled(promises).then(results => {
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`API ${index}: Thành công`, result.value);
    } else {
      console.log(`API ${index}: Thất bại`, result.reason);
    }
  });
});

// Kết quả:
// API 0: Thành công [...]
// API 1: Thất bại Error: 404
// API 2: Thành công [...]
```

### Promise.race() — Lấy kết quả NHANH NHẤT

Trả về kết quả của Promise **hoàn tất đầu tiên** (dù thành công hay thất bại):

```javascript
// Timeout pattern: Hủy nếu quá chậm
const fetchWithTimeout = Promise.race([
  fetch("/api/data").then(r => r.json()),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Quá 5 giây, timeout!")), 5000)
  )
]);

fetchWithTimeout
  .then(data => console.log("Dữ liệu:", data))
  .catch(error => console.error(error.message));
```

### Promise.any() — Lấy kết quả THÀNH CÔNG đầu tiên

Chỉ trả về khi có **ít nhất 1 Promise thành công**. Bỏ qua các lỗi:

```javascript
// Thử nhiều server, lấy cái nhanh nhất thành công
Promise.any([
  fetch("https://server1.com/api/data").then(r => r.json()),
  fetch("https://server2.com/api/data").then(r => r.json()),
  fetch("https://server3.com/api/data").then(r => r.json()),
])
  .then(data => console.log("Dữ liệu từ server nhanh nhất:", data))
  .catch(error => console.error("TẤT CẢ server đều lỗi!", error));
```

### So sánh 4 methods

| Method | Khi nào resolve? | Khi nào reject? | Use case |
|--------|-------------------|-----------------|----------|
| `Promise.all` | Tất cả thành công | 1 cái thất bại | Tải nhiều dữ liệu bắt buộc |
| `Promise.allSettled` | Tất cả hoàn tất | Không bao giờ reject | Tải dữ liệu, chấp nhận một số lỗi |
| `Promise.race` | Cái đầu tiên xong | Cái đầu tiên lỗi | Timeout, racing |
| `Promise.any` | Cái đầu tiên thành công | Tất cả thất bại | Thử nhiều nguồn, lấy nhanh nhất |

## Khi nào dùng Promise?

- Gọi API (fetch, axios)
- Đọc/ghi file (Node.js)
- Truy vấn database
- Bất cứ tác vụ nào mất thời gian và trả về kết quả
- Khi cần kết hợp nhiều tác vụ bất đồng bộ (Promise.all, Promise.race)

## Lỗi thường gặp

### Lỗi 1: Không bắt lỗi với .catch()

```javascript
// BAD: Không có .catch() → lỗi bị "nuốt" (swallowed)
fetch("/api/data")
  .then(response => response.json())
  .then(data => console.log(data));
// Nếu lỗi xảy ra → Unhandled Promise Rejection!

// GOOD: Luôn có .catch()
fetch("/api/data")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Có lỗi:", error));
```

### Lỗi 2: Tạo Promise không cần thiết

```javascript
// BAD: Bọc Promise trong Promise (anti-pattern)
function getData() {
  return new Promise((resolve, reject) => {
    fetch("/api/data")
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

// GOOD: fetch() ĐÃ TRẢ VỀ Promise, không cần bọc thêm
function getData() {
  return fetch("/api/data").then(response => response.json());
}
```

### Lỗi 3: Quên return trong .then() chain

```javascript
// BAD: Quên return → .then() tiếp theo nhận undefined
fetch("/api/users/1")
  .then(response => {
    response.json(); // Quên return!
  })
  .then(data => {
    console.log(data); // undefined!
  });

// GOOD: Return kết quả
fetch("/api/users/1")
  .then(response => {
    return response.json(); // Có return
  })
  .then(data => {
    console.log(data); // Dữ liệu đúng
  });
```

---

## Câu hỏi phỏng vấn

### Câu 1: Promise có 3 trạng thái nào? Giải thích từng trạng thái.

**Đáp án:**

1. **Pending (Đang chờ):** Trạng thái ban đầu khi Promise được tạo. Chưa có kết quả.
2. **Fulfilled (Thành công):** Tác vụ hoàn thành, `resolve(value)` được gọi. Trả về giá trị.
3. **Rejected (Thất bại):** Tác vụ lỗi, `reject(reason)` được gọi. Trả về lý do lỗi.

```javascript
// Pending → Fulfilled
const p1 = new Promise(resolve => {
  setTimeout(() => resolve("OK"), 1000);
});
// Lúc tạo: pending
// Sau 1s: fulfilled với giá trị "OK"

// Pending → Rejected
const p2 = new Promise((_, reject) => {
  setTimeout(() => reject(new Error("Lỗi!")), 1000);
});
// Lúc tạo: pending
// Sau 1s: rejected với Error("Lỗi!")
```

**Quan trọng:** Promise chỉ chuyển trạng thái **1 lần**. Đã fulfilled thì không thể rejected, và ngược lại.

### Câu 2: Promise.all và Promise.allSettled khác nhau như thế nào?

**Đáp án:**

```javascript
const p1 = Promise.resolve("A");
const p2 = Promise.reject("Lỗi B");
const p3 = Promise.resolve("C");

// Promise.all: DỪNG NGAY khi 1 cái reject
Promise.all([p1, p2, p3])
  .then(results => console.log(results))      // KHÔNG CHẠY
  .catch(error => console.log("Lỗi:", error)); // "Lỗi: Lỗi B"

// Promise.allSettled: Chờ TẤT CẢ xong, kể cả lỗi
Promise.allSettled([p1, p2, p3])
  .then(results => console.log(results));
// [
//   { status: "fulfilled", value: "A" },
//   { status: "rejected", reason: "Lỗi B" },
//   { status: "fulfilled", value: "C" }
// ]
```

**Dùng `Promise.all`** khi tất cả promise đều bắt buộc thành công.
**Dùng `Promise.allSettled`** khi muốn biết kết quả của từng promise, dù có lỗi.

### Câu 3: Cách xử lý lỗi trong Promise chain?

**Đáp án:**

**Cách 1:** `.catch()` ở cuối chuỗi — bắt mọi lỗi từ bất kỳ `.then()` nào:

```javascript
doStep1()
  .then(result => doStep2(result))
  .then(result => doStep3(result))
  .catch(error => {
    // Bắt lỗi từ doStep1, doStep2, HOẶC doStep3
    console.error("Lỗi ở một bước:", error);
  });
```

**Cách 2:** `.catch()` ở giữa chuỗi — xử lý lỗi và tiếp tục:

```javascript
doStep1()
  .then(result => doStep2(result))
  .catch(error => {
    console.warn("Step2 lỗi, dùng giá trị mặc định");
    return "giá trị mặc định"; // Tiếp tục chuỗi với giá trị này
  })
  .then(result => doStep3(result)); // Vẫn chạy với "giá trị mặc định"
```

### Câu 4: Promise.resolve() và new Promise(resolve => resolve()) khác gì nhau?

**Đáp án:**

Về kết quả: **giống nhau** — đều tạo Promise đã fulfilled.

```javascript
// Cách 1: Ngắn gọn
const p1 = Promise.resolve("Hello");

// Cách 2: Đầy đủ
const p2 = new Promise(resolve => resolve("Hello"));
```

**Khác biệt:** `Promise.resolve()` ngắn gọn hơn và là **shorthand**. Dùng khi bạn đã có giá trị và muốn bọc nó trong Promise.

### Câu 5: Viết hàm chạy tối đa 3 Promise cùng lúc (concurrency limit)?

**Đáp án:**

```javascript
async function runWithLimit(tasks, limit) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    // Tạo promise cho task hiện tại
    const promise = task().then(result => {
      // Khi xong, xóa khỏi danh sách đang chạy
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    // Nếu đạt giới hạn, chờ 1 cái xong mới tiếp
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// Sử dụng: Chạy 10 API nhưng tối đa 3 cái cùng lúc
const tasks = urls.map(url => () => fetch(url).then(r => r.json()));
const results = await runWithLimit(tasks, 3);
```
