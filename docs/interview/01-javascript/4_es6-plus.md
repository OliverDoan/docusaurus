---
sidebar_position: 4
title: "4. ES6+ và các tính năng modern"
---

# ES6+ và các tính năng modern

> *Phần này dùng để phân biệt dev "code theo template" và dev "đọc release note". ES6 ra mắt 2015 nhưng năm nào cũng có thêm tính năng — interviewer kỳ vọng bạn cập nhật.*

---

## Câu 1: Destructuring có gì hay ngoài việc gán biến? `[Intermediate]`

### Câu hỏi

> Cho anh xem em dùng destructuring "nâng cao" như thế nào — không chỉ là `const { a, b } = obj`.

### Giải thích lý thuyết

Destructuring hỗ trợ:

- Default value (chỉ áp dụng khi giá trị là `undefined`, KHÔNG phải `null`).
- Rename: `{ a: x }`.
- Nested.
- Trong function parameter.
- Rest pattern.
- Swap variables.

### Code minh hoạ

```javascript
// 1. Default + rename + nested
const user = { name: "An", profile: { age: 25 } };
const { name: userName, profile: { age = 18 } = {}, role = "guest" } = user;
// userName = "An", age = 25, role = "guest"

// 2. Default KHÔNG áp dụng cho null
const { x = 1 } = { x: null };       // x = null (không phải 1)
const { y = 1 } = { y: undefined };  // y = 1

// 3. Param destructuring với default param
function createUser({ name, age = 18, roles = [] } = {}) {
  return { name, age, roles };
}
createUser();              // { name: undefined, age: 18, roles: [] }
createUser({ name: "A" }); // { name: "A", age: 18, roles: [] }

// 4. Rest trong destructuring
const { id, ...rest } = { id: 1, name: "A", age: 25 };
// id = 1, rest = { name: "A", age: 25 } — pattern để tách field

// 5. Swap variables
let a = 1, b = 2;
[a, b] = [b, a];

// 6. Trả về nhiều giá trị
function useFetch(url) {
  return { data: null, error: null, loading: false };
}
const { data, error } = useFetch("/api");

// 7. Pitfall: destructure trong loop body
// const { item } = items;        // ❌ items là array, không phải object
const [item] = items;             // ✅
```

### Đáp án mẫu

> "Em dùng destructuring với 4 pattern chính: thứ nhất là param destructuring với default — `function fn({ name = 'guest' } = {}) {}` cho phép gọi `fn()` không cần truyền args. Thứ hai là rest pattern để 'tách field': `const { id, ...rest } = obj`. Thứ ba là nested + rename khi nhận response API có shape lạ. Thứ tư là swap variable. Một pitfall hay quên: default value chỉ apply cho `undefined`, không apply cho `null` — nên với API trả `null` thì phải dùng `??` riêng."

---

## Câu 2: Spread vs Rest — khác nhau chỗ nào? `[Intermediate]`

### Câu hỏi

> Cả hai đều dùng dấu `...`. Khi nào là spread, khi nào là rest? Cho ví dụ thực tế.

### Giải thích lý thuyết

Cùng cú pháp, ngược nhau về hành động:

- **Spread**: "trải" — dùng ở chỗ expression. Mở object/iterable ra.
- **Rest**: "gom" — dùng ở chỗ pattern (param, destructure). Gom phần còn lại vào array/object.

### Code minh hoạ

```javascript
// SPREAD (expression position)
const a = [1, 2, 3];
const b = [...a, 4];                    // [1, 2, 3, 4]
const c = [...a].sort();                // copy trước khi sort (sort mutate)

const obj1 = { x: 1, y: 2 };
const obj2 = { ...obj1, z: 3 };         // { x: 1, y: 2, z: 3 }
const obj3 = { ...obj1, x: 10 };        // override — { x: 10, y: 2 }

Math.max(...a);                          // function call
new Set([...a, ...b]);                   // union nhanh

// REST (pattern position)
function sum(...nums) {                  // gom args vào array
  return nums.reduce((a, b) => a + b, 0);
}

const { id, ...rest } = obj;             // gom property còn lại
const [first, ...others] = a;            // gom phần tử còn lại

// Pitfall: Shallow copy
const original = { user: { name: "A" } };
const copy = { ...original };
copy.user.name = "B";
console.log(original.user.name);         // "B" — shared reference!

// Đúng: deep copy nếu cần
const deepCopy = structuredClone(original); // modern API
```

### Đáp án mẫu

> "Cú pháp giống nhau nhưng vị trí khác: spread ở expression position (mở object/array ra), rest ở pattern position (gom lại). Em hay dùng spread để update state immutable trong React: `setUser({ ...user, name: 'new' })`, hoặc copy array trước khi `.sort` để không mutate gốc. Rest dùng nhiều khi viết function nhận biến số argument hoặc tách field khỏi object. Bẫy cần nhớ: spread chỉ shallow copy — nested object vẫn share reference. Để deep copy dùng `structuredClone` hoặc viết tay tuỳ depth."

---

## Câu 3: Optional chaining `?.` và nullish coalescing `??` `[Intermediate]`

### Câu hỏi

> `obj?.a ?? 'default'` và `obj && obj.a || 'default'` khác nhau thế nào? Khi nào em chọn cái nào?

### Giải thích lý thuyết

- `?.` ngắn mạch khi giá trị **`null` hoặc `undefined`**.
- `??` fallback chỉ khi **`null` hoặc `undefined`** (KHÁC với `||` fallback khi falsy).

| Input         | `value \|\| 'default'` | `value ?? 'default'` |
| ------------- | ---------------------- | -------------------- |
| `0`           | `'default'`            | `0`                  |
| `''`          | `'default'`            | `''`                 |
| `false`       | `'default'`            | `false`              |
| `null`        | `'default'`            | `'default'`          |
| `undefined`   | `'default'`            | `'default'`          |

### Code minh hoạ

```javascript
// Optional chaining
const user = { profile: null };
user?.profile?.name;                      // undefined, không throw
user?.profile?.[dynamicKey];              // bracket access
user?.profile?.getName?.();               // method call
user?.profile?.items?.[0]?.title;         // mảng

// Nullish coalescing — đúng cho số 0 và empty string
const count = data.count ?? 10;           // count = 0 vẫn giữ 0
const name  = data.name  ?? "Anonymous";  // name = "" vẫn giữ ""

// Bug cổ điển với ||
function showCount(n) {
  return `Bạn có ${n || "không"} item`;   // n=0 → "không item" ❌
}
function showCountFix(n) {
  return `Bạn có ${n ?? "không"} item`;   // n=0 → "0 item" ✅
}

// Combine ?. và ??
const port = config?.server?.port ?? 3000;

// Không thể trộn ?? với && / || mà không có ngoặc
// const x = a ?? b || c;     // SyntaxError
const x = (a ?? b) || c;       // OK

// Optional chaining KHÔNG hỗ trợ assignment
// user?.profile?.name = "X";  // SyntaxError
```

### Đáp án mẫu

> "`?.` ngắn mạch khi value là null/undefined, tránh throw `TypeError: Cannot read property of null`. `??` fallback chỉ khi null/undefined — khác `||` vốn fallback mọi falsy. Bug em thấy nhiều nhất là dùng `||` cho số: `const count = props.count || 10` — khi `count = 0` thì hiển thị `10` sai. Đổi sang `??` là fix. Combine cả hai: `config?.server?.port ?? 3000` — vừa safe access vừa default đúng. Lưu ý không trộn `??` với `&&`/`||` mà không bọc ngoặc, sẽ SyntaxError."

---

## Câu 4: Iterator vs Generator — dùng cho gì trong thực tế? `[Senior]`

### Câu hỏi

> Em đã thấy `function*` chưa? Cho anh một use case mà generator thực sự đáng dùng — không phải toy example.

### Giải thích lý thuyết

- **Iterator**: object có method `next()` trả `{ value, done }`. Mọi thứ iterable (`for...of`, spread, `Array.from`) đều dựa trên iterator protocol.
- **Generator**: function dùng `function*` + `yield`, tự động tạo iterator. Có thể "pause/resume", giữ state nội bộ.

### Code minh hoạ

```javascript
// 1. Lazy infinite sequence
function* naturals() {
  let n = 1;
  while (true) yield n++;
}
const gen = naturals();
gen.next().value; // 1
gen.next().value; // 2

// Take N — không thể với for thường vì vô hạn
function take(iter, n) {
  const out = [];
  for (const v of iter) {
    if (out.length === n) break;
    out.push(v);
  }
  return out;
}
take(naturals(), 5); // [1, 2, 3, 4, 5]

// 2. Pagination iterator
async function* fetchAllPages(url) {
  let cursor = null;
  do {
    const res = await fetch(`${url}?cursor=${cursor ?? ""}`);
    const page = await res.json();
    for (const item of page.items) yield item;
    cursor = page.nextCursor;
  } while (cursor);
}

// Consumer code rất sạch
for await (const item of fetchAllPages("/api/users")) {
  console.log(item);
  if (shouldStop()) break; // dừng giữa chừng, không fetch tiếp
}

// 3. Custom iterable
class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i++) yield i;
  }
}
for (const x of new Range(1, 5)) console.log(x); // 1 2 3 4
[...new Range(1, 4)]; // [1, 2, 3]

// 4. State machine
function* trafficLight() {
  while (true) {
    yield "red"; yield "green"; yield "yellow";
  }
}
```

### Đáp án mẫu

> "Generator dùng `function*` + `yield`, tự pause/resume nên rất hợp với 2 use case thực tế: thứ nhất là **paginated API** — viết `async function*` để yield từng item, consumer chỉ cần `for await...of` rất sạch và có thể `break` để dừng fetch giữa chừng. Thứ hai là **lazy sequence** vô hạn — naturals, infinite stream — không thể tạo bằng array nhưng generator thì pause được nên không tốn memory. Em từng dùng async generator để stream log từ server về client qua SSE, code rất ngắn so với implement iterator protocol tay."

---

## Câu 5: Module — CommonJS vs ESM, dynamic import `[Senior]`

### Câu hỏi

> Dự án em đang chuyển từ CJS sang ESM. Em hãy giải thích khác biệt cơ bản, và khi nào nên dùng `import()` (dynamic) thay vì `import` (static)?

### Giải thích lý thuyết

| Tính chất             | CommonJS (CJS)              | ES Modules (ESM)                |
| --------------------- | --------------------------- | ------------------------------- |
| Cú pháp               | `require` / `module.exports` | `import` / `export`             |
| Load                  | Synchronous, runtime         | Asynchronous, statically parsed |
| Top-level await       | Không                       | Có                              |
| Live binding          | Không (copy giá trị)        | Có (reference)                  |
| Tree-shaking          | Khó                         | Native (static analysis)        |
| Trong browser         | Cần bundler                 | Native với `<script type="module">` |

Dynamic `import()` trả về Promise → cho phép code splitting và lazy loading.

### Code minh hoạ

```javascript
// CJS — runtime, synchronous
const fs = require("fs");
module.exports = { foo };

// ESM — static, async
import fs from "fs";
import { foo } from "./utils.js";
export { foo };

// Top-level await chỉ có trong ESM
const data = await fetch("/api/config").then((r) => r.json());

// Live binding: ESM giữ reference, CJS copy
// counter.mjs
export let count = 0;
export function inc() { count++; }

// main.mjs
import { count, inc } from "./counter.mjs";
console.log(count); // 0
inc();
console.log(count); // 1 — vẫn nhìn thấy update

// Dynamic import — code splitting trong React
function App() {
  const [Chart, setChart] = useState(null);

  return (
    <button onClick={async () => {
      const mod = await import("./Chart.jsx"); // chỉ tải khi click
      setChart(() => mod.default);
    }}>
      Show chart
    </button>
  );
}

// Conditional import
async function loadPolyfill() {
  if (!window.IntersectionObserver) {
    await import("intersection-observer");
  }
}
```

### Đáp án mẫu

> "Khác biệt chính: ESM được parse tĩnh nên hỗ trợ tree-shaking và top-level `await`, CJS load sync runtime. ESM dùng live binding (reference), CJS copy value. Dynamic `import()` trả Promise — em dùng cho 3 mục đích: thứ nhất là **code splitting** route-based (`React.lazy` thực chất dùng dynamic import); thứ hai là **lazy load** module heavy chỉ khi user trigger (ví dụ Chart, Editor — đỡ tới 70-80% bundle initial); thứ ba là **conditional polyfill** load chỉ khi browser thiếu API. Lưu ý ESM không cho phép `import` trong function body — bắt buộc top-level. Để 'import động' phải dùng `import()`."

---

## Câu 6: `Symbol` và `WeakMap`/`WeakRef` — khi nào thực sự cần? `[Senior]`

### Câu hỏi

> Em đã dùng `Symbol` hay `WeakMap` trong dự án chưa? Cho ví dụ một bài toán mà `Map` thường không giải được.

### Giải thích lý thuyết

- **`Symbol`**: primitive duy nhất, unique. Dùng cho property "ẩn", well-known symbols (`Symbol.iterator`, `Symbol.asyncIterator`).
- **`WeakMap`/`WeakSet`**: key BUỘC là object, không giữ object khỏi GC. Ngược lại với `Map` — nếu object key bị remove khỏi mọi reference khác, GC sẽ thu hồi cả entry trong WeakMap.
- **`WeakRef`** (ES2021): cho phép giữ reference yếu tới object → không cản trở GC.

### Code minh hoạ

```javascript
// 1. Symbol làm "private" property
const _balance = Symbol("balance");
class Account {
  constructor(initial) { this[_balance] = initial; }
  deposit(amt) { this[_balance] += amt; }
  get balance() { return this[_balance]; }
}
const acc = new Account(100);
acc.balance;       // 100
acc[_balance];     // 100 — chỉ truy cập được nếu có ref tới symbol gốc
Object.keys(acc);  // [] — symbol property KHÔNG hiện trong keys

// 2. Symbol.iterator để làm iterable
class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  [Symbol.iterator]() {
    let i = this.start;
    return { next: () => i < this.end ? { value: i++, done: false } : { done: true } };
  }
}
[...new Range(1, 4)]; // [1, 2, 3]

// 3. WeakMap — gắn metadata cho object mà không gây leak
const cache = new WeakMap();

function getRendered(node) {
  if (!cache.has(node)) cache.set(node, expensiveRender(node));
  return cache.get(node);
}

// Khi node bị remove khỏi DOM và không còn reference, WeakMap entry tự biến mất
// Nếu dùng Map → leak vì Map giữ reference

// 4. WeakRef — observe object mà không cản GC
const ref = new WeakRef(largeObject);
// ... sau một lúc
const obj = ref.deref(); // có thể là undefined nếu đã bị GC
if (obj) doSomething(obj);
```

### Đáp án mẫu

> "`Symbol` em dùng nhiều nhất qua `Symbol.iterator` để make object iterable, ít khi tạo Symbol thủ công vì class private field (`#`) đã ngon hơn. `WeakMap` thì dùng khi cần gắn metadata cho object DOM hoặc instance mà không muốn ngăn GC — ví dụ cache kết quả render theo node. Nếu dùng `Map` thường, mỗi DOM node bị remove khỏi tree vẫn bị Map giữ → leak. `WeakRef` ít gặp, chủ yếu trong thư viện như observer hoặc finalization. Quy tắc của em: bắt đầu bằng `Map`, chỉ chuyển `WeakMap` khi đã xác định memory leak liên quan tới object lifetime."

---

## Câu 7: Arrow function khác regular function ở những điểm nào? `[Intermediate]`

### Câu hỏi

> Liệt kê các khác biệt giữa arrow function và `function` thường. Khi nào em **không** được dùng arrow function?
>
> ```javascript
> const obj = {
>   name: "A",
>   regular() { return this.name; },
>   arrow: () => this.name,
> };
> obj.regular(); // ?
> obj.arrow();   // ?
> ```

### Giải thích lý thuyết

| Đặc điểm                  | Arrow function `() => {}`                  | Regular `function () {}`                  |
| ------------------------- | ------------------------------------------ | ----------------------------------------- |
| `this`                    | **Lexical** — kế thừa từ scope ngoài, không bind lại được | Động — phụ thuộc cách gọi (4 quy tắc binding) |
| `arguments`               | **Không có** (lấy `arguments` lexical)     | Có object `arguments`                     |
| Dùng với `new`            | **Không** — `TypeError: not a constructor` | Có (constructor)                          |
| `prototype` property      | Không có                                   | Có                                        |
| Hoisting                  | Không (là biến — theo `let`/`const`/`var`) | Function declaration được hoist toàn bộ   |
| `yield` / generator       | Không thể là generator                     | Có thể (`function*`)                      |
| Cú pháp implicit return   | Có (`x => x * 2`)                           | Không, luôn cần `return`                  |
| Là method (`super`, named)| Không nên dùng làm method                  | Phù hợp làm method                        |

**Khi KHÔNG dùng arrow function:**

1. **Object method** cần `this` trỏ tới object — arrow lấy `this` lexical (thường là `window`/`undefined`).
2. **Prototype method** — `Foo.prototype.bar = () => {}` sai `this`.
3. **Constructor** — không `new` được.
4. **Event handler DOM** khi cần `this` = element (`addEventListener` callback).
5. **Generator** hoặc khi cần `arguments` object.

### Code minh hoạ

```javascript
const obj = {
  name: "A",
  regular() { return this.name; },
  arrow: () => this.name, // this = lexical (module/global), KHÔNG phải obj
};
obj.regular(); // "A"
obj.arrow();   // undefined (this.name ở scope ngoài)

// arguments
function regular() { return arguments.length; }
const arrow = () => arguments; // ReferenceError (hoặc lấy arguments ngoài)
regular(1, 2, 3); // 3
// → arrow muốn nhận nhiều tham số thì dùng rest: (...args) => args.length

// new
const Person = (name) => { this.name = name; };
new Person("A"); // TypeError: Person is not a constructor

// Lợi thế arrow: giữ this trong callback (không cần bind)
class Timer {
  seconds = 0;
  start() {
    setInterval(() => { this.seconds++; }, 1000); // this = instance ✔
  }
}

// Bẫy: arrow làm event handler khi cần this = element
button.addEventListener("click", function () {
  this.classList.toggle("active"); // this = button ✔
});
button.addEventListener("click", () => {
  // this KHÔNG phải button → dùng e.currentTarget thay thế
});
```

### Đáp án mẫu

> "Khác biệt cốt lõi: arrow function **không có `this` riêng** — nó lấy `this` theo lexical scope nơi định nghĩa, và không thể đổi bằng `call/apply/bind`. Ngoài ra arrow **không có `arguments`**, **không dùng được với `new`** (không phải constructor, không có `prototype`), và không làm generator được. Với đoạn code trên: `obj.regular()` trả `'A'` vì `this` trỏ tới `obj`, còn `obj.arrow()` trả `undefined` vì `this` là scope ngoài chứ không phải `obj`. Vì vậy em **không** dùng arrow cho object method, prototype method, constructor, hay event handler cần `this` = element. Ngược lại, arrow rất hợp làm callback trong `setInterval`, `.map`, hay React class field `handleClick = () => {}` vì nó tự giữ `this` của scope ngoài, khỏi cần `bind`."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                              | Đúng là                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| "Default value trong destructure áp dụng với null"   | Chỉ áp dụng với `undefined`. `null` được giữ nguyên                    |
| "Spread deep copy object"                            | Chỉ shallow — nested object vẫn share reference                        |
| "Optional chaining cho phép gán giá trị"             | Không — `a?.b = c` SyntaxError                                          |
| "Generator phải dùng async"                          | Generator đồng bộ; `async function*` mới là async generator            |
| "ESM và CJS interop hoàn toàn"                       | Có nhiều edge case (default export, `__dirname`, `require.cache`)      |
| "Arrow function chỉ là cú pháp ngắn của function"    | Khác về `this`, `arguments`, `new`, `prototype`, generator             |
| "Arrow function dùng được làm object method"         | Sai `this` — dùng shorthand method `regular() {}` thay thế             |
