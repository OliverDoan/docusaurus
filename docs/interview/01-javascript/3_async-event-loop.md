---
sidebar_position: 3
title: "3. Async, Promise & Event Loop"
---

# Async, Promise & Event Loop

> *Đây là phần mà rất nhiều dev "code 3 năm" vẫn trả lời sai. Hiểu sai event loop = viết code race condition mà không biết.*

---

## Câu 1: Output của đoạn code này theo thứ tự nào? `[Intermediate]`

### Câu hỏi

> ```javascript
> console.log("1");
> setTimeout(() => console.log("2"), 0);
> Promise.resolve().then(() => console.log("3"));
> console.log("4");
> ```
>
> Giải thích lý do.

### Giải thích lý thuyết

JavaScript là single-threaded. Event loop có thứ tự ưu tiên:

```
[Call Stack hết] → [Microtask Queue rỗng?] → [Render?] → [1 Macrotask]
                          ↑__________________________________________|
```

- **Microtask**: `Promise.then`, `queueMicrotask`, `MutationObserver`.
- **Macrotask**: `setTimeout`, `setInterval`, I/O callbacks, `setImmediate` (Node).

**Mọi microtask được drain xong trước khi chạy macrotask tiếp theo.**

### Code minh hoạ

```javascript
console.log("1");                                 // sync → run ngay
setTimeout(() => console.log("2"), 0);            // macrotask
Promise.resolve().then(() => console.log("3"));   // microtask
console.log("4");                                 // sync

// Output: 1, 4, 3, 2

// Phức tạp hơn
async function example() {
  console.log("A");
  await Promise.resolve();
  console.log("B");          // microtask sau await
}
console.log("Start");
example();
console.log("End");
// Output: Start, A, End, B  (B chạy như microtask, sau khi sync xong)
```

### Đáp án mẫu

> "Output: `1, 4, 3, 2`. Vì `console.log('1')` và `console.log('4')` là synchronous nên chạy trước. `Promise.resolve().then` đẩy callback vào **microtask queue**, `setTimeout` đẩy vào **macrotask queue**. Sau khi call stack rỗng, event loop drain toàn bộ microtask queue trước (in '3'), rồi mới lấy 1 macrotask để chạy (in '2'). Đây là lý do `Promise.then` luôn chạy trước `setTimeout(fn, 0)`."

---

## Câu 2: Promise — các trạng thái và cách `then`/`catch`/`finally` hoạt động `[Intermediate]`

### Câu hỏi

> Promise có những state nào? Đoạn này log gì?
>
> ```javascript
> Promise.resolve(1)
>   .then((v) => v + 1)
>   .then(() => { throw new Error("boom"); })
>   .then((v) => console.log("ok", v))
>   .catch((e) => console.log("err", e.message))
>   .finally(() => console.log("done"));
> ```

### Giải thích lý thuyết

Promise có 3 state, **chỉ chuyển 1 lần và không quay lại**:

- `pending` → ban đầu.
- `fulfilled` → resolve với value.
- `rejected` → reject với reason.

Quy tắc chain:

- `then(onFul, onRej)` luôn trả về Promise mới.
- Throw trong handler → next `.catch` bắt.
- Return value trong `.catch` → next chain trở lại fulfilled.
- `.finally` không nhận value, không thay đổi resolved value.

### Code minh hoạ

```javascript
Promise.resolve(1)
  .then((v) => v + 1)                          // fulfilled 2
  .then(() => { throw new Error("boom"); })    // rejected "boom"
  .then((v) => console.log("ok", v))           // SKIP — đang rejected
  .catch((e) => console.log("err", e.message)) // log "err boom", recover → fulfilled undefined
  .finally(() => console.log("done"));         // log "done", pass through

// Output: err boom, done

// .catch không "ăn" được rejection của chính handler trên cùng chain
Promise.reject("X").then(
  null,
  (err) => { throw new Error("from handler"); } // unhandled — không có catch sau
);

// Đúng: tách catch ra cuối
Promise.reject("X")
  .then(null, (err) => { throw new Error("from handler"); })
  .catch((e) => console.log("caught", e.message)); // "caught from handler"
```

### Đáp án mẫu

> "3 state: pending, fulfilled, rejected — chuyển 1 chiều và 1 lần. Mỗi `.then`/`.catch`/`.finally` trả về Promise mới. Trong đoạn trên: bắt đầu resolve 1, `.then` đầu trả 2, `.then` thứ hai throw → bỏ qua `.then` 'ok' và rơi vào `.catch` (in 'err boom'). `.catch` return undefined → chain trở lại fulfilled. `.finally` chạy, in 'done'. Output: `err boom`, `done`."

---

## Câu 3: `Promise.all` vs `allSettled` vs `race` vs `any` — khi nào dùng? `[Intermediate]`

### Câu hỏi

> Em đang fetch dữ liệu cho dashboard từ 5 API endpoint. Em chọn `Promise.all`, `allSettled`, `race`, hay `any`? Lý do?

### Giải thích lý thuyết

| Method        | Kết quả                                                                  | Khi nào dùng                                                  |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `all`         | Resolve khi tất cả thành công; reject ngay khi 1 promise reject          | Cần TẤT CẢ thành công (transaction logic)                     |
| `allSettled`  | Resolve khi tất cả settle, trả mảng `{status, value/reason}`             | Cần biết kết quả tất cả, partial failure OK (dashboard widgets) |
| `race`        | Settle theo promise đầu tiên (fulfilled HAY rejected)                    | Timeout pattern, fastest-wins                                  |
| `any`         | Resolve theo promise fulfilled đầu tiên; reject chỉ khi tất cả reject    | Có nhiều mirror, lấy mirror nào response trước                |

### Code minh hoạ

```javascript
// all: cần tất cả thành công
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
]);
// Nếu fetchPosts fail → toàn bộ throw, mất luôn user và comments

// allSettled: dashboard widgets độc lập
const results = await Promise.allSettled([
  fetchRevenue(),
  fetchUsers(),
  fetchOrders(),
]);
results.forEach((r, i) => {
  if (r.status === "fulfilled") renderWidget(i, r.value);
  else                          renderWidgetError(i, r.reason);
});

// race: timeout pattern
const fetchWithTimeout = (url, ms) =>
  Promise.race([
    fetch(url),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);

// any: nhiều CDN mirror
const data = await Promise.any([
  fetch("https://cdn1.example.com/data.json"),
  fetch("https://cdn2.example.com/data.json"),
  fetch("https://cdn3.example.com/data.json"),
]);
// Lấy mirror đầu tiên thành công
```

### Đáp án mẫu

> "Cho dashboard, em chọn `allSettled` — vì các widget độc lập, nếu một API fail thì các widget khác vẫn nên render được thay vì cả dashboard trống. `Promise.all` chỉ phù hợp khi các call phụ thuộc nhau hoặc cần atomicity (ví dụ data check trước transaction). `race` dùng cho timeout pattern, và `any` dùng khi có nhiều mirror cần lấy cái nhanh nhất. Em từng dùng `all` cho dashboard và bị bug — chỉ cần 1 endpoint chậm/lỗi là cả trang trắng, rất tệ về UX."

---

## Câu 4: `async/await` là sugar của Promise — true hay false? Có pitfall gì? `[Senior]`

### Câu hỏi

> Em hay viết `async/await` thay cho `.then` chain. Vậy về bản chất, `async/await` có gì khác Promise không? Có bẫy nào dev hay dính?

### Giải thích lý thuyết

`async/await` là sugar trên Promise, nhưng có những điểm hành vi quan trọng:

- `async function` luôn trả về Promise.
- `await` "tạm dừng" function tại điểm đó, đặt phần còn lại vào microtask queue.
- `try/catch` quanh `await` mới bắt được rejection.
- Sequential vs parallel: viết liên tiếp `await` = sequential (chậm).

### Code minh hoạ

```javascript
// PITFALL 1: Sequential khi đáng lẽ parallel
async function loadDashboardSlow() {
  const user    = await fetchUser();    // 200ms
  const posts   = await fetchPosts();   // 200ms
  const orders  = await fetchOrders();  // 200ms
  // Tổng: 600ms
}

async function loadDashboardFast() {
  const [user, posts, orders] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchOrders(),
  ]);
  // Tổng: 200ms
}

// PITFALL 2: forEach + async — không await
async function processItems(items) {
  items.forEach(async (item) => {
    await processOne(item); // forEach không chờ
  });
  console.log("done"); // log NGAY, không phải sau khi process xong
}

// Đúng:
async function processItemsSeq(items) {
  for (const item of items) {
    await processOne(item); // sequential
  }
}

// Hoặc parallel với limit
async function processItemsConcurrent(items) {
  await Promise.all(items.map(processOne));
}

// PITFALL 3: Lost error context
async function bad() {
  return fetch("/api"); // return không await — error stack trace mất context
}

async function good() {
  return await fetch("/api"); // explicit, stack trace tốt hơn
}
// Tuy nhiên: `return await` trong try/catch là CẦN THIẾT để catch error
async function critical() {
  try {
    return await fetch("/api"); // KHÔNG bỏ await — nếu bỏ, catch không bắt được
  } catch (e) {
    handleError(e);
  }
}
```

### Đáp án mẫu

> "Đúng — `async/await` là sugar của Promise. `async function` luôn trả Promise, `await` pause function và push phần còn lại vào microtask queue. Pitfall em thấy nhiều nhất: thứ nhất là viết `await` liên tiếp cho các call độc lập — biến parallel thành sequential, chậm gấp N lần. Fix bằng `Promise.all`. Thứ hai là dùng `forEach` với async callback — `forEach` không await, code sau forEach chạy ngay không chờ. Phải dùng `for...of` cho sequential hoặc `Promise.all(items.map(...))` cho parallel. Thứ ba: trong try/catch phải dùng `return await` chứ không phải `return` — nếu bỏ `await`, error sẽ thoát khỏi try và catch không bắt được."

---

## Câu 5: Microtask queue có thể "đói" macrotask queue không? `[Senior]`

### Câu hỏi

> Đoạn code này gây vấn đề gì? UI có response không?
>
> ```javascript
> function loop() {
>   return Promise.resolve().then(loop);
> }
> loop();
> ```

### Giải thích lý thuyết

Event loop drain TOÀN BỘ microtask queue trước khi:

- Chạy macrotask tiếp theo.
- Cho browser render frame (raf, paint).
- Xử lý user input event.

→ Nếu microtask liên tục enqueue microtask mới, vòng lặp microtask trở thành vô hạn, **chặn cả render và macrotask** → UI freeze hoàn toàn.

### Code minh hoạ

```javascript
// Microtask starvation — UI freeze
function loop() {
  return Promise.resolve().then(loop);
}
loop();
// Browser không bao giờ paint được nữa

// So sánh với macrotask version (KHÔNG freeze UI)
function loopMacrotask() {
  setTimeout(loopMacrotask, 0);
}
loopMacrotask();
// UI vẫn responsive — giữa các iteration browser được paint

// Use case thực tế: heavy task chunking
async function heavyComputeBad(items) {
  for (const item of items) {
    await Promise.resolve(); // microtask — vẫn block
    processOne(item);
  }
}

async function heavyComputeGood(items) {
  for (const item of items) {
    await new Promise((r) => setTimeout(r, 0)); // macrotask — UI breathing room
    processOne(item);
  }
}

// Modern API: scheduler.yield (Chrome 129+) hoặc requestIdleCallback
async function heavyComputeModern(items) {
  for (const item of items) {
    await scheduler.yield(); // explicit yield to main thread
    processOne(item);
  }
}
```

### Đáp án mẫu

> "Có — đây gọi là microtask starvation. Vì event loop drain hết microtask queue trước khi cho browser render hay xử lý input, một chuỗi microtask vô hạn sẽ freeze toàn bộ UI. Khác với recursive `setTimeout`, vốn là macrotask nên giữa các lần lặp browser còn cơ hội paint. Ứng dụng thực tế: khi chia heavy task ra chunk, dùng `setTimeout(0)` hoặc API mới như `scheduler.yield()` mới đúng — đừng dùng `await Promise.resolve()` vì nó vẫn block render."

---

## Câu 6: AbortController — cách cancel fetch và lý do quan trọng `[Senior]`

### Câu hỏi

> Em đang viết một search component gọi API mỗi khi user gõ. Làm sao để cancel các request cũ khi user gõ thêm? Tại sao việc này quan trọng?

### Giải thích lý thuyết

Không cancel → 2 vấn đề:

1. **Race condition**: response của request cũ có thể về sau response mới → hiển thị data lỗi thời.
2. **Lãng phí**: network bandwidth, server load, cell battery (mobile).

`AbortController` là API chuẩn để cancel fetch (và một số API khác như `addEventListener` với `{ signal }`).

### Code minh hoạ

```javascript
// React + AbortController
function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setResults)
      .catch((err) => {
        if (err.name === "AbortError") return; // expected, ignore
        console.error(err);
      });

    return () => controller.abort(); // cleanup: huỷ khi query đổi hoặc unmount
  }, [query]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Pattern: timeout + abort
function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

// Abort cho nhiều signal cùng lúc (Node 20+, Chrome 116+)
const signal = AbortSignal.any([userAbort.signal, timeoutAbort.signal]);
fetch(url, { signal });
```

### Đáp án mẫu

> "Quan trọng vì race condition — request cũ có thể về sau request mới và overwrite kết quả, hiển thị data sai cho user. Em dùng `AbortController`: tạo controller mới mỗi lần gõ, gọi `fetch` với `signal`, và `controller.abort()` ở cleanup của useEffect. Trong React, return từ useEffect chạy khi dependency đổi hoặc component unmount nên rất hợp với pattern này. Pitfall cần lưu ý: phải filter `AbortError` ra khỏi log lỗi vì nó là behavior mong muốn, không phải bug thực sự."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                              | Đúng là                                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| "`setTimeout(fn, 0)` chạy ngay lập tức"              | Phải chờ call stack rỗng + microtask drain xong + min ~4ms (sau nhiều nested)  |
| "`async/await` chạy đồng bộ"                         | Vẫn async — phần sau `await` luôn chạy như microtask                          |
| "`Promise.all` chạy tuần tự"                         | Tất cả promise đã start trước khi `Promise.all` được gọi; `all` chỉ chờ kết quả |
| "Throw trong async function chạy đồng bộ"            | Throw trong async fn = reject Promise, không break try/catch bên ngoài         |
| "Có thể `await` ngoài async function"                | Không — trừ top-level await trong ES Module                                    |
