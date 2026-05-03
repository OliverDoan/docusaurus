---
sidebar_position: 3
title: "3. Event Loop, Callback Queue & Microtask"
---

# Event Loop, Callback Queue & Microtask

Hiểu Event Loop là hiểu cách JavaScript vận hành. Đây là nhóm câu hỏi mà interviewer dùng để phân loại ứng viên: nếu bạn trả lời tốt, bạn chứng minh mình hiểu JavaScript ở level sâu, không chỉ biết viết code.

---

## Mục lục

- [Câu 1: JavaScript single-threaded model `[Intermediate]`](#câu-1-javascript-single-threaded-model-intermediate)
- [Câu 2: Call Stack, Web APIs, Callback Queue `[Intermediate]`](#câu-2-call-stack-web-apis-callback-queue-intermediate)
- [Câu 3: Microtask Queue vs Macrotask Queue `[Senior]`](#câu-3-microtask-queue-vs-macrotask-queue-senior)
- [Câu 4: `requestAnimationFrame` nằm ở đâu? `[Senior]`](#câu-4-requestanimationframe-nằm-ở-đâu-senior)
- [Câu 5: Promise.then() vs setTimeout -- thứ tự thực thi `[Senior]`](#câu-5-promisethen-vs-settimeout-thứ-tự-thực-thi-senior)
- [Câu 6: Bài tập output prediction nâng cao `[Senior]`](#câu-6-bài-tập-output-prediction-nâng-cao-senior)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: JavaScript single-threaded model `[Intermediate]`

### Câu hỏi

> JavaScript là single-threaded, vậy sao nó xử lý được nhiều tác vụ đồng thời (async)?

### Giải thích lý thuyết

JavaScript engine (V8, SpiderMonkey) chỉ có **một thread chính** để thực thi code. Nhưng nó hoạt động trong một **runtime environment** (browser hoặc Node.js) cung cấp:

- **Web APIs** (browser): DOM, setTimeout, fetch, XMLHttpRequest
- **C++ APIs** (Node.js): file system, network, crypto
- **Event Loop**: Cơ chế điều phối giữa call stack và các task queue

Mô hình hoạt động:

```
Call Stack -> Chạy code đồng bộ
     |
     v
Web APIs -> Xử lý async (timer, network, DOM events)
     |
     v
Task Queues -> Đợi đến khi call stack trống
     |
     v
Event Loop -> Đẩy callback từ queue vào call stack
```

### Code ví dụ

```javascript
console.log("1 - Bắt đầu");

setTimeout(function () {
  console.log("2 - setTimeout");
}, 0); // Dù delay = 0, vẫn phải đợi!

console.log("3 - Kết thúc");

// Output:
// "1 - Bắt đầu"
// "3 - Kết thúc"
// "2 - setTimeout"

// Tại sao? Vì:
// 1. console.log("1") -> call stack -> chạy ngay
// 2. setTimeout -> chuyển cho Web API -> callback vào macrotask queue
// 3. console.log("3") -> call stack -> chạy ngay
// 4. Call stack trống -> Event Loop lấy callback từ queue -> chạy console.log("2")
```

### Đáp án mẫu

> "JavaScript có một call stack duy nhất (single-threaded), nhưng runtime environment (browser/Node.js) cung cấp các API xử lý bất đồng bộ trên các thread riêng. Khi tác vụ async hoàn thành, callback được đẩy vào queue. Event Loop liên tục kiểm tra: khi call stack trống, nó lấy callback từ queue đẩy vào stack để thực thi. Đây là lý do setTimeout(fn, 0) vẫn chạy sau code đồng bộ -- callback phải đợi call stack trống mới được thực thi."

---

## Câu 2: Call Stack, Web APIs, Callback Queue `[Intermediate]`

### Câu hỏi

> Giải thích chi tiết quy trình thực thi của một lệnh `setTimeout` từ khi được gọi đến khi callback chạy.

### Giải thích lý thuyết

Quy trình 6 bước:

1. **Call Stack**: `setTimeout(callback, delay)` được push vào stack.
2. **Web API**: Engine nhận ra đây là Web API, chuyển timer cho browser xử lý. `setTimeout` được pop khỏi stack.
3. **Timer chạy**: Browser bắt đầu đếm thời gian (trên thread riêng, không block JS).
4. **Timer hết**: Callback được đẩy vào **Macrotask Queue** (hay gọi là Callback Queue / Task Queue).
5. **Event Loop kiểm tra**: "Call stack có trống không?" Nếu trống, lấy callback từ queue.
6. **Thực thi**: Callback được push vào Call Stack và chạy.

### Code ví dụ

```javascript
// ===== Minh hoạ từng bước =====
function main() {
  console.log("A"); // Bước 1: Push main -> push log("A") -> chạy -> pop

  setTimeout(function timerCallback() {
    console.log("B"); // Bước 5-6: Sau 2s, vào queue -> đợi stack trống -> chạy
  }, 2000);
  // Bước 2-3: setTimeout pop khỏi stack, browser bắt đầu đếm 2s

  console.log("C"); // Bước 4: Push log("C") -> chạy -> pop
  // main() pop khỏi stack -> stack trống
}

main();
// Output: A, C, (đợi 2s), B

// ===== setTimeout(fn, 0) -- không phải "chạy ngay" =====
console.log("1");

setTimeout(() => console.log("2"), 0);

// Vòng lặp này chạy trước setTimeout callback
for (let i = 0; i < 1000000000; i++) {
  // Tính toán nặng...
}

console.log("3");

// Output: 1, 3, 2
// Dù delay = 0, callback phải đợi call stack trống
// Vòng lặp chạy trước vì nó đang trên call stack

// ===== Nested setTimeout vs setInterval =====
// setInterval có thể chồng chéo nếu callback chạy lâu
// setTimeout nested đảm bảo khoảng cách giữa các lần chạy

// setInterval -- có thể chồng chéo:
// setInterval(() => {
//   doHeavyWork(); // Nếu chạy > 1000ms, lần sau bắt đầu trước khi lần trước xong
// }, 1000);

// setTimeout nested -- an toàn hơn:
function poll() {
  doHeavyWork();
  setTimeout(poll, 1000); // Chỉ lặp lại SAU KHI work xong
}
poll();
```

### Đáp án mẫu

> "Khi gọi setTimeout, nó được push vào call stack rồi nhanh chóng pop ra -- browser tiếp nhận timer trên thread riêng. Khi timer hết, callback vào macrotask queue. Event Loop chỉ chuyển callback vào call stack khi stack **trống hoàn toàn**. Điều này có nghĩa setTimeout(fn, 0) không phải 'chạy ngay' -- nó chỉ đảm bảo callback chạy ở tick tiếp theo của event loop, sau tất cả code đồng bộ hiện tại."

---

## Câu 3: Microtask Queue vs Macrotask Queue `[Senior]`

### Câu hỏi

> Phân biệt Microtask Queue và Macrotask Queue. Thứ tự ưu tiên của chúng là gì?

### Giải thích lý thuyết

JavaScript có **hai loại queue** với độ ưu tiên khác nhau:

| Tiêu chí        | Microtask Queue                                                               | Macrotask Queue                                                       |
| --------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Độ ưu tiên      | **Cao hơn**                                                                   | Thấp hơn                                                              |
| Gồm             | Promise `.then`/`.catch`/`.finally`, `queueMicrotask`, `MutationObserver`     | `setTimeout`, `setInterval`, `setImmediate` (Node), I/O, UI rendering |
| Khi nào chạy    | **Tất cả** microtask được xử lý **trước khi** chuyển sang macrotask tiếp theo | Mỗi lần event loop quay, chỉ xử lý **một** macrotask                  |
| Blocking render | Có thể block nếu quá nhiều                                                    | Mỗi macrotask cho phép render giữa các lần                            |

**Thứ tự thực thi của Event Loop mỗi vòng:**

1. Chạy hết code đồng bộ trên Call Stack.
2. Xử lý **tất cả** microtask trong Microtask Queue (kể cả microtask sinh ra trong lúc xử lý).
3. Render UI (nếu cần).
4. Lấy **một** macrotask từ Macrotask Queue và thực thi.
5. Quay lại bước 2.

### Code ví dụ

```javascript
console.log("1 - Đồng bộ");

setTimeout(() => {
  console.log("2 - Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
  console.log("3 - Microtask (Promise.then)");
});

queueMicrotask(() => {
  console.log("4 - Microtask (queueMicrotask)");
});

console.log("5 - Đồng bộ");

// Output:
// 1 - Đồng bộ
// 5 - Đồng bộ
// 3 - Microtask (Promise.then)
// 4 - Microtask (queueMicrotask)
// 2 - Macrotask (setTimeout)

// Giải thích:
// 1. Đồng bộ chạy trước: "1", "5"
// 2. Microtask chạy tiếp: "3", "4" (Promise và queueMicrotask)
// 3. Macrotask cuối cùng: "2" (setTimeout)

// ===== Microtask sinh ra microtask =====
Promise.resolve().then(() => {
  console.log("Microtask 1");

  Promise.resolve().then(() => {
    console.log("Microtask 2 (sinh ra từ Microtask 1)");
  });
});

setTimeout(() => {
  console.log("Macrotask 1");
}, 0);

// Output:
// Microtask 1
// Microtask 2 (sinh ra từ Microtask 1)  <-- xử lý trước macrotask!
// Macrotask 1

// CẢNH BÁO: Microtask vô hạn sẽ block event loop!
// function badIdea() {
//   Promise.resolve().then(badIdea); // NEVER DO THIS -- block vĩnh viễn
// }
```

### Đáp án mẫu

> "Microtask queue có ưu tiên cao hơn macrotask queue. Sau mỗi macrotask (hoặc sau khi call stack trống), event loop xử lý **tất cả** microtask trước khi chuyển sang macrotask tiếp theo. Promise callbacks và queueMicrotask vào microtask queue; setTimeout/setInterval vào macrotask queue. Điều quan trọng là microtask sinh ra trong lúc xử lý microtask cũng được xử lý ngay trong cùng vòng -- nên microtask có thể block rendering nếu không cẩn thận."

---

## Câu 4: `requestAnimationFrame` nằm ở đâu? `[Senior]`

### Câu hỏi

> `requestAnimationFrame` (rAF) thuộc microtask hay macrotask? Nó khác gì `setTimeout`?

### Giải thích lý thuyết

`requestAnimationFrame` **không thuộc** microtask hay macrotask queue. Nó nằm trong một **queue riêng** được xử lý trước mỗi repaint của browser.

Thứ tự trong một vòng Event Loop:

1. Macrotask (1 cái)
2. Tất cả Microtasks
3. **requestAnimationFrame callbacks** (nếu browser sắp repaint)
4. Render / Paint
5. Quay lại bước 1

| Tiêu chí        | `setTimeout(fn, 0)`           | `requestAnimationFrame(fn)`                    |
| --------------- | ----------------------------- | ---------------------------------------------- |
| Thời điểm chạy  | Tick tiếp theo của event loop | Trước lần repaint tiếp theo (~16.67ms / 60fps) |
| Độ chính xác    | Không đảm bảo thời gian       | Đồng bộ với refresh rate của màn hình          |
| Phù hợp cho     | Delay task, debounce          | Animation, visual updates                      |
| Chạy khi tab ẩn | Có                            | **Không** (tiết kiệm pin/CPU)                  |

### Code ví dụ

```javascript
// ===== So sánh setTimeout và rAF =====

// setTimeout -- animation bị giật (không đồng bộ với frame rate)
function animateWithTimeout(element) {
  let position = 0;
  function step() {
    position += 2;
    element.style.transform = `translateX(${position}px)`;
    if (position < 300) {
      setTimeout(step, 16); // Cố gắng 60fps nhưng không chính xác
    }
  }
  setTimeout(step, 16);
}

// rAF -- animation mượt mà (đồng bộ với frame rate)
function animateWithRAF(element) {
  let position = 0;
  function step() {
    position += 2;
    element.style.transform = `translateX(${position}px)`;
    if (position < 300) {
      requestAnimationFrame(step); // Chạy đúng trước mỗi frame
    }
  }
  requestAnimationFrame(step);
}

// ===== rAF nhận timestamp =====
function smoothAnimation(element) {
  let start = null;
  const duration = 2000; // 2 giây

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);

    element.style.transform = `translateX(${progress * 300}px)`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ===== Thứ tự thực thi =====
setTimeout(() => console.log("setTimeout"), 0);

requestAnimationFrame(() => console.log("rAF"));

Promise.resolve().then(() => console.log("Promise"));

console.log("Đồng bộ");

// Output (thông thường):
// Đồng bộ
// Promise          (microtask)
// rAF              (trước repaint -- có thể trước hoặc sau setTimeout)
// setTimeout       (macrotask)

// Lưu ý: Thứ tự rAF và setTimeout không hoàn toàn cố định
// vì rAF chỉ chạy trước repaint (60fps = mỗi ~16.67ms)
```

### Đáp án mẫu

> "requestAnimationFrame không thuộc microtask hay macrotask -- nó nằm trong queue riêng được xử lý trước mỗi repaint của browser. Khác với setTimeout, rAF đồng bộ với refresh rate của màn hình (thường 60fps), nên animation mượt hơn. Nó cũng tự động dừng khi tab bị ẩn, tiết kiệm tài nguyên. Trong thực tế, bất kỳ thay đổi visual nào (animation, scroll effect) nên dùng rAF thay vì setTimeout."

---

## Câu 5: Promise.then() vs setTimeout -- thứ tự thực thi `[Senior]`

### Câu hỏi

> Đoạn code sau output gì? Giải thích chi tiết từng bước thực thi.

```javascript
console.log("start");

setTimeout(() => console.log("timeout 1"), 0);

Promise.resolve()
  .then(() => {
    console.log("promise 1");
    setTimeout(() => console.log("timeout 2"), 0);
  })
  .then(() => console.log("promise 2"));

setTimeout(() => console.log("timeout 3"), 0);

console.log("end");
```

### Giải thích chi tiết

```
Bước 1: Chạy đồng bộ
- console.log("start") -> in "start"
- setTimeout(timeout1, 0) -> timeout1 vào macrotask queue
- Promise.resolve().then(handler1) -> handler1 vào microtask queue
- .then(handler2) -> chưa chạy, đợi handler1 xong
- setTimeout(timeout3, 0) -> timeout3 vào macrotask queue
- console.log("end") -> in "end"

Trạng thái queue:
  Microtask: [handler1]
  Macrotask: [timeout1, timeout3]

Bước 2: Xử lý tất cả microtask
- handler1 chạy: in "promise 1"
  + setTimeout(timeout2, 0) -> timeout2 vào macrotask queue
  + handler1 resolve -> handler2 vào microtask queue

Trạng thái queue:
  Microtask: [handler2]  <-- mới được thêm
  Macrotask: [timeout1, timeout3, timeout2]

- handler2 chạy: in "promise 2"

Trạng thái queue:
  Microtask: [] (trống)
  Macrotask: [timeout1, timeout3, timeout2]

Bước 3: Xử lý macrotask (từng cái một)
- timeout1 chạy: in "timeout 1"
- (kiểm tra microtask -> trống -> tiếp)
- timeout3 chạy: in "timeout 3"
- (kiểm tra microtask -> trống -> tiếp)
- timeout2 chạy: in "timeout 2"
```

### Đáp án

```javascript
// Output:
// start
// end
// promise 1
// promise 2
// timeout 1
// timeout 3
// timeout 2
```

### Đáp án mẫu

> "Output là: start, end, promise 1, promise 2, timeout 1, timeout 3, timeout 2. Đồng bộ chạy trước (start, end). Rồi tất cả microtask (promise 1, promise 2 -- kể cả promise 2 được thêm trong lúc xử lý microtask). Cuối cùng là macrotask theo thứ tự FIFO (timeout 1, timeout 3, timeout 2). Điểm mấu chốt: setTimeout trong promise callback (timeout 2) vào macrotask queue **sau** timeout 1 và timeout 3, nên nó chạy cuối cùng."

---

## Câu 6: Bài tập output prediction nâng cao `[Senior]`

### Câu hỏi

> Dự đoán output:

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

async1();

new Promise((resolve) => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");
```

### Giải thích chi tiết

```
Điểm then chốt cần hiểu:
- async function THỰC THI ĐỒNG BỘ cho đến khi gặp await
- await x tương đương Promise.resolve(x).then(phần sau await)
- Callback của Promise constructor chạy ĐỒNG BỘ

Bước 1: Chạy đồng bộ
1. console.log("script start") -> in "script start"
2. setTimeout -> callback vào macrotask queue
3. Gọi async1():
   - console.log("async1 start") -> in "async1 start"
   - await async2():
     + Gọi async2() đồng bộ -> console.log("async2") -> in "async2"
     + Phần sau await ("async1 end") vào microtask queue
   - async1 tạm dừng (yield)
4. new Promise(executor):
   - executor chạy ĐỒNG BỘ -> console.log("promise1") -> in "promise1"
   - resolve() -> .then callback vào microtask queue
5. console.log("script end") -> in "script end"

Trạng thái queue:
  Microtask: [async1-continuation, promise2-handler]
  Macrotask: [setTimeout-handler]

Bước 2: Xử lý microtask
- async1-continuation: in "async1 end"
- promise2-handler: in "promise2"

Bước 3: Xử lý macrotask
- setTimeout-handler: in "setTimeout"
```

### Đáp án

```javascript
// Output:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

### Đáp án mẫu

> "Output là: script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout. Điểm mấu chốt: (1) async function chạy đồng bộ cho đến `await`, (2) `await` biến phần còn lại thành microtask, (3) Promise constructor callback chạy đồng bộ -- chỉ `.then` là async. Hiểu điều này giúp bạn đọc được bất kỳ đoạn async code nào."

---

## Lỗi thường gặp khi trả lời

| Lỗi                                            | Giải thích đúng                                                                                                                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "setTimeout(fn, 0) chạy ngay lập tức"          | Không -- nó phải đợi call stack trống và tất cả microtask xử lý xong. Thời gian tối thiểu thực tế khoảng 4ms (browser clamp).                                                      |
| "Promise là asynchronous hoàn toàn"            | Sai -- Promise **constructor callback** chạy **đồng bộ**. Chỉ `.then`/`.catch`/`.finally` là async (microtask).                                                                    |
| "Microtask và macrotask xử lý như nhau"        | Sai -- microtask có ưu tiên cao hơn và **tất cả** được xử lý trước khi chuyển sang macrotask tiếp theo.                                                                            |
| "async/await biến hàm thành asynchronous"      | Không hoàn toàn -- async function chạy đồng bộ cho đến `await`. Phần trước await là đồng bộ, phần sau await là microtask.                                                          |
| "requestAnimationFrame là macrotask"           | Sai -- rAF nằm trong queue riêng, được xử lý trước repaint, không phải macrotask.                                                                                                  |
| "JavaScript không thể làm nhiều việc cùng lúc" | JS engine là single-threaded, nhưng runtime (browser/Node) có nhiều thread khác xử lý I/O, timer, network. JS chỉ có một thread chạy code nhưng vẫn có concurrency nhờ event loop. |
