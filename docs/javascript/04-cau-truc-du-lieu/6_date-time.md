---
sidebar_position: 9
title: "9. Ngày & Thời gian (Date)"
---

# Ngày & Thời gian (Date)


---

## Mục lục

- [Date Object là gì?](#date-object-là-gì)
- [Tạo Date](#tạo-date)
- [Lấy thông tin từ Date](#lấy-thông-tin-từ-date)
- [Định dạng ngày (Format)](#định-dạng-ngày-format)
- [So sánh ngày](#so-sánh-ngày)
- [Tính khoảng cách thời gian](#tính-khoảng-cách-thời-gian)
- [Intl.DateTimeFormat — Định dạng theo ngôn ngữ](#intldatetimeformat--định-dạng-theo-ngôn-ngữ)
- [Thư viện phổ biến](#thư-viện-phổ-biến)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Date Object là gì?

**Date** là object built-in của JavaScript dùng để làm việc với **ngày và thời gian**. Bên trong, Date lưu trữ số **mili giây** (milliseconds) kể từ **ngày 1 tháng 1 năm 1970 UTC** (gọi là **Unix Epoch**).

> **Ví dụ thực tế:** Date giống như một chiếc **đồng hồ kỹ thuật số** — bên trong nó chỉ lưu một con số (timestamp), nhưng khi hiển thị ra ngoài, nó chuyển thành ngày/giờ/phút/giây mà con người đọc được.

```javascript
// Tạo Date cho thời điểm hiện tại
const bayGio = new Date();
console.log(bayGio);
// Wed Apr 27 2026 15:30:00 GMT+0700 (Indochina Time)

// Bên trong, Date lưu số milliseconds
console.log(bayGio.getTime()); // 1777413000000 (ví dụ)
```

---

## Tạo Date

### 4 cách tạo Date

```javascript
// 1. Không tham số — thời điểm hiện tại
const hienTai = new Date();
console.log(hienTai); // Ngày giờ hiện tại

// 2. Từ chuỗi (string)
const tuChuoi = new Date("2026-04-27");
console.log(tuChuoi); // Mon Apr 27 2026 07:00:00 GMT+0700

const tuChuoi2 = new Date("April 27, 2026 15:30:00");
console.log(tuChuoi2); // Mon Apr 27 2026 15:30:00 GMT+0700

// 3. Từ các thành phần (year, month, day, hours, minutes, seconds, ms)
// ⚠️ THÁNG BẮT ĐẦU TỪ 0 (0 = tháng 1, 11 = tháng 12)
const tuThanhPhan = new Date(2026, 3, 27, 15, 30, 0);
// Tháng 3 = tháng 4 (April)!
console.log(tuThanhPhan); // Mon Apr 27 2026 15:30:00

// 4. Từ timestamp (milliseconds)
const tuTimestamp = new Date(1777413000000);
console.log(tuTimestamp);
```

### Date.now() — Lấy timestamp hiện tại

```javascript
// Trả về số milliseconds — KHÔNG tạo Date object
const timestamp = Date.now();
console.log(timestamp); // 1777413000000 (ví dụ)

// Dùng để đo thời gian thực thi
const batDau = Date.now();
// ... code chạy ...
const ketThuc = Date.now();
console.log(`Mất ${ketThuc - batDau}ms`);
```

---

## Lấy thông tin từ Date

```javascript
const ngay = new Date(2026, 3, 27, 15, 30, 45); // 27/04/2026 15:30:45

// === GET — Lấy thông tin ===
console.log(ngay.getFullYear());  // 2026
console.log(ngay.getMonth());     // 3 (⚠️ tháng 4, vì bắt đầu từ 0!)
console.log(ngay.getDate());      // 27 (ngày trong tháng)
console.log(ngay.getDay());       // 1 (thứ Hai, 0 = Chủ nhật)
console.log(ngay.getHours());     // 15
console.log(ngay.getMinutes());   // 30
console.log(ngay.getSeconds());   // 45
console.log(ngay.getMilliseconds()); // 0
console.log(ngay.getTime());      // timestamp (ms)

// === SET — Thay đổi giá trị ===
ngay.setFullYear(2027);
ngay.setMonth(0);    // Tháng 1
ngay.setDate(15);
console.log(ngay);   // Thu Jan 15 2027 15:30:45
```

### Bảng quy đổi tháng và ngày trong tuần

| `getMonth()` | Tháng | `getDay()` | Thứ |
|:---:|:---:|:---:|:---:|
| 0 | Tháng 1 | 0 | Chủ nhật |
| 1 | Tháng 2 | 1 | Thứ 2 |
| 2 | Tháng 3 | 2 | Thứ 3 |
| ... | ... | ... | ... |
| 11 | Tháng 12 | 6 | Thứ 7 |

---

## Định dạng ngày (Format)

### Các method built-in

```javascript
const d = new Date(2026, 3, 27, 15, 30, 0);

console.log(d.toString());
// "Mon Apr 27 2026 15:30:00 GMT+0700 (Indochina Time)"

console.log(d.toLocaleDateString("vi-VN"));
// "27/4/2026"

console.log(d.toLocaleTimeString("vi-VN"));
// "15:30:00"

console.log(d.toLocaleString("vi-VN"));
// "15:30:00 27/4/2026"

console.log(d.toISOString());
// "2026-04-27T08:30:00.000Z" (UTC)

console.log(d.toDateString());
// "Mon Apr 27 2026"
```

### Tự format theo ý muốn

```javascript
function formatNgay(date) {
  const ngay = String(date.getDate()).padStart(2, "0");
  const thang = String(date.getMonth() + 1).padStart(2, "0"); // +1 vì tháng bắt đầu từ 0
  const nam = date.getFullYear();
  const gio = String(date.getHours()).padStart(2, "0");
  const phut = String(date.getMinutes()).padStart(2, "0");

  return `${ngay}/${thang}/${nam} ${gio}:${phut}`;
}

const d = new Date(2026, 3, 27, 9, 5);
console.log(formatNgay(d)); // "27/04/2026 09:05"
```

---

## So sánh ngày

```javascript
const ngay1 = new Date("2026-04-27");
const ngay2 = new Date("2026-12-25");

// So sánh bằng timestamp
if (ngay1.getTime() < ngay2.getTime()) {
  console.log("Ngày 1 trước ngày 2"); // ✅
}

// Hoặc so sánh trực tiếp (tự chuyển thành number)
if (ngay1 < ngay2) {
  console.log("Ngày 1 trước ngày 2"); // ✅
}

// ⚠️ KHÔNG dùng === để so sánh Date!
const a = new Date("2026-04-27");
const b = new Date("2026-04-27");
console.log(a === b); // false — 2 object khác nhau!
console.log(a.getTime() === b.getTime()); // true ✅
```

### Kiểm tra ngày hôm nay

```javascript
function laHomNay(date) {
  const homNay = new Date();
  return (
    date.getDate() === homNay.getDate() &&
    date.getMonth() === homNay.getMonth() &&
    date.getFullYear() === homNay.getFullYear()
  );
}

console.log(laHomNay(new Date())); // true
console.log(laHomNay(new Date("2020-01-01"))); // false
```

---

## Tính khoảng cách thời gian

```javascript
// Tính số ngày giữa 2 mốc
function soNgayGiua(ngay1, ngay2) {
  const MS_MOT_NGAY = 1000 * 60 * 60 * 24; // 86,400,000 ms
  const chenhLech = Math.abs(ngay2 - ngay1); // ms
  return Math.floor(chenhLech / MS_MOT_NGAY);
}

const tetNguyenDan = new Date("2027-02-06");
const homNay = new Date("2026-04-27");
console.log(`Còn ${soNgayGiua(homNay, tetNguyenDan)} ngày nữa là Tết!`);
// "Còn 285 ngày nữa là Tết!"
```

### Thêm/bớt ngày

```javascript
function themNgay(date, soNgay) {
  const ketQua = new Date(date); // Clone để không thay đổi date gốc
  ketQua.setDate(ketQua.getDate() + soNgay);
  return ketQua;
}

const homNay = new Date("2026-04-27");

console.log(themNgay(homNay, 7).toLocaleDateString("vi-VN"));
// "4/5/2026" — 7 ngày sau

console.log(themNgay(homNay, -30).toLocaleDateString("vi-VN"));
// "28/3/2026" — 30 ngày trước

console.log(themNgay(homNay, 365).toLocaleDateString("vi-VN"));
// "27/4/2027" — 1 năm sau
```

### Tính tuổi

```javascript
function tinhTuoi(ngaySinh) {
  const homNay = new Date();
  let tuoi = homNay.getFullYear() - ngaySinh.getFullYear();
  const thangChenh = homNay.getMonth() - ngaySinh.getMonth();

  // Nếu chưa qua sinh nhật năm nay → trừ 1
  if (thangChenh < 0 || (thangChenh === 0 && homNay.getDate() < ngaySinh.getDate())) {
    tuoi--;
  }
  return tuoi;
}

console.log(tinhTuoi(new Date("2000-06-15"))); // 25 (tính tại tháng 4/2026)
```

---

## Intl.DateTimeFormat — Định dạng theo ngôn ngữ

`Intl.DateTimeFormat` là API hiện đại để định dạng ngày theo **ngôn ngữ và văn hóa** khác nhau.

```javascript
const ngay = new Date(2026, 3, 27);

// Tiếng Việt
const fmtVN = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});
console.log(fmtVN.format(ngay));
// "Thứ Hai, 27 tháng 4, 2026"

// Tiếng Anh (Mỹ)
const fmtUS = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric"
});
console.log(fmtUS.format(ngay));
// "Mon, Apr 27, 2026"

// Tiếng Nhật
const fmtJP = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric"
});
console.log(fmtJP.format(ngay));
// "2026年4月27日"
```

### Định dạng thời gian tương đối

```javascript
const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

console.log(rtf.format(-1, "day"));    // "hôm qua"
console.log(rtf.format(1, "day"));     // "ngày mai"
console.log(rtf.format(-3, "hour"));   // "3 giờ trước"
console.log(rtf.format(2, "month"));   // "sau 2 tháng"
console.log(rtf.format(-1, "week"));   // "tuần trước"
```

---

## Thư viện phổ biến

Khi dự án cần xử lý ngày phức tạp (timezone, parse nhiều format, v.v.), nên dùng thư viện thay vì tự viết.

### Day.js — Nhẹ nhất (2KB)

```javascript
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

// Format
console.log(dayjs().format("DD/MM/YYYY HH:mm")); // "27/04/2026 15:30"

// Tính khoảng cách
console.log(dayjs("2026-04-27").from(dayjs("2026-01-01")));
// "4 tháng sau"

// Thêm/bớt
console.log(dayjs().add(7, "day").format("DD/MM/YYYY"));
// "04/05/2026"

// So sánh
console.log(dayjs("2026-04-27").isBefore("2026-12-25")); // true
```

### So sánh thư viện

| Thư viện | Kích thước | Immutable | Ưu điểm |
|----------|-----------|-----------|----------|
| Day.js | ~2KB | ✅ | Nhẹ, API giống Moment.js |
| date-fns | ~20KB (tree-shakeable) | ✅ | Functional, chỉ import cần |
| Luxon | ~20KB | ✅ | Timezone mạnh, Intl-based |
| Moment.js | ~70KB | ❌ | **Deprecated** — không nên dùng |

---

## Lỗi thường gặp

### 1. Tháng bắt đầu từ 0

```javascript
// ❌ Sai — tưởng tháng 4 nhưng lại là tháng 5!
const sai = new Date(2026, 4, 27); // Tháng 5 (May)!

// ✅ Đúng — tháng 4 là số 3
const dung = new Date(2026, 3, 27); // Tháng 4 (April) ✅
```

### 2. So sánh Date bằng === hoặc ==

```javascript
// ❌ Sai — 2 object khác nhau luôn !== nhau
const a = new Date("2026-04-27");
const b = new Date("2026-04-27");
console.log(a === b); // false
console.log(a == b);  // false

// ✅ Đúng — so sánh timestamp
console.log(a.getTime() === b.getTime()); // true
console.log(+a === +b); // true (unary + chuyển thành number)
```

### 3. Timezone gây lệch ngày

```javascript
// ❌ Chuỗi không có timezone — trình duyệt tự hiểu theo UTC
const d = new Date("2026-04-27");
console.log(d.getDate()); // Có thể là 27 hoặc 26 tùy timezone!

// ✅ Chỉ định rõ timezone hoặc dùng thành phần
const d1 = new Date("2026-04-27T00:00:00+07:00"); // Rõ ràng UTC+7
const d2 = new Date(2026, 3, 27); // Local timezone
```

### 4. Mutate Date gốc

```javascript
// ❌ Sai — setDate thay đổi date gốc!
const ngayGoc = new Date("2026-04-27");
ngayGoc.setDate(ngayGoc.getDate() + 7);
console.log(ngayGoc); // Đã bị thay đổi!

// ✅ Đúng — clone trước khi thay đổi
const ngayGoc2 = new Date("2026-04-27");
const ngayMoi = new Date(ngayGoc2);
ngayMoi.setDate(ngayMoi.getDate() + 7);
console.log(ngayGoc2); // Vẫn 27/04
console.log(ngayMoi);  // 04/05
```

---

## Câu hỏi phỏng vấn

### Câu 1: Date trong JavaScript lưu trữ dữ liệu như thế nào?

**Đáp án:** Date lưu trữ bên trong dưới dạng **số mili giây (milliseconds)** kể từ **Unix Epoch** (00:00:00 UTC ngày 1/1/1970). Có thể lấy giá trị này bằng `getTime()` hoặc `Date.now()`. Phạm vi biểu diễn: ±100 triệu ngày so với Epoch.

### Câu 2: Tại sao `new Date("2026-04-27")` có thể trả về ngày 26?

**Đáp án:** Khi parse chuỗi ISO 8601 chỉ có ngày (không có giờ), JavaScript hiểu là **UTC midnight**. Nếu timezone của bạn là UTC+7, `new Date("2026-04-27")` = 27/04 00:00 UTC = 27/04 07:00 giờ Việt Nam. Nhưng nếu timezone âm (VD: UTC-5), 27/04 00:00 UTC = 26/04 19:00 local. Cách fix: dùng `new Date(2026, 3, 27)` (local timezone) hoặc chỉ định timezone rõ ràng.

### Câu 3: Sự khác nhau giữa `Date.now()` và `new Date().getTime()`?

**Đáp án:** Cả hai đều trả về timestamp hiện tại (milliseconds từ Epoch). Khác biệt: `Date.now()` **không tạo Date object** → hiệu năng tốt hơn, phù hợp khi chỉ cần timestamp. `new Date().getTime()` tạo một Date object rồi mới lấy timestamp → tốn bộ nhớ hơn một chút.

### Câu 4: Viết hàm tính khoảng cách giữa 2 ngày theo dạng "X ngày Y giờ Z phút"

**Đáp án:**

```javascript
function khoangCach(d1, d2) {
  let ms = Math.abs(d2 - d1);
  const ngay = Math.floor(ms / (1000 * 60 * 60 * 24));
  ms %= 1000 * 60 * 60 * 24;
  const gio = Math.floor(ms / (1000 * 60 * 60));
  ms %= 1000 * 60 * 60;
  const phut = Math.floor(ms / (1000 * 60));
  return `${ngay} ngày ${gio} giờ ${phut} phút`;
}

khoangCach(
  new Date("2026-04-27T08:00:00"),
  new Date("2026-04-29T14:30:00")
); // "2 ngày 6 giờ 30 phút"
```
