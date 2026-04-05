---
sidebar_position: 4
title: "Promise, Async/Await & Error Handling"
---

# Promise, Async/Await & Error Handling

Xu ly bat dong bo la phan khong the thieu trong moi du an JavaScript. Interviewer muon biet ban khong chi dung duoc async/await ma con hieu ro lifecycle cua Promise, cac static methods, va cach xu ly loi dung cach.

---

## Cau 1: Promise states va lifecycle `[Intermediate]`

### Cau hoi

> Mot Promise co nhung trang thai nao? Mo ta lifecycle cua mot Promise.

### Giai thich ly thuyet

Mot Promise co **3 trang thai** va chi chuyen doi **mot chieu** (khong quay lai duoc):

```
                 resolve(value)
  Pending ────────────────────> Fulfilled
    │                              │
    │         reject(reason)       │
    └──────────────────────> Rejected
                                   │
                                   v
              Ca hai deu la "Settled" (da xac dinh)
```

| Trang thai | Mo ta | Chuyen tiep |
|---|---|---|
| **Pending** | Dang cho xu ly | Trang thai ban dau |
| **Fulfilled** | Thanh cong, co gia tri | Goi `.then(onFulfilled)` |
| **Rejected** | That bai, co ly do | Goi `.catch(onRejected)` hoac `.then(null, onRejected)` |

Mot khi **settled** (fulfilled hoac rejected), Promise **khong the** chuyen trang thai nua. Goi `resolve` hoac `reject` lan thu hai se bi **bo qua**.

### Code vi du

```javascript
// ===== Tao Promise co ban =====
const fetchUser = new Promise((resolve, reject) => {
  // Executor chay DONG BO ngay khi tao Promise
  console.log("Bat dau fetch...");

  setTimeout(() => {
    const success = Math.random() > 0.3;

    if (success) {
      resolve({ id: 1, name: "An" }); // -> Fulfilled
    } else {
      reject(new Error("Khong ket noi duoc server")); // -> Rejected
    }
  }, 1000);
});

// Su dung Promise
fetchUser
  .then((user) => {
    console.log("Thanh cong:", user.name);
  })
  .catch((error) => {
    console.log("That bai:", error.message);
  })
  .finally(() => {
    console.log("Hoan tat (du thanh cong hay that bai)");
  });

// ===== resolve/reject chi co hieu lan dau =====
const p = new Promise((resolve, reject) => {
  resolve("Gia tri 1");       // -> Fulfilled voi "Gia tri 1"
  resolve("Gia tri 2");       // BI BO QUA -- da settled roi
  reject(new Error("Loi"));   // BI BO QUA -- da settled roi
});

p.then(console.log); // "Gia tri 1"

// ===== Promise resolve voi mot Promise khac =====
const inner = new Promise((resolve) => {
  setTimeout(() => resolve("Tu inner"), 2000);
});

const outer = new Promise((resolve) => {
  resolve(inner); // outer "doi" inner resolve
});

outer.then((value) => {
  console.log(value); // "Tu inner" (sau 2 giay)
});
```

### Dap an mau

> "Promise co 3 trang thai: pending (dang cho), fulfilled (thanh cong voi gia tri), va rejected (that bai voi ly do). Lifecycle bat dau tu pending va chi chuyen sang fulfilled hoac rejected mot lan duy nhat -- khong the dao nguoc hoac chuyen tiep. Executor function chay dong bo ngay khi Promise duoc tao. Dac biet, resolve voi mot Promise khac se 'unwrap' no -- outer promise se doi inner promise settled."

---

## Cau 2: Promise chaining vs Async/Await `[Intermediate]`

### Cau hoi

> So sanh Promise chaining va async/await. Khi nao nen dung cai nao?

### Giai thich ly thuyet

Async/await la **syntactic sugar** tren Promise. Code tuong duong nhau, chi khac cu phap:

| Tieu chi | Promise Chaining | Async/Await |
|---|---|---|
| Cu phap | `.then().then().catch()` | `await`, `try/catch` |
| Doc code | Kho doc khi nhieu buoc | Doc nhu code dong bo |
| Error handling | `.catch()` cuoi chuoi | `try/catch` quen thuoc |
| Debug | Kho trace qua `.then` chain | Stack trace ro rang hon |
| Parallel | `Promise.all` | `Promise.all` + `await` |
| Conditional logic | Kho viet | De viet nhu binh thuong |

### Code vi du

```javascript
// ===== Promise chaining =====
function getUserOrdersChaining(userId) {
  return fetchUser(userId)
    .then((user) => {
      console.log(`Tim thay user: ${user.name}`);
      return fetchOrders(user.id);
    })
    .then((orders) => {
      console.log(`Co ${orders.length} don hang`);
      return fetchOrderDetails(orders[0].id);
    })
    .then((details) => {
      console.log("Chi tiet:", details);
      return details;
    })
    .catch((error) => {
      console.error("Loi:", error.message);
      throw error; // Re-throw neu muon caller xu ly
    });
}

// ===== Async/Await -- cung logic, de doc hon =====
async function getUserOrdersAsync(userId) {
  try {
    const user = await fetchUser(userId);
    console.log(`Tim thay user: ${user.name}`);

    const orders = await fetchOrders(user.id);
    console.log(`Co ${orders.length} don hang`);

    const details = await fetchOrderDetails(orders[0].id);
    console.log("Chi tiet:", details);

    return details;
  } catch (error) {
    console.error("Loi:", error.message);
    throw error;
  }
}

// ===== Conditional logic -- async/await vuot troi =====
// Voi Promise chaining:
function processPaymentChaining(order) {
  return checkInventory(order)
    .then((inStock) => {
      if (!inStock) {
        return notifyOutOfStock(order); // Nhanh 1
      }
      return processPayment(order) // Nhanh 2
        .then((payment) => {
          if (payment.requiresVerification) {
            return verifyPayment(payment); // Nhanh 2a
          }
          return payment; // Nhanh 2b
        });
    })
    .then((result) => sendConfirmation(result));
}

// Voi Async/Await:
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

// ===== SAI LAM PHO BIEN: await tuan tu khi co the chay song song =====
// CHAM:
async function fetchDataSlow() {
  const users = await fetchUsers();       // Doi 2s
  const products = await fetchProducts(); // Doi 2s (bat dau SAU users xong)
  return { users, products };             // Tong: 4s
}

// NHANH:
async function fetchDataFast() {
  const [users, products] = await Promise.all([
    fetchUsers(),   // Bat dau ngay
    fetchProducts() // Bat dau ngay
  ]);
  return { users, products }; // Tong: 2s (chay song song)
}
```

### Dap an mau

> "Async/await la syntactic sugar tren Promise, lam code doc nhu dong bo. Uu diem lon nhat la conditional logic va error handling de viet hon. Tuy nhien, can chu y khong await tuan tu khi cac task doc lap -- dung Promise.all de chay song song. Toi thuong dung async/await lam mac dinh va quay ve Promise chaining khi can xu ly phuc tap nhu race conditions."

---

## Cau 3: Promise.all, Promise.allSettled, Promise.race, Promise.any `[Senior]`

### Cau hoi

> Phan biet 4 static methods cua Promise: `all`, `allSettled`, `race`, `any`. Cho use case cu the cho moi cai.

### Giai thich ly thuyet

| Method | Resolve khi | Reject khi | Use case |
|---|---|---|---|
| `Promise.all` | **Tat ca** fulfilled | **Bat ky** rejected | Fetch nhieu API cung luc, can tat ca |
| `Promise.allSettled` | **Tat ca** settled | **Khong bao gio** reject | Thuc hien nhieu task, muon biet ket qua tung cai |
| `Promise.race` | **Dau tien** settled (fulfill/reject) | **Dau tien** settled (fulfill/reject) | Timeout, dung ket qua nhanh nhat |
| `Promise.any` | **Dau tien** fulfilled | **Tat ca** rejected (AggregateError) | Fallback servers, lay ket qua thanh cong dau tien |

### Code vi du

```javascript
const fast = new Promise((resolve) => setTimeout(() => resolve("Nhanh"), 100));
const slow = new Promise((resolve) => setTimeout(() => resolve("Cham"), 300));
const fail = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Loi")), 200)
);

// ===== Promise.all -- "Tat ca hoac khong gi" =====
// Use case: Fetch user profile + orders + notifications cung luc
async function loadDashboard(userId) {
  try {
    const [profile, orders, notifications] = await Promise.all([
      fetchProfile(userId),
      fetchOrders(userId),
      fetchNotifications(userId),
    ]);
    return { profile, orders, notifications };
  } catch (error) {
    // Neu BAT KY api nao loi -> catch ngay (fast-fail)
    console.error("Load dashboard that bai:", error);
    throw error;
  }
}

// ===== Promise.allSettled -- "Lam het, bao cao tung cai" =====
// Use case: Gui notification den nhieu nguoi, biet ai gui duoc ai khong
async function notifyAllUsers(userIds, message) {
  const results = await Promise.allSettled(
    userIds.map((id) => sendNotification(id, message))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  console.log(`Thanh cong: ${succeeded.length}, That bai: ${failed.length}`);

  // Xu ly cac truong hop that bai
  failed.forEach((r) => {
    console.error("Khong gui duoc:", r.reason.message);
  });

  return { succeeded: succeeded.length, failed: failed.length };
}

// ===== Promise.race -- "Ai nhanh hon" =====
// Use case: Timeout cho api call
function fetchWithTimeout(url, timeoutMs) {
  const fetchPromise = fetch(url).then((r) => r.json());

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

// Su dung
try {
  const data = await fetchWithTimeout("/api/data", 5000);
  console.log(data);
} catch (error) {
  console.log(error.message); // "Request timeout" neu qua 5s
}

// ===== Promise.any -- "Lay cai thanh cong dau tien" =====
// Use case: Thu nhieu CDN/server, lay response nhanh nhat
async function fetchFromFastestMirror(resource) {
  try {
    const data = await Promise.any([
      fetch(`https://cdn1.example.com/${resource}`),
      fetch(`https://cdn2.example.com/${resource}`),
      fetch(`https://cdn3.example.com/${resource}`),
    ]);
    return data;
  } catch (error) {
    // Chi reject khi TAT CA deu fail
    // error la AggregateError, chua mang errors
    console.error("Tat ca mirrors deu that bai:", error.errors);
    throw error;
  }
}
```

### Dap an mau

> "Promise.all reject ngay khi bat ky promise nao fail (fast-fail), phu hop khi can tat ca ket qua. Promise.allSettled doi tat ca settled va tra ve trang thai tung cai, phu hop khi muon biet ket qua cu the. Promise.race tra ve ket qua cua promise settle dau tien (ke ca reject), hay dung cho timeout pattern. Promise.any tra ve ket qua fulfilled dau tien, chi reject khi tat ca fail, phu hop cho fallback strategy."

---

## Cau 4: Error handling voi async/await va Promise `[Senior]`

### Cau hoi

> So sanh cac cach xu ly loi trong async code. Nhung sai lam pho bien nhat la gi?

### Giai thich ly thuyet

Co 3 cach chinh de xu ly loi trong async JavaScript:

1. **`.catch()`** tren Promise chain
2. **`try/catch`** voi async/await
3. **Global handlers** cho unhandled rejections

Nguyen tac vang: **Moi Promise phai co error handler**. Unhandled rejection se gay ra crash trong Node.js va warning trong browser.

### Code vi du

```javascript
// ===== Cach 1: .catch() voi Promise =====
fetchUser(1)
  .then((user) => fetchOrders(user.id))
  .then((orders) => processOrders(orders))
  .catch((error) => {
    // Bat LOI TU BAT KY buoc nao trong chuoi
    console.error("Pipeline that bai:", error.message);
  });

// ===== Cach 2: try/catch voi async/await =====
async function handleUserOrders(userId) {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    return await processOrders(orders);
  } catch (error) {
    // Bat loi tu bat ky await nao
    if (error instanceof NetworkError) {
      console.error("Loi mang:", error.message);
      return getCachedData(userId);
    }
    if (error instanceof ValidationError) {
      console.error("Du lieu khong hop le:", error.message);
      return null;
    }
    // Re-throw loi khong xu ly duoc
    throw error;
  }
}

// ===== SAI LAM 1: Quen catch =====
// BAD -- unhandled rejection!
async function bad1() {
  const data = await fetchData(); // Neu loi -> unhandled rejection
  return data;
}
bad1(); // Khong catch!

// GOOD
bad1().catch(console.error);

// ===== SAI LAM 2: try/catch khong bat duoc loi trong callback =====
async function bad2() {
  try {
    setTimeout(() => {
      throw new Error("Loi trong callback"); // try/catch KHONG bat duoc!
    }, 1000);
  } catch (error) {
    // Khong bao gio chay den day
    console.error(error);
  }
}

// ===== SAI LAM 3: Swallow error =====
async function bad3() {
  try {
    await riskyOperation();
  } catch (error) {
    // EMPTY CATCH -- "nuot" loi, khong ai biet co loi!
  }
}

// GOOD: Log hoac re-throw
async function good3() {
  try {
    await riskyOperation();
  } catch (error) {
    console.error("riskyOperation that bai:", error);
    throw error; // Hoac return default value co y nghia
  }
}

// ===== Error handling voi Promise.all =====
// Van de: Promise.all fail-fast, khong biet cac promise khac the nao
async function fetchMultiple(urls) {
  // Cach 1: Wrap tung promise de khong fail-fast
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

// Cach 2: Dung Promise.allSettled (don gian hon)
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
  event.preventDefault(); // Ngan default behavior
  // Gui len error tracking service (Sentry, etc.)
});

// Node.js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
  // Gui len error tracking service
});
```

### Dap an mau

> "Co 3 cach xu ly loi async: .catch() cho Promise chain, try/catch cho async/await, va global handler cho unhandled rejections. Sai lam pho bien nhat la: (1) quen catch Promise, (2) empty catch block 'nuot' loi, (3) try/catch khong bat duoc loi trong setTimeout/callback. Nguyen tac la moi Promise phai co error handler, va luon log hoac re-throw loi -- khong bao gio de catch block trong."

---

## Cau 5: Unhandled rejection va best practices `[Senior]`

### Cau hoi

> Unhandled rejection la gi? Lam sao de tranh no trong du an thuc te?

### Giai thich ly thuyet

**Unhandled rejection** xay ra khi mot Promise bi reject nhung khong co `.catch()` hoac `try/catch` nao xu ly.

Trong **Node.js 15+**, unhandled rejection mac dinh se **crash process** (exit code 1). Trong browser, no tao warning trong console.

### Code vi du

```javascript
// ===== Cac truong hop gay unhandled rejection =====

// 1. Promise khong co catch
Promise.reject(new Error("Ai se xu ly toi?"));

// 2. async function khong duoc catch
async function oops() {
  throw new Error("Loi!");
}
oops(); // Tra ve rejected promise, khong ai catch

// 3. Quen return trong .then chain
fetchUser(1)
  .then((user) => {
    fetchOrders(user.id); // QUEN return! -> Promise nay khong duoc chain
    // Neu fetchOrders reject -> unhandled rejection
  })
  .catch((error) => {
    // Chi catch loi tu fetchUser, KHONG catch loi tu fetchOrders
    console.error(error);
  });

// FIX: Luon return Promise trong .then
fetchUser(1)
  .then((user) => {
    return fetchOrders(user.id); // return de chain
  })
  .catch((error) => {
    // Bat ca loi tu fetchUser VA fetchOrders
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

// Su dung
const data = await safeExecute(
  () => fetchData("/api/users"),
  [] // Fallback la mang rong
);
```

### Dap an mau

> "Unhandled rejection xay ra khi Promise reject ma khong co handler. Node.js 15+ se crash process, nen day la van de nghiem trong. De tranh, toi ap dung: (1) luon catch top-level async calls, (2) luon return Promise trong .then chain, (3) dung global handler nhu safety net, (4) dung wrapper cho async route handlers. Quan trong nhat la treat moi rejected Promise nhu mot error can xu ly."

---

## Cau 6: Bang so sanh tong hop: Callback vs Promise vs Async/Await `[Intermediate]`

### Cau hoi

> So sanh 3 cach xu ly bat dong bo trong JavaScript: callback, Promise, async/await.

### Bang so sanh

| Tieu chi | Callback | Promise | Async/Await |
|---|---|---|---|
| Cu phap | `fn(arg, callback)` | `.then().catch()` | `await`, `try/catch` |
| Xu ly loi | Truyen error vao callback | `.catch()` | `try/catch` |
| Callback hell | Co | Giam (chaining) | Khong |
| Code doc | Kho doc khi nhieu tang | Kha doc | Rat de doc |
| Song song | Kho quan ly | `Promise.all` | `Promise.all` + `await` |
| Cancel | Thu cong | Thu cong (AbortController) | Thu cong (AbortController) |
| Debug | Stack trace mat | Stack trace kha | Stack trace tot |
| Xu ly 1 gia tri | Co | Co | Co |

### Code vi du

```javascript
// ===== Callback style (cu) =====
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

// ===== Async/Await style (khuyen dung) =====
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
const user = await getUserAsync(1); // Gio dung duoc async/await!

// Node.js co san util.promisify:
// const { promisify } = require('util');
// const readFileAsync = promisify(fs.readFile);
```

### Dap an mau

> "Callback la cach cu nhat, de gay 'callback hell' khi nhieu tac vu phu thuoc nhau. Promise giai quyet van de nay bang chaining va .catch() tap trung, nhung van co the kho doc voi conditional logic. Async/await la syntactic sugar tren Promise, lam code doc nhu dong bo, de debug va de viet conditional logic. Ngay nay, async/await la lua chon mac dinh, con callback chi dung voi cac API cu (event emitter, streams). Can biet promisify de convert callback sang Promise khi can."

---

## Loi thuong gap khi tra loi

| Loi | Giai thich dung |
|---|---|
| "await bien Promise thanh gia tri dong bo" | Sai -- `await` chi tam dung execution cua async function, **khong block** event loop. Code ben ngoai async function van chay binh thuong. |
| "Promise.all chay cac promise tuan tu" | Sai -- Promise.all nhan cac promise **da bat dau chay**. No chi doi tat ca settled, khong kiem soat thu tu chay. |
| "async function luon tra ve Promise" | Dung! Nhung nhieu nguoi quen -- ke ca khi return gia tri thuong, no van duoc wrap trong Promise.resolve(). |
| "try/catch bat duoc moi loi async" | Sai -- try/catch chi bat loi tu **await expression**. Loi trong setTimeout/callback ben trong khong bat duoc. |
| "Promise.race tra ve ket qua nhanh nhat" | Chua chinh xac -- no tra ve ket qua cua promise **settle** dau tien, ke ca **reject**. Muon lay fulfilled dau tien, dung `Promise.any`. |
| "Quen return trong .then la loi nho" | Khong -- no gay unhandled rejection, co the crash app trong Node.js. Luon return Promise trong .then chain. |
