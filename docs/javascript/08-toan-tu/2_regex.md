---
sidebar_position: 2
title: "2. Biểu thức chính quy (Regex)"
---

# Biểu thức chính quy (Regex)


---

## Mục lục

- [Regex là gì?](#regex-là-gì)
- [Cú pháp cơ bản](#cú-pháp-cơ-bản)
- [Metacharacters — Ký tự đặc biệt](#metacharacters--ký-tự-đặc-biệt)
- [Quantifiers — Bộ đếm](#quantifiers--bộ-đếm)
- [Flags — Cờ tùy chọn](#flags--cờ-tùy-chọn)
- [Các method của Regex](#các-method-của-regex)
- [Groups và Capturing](#groups-và-capturing)
- [Ví dụ thực tế — Validate dữ liệu](#ví-dụ-thực-tế--validate-dữ-liệu)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Regex là gì?

**Regular Expression** (biểu thức chính quy, viết tắt **Regex**) là một **mẫu (pattern)** dùng để **tìm kiếm, kiểm tra, và thay thế** văn bản theo quy tắc.

> **Ví dụ thực tế:** Regex giống như một **bộ lọc thông minh**. Bạn đặt ra các tiêu chí (bắt đầu bằng số, kết thúc bằng @gmail.com, có ít nhất 8 ký tự...) và regex sẽ kiểm tra xem một chuỗi có đáp ứng tiêu chí đó hay không.

```javascript
// Kiểm tra chuỗi có chứa "hello" không?
const regex = /hello/;

console.log(regex.test("hello world")); // true
console.log(regex.test("hi there"));    // false
console.log(regex.test("say hello"));   // true
```

---

## Cú pháp cơ bản

### 2 cách tạo Regex

```javascript
// Cách 1: Regex literal (phổ biến nhất)
const regex1 = /pattern/flags;

// Cách 2: RegExp constructor (khi pattern là biến)
const regex2 = new RegExp("pattern", "flags");

// Ví dụ
const r1 = /hello/i;                    // Literal
const r2 = new RegExp("hello", "i");    // Constructor

// Khi pattern từ biến — bắt buộc dùng constructor
const tuKhoa = "javascript";
const r3 = new RegExp(tuKhoa, "gi");
```

---

## Metacharacters — Ký tự đặc biệt

### Ký tự tìm kiếm

| Ký tự | Ý nghĩa | Ví dụ | Match |
|:---:|:---|:---|:---|
| `.` | Bất kỳ ký tự nào (trừ `\n`) | `/h.t/` | "hat", "hot", "h1t" |
| `\d` | Một chữ số (0-9) | `/\d\d/` | "42", "99" |
| `\D` | Không phải chữ số | `/\D/` | "a", "!" |
| `\w` | Chữ cái, số, hoặc `_` | `/\w+/` | "hello", "test_1" |
| `\W` | Không phải \w | `/\W/` | " ", "!", "@" |
| `\s` | Khoảng trắng (space, tab, newline) | `/\s/` | " ", "\t", "\n" |
| `\S` | Không phải khoảng trắng | `/\S+/` | "hello" |

### Anchors — Neo vị trí

| Ký tự | Ý nghĩa | Ví dụ | Match |
|:---:|:---|:---|:---|
| `^` | Đầu chuỗi | `/^hello/` | "hello world" ✅, "say hello" ❌ |
| `$` | Cuối chuỗi | `/world$/` | "hello world" ✅, "world cup" ❌ |
| `\b` | Ranh giới từ | `/\bcat\b/` | "the cat sat" ✅, "caterpillar" ❌ |

```javascript
const text = "JavaScript is awesome. Java is also great.";

// ^ — bắt đầu bằng "JavaScript"
console.log(/^JavaScript/.test(text)); // true
console.log(/^Java is/.test(text));    // false

// $ — kết thúc bằng "great."
console.log(/great\.$/.test(text)); // true

// \b — từ "Java" đứng riêng (không phải JavaScript)
const matches = text.match(/\bJava\b/g);
console.log(matches); // ["Java"] — chỉ "Java" đứng riêng
```

### Character Classes — Lớp ký tự

```javascript
// [abc] — một trong các ký tự a, b, hoặc c
console.log(/[aeiou]/.test("hello")); // true (có 'e', 'o')

// [a-z] — bất kỳ chữ thường nào
console.log(/[a-z]/.test("Hello")); // true (có 'ello')

// [0-9] — bất kỳ chữ số nào (giống \d)
console.log(/[0-9]+/.test("age: 25")); // true

// [^abc] — KHÔNG phải a, b, hoặc c (^ trong [] = phủ định)
console.log(/[^0-9]/.test("123")); // false (chỉ có số)
console.log(/[^0-9]/.test("12a")); // true (có 'a' không phải số)
```

---

## Quantifiers — Bộ đếm

| Quantifier | Ý nghĩa | Ví dụ |
|:---:|:---|:---|
| `*` | 0 hoặc nhiều lần | `/go*/` → "g", "go", "gooo" |
| `+` | 1 hoặc nhiều lần | `/go+/` → "go", "gooo" (không match "g") |
| `?` | 0 hoặc 1 lần | `/colou?r/` → "color", "colour" |
| `{n}` | Đúng n lần | `/\d{3}/` → "123", "456" |
| `{n,}` | Ít nhất n lần | `/\d{2,}/` → "12", "123", "1234" |
| `{n,m}` | Từ n đến m lần | `/\d{2,4}/` → "12", "123", "1234" |

```javascript
// Ví dụ thực tế
const soDienThoai = "0912345678";

// Kiểm tra 10 chữ số
console.log(/^\d{10}$/.test(soDienThoai)); // true

// Kiểm tra bắt đầu bằng 0, tiếp theo 9 chữ số
console.log(/^0\d{9}$/.test(soDienThoai)); // true

// ? — optional character
console.log(/colou?r/.test("color"));   // true
console.log(/colou?r/.test("colour"));  // true
```

---

## Flags — Cờ tùy chọn

| Flag | Tên | Ý nghĩa |
|:---:|:---|:---|
| `g` | global | Tìm tất cả, không dừng ở kết quả đầu |
| `i` | insensitive | Không phân biệt hoa/thường |
| `m` | multiline | `^` và `$` khớp từng dòng |
| `s` | dotAll | `.` khớp cả `\n` |
| `u` | unicode | Hỗ trợ Unicode đầy đủ |

```javascript
const text = "Hello hello HELLO";

// Không có flag — chỉ tìm kết quả đầu tiên
console.log(text.match(/hello/));  // ["hello"] (1 kết quả)

// g — tìm tất cả
console.log(text.match(/hello/g)); // ["hello"] (1 kết quả, vì phân biệt hoa/thường)

// gi — tìm tất cả, không phân biệt hoa/thường
console.log(text.match(/hello/gi)); // ["Hello", "hello", "HELLO"]

// m — multiline
const multiline = `Line 1
Line 2
Line 3`;
console.log(multiline.match(/^Line/gm)); // ["Line", "Line", "Line"] — mỗi dòng
console.log(multiline.match(/^Line/g));  // ["Line"] — chỉ đầu chuỗi
```

---

## Các method của Regex

### test() — Kiểm tra true/false

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log(emailRegex.test("user@gmail.com")); // true
console.log(emailRegex.test("invalid-email"));  // false
console.log(emailRegex.test("@gmail.com"));     // false
```

### match() — Tìm kết quả

```javascript
const text = "Giá: 150,000đ và 200,000đ";

// Không có flag g — trả về chi tiết kết quả đầu tiên
const result = text.match(/\d+/);
console.log(result[0]);     // "150"
console.log(result.index);  // 5 (vị trí bắt đầu)

// Có flag g — trả về mảng tất cả kết quả
const allNumbers = text.match(/\d+/g);
console.log(allNumbers); // ["150", "000", "200", "000"]
```

### replace() — Tìm và thay thế

```javascript
// Thay thế đầu tiên
console.log("Hello World".replace(/world/i, "JavaScript"));
// "Hello JavaScript"

// Thay thế tất cả (flag g)
console.log("ha ha ha".replace(/ha/g, "hê"));
// "hê hê hê"

// Dùng callback
const text = "hello world";
const result = text.replace(/\b\w/g, (char) => char.toUpperCase());
console.log(result); // "Hello World" — viết hoa chữ đầu mỗi từ
```

### split() — Tách chuỗi theo pattern

```javascript
// Tách bằng nhiều dấu phân cách
const data = "Minh,Lan;Hùng An";
const names = data.split(/[,;\s]+/);
console.log(names); // ["Minh", "Lan", "Hùng", "An"]

// Tách câu
const text = "Hello! How are you? I'm fine.";
const sentences = text.split(/[.!?]+\s*/);
console.log(sentences); // ["Hello", "How are you", "I'm fine", ""]
```

### matchAll() — Tìm tất cả với chi tiết (ES2020)

```javascript
const text = "Email: an@gmail.com và binh@yahoo.com";
const regex = /(\w+)@(\w+)\.(\w+)/g;

for (const match of text.matchAll(regex)) {
  console.log(`Email: ${match[0]}`);
  console.log(`  User: ${match[1]}`);
  console.log(`  Domain: ${match[2]}.${match[3]}`);
}
// Email: an@gmail.com → User: an, Domain: gmail.com
// Email: binh@yahoo.com → User: binh, Domain: yahoo.com
```

---

## Groups và Capturing

### Capturing Groups — Bắt nhóm

```javascript
// Parentheses () tạo group — lưu kết quả riêng
const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
const match = "Ngày: 27/04/2026".match(dateRegex);

console.log(match[0]); // "27/04/2026" — toàn bộ match
console.log(match[1]); // "27" — group 1 (ngày)
console.log(match[2]); // "04" — group 2 (tháng)
console.log(match[3]); // "2026" — group 3 (năm)
```

### Named Groups — Đặt tên group (ES2018)

```javascript
const dateRegex = /(?<ngay>\d{2})\/(?<thang>\d{2})\/(?<nam>\d{4})/;
const match = "27/04/2026".match(dateRegex);

console.log(match.groups.ngay);  // "27"
console.log(match.groups.thang); // "04"
console.log(match.groups.nam);   // "2026"

// Dùng trong replace
const result = "27/04/2026".replace(
  /(?<d>\d{2})\/(?<m>\d{2})\/(?<y>\d{4})/,
  "$<y>-$<m>-$<d>"
);
console.log(result); // "2026-04-27"
```

### Non-Capturing Groups — Không bắt

```javascript
// (?:...) — gom nhóm nhưng không lưu kết quả
const regex = /(?:http|https):\/\/(\w+)/;
const match = "https://google".match(regex);

console.log(match[0]); // "https://google"
console.log(match[1]); // "google" — chỉ bắt domain, không bắt protocol
```

---

## Ví dụ thực tế — Validate dữ liệu

### Validate Email

```javascript
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

console.log(validateEmail("user@gmail.com"));     // true
console.log(validateEmail("user.name@co.uk"));    // true
console.log(validateEmail("invalid@"));           // false
console.log(validateEmail("@gmail.com"));         // false
```

### Validate số điện thoại Việt Nam

```javascript
function validatePhone(phone) {
  // Bắt đầu bằng 0 hoặc +84, tiếp theo 9-10 chữ số
  const regex = /^(0|\+84)\d{9,10}$/;
  return regex.test(phone);
}

console.log(validatePhone("0912345678"));   // true
console.log(validatePhone("+84912345678")); // true
console.log(validatePhone("123456789"));    // false
```

### Validate mật khẩu mạnh

```javascript
function validatePassword(password) {
  // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
  const rules = {
    doDay: password.length >= 8,
    coHoa: /[A-Z]/.test(password),
    coThuong: /[a-z]/.test(password),
    coSo: /\d/.test(password),
    coDacBiet: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const valid = Object.values(rules).every(Boolean);
  return { valid, rules };
}

console.log(validatePassword("Abc123!@"));
// { valid: true, rules: { doDay: true, coHoa: true, ... } }

console.log(validatePassword("abc123"));
// { valid: false, rules: { doDay: false, coHoa: false, ... } }
```

### Trích xuất hashtags

```javascript
function layHashtags(text) {
  return text.match(/#\w+/g) || [];
}

const baiViet = "Hôm nay #dep_troi quá! #javascript #coding #100DaysOfCode";
console.log(layHashtags(baiViet));
// ["#dep_troi", "#javascript", "#coding", "#100DaysOfCode"]
```

---

## Lỗi thường gặp

### 1. Quên escape ký tự đặc biệt

```javascript
// ❌ Sai — . là metacharacter, match bất kỳ ký tự nào
const regex = /file.txt/;
console.log(regex.test("file.txt")); // true
console.log(regex.test("fileXtxt")); // true — không mong muốn!

// ✅ Đúng — escape bằng backslash
const regex2 = /file\.txt/;
console.log(regex2.test("file.txt")); // true
console.log(regex2.test("fileXtxt")); // false ✅
```

### 2. Greedy vs Lazy matching

```javascript
const html = '<p>Hello</p><p>World</p>';

// ❌ Greedy (mặc định) — match dài nhất có thể
console.log(html.match(/<p>.*<\/p>/)[0]);
// "<p>Hello</p><p>World</p>" — match cả 2 tag!

// ✅ Lazy (thêm ?) — match ngắn nhất có thể
console.log(html.match(/<p>.*?<\/p>/)[0]);
// "<p>Hello</p>" — chỉ match tag đầu tiên
```

### 3. Flag g với test() — kết quả không nhất quán

```javascript
// ❌ Sai — regex có flag g ghi nhớ lastIndex
const regex = /hello/g;
console.log(regex.test("hello world")); // true
console.log(regex.test("hello world")); // false — vì lastIndex đã thay đổi!
console.log(regex.test("hello world")); // true — reset lại

// ✅ Đúng — không dùng flag g với test()
const regex2 = /hello/;
console.log(regex2.test("hello world")); // true (luôn nhất quán)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Regex là gì? Khi nào nên dùng?

**Đáp án:** Regex (Regular Expression) là mẫu mô tả tập hợp các chuỗi, dùng để tìm kiếm, kiểm tra, và thay thế văn bản. Nên dùng khi cần validate input (email, phone, password), trích xuất dữ liệu từ text, tìm kiếm/thay thế phức tạp. Không nên dùng cho HTML parsing phức tạp hay khi có thư viện chuyên dụng tốt hơn.

### Câu 2: Sự khác nhau giữa `match()` và `matchAll()`?

**Đáp án:** `match()` không có flag `g` trả về chi tiết kết quả đầu tiên (với groups). Có flag `g` trả về mảng tất cả kết quả nhưng **mất thông tin groups**. `matchAll()` (ES2020) trả về iterator với chi tiết **đầy đủ** cho mỗi kết quả (groups, index) — bắt buộc dùng flag `g`.

### Câu 3: Greedy và Lazy matching khác nhau thế nào?

**Đáp án:** Greedy (mặc định: `*`, `+`, `?`) cố gắng match **dài nhất** có thể. Lazy (thêm `?`: `*?`, `+?`, `??`) cố gắng match **ngắn nhất** có thể. Ví dụ: với chuỗi `"<b>bold</b>"`, regex `/<.*>/` (greedy) match `"<b>bold</b>"`, nhưng `/<.*?>/` (lazy) match `"<b>"`.

### Câu 4: Viết regex kiểm tra chuỗi là địa chỉ IPv4 hợp lệ

**Đáp án:**

```javascript
function isValidIPv4(str) {
  const regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return regex.test(str);
}

isValidIPv4("192.168.1.1");   // true
isValidIPv4("255.255.255.0"); // true
isValidIPv4("256.1.1.1");     // false
isValidIPv4("1.2.3");         // false
```

### Câu 5: Tại sao dùng `test()` với flag `g` có thể cho kết quả khác nhau mỗi lần gọi?

**Đáp án:** Regex với flag `g` duy trì thuộc tính `lastIndex` — vị trí bắt đầu tìm kiếm tiếp theo. Sau mỗi lần `test()` thành công, `lastIndex` dịch chuyển. Khi hết chuỗi, `test()` trả về `false` và reset `lastIndex = 0`. Giải pháp: không dùng flag `g` với `test()`, hoặc tạo regex mới mỗi lần, hoặc reset `regex.lastIndex = 0` thủ công.
