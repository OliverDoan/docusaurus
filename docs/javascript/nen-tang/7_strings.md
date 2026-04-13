---
sidebar_position: 7
title: "7. Chuỗi (String)"
---

# Chuỗi (String)

## String là gì?

**String** (chuỗi) là kiểu dữ liệu dùng để lưu trữ **văn bản** — bất kỳ ký tự nào: chữ cái, số, dấu câu, emoji...

> **Ví dụ thực tế:** String giống như một **chuỗi hạt cườm** — mỗi ký tự là một hạt cườm được xâu lại theo thứ tự. Bạn có thể đếm số hạt, cắt ra một đoạn, tìm hạt cụ thể, nhưng **không thể thay đổi** hạt nào đã xâu (immutable).

```js
const greeting = "Xin chào!";
const name = 'Thuan';
const template = `Tôi tên ${name}`;
```

## Ba cách tạo string

```js
// 1. Dấu nháy kép (double quotes)
const str1 = "Hello World";

// 2. Dấu nháy đơn (single quotes) — giống hệt nháy kép
const str2 = 'Hello World';

// 3. Backtick — Template literal (ES6, khuyên dùng)
const name = "Thuan";
const str3 = `Xin chào ${name}!`; // Có thể chèn biến vào
```

## Tại sao Template Literal ra đời?

### Vấn đề trước ES6

```js
// ❌ Trước ES6 — nối chuỗi bằng + rất khó đọc
const name = "Thuan";
const age = 25;
const city = "HCM";

const intro = "Tôi tên " + name + ", " + age + " tuổi, sống ở " + city + ".";
// Khó đọc, dễ quên dấu cách, dễ sai

// ❌ Chuỗi nhiều dòng phải dùng \n hoặc nối +
const html = "<div>\n" +
             "  <h1>" + name + "</h1>\n" +
             "  <p>Tuổi: " + age + "</p>\n" +
             "</div>";
```

### ES6 giải quyết với Template Literal

```js
// ✅ Template literal — dễ đọc, dễ viết
const intro = `Tôi tên ${name}, ${age} tuổi, sống ở ${city}.`;

// ✅ Chuỗi nhiều dòng — tự nhiên
const html = `
  <div>
    <h1>${name}</h1>
    <p>Tuổi: ${age}</p>
  </div>
`;

// ✅ Có thể chèn biểu thức
const message = `Năm sau bạn ${age + 1} tuổi`;
const status = `Trạng thái: ${isActive ? "Hoạt động" : "Ngừng"}`;
```

## Các phương thức String phổ biến

### Đo chiều dài

```js
const text = "JavaScript";
console.log(text.length); // 10 — length là thuộc tính, không phải method
```

### Tìm kiếm trong chuỗi

```js
const sentence = "Tôi đang học JavaScript tại nhà";

// indexOf — vị trí xuất hiện đầu tiên (trả về -1 nếu không tìm thấy)
console.log(sentence.indexOf("JavaScript")); // 13
console.log(sentence.indexOf("Python"));     // -1

// includes — có chứa hay không (trả về true/false)
console.log(sentence.includes("JavaScript")); // true
console.log(sentence.includes("Python"));     // false

// startsWith — bắt đầu bằng?
console.log(sentence.startsWith("Tôi"));     // true
console.log(sentence.startsWith("Bạn"));     // false

// endsWith — kết thúc bằng?
console.log(sentence.endsWith("nhà"));       // true
console.log(sentence.endsWith("trường"));    // false
```

### Cắt chuỗi

```js
const text = "JavaScript";

// slice(start, end) — cắt từ vị trí start đến end (không bao gồm end)
console.log(text.slice(0, 4));   // "Java"
console.log(text.slice(4));      // "Script" (từ vị trí 4 đến hết)
console.log(text.slice(-6));     // "Script" (6 ký tự cuối)
console.log(text.slice(0, -6));  // "Java" (bỏ 6 ký tự cuối)

// substring(start, end) — tương tự slice nhưng không nhận số âm
console.log(text.substring(0, 4)); // "Java"
console.log(text.substring(4));    // "Script"
```

### Biến đổi chuỗi

```js
const text = "  Xin Chào JavaScript  ";

// Xóa khoảng trắng đầu/cuối
console.log(text.trim());      // "Xin Chào JavaScript"
console.log(text.trimStart()); // "Xin Chào JavaScript  "
console.log(text.trimEnd());   // "  Xin Chào JavaScript"

// Chuyển hoa/thường
const name = "thuan";
console.log(name.toUpperCase()); // "THUAN"
console.log(name.toLowerCase()); // "thuan"

// Thay thế
const greeting = "Hello World";
console.log(greeting.replace("World", "Việt Nam")); // "Hello Việt Nam"
// replace chỉ thay THẾ LẦN ĐẦU TIÊN

const text2 = "aaabbbccc";
console.log(text2.replace("a", "x"));    // "xaabbbccc" (chỉ thay 1 lần)
console.log(text2.replaceAll("a", "x")); // "xxxbbbccc" (thay tất cả)
```

### Tách và nối chuỗi

```js
// split — tách chuỗi thành mảng
const csv = "Thuan,25,HCM";
const parts = csv.split(",");
console.log(parts); // ["Thuan", "25", "HCM"]

const words = "Tôi đang học JavaScript".split(" ");
console.log(words); // ["Tôi", "đang", "học", "JavaScript"]

// Tách từng ký tự
const chars = "Hello".split("");
console.log(chars); // ["H", "e", "l", "l", "o"]

// join — nối mảng thành chuỗi (ngược lại split)
const arr = ["Thuan", "25", "HCM"];
console.log(arr.join(", ")); // "Thuan, 25, HCM"
console.log(arr.join(" - ")); // "Thuan - 25 - HCM"
console.log(arr.join(""));   // "Thuan25HCM"
```

### Lặp lại và padding

```js
// repeat — lặp lại chuỗi
console.log("Ha".repeat(3)); // "HaHaHa"
console.log("*".repeat(10)); // "**********"

// padStart / padEnd — thêm ký tự để đạt độ dài mong muốn
const orderNumber = "42";
console.log(orderNumber.padStart(6, "0")); // "000042"
console.log(orderNumber.padEnd(6, "0"));   // "420000"

// Ứng dụng: format thời gian
const hours = 9;
const minutes = 5;
const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
console.log(time); // "09:05"
```

### Truy cập ký tự

```js
const text = "JavaScript";

// Dùng bracket notation
console.log(text[0]);    // "J"
console.log(text[4]);    // "S"
console.log(text[-1]);   // undefined (không hỗ trợ index âm)

// charAt — tương tự bracket nhưng là method
console.log(text.charAt(0));  // "J"
console.log(text.charAt(99)); // "" (chuỗi rỗng nếu index vượt quá)

// at — hỗ trợ index âm (ES2022)
console.log(text.at(0));   // "J"
console.log(text.at(-1));  // "t" (ký tự cuối cùng)
console.log(text.at(-3));  // "i"
```

## String là Immutable (Bất biến)

> **Quan trọng:** String trong JavaScript là **immutable** — không thể thay đổi ký tự trong chuỗi đã tạo. Mọi method đều **trả về chuỗi mới**.

```js
const original = "Hello";

// ❌ Không thể thay đổi ký tự trực tiếp
original[0] = "J";
console.log(original); // "Hello" — KHÔNG thay đổi!

// ✅ Tạo chuỗi mới
const modified = "J" + original.slice(1);
console.log(modified); // "Jello"
console.log(original); // "Hello" — chuỗi gốc không đổi
```

## Lỗi thường gặp

### 1. Quên rằng string method trả về giá trị mới

```js
const name = "  thuan  ";

// ❌ Gọi method nhưng không lưu kết quả
name.trim();
name.toUpperCase();
console.log(name); // "  thuan  " — vẫn y nguyên!

// ✅ Lưu kết quả vào biến mới
const trimmed = name.trim();
const upper = trimmed.toUpperCase();
console.log(upper); // "THUAN"

// ✅ Hoặc chain (nối) các method
const result = name.trim().toUpperCase();
console.log(result); // "THUAN"
```

### 2. indexOf trả về 0 (falsy!)

```js
const text = "JavaScript";

// ❌ Sai: 0 là falsy nên if không chạy
if (text.indexOf("Java")) {
  console.log("Tìm thấy"); // KHÔNG chạy vì indexOf("Java") = 0 (falsy)
}

// ✅ Đúng: so sánh với -1
if (text.indexOf("Java") !== -1) {
  console.log("Tìm thấy"); // Chạy!
}

// ✅ Hoặc dùng includes (dễ đọc hơn)
if (text.includes("Java")) {
  console.log("Tìm thấy"); // Chạy!
}
```

### 3. Nhầm lẫn split và join

```js
// split: String → Array
"a,b,c".split(","); // ["a", "b", "c"]

// join: Array → String
["a", "b", "c"].join(","); // "a,b,c"

// ❌ Dùng ngược
// "a,b,c".join(","); // Lỗi! String không có method join
// ["a","b","c"].split(","); // Lỗi! Array không có method split
```

---

## Câu hỏi phỏng vấn

### Câu 1: Viết hàm đảo ngược một chuỗi?

**Đáp án:**

Có nhiều cách:

```js
// Cách 1: split + reverse + join (phổ biến nhất)
function reverseString(str) {
  return str.split("").reverse().join("");
}
console.log(reverseString("Hello")); // "olleH"

// Cách 2: Vòng lặp ngược
function reverseString2(str) {
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

// Cách 3: Spread operator + reverse
function reverseString3(str) {
  return [...str].reverse().join("");
}

// Cách 4: Reduce
function reverseString4(str) {
  return str.split("").reduce((reversed, char) => char + reversed, "");
}
```

### Câu 2: String immutable nghĩa là gì?

**Đáp án:**

**Immutable** (bất biến) nghĩa là chuỗi đã tạo **không thể thay đổi**. Mọi thao tác trên string đều **tạo ra chuỗi mới** thay vì sửa chuỗi gốc.

```js
const str = "Hello";

// Gán lại ký tự — KHÔNG có tác dụng
str[0] = "J";
console.log(str); // "Hello" — không đổi

// Các method KHÔNG thay đổi chuỗi gốc
const upper = str.toUpperCase();
console.log(str);   // "Hello" — chuỗi gốc giữ nguyên
console.log(upper); // "HELLO" — chuỗi mới

// So sánh với Array (mutable)
const arr = [1, 2, 3];
arr[0] = 99;
console.log(arr); // [99, 2, 3] — array BỊ thay đổi!
```

Tại sao string immutable?
- **An toàn:** Tránh bug do side effect (thay đổi ngoài ý muốn)
- **Hiệu suất:** JavaScript có thể tối ưu bộ nhớ (string interning)
- **Hashable:** String có thể dùng làm key trong object/Map

### Câu 3: Sự khác nhau giữa slice và substring?

**Đáp án:**

| | `slice(start, end)` | `substring(start, end)` |
|---|---------------------|------------------------|
| **Index âm** | Hỗ trợ (-1 = cuối) | Không (coi như 0) |
| **start > end** | Trả về `""` | Tự hoán đổi start/end |
| **Khuyên dùng** | **Dùng slice** | Ít dùng |

```js
const text = "JavaScript";

// Index âm
console.log(text.slice(-6));      // "Script"
console.log(text.substring(-6));  // "JavaScript" (coi -6 = 0)

// start > end
console.log(text.slice(4, 0));      // "" (trả về rỗng)
console.log(text.substring(4, 0));  // "Java" (hoán đổi → substring(0, 4))
```

**Best practice:** Luôn dùng `slice` vì hành vi nhất quán và hỗ trợ index âm.

### Câu 4: Kiểm tra một chuỗi có phải palindrome không?

**Đáp án:**

Palindrome là chuỗi đọc xuôi và ngược **giống nhau** (ví dụ: "madam", "racecar"):

```js
function isPalindrome(str) {
  // Chuyển về chữ thường và loại bỏ ký tự đặc biệt
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  const reversed = cleaned.split("").reverse().join("");
  return cleaned === reversed;
}

console.log(isPalindrome("madam"));       // true
console.log(isPalindrome("racecar"));     // true
console.log(isPalindrome("hello"));       // false
console.log(isPalindrome("A man a plan a canal Panama")); // true

// Cách tối ưu: chỉ so sánh nửa đầu với nửa sau
function isPalindrome2(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  const len = cleaned.length;

  for (let i = 0; i < Math.floor(len / 2); i++) {
    if (cleaned[i] !== cleaned[len - 1 - i]) {
      return false;
    }
  }
  return true;
}
```

### Câu 5: Đếm số lần xuất hiện của một ký tự trong chuỗi?

**Đáp án:**

```js
// Cách 1: split
function countChar(str, char) {
  return str.split(char).length - 1;
}
console.log(countChar("javascript", "a")); // 2

// Cách 2: Vòng lặp
function countChar2(str, char) {
  let count = 0;
  for (const c of str) {
    if (c === char) count++;
  }
  return count;
}

// Cách 3: Regex
function countChar3(str, char) {
  const matches = str.match(new RegExp(char, "g"));
  return matches ? matches.length : 0;
}

// Cách 4: reduce
function countChar4(str, char) {
  return [...str].reduce((count, c) => c === char ? count + 1 : count, 0);
}
```
