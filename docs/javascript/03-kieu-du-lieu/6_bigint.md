---
sidebar_position: 6
title: "6. BigInt"
---

# BigInt

---

## Mục lục

- [BigInt là gì?](#bigint-là-gì)
- [Tại sao cần BigInt?](#tại-sao-cần-bigint)
- [Khởi tạo BigInt](#khởi-tạo-bigint)
- [Toán tử với BigInt](#toán-tử-với-bigint)
- [BigInt vs Number — không trộn lẫn](#bigint-vs-number--không-trộn-lẫn)
- [Khi nào nên dùng BigInt?](#khi-nào-nên-dùng-bigint)
- [Hạn chế của BigInt](#hạn-chế-của-bigint)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## BigInt là gì?

`BigInt` là **kiểu dữ liệu nguyên thuỷ** ra mắt trong **ES2020**, dùng để biểu diễn các **số nguyên cực lớn** vượt quá giới hạn của `Number`.

```js
const big = 9007199254740993n;   // BigInt (có "n" ở cuối)
typeof big;                       // "bigint"
```

## Tại sao cần BigInt?

JavaScript trước đây dùng `Number` (kiểu IEEE 754 double precision 64-bit) cho mọi số. Giới hạn:

```js
Number.MAX_SAFE_INTEGER;   // 9007199254740991  (2^53 - 1)
```

Vượt qua giới hạn này, các số nguyên **mất chính xác**:

```js
9007199254740992 === 9007199254740993;   // true ⚠️ (sai!)

9007199254740992 + 1;   // 9007199254740992  (lẽ ra 9007199254740993)
9007199254740992 + 2;   // 9007199254740994  (đúng)
```

### Vấn đề thực tế

```js
// API trả về user ID lớn (vd: Twitter Snowflake)
const tweetId = 1234567890123456789;
console.log(tweetId);   // 1234567890123456800 ⚠️ Sai!
```

Các use case cần độ chính xác tuyệt đối cho số lớn:
- ID database (Snowflake, MongoDB ObjectId)
- Số tiền (Wei trong Ethereum)
- Crypto / hash
- Mã hoá / blockchain
- Tính toán khoa học

## Khởi tạo BigInt

### Cách 1: Literal với hậu tố `n`

```js
const a = 123n;
const b = 0n;
const c = 9007199254740993n;
const d = -42n;
```

### Cách 2: Hàm `BigInt()`

```js
BigInt(123);             // 123n
BigInt("123");           // 123n
BigInt("0x1fffffffffffff"); // 9007199254740991n
BigInt(true);            // 1n

// Lỗi nếu không phải số nguyên
BigInt(1.5);     // ❌ RangeError
BigInt("abc");   // ❌ SyntaxError
```

### Hệ cơ số khác

```js
const bin = 0b1010n;     // binary
const oct = 0o12n;       // octal
const hex = 0xa0n;       // hex
```

## Toán tử với BigInt

### Toán tử số học

```js
10n + 20n;   // 30n
20n - 5n;    // 15n
3n * 4n;     // 12n
10n / 3n;    // 3n  (chia integer — không có phần thập phân!)
10n % 3n;    // 1n
2n ** 10n;   // 1024n
-5n;         // -5n
```

### Toán tử so sánh

```js
1n < 2n;     // true
1n == 1;     // true  (loose: ép kiểu)
1n === 1;    // false (strict: khác type)
1n > 0;      // true  (so sánh khác type vẫn được)
```

### Toán tử bit

```js
0b1100n & 0b1010n;   // 0b1000n = 8n
0b1100n | 0b1010n;   // 0b1110n = 14n
0b1100n ^ 0b1010n;   // 0b0110n = 6n
~0b1010n;            // -11n
2n << 3n;            // 16n
16n >> 2n;           // 4n
```

> **Lưu ý:** `>>>` (unsigned right shift) **không hoạt động** với BigInt.

## BigInt vs Number — không trộn lẫn

### Không được mix trong toán học

```js
10n + 5;     // ❌ TypeError: Cannot mix BigInt and other types

// Phải chuyển đổi rõ ràng
10n + BigInt(5);     // 15n
Number(10n) + 5;     // 15

// Hoặc dùng template literal
`${10n + 20n} điểm`;   // "30 điểm"
```

### So sánh thì OK

```js
1n == 1;     // true
1n < 2;      // true
1n === 1;    // false (khác type)

[1n, 2n, 3n].sort();   // [1n, 2n, 3n]
```

### Chuyển đổi

```js
// BigInt → Number (có thể mất chính xác)
Number(123n);                          // 123
Number(9007199254740993n);             // 9007199254740992 ⚠️ mất 1 đơn vị

// Number → BigInt (chỉ chấp nhận integer)
BigInt(123);     // 123n
BigInt(1.5);     // ❌ RangeError

// String → BigInt
BigInt("999999999999999999");   // 999999999999999999n
```

### JSON không hỗ trợ BigInt

```js
JSON.stringify({ id: 123n });   // ❌ TypeError: Do not know how to serialize a BigInt

// Workaround: dùng replacer
const json = JSON.stringify({ id: 123n }, (k, v) => 
  typeof v === "bigint" ? v.toString() : v
);
// '{"id":"123"}'

// Parse lại
JSON.parse('{"id":"123"}', (k, v) => 
  k === "id" ? BigInt(v) : v
);
// { id: 123n }
```

## Khi nào nên dùng BigInt?

### ✅ Nên dùng khi:

1. **Số nguyên vượt 2^53 - 1**
   ```js
   // Twitter ID, Snowflake ID
   const tweetId = 1234567890123456789n;
   ```

2. **Mã hoá / crypto**
   ```js
   // RSA, hash lớn
   const modulus = 2n ** 2048n;
   ```

3. **Tài chính / blockchain**
   ```js
   // 1 ETH = 10^18 Wei
   const weiAmount = 1000000000000000000n;
   ```

4. **Tính toán chính xác tuyệt đối với số nguyên rất lớn**

### ❌ Không nên dùng khi:

1. **Số thập phân** → BigInt **không hỗ trợ**
2. **Performance critical** → BigInt **chậm hơn Number** ~5-10 lần
3. **Số nguyên dưới 2^53** → dùng Number cho đơn giản

## Hạn chế của BigInt

### 1. Không có `Math` hoạt động với BigInt

```js
Math.sqrt(16n);   // ❌ TypeError
Math.max(1n, 2n); // ❌ TypeError
```

### 2. Chia không có phần thập phân

```js
10n / 3n;   // 3n  (KHÔNG phải 3.333...)
```

### 3. Hiệu năng chậm hơn

```js
// Number: nhanh
let sum = 0;
for (let i = 0; i < 1e6; i++) sum += i;

// BigInt: chậm hơn ~5x
let sum = 0n;
for (let i = 0n; i < 1000000n; i++) sum += i;
```

### 4. Không tương thích nhiều thư viện cũ

Lodash, date-fns, các thư viện trước 2020 không hỗ trợ BigInt → cẩn thận khi truyền vào.

### 5. Browser support

Hỗ trợ từ Chrome 67+, Firefox 68+, Safari 14+, Node 10.4+. Trên trình duyệt cũ → cần polyfill (có nhưng không hoàn hảo).

---

## Câu hỏi phỏng vấn

### Câu 1: Vì sao cần BigInt khi đã có Number?

**Đáp án:**

`Number` (IEEE 754 double 64-bit) chỉ biểu diễn chính xác số nguyên trong khoảng `[-2^53+1, 2^53-1]` (~9 triệu tỷ). Vượt qua giới hạn này, số nguyên **mất chính xác**:

```js
9007199254740992 + 1;   // 9007199254740992 (sai!)
```

`BigInt` cho phép biểu diễn số nguyên **không giới hạn** (chỉ giới hạn bởi RAM).

### Câu 2: Đoán kết quả

```js
console.log(10n / 3n);
console.log(10n / 3);
console.log(BigInt(10) === 10);
console.log(10n == 10);
```

**Đáp án:**

```
3n               (BigInt chia integer)
TypeError        (không mix BigInt và Number)
false            (=== khác type)
true             (== ép kiểu)
```

### Câu 3: Làm sao serialize BigInt sang JSON?

**Đáp án:**

`JSON.stringify` ném lỗi với BigInt. Cần dùng **replacer**:

```js
const data = { id: 9007199254740993n, name: "Alice" };

const json = JSON.stringify(data, (key, value) => 
  typeof value === "bigint" ? value.toString() : value
);
// '{"id":"9007199254740993","name":"Alice"}'

// Khi parse lại, dùng reviver để phục hồi BigInt
const parsed = JSON.parse(json, (key, value) => 
  key === "id" ? BigInt(value) : value
);
```

### Câu 4: Khi nào tránh dùng BigInt?

**Đáp án:**

- Khi cần số thập phân → BigInt chỉ là integer
- Khi performance là ưu tiên → BigInt chậm hơn Number ~5-10x
- Khi số luôn nằm trong `Number.MAX_SAFE_INTEGER` → dùng Number cho đơn giản
- Khi làm việc với thư viện cũ không hỗ trợ BigInt
