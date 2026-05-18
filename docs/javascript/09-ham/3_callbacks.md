---
sidebar_position: 5
title: "5. Callback Functions"
---

# Callback Functions


---

## Mục lục

- [Callback là gì?](#callback-là-gì)
- [Tại sao Callback ra đời?](#tại-sao-callback-ra-đời)
- [Cách sử dụng](#cách-sử-dụng)
- [Callback Hell (Hỏa ngục Callback)](#callback-hell-hỏa-ngục-callback)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Callback là gì?

Callback là một **hàm được truyền vào hàm khác** như tham số, và được **gọi lại** (called back) tại thời điểm thích hợp. Bạn không gọi callback trực tiếp — bạn "giao" nó cho hàm khác và hàm đó sẽ gọi nó khi cần.

**Ví dụ thực tế:** Hãy tưởng tượng bạn đặt đồ ăn qua app:
1. Bạn đặt món (gọi hàm)
2. Bạn để lại **số điện thoại** (truyền callback)
3. Khi đồ ăn xong, nhà hàng **gọi lại** cho bạn (gọi callback)

Bạn không đứng đợi — bạn làm việc khác và được **gọi lại** khi có kết quả.

```javascript
// "Đặt đồ ăn" — truyền callback vào hàm
function datMonAn(mon, khiXong) {
  console.log("Đang nấu " + mon + "...");
  // Khi nấu xong → gọi callback
  khiXong(mon);
}

// Callback — hàm được gọi lại khi có kết quả
function thongBaoKhach(mon) {
  console.log("Món " + mon + " đã sẵn sàng! Mời bạn lấy.");
}

datMonAn("Phở bò", thongBaoKhach);
// "Đang nấu Phở bò..."
// "Món Phở bò đã sẵn sàng! Mời bạn lấy."
```

## Tại sao Callback ra đời?

JavaScript chạy **single-threaded** (một luồng duy nhất) — chỉ làm **một việc tại một thời điểm**. Nếu phải chờ một tác vụ chậm (đọc file, gọi API, đợi user click), cả chương trình sẽ bị **đứng hình**.

Callback ra đời để xử lý **bất đồng bộ** (asynchronous): "Đi làm việc khác đi, khi nào xong tôi gọi lại cho."

```javascript
// ❌ Nếu JavaScript đợi đồng bộ (synchronous) — chương trình đứng hình
// const data = fetchFromServer(); // Đợi 3 giây... toàn bộ app bị freeze!
// console.log(data);

// ✅ Với callback — không cần đợi
console.log("Bắt đầu");

setTimeout(function() {
  console.log("Xong sau 2 giây"); // Callback được gọi sau 2 giây
}, 2000);

console.log("Tiếp tục làm việc khác"); // Chạy ngay, không đợi

// Output:
// "Bắt đầu"
// "Tiếp tục làm việc khác"
// "Xong sau 2 giây" (sau 2 giây)
```

## Cách sử dụng

### Synchronous Callbacks (Callback đồng bộ)

Callback chạy **ngay lập tức**, trong cùng luồng thực thi. Phổ biến trong các array methods.

```javascript
// forEach — gọi callback cho từng phần tử
const monAn = ["Phở", "Bún bò", "Cơm tấm"];

monAn.forEach(function(mon, index) {
  console.log(`${index + 1}. ${mon}`);
});
// 1. Phở
// 2. Bún bò
// 3. Cơm tấm

// map — tạo mảng mới từ callback
const giaBanDau = [100000, 200000, 300000];
const giaSauGiam = giaBanDau.map(function(gia) {
  return gia * 0.9; // Giảm 10%
});
console.log(giaSauGiam); // [90000, 180000, 270000]

// filter — lọc phần tử theo điều kiện
const diemSo = [5, 8, 3, 9, 7, 2, 10];
const diemGioi = diemSo.filter(function(diem) {
  return diem >= 8; // Chỉ giữ điểm >= 8
});
console.log(diemGioi); // [8, 9, 10]
```

Viết gọn với arrow function:

```javascript
// ✅ Arrow function — ngắn gọn hơn
const giaSauGiam = giaBanDau.map(gia => gia * 0.9);
const diemGioi = diemSo.filter(diem => diem >= 8);
const tongDiem = diemSo.reduce((tong, diem) => tong + diem, 0);
```

### Asynchronous Callbacks (Callback bất đồng bộ)

Callback chạy **sau** khi tác vụ bất đồng bộ hoàn thành.

```javascript
// setTimeout — chạy callback sau khoảng thời gian
setTimeout(function() {
  console.log("Hết 3 giây!");
}, 3000);

// setInterval — chạy callback lặp lại
let dem = 0;
const timerId = setInterval(function() {
  dem++;
  console.log("Giây thứ: " + dem);
  if (dem >= 5) {
    clearInterval(timerId); // Dừng sau 5 lần
  }
}, 1000);

// addEventListener — chạy callback khi có sự kiện
document.getElementById("myBtn").addEventListener("click", function() {
  console.log("Button đã được click!");
});
```

### Higher-Order Function (Hàm bậc cao)

Hàm **nhận hàm khác làm tham số** hoặc **trả về hàm** gọi là higher-order function. Callback là tham số của higher-order function.

```javascript
// xuLyDanhSach là higher-order function
// callback là hàm được truyền vào
function xuLyDanhSach(danhSach, callback) {
  const ketQua = [];
  for (let i = 0; i < danhSach.length; i++) {
    ketQua.push(callback(danhSach[i]));
  }
  return ketQua;
}

const soGoc = [1, 2, 3, 4, 5];

// Truyền callback khác nhau → kết quả khác nhau
const binhPhuong = xuLyDanhSach(soGoc, function(so) {
  return so * so;
});
console.log(binhPhuong); // [1, 4, 9, 16, 25]

const nhanDoi = xuLyDanhSach(soGoc, function(so) {
  return so * 2;
});
console.log(nhanDoi); // [2, 4, 6, 8, 10]

const chuoi = xuLyDanhSach(soGoc, function(so) {
  return "Số " + so;
});
console.log(chuoi); // ["Số 1", "Số 2", "Số 3", "Số 4", "Số 5"]
```

### Error-First Callback Pattern

Quy ước phổ biến trong Node.js — tham số đầu tiên luôn là **error**:

```javascript
function docFile(tenFile, callback) {
  // Giả lập đọc file
  if (tenFile === "") {
    callback(new Error("Tên file không được rỗng"), null);
    return;
  }

  // Thành công — error = null, data = nội dung
  const noiDung = "Nội dung file " + tenFile;
  callback(null, noiDung);
}

// Sử dụng: luôn kiểm tra error trước
docFile("baiViet.txt", function(error, data) {
  if (error) {
    console.log("Lỗi: " + error.message);
    return;
  }
  console.log("Dữ liệu: " + data);
});
// "Dữ liệu: Nội dung file baiViet.txt"

docFile("", function(error, data) {
  if (error) {
    console.log("Lỗi: " + error.message); // "Lỗi: Tên file không được rỗng"
    return;
  }
  console.log("Dữ liệu: " + data);
});
```

## Callback Hell (Hỏa ngục Callback)

Khi nhiều tác vụ bất đồng bộ phụ thuộc nhau, callback lồng nhau tạo thành hình **kim tự tháp** rất khó đọc:

```javascript
// ❌ Callback Hell — "Pyramid of Doom"
dangNhap(user, password, function(error, token) {
  if (error) { console.log("Lỗi đăng nhập"); return; }

  layThongTinUser(token, function(error, userInfo) {
    if (error) { console.log("Lỗi lấy thông tin"); return; }

    layDonHang(userInfo.id, function(error, orders) {
      if (error) { console.log("Lỗi lấy đơn hàng"); return; }

      layChiTietDonHang(orders[0].id, function(error, detail) {
        if (error) { console.log("Lỗi lấy chi tiết"); return; }

        console.log("Chi tiết đơn hàng:", detail);
        // Cứ tiếp tục lồng nhau... 😱
      });
    });
  });
});
```

Vấn đề:
- **Khó đọc**: Code dịch sang phải liên tục
- **Khó debug**: Lỗi ở đâu trong chuỗi callback?
- **Khó bảo trì**: Thêm/xóa một bước rất phức tạp

**Giải pháp:** Sử dụng **Promise** và **async/await** (sẽ học ở Giai đoạn 5 — Bất đồng bộ):

```javascript
// ✅ Với async/await — sạch sẽ, dễ đọc (preview)
async function layChiTiet() {
  try {
    const token = await dangNhap(user, password);
    const userInfo = await layThongTinUser(token);
    const orders = await layDonHang(userInfo.id);
    const detail = await layChiTietDonHang(orders[0].id);
    console.log("Chi tiết đơn hàng:", detail);
  } catch (error) {
    console.log("Có lỗi xảy ra:", error.message);
  }
}
```

## Khi nào dùng?

| Tình huống | Ví dụ | Loại callback |
|-----------|-------|---------------|
| Xử lý mảng | `map`, `filter`, `reduce`, `forEach` | Synchronous |
| Hẹn giờ | `setTimeout`, `setInterval` | Asynchronous |
| Sự kiện DOM | `addEventListener` | Asynchronous |
| Đọc file (Node.js) | `fs.readFile` | Asynchronous |
| API request (cũ) | `XMLHttpRequest` | Asynchronous |

## Lỗi thường gặp

```javascript
// ❌ Sai: Gọi hàm thay vì truyền hàm
setTimeout(console.log("Xin chào"), 1000);
// console.log("Xin chào") chạy NGAY LẬP TỨC
// setTimeout nhận giá trị undefined (kết quả của console.log)

// ✅ Đúng: Truyền hàm (KHÔNG gọi)
setTimeout(function() { console.log("Xin chào"); }, 1000);
// Hoặc dùng arrow function
setTimeout(() => console.log("Xin chào"), 1000);
```

```javascript
// ❌ Sai: Quên xử lý error trong callback
docFile("data.txt", function(error, data) {
  console.log(data); // Nếu error xảy ra, data = null → bug!
});

// ✅ Đúng: Luôn kiểm tra error trước
docFile("data.txt", function(error, data) {
  if (error) {
    console.log("Lỗi:", error.message);
    return; // Dừng xử lý
  }
  console.log(data); // Chắc chắn data hợp lệ
});
```

```javascript
// ❌ Sai: Nghĩ callback chạy theo thứ tự
console.log("1");
setTimeout(() => console.log("2"), 0); // Dù delay = 0
console.log("3");

// Output: "1", "3", "2" — KHÔNG phải "1", "2", "3"!
// setTimeout luôn đưa callback vào event queue, chạy SAU code đồng bộ
```

---

## Câu hỏi phỏng vấn

### Câu 1: Callback function là gì?

**Đáp án:**

Callback function là một hàm **được truyền vào hàm khác như tham số** và được **gọi lại** bên trong hàm đó. Callback cho phép code chạy **sau khi một tác vụ hoàn thành**, thay vì chạy ngay lập tức.

```javascript
// greeting là callback — được truyền vào processUser
function processUser(name, greeting) {
  console.log("Xử lý user: " + name);
  greeting(name); // Gọi callback
}

function sayHello(name) {
  console.log("Xin chào, " + name + "!");
}

processUser("Minh", sayHello);
// "Xử lý user: Minh"
// "Xin chào, Minh!"
```

### Câu 2: Higher-order function là gì? Cho ví dụ.

**Đáp án:**

Higher-order function (hàm bậc cao) là hàm thỏa mãn **ít nhất một** trong hai điều kiện:
1. **Nhận hàm** khác làm tham số (ví dụ: `map`, `filter`, `forEach`)
2. **Trả về hàm** khác (ví dụ: factory function)

```javascript
// Loại 1: Nhận hàm làm tham số
const numbers = [1, 2, 3, 4, 5];

// Array.map là higher-order function
// (so => so * 2) là callback được truyền vào
const doubled = numbers.map(so => so * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Loại 2: Trả về hàm
function taoBoLoc(nguong) {
  // taoBoLoc trả về một hàm → higher-order function
  return function(so) {
    return so >= nguong;
  };
}

const lonHon5 = taoBoLoc(5);
console.log([3, 7, 1, 9, 5].filter(lonHon5)); // [7, 9, 5]
```

Tất cả `map`, `filter`, `reduce`, `forEach`, `sort`, `setTimeout`, `addEventListener` đều là higher-order functions.

### Câu 3: Sự khác nhau giữa synchronous và asynchronous callback?

**Đáp án:**

| Đặc điểm | Synchronous callback | Asynchronous callback |
|-----------|---------------------|----------------------|
| Thời điểm chạy | Ngay lập tức | Sau khi tác vụ hoàn thành |
| Blocking | Chặn code tiếp theo | Không chặn |
| Ví dụ | `map`, `filter`, `sort` | `setTimeout`, `fetch` |

```javascript
// Synchronous — chạy ngay, blocking
console.log("Trước");
[1, 2, 3].forEach(n => console.log(n)); // Chạy ngay: 1, 2, 3
console.log("Sau");
// Output: "Trước", 1, 2, 3, "Sau"

// Asynchronous — chạy sau, non-blocking
console.log("Trước");
setTimeout(() => console.log("Trong timeout"), 0);
console.log("Sau");
// Output: "Trước", "Sau", "Trong timeout"
```

### Câu 4: Callback hell là gì và cách giải quyết?

**Đáp án:**

Callback hell xảy ra khi nhiều callback **lồng nhau**, tạo thành hình kim tự tháp khó đọc và bảo trì.

Có 3 cách giải quyết:

```javascript
// ❌ Callback hell
getUser(id, function(user) {
  getOrders(user, function(orders) {
    getDetails(orders[0], function(detail) {
      console.log(detail);
    });
  });
});

// ✅ Cách 1: Tách thành named functions
function handleDetail(detail) { console.log(detail); }
function handleOrders(orders) { getDetails(orders[0], handleDetail); }
function handleUser(user) { getOrders(user, handleOrders); }
getUser(id, handleUser);

// ✅ Cách 2: Promise chain
getUser(id)
  .then(user => getOrders(user))
  .then(orders => getDetails(orders[0]))
  .then(detail => console.log(detail))
  .catch(error => console.log(error));

// ✅ Cách 3: async/await (tốt nhất)
async function main() {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user);
    const detail = await getDetails(orders[0]);
    console.log(detail);
  } catch (error) {
    console.log(error);
  }
}
```

### Câu 5: Output của đoạn code sau là gì? Giải thích thứ tự.

```javascript
console.log("A");

setTimeout(function() {
  console.log("B");
}, 0);

console.log("C");

setTimeout(function() {
  console.log("D");
}, 0);

console.log("E");
```

**Đáp án:**

Output: `A`, `C`, `E`, `B`, `D`

Giải thích theo cơ chế **Event Loop**:
1. `console.log("A")` — code đồng bộ, chạy ngay: in **A**
2. `setTimeout(B, 0)` — đưa callback B vào **event queue** (không chạy ngay dù delay = 0)
3. `console.log("C")` — code đồng bộ, chạy ngay: in **C**
4. `setTimeout(D, 0)` — đưa callback D vào **event queue**
5. `console.log("E")` — code đồng bộ, chạy ngay: in **E**
6. Call stack trống → Event loop lấy callback B từ queue: in **B**
7. Event loop lấy callback D từ queue: in **D**

Quy tắc: **Code đồng bộ luôn chạy trước**, sau đó mới đến callback bất đồng bộ trong event queue.
