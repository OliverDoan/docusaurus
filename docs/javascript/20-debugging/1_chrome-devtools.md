---
sidebar_position: 1
title: "1. Chrome DevTools"
---

# Chrome DevTools — Công cụ debug JS

---

## Mục lục

- [Mở DevTools](#mở-devtools)
- [Tab Console](#tab-console)
- [Tab Sources — Debugger](#tab-sources--debugger)
- [Tab Network](#tab-network)
- [Tab Elements](#tab-elements)
- [Tab Application — Storage](#tab-application--storage)
- [Console API hữu ích](#console-api-hữu-ích)
- [Shortcut quan trọng](#shortcut-quan-trọng)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Mở DevTools

| Trình duyệt | Phím tắt |
|-------------|----------|
| Chrome, Edge | `F12` / `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) |
| Firefox | `F12` / `Ctrl+Shift+K` |
| Safari | Bật Developer → `Cmd+Option+I` |

Click chuột phải → **Inspect** cũng mở DevTools.

## Tab Console

### Chạy code trực tiếp

```js
> 2 + 2
4
> document.title
"My App"
> [1, 2, 3].map(x => x * 2)
[2, 4, 6]
```

### Truy cập biến qua `$_`, `$0`...

```js
> 42
42
> $_   // giá trị câu lệnh trước
42

// $0..$4 = element click chuột phải trong Elements tab
$0.style.color = "red";
```

### Filter / Group log

```js
// Filter theo level: Verbose, Info, Warning, Error
console.log("info");
console.warn("warn");
console.error("error");
console.debug("verbose");

// Group
console.group("User");
console.log("name");
console.log("age");
console.groupEnd();

// Collapsed
console.groupCollapsed("Details");
console.log("..."); 
console.groupEnd();
```

### Format

```js
console.log("%c Big text", "color: red; font-size: 20px;");
console.log("Hello %s, age %d", "Alice", 30);
console.log("%o", { name: "Alice" });   // object
console.log("%O", { name: "Alice" });   // object expandable
console.log("%j", obj);                  // JSON
```

## Tab Sources — Debugger

### Đặt breakpoint

1. Mở tab **Sources**
2. Tìm file JS (Ctrl+P để search nhanh)
3. Click số dòng → đặt breakpoint
4. Reload/trigger action → code dừng tại breakpoint

### Các loại breakpoint

| Loại | Cách đặt |
|------|----------|
| **Line breakpoint** | Click số dòng |
| **Conditional** | Click chuột phải số dòng → "Add conditional breakpoint" → nhập expression |
| **Logpoint** | Chuột phải → "Add logpoint" → in log mà không dừng |
| **DOM breakpoint** | Elements tab → chuột phải element → "Break on..." |
| **XHR breakpoint** | Sources tab → "XHR/fetch breakpoints" → +URL pattern |
| **Event listener** | "Event Listener Breakpoints" → check loại event |
| **Exception** | "Pause on exceptions" checkbox |

### Controls khi dừng

| Phím | Action |
|------|--------|
| `F8` | Resume (chạy tiếp) |
| `F10` | Step over (qua dòng) |
| `F11` | Step into (vào function) |
| `Shift+F11` | Step out (ra function) |
| `F9` | Step (chính xác hơn) |

### Watch & Scope

- **Watch**: thêm expression để theo dõi giá trị qua từng bước
- **Scope**: xem tất cả biến trong scope hiện tại (local, closure, global)
- **Call Stack**: xem chuỗi function gọi đến đây

### `debugger;` statement

```js
function process(data) {
  debugger;   // dừng tại đây nếu DevTools mở
  return data.map(...);
}
```

### Pretty print code

Click nút `{}` ở dưới khi xem file minified → format đẹp hơn để debug.

## Tab Network

### Xem request HTTP

- Filter theo loại: XHR/Fetch, JS, CSS, Img, Media...
- Cột Status, Size, Time
- Click request → xem Headers, Payload, Response, Timing

### Throttling — giả lập kết nối chậm

Dropdown "No throttling" → chọn:
- Fast 4G
- Slow 4G
- 3G
- Offline

Test app trên kết nối thực tế.

### Preserve log

Checkbox "Preserve log" — giữ request khi reload page.

### Block requests

Chuột phải request → "Block request URL" → reload để test app khi resource lỗi.

## Tab Elements

### Inspect & edit HTML/CSS

- Click element → xem HTML, CSS computed
- Edit inline → preview live
- "Force state" (`:hover`, `:active`...) → debug hover state

### Event Listeners của element

Element tab → bên phải → "Event Listeners" — xem mọi listener gắn vào element.

### Break on DOM changes

Chuột phải element → "Break on":
- Subtree modifications
- Attribute modifications
- Node removal

## Tab Application — Storage

### Xem & sửa Storage

- **Cookies** — danh sách cookies với value, expires, HttpOnly...
- **Local Storage** — key/value
- **Session Storage** — key/value
- **IndexedDB** — database
- **Cache Storage** — cache của Service Worker

### Xoá storage

Click "Clear storage" → check những gì muốn xoá → "Clear site data".

## Console API hữu ích

### `console.table`

Hiển thị mảng/object dạng bảng:

```js
console.table([
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
]);
// ┌─────────┬───────┬─────┐
// │ (index) │ name  │ age │
// ├─────────┼───────┼─────┤
// │ 0       │ Alice │ 30  │
// │ 1       │ Bob   │ 25  │
// └─────────┴───────┴─────┘

console.table(users, ["name"]);   // chỉ cột name
```

### `console.time` / `timeEnd`

Đo thời gian:

```js
console.time("fetch");
await fetch("/api/data");
console.timeEnd("fetch");
// fetch: 234ms
```

### `console.count`

Đếm số lần được gọi:

```js
function increment() {
  console.count("called");
}
increment();   // called: 1
increment();   // called: 2
```

### `console.trace`

In stack trace:

```js
function a() { b(); }
function b() { c(); }
function c() { console.trace("Here"); }

a();
// Here
//   c @ file.js:3
//   b @ file.js:2
//   a @ file.js:1
```

### `console.assert`

In lỗi nếu sai:

```js
console.assert(user.age > 0, "Age phải dương");
// Assertion failed: Age phải dương (nếu sai)
```

### `console.dir`

In object chi tiết:

```js
console.dir(document.body);
// Hiện structure object đầy đủ
```

### `copy()` — copy vào clipboard

```js
copy(largeObject);
copy(JSON.stringify(data, null, 2));
```

## Shortcut quan trọng

| Shortcut | Hành động |
|----------|-----------|
| `Ctrl+P` | Quick file search |
| `Ctrl+Shift+P` | Command palette (như VS Code) |
| `Ctrl+F` | Find in file |
| `Ctrl+Shift+F` | Find in all files |
| `Ctrl+L` | Clear console |
| `Ctrl+\` | Toggle device toolbar (responsive) |
| `Ctrl+Shift+M` | Toggle device mode |
| `Esc` | Toggle Drawer (Network conditions, Animations...) |

---

## Câu hỏi phỏng vấn

### Câu 1: Cách debug một bug "không tìm thấy element"?

**Đáp án:**

1. **Console**: gõ `document.querySelector(".my-class")` xem có trả về null
2. **Elements tab**: kiểm tra element có thực sự trong DOM
3. **Timing**: có thể element được render sau khi script chạy → check thứ tự load
4. **Breakpoint**: đặt breakpoint ngay trước dòng query → kiểm tra DOM state
5. **DOM Mutation Breakpoint**: chuột phải parent → "Break on subtree modifications" để biết element được tạo/xoá khi nào

### Câu 2: Conditional breakpoint là gì?

**Đáp án:**

Breakpoint **chỉ dừng** khi điều kiện thoả mãn — tránh dừng mọi iteration:

```js
for (let i = 0; i < 1000; i++) {
  process(i);   // ← chuột phải → conditional → "i === 500"
}
```

→ Chỉ dừng tại iteration 500.

Tương tự, **Logpoint** in log mà không dừng — hữu ích để theo dõi mà không sửa code.

### Câu 3: Phân biệt `console.log`, `console.dir`, `console.table`?

**Đáp án:**

```js
const user = { name: "Alice", age: 30, address: { city: "Hà Nội" } };

console.log(user);
// > {name: "Alice", age: 30, address: {...}}   (collapsed)

console.dir(user);
// Object hiển thị structure đầy đủ với expandable
// Hữu ích với DOM element: console.dir($0)

console.table([user, { name: "Bob", age: 25 }]);
// Hiển thị dạng bảng — đẹp cho mảng object
```

### Câu 4: Cách inspect element xuất hiện rồi biến mất ngay (vd: tooltip)?

**Đáp án:**

1. Mở element gây hiện tooltip (vd: hover button)
2. Mở DevTools → Sources tab
3. Đặt breakpoint hoặc nhấn `F8` để pause execution
4. → Tooltip dừng giữa chừng, có thể inspect

Cách 2:
1. Sources tab → "Event Listener Breakpoints" → check "Mouse → mouseover"
2. Hover element → JS pause → inspect

Cách 3 (Chrome 100+):
- Console: `setTimeout(() => debugger, 3000)` rồi hover element trong 3 giây.
