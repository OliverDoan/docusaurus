---
sidebar_position: 3
title: "3. Async/Await"
---

# Async/Await


---

## Mục lục

- [Async/Await là gì?](#asyncawait-là-gì)
- [Tại sao Async/Await ra đời?](#tại-sao-asyncawait-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [So sánh: Callback vs Promise vs Async/Await](#so-sánh-callback-vs-promise-vs-asyncawait)
- [Khi nào dùng Async/Await?](#khi-nào-dùng-asyncawait)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Async/Await là gì?

**Async/Await** là cú pháp giúp viết code bất đồng bộ **trông giống như code đồng bộ** — dễ đọc, dễ hiểu, dễ debug.

> **Ví dụ thực tế:** Bạn gọi món ăn tại nhà hàng:
> - **Promise (.then):** "Khi đồ ăn xong, HÃY mang ra. Khi mang ra, HÃY tính tiền." → Phải nói trước tất cả bước.
> - **Async/Await:** "CHỜ đồ ăn xong → mang ra → CHỜ tính tiền → trả tiền." → Tự nhiên như nói chuyện bình thường.

```javascript
// Promise chain — đọc từ dưới lên, khó theo dõi
getUser(1)
  .then(user => getOrders(user.id))
  .then(orders => getDetails(orders[0].id))
  .then(details => console.log(details))
  .catch(error => console.error(error));

// Async/Await — đọc từ trên xuống, như code đồng bộ
async function showDetails() {
  try {
    const user = await getUser(1);
    const orders = await getOrders(user.id);
    const details = await getDetails(orders[0].id);
    console.log(details);
  } catch (error) {
    console.error(error);
  }
}
```

## Tại sao Async/Await ra đời?

### Quá trình tiến hóa xử lý bất đồng bộ

```
2010                    2015 (ES6)              2017 (ES2017)
┌──────────┐           ┌──────────┐           ┌──────────┐
│ Callback  │    →      │ Promise  │    →      │  Async   │
│ (địa ngục │           │ (.then   │           │  Await   │
│  callback)│           │  chain)  │           │ (tuyệt!) │
└──────────┘           └──────────┘           └──────────┘
```

**Callback (2010):** Lồng nhau → khó đọc

```javascript
// Callback Hell
login(user, password, function(token) {
  getProfile(token, function(profile) {
    getSettings(profile.id, function(settings) {
      // Ngày càng lồng sâu...
    });
  });
});
```

**Promise (ES6 — 2015):** Phẳng hơn, nhưng vẫn có nhiều `.then()`

```javascript
// Promise chain
login(user, password)
  .then(token => getProfile(token))
  .then(profile => getSettings(profile.id))
  .then(settings => console.log(settings))
  .catch(error => console.error(error));
```

**Async/Await (ES2017):** Đọc như code đồng bộ, dễ hiểu nhất

```javascript
// Async/Await — tuyệt vời!
async function loadSettings() {
  const token = await login(user, password);
  const profile = await getProfile(token);
  const settings = await getSettings(profile.id);
  console.log(settings);
}
```

## Cách sử dụng

### async function — Luôn trả về Promise

Khi đặt `async` trước một function, nó **luôn luôn trả về Promise**:

```javascript
// async function LUÔN trả về Promise
async function chaoHoi() {
  return "Xin chào!";
}

// Tương đương với:
function chaoHoi() {
  return Promise.resolve("Xin chào!");
}

// Nên phải dùng .then() hoặc await để lấy giá trị
chaoHoi().then(message => console.log(message)); // "Xin chào!"
```

### await — Tạm dừng chờ Promise resolve

`await` chỉ dùng được **bên trong async function**. Nó tạm dừng execution cho đến khi Promise resolve:

```javascript
async function layDuLieu() {
  console.log("Bắt đầu tải...");

  // await TẠM DỪNG ở đây cho đến khi fetch xong
  const response = await fetch("https://api.example.com/users");

  // Chỉ chạy SAU KHI fetch hoàn tất
  const users = await response.json();

  console.log("Số lượng users:", users.length);
  return users;
}
```

**Quan trọng:** `await` chỉ tạm dừng **bên trong async function**, **KHÔNG** block toàn bộ chương trình:

```javascript
async function demo() {
  const data = await fetch("/api/data"); // Tạm dừng HÀM NÀY
}

demo();
console.log("Dòng này chạy NGAY, không chờ demo() xong!");
```

### Error Handling với try/catch

```javascript
// GOOD: Dùng try/catch — giống xử lý lỗi code đồng bộ
async function layThongTinUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);

    // Kiểm tra HTTP status
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const user = await response.json();
    console.log("User:", user.name);
    return user;

  } catch (error) {
    console.error("Không thể tải user:", error.message);
    return null; // Trả về giá trị mặc định
  } finally {
    console.log("Đã hoàn tất xử lý"); // Luôn chạy
  }
}
```

### Chạy song song với Promise.all

```javascript
// BAD: Chạy tuần tự — CHẬM (tổng 6 giây)
async function tuanTu() {
  const users = await fetch("/api/users").then(r => r.json());     // 2 giây
  const products = await fetch("/api/products").then(r => r.json()); // 2 giây
  const orders = await fetch("/api/orders").then(r => r.json());     // 2 giây
  // Tổng: 2 + 2 + 2 = 6 giây (chờ từng cái)
}

// GOOD: Chạy song song — NHANH (chỉ 2 giây)
async function songSong() {
  const [users, products, orders] = await Promise.all([
    fetch("/api/users").then(r => r.json()),     // 2 giây ┐
    fetch("/api/products").then(r => r.json()), // 2 giây ├─ Chạy đồng thời
    fetch("/api/orders").then(r => r.json()),   // 2 giây ┘
  ]);
  // Tổng: max(2, 2, 2) = 2 giây (chạy cùng lúc!)
}
```

**Quy tắc:** Nếu các tác vụ **không phụ thuộc nhau**, dùng `Promise.all` để chạy song song.

### Await trong vòng lặp

```javascript
// BAD: await trong for loop — chạy tuần tự, chậm
async function tuanTu(userIds) {
  const users = [];
  for (const id of userIds) {
    const user = await getUser(id); // Chờ từng cái, từng cái một
    users.push(user);
  }
  return users; // 10 users × 1 giây = 10 giây!
}

// GOOD: Promise.all — chạy song song
async function songSong(userIds) {
  const users = await Promise.all(
    userIds.map(id => getUser(id)) // Gửi tất cả request cùng lúc
  );
  return users; // 10 users, chỉ mất 1 giây!
}
```

## So sánh: Callback vs Promise vs Async/Await

| Tiêu chí | Callback | Promise | Async/Await |
|----------|----------|---------|-------------|
| Năm ra đời | Đầu | ES6 (2015) | ES2017 |
| Cú pháp | Lồng nhau | .then() chain | Giống đồng bộ |
| Xử lý lỗi | Truyền error vào callback | .catch() | try/catch |
| Dễ đọc | Khó (callback hell) | Trung bình | Dễ nhất |
| Debug | Khó | Trung bình | Dễ (breakpoint bình thường) |
| Chuỗi bất đồng bộ | Rất khó | Tốt | Tuyệt vời |

## Khi nào dùng Async/Await?

- **Hầu hết mọi trường hợp** — ưu tiên async/await hơn .then()
- Khi cần xử lý **nhiều bước bất đồng bộ liên tiếp**
- Khi cần **try/catch** để xử lý lỗi (quen thuộc hơn .catch())
- Khi code cần **dễ đọc và bảo trì**

**Khi nào vẫn dùng .then()?**
- Xử lý bất đồng bộ đơn giản, 1 bước
- Trong callback của event listener (không thể dùng async)
- Khi cần nối chuỗi ngắn gọn

## Lỗi thường gặp

### Lỗi 1: Dùng await bên ngoài async function

```javascript
// BAD: await không ở trong async function
const data = await fetch("/api/data"); // SyntaxError!

// GOOD: Bọc trong async function
async function getData() {
  const data = await fetch("/api/data");
  return data.json();
}

// GOOD: Top-level await (chỉ trong ES Modules)
// Trong file .mjs hoặc <script type="module">
const data = await fetch("/api/data");
```

### Lỗi 2: Quên xử lý lỗi

```javascript
// BAD: Không try/catch — lỗi sẽ trở thành Unhandled Promise Rejection
async function getData() {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

// GOOD: Luôn có try/catch
async function getData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    return null;
  }
}
```

### Lỗi 3: await từng cái khi có thể chạy song song

```javascript
// BAD: Tuần tự — mất 3 giây (1+1+1)
async function loadPage() {
  const header = await fetchHeader();   // 1 giây
  const sidebar = await fetchSidebar(); // 1 giây
  const content = await fetchContent(); // 1 giây
}

// GOOD: Song song — chỉ mất 1 giây
async function loadPage() {
  const [header, sidebar, content] = await Promise.all([
    fetchHeader(),   // ┐
    fetchSidebar(),  // ├─ 1 giây (cùng lúc)
    fetchContent(),  // ┘
  ]);
}
```

### Lỗi 4: Trả về await không cần thiết

```javascript
// KHÔNG CẦN: return await (thừa await)
async function getData() {
  return await fetch("/api/data").then(r => r.json());
}

// GOOD: Chỉ cần return (async function tự động bọc Promise)
async function getData() {
  return fetch("/api/data").then(r => r.json());
}

// NGOẠI TRỪ: Trong try/catch (cần await để bắt lỗi)
async function getData() {
  try {
    return await fetch("/api/data").then(r => r.json());
    //     ^^^^^ Cần thiết để catch bắt được lỗi!
  } catch (error) {
    console.error("Lỗi:", error);
    return null;
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Async/Await khác gì .then()? Khi nào dùng cái nào?

**Đáp án:**

**Async/Await** là **syntactic sugar** trên Promise — bên dưới vẫn là Promise, nhưng cú pháp dễ đọc hơn.

```javascript
// .then() — callback style
function getUser() {
  return fetch("/api/user")
    .then(r => r.json())
    .then(user => {
      console.log(user);
      return user;
    });
}

// async/await — giống đồng bộ
async function getUser() {
  const r = await fetch("/api/user");
  const user = await r.json();
  console.log(user);
  return user;
}
```

**Dùng async/await khi:** Nhiều bước bất đồng bộ, logic phức tạp, cần try/catch.
**Dùng .then() khi:** Xử lý đơn giản, 1-2 bước, hoặc trong context không hỗ trợ async.

### Câu 2: Làm sao chạy nhiều async operations song song?

**Đáp án:**

Dùng `Promise.all()` để chạy song song, rồi `await` kết quả:

```javascript
// Song song — nhanh
async function loadDashboard() {
  const [users, stats, notifications] = await Promise.all([
    fetchUsers(),
    fetchStats(),
    fetchNotifications(),
  ]);
  return { users, stats, notifications };
}
```

Nếu muốn xử lý lỗi từng cái riêng biệt, dùng `Promise.allSettled()`:

```javascript
async function loadDashboard() {
  const results = await Promise.allSettled([
    fetchUsers(),
    fetchStats(),
    fetchNotifications(),
  ]);

  const [users, stats, notifications] = results.map(r =>
    r.status === "fulfilled" ? r.value : null
  );
}
```

### Câu 3: Có thể dùng await bên ngoài async function không?

**Đáp án:**

- **Trong script thường (.js):** KHÔNG — phải bọc trong async function
- **Trong ES Module (.mjs hoặc type="module"):** CÓ — gọi là **top-level await** (ES2022)

```html
<!-- Trong module: được phép -->
<script type="module">
  const response = await fetch("/api/data");
  const data = await response.json();
  console.log(data);
</script>

<!-- Trong script thường: LỖI -->
<script>
  // SyntaxError: await is only valid in async functions
  const data = await fetch("/api/data");
</script>
```

**Workaround** cho script thường: Dùng IIFE (Immediately Invoked Function Expression):

```javascript
(async () => {
  const data = await fetch("/api/data").then(r => r.json());
  console.log(data);
})();
```

### Câu 4: forEach có hoạt động với async/await không?

**Đáp án:**

**KHÔNG!** `forEach` không chờ `await`. Nó gọi callback nhưng **không đợi** callback xong:

```javascript
// BAD: forEach KHÔNG chờ await
const ids = [1, 2, 3];
ids.forEach(async (id) => {
  const user = await getUser(id); // forEach KHÔNG đợi dòng này!
  console.log(user);
});
console.log("Xong"); // Chạy TRƯỚC khi các getUser hoàn tất!

// GOOD: Dùng for...of (tuần tự)
for (const id of ids) {
  const user = await getUser(id); // Chờ từng cái
  console.log(user);
}

// GOOD: Dùng Promise.all + map (song song)
const users = await Promise.all(
  ids.map(id => getUser(id))
);
console.log(users);
```

### Câu 5: Giải thích output của đoạn code sau:

```javascript
async function test() {
  console.log("1");
  const result = await Promise.resolve("2");
  console.log(result);
  console.log("3");
}

console.log("A");
test();
console.log("B");
```

**Đáp án:**

```
A
1
B
2
3
```

**Giải thích từng bước:**
1. `console.log("A")` → in **A** (đồng bộ)
2. Gọi `test()`:
   - `console.log("1")` → in **1** (đồng bộ, bên trong async function vẫn đồng bộ cho đến khi gặp await)
   - `await Promise.resolve("2")` → tạm dừng hàm `test()`, trả quyền về caller
3. `console.log("B")` → in **B** (đồng bộ, tiếp tục sau khi test() bị tạm dừng)
4. Event Loop: Microtask của await xong → tiếp tục `test()`:
   - `console.log(result)` → in **2**
   - `console.log("3")` → in **3**
