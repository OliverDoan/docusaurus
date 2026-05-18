---
sidebar_position: 4
title: "4. WeakMap & WeakSet"
---

# WeakMap & WeakSet

---

## Mục lục

- [Strong vs Weak Reference](#strong-vs-weak-reference)
- [WeakMap](#weakmap)
- [WeakSet](#weakset)
- [So sánh Map/Set vs WeakMap/WeakSet](#so-sánh-mapset-vs-weakmapweakset)
- [Use case thực tế](#use-case-thực-tế)
- [Hạn chế](#hạn-chế)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Strong vs Weak Reference

### Strong reference (mặc định)

Trong JavaScript thông thường, biến giữ **strong reference** đến object — object **không bị garbage collected** chừng nào còn ai đó tham chiếu:

```js
let user = { name: "Alice" };
const map = new Map();
map.set(user, "data");

user = null;
// ⚠️ object {name: "Alice"} VẪN tồn tại — Map giữ reference
console.log(map.size);   // 1
```

### Weak reference

`WeakMap`/`WeakSet` chỉ giữ **weak reference** — khi không ai khác tham chiếu, object **bị xoá tự động** khi GC chạy:

```js
let user = { name: "Alice" };
const weakMap = new WeakMap();
weakMap.set(user, "data");

user = null;
// ✅ object có thể bị GC dọn dẹp khi không còn reference khác
```

> **Ví dụ thực tế:** Hãy tưởng tượng strong reference như **giữ chìa khoá nhà** — không ai dọn nhà nếu bạn còn chìa. Weak reference như **biết địa chỉ nhà** — không có chìa, bạn không ngăn chủ nhà bán/dỡ.

## WeakMap

`WeakMap` là một collection **key-value** trong đó:
- **Key BẮT BUỘC là object** (hoặc Symbol từ ES2023)
- Key được giữ qua weak reference
- **Không enumerable** — không có `size`, không lặp được

### API

```js
const wm = new WeakMap();

// set / get / has / delete
const key1 = { id: 1 };
const key2 = { id: 2 };

wm.set(key1, "data 1");
wm.set(key2, "data 2");

wm.get(key1);        // "data 1"
wm.has(key1);        // true
wm.delete(key1);
wm.has(key1);        // false
```

### Chỉ chấp nhận object làm key

```js
const wm = new WeakMap();

wm.set("string", 1);    // ❌ TypeError
wm.set(123, 1);         // ❌ TypeError
wm.set(null, 1);        // ❌ TypeError
wm.set({}, 1);          // ✅
wm.set([], 1);          // ✅ (mảng cũng là object)
wm.set(Symbol("x"), 1); // ✅ (từ ES2023)
```

### Khởi tạo từ iterable

```js
const k1 = { name: "k1" };
const k2 = { name: "k2" };

const wm = new WeakMap([
  [k1, "value 1"],
  [k2, "value 2"]
]);
```

### KHÔNG enumerable

```js
const wm = new WeakMap();
wm.set({}, 1);
wm.set({}, 2);

// Tất cả không hoạt động:
wm.size;                    // undefined
[...wm];                    // ❌ TypeError
wm.forEach(...);            // ❌ undefined
for (let x of wm) {}        // ❌ TypeError
Object.keys(wm);            // []
```

Lý do: nếu cho enumerable, các key có thể "sống dậy" → mâu thuẫn với weak reference.

## WeakSet

`WeakSet` là collection các **object** (không có giá trị) — chỉ kiểm tra "đã có hay chưa":

```js
const ws = new WeakSet();

const a = { id: 1 };
const b = { id: 2 };

ws.add(a);
ws.add(b);

ws.has(a);     // true
ws.has({});    // false (khác reference)

ws.delete(a);
ws.has(a);     // false
```

### Quy tắc giống WeakMap

```js
ws.add("string");    // ❌ TypeError
ws.add({});          // ✅

// Không enumerable
ws.size;             // undefined
[...ws];             // ❌ TypeError
```

## So sánh Map/Set vs WeakMap/WeakSet

| | `Map` | `WeakMap` | `Set` | `WeakSet` |
|---|------|-----------|-------|-----------|
| Key/value | Bất kỳ | Key: object only | Bất kỳ | Object only |
| Reference | Strong | Weak | Strong | Weak |
| `size` | ✅ | ❌ | ✅ | ❌ |
| Iterable | ✅ | ❌ | ✅ | ❌ |
| `forEach` | ✅ | ❌ | ✅ | ❌ |
| `clear()` | ✅ | ❌ | ✅ | ❌ |
| GC tự dọn | ❌ | ✅ | ❌ | ✅ |
| Use case | Lưu dữ liệu chung | Metadata gắn với object | Lưu unique values | Tag object |

## Use case thực tế

### 1. Lưu metadata mà không sửa object gốc

```js
// ❌ Cách cũ — làm bẩn object
function trackUser(user) {
  user._lastSeen = Date.now();   // sửa object gốc
}

// ✅ Dùng WeakMap
const lastSeenMap = new WeakMap();

function trackUser(user) {
  lastSeenMap.set(user, Date.now());
}

function getLastSeen(user) {
  return lastSeenMap.get(user);
}

// Khi user bị giải phóng → metadata cũng được dọn tự động
```

### 2. Cache tính toán nặng

```js
const cache = new WeakMap();

function expensiveCalc(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  const result = /* tính toán nặng */;
  cache.set(obj, result);
  return result;
}

// Khi obj không còn dùng → cache entry tự dọn
```

### 3. Private data cho class (trước private fields)

```js
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }
  
  checkPassword(input) {
    return privateData.get(this).password === input;
  }
}

const u = new User("Alice", "secret");
u.password;           // undefined — không thấy
u.checkPassword("secret");   // true
```

> **Lưu ý:** Từ ES2022 dùng `#private` field là cách tốt hơn.

### 4. Tag object đã xử lý

```js
const visited = new WeakSet();

function processNode(node) {
  if (visited.has(node)) {
    return;   // đã xử lý
  }
  
  visited.add(node);
  // ... xử lý node ...
}

// Tránh vòng lặp vô tận khi traverse cây có cycle
```

### 5. Track DOM elements

```js
const observedElements = new WeakMap();

function observe(el, callback) {
  observedElements.set(el, callback);
}

// Khi el bị remove khỏi DOM → WeakMap entry tự dọn
// Không leak memory
```

## Hạn chế

### 1. Không thể iterate

Đây là trade-off lớn nhất — không thể "duyệt qua" hay "đếm" entries:

```js
const wm = new WeakMap();
wm.set({}, 1);
wm.set({}, 2);

// Không có cách nào lấy tất cả entries
```

### 2. Key phải là object

```js
wm.set("user_1", data);   // ❌ TypeError
```

Workaround: tạo wrapper object:

```js
const userKeys = new Map();   // hoặc bình thường
function getKey(id) {
  if (!userKeys.has(id)) {
    userKeys.set(id, { id });
  }
  return userKeys.get(id);
}

wm.set(getKey(1), data);   // ⚠️ Tuy nhiên giờ userKeys giữ strong reference
```

### 3. Không kiểm soát được khi GC chạy

GC là **không xác định** (non-deterministic) — bạn không biết chính xác khi nào entry bị xoá:

```js
let key = { id: 1 };
const wm = new WeakMap();
wm.set(key, "data");

key = null;
// Entry CÓ THỂ vẫn còn trong wm... hay không
// GC chạy khi engine quyết định
```

### 4. Không cache theo primitive key

```js
// ❌ Không thể: cache theo string/number
const wm = new WeakMap();
wm.set("user-1", data);   // TypeError
```

---

## Câu hỏi phỏng vấn

### Câu 1: Khi nào nên dùng WeakMap thay vì Map?

**Đáp án:**

Dùng `WeakMap` khi:
1. **Key là object** và bạn muốn tự động cleanup khi object bị giải phóng
2. **Tránh memory leak** — không giữ tham chiếu cản trở GC
3. **Lưu metadata "ghost"** không can thiệp object gốc

Dùng `Map` khi:
1. Cần iterate, đếm size
2. Key có thể là primitive
3. Cần kiểm soát lifecycle thủ công

### Câu 2: Đoán kết quả

```js
let key = { id: 1 };
const wm = new WeakMap();
wm.set(key, "data");

console.log(wm.has(key));
key = null;
console.log(wm.size);
```

**Đáp án:**

```
true
undefined  (WeakMap không có size!)
```

WeakMap **không có** thuộc tính `size`. Sau `key = null`, entry vẫn có thể tồn tại cho đến khi GC chạy — không thể test trực tiếp.

### Câu 3: Tại sao WeakMap không cho iterate?

**Đáp án:**

Nếu cho phép iterate, ta sẽ có cách "đụng" lại các key đã mất tham chiếu khác → biến weak reference thành strong reference → vi phạm bản chất "weak". Ví dụ:

```js
// Giả sử cho iterate được
let key = {};
wm.set(key, "data");
key = null;

// Không có ai tham chiếu key nữa
// Nhưng nếu iterate:
for (const [k, v] of wm) {
  // k là object — bây giờ "sống lại" với strong reference
}
```

Vì lý do này, WeakMap/WeakSet **chỉ cho phép truy cập qua key đã biết** (`get`, `has`).

### Câu 4: WeakSet có thể dùng để làm gì?

**Đáp án:**

`WeakSet` dùng để **"tag" object** — đánh dấu object thuộc một nhóm nào đó mà không ngăn cản GC:

- Đánh dấu object đã xử lý (avoid duplicate)
- Track DOM elements đang observe
- Permissions / capabilities cho object
- Avoid infinite recursion với cyclic graph

```js
const processed = new WeakSet();

function process(node) {
  if (processed.has(node)) return;
  processed.add(node);
  // ... logic ...
}
```
