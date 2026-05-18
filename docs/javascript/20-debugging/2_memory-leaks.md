---
sidebar_position: 2
title: "2. Debugging Memory Leaks"
---

# Debug Memory Leaks

---

## Mục lục

- [Triệu chứng memory leak](#triệu-chứng-memory-leak)
- [Memory tab trong DevTools](#memory-tab-trong-devtools)
- [Heap Snapshot](#heap-snapshot)
- [Allocation Sampling / Timeline](#allocation-sampling--timeline)
- [Performance Monitor](#performance-monitor)
- [Các pattern leak phổ biến](#các-pattern-leak-phổ-biến)
- [Cách phòng tránh](#cách-phòng-tránh)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Triệu chứng memory leak

App có memory leak khi:

- **RAM tăng dần** theo thời gian, không giảm
- **App chậm dần** sau vài giờ sử dụng
- **Browser tab crash** (Aw, Snap!)
- DevTools "Performance Monitor" cho thấy JS heap tăng tuyến tính
- Number of nodes/listeners tăng không giảm sau navigation

## Memory tab trong DevTools

Chrome DevTools → **Memory tab** cung cấp 3 công cụ:

| Công cụ | Dùng để |
|---------|---------|
| **Heap snapshot** | Snapshot toàn bộ JS heap tại 1 thời điểm |
| **Allocation instrumentation on timeline** | Record allocation theo thời gian |
| **Allocation sampling** | Lấy mẫu allocation (ít overhead) |

## Heap Snapshot

### Cách chụp snapshot

1. Mở **Memory tab**
2. Chọn "Heap snapshot"
3. Click "Take snapshot"
4. → Hiển thị toàn bộ object trong heap

### Đọc snapshot

| Cột | Ý nghĩa |
|-----|---------|
| **Constructor** | Loại object (Array, Object, HTMLDivElement...) |
| **Distance** | Khoảng cách đến GC root (gần root = càng quan trọng) |
| **Objects Count** | Số instance |
| **Shallow Size** | Bộ nhớ object trực tiếp giữ |
| **Retained Size** | Bộ nhớ object + tất cả object nó giữ (free khi nó được GC) |

### So sánh 2 snapshot

```
Bước 1: Chụp snapshot ban đầu (baseline)
Bước 2: Thực hiện action nghi ngờ leak (vd: vào trang, ra trang)
Bước 3: Force GC (icon thùng rác)
Bước 4: Chụp snapshot thứ 2
Bước 5: Dropdown "All objects" → "Objects allocated between Snapshot 1 and Snapshot 2"
```

→ Hiện ra **object còn sót** sau khi đáng lẽ phải dọn → đây là leak.

### Tìm "retainer" giữ object

Click object → panel dưới → **Retainers**:
- Xem object nào giữ nó (theo chain)
- Quay ngược từ leaked object → tìm code gây leak

## Allocation Sampling / Timeline

### Timeline — chi tiết

1. Memory tab → "Allocation instrumentation on timeline" → Start
2. Tương tác app
3. Stop
4. → Xem timeline allocation theo thời gian
5. Click vùng có "sticky" allocation (không bị GC) → xem object cụ thể

### Sampling — nhẹ hơn

Phù hợp cho production-like sessions:
1. "Allocation sampling" → Start
2. Tương tác lâu (vài phút)
3. Stop → xem function nào allocate nhiều

## Performance Monitor

Mở DevTools → `Esc` → "Performance monitor":

Theo dõi real-time:
- **JS heap size**
- **DOM nodes count**
- **Listeners count**
- **GPU memory**
- **CPU usage**

### Triệu chứng leak qua monitor

- **JS heap** tăng đều — không giảm sau GC
- **DOM nodes** tăng — detached node không được dọn
- **Listeners** tăng — quên `removeEventListener`

## Các pattern leak phổ biến

### 1. Detached DOM nodes

```js
let detachedElement = document.getElementById("toast");
detachedElement.remove();
// detachedElement vẫn giữ reference → leak

// ✅ Fix
detachedElement = null;
```

### 2. Forgotten event listener

```js
// ❌ Leak: listener không bao giờ remove
function setupButton() {
  const button = document.getElementById("btn");
  const data = new Array(1000000);   // dữ liệu lớn
  
  button.addEventListener("click", () => {
    console.log(data.length);
  });
}

// ✅ Cleanup
function setupButton() {
  const button = document.getElementById("btn");
  const data = new Array(1000000);
  
  const handler = () => console.log(data.length);
  button.addEventListener("click", handler);
  
  return () => button.removeEventListener("click", handler);
}

// Hoặc dùng AbortController
const controller = new AbortController();
button.addEventListener("click", handler, { signal: controller.signal });

// Cleanup
controller.abort();
```

### 3. Timer/Interval quên clear

```js
// ❌
const interval = setInterval(() => {
  updateData(largeObject);
}, 1000);

// ✅
clearInterval(interval);
```

### 4. Closure giữ reference lớn

```js
function setup() {
  const huge = new Array(1000000);
  
  return function() {
    return 42;   // không dùng huge nhưng V8 có thể vẫn giữ
  };
}

const fn = setup();
// Trên một số version V8, huge vẫn được giữ qua closure
// Khắc phục: gán null sau khi không cần
let huge = new Array(1000000);
const fn2 = () => 42;
huge = null;
```

### 5. Global state vô tận

```js
// ❌ Cache không giới hạn
const cache = {};
function memoize(key, value) {
  cache[key] = value;
}
// Sau N giờ, cache có hàng triệu entry → leak

// ✅ LRU cache hoặc Map có size
const cache = new Map();
const MAX = 100;
function memoize(key, value) {
  if (cache.size >= MAX) {
    cache.delete(cache.keys().next().value);   // xoá oldest
  }
  cache.set(key, value);
}

// ✅ Hoặc WeakMap (nếu key là object)
const cache = new WeakMap();
```

### 6. React — không cleanup useEffect

```jsx
// ❌
useEffect(() => {
  window.addEventListener("scroll", handler);
});   // không return cleanup

// ✅
useEffect(() => {
  window.addEventListener("scroll", handler);
  return () => window.removeEventListener("scroll", handler);
}, []);
```

### 7. Subscription không unsubscribe

```js
// ❌
import { subject } from "./events";

class Widget {
  mount() {
    subject.subscribe(this.handle);
  }
  // không unsubscribe
}

// ✅
class Widget {
  mount() {
    this.subscription = subject.subscribe(this.handle);
  }
  unmount() {
    this.subscription.unsubscribe();
  }
}
```

### 8. WebSocket không close

```js
// ❌
const ws = new WebSocket(url);
ws.onmessage = (e) => process(e.data);
// không bao giờ close

// ✅
ws.close();
ws = null;
```

## Cách phòng tránh

### 1. Linter rules

```json
{
  "rules": {
    "no-undef": "error",
    "no-implicit-globals": "error"
  }
}
```

### 2. Pattern AbortController cho listeners/fetch

```js
const controller = new AbortController();

fetch(url, { signal: controller.signal });
button.addEventListener("click", handler, { signal: controller.signal });

// Cleanup tất cả 1 lần
controller.abort();
```

### 3. WeakMap/WeakSet cho metadata

```js
// Metadata gắn vào DOM element
const meta = new WeakMap();

function attachData(el, data) {
  meta.set(el, data);
}

// Khi element bị remove → entry tự dọn
```

### 4. Cleanup hooks (React)

```jsx
useEffect(() => {
  const id = setInterval(...);
  const ws = new WebSocket(...);
  const ctrl = new AbortController();
  
  return () => {
    clearInterval(id);
    ws.close();
    ctrl.abort();
  };
}, []);
```

### 5. Periodic memory test

Trong CI/CD, test với Puppeteer:

```js
const browser = await puppeteer.launch();
const page = await browser.newPage();

for (let i = 0; i < 100; i++) {
  await page.goto(url);
  await page.click("...");
  await page.evaluate(() => window.gc?.());
}

const metrics = await page.metrics();
if (metrics.JSHeapUsedSize > THRESHOLD) {
  throw new Error("Memory leak detected");
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Làm thế nào để phát hiện memory leak?

**Đáp án:**

Quy trình chuẩn:

1. **Performance Monitor** — xem JS heap có tăng đều không
2. **Heap snapshot baseline** — chụp khi app vừa load
3. **Trigger action nhiều lần** (vd: navigate vào/ra trang 10 lần)
4. **Force GC** (icon thùng rác)
5. **Snapshot thứ 2** — so sánh với baseline
6. **Xem "Objects allocated between snapshots"** — object còn sót
7. **Inspect retainers** — quay ngược tìm code gây giữ

Bonus: dùng **Chrome Memory tab** → "Allocation instrumentation on timeline" để xem allocation theo thời gian.

### Câu 2: 3 nguyên nhân leak phổ biến trong SPA?

**Đáp án:**

1. **Event listener không cleanup** — đặc biệt trên `window`, `document`
2. **Detached DOM nodes** — element bị remove khỏi DOM nhưng JS vẫn giữ reference
3. **Timer/Interval quên clear** trong component lifecycle

Bonus:
- WebSocket/EventSource không close
- Subscription RxJS/Redux không unsubscribe
- Closure giữ reference object lớn
- Cache vô hạn (Map không có TTL/limit)

### Câu 3: Detached DOM node là gì?

**Đáp án:**

**Detached DOM node** là DOM element **đã bị remove khỏi DOM tree** nhưng **vẫn được JS reference** → không thể GC.

```js
let el = document.getElementById("modal");
el.remove();   // remove khỏi DOM
// el VẪN trỏ tới element trong memory → leak

el = null;     // ✅ giải phóng
```

Cách phát hiện trong DevTools:
- Memory tab → Snapshot → search "Detached"
- Hoặc: `console.log(document.body.contains(el))` — false nếu đã detached

### Câu 4: AbortController giúp tránh leak như thế nào?

**Đáp án:**

`AbortController` cho phép cleanup **nhiều resource cùng lúc** qua **một signal**:

```js
const controller = new AbortController();
const signal = controller.signal;

// Listener
button.addEventListener("click", handler, { signal });

// Fetch
fetch(url, { signal }).then(...).catch(err => {
  if (err.name === "AbortError") return;
});

// Stream
stream.pipeTo(writer, { signal });

// Cleanup TẤT CẢ
controller.abort();
```

Đặc biệt hữu ích trong **React useEffect** hoặc **Vue setup**:

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  
  fetch(url, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => e.name !== "AbortError" && console.error(e));
  
  return () => ctrl.abort();
}, [url]);
```
