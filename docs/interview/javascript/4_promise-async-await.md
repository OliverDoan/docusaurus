---
sidebar_position: 4
title: "Promise, Async/Await & Error Handling"
---

# Promise, Async/Await & Error Handling

Xử lý bất đồng bộ là phần không thể thiếu trong mọi dự án JavaScript. Interviewer muốn biết bạn không chỉ dùng được async/await mà còn hiểu rõ lifecycle của Promise, các static methods, và cách xử lý lỗi đúng cách.

---

## Câu 1: Promise states và lifecycle `[Intermediate]`

### Câu hỏi

> Một Promise có những trạng thái nào? Mô tả lifecycle của một Promise.

### Giải thích lý thuyết

Một Promise có **3 trạng thái** và chỉ chuyển đổi **một chiều** (không quay lại được):

```
                 resolve(value)
  Pending ────────────────────> Fulfilled
    │                              │
    │         reject(reason)       │
    └──────────────────────> Rejected
                                   │
                                   v
              Cả hai đều là "Settled" (đã xác định)
```

| Trạng thái | Mô tả | Chuyển tiếp |
|---|---|---|
| **Pending** | Đang chờ xử lý | Trạng thái ban đầu |
| **Fulfilled** | Thành công, có giá trị | Gọi `.then(onFulfilled)` |
| **Rejected** | Thất bại, có lý do | Gọi `.catch(onRejected)` hoặc `.then(null, onRejected)` |

Một khi **settled** (fulfilled hoặc rejected), Promise **không thể** chuyển trạng thái nữa. Gọi `resolve` hoặc `reject` lần thứ hai sẽ bị **bỏ qua**.

### Code ví dụ

```javascript
// ===== Tạo Promise cơ bản =====
const fetchUser = new Promise((resolve, reject) => {
  // Executor chạy ĐỒNG BỘ ngay khi tạo Promise
  console.log("Bắt đầu fetch...");

  setTimeout(() => {
    const success = Math.random() > 0.3;

    if (success) {
      resolve({ id: 1, name: "An" }); // -> Fulfilled
    } else {
      reject(new Error("Không kết nối được server")); // -> Rejected
    }
  }, 1000);
});

// Sử dụng Promise
fetchUser
  .then((user) => {
    console.log("Thành công:", user.name);
  })
  .catch((error) => {
    console.log("Thất bại:", error.message);
  })
  .finally(() => {
    console.log("Hoàn tất (dù thành công hay thất bại)");
  });

// ===== resolve/reject chỉ có hiệu lần đầu =====
const p = new Promise((resolve, reject) => {
  resolve("Giá trị 1");       // -> Fulfilled với "Giá trị 1"
  resolve("Giá trị 2");       // BỊ BỎ QUA -- đã settled rồi
  reject(new Error("Lỗi"));   // BỊ BỎ QUA -- đã settled rồi
});

p.then(console.log); // "Giá trị 1"

// ===== Promise resolve với một Promise khác =====
const inner = new Promise((resolve) => {
  setTimeout(() => resolve("Từ inner"), 2000);
});

const outer = new Promise((resolve) => {
  resolve(inner); // outer "đợi" inner resolve
});

outer.then((value) => {
  console.log(value); // "Từ inner" (sau 2 giây)
});
```

### Đáp án mẫu

> "Promise có 3 trạng thái: pending (đang chờ), fulfilled (thành công với giá trị), và rejected (thất bại với lý do). Lifecycle bắt đầu từ pending và chỉ chuyển sang fulfilled hoặc rejected một lần duy nhất -- không thể đảo ngược hoặc chuyển tiếp. Executor function chạy đồng bộ ngay khi Promise được tạo. Đặc biệt, resolve với một Promise khác sẽ 'unwrap' nó -- outer promise sẽ đợi inner promise settled."

---

## Câu 2: Promise chaining vs Async/Await `[Intermediate]`

### Câu hỏi

> So sánh Promise chaining và async/await. Khi nào nên dùng cái nào?

### Giải thích lý thuyết

Async/await là **syntactic sugar** trên Promise. Code tương đương nhau, chỉ khác cú pháp:

| Tiêu chí | Promise Chaining | Async/Await |
|---|---|---|
| Cú pháp | `.then().then().catch()` | `await`, `try/catch` |
| Đọc code | Khó đọc khi nhiều bước | Đọc như code đồng bộ |
| Error handling | `.catch()` cuối chuỗi | `try/catch` quen thuộc |
| Debug | Khó trace qua `.then` chain | Stack trace rõ ràng hơn |
| Parallel | `Promise.all` | `Promise.all` + `await` |
| Conditional logic | Khó viết | Dễ viết như bình thường |

### Code ví dụ

```javascript
// ===== Promise chaining =====
function getUserOrdersChaining(userId) {
  return fetchUser(userId)
    .then((user) => {
      console.log(`Tìm thấy user: ${user.name}`);
      return fetchOrders(user.id);
    })
    .then((orders) => {
      console.log(`Có ${orders.length} đơn hàng`);
      return fetchOrderDetails(orders[0].id);
    })
    .then((details) => {
      console.log("Chi tiết:", details);
      return details;
    })
    .catch((error) => {
      console.error("Lỗi:", error.message);
      throw error; // Re-throw nếu muốn caller xử lý
    });
}

// ===== Async/Await -- cùng logic, dễ đọc hơn =====
async function getUserOrdersAsync(userId) {
  try {
    const user = await fetchUser(userId);
    console.log(`Tìm thấy user: ${user.name}`);

    const orders = await fetchOrders(user.id);
    console.log(`Có ${orders.length} đơn hàng`);

    const details = await fetchOrderDetails(orders[0].id);
    console.log("Chi tiết:", details);

    return details;
  } catch (error) {
    console.error("Lỗi:", error.message);
    throw error;
  }
}

// ===== Conditional logic -- async/await vượt trội =====
// Với Promise chaining:
function processPaymentChaining(order) {
  return checkInventory(order)
    .then((inStock) => {
      if (!inStock) {
        return notifyOutOfStock(order); // Nhánh 1
      }
      return processPayment(order) // Nhánh 2
        .then((payment) => {
          if (payment.requiresVerification) {
            return verifyPayment(payment); // Nhánh 2a
          }
          return payment; // Nhánh 2b
        });
    })
    .then((result) => sendConfirmation(result));
}

// Với Async/Await:
async function processPaymentAsync(order) {
  const inStock = await checkInventory(order);

  if (!inStock) {
    const result = await notifyOutOfStock(order);
    return sendConfirmation(result);
  }

  const payment = await processPayment(order);

  if (payment.requiresVerification) {
    const verified = await verifyPayment(payment);
    return sendConfirmation(verified);
  }

  return sendConfirmation(payment);
}

// ===== SAI LẦM PHỔ BIẾN: await tuần tự khi có thể chạy song song =====
// CHẬM:
async function fetchDataSlow() {
  const users = await fetchUsers();       // Đợi 2s
  const products = await fetchProducts(); // Đợi 2s (bắt đầu SAU users xong)
  return { users, products };             // Tổng: 4s
}

// NHANH:
async function fetchDataFast() {
  const [users, products] = await Promise.all([
    fetchUsers(),   // Bắt đầu ngay
    fetchProducts() // Bắt đầu ngay
  ]);
  return { users, products }; // Tổng: 2s (chạy song song)
}
```

### Đáp án mẫu

> "Async/await là syntactic sugar trên Promise, làm code đọc như đồng bộ. Ưu điểm lớn nhất là conditional logic và error handling dễ viết hơn. Tuy nhiên, cần chú ý không await tuần tự khi các task độc lập -- dùng Promise.all để chạy song song. Tôi thường dùng async/await làm mặc định và quay về Promise chaining khi cần xử lý phức tạp như race conditions."

---

## Câu 3: Promise.all, Promise.allSettled, Promise.race, Promise.any `[Senior]`

### Câu hỏi

> Phân biệt 4 static methods của Promise: `all`, `allSettled`, `race`, `any`. Cho use case cụ thể cho mỗi cái.

### Giải thích lý thuyết

| Method | Resolve khi | Reject khi | Use case |
|---|---|---|---|
| `Promise.all` | **Tất cả** fulfilled | **Bất kỳ** rejected | Fetch nhiều API cùng lúc, cần tất cả |
| `Promise.allSettled` | **Tất cả** settled | **Không bao giờ** reject | Thực hiện nhiều task, muốn biết kết quả từng cái |
| `Promise.race` | **Đầu tiên** settled (fulfill/reject) | **Đầu tiên** settled (fulfill/reject) | Timeout, dùng kết quả nhanh nhất |
| `Promise.any` | **Đầu tiên** fulfilled | **Tất cả** rejected (AggregateError) | Fallback servers, lấy kết quả thành công đầu tiên |

### Code ví dụ

```javascript
const fast = new Promise((resolve) => setTimeout(() => resolve("Nhanh"), 100));
const slow = new Promise((resolve) => setTimeout(() => resolve("Chậm"), 300));
const fail = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Lỗi")), 200)
);

// ===== Promise.all -- "Tất cả hoặc không gì" =====
// Use case: Fetch user profile + orders + notifications cùng lúc
async function loadDashboard(userId) {
  try {
    const [profile, orders, notifications] = await Promise.all([
      fetchProfile(userId),
      fetchOrders(userId),
      fetchNotifications(userId),
    ]);
    return { profile, orders, notifications };
  } catch (error) {
    // Nếu BẤT KỲ api nào lỗi -> catch ngay (fast-fail)
    console.error("Load dashboard thất bại:", error);
    throw error;
  }
}

// ===== Promise.allSettled -- "Làm hết, báo cáo từng cái" =====
// Use case: Gửi notification đến nhiều người, biết ai gửi được ai không
async function notifyAllUsers(userIds, message) {
  const results = await Promise.allSettled(
    userIds.map((id) => sendNotification(id, message))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  console.log(`Thành công: ${succeeded.length}, Thất bại: ${failed.length}`);

  // Xử lý các trường hợp thất bại
  failed.forEach((r) => {
    console.error("Không gửi được:", r.reason.message);
  });

  return { succeeded: succeeded.length, failed: failed.length };
}

// ===== Promise.race -- "Ai nhanh hơn" =====
// Use case: Timeout cho api call
function fetchWithTimeout(url, timeoutMs) {
  const fetchPromise = fetch(url).then((r) => r.json());

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

// Sử dụng
try {
  const data = await fetchWithTimeout("/api/data", 5000);
  console.log(data);
} catch (error) {
  console.log(error.message); // "Request timeout" nếu quá 5s
}

// ===== Promise.any -- "Lấy cái thành công đầu tiên" =====
// Use case: Thử nhiều CDN/server, lấy response nhanh nhất
async function fetchFromFastestMirror(resource) {
  try {
    const data = await Promise.any([
      fetch(`https://cdn1.example.com/${resource}`),
      fetch(`https://cdn2.example.com/${resource}`),
      fetch(`https://cdn3.example.com/${resource}`),
    ]);
    return data;
  } catch (error) {
    // Chỉ reject khi TẤT CẢ đều fail
    // error là AggregateError, chứa mảng errors
    console.error("Tất cả mirrors đều thất bại:", error.errors);
    throw error;
  }
}
```

### Đáp án mẫu

> "Promise.all reject ngay khi bất kỳ promise nào fail (fast-fail), phù hợp khi cần tất cả kết quả. Promise.allSettled đợi tất cả settled và trả về trạng thái từng cái, phù hợp khi muốn biết kết quả cụ thể. Promise.race trả về kết quả của promise settle đầu tiên (kể cả reject), hay dùng cho timeout pattern. Promise.any trả về kết quả fulfilled đầu tiên, chỉ reject khi tất cả fail, phù hợp cho fallback strategy."

---

## Câu 4: Error handling với async/await và Promise `[Senior]`

### Câu hỏi

> So sánh các cách xử lý lỗi trong async code. Những sai lầm phổ biến nhất là gì?

### Giải thích lý thuyết

Có 3 cách chính để xử lý lỗi trong async JavaScript:

1. **`.catch()`** trên Promise chain
2. **`try/catch`** với async/await
3. **Global handlers** cho unhandled rejections

Nguyên tắc vàng: **Mỗi Promise phải có error handler**. Unhandled rejection sẽ gây ra crash trong Node.js và warning trong browser.

### Code ví dụ

```javascript
// ===== Cách 1: .catch() với Promise =====
fetchUser(1)
  .then((user) => fetchOrders(user.id))
  .then((orders) => processOrders(orders))
  .catch((error) => {
    // Bắt LỖI TỪ BẤT KỲ bước nào trong chuỗi
    console.error("Pipeline thất bại:", error.message);
  });

// ===== Cách 2: try/catch với async/await =====
async function handleUserOrders(userId) {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    return await processOrders(orders);
  } catch (error) {
    // Bắt lỗi từ bất kỳ await nào
    if (error instanceof NetworkError) {
      console.error("Lỗi mạng:", error.message);
      return getCachedData(userId);
    }
    if (error instanceof ValidationError) {
      console.error("Dữ liệu không hợp lệ:", error.message);
      return null;
    }
    // Re-throw lỗi không xử lý được
    throw error;
  }
}

// ===== SAI LẦM 1: Quên catch =====
// BAD -- unhandled rejection!
async function bad1() {
  const data = await fetchData(); // Nếu lỗi -> unhandled rejection
  return data;
}
bad1(); // Không catch!

// GOOD
bad1().catch(console.error);

// ===== SAI LẦM 2: try/catch không bắt được lỗi trong callback =====
async function bad2() {
  try {
    setTimeout(() => {
      throw new Error("Lỗi trong callback"); // try/catch KHÔNG bắt được!
    }, 1000);
  } catch (error) {
    // Không bao giờ chạy đến đây
    console.error(error);
  }
}

// ===== SAI LẦM 3: Swallow error =====
async function bad3() {
  try {
    await riskyOperation();
  } catch (error) {
    // EMPTY CATCH -- "nuốt" lỗi, không ai biết có lỗi!
  }
}

// GOOD: Log hoặc re-throw
async function good3() {
  try {
    await riskyOperation();
  } catch (error) {
    console.error("riskyOperation thất bại:", error);
    throw error; // Hoặc return default value có ý nghĩa
  }
}

// ===== Error handling với Promise.all =====
// Vấn đề: Promise.all fail-fast, không biết các promise khác thế nào
async function fetchMultiple(urls) {
  // Cách 1: Wrap từng promise để không fail-fast
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        return { url, data: await response.json(), error: null };
      } catch (error) {
        return { url, data: null, error: error.message };
      }
    })
  );

  const successes = results.filter((r) => r.error === null);
  const failures = results.filter((r) => r.error !== null);

  return { successes, failures };
}

// Cách 2: Dùng Promise.allSettled (đơn giản hơn)
async function fetchMultipleV2(urls) {
  const results = await Promise.allSettled(
    urls.map((url) => fetch(url).then((r) => r.json()))
  );
  return results;
}

// ===== Global unhandled rejection handler =====
// Browser
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
  event.preventDefault(); // Ngăn default behavior
  // Gửi lên error tracking service (Sentry, etc.)
});

// Node.js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  // Gửi lên error tracking service
});
```

### Đáp án mẫu

> "Có 3 cách xử lý lỗi async: .catch() cho Promise chain, try/catch cho async/await, và global handler cho unhandled rejections. Sai lầm phổ biến nhất là: (1) quên catch Promise, (2) empty catch block 'nuốt' lỗi, (3) try/catch không bắt được lỗi trong setTimeout/callback. Nguyên tắc là mỗi Promise phải có error handler, và luôn log hoặc re-throw lỗi -- không bao giờ để catch block trống."

---

## Câu 5: Unhandled rejection và best practices `[Senior]`

### Câu hỏi

> Unhandled rejection là gì? Làm sao để tránh nó trong dự án thực tế?

### Giải thích lý thuyết

**Unhandled rejection** xảy ra khi một Promise bị reject nhưng không có `.catch()` hoặc `try/catch` nào xử lý.

Trong **Node.js 15+**, unhandled rejection mặc định sẽ **crash process** (exit code 1). Trong browser, nó tạo warning trong console.

### Code ví dụ

```javascript
// ===== Các trường hợp gây unhandled rejection =====

// 1. Promise không có catch
Promise.reject(new Error("Ai sẽ xử lý tôi?"));

// 2. async function không được catch
async function oops() {
  throw new Error("Lỗi!");
}
oops(); // Trả về rejected promise, không ai catch

// 3. Quên return trong .then chain
fetchUser(1)
  .then((user) => {
    fetchOrders(user.id); // QUÊN return! -> Promise này không được chain
    // Nếu fetchOrders reject -> unhandled rejection
  })
  .catch((error) => {
    // Chỉ catch lỗi từ fetchUser, KHÔNG catch lỗi từ fetchOrders
    console.error(error);
  });

// FIX: Luôn return Promise trong .then
fetchUser(1)
  .then((user) => {
    return fetchOrders(user.id); // return để chain
  })
  .catch((error) => {
    // Bắt cả lỗi từ fetchUser VÀ fetchOrders
    console.error(error);
  });

// ===== Best Practices =====

// 1. Wrapper function cho async route handlers (Express)
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// app.get('/users', asyncHandler(async (req, res) => {
//   const users = await fetchUsers();
//   res.json(users);
// }));

// 2. Always catch top-level async calls
async function main() {
  const result = await doWork();
  return result;
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// 3. Utility: safe async execution
async function safeExecute(asyncFn, fallback = null) {
  try {
    return await asyncFn();
  } catch (error) {
    console.error(`Error in ${asyncFn.name}:`, error);
    return fallback;
  }
}

// Sử dụng
const data = await safeExecute(
  () => fetchData("/api/users"),
  [] // Fallback là mảng rỗng
);
```

### Đáp án mẫu

> "Unhandled rejection xảy ra khi Promise reject mà không có handler. Node.js 15+ sẽ crash process, nên đây là vấn đề nghiêm trọng. Để tránh, tôi áp dụng: (1) luôn catch top-level async calls, (2) luôn return Promise trong .then chain, (3) dùng global handler như safety net, (4) dùng wrapper cho async route handlers. Quan trọng nhất là treat mỗi rejected Promise như một error cần xử lý."

---

## Câu 6: Bảng so sánh tổng hợp: Callback vs Promise vs Async/Await `[Intermediate]`

### Câu hỏi

> So sánh 3 cách xử lý bất đồng bộ trong JavaScript: callback, Promise, async/await.

### Bảng so sánh

| Tiêu chí | Callback | Promise | Async/Await |
|---|---|---|---|
| Cú pháp | `fn(arg, callback)` | `.then().catch()` | `await`, `try/catch` |
| Xử lý lỗi | Truyền error vào callback | `.catch()` | `try/catch` |
| Callback hell | Có | Giảm (chaining) | Không |
| Code đọc | Khó đọc khi nhiều tầng | Khá đọc | Rất dễ đọc |
| Song song | Khó quản lý | `Promise.all` | `Promise.all` + `await` |
| Cancel | Thủ công | Thủ công (AbortController) | Thủ công (AbortController) |
| Debug | Stack trace mất | Stack trace khá | Stack trace tốt |
| Xử lý 1 giá trị | Có | Có | Có |

### Code ví dụ

```javascript
// ===== Callback style (cũ) =====
function getUserCallbackStyle(id, callback) {
  setTimeout(() => {
    const user = { id, name: "An" };
    callback(null, user); // Convention: error-first callback
  }, 100);
}

getUserCallbackStyle(1, (error, user) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log(user);
});

// Callback hell:
getUser(1, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return handleError(err);
      processPayment(details, (err, result) => {
        if (err) return handleError(err);
        sendConfirmation(result, (err, confirmation) => {
          // 5 level nesting... "Pyramid of doom"
        });
      });
    });
  });
});

// ===== Promise style =====
function getUserPromise(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id, name: "An" });
    }, 100);
  });
}

getUserPromise(1)
  .then((user) => getOrders(user.id))
  .then((orders) => getOrderDetails(orders[0].id))
  .then((details) => processPayment(details))
  .then((result) => sendConfirmation(result))
  .catch(handleError);

// ===== Async/Await style (khuyến dùng) =====
async function processUserOrder(userId) {
  try {
    const user = await getUserPromise(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    const result = await processPayment(details);
    const confirmation = await sendConfirmation(result);
    return confirmation;
  } catch (error) {
    handleError(error);
  }
}

// ===== Convert callback sang Promise (promisify) =====
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  };
}

const getUserAsync = promisify(getUserCallbackStyle);
const user = await getUserAsync(1); // Giờ dùng được async/await!

// Node.js có sẵn util.promisify:
// const { promisify } = require('util');
// const readFileAsync = promisify(fs.readFile);
```

### Đáp án mẫu

> "Callback là cách cũ nhất, dễ gây 'callback hell' khi nhiều tác vụ phụ thuộc nhau. Promise giải quyết vấn đề này bằng chaining và .catch() tập trung, nhưng vẫn có thể khó đọc với conditional logic. Async/await là syntactic sugar trên Promise, làm code đọc như đồng bộ, dễ debug và dễ viết conditional logic. Ngày nay, async/await là lựa chọn mặc định, còn callback chỉ dùng với các API cũ (event emitter, streams). Cần biết promisify để convert callback sang Promise khi cần."

---

## Lỗi thường gặp khi trả lời

| Lỗi | Giải thích đúng |
|---|---|
| "await biến Promise thành giá trị đồng bộ" | Sai -- `await` chỉ tạm dừng execution của async function, **không block** event loop. Code bên ngoài async function vẫn chạy bình thường. |
| "Promise.all chạy các promise tuần tự" | Sai -- Promise.all nhận các promise **đã bắt đầu chạy**. Nó chỉ đợi tất cả settled, không kiểm soát thứ tự chạy. |
| "async function luôn trả về Promise" | Đúng! Nhưng nhiều người quên -- kể cả khi return giá trị thường, nó vẫn được wrap trong Promise.resolve(). |
| "try/catch bắt được mọi lỗi async" | Sai -- try/catch chỉ bắt lỗi từ **await expression**. Lỗi trong setTimeout/callback bên trong không bắt được. |
| "Promise.race trả về kết quả nhanh nhất" | Chưa chính xác -- nó trả về kết quả của promise **settle** đầu tiên, kể cả **reject**. Muốn lấy fulfilled đầu tiên, dùng `Promise.any`. |
| "Quên return trong .then là lỗi nhỏ" | Không -- nó gây unhandled rejection, có thể crash app trong Node.js. Luôn return Promise trong .then chain. |
