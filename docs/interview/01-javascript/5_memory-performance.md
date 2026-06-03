---
sidebar_position: 5
title: "5. Memory, Performance & Debugging"
---

# Memory, Performance & Debugging

> *Phần này hay được hỏi ở vòng cuối — interviewer muốn biết bạn đã thực sự "trải qua" production hay chỉ làm side project.*

---

## Câu 1: Memory leak phổ biến trong app FE — cách phát hiện và fix `[Intermediate]`

### Câu hỏi

> User báo app "càng dùng càng chậm", refresh thì ổn lại. Em sẽ debug từ đâu? Top 3 nguyên nhân memory leak em hay gặp?

### Giải thích lý thuyết

Memory leak xảy ra khi reference giữ object khỏi GC dù không còn cần. Top causes trong FE:

1. **Event listener không cleanup** — đặc biệt `window`, `document`, hoặc subscription.
2. **Timer/Interval** không clear khi component unmount.
3. **Closure giữ reference lớn** — biến không dùng nhưng còn trong scope.
4. **Detached DOM nodes** — node bị remove nhưng JS vẫn giữ reference.
5. **Cache vô hạn** — Map/object cache mà không có eviction.

### Code minh hoạ

```javascript
// LEAK 1: Listener không cleanup
function BadComponent() {
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    // Quên return cleanup → mỗi mount thêm 1 listener
  }, []);
}

function GoodComponent() {
  useEffect(() => {
    const handler = () => handleResize();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
}

// LEAK 2: Interval
function BadTimer() {
  useEffect(() => {
    setInterval(() => tick(), 1000); // không lưu id, không clear
  }, []);
}

function GoodTimer() {
  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, []);
}

// LEAK 3: Subscription
function GoodSub() {
  useEffect(() => {
    const unsub = store.subscribe(handler);
    return unsub; // pattern: return chính hàm unsub
  }, []);
}

// LEAK 4: Detached DOM trong closure
let detachedRef;
function setup() {
  const big = document.getElementById("huge-table");
  detachedRef = () => big.innerHTML; // big bị closure giữ
}
// Sau khi remove huge-table khỏi DOM, big vẫn trong memory
```

### Đáp án mẫu

> "Em sẽ mở Chrome DevTools > Memory tab, take heap snapshot ở 2 thời điểm — sau khi load và sau khi dùng app một lúc — rồi compare. Nếu thấy số object tăng dần khi user navigate, có khả năng là leak. Top 3 nguyên nhân em hay gặp: thứ nhất là **event listener trên `window`** không cleanup trong useEffect; thứ hai là **timer** không clear khi unmount; thứ ba là **subscription** (store, websocket) không unsubscribe. Pattern em luôn dùng: nếu useEffect có side effect 'gắn cái gì đó vào ngoài React', return một cleanup function. Còn với detached DOM thì dùng Performance > Memory > 'Detached DOM tree' để xem."

---

## Câu 2: Đo và tối ưu performance của một function tốn 200ms `[Intermediate]`

### Câu hỏi

> Em có một function `processData()` chạy mất 200ms và block UI. Em sẽ làm gì?

### Giải thích lý thuyết

Quy trình chuẩn:

1. **Đo** — không tối ưu mò. `performance.now()` hoặc DevTools > Performance.
2. **Tìm nút thắt** — flamegraph để biết hàm nào chiếm thời gian.
3. **Áp dụng đúng kỹ thuật**:
   - Algorithmic: giảm complexity (O(n²) → O(n)).
   - Memoization nếu lặp với cùng input.
   - Web Worker nếu CPU-bound thực sự nặng.
   - Chunking + yield nếu phải làm trên main thread.

### Code minh hoạ

```javascript
// 1. Đo trước khi tối ưu
const t0 = performance.now();
const result = processData(input);
console.log(`took ${performance.now() - t0}ms`);

// Hoặc dùng marks (đẹp hơn trong DevTools)
performance.mark("start");
processData(input);
performance.mark("end");
performance.measure("processData", "start", "end");

// 2. Memoization với cache key đúng
const cache = new Map();
function processCached(input) {
  const key = JSON.stringify(input); // chú ý: object phải có key ổn định
  if (cache.has(key)) return cache.get(key);
  const result = processData(input);
  cache.set(key, result);
  return result;
}

// 3. Chunking — chia nhỏ và yield về main thread
async function processChunked(items, chunkSize = 100) {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    results.push(...chunk.map(processOne));
    await new Promise((r) => setTimeout(r, 0)); // yield
  }
  return results;
}

// 4. Web Worker — off main thread hoàn toàn
// worker.js
self.onmessage = (e) => {
  const result = heavyProcess(e.data);
  self.postMessage(result);
};

// main
const worker = new Worker("worker.js");
worker.postMessage(input);
worker.onmessage = (e) => updateUI(e.data);

// 5. Modern: scheduler.postTask với priority
scheduler.postTask(() => processData(input), { priority: "background" });
```

### Đáp án mẫu

> "Đầu tiên em không tối ưu mò — em mở DevTools Performance tab, record session, xem flamegraph để xác định đâu là bottleneck thực sự (hay là `JSON.parse`, `forEach`, hay reflow). Sau khi biết, có 3 hướng: nếu hàm chạy với input lặp lại — em memoize bằng Map. Nếu là pure compute trên data lớn — em chuyển sang Web Worker để hoàn toàn off main thread. Nếu phải làm trên main vì cần DOM access — em chia thành chunk và yield bằng `setTimeout(0)` hoặc `scheduler.yield()` để UI thở. 200ms là rất nguy hiểm — vượt qua 50ms thì user đã cảm thấy lag."

---

## Câu 3: Debounce vs Throttle — cài đặt và chọn cái nào? `[Intermediate]`

### Câu hỏi

> Viết tay implementation của debounce. Sau đó: scroll handler em chọn debounce hay throttle? Search input thì sao?

### Giải thích lý thuyết

| Pattern    | Hành vi                                              | Use case                              |
| ---------- | ---------------------------------------------------- | ------------------------------------- |
| Debounce   | Đợi không có call mới trong X ms rồi mới chạy        | Search input, autocomplete, validate  |
| Throttle   | Chạy tối đa 1 lần mỗi X ms                          | Scroll, mousemove, resize, drag       |

### Code minh hoạ

```javascript
// Debounce — chỉ chạy sau khi "ngừng gọi" delay ms
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Debounce với cancel + flush
function debounceAdv(fn, delay) {
  let timer, lastArgs;
  const debounced = (...args) => {
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(() => fn(...lastArgs), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  debounced.flush  = () => { clearTimeout(timer); if (lastArgs) fn(...lastArgs); };
  return debounced;
}

// Throttle — chạy tối đa 1 lần / delay ms
function throttle(fn, delay) {
  let lastCall = 0;
  let timer;
  return (...args) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);
    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
    } else {
      // Trailing — đảm bảo lần gọi cuối cũng chạy
      clearTimeout(timer);
      timer = setTimeout(() => { lastCall = Date.now(); fn(...args); }, remaining);
    }
  };
}

// Use case
const onSearch = debounce((q) => fetchAPI(q), 300);     // đợi user gõ xong
const onScroll = throttle(() => trackPosition(), 100);  // tối đa 10 lần/s
```

### Đáp án mẫu

> "Cho scroll, em chọn **throttle** — vì scroll fire liên tục (60+ lần/s), nếu debounce thì user kéo cả màn hình mà UI không update. Throttle 100-200ms cho phép update mượt mà nhưng không quá tải. Cho search input, em chọn **debounce** 300ms — không gọi API mỗi keystroke, mà đợi user 'ngừng gõ' rồi mới gọi, tiết kiệm request rõ rệt. Cài đặt debounce dùng `setTimeout` + `clearTimeout` mỗi lần invoke. Bản nâng cao có thêm `.cancel()` để huỷ pending call (cần khi component unmount) và `.flush()` để force chạy ngay (ví dụ form submit khi pending validation)."

---

## Câu 4: Equality — `===`, `==`, `Object.is`, deep equal `[Intermediate]`

### Câu hỏi

> ```javascript
> NaN === NaN;           // ?
> 0 === -0;              // ?
> Object.is(NaN, NaN);   // ?
> Object.is(0, -0);      // ?
> ```
>
> Và làm sao để check 2 object có "equal" về giá trị không?

### Giải thích lý thuyết

| Comparison      | `===` (Strict Equality) | `Object.is` (Same-Value) |
| --------------- | ----------------------- | ------------------------ |
| `NaN, NaN`      | `false`                 | `true`                   |
| `0, -0`         | `true`                  | `false`                  |
| `1, "1"`        | `false`                 | `false`                  |

`==` (loose equality) làm type coercion → tránh dùng. Quy tắc duy nhất nên nhớ: `x == null` true với cả `null` và `undefined` (dùng để check "no value").

Object/array so sánh bằng `===` chỉ check **reference**, không check giá trị.

### Code minh hoạ

```javascript
NaN === NaN;                  // false
0 === -0;                     // true
Object.is(NaN, NaN);          // true
Object.is(0, -0);             // false

// Pitfall NaN
const arr = [1, NaN, 3];
arr.indexOf(NaN);             // -1 (dùng ===)
arr.includes(NaN);            // true (dùng SameValueZero)

// == coercion bẫy nổi tiếng
[] == ![];                    // true ([] → "" → 0; ![] → false → 0)
null == undefined;            // true
null == 0;                    // false

// Deep equality
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(a[k], b[k]));
}

// Production: dùng lib (lodash.isEqual, fast-deep-equal)
// hoặc structuredClone + JSON.stringify nếu data có shape ổn định
```

### Đáp án mẫu

> "`NaN === NaN` là `false` (NaN không bằng bất kỳ thứ gì, kể cả chính nó), `0 === -0` là `true`. `Object.is` thì ngược lại: `Object.is(NaN, NaN)` true, `Object.is(0, -0)` false — nó implement 'SameValue' algorithm. Để check NaN trong array, dùng `.includes` chứ không phải `.indexOf`. Em không dùng `==` trừ một trường hợp duy nhất: `x == null` để check cả null/undefined. Cho deep equal em viết tay nếu shape đơn giản, hoặc dùng `lodash.isEqual`. React `useMemo`/`useEffect` dùng `Object.is` cho comparison — đó là lý do object literal mới mỗi render gây re-run effect."

---

## Câu 5: Mảng vs Object — chọn cấu trúc nào cho lookup nhanh? `[Senior]`

### Câu hỏi

> Em có list 10,000 user, cần lookup theo `id` rất thường xuyên. So sánh dùng `Array.find` vs `Object {id: user}` vs `Map`. Trade-off?

### Giải thích lý thuyết

| Cấu trúc                   | Lookup theo key | Iteration | Order            | Key types       |
| -------------------------- | --------------- | --------- | ---------------- | --------------- |
| `Array` + `.find`          | O(n)            | O(n)      | Insertion        | Index (number)  |
| Object `{ [id]: user }`    | O(1) avg        | O(n)      | String keys, mostly insertion (ES2015+) | String/Symbol |
| `Map`                      | O(1) avg        | O(n)      | Insertion        | Any (object OK) |

### Code minh hoạ

```javascript
const users = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `u${i}` }));

// Cách 1: find — O(n)
const u = users.find((x) => x.id === 9999); // chậm

// Cách 2: Object index
const byId = Object.fromEntries(users.map((u) => [u.id, u]));
byId[9999]; // O(1)

// Cách 3: Map (ưu tiên khi key non-string hoặc cần size + iteration order chắc chắn)
const byIdMap = new Map(users.map((u) => [u.id, u]));
byIdMap.get(9999); // O(1)
byIdMap.size;      // built-in

// Bench: với 10k entry, lookup 1000 lần
// .find: ~50-100ms
// object/Map: ~0.1ms

// Pitfall: object keys luôn là string
const obj = {};
obj[1] = "a";
Object.keys(obj); // ["1"] — string, không phải number
obj["1"] === obj[1]; // true vì coerce

// Map giữ đúng type
const m = new Map();
m.set(1, "num");
m.set("1", "str");
m.size; // 2 — hai entry khác nhau
```

### Đáp án mẫu

> "Với 10k user và lookup thường xuyên, em chuyển sang `Map` hoặc plain object `{[id]: user}` — cả hai đều O(1), nhanh hơn `.find` O(n) cả trăm lần. Chọn giữa Map và Object: nếu key là string đơn thuần và data static, object đơn giản và serializable; nếu key có thể là number/object hoặc cần `size` và iteration order rõ ràng, em dùng `Map`. Trade-off: build index tốn O(n) một lần và tốn extra memory, nhưng đáng nếu lookup chạy nhiều. Trong React, em thường lưu data dạng `Map` hoặc index object trong useMemo và truyền xuống component thay vì array."

---

## Câu 6: Garbage Collection — em hiểu thế nào? `[Senior]`

### Câu hỏi

> JavaScript GC hoạt động ra sao? Em có chủ động "help" GC bằng cách gán `= null` không?

### Giải thích lý thuyết

JS engines (V8) dùng **generational GC**:

- **Young generation** (new objects): GC thường xuyên, nhanh (scavenger).
- **Old generation** (survive nhiều cycle): GC ít hơn, mark-sweep / mark-compact.

Thuật toán: **Reachability** — object không reachable từ root (global, stack, register) sẽ được thu hồi.

**Gán `= null` thường KHÔNG cần thiết**:

- Local variable tự GC khi scope kết thúc.
- Chỉ cần thiết khi giữ reference dài hạn ở global/closure mà bạn biết không dùng nữa.

### Code minh hoạ

```javascript
// Không cần null
function process() {
  const huge = new Array(1e6);
  doStuff(huge);
} // hết scope → huge tự GC

// Cần null (giải phóng sớm trong scope dài)
function longRunning() {
  const huge = new Array(1e6);
  doStuff(huge);
  huge.length = 0; // hoặc gán biến tham chiếu = null nếu giữ global
  // ... 30 phút nữa
  doOtherStuff();
}

// Memory leak phổ biến: closure giữ ref
function attachHandler() {
  const big = new Array(1e6).fill(0);
  document.getElementById("btn").onclick = () => {
    // even nếu KHÔNG dùng big, closure vẫn giữ reference
    console.log("clicked");
  };
}
// Fix: tách callback không capture big

// FinalizationRegistry — chạy callback khi object bị GC
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object with id ${heldValue} was GCed`);
});
let obj = { id: 1 };
registry.register(obj, "1");
obj = null; // có thể bị GC bất kỳ lúc nào
```

### Đáp án mẫu

> "V8 dùng generational mark-sweep — object mới ở young gen GC nhanh và thường xuyên, survive nhiều cycle thì promote lên old gen. Cốt lõi là **reachability**: nếu không có chain từ root tới object thì nó sẽ bị thu. Em **không** gán `= null` reflexively — local variable tự GC khi scope kết thúc. Chỉ cần null trong 2 trường hợp: object lớn được giữ trong scope dài (long-running function), hoặc khi pattern observer/cache giữ reference lâu. Quan trọng hơn việc null là tránh leak source: cleanup listener, clear timer, unsubscribe — đó mới là điều dev FE cần lo. `FinalizationRegistry` thì hiếm khi dùng trừ khi viết library."

---

## Câu 7: Vòng lặp nào chạy nhanh nhất? `[Intermediate]`

### Câu hỏi

> Trong JS có `for`, `for...of`, `forEach`, `for...in`, `map/filter/reduce`. Vòng lặp nào chạy nhanh nhất và tại sao? Em chọn loại nào trong code thực tế?

### Giải thích lý thuyết

Thứ tự tốc độ (nhanh → chậm) trên mảng, đo trong V8 với data lớn:

| Loop                       | Tốc độ tương đối | Lý do                                                              |
| -------------------------- | ---------------- | ------------------------------------------------------------------ |
| `for` classic (cache len)  | **Nhanh nhất**   | Không gọi callback, không tạo iterator, chỉ tăng index             |
| `for...of`                 | Nhanh            | Dùng iterator protocol (`Symbol.iterator`) — có chút overhead       |
| `forEach`                  | Trung bình       | Mỗi phần tử gọi 1 callback → tốn function call overhead             |
| `map` / `filter` / `reduce`| Trung bình–chậm  | Callback + tạo mảng/giá trị mới → cấp phát memory                   |
| `for...in`                 | **Chậm nhất**    | Duyệt cả **key** (string) + đi lên **prototype chain**, không nên dùng cho mảng |

Ba điểm cần nhấn mạnh trong phỏng vấn:

1. **`for` classic thắng** vì không có overhead gọi hàm và không tạo object trung gian. Nhưng phải **cache `length`** (`for (let i = 0, n = arr.length; i < n; i++)`) để khỏi đọc property mỗi vòng.
2. **`for...in` KHÔNG dùng cho mảng** — nó duyệt key dạng string, kể cả property kế thừa và property tự thêm, sai cả thứ tự lẫn ý nghĩa. `for...in` chỉ hợp khi duyệt key của plain object.
3. Trong **thực tế**, khác biệt thường **không đáng kể** với mảng vài nghìn phần tử. V8 tối ưu rất mạnh. → Ưu tiên **readability** (`map`/`for...of`), chỉ micro-optimize sau khi **đo** và xác định đây là hot path.

### Code minh hoạ

```javascript
const arr = Array.from({ length: 1_000_000 }, (_, i) => i);

// NHANH NHẤT: for classic, cache length
let sum = 0;
for (let i = 0, n = arr.length; i < n; i++) {
  sum += arr[i];
}

// for...of — readable, hơi chậm hơn do iterator
let sum2 = 0;
for (const x of arr) sum2 += x;

// forEach — callback overhead, KHÔNG break/continue được, không await tuần tự được
let sum3 = 0;
arr.forEach((x) => { sum3 += x; });

// reduce — functional, tạo overhead callback mỗi phần tử
const sum4 = arr.reduce((acc, x) => acc + x, 0);

// for...in — CHẬM NHẤT + SAI cho mảng
for (const i in arr) {
  // i là string "0", "1", ... và duyệt cả property kế thừa
}
```

```javascript
// Cách đo đúng (đừng tin cảm tính)
function bench(label, fn) {
  const t0 = performance.now();
  fn();
  console.log(`${label}: ${(performance.now() - t0).toFixed(2)}ms`);
}

bench("for", () => { for (let i = 0, n = arr.length; i < n; i++) arr[i]; });
bench("for...of", () => { for (const x of arr) x; });
bench("forEach", () => arr.forEach((x) => x));
bench("reduce", () => arr.reduce((a, x) => a + x, 0));
// Lưu ý: chạy nhiều lần, bỏ lần đầu (JIT warm-up) mới có số đáng tin
```

### Đáp án mẫu

> "Nhanh nhất là **`for` classic** có cache `length` — vì nó không gọi callback và không tạo iterator hay mảng trung gian, chỉ tăng index thuần. Sau đó là `for...of` (tốn chút overhead của iterator protocol), rồi `forEach` và `map/reduce` (mỗi phần tử gọi 1 callback). Chậm nhất là **`for...in`** — nó duyệt key dạng string và đi lên cả prototype chain, nên em **không bao giờ** dùng cho mảng, chỉ dùng để duyệt key của plain object. Nhưng quan trọng hơn: với mảng vài nghìn phần tử thì khác biệt gần như không cảm nhận được vì V8 tối ưu rất mạnh — nên em ưu tiên **đọc dễ hiểu** (`map`, `for...of`) và chỉ đổi sang `for` classic khi đo được đây thực sự là bottleneck. Em cũng nhớ: `forEach` không `break`/`continue` được và không `await` tuần tự được — cần những cái đó thì phải dùng `for...of`."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| "JS không có memory leak vì có GC"                     | Vẫn leak khi còn reachable mà không cần dùng (listener, closure)   |
| "Throttle = debounce"                                  | Throttle chạy đều, debounce đợi yên                                |
| "`indexOf` tìm được NaN"                               | Không, dùng `.includes` cho NaN                                    |
| "Gán `= null` luôn giúp GC sớm hơn"                    | Local scope tự xử; chỉ hữu ích ở global/closure dài hạn            |
| "Web Worker share memory với main thread"              | Không (trừ SharedArrayBuffer); message phải postMessage qua structured clone |
| "Dùng `for...in` để duyệt mảng"                        | Sai — duyệt key string + prototype chain; mảng dùng `for`/`for...of` |
| "`forEach` nhanh hơn `for` vì là built-in"             | Ngược lại — callback overhead làm `forEach` chậm hơn `for` classic |
