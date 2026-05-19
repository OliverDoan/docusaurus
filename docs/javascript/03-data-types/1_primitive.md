---
sidebar_position: 1
title: "1. Primitive Types"
---

# Primitive Types

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [String](#string)
- [Number](#number)
- [Boolean](#boolean)
- [null và undefined](#null-và-undefined)
- [Symbol](#symbol)
- [BigInt](#bigint)

---

## Tổng quan

JavaScript có **7 kiểu primitive**:

| Kiểu | Giá trị |
|------|---------|
| `string` | Chuỗi ký tự |
| `number` | Số (int + float, IEEE-754) |
| `boolean` | `true` / `false` |
| `null` | Rỗng có chủ ý |
| `undefined` | Chưa được gán |
| `symbol` | ID duy nhất |
| `bigint` | Số nguyên cực lớn |

Primitive là **immutable** — không sửa được, chỉ thay bằng giá trị mới.

---

## String

```js
const a = "double quotes";
const b = 'single quotes';
const c = `template literal với ${a}`;

c.length;       // số ký tự
c.toUpperCase();
c.includes("quote");
c.split(" ");
```

Template literal hỗ trợ multi-line + interpolation:

```js
const name = "An";
const html = `
  <div>
    <h1>${name}</h1>
  </div>
`;
```

:::info[Phân tích]

JS string là **immutable UTF-16**. Một số hệ quả quan trọng:

```js
"😀".length; // 2 — emoji chiếm 2 code unit UTF-16
"😀"[0];     // "\uD83D" (surrogate pair, vô nghĩa)

[..."😀"].length;        // 1 — iterator hiểu code point
"😀".codePointAt(0);     // 128512
```

Khi xử lý string có emoji, ký tự đặc biệt, ngôn ngữ phức tạp:

- **Đếm số ký tự "thật"**: dùng `[...str].length` hoặc `Intl.Segmenter`.
- **Cắt string**: tránh `slice`/`substring` ở giữa surrogate pair.
- **So sánh**: dùng `localeCompare` với locale phù hợp.

:::

---

## Number

```js
const dec = 42;
const float = 3.14;
const hex = 0xff;       // 255
const bin = 0b1010;     // 10
const oct = 0o777;      // 511
const exp = 1.5e3;      // 1500
```

Giá trị đặc biệt:

```js
Infinity;
-Infinity;
NaN;            // Not-a-Number

Number.isFinite(42);    // true
Number.isNaN(NaN);      // true
Number.MAX_SAFE_INTEGER; // 2^53 - 1
```

:::warning[Cần lưu ý]

JS dùng **IEEE-754 double precision** cho mọi số → không chính xác tuyệt
đối với số thập phân:

```js
0.1 + 0.2;              // 0.30000000000000004
0.1 + 0.2 === 0.3;      // false
```

Khi cần chính xác (tiền tệ, đo lường):

- Dùng **integer (cents)** thay vì float (`$1.00` → `100` cents).
- Hoặc thư viện như **decimal.js**, **big.js**.

```js
// Sai
const total = price * 0.1; // có thể sai số

// Đúng
const totalCents = Math.round(priceCents * 0.1);
```

:::

---

## Boolean

```js
const yes = true;
const no = false;

Boolean(1);    // true
Boolean("");   // false
!!"hello";     // true (idiom convert sang boolean)
```

**Falsy values** (8 cái): `false`, `0`, `-0`, `0n`, `""`, `null`,
`undefined`, `NaN`. Mọi thứ khác là truthy — kể cả `"0"`, `[]`, `{}`.

---

## null và undefined

```js
let a;            // a = undefined (mặc định)
let b = null;     // null — chủ ý gán

typeof undefined; // "undefined"
typeof null;      // "object" (bug lịch sử của JS)

null == undefined;  // true (loose equality)
null === undefined; // false
```

:::info[Phân tích]

**Quy ước thực dụng**:

- `undefined`: dùng cho **giá trị mặc định** (biến chưa gán, hàm không
  return, property không tồn tại). **Không nên gán thủ công**.
- `null`: dùng khi **chủ ý gán** một giá trị "rỗng" (vd biến reset, API
  trả về "không có").

```js
function find(id) {
  // ...
  return null; // chủ ý: "không tìm thấy"
}

let user; // undefined — chưa load
user = await fetchUser();
```

Khi viết API/library, **nhất quán** chỉ dùng một trong hai cho ý nghĩa
"rỗng" — đừng trộn lẫn (gây nhầm khi check).

:::

---

## Symbol

`Symbol` (ES6) tạo **identifier duy nhất** — hai symbol khác nhau dù
cùng description:

```js
const a = Symbol("id");
const b = Symbol("id");
a === b; // false

const KEY = Symbol("user.private");
const user = { name: "An", [KEY]: "secret" };
user[KEY]; // "secret"
```

Symbol thường dùng để:

- Tạo **property không trùng** với key của library/user.
- Định nghĩa **well-known symbol** (`Symbol.iterator`, `Symbol.asyncIterator`,
  `Symbol.toPrimitive`...).

:::tip[Mẹo]

Pattern phổ biến — implement iterator protocol:

```js
class Range {
  constructor(start, end) { this.start = start; this.end = end; }

  [Symbol.iterator]() {
    let i = this.start;
    return {
      next: () => i <= this.end
        ? { value: i++, done: false }
        : { value: undefined, done: true },
    };
  }
}

for (const n of new Range(1, 5)) console.log(n); // 1, 2, 3, 4, 5
```

`Symbol.iterator` là cách JS kết nối object với `for...of`, spread, destructuring.

:::

---

## BigInt

`BigInt` (ES2020) — số nguyên cực lớn, không bị giới hạn 2^53.

```js
const big = 9007199254740993n;       // suffix n
const fromNumber = BigInt(10);
const fromString = BigInt("12345678901234567890");

big + 1n;        // OK
big + 1;         // TypeError — không trộn với number
Number(big);     // convert tường minh
```

:::warning[Cần lưu ý]

**BigInt và Number không thao tác trực tiếp** — phải convert tường minh:

```js
const a = 10n;
const b = 5;

a + b;           // TypeError
a + BigInt(b);   // 15n
Number(a) + b;   // 15
```

BigInt **không có thập phân** — `10n / 3n === 3n` (cắt phần dư).

Performance: BigInt **chậm hơn** Number đáng kể vì không dùng được CPU
register trực tiếp. Chỉ dùng khi thực sự cần (crypto, ID khổng lồ, timestamp
nanosecond...).

:::
