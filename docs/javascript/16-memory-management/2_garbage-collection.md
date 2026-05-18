---
sidebar_position: 2
title: "2. Garbage Collection"
---

# Garbage Collection (GC)

---

## Mục lục

- [GC là gì?](#gc-là-gì)
- [Khái niệm "reachable"](#khái-niệm-reachable)
- [Thuật toán Mark-and-Sweep](#thuật-toán-mark-and-sweep)
- [Generational GC (V8)](#generational-gc-v8)
- [Reference Counting (cũ)](#reference-counting-cũ)
- [Tự kiểm soát GC](#tự-kiểm-soát-gc)
- [WeakRef và FinalizationRegistry](#weakref-và-finalizationregistry)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## GC là gì?

**Garbage Collection** là cơ chế **tự động dọn dẹp bộ nhớ** mà ứng dụng không còn dùng.

> **Ví dụ thực tế:** Hãy tưởng tượng GC như **nhân viên dọn vệ sinh** trong nhà hàng. Khách ăn xong, đi về (object không còn ai tham chiếu) → nhân viên đến dọn dẹp bàn (giải phóng memory).

Khác với C/C++:
- **C/C++:** lập trình viên phải `malloc`/`free` thủ công → dễ lỗi
- **JS, Java, Python:** GC tự động → an toàn nhưng không kiểm soát được lúc nào dọn

## Khái niệm "reachable"

Object được coi là **reachable** (truy cập được) nếu có **đường nào đó** dẫn từ **roots** đến nó:

### Roots — gốc của reachability

- `globalThis` (window, global)
- Stack local variables của function đang chạy
- Parameters của function đang chạy
- Closures

### Object reachable

```js
const root = { name: "root" };   // reachable (global)
const child = { parent: root };  // reachable (qua root chain?)

// ⚠️ child KHÔNG reachable từ globalThis
// child chỉ reachable nếu ai đó tham chiếu nó

window.tree = child;             // bây giờ reachable từ globalThis
```

### Garbage = unreachable

```js
function process() {
  const data = new Array(1000);   // reachable trong scope function
  // ... dùng data ...
}
// Sau khi function trả về, data không còn reachable → garbage
```

### Reachable không đồng nghĩa "đang dùng"

```js
let largeArray = new Array(1000000);

function init() {
  // setup ...
}

init();

// largeArray VẪN reachable (qua global "largeArray"), nhưng không ai dùng
// → memory leak — GC không thể dọn

// ✅ Fix: cleanup khi không cần
init();
largeArray = null;
```

## Thuật toán Mark-and-Sweep

Hầu hết JS engine dùng biến thể của **Mark-and-Sweep**:

### Bước 1: Mark (Đánh dấu)

GC bắt đầu từ **roots**, đi theo các reference, **đánh dấu** mọi object có thể đến:

```
Roots:
  global → A → B → C
  global → D
            ↓
            E

Marked: A, B, C, D, E
```

### Bước 2: Sweep (Quét)

Tất cả object **không được mark** → garbage → giải phóng:

```
Heap:
  A (marked) ✓
  B (marked) ✓
  C (marked) ✓
  D (marked) ✓
  E (marked) ✓
  F (unmarked) ✗ ← dọn
  G (unmarked) ✗ ← dọn
```

### Trade-off

| | Ưu | Nhược |
|---|----|-------|
| Mark-Sweep | Xử lý cycle tốt | Pause ứng dụng khi chạy |

Hệ quả: **frame drop** trong UI khi GC chạy. Engine hiện đại dùng incremental GC để giảm pause.

## Generational GC (V8)

V8 (Chrome, Node) chia heap thành 2 **generation**:

### Young Generation (Nursery)

- Object **mới tạo** vào đây
- **Phần lớn object chết trẻ** (Weak Generational Hypothesis)
- GC chạy thường xuyên trên Young Gen — nhanh

```js
function process() {
  const temp = { data: ... };   // tạo trong young gen
  // ...
}
// temp chết trẻ → GC nhanh chóng dọn
```

### Old Generation

- Object **sống sót qua nhiều lần GC** ở Young Gen → promote lên Old Gen
- GC trên Old Gen chậm hơn, ít chạy hơn

```js
// Object lưu lâu — vào Old Gen
const config = loadConfig();   // app lifecycle
const cache = new Map();        // luôn tồn tại
```

### Lợi ích Generational

```
Young GC (Scavenger): ~1-2ms, chạy thường xuyên
Old GC (Mark-Compact): ~50-100ms, hiếm khi chạy

Tổng: tối ưu hơn so với GC toàn heap mỗi lần
```

## Reference Counting (cũ)

Một số engine cũ (IE6-7) dùng **Reference Counting**:

```js
// Đếm số reference đến object
let a = { x: 1 };   // count = 1
let b = a;          // count = 2
a = null;           // count = 1
b = null;           // count = 0 → dọn ngay
```

### Vấn đề: Circular reference

```js
function leak() {
  const a = {};
  const b = {};
  a.ref = b;        // a.ref → b (b count = 1)
  b.ref = a;        // b.ref → a (a count = 1)
  // Sau function: a, b ra khỏi scope
  // Nhưng count vẫn = 1 → leak vĩnh viễn (reference counting)
}

// Mark-and-Sweep xử lý đúng vì cả a, b không reachable từ root
```

V8 và các engine hiện đại đều dùng Mark-and-Sweep + Generational, không có vấn đề này.

## Tự kiểm soát GC

### Không gọi GC trực tiếp được

```js
// ❌ Không có API:
GC.collect();
```

### Trong Node.js

```bash
# Bật quyền expose GC
node --expose-gc app.js
```

```js
global.gc();   // gọi thủ công (dùng cho test)
```

> Không dùng trong production — engine biết tối ưu hơn.

### Gợi ý GC qua giảm reference

```js
let bigData = new Array(1000000);
// ... dùng ...
bigData = null;   // gợi ý: tôi không cần nữa
```

### Tránh giữ reference dài hạn

```js
// ❌ Module-level cache vĩnh viễn
const cache = {};

// ✅ Cache có TTL hoặc dùng WeakMap
const cache = new Map();
setTimeout(() => cache.clear(), 60000);

// ✅ WeakMap (key bị GC → entry tự xoá)
const metadata = new WeakMap();
```

## WeakRef và FinalizationRegistry

ES2021 thêm hai API nâng cao để **tương tác với GC**:

### `WeakRef` — Weak reference

```js
let target = { name: "Alice" };
const ref = new WeakRef(target);

// Đọc giá trị (nếu chưa bị GC)
const obj = ref.deref();
if (obj) {
  console.log(obj.name);   // "Alice"
}

target = null;
// Sau GC, ref.deref() trả undefined
```

### `FinalizationRegistry` — callback khi GC

```js
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object ${heldValue} đã bị GC dọn`);
});

let target = { name: "Alice" };
registry.register(target, "user-123");

target = null;
// Khi GC dọn target, callback chạy với "user-123"
```

> ⚠️ Cả hai API này **không xác định** — không nên dùng cho logic quan trọng. Phù hợp cho:
> - Log/debug
> - Cleanup resource native (vd: WebGL context, file handle)
> - Cache lazy

---

## Câu hỏi phỏng vấn

### Câu 1: GC dùng thuật toán gì?

**Đáp án:**

Hầu hết JS engine hiện đại (V8, SpiderMonkey, JavaScriptCore) dùng **Mark-and-Sweep** với cải tiến **Generational** (chia young/old generation).

Các kĩ thuật phụ:
- **Incremental marking** — chia GC thành nhiều pha nhỏ, giảm pause
- **Concurrent marking** — chạy GC song song với app
- **Compaction** — gộp memory để chống fragmentation

### Câu 2: Reference counting có nhược điểm gì?

**Đáp án:**

Vấn đề chính là **circular reference**:

```js
const a = {};
const b = {};
a.ref = b;
b.ref = a;
// a, b không thể GC dù không ai khác tham chiếu
```

Mark-and-Sweep xử lý đúng vì check **reachability từ root**, không phải count.

Đây là lý do JS hiện đại không dùng pure reference counting.

### Câu 3: Có gọi được GC thủ công trong JS không?

**Đáp án:**

**Không** trong môi trường browser thông thường. JS spec không expose GC API.

Trong Node.js, có thể bật flag `--expose-gc`:
```bash
node --expose-gc app.js
```
```js
global.gc();
```

Nhưng **không nên dùng** trong production — engine biết khi nào tối ưu nhất. Thường chỉ dùng trong test/benchmark.

### Câu 4: Sự khác biệt giữa `WeakMap` và `WeakRef`?

**Đáp án:**

- **`WeakMap`** — collection key-value, key giữ weak reference. Khi key không reachable, entry tự dọn.
- **`WeakRef`** — wrapper cho **một** object. Cho phép kiểm tra/lấy lại object nếu chưa bị GC.

```js
// WeakMap: ánh xạ key → value
const wm = new WeakMap();
wm.set(obj, "data");
wm.get(obj);   // "data"

// WeakRef: giữ một object yếu
const ref = new WeakRef(obj);
const target = ref.deref();   // có thể undefined nếu đã GC
```

Cả hai đều **không cản trở GC** và không đảm bảo thời điểm dọn.
