---
sidebar_position: 3
title: "Event Loop, Callback Queue & Microtask"
---

# Event Loop, Callback Queue & Microtask

Hieu Event Loop la hieu cach JavaScript van hanh. Day la nhom cau hoi ma interviewer dung de phan loai ung vien: neu ban tra loi tot, ban chung minh minh hieu JavaScript o level sau, khong chi biet viet code.

---

## Cau 1: JavaScript single-threaded model `[Intermediate]`

### Cau hoi

> JavaScript la single-threaded, vay sao no xu ly duoc nhieu tac vu dong thoi (async)?

### Giai thich ly thuyet

JavaScript engine (V8, SpiderMonkey) chi co **mot thread chinh** de thuc thi code. Nhung no hoat dong trong mot **runtime environment** (browser hoac Node.js) cung cap:

- **Web APIs** (browser): DOM, setTimeout, fetch, XMLHttpRequest
- **C++ APIs** (Node.js): file system, network, crypto
- **Event Loop**: Co che dieu phoi giua call stack va cac task queue

Mo hinh hoat dong:

```
Call Stack -> Chay code dong bo
     |
     v
Web APIs -> Xu ly async (timer, network, DOM events)
     |
     v
Task Queues -> Doi den khi call stack trong
     |
     v
Event Loop -> Day callback tu queue vao call stack
```

### Code vi du

```javascript
console.log("1 - Bat dau");

setTimeout(function () {
  console.log("2 - setTimeout");
}, 0); // Du delay = 0, van phai doi!

console.log("3 - Ket thuc");

// Output:
// "1 - Bat dau"
// "3 - Ket thuc"
// "2 - setTimeout"

// Tai sao? Vi:
// 1. console.log("1") -> call stack -> chay ngay
// 2. setTimeout -> chuyen cho Web API -> callback vao macrotask queue
// 3. console.log("3") -> call stack -> chay ngay
// 4. Call stack trong -> Event Loop lay callback tu queue -> chay console.log("2")
```

### Dap an mau

> "JavaScript co mot call stack duy nhat (single-threaded), nhung runtime environment (browser/Node.js) cung cap cac API xu ly bat dong bo tren cac thread rieng. Khi tac vu async hoan thanh, callback duoc day vao queue. Event Loop lien tuc kiem tra: khi call stack trong, no lay callback tu queue day vao stack de thuc thi. Day la ly do setTimeout(fn, 0) van chay sau code dong bo -- callback phai doi call stack trong moi duoc thuc thi."

---

## Cau 2: Call Stack, Web APIs, Callback Queue `[Intermediate]`

### Cau hoi

> Giai thich chi tiet quy trinh thuc thi cua mot lenh `setTimeout` tu khi duoc goi den khi callback chay.

### Giai thich ly thuyet

Quy trinh 6 buoc:

1. **Call Stack**: `setTimeout(callback, delay)` duoc push vao stack.
2. **Web API**: Engine nhan ra day la Web API, chuyen timer cho browser xu ly. `setTimeout` duoc pop khoi stack.
3. **Timer chay**: Browser bat dau dem thoi gian (tren thread rieng, khong block JS).
4. **Timer het**: Callback duoc day vao **Macrotask Queue** (hay goi la Callback Queue / Task Queue).
5. **Event Loop kiem tra**: "Call stack co trong khong?" Neu trong, lay callback tu queue.
6. **Thuc thi**: Callback duoc push vao Call Stack va chay.

### Code vi du

```javascript
// ===== Minh hoa buoc buoc =====
function main() {
  console.log("A"); // Buoc 1: Push main -> push log("A") -> chay -> pop

  setTimeout(function timerCallback() {
    console.log("B"); // Buoc 5-6: Sau 2s, vao queue -> doi stack trong -> chay
  }, 2000);
  // Buoc 2-3: setTimeout pop khoi stack, browser bat dau dem 2s

  console.log("C"); // Buoc 4: Push log("C") -> chay -> pop
  // main() pop khoi stack -> stack trong
}

main();
// Output: A, C, (doi 2s), B

// ===== setTimeout(fn, 0) -- khong phai "chay ngay" =====
console.log("1");

setTimeout(() => console.log("2"), 0);

// Vong lap nay chay truoc setTimeout callback
for (let i = 0; i < 1000000000; i++) {
  // Tinh toan nang...
}

console.log("3");

// Output: 1, 3, 2
// Du delay = 0, callback phai doi call stack trong
// Vong lap chay truoc vi no dang tren call stack

// ===== Nested setTimeout vs setInterval =====
// setInterval co the chong cheo neu callback chay lau
// setTimeout nested dam bao khoang cach giua cac lan chay

// setInterval -- co the chong cheo:
// setInterval(() => {
//   doHeavyWork(); // Neu chay > 1000ms, lan sau bat dau truoc khi lan truoc xong
// }, 1000);

// setTimeout nested -- an toan hon:
function poll() {
  doHeavyWork();
  setTimeout(poll, 1000); // Chi lap lai SAU KHI work xong
}
poll();
```

### Dap an mau

> "Khi goi setTimeout, no duoc push vao call stack roi nhanh chong pop ra -- browser tiep nhan timer tren thread rieng. Khi timer het, callback vao macrotask queue. Event Loop chi chuyen callback vao call stack khi stack **trong hoan toan**. Dieu nay co nghia setTimeout(fn, 0) khong phai 'chay ngay' -- no chi dam bao callback chay o tick tiep theo cua event loop, sau tat ca code dong bo hien tai."

---

## Cau 3: Microtask Queue vs Macrotask Queue `[Senior]`

### Cau hoi

> Phan biet Microtask Queue va Macrotask Queue. Thu tu uu tien cua chung la gi?

### Giai thich ly thuyet

JavaScript co **hai loai queue** voi do uu tien khac nhau:

| Tieu chi | Microtask Queue | Macrotask Queue |
|---|---|---|
| Do uu tien | **Cao hon** | Thap hon |
| Gom | Promise `.then`/`.catch`/`.finally`, `queueMicrotask`, `MutationObserver` | `setTimeout`, `setInterval`, `setImmediate` (Node), I/O, UI rendering |
| Khi nao chay | **Tat ca** microtask duoc xu ly **truoc khi** chuyen sang macrotask tiep theo | Moi lan event loop quay, chi xu ly **mot** macrotask |
| Blocking render | Co the block neu qua nhieu | Moi macrotask cho phep render giua cac lan |

**Thu tu thuc thi cua Event Loop moi vong:**

1. Chay het code dong bo tren Call Stack.
2. Xu ly **tat ca** microtask trong Microtask Queue (ke ca microtask sinh ra trong luc xu ly).
3. Render UI (neu can).
4. Lay **mot** macrotask tu Macrotask Queue va thuc thi.
5. Quay lai buoc 2.

### Code vi du

```javascript
console.log("1 - Dong bo");

setTimeout(() => {
  console.log("2 - Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
  console.log("3 - Microtask (Promise.then)");
});

queueMicrotask(() => {
  console.log("4 - Microtask (queueMicrotask)");
});

console.log("5 - Dong bo");

// Output:
// 1 - Dong bo
// 5 - Dong bo
// 3 - Microtask (Promise.then)
// 4 - Microtask (queueMicrotask)
// 2 - Macrotask (setTimeout)

// Giai thich:
// 1. Dong bo chay truoc: "1", "5"
// 2. Microtask chay tiep: "3", "4" (Promise va queueMicrotask)
// 3. Macrotask cuoi cung: "2" (setTimeout)

// ===== Microtask sinh ra microtask =====
Promise.resolve().then(() => {
  console.log("Microtask 1");

  Promise.resolve().then(() => {
    console.log("Microtask 2 (sinh ra tu Microtask 1)");
  });
});

setTimeout(() => {
  console.log("Macrotask 1");
}, 0);

// Output:
// Microtask 1
// Microtask 2 (sinh ra tu Microtask 1)  <-- xu ly truoc macrotask!
// Macrotask 1

// CANH BAO: Microtask vo han se block event loop!
// function badIdea() {
//   Promise.resolve().then(badIdea); // NEVER DO THIS -- block vinh vien
// }
```

### Dap an mau

> "Microtask queue co uu tien cao hon macrotask queue. Sau moi macrotask (hoac sau khi call stack trong), event loop xu ly **tat ca** microtask truoc khi chuyen sang macrotask tiep theo. Promise callbacks va queueMicrotask vao microtask queue; setTimeout/setInterval vao macrotask queue. Dieu quan trong la microtask sinh ra trong luc xu ly microtask cung duoc xu ly ngay trong cung vong -- nen microtask co the block rendering neu khong can than."

---

## Cau 4: `requestAnimationFrame` nam o dau? `[Senior]`

### Cau hoi

> `requestAnimationFrame` (rAF) thuoc microtask hay macrotask? No khac gi `setTimeout`?

### Giai thich ly thuyet

`requestAnimationFrame` **khong thuoc** microtask hay macrotask queue. No nam trong mot **queue rieng** duoc xu ly truoc moi repaint cua browser.

Thu tu trong mot vong Event Loop:

1. Macrotask (1 cai)
2. Tat ca Microtasks
3. **requestAnimationFrame callbacks** (neu browser sap repaint)
4. Render / Paint
5. Quay lai buoc 1

| Tieu chi | `setTimeout(fn, 0)` | `requestAnimationFrame(fn)` |
|---|---|---|
| Thoi diem chay | Tick tiep theo cua event loop | Truoc lan repaint tiep theo (~16.67ms / 60fps) |
| Do chinh xac | Khong dam bao thoi gian | Dong bo voi refresh rate cua man hinh |
| Phù hợp cho | Delay task, debounce | Animation, visual updates |
| Chay khi tab an | Co | **Khong** (tiet kiem pin/CPU) |

### Code vi du

```javascript
// ===== So sanh setTimeout va rAF =====

// setTimeout -- animation bi giat (khong dong bo voi frame rate)
function animateWithTimeout(element) {
  let position = 0;
  function step() {
    position += 2;
    element.style.transform = `translateX(${position}px)`;
    if (position < 300) {
      setTimeout(step, 16); // Co gang 60fps nhung khong chinh xac
    }
  }
  setTimeout(step, 16);
}

// rAF -- animation muot ma (dong bo voi frame rate)
function animateWithRAF(element) {
  let position = 0;
  function step() {
    position += 2;
    element.style.transform = `translateX(${position}px)`;
    if (position < 300) {
      requestAnimationFrame(step); // Chay dung truoc moi frame
    }
  }
  requestAnimationFrame(step);
}

// ===== rAF nhan timestamp =====
function smoothAnimation(element) {
  let start = null;
  const duration = 2000; // 2 giay

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

// ===== Thu tu thuc thi =====
setTimeout(() => console.log("setTimeout"), 0);

requestAnimationFrame(() => console.log("rAF"));

Promise.resolve().then(() => console.log("Promise"));

console.log("Dong bo");

// Output (thong thuong):
// Dong bo
// Promise          (microtask)
// rAF              (truoc repaint -- co the truoc hoac sau setTimeout)
// setTimeout       (macrotask)

// Luu y: Thu tu rAF va setTimeout khong hoan toan co dinh
// vi rAF chi chay truoc repaint (60fps = moi ~16.67ms)
```

### Dap an mau

> "requestAnimationFrame khong thuoc microtask hay macrotask -- no nam trong queue rieng duoc xu ly truoc moi repaint cua browser. Khac voi setTimeout, rAF dong bo voi refresh rate cua man hinh (thuong 60fps), nen animation muot hon. No cung tu dong dung khi tab bi an, tiet kiem tai nguyen. Trong thuc te, bat ky thay doi visual nao (animation, scroll effect) nen dung rAF thay vi setTimeout."

---

## Cau 5: Promise.then() vs setTimeout -- thu tu thuc thi `[Senior]`

### Cau hoi

> Doan code sau output gi? Giai thich chi tiet tu buoc thuc thi.

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

### Giai thich chi tiet

```
Buoc 1: Chay dong bo
- console.log("start") -> in "start"
- setTimeout(timeout1, 0) -> timeout1 vao macrotask queue
- Promise.resolve().then(handler1) -> handler1 vao microtask queue
- .then(handler2) -> chua chay, doi handler1 xong
- setTimeout(timeout3, 0) -> timeout3 vao macrotask queue
- console.log("end") -> in "end"

Trang thai queue:
  Microtask: [handler1]
  Macrotask: [timeout1, timeout3]

Buoc 2: Xu ly tat ca microtask
- handler1 chay: in "promise 1"
  + setTimeout(timeout2, 0) -> timeout2 vao macrotask queue
  + handler1 resolve -> handler2 vao microtask queue

Trang thai queue:
  Microtask: [handler2]  <-- moi duoc them
  Macrotask: [timeout1, timeout3, timeout2]

- handler2 chay: in "promise 2"

Trang thai queue:
  Microtask: [] (trong)
  Macrotask: [timeout1, timeout3, timeout2]

Buoc 3: Xu ly macrotask (tung cai mot)
- timeout1 chay: in "timeout 1"
- (kiem tra microtask -> trong -> tiep)
- timeout3 chay: in "timeout 3"
- (kiem tra microtask -> trong -> tiep)
- timeout2 chay: in "timeout 2"
```

### Dap an

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

### Dap an mau

> "Output la: start, end, promise 1, promise 2, timeout 1, timeout 3, timeout 2. Dong bo chay truoc (start, end). Roi tat ca microtask (promise 1, promise 2 -- ke ca promise 2 duoc them trong luc xu ly microtask). Cuoi cung la macrotask theo thu tu FIFO (timeout 1, timeout 3, timeout 2). Diem mau chot: setTimeout trong promise callback (timeout 2) vao macrotask queue **sau** timeout 1 va timeout 3, nen no chay cuoi cung."

---

## Cau 6: Bai tap output prediction nang cao `[Senior]`

### Cau hoi

> Du doan output:

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

### Giai thich chi tiet

```
Diem then chot can hieu:
- async function THUC THI DONG BO cho den khi gap await
- await x tuong duong Promise.resolve(x).then(phần sau await)
- Callback cua Promise constructor chay DONG BO

Buoc 1: Chay dong bo
1. console.log("script start") -> in "script start"
2. setTimeout -> callback vao macrotask queue
3. Goi async1():
   - console.log("async1 start") -> in "async1 start"
   - await async2():
     + Goi async2() dong bo -> console.log("async2") -> in "async2"
     + Phan sau await ("async1 end") vao microtask queue
   - async1 tam dung (yield)
4. new Promise(executor):
   - executor chay DONG BO -> console.log("promise1") -> in "promise1"
   - resolve() -> .then callback vao microtask queue
5. console.log("script end") -> in "script end"

Trang thai queue:
  Microtask: [async1-continuation, promise2-handler]
  Macrotask: [setTimeout-handler]

Buoc 2: Xu ly microtask
- async1-continuation: in "async1 end"
- promise2-handler: in "promise2"

Buoc 3: Xu ly macrotask
- setTimeout-handler: in "setTimeout"
```

### Dap an

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

### Dap an mau

> "Output la: script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout. Diem mau chot: (1) async function chay dong bo cho den `await`, (2) `await` bien phan con lai thanh microtask, (3) Promise constructor callback chay dong bo -- chi `.then` la async. Hieu dieu nay giup ban doc duoc bat ky doan async code nao."

---

## Loi thuong gap khi tra loi

| Loi | Giai thich dung |
|---|---|
| "setTimeout(fn, 0) chay ngay lap tuc" | Khong -- no phai doi call stack trong va tat ca microtask xu ly xong. Thoi gian toi thieu thuc te khoang 4ms (browser clamp). |
| "Promise la asynchronous hoan toan" | Sai -- Promise **constructor callback** chay **dong bo**. Chi `.then`/`.catch`/`.finally` la async (microtask). |
| "Microtask va macrotask xu ly nhu nhau" | Sai -- microtask co uu tien cao hon va **tat ca** duoc xu ly truoc khi chuyen sang macrotask tiep theo. |
| "async/await bien ham thanh asynchronous" | Khong hoan toan -- async function chay dong bo cho den `await`. Phan truoc await la dong bo, phan sau await la microtask. |
| "requestAnimationFrame la macrotask" | Sai -- rAF nam trong queue rieng, duoc xu ly truoc repaint, khong phai macrotask. |
| "JavaScript khong the lam nhieu viec cung luc" | JS engine la single-threaded, nhung runtime (browser/Node) co nhieu thread khac xu ly I/O, timer, network. JS chi co mot thread chay code nhung van co concurrency nho event loop. |
