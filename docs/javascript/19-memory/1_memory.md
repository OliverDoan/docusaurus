---
sidebar_position: 1
title: "1. Memory Management"
---

# Memory Management

---

## Mục lục

- [Memory Lifecycle](#memory-lifecycle)
- [Stack vs Heap](#stack-vs-heap)
- [Garbage Collection](#garbage-collection)
- [Reference Counting vs Mark-and-Sweep](#reference-counting-vs-mark-and-sweep)
- [Memory Leaks](#memory-leaks)

---

## Memory Lifecycle

Mọi ngôn ngữ đều qua 3 giai đoạn quản lý bộ nhớ:

1. **Allocate** — cấp phát bộ nhớ khi tạo giá trị.
2. **Use** — đọc/ghi bộ nhớ.
3. **Release** — giải phóng khi không cần.

JavaScript là **garbage-collected language** — bước 1 và 3 **tự động**.
Dev không có `malloc`/`free` như C, nhưng vẫn có thể tạo leak nếu không
hiểu cơ chế.

---

## Stack vs Heap

| | Stack | Heap |
|--|-------|------|
| Lưu | Primitive, function frame | Object, Array, Function body |
| Kích thước | Cố định, nhỏ | Linh hoạt, lớn |
| Tốc độ | Nhanh | Chậm hơn |
| Quản lý | Tự động (push/pop) | GC |

```js
let x = 10;           // x trên stack — số được lưu trực tiếp
let user = { name };  // user trên stack — chứa pointer tới heap
                       // { name } trên heap
```

Khi gán biến:

```js
const a = { x: 1 };
const b = a; // b copy pointer, KHÔNG copy object

b.x = 2;
a.x; // 2 — a và b cùng trỏ tới object trên heap
```

---

## Garbage Collection

GC quét heap, tìm object **không còn ai dùng** và giải phóng.

**Reachability** = tiêu chí GC. Một object **reachable** nếu:

- Là **root** (global object, current stack frame).
- Được tham chiếu từ object reachable khác.

```js
let user = { name: "An" };
// { name: "An" } reachable qua biến user

user = null;
// { name: "An" } không còn reference nào → GC sẽ dọn
```

:::info[Phân tích]

**V8 dùng Generational GC** — chia object thành 2 thế hệ:

1. **Young generation (Nursery)** — object mới, GC chạy thường xuyên,
   nhanh. Object sống sót sau vài lần GC → chuyển sang old.
2. **Old generation** — object sống lâu, GC chạy ít hơn, chậm hơn (full GC).

Lý do: thực nghiệm chỉ ra **đa số object chết trẻ** (vd biến tạm trong
function). Tối ưu cho case này → throughput tổng tốt hơn.

GC trong V8 dùng nhiều thuật toán:

- **Scavenger** (young) — copy object còn sống sang vùng mới, dọn nguyên
  vùng cũ.
- **Mark-Compact** (old) — đánh dấu reachable, dồn các object liền nhau.
- **Concurrent / Incremental** — chạy song song với JS để giảm pause.

Trong code app, không cần biết chi tiết — nhưng hiểu cơ chế giúp viết
code "GC-friendly" (không tạo nhiều object short-lived khi không cần,
tránh giữ tham chiếu không cần thiết).

:::

---

## Reference Counting vs Mark-and-Sweep

**Reference Counting** (cũ, Python, Swift dùng):

- Mỗi object có **counter** số reference đang trỏ tới.
- Counter = 0 → giải phóng ngay.
- **Vấn đề**: không xử lý được **circular reference**.

```js
let a = { ref: null };
let b = { ref: null };
a.ref = b;
b.ref = a;
a = null;
b = null;
// Cả hai vẫn ref nhau → counter > 0 → leak (nếu dùng RC)
```

**Mark-and-Sweep** (JS hiện đại):

- Xuất phát từ root, **đánh dấu** tất cả object reachable.
- **Quét** heap, giải phóng object không đánh dấu.
- **Xử lý được circular** — nếu cả hai đều không reachable từ root.

```js
let a = { ref: null };
let b = { ref: null };
a.ref = b;
b.ref = a;
a = null;
b = null;
// Không reachable từ root → GC dọn cả hai
```

V8 (Chrome, Node, Edge) và SpiderMonkey (Firefox) đều dùng Mark-and-Sweep.

---

## Memory Leaks

Leak xảy ra khi object **không cần nữa** nhưng vẫn **reachable** → GC
không dọn được.

**1. Global biến vô tình:**

```js
function leak() {
  count = 100; // không có let/const → tạo global biến
}

leak(); // window.count tồn tại mãi
```

Fix: bật `"use strict"`, dùng `let`/`const`.

**2. Forgotten timer:**

```js
const data = loadHugeData();
setInterval(() => {
  process(data); // data bị giữ mãi
}, 1000);
```

Fix: `clearInterval` khi không cần.

**3. Event listener không remove:**

```js
function setup() {
  const node = document.getElementById("btn");
  node.addEventListener("click", () => {
    console.log(node.dataset); // closure giữ node
  });
}
// Nếu node bị remove khỏi DOM nhưng listener còn → leak
```

Fix: `removeEventListener` hoặc `AbortController`.

**4. Closure giữ biến to:**

```js
function outer() {
  const huge = new Array(1000000).fill(0);
  return function inner() {
    return 1; // không dùng huge, nhưng closure vẫn giữ
  };
}

const fn = outer();
// huge không bao giờ GC vì fn vẫn sống
```

Fix: tách closure, gán biến to thành `null` khi không cần.

**5. Detached DOM node:**

```js
const list = [];
function add() {
  const div = document.createElement("div");
  list.push(div);    // giữ reference
  document.body.appendChild(div);
}

document.body.innerHTML = ""; // xoá DOM nhưng list còn ref → leak
```

:::warning[Cần lưu ý]

**Debug memory leak** với Chrome DevTools:

1. **Performance Monitor** — theo dõi JS heap size real-time. Heap
   liên tục tăng = leak.

2. **Heap Snapshot** — chụp ảnh heap, so sánh giữa các điểm:
   - "Take snapshot" trước thao tác.
   - Làm action lặp đi lặp lại (vd open/close modal 10 lần).
   - Take snapshot tiếp.
   - "Comparison" → tìm object increase liên tục.

3. **Allocation Timeline** — record period, xem object nào được tạo
   nhiều nhất.

Pattern phổ biến gây leak trong React app:

- `useEffect` không cleanup subscription.
- Global state lưu reference component đã unmount.
- Closure trong `setInterval`/`setTimeout` không clear.
- WebSocket / SSE không đóng kết nối.

:::

:::tip[Mẹo]

**`WeakMap` / `WeakSet`** giúp tránh leak khi gắn metadata vào object
có lifecycle riêng:

```js
// Tệ — Map giữ DOM node mãi
const meta = new Map();
function track(node) {
  meta.set(node, { lastSeen: Date.now() });
}

// Tốt — WeakMap không cản GC
const meta = new WeakMap();
function track(node) {
  meta.set(node, { lastSeen: Date.now() });
}
// Khi node bị remove khỏi DOM, meta entry tự dọn
```

**`FinalizationRegistry`** (ES2021) — chạy callback khi object bị GC:

```js
const reg = new FinalizationRegistry((heldValue) => {
  console.log("Cleanup:", heldValue);
});

let obj = {};
reg.register(obj, "obj id");

obj = null; // sau khi GC chạy → log "Cleanup: obj id"
```

Dùng cho native resource (file handle, socket). **Không** đảm bảo chạy
ngay — chỉ chạy "khi nào GC quyết định".

:::
