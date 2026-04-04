---
sidebar_position: 4
title: "Closures"
---

# Closures

## Closure là gì?

Closure là khi một hàm **"nhớ" được các biến** từ scope bên ngoài, **ngay cả khi scope đó đã kết thúc**. Nói cách khác, hàm bên trong "mang theo" môi trường nơi nó được tạo ra.

**Ví dụ thực tế:** Hãy tưởng tượng bạn **chụp ảnh trong phòng**:
- Khi bạn rời phòng, phòng có thể thay đổi hoặc biến mất
- Nhưng bức ảnh bạn chụp vẫn **giữ lại hình ảnh** mọi thứ trong phòng tại thời điểm đó
- Closure giống như bức ảnh — hàm "chụp lại" các biến từ scope bên ngoài và giữ chúng sống

```javascript
function taoBoDem() {
  let dem = 0; // Biến trong scope của taoBoDem

  // Hàm bên trong "nhớ" biến dem
  return function tang() {
    dem++;
    return dem;
  };
}
// taoBoDem() đã chạy xong, scope "bình thường" sẽ bị xóa
// Nhưng hàm tang() vẫn "nhớ" biến dem!

const boDem = taoBoDem();
console.log(boDem()); // 1
console.log(boDem()); // 2
console.log(boDem()); // 3
// Biến dem vẫn tồn tại vì closure giữ nó lại!
```

## Tại sao Closure ra đời?

Closure không phải được "phát minh" — nó là **hệ quả tự nhiên** của hai đặc điểm trong JavaScript:
1. Hàm có thể **lồng nhau** (hàm bên trong hàm)
2. Hàm là **first-class** (có thể trả về từ hàm khác)

Closure giải quyết các vấn đề:
- **Data encapsulation**: Tạo biến "private" mà bên ngoài không truy cập trực tiếp được
- **State persistence**: Giữ trạng thái giữa các lần gọi hàm
- **Factory pattern**: Tạo hàm tùy chỉnh từ hàm gốc

## Cách sử dụng

### Ví dụ cơ bản: Hiểu closure từng bước

```javascript
function benNgoai() {
  const thongBao = "Xin chào!"; // Biến của benNgoai

  function benTrong() {
    // benTrong "nhìn thấy" thongBao nhờ scope chain
    console.log(thongBao);
  }

  return benTrong; // Trả về hàm (KHÔNG gọi hàm)
}

const hamDaLuu = benNgoai(); // benNgoai() chạy xong
// Theo lý thuyết, biến thongBao nên bị xóa
// Nhưng KHÔNG — vì hamDaLuu (tức benTrong) vẫn tham chiếu đến nó

hamDaLuu(); // "Xin chào!" — closure giữ thongBao sống
```

### Tạo biến private (Private Variables)

JavaScript không có từ khóa `private` như Java. Closure là cách tạo biến mà **bên ngoài không thể truy cập trực tiếp**.

```javascript
function taoTaiKhoan(tenChuTaiKhoan) {
  let soDu = 0; // Biến "private" — bên ngoài không thể truy cập

  return {
    guiTien(soTien) {
      if (soTien <= 0) {
        console.log("Số tiền phải lớn hơn 0");
        return;
      }
      soDu += soTien;
      console.log(`${tenChuTaiKhoan} gửi ${soTien}đ. Số dư: ${soDu}đ`);
    },

    rutTien(soTien) {
      if (soTien > soDu) {
        console.log("Số dư không đủ!");
        return;
      }
      soDu -= soTien;
      console.log(`${tenChuTaiKhoan} rút ${soTien}đ. Số dư: ${soDu}đ`);
    },

    xemSoDu() {
      console.log(`Số dư của ${tenChuTaiKhoan}: ${soDu}đ`);
    }
  };
}

const tkMinh = taoTaiKhoan("Minh");
tkMinh.guiTien(500000);  // "Minh gửi 500000đ. Số dư: 500000đ"
tkMinh.guiTien(300000);  // "Minh gửi 300000đ. Số dư: 800000đ"
tkMinh.rutTien(200000);  // "Minh rút 200000đ. Số dư: 600000đ"
tkMinh.xemSoDu();        // "Số dư của Minh: 600000đ"

// ❌ Không thể truy cập trực tiếp biến soDu
console.log(tkMinh.soDu); // undefined — biến private!
```

### Factory Function (Hàm tạo hàm)

Closure cho phép tạo các hàm **tùy chỉnh** từ một hàm gốc:

```javascript
// Factory: Tạo hàm nhân với hệ số bất kỳ
function taoHamNhan(heSo) {
  // heSo được "nhớ" bởi closure
  return function(so) {
    return so * heSo;
  };
}

const nhanDoi = taoHamNhan(2);    // heSo = 2 được nhớ
const nhanBa = taoHamNhan(3);     // heSo = 3 được nhớ
const nhanMuoi = taoHamNhan(10);  // heSo = 10 được nhớ

console.log(nhanDoi(5));   // 10
console.log(nhanBa(5));    // 15
console.log(nhanMuoi(5));  // 50
```

```javascript
// Factory: Tạo hàm chào bằng ngôn ngữ khác nhau
function taoLoiChao(ngonNgu) {
  const loiChao = {
    vi: "Xin chào",
    en: "Hello",
    jp: "Konnichiwa"
  };

  return function(ten) {
    return `${loiChao[ngonNgu]}, ${ten}!`;
  };
}

const chaoTiengViet = taoLoiChao("vi");
const chaoTiengAnh = taoLoiChao("en");

console.log(chaoTiengViet("Minh")); // "Xin chào, Minh!"
console.log(chaoTiengAnh("John"));  // "Hello, John!"
```

### Closure trong Loop — Vấn đề kinh điển

Đây là câu hỏi phỏng vấn **cực kỳ phổ biến**:

```javascript
// ❌ Bug: var không có block scope
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3 — tất cả đều in 3!
  }, 100);
}
// Giải thích: Chỉ có MỘT biến i (var không có block scope)
// Khi setTimeout chạy, loop đã xong và i = 3
// Cả 3 closure đều tham chiếu đến CÙNG MỘT biến i

// ✅ Cách 1: Dùng let (đơn giản nhất)
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2 ✅
  }, 100);
}
// Mỗi vòng lặp tạo biến i RIÊNG trong block scope

// ✅ Cách 2: Dùng IIFE tạo closure riêng (cách cũ trước ES6)
for (var i = 0; i < 3; i++) {
  (function(j) {
    // j là bản sao của i tại mỗi vòng lặp
    setTimeout(function() {
      console.log(j); // 0, 1, 2 ✅
    }, 100);
  })(i);
}
```

## Khi nào dùng?

| Tình huống | Ví dụ |
|-----------|-------|
| Tạo biến private | Tài khoản ngân hàng, bộ đếm an toàn |
| Event handlers | Lưu trữ trạng thái cho mỗi button |
| Callbacks | Giữ context khi truyền hàm đi nơi khác |
| Module pattern | Tổ chức code thành module với API public/private |
| Partial application | Tạo hàm tùy chỉnh từ hàm tổng quát |

```javascript
// Event handler với closure
function ganSuKien() {
  const buttons = document.querySelectorAll(".btn");

  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function() {
      // Mỗi hàm "nhớ" giá trị i riêng nhờ closure + let
      console.log("Bạn click button thứ " + (i + 1));
    });
  }
}
```

## Lỗi thường gặp

```javascript
// ❌ Sai: Closure giữ THAM CHIẾU, không giữ GIÁ TRỊ
function taoHamIn() {
  let x = 1;
  const inX = function() { console.log(x); };
  x = 100; // Thay đổi x SAU KHI tạo closure
  return inX;
}
taoHamIn()(); // 100 (KHÔNG phải 1!) — closure giữ tham chiếu đến x

// ✅ Hiểu đúng: Closure giữ tham chiếu đến biến, không phải bản sao giá trị
```

```javascript
// ❌ Sai: Tạo closure trong loop không cần thiết → lãng phí bộ nhớ
for (let i = 0; i < 10000; i++) {
  const handler = function() {
    // Mỗi handler giữ một closure riêng
    return i * 2;
  };
  // handler không bao giờ được dùng lại → lãng phí
}

// ✅ Đúng: Dùng hàm thuần nếu không cần closure
function nhanDoi(n) {
  return n * 2;
}
for (let i = 0; i < 10000; i++) {
  const kq = nhanDoi(i); // Không tạo closure thừa
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Closure là gì? Giải thích bằng ví dụ đơn giản.

**Đáp án:**

Closure là khi một hàm **có thể truy cập biến từ scope bên ngoài**, ngay cả sau khi hàm bên ngoài đã thực thi xong. Closure xảy ra vì hàm trong JavaScript giữ **tham chiếu** đến môi trường (lexical environment) nơi nó được tạo ra.

```javascript
function taoCounter() {
  let count = 0;                 // Biến trong scope của taoCounter
  return function() {            // Hàm bên trong tạo closure
    count++;                     // Truy cập biến count từ scope ngoài
    return count;
  };
}

const counter = taoCounter();    // taoCounter đã chạy xong
console.log(counter());          // 1 — count vẫn "sống" nhờ closure
console.log(counter());          // 2 — count tiếp tục được cập nhật
console.log(counter());          // 3
```

### Câu 2: Output của đoạn code sau là gì?

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 0);
}
```

**Đáp án:**

Output: `3, 3, 3` (cả 3 lần đều in ra 3).

Giải thích:
1. `var i` **không có block scope** — chỉ có MỘT biến `i` dùng chung
2. `setTimeout` là **asynchronous** — callback không chạy ngay, mà đợi vào event queue
3. Khi loop kết thúc, `i = 3`
4. Lúc callback chạy, cả 3 closure đều tham chiếu đến **cùng biến `i`** (giá trị = 3)

Cách sửa:
```javascript
// Dùng let — mỗi iteration có biến riêng
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

### Câu 3: Closure có thể gây memory leak không?

**Đáp án:**

Có. Closure giữ **tham chiếu** đến toàn bộ lexical environment của scope cha. Nếu closure tồn tại lâu, các biến trong scope cha **không thể bị garbage collected** dù không còn cần dùng.

```javascript
// ❌ Có thể gây memory leak
function taoXuLy() {
  const duLieuLon = new Array(1000000).fill("data"); // 1 triệu phần tử

  return function() {
    // Closure giữ tham chiếu đến TOÀN BỘ scope
    // bao gồm duLieuLon dù không dùng
    console.log("Xử lý xong");
  };
}

const handler = taoXuLy(); // duLieuLon không bao giờ được giải phóng!

// ✅ Cách tránh: Chỉ giữ những gì cần thiết
function taoXuLy() {
  const duLieuLon = new Array(1000000).fill("data");
  const ketQua = duLieuLon.length; // Chỉ lấy thông tin cần

  return function() {
    console.log("Đã xử lý " + ketQua + " phần tử");
    // Closure chỉ giữ ketQua (số nhỏ), không giữ mảng lớn
  };
}
```

### Câu 4: Module pattern sử dụng closure như thế nào?

**Đáp án:**

Module pattern dùng IIFE (Immediately Invoked Function Expression) kết hợp closure để tạo module với **biến private** và **API public**.

```javascript
const CartModule = (function() {
  // Biến private — bên ngoài không truy cập được
  let items = [];

  // Hàm private
  function tinhTong() {
    return items.reduce((sum, item) => sum + item.gia, 0);
  }

  // API public — trả về object với các method
  return {
    themSanPham(ten, gia) {
      items = [...items, { ten, gia }]; // Immutable update
      console.log(`Đã thêm: ${ten} - ${gia}đ`);
    },
    xemGioHang() {
      console.log("Giỏ hàng:", items);
      console.log("Tổng:", tinhTong() + "đ");
    },
    soLuong() {
      return items.length;
    }
  };
})();

CartModule.themSanPham("Áo", 200000);
CartModule.themSanPham("Quần", 350000);
CartModule.xemGioHang();
// Giỏ hàng: [{ten: "Áo", gia: 200000}, {ten: "Quần", gia: 350000}]
// Tổng: 550000đ

console.log(CartModule.items);    // undefined — biến private!
console.log(CartModule.tinhTong); // undefined — hàm private!
```

### Câu 5: Closure giữ tham chiếu hay giá trị?

**Đáp án:**

Closure giữ **tham chiếu** (reference) đến biến, **không phải bản sao giá trị** (value). Điều này có nghĩa nếu biến bên ngoài thay đổi, closure sẽ thấy giá trị mới.

```javascript
function demo() {
  let x = 10;

  const layX = () => x;      // Closure giữ tham chiếu đến x
  const ganX = (val) => {
    x = val;                  // Thay đổi x thông qua closure
  };

  return { layX, ganX };
}

const { layX, ganX } = demo();
console.log(layX()); // 10
ganX(999);           // Thay đổi x
console.log(layX()); // 999 — layX thấy giá trị mới vì giữ tham chiếu

// Nếu closure giữ GIÁ TRỊ thì layX() vẫn trả về 10
// Nhưng vì giữ THAM CHIẾU nên layX() trả về 999
```
