---
sidebar_position: 1
title: "1. Đồng bộ vs Bất đồng bộ"
---

# Đồng bộ vs Bất đồng bộ


---

## Mục lục

- [Đồng bộ (Synchronous) là gì?](#đồng-bộ-synchronous-là-gì)
- [Bất đồng bộ (Asynchronous) là gì?](#bất-đồng-bộ-asynchronous-là-gì)
- [Tại sao JavaScript cần bất đồng bộ?](#tại-sao-javascript-cần-bất-đồng-bộ)
- [Event Loop — "Bộ não" của JavaScript bất đồng bộ](#event-loop-bộ-não-của-javascript-bất-đồng-bộ)
- [Cách sử dụng: setTimeout và setInterval](#cách-sử-dụng-settimeout-và-setinterval)
- [So sánh Đồng bộ vs Bất đồng bộ](#so-sánh-đồng-bộ-vs-bất-đồng-bộ)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Đồng bộ (Synchronous) là gì?

**Đồng bộ** nghĩa là các công việc được thực hiện **tuần tự, liên tiếp** — công việc trước phải xong rồi mới bắt đầu công việc sau.

> **Ví dụ thực tế:** Bạn đi mua cà phê tại quầy. Người trước bạn gọi 1 ly cà phê phức tạp mất 5 phút. Bạn PHẢI đứng chờ người đó nhận xong cà phê, rồi mới được tới lượt gọi. Mọi người xếp hàng và chờ tuần tự.

```javascript
// Đồng bộ — chạy tuần tự từ trên xuống
console.log("Bước 1: Gọi cà phê");
console.log("Bước 2: Chờ pha cà phê"); // Phải chờ bước 1 xong
console.log("Bước 3: Nhận cà phê");    // Phải chờ bước 2 xong

// Kết quả:
// Bước 1: Gọi cà phê
// Bước 2: Chờ pha cà phê
// Bước 3: Nhận cà phê
```

## Bất đồng bộ (Asynchronous) là gì?

**Bất đồng bộ** nghĩa là bạn có thể **bắt đầu công việc mới MÀ KHÔNG CẦN chờ công việc cũ hoàn thành**.

> **Ví dụ thực tế:** Bạn gọi cà phê, nhận **số thứ tự**, rồi ngồi xuống đọc báo. Khi cà phê xong, nhân viên GỌI SỐ của bạn. Bạn không cần đứng chờ — bạn làm việc khác trong lúc chờ.

```javascript
// Bất đồng bộ — KHÔNG chờ, làm việc khác
console.log("Bước 1: Gọi cà phê, nhận số thứ tự");

setTimeout(() => {
  console.log("Bước 3: Cà phê xong, nhận cà phê!");
}, 2000); // Chờ 2 giây (giả lập thời gian pha cà phê)

console.log("Bước 2: Ngồi đọc báo trong lúc chờ");

// Kết quả:
// Bước 1: Gọi cà phê, nhận số thứ tự
// Bước 2: Ngồi đọc báo trong lúc chờ
// Bước 3: Cà phê xong, nhận cà phê!  (sau 2 giây)
```

**Chú ý:** "Bước 2" chạy TRƯỚC "Bước 3" vì `setTimeout` là bất đồng bộ — nó không chặn chương trình.

## Tại sao JavaScript cần bất đồng bộ?

### JavaScript là Single-Threaded

JavaScript chỉ có **1 luồng (thread)** duy nhất để thực thi code. Hãy tưởng tượng như một con đường 1 làn xe — chỉ 1 xe đi được tại 1 thời điểm.

```
Single Thread (1 làn xe):
[Task A] → [Task B] → [Task C] → ...

Nếu Task B mất 10 giây:
[Task A] → [Task B ........... 10s] → [Task C phải chờ!]
```

**Vấn đề:** Nếu 1 tác vụ mất nhiều thời gian (gọi API, đọc file), **toàn bộ chương trình bị ĐỨNG** — giao diện web bị đóng cứng (UI freeze).

```javascript
// BAD: Nếu JavaScript chỉ có đồng bộ
// Giả sử fetchData() mất 5 giây
const data = fetchDataSync("https://api.example.com"); // Chờ 5 giây — UI đứng!
console.log(data);
updateUI(); // Phải chờ 5 giây mới chạy được
```

### Giải pháp: Mô hình bất đồng bộ

Thay vì chờ, JavaScript **gửi tác vụ cho browser xử lý**, rồi tiếp tục chạy code khác:

```javascript
// GOOD: Bất đồng bộ — không block UI
console.log("Bắt đầu tải dữ liệu...");

fetch("https://api.example.com/users") // Gửi cho browser xử lý
  .then(response => response.json())
  .then(data => {
    console.log("Dữ liệu đã tải xong:", data);
    updateUI(data);
  });

console.log("UI vẫn hoạt động bình thường!"); // Chạy ngay, không chờ fetch
```

## Event Loop — "Bộ não" của JavaScript bất đồng bộ

Event Loop là cơ chế giúp JavaScript xử lý bất đồng bộ dù chỉ có 1 thread:

```
┌──────────────────────┐
│     Call Stack        │  ← Nơi code đang chạy
│  (Ngăn xếp gọi hàm) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     Web APIs         │  ← Browser xử lý: setTimeout, fetch, DOM events
│  (Do browser cung cấp)│
└──────────┬───────────┘
           │ Khi xong, đẩy callback vào queue
           ▼
┌──────────────────────┐
│   Callback Queue     │  ← Hàng chờ các callback
│  (Hàng đợi callback) │
└──────────┬───────────┘
           │ Event Loop kiểm tra: Call Stack trống?
           │ → Lấy callback từ queue đưa vào Stack
           ▼
┌──────────────────────┐
│     Call Stack        │  ← Callback được thực thi
└──────────────────────┘
```

### Giải thích từng bước

```javascript
console.log("1. Bắt đầu");           // (1) Vào Call Stack → chạy ngay

setTimeout(() => {
  console.log("3. setTimeout xong"); // (3) Chờ trong Callback Queue
}, 0);                                // Gửi cho Web API (dù delay = 0!)

console.log("2. Kết thúc");          // (2) Vào Call Stack → chạy ngay

// Kết quả:
// 1. Bắt đầu
// 2. Kết thúc
// 3. setTimeout xong   ← Chạy SAU CÙNG dù delay = 0!
```

**Tại sao `setTimeout(fn, 0)` không chạy ngay?**
- `setTimeout` luôn đi qua Web API → Callback Queue
- Event Loop chỉ đẩy callback vào Call Stack khi Stack **trống**
- Nên dù delay = 0, nó vẫn phải chờ code đồng bộ chạy xong

## Cách sử dụng: setTimeout và setInterval

### setTimeout — chạy 1 lần sau khoảng thời gian

```javascript
// Chạy sau 3 giây
setTimeout(() => {
  console.log("Đã qua 3 giây!");
}, 3000);

// Hủy setTimeout
const timerId = setTimeout(() => {
  console.log("Sẽ KHÔNG chạy!");
}, 5000);
clearTimeout(timerId); // Hủy trước khi chạy
```

### setInterval — chạy lặp lại

```javascript
// Đếm thời gian mỗi 1 giây
let seconds = 0;
const intervalId = setInterval(() => {
  seconds++;
  console.log(`Đã trôi qua ${seconds} giây`);

  if (seconds >= 5) {
    clearInterval(intervalId); // Dừng sau 5 giây
    console.log("Đã dừng đếm!");
  }
}, 1000);
```

## So sánh Đồng bộ vs Bất đồng bộ

| Tiêu chí | Đồng bộ (Sync) | Bất đồng bộ (Async) |
|----------|----------------|---------------------|
| Thứ tự thực hiện | Tuần tự, chờ xong mới tiếp | Không cần chờ, làm việc khác |
| Block UI | Có — UI bị đóng cứng | Không — UI vẫn mượt |
| Độ phức tạp code | Đơn giản, dễ đọc | Phức tạp hơn |
| Hiệu suất | Chậm nếu có tác vụ nặng | Nhanh, không lãng phí thời gian chờ |
| Ví dụ | Phép tính toán học | Gọi API, đọc file, setTimeout |

## Khi nào dùng?

**Dùng đồng bộ khi:**
- Phép tính đơn giản, nhanh
- Xử lý dữ liệu đã có sẵn trong bộ nhớ
- Logic tuần tự bắt buộc (bước sau phụ thuộc bước trước)

**Dùng bất đồng bộ khi:**
- Gọi API lấy dữ liệu từ server
- Đọc/ghi file
- Xử lý sự kiện người dùng (click, scroll)
- Hẹn giờ (setTimeout, setInterval)
- Bất cứ gì mất nhiều thời gian

## Lỗi thường gặp

### Lỗi 1: Tưởng setTimeout chạy ngay khi delay = 0

```javascript
// BAD: Tưởng "3" in trước "2"
console.log("1");
setTimeout(() => console.log("2"), 0); // Vẫn là bất đồng bộ!
console.log("3");

// Kết quả THỰC TẾ:
// 1
// 3
// 2  ← setTimeout(fn, 0) vẫn chạy SAU code đồng bộ
```

### Lỗi 2: Không clearInterval khi không cần nữa

```javascript
// BAD: Không clear → chạy mãi, gây rò rỉ bộ nhớ (memory leak)
setInterval(() => {
  console.log("Chạy hoài...");
}, 1000);

// GOOD: Lưu intervalId và clear khi không cần
const id = setInterval(() => {
  console.log("Chạy có kiểm soát");
}, 1000);

// Khi không cần nữa:
clearInterval(id);
```

### Lỗi 3: Dùng giá trị biến thay đổi trong setTimeout

```javascript
// BAD: In 5 lần số 5 (không phải 0,1,2,3,4)
for (var i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i); // Khi callback chạy, i đã = 5!
  }, 1000);
}
// Kết quả: 5, 5, 5, 5, 5

// GOOD: Dùng let (block scope) thay vì var
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(i); // Mỗi vòng lặp có biến i riêng
  }, 1000);
}
// Kết quả: 0, 1, 2, 3, 4
```

---

## Câu hỏi phỏng vấn

### Câu 1: JavaScript là single-threaded nghĩa là gì?

**Đáp án:**

JavaScript chỉ có **1 call stack** (1 luồng thực thi) — tại 1 thời điểm chỉ thực hiện được **1 dòng code**. Nó không thể chạy nhiều tác vụ song song như các ngôn ngữ multi-threaded (Java, C++).

Tuy nhiên, nhờ **Event Loop** và **Web APIs** (do browser cung cấp), JavaScript có thể xử lý bất đồng bộ mà không cần nhiều thread:

```javascript
// Dù chỉ 1 thread, vẫn xử lý được bất đồng bộ
console.log("A"); // Call Stack
setTimeout(() => console.log("B"), 0); // Web API → Callback Queue
console.log("C"); // Call Stack
// Kết quả: A, C, B
```

### Câu 2: Event Loop hoạt động như thế nào?

**Đáp án:**

Event Loop là vòng lặp liên tục kiểm tra:
1. **Call Stack có trống không?**
2. Nếu trống → lấy callback từ **Callback Queue** đưa vào Call Stack
3. Lặp lại

```javascript
// Minh họa Event Loop
console.log("1");  // → Call Stack → chạy → Stack trống

setTimeout(() => {  // → Web API (hẹn 0ms) → Callback Queue
  console.log("2");
}, 0);

Promise.resolve().then(() => {  // → Microtask Queue (ưu tiên cao hơn!)
  console.log("3");
});

console.log("4");  // → Call Stack → chạy → Stack trống

// Kết quả: 1, 4, 3, 2
// Microtask (Promise) chạy TRƯỚC Macrotask (setTimeout)
```

**Thứ tự ưu tiên:** Call Stack → Microtask Queue (Promise) → Macrotask Queue (setTimeout)

### Câu 3: setTimeout(fn, 0) chạy khi nào?

**Đáp án:**

`setTimeout(fn, 0)` **KHÔNG** chạy ngay lập tức. Nó:
1. Đưa callback vào **Web API**
2. Sau 0ms, callback được chuyển vào **Callback Queue (Macrotask Queue)**
3. Event Loop đợi **Call Stack trống** mới đưa callback vào chạy

```javascript
console.log("Trước");
setTimeout(() => console.log("setTimeout"), 0);
Promise.resolve().then(() => console.log("Promise"));
console.log("Sau");

// Kết quả:
// Trước
// Sau
// Promise     ← Microtask chạy trước
// setTimeout  ← Macrotask chạy sau
```

### Câu 4: Phân biệt Microtask và Macrotask?

**Đáp án:**

| Loại | Ví dụ | Ưu tiên |
|------|-------|---------|
| **Microtask** | Promise.then(), queueMicrotask(), MutationObserver | Cao — chạy TRƯỚC |
| **Macrotask** | setTimeout, setInterval, setImmediate, I/O | Thấp — chạy SAU tất cả microtask |

```javascript
// Minh họa thứ tự
setTimeout(() => console.log("1. Macrotask"), 0);

Promise.resolve().then(() => {
  console.log("2. Microtask 1");
  Promise.resolve().then(() => console.log("3. Microtask 2"));
});

console.log("4. Đồng bộ");

// Kết quả:
// 4. Đồng bộ
// 2. Microtask 1
// 3. Microtask 2   ← Tất cả microtask chạy hết trước khi macrotask bắt đầu
// 1. Macrotask
```

### Câu 5: Tại sao nên dùng bất đồng bộ thay vì đồng bộ cho các tác vụ I/O?

**Đáp án:**

JavaScript chạy trên **single thread** — nếu dùng đồng bộ cho tác vụ I/O (gọi API mất 3 giây), toàn bộ ứng dụng sẽ **dừng lại 3 giây**:
- Người dùng không click được
- Animation dừng
- UI không phản hồi → trải nghiệm tồi tệ

```javascript
// BAD: Đồng bộ — block UI
const response = fetchSync("https://api.example.com"); // UI đứng 3 giây!
document.getElementById("btn").addEventListener("click", handler); // Không nhận click!

// GOOD: Bất đồng bộ — UI vẫn hoạt động
fetch("https://api.example.com")
  .then(response => response.json())
  .then(data => updateUI(data)); // Xử lý khi dữ liệu về

document.getElementById("btn").addEventListener("click", handler); // Vẫn nhận click!
```

Bất đồng bộ giúp **không block main thread**, giữ cho ứng dụng luôn **mượt mà và phản hồi** với người dùng.
