---
sidebar_position: 3
title: "✅ 3. Data Types"
---

# ✅ 3. Data Types

## 1. Primitive Types

Bài học: [1. Primitive Types](../../javascript/03-data-types/1_primitive.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. JavaScript có mấy kiểu `primitive`? Kể đủ và nêu điểm chung của chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

JavaScript có **7 kiểu primitive**:

| Kiểu        | Giá trị                         |
| ----------- | ------------------------------- |
| `string`    | Chuỗi ký tự (UTF-16)            |
| `number`    | Số nguyên + thực, theo IEEE-754 |
| `boolean`   | `true` / `false`                |
| `null`      | Rỗng có chủ ý                   |
| `undefined` | Chưa được gán                   |
| `symbol`    | ID duy nhất (ES6)               |
| `bigint`    | Số nguyên cực lớn (ES2020)      |

Điểm chung của chúng:

- **Immutable** — không sửa được chính giá trị, chỉ gán giá trị mới cho biến.
- **So sánh theo giá trị**: `"a" === "a"` là `true` (khác object, so theo tham chiếu).
- **Không phải object** — không có property riêng (trừ `null`/`undefined`, các kiểu còn lại mượn method qua wrapper object tạm thời).
- Được lưu trực tiếp trong biến, sao chép khi gán và khi truyền vào hàm.

Mọi thứ còn lại trong JS (`object`, `array`, `function`, `Date`, `Map`...) đều là **object**.

</details>

**2. Nói primitive là `immutable` nghĩa là gì? Vì sao `str[0] = "X"` không làm đổi chuỗi mà cũng không báo lỗi ở sloppy mode?**

<details className="qa">
<summary>Xem đáp án</summary>

**Immutable** nghĩa là bản thân **giá trị** không thể bị sửa đổi. Các method của string đều **trả về chuỗi mới**, không đụng tới chuỗi gốc:

```js
let s = "hello";
s.toUpperCase(); // "HELLO" — giá trị mới
s; // "hello" — không đổi
s = "world"; // đây là gán lại BIẾN, không phải sửa giá trị cũ
```

Về `str[0] = "X"`:

```js
let str = "hello";
str[0] = "X";
console.log(str); // "hello" — không đổi
```

Khi gán vào `str[0]`, engine **autobox** `str` thành một object `String` **tạm thời**, thực hiện phép gán trên object tạm đó rồi vứt đi ngay. Chuỗi gốc không hề bị ảnh hưởng.

Còn chuyện không báo lỗi: các index của string là property **read-only**. Ở **sloppy mode**, gán vào property read-only **thất bại trong im lặng**; ở **strict mode** (và trong ES Module) thì ném `TypeError`. Muốn đổi ký tự, phải tạo chuỗi mới: `"X" + str.slice(1)`.

</details>

**3. So sánh primitive và object về cách lưu trữ và cách truyền vào hàm (`pass by value` với `pass by reference`). Cho ví dụ chứng minh.**

<details className="qa">
<summary>Xem đáp án</summary>

|               | Primitive                       | Object                                         |
| ------------- | ------------------------------- | ---------------------------------------------- |
| Biến chứa gì  | **Chính giá trị**               | **Tham chiếu** tới vùng nhớ chứa object        |
| Gán `b = a`   | Copy giá trị — hai biến độc lập | Copy tham chiếu — hai biến trỏ cùng một object |
| So sánh `===` | Theo giá trị                    | Theo tham chiếu (cùng một object hay không)    |

```js
let a = 1;
let b = a;
b = 2;
console.log(a); // 1 — độc lập

const o1 = { n: 1 };
const o2 = o1;
o2.n = 2;
console.log(o1.n); // 2 — chung một object

console.log({ n: 1 } === { n: 1 }); // false — hai object khác nhau
```

**Về truyền vào hàm:** JavaScript **luôn là pass by value**. Với object, cái được copy vào tham số là **giá trị của tham chiếu** — nên hàm sửa được nội dung bên trong, nhưng **gán lại** tham số thì không ảnh hưởng biến bên ngoài:

```js
function f(obj) {
  obj.n = 99; // ảnh hưởng ra ngoài
  obj = { n: 0 }; // KHÔNG ảnh hưởng — chỉ đổi biến cục bộ
}
const o = { n: 1 };
f(o);
console.log(o.n); // 99
```

Cơ chế này thường được gọi là **pass by sharing**.

</details>

**4. `typeof NaN` trả về gì? Vì sao? `NaN === NaN` cho kết quả gì, và cách kiểm tra `NaN` đúng chuẩn là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
typeof NaN; // "number"
NaN === NaN; // false
```

**`typeof NaN` là `"number"`** — nghe nghịch lý nhưng đúng: `NaN` (Not-a-Number) là một **giá trị đặc biệt thuộc kiểu number** theo chuẩn IEEE-754, dùng để biểu diễn kết quả của một phép toán số không cho ra số hợp lệ (`0/0`, `Math.sqrt(-1)`, `Number("abc")`). Nó nói "phép tính số này thất bại", chứ không nói "đây không phải kiểu số".

**`NaN === NaN` là `false`** vì IEEE-754 quy định `NaN` **không bằng bất cứ giá trị nào, kể cả chính nó** — hai phép tính hỏng khác nhau thì không có lý do gì để coi là bằng nhau. `NaN` là giá trị duy nhất trong JS có tính chất này.

Cách kiểm tra đúng chuẩn:

```js
Number.isNaN(x); // chuẩn nhất — không ép kiểu
Object.is(x, NaN); // cũng đúng
x !== x; // trick cũ, vẫn chính xác

isNaN(x); // TRÁNH — ép kiểu trước khi kiểm tra
```

</details>

**5. Phân biệt `isNaN()` toàn cục với `Number.isNaN()`. Vì sao `isNaN("foo")` trả về `true`?**

<details className="qa">
<summary>Xem đáp án</summary>

|                   | `isNaN(x)` (toàn cục)                          | `Number.isNaN(x)` (ES6)                                |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Cách hoạt động    | **Ép `x` sang number trước**, rồi mới kiểm tra | Kiểm tra trực tiếp: `x` có đúng là giá trị `NaN` không |
| Trả về `true` khi | `x` không chuyển được sang số hợp lệ           | Chỉ khi `x` **chính là** `NaN`                         |
| Nên dùng          | Không                                          | Có                                                     |

```js
isNaN("foo"); // true
Number.isNaN("foo"); // false

isNaN("123"); // false — "123" ép được thành 123
isNaN(undefined); // true  — Number(undefined) là NaN
Number.isNaN(undefined); // false

isNaN(NaN); // true
Number.isNaN(NaN); // true
```

**Vì sao `isNaN("foo")` là `true`?** Vì nó thực hiện `Number("foo")` trước, ra `NaN`, rồi kết luận "đúng là NaN". Nói chính xác thì `isNaN` trả lời câu hỏi _"giá trị này có ép sang số được không?"_, chứ không phải _"giá trị này có phải `NaN` không?"_ — cái tên gây hiểu nhầm. Trong code hiện đại luôn dùng `Number.isNaN` (hoặc `Object.is(x, NaN)`).

</details>

**6. Vì sao `0.1 + 0.2 !== 0.3`? Giải thích ngắn gọn `IEEE-754` và cách bạn xử lý khi tính tiền tệ.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
0.1 + 0.2; // 0.30000000000000004
0.1 + 0.2 === 0.3; // false
```

JS dùng **IEEE-754 double precision** (64 bit) cho mọi số: 1 bit dấu, 11 bit số mũ, 52 bit phần định trị — lưu số dưới dạng **nhị phân**. Vấn đề là `0.1` và `0.2` trong hệ nhị phân là **phân số vô hạn tuần hoàn** (giống như `1/3` trong hệ thập phân), nên buộc phải làm tròn khi lưu. Cộng hai giá trị đã làm tròn lại cho ra sai số nhỏ ở khoảng chữ số thứ 17.

Cách xử lý khi tính tiền tệ:

- **Dùng integer, quy về đơn vị nhỏ nhất** (cents, đồng) — cách phổ biến và đơn giản nhất.

```js
// Sai
const total = price * 0.1; // có thể sai số

// Đúng
const totalCents = Math.round(priceCents * 0.1);
```

- Dùng thư viện số thập phân chính xác: **decimal.js**, **big.js**.
- Với số nguyên rất lớn thì dùng **BigInt**.
- Khi buộc phải so sánh float, so theo **epsilon**: `Math.abs(a - b) < Number.EPSILON`.
- Chỉ làm tròn/định dạng ở **bước hiển thị** (`Intl.NumberFormat`), không làm tròn giữa chừng khi tính.

</details>

**7. `Number.MAX_SAFE_INTEGER` nghĩa là gì? Chuyện gì xảy ra khi backend trả về một `id` số vượt quá giới hạn đó?**

<details className="qa">
<summary>Xem đáp án</summary>

`Number.MAX_SAFE_INTEGER` = **2^53 − 1 = 9007199254740991**. "An toàn" nghĩa là trong khoảng này, mọi số nguyên đều biểu diễn được **chính xác và duy nhất** bằng IEEE-754 double. Vượt quá, phần định trị 52 bit không đủ chỗ, nên nhiều số nguyên khác nhau bị làm tròn về **cùng một giá trị**:

```js
const bigId = 9007199254740993; // id từ DB
bigId === 9007199254740992; // true (!) — mất 1 đơn vị
Number.MAX_SAFE_INTEGER; // 9007199254740991
```

**Khi backend trả id vượt giới hạn** (id 64-bit kiểu snowflake của Twitter/Discord, `BIGINT` của DB): `JSON.parse` sẽ biến nó thành `number` bị **sai lệch âm thầm** — hai bản ghi khác nhau có thể nhận cùng một id, hoặc gửi id lên server lại thành id của người khác. Nguy hiểm vì không hề có lỗi nào được ném ra.

Cách xử lý:

- **Backend trả id dưới dạng string** (giải pháp thực dụng nhất, Twitter dùng `id_str`).
- Dùng **BigInt** nếu cần tính toán: `9007199254740993n`.
- Kiểm tra bằng `Number.isSafeInteger(x)` trước khi tin vào một số.
- Không bao giờ dùng số lớn làm khóa mà chưa xác nhận nó nằm trong vùng an toàn.

</details>

**8. Phân biệt `null` và `undefined` về ý nghĩa và về `typeof`. Vì sao `typeof null === "object"`?**

<details className="qa">
<summary>Xem đáp án</summary>

|                   | `undefined`                                                                       | `null`                      |
| ----------------- | --------------------------------------------------------------------------------- | --------------------------- |
| Ý nghĩa           | "**Chưa gán**" — giá trị mặc định                                                 | "**Cố ý rỗng**" — chủ ý gán |
| Ai tạo ra         | Engine (biến chưa gán, hàm không `return`, property không tồn tại, tham số thiếu) | Lập trình viên gán tay      |
| `typeof`          | `"undefined"`                                                                     | `"object"`                  |
| Nên gán thủ công? | Không nên                                                                         | Có, khi muốn nói "không có" |

```js
let a; // undefined — chưa load
let b = null; // null — đã check, không có

function find(id) {
  return null; // chủ ý: "không tìm thấy"
}
```

**Vì sao `typeof null === "object"`?** Đây là **bug lịch sử** từ bản JS đầu tiên năm 1995. Khi đó giá trị được lưu kèm một **type tag** ở vài bit thấp, và tag `000` nghĩa là "object". `null` được biểu diễn bằng con trỏ NULL — toàn bit 0 — nên `typeof` đọc ra tag `000` và kết luận là `"object"`. Lỗi này từng được đề xuất sửa nhưng bị bác vì sẽ **phá vỡ vô số website cũ**, nên nó ở lại vĩnh viễn. Muốn kiểm tra chính xác thì dùng `x === null`.

</details>

**9. `null == undefined` và `null === undefined` cho kết quả gì? Khi nào bạn cố tình dùng `==` để check cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
null == undefined; // true  — loose equality
null === undefined; // false — khác kiểu
```

`===` so cả **kiểu lẫn giá trị**; `null` và `undefined` là hai kiểu khác nhau nên không bằng. Còn với `==`, spec có một **luật riêng**: `null` và `undefined` chỉ loose-equal với nhau (và **không** loose-equal với bất kỳ giá trị nào khác — kể cả `0`, `""` hay `false`).

Đây chính là **use case hợp lệ hiếm hoi của `==`**: idiom `value == null` để bắt gọn cả hai trường hợp "không có giá trị":

```js
if (value == null) {
  // bắt cả null lẫn undefined, không bắt 0, "", false
}

// Tương đương, dài hơn:
if (value === null || value === undefined) {
}
```

Rất tiện khi xử lý dữ liệu từ API — nơi một field vắng mặt có thể là `undefined` (không có key) hoặc `null` (server trả rõ là rỗng).

Cùng họ với idiom này là `??` và `?.`, vì chúng cũng chỉ phản ứng với đúng hai giá trị `null` và `undefined`.

</details>

**10. So sánh toán tử `??` và `||`. Với `count = 0` hoặc `name = ""` thì hai toán tử cho kết quả khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

|                                   | `\|\|` (logical OR)          | `??` (nullish coalescing)       |
| --------------------------------- | ---------------------------- | ------------------------------- |
| Lấy vế phải khi vế trái là        | Bất kỳ giá trị **falsy** nào | **Chỉ** `null` hoặc `undefined` |
| Bao gồm `0`, `""`, `false`, `NaN` | Có — bị coi là "không có"    | Không — vẫn là giá trị hợp lệ   |

```js
const count = 0;
count || 10; // 10 — sai ý định! 0 là giá trị thật
count ?? 10; // 0  — đúng

const name = "";
name || "Ẩn danh"; // "Ẩn danh"
name ?? "Ẩn danh"; // ""  — chuỗi rỗng là lựa chọn hợp lệ của người dùng
```

Đây là nguồn bug rất phổ biến: dùng `||` để đặt giá trị mặc định cho các option số hoặc chuỗi, rồi `0`, `""`, `false` âm thầm bị thay bằng default.

Quy tắc chọn:

- Dùng `??` khi mặc định chỉ nên áp dụng lúc **thiếu giá trị** (cấu hình, dữ liệu API) — đây là mặc định nên dùng.
- Dùng `||` khi bạn **thật sự** muốn gộp mọi giá trị falsy (ví dụ `str || "N/A"` khi chuỗi rỗng cũng coi như không có).

Lưu ý cú pháp: không được trộn `??` với `&&`/`||` mà không có ngoặc — `a || b ?? c` là `SyntaxError`.

</details>

**11. Kể đủ 8 giá trị `falsy`. `"0"`, `[]`, `{}` là truthy hay falsy? Vậy vì sao `[] == false` lại là `true`?**

<details className="qa">
<summary>Xem đáp án</summary>

**8 giá trị falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.

Mọi thứ khác đều **truthy** — bao gồm `"0"`, `"false"`, `[]`, `{}`, `function(){}`, `Infinity`, `-1`.

```js
Boolean("0"); // true — chuỗi khác rỗng
Boolean([]); // true
Boolean({}); // true
if ([]) console.log("chạy vào đây"); // có chạy
```

**Vậy vì sao `[] == false` là `true`?** Vì `==` **không** dùng phép chuyển sang boolean như `if` — nó chạy thuật toán riêng, quy cả hai vế **về number**:

1. Một vế là boolean → `false` chuyển thành `0`. Còn lại: `[] == 0`.
2. Một vế là object → `[]` qua `ToPrimitive`: `[].toString()` cho `""`.
3. So `"" == 0` → chuỗi chuyển thành number: `Number("")` là `0`.
4. `0 == 0` → **`true`**.

Nên `[]` vừa truthy (trong `if`) vừa `== false` — hai cơ chế hoàn toàn khác nhau. Đây là lý do kinh điển để luôn dùng `===` và kiểm tra mảng bằng `arr.length === 0`.

</details>

**12. `Symbol` sinh ra để giải quyết vấn đề gì? `Symbol("id") === Symbol("id")` cho kết quả gì, và `Symbol.for("id")` khác chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Symbol` (ES6) sinh ra để tạo **identifier duy nhất**, giải quyết bài toán **đụng độ key** khi nhiều bên cùng gắn property lên một object:

```js
// Vấn đề: key string dễ đụng độ
const user = { id: 1 };
user.id = "private-token"; // ghi đè mất id gốc của library!

// Giải pháp
const ID = Symbol("id");
const user2 = { [ID]: 1 };
user2[ID]; // 1 — an toàn, không ai vô tình ghi đè
```

**`Symbol("id") === Symbol("id")` là `false`** — mỗi lần gọi `Symbol()` tạo ra một symbol **hoàn toàn mới**; chuỗi truyền vào chỉ là _description_ để debug, không tham gia so sánh.

**`Symbol.for("id")` khác ở chỗ** nó dùng một **registry toàn cục**: gọi lần đầu thì tạo và lưu lại, gọi lại cùng khoá thì **trả về đúng symbol cũ**:

```js
Symbol("id") === Symbol("id"); // false
Symbol.for("id") === Symbol.for("id"); // true
Symbol.keyFor(Symbol.for("id")); // "id"
```

Dùng `Symbol()` khi muốn key thật sự riêng tư trong module của mình; dùng `Symbol.for()` khi cần **chia sẻ cùng một symbol qua nhiều file, iframe hay realm**.

</details>

**13. Property có key là `symbol` có xuất hiện trong `Object.keys`, `for...in` hay `JSON.stringify` không? Cách lấy chúng ra?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — cả ba đều bỏ qua key symbol:

```js
const KEY = Symbol("user.private");
const user = { name: "An", [KEY]: "secret" };

Object.keys(user); // ["name"]
for (const k in user) {
} // chỉ "name"
JSON.stringify(user); // '{"name":"An"}'
Object.entries(user); // [["name", "An"]]
```

Đây là lý do symbol hợp để gắn **metadata riêng tư**: nó không lộ ra khi log, serialize hay lặp qua object. Lưu ý đây là "riêng tư theo quy ước", **không phải bảo mật** — ai có tham chiếu tới symbol vẫn đọc được.

Cách lấy ra:

```js
Object.getOwnPropertySymbols(user); // [Symbol(user.private)]
Reflect.ownKeys(user); // ["name", Symbol(user.private)]
user[KEY]; // "secret" — nếu có sẵn symbol
```

Ngoài ra, `Object.assign` và spread `{ ...user }` **có** copy key symbol (chúng copy mọi own enumerable property, kể cả symbol) — khác với `JSON.stringify`. Muốn serialize được, phải tự xử lý qua `toJSON` hoặc chuyển sang key string.

</details>

**14. `Symbol.iterator` dùng để làm gì? Nó liên quan thế nào tới `for...of`, spread và destructuring?**

<details className="qa">
<summary>Xem đáp án</summary>

`Symbol.iterator` là một **well-known symbol**: nó là "cái móc" mà JS dùng để hỏi một object _"làm sao lặp qua bạn?"_. Object nào có method ở key `[Symbol.iterator]` trả về một iterator (object có `next()` cho ra `{ value, done }`) thì được coi là **iterable**.

```js
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  [Symbol.iterator]() {
    let i = this.start;
    return {
      next: () =>
        i <= this.end
          ? { value: i++, done: false }
          : { value: undefined, done: true },
    };
  }
}

const r = new Range(1, 5);
for (const n of r) console.log(n); // 1, 2, 3, 4, 5
[...r]; // [1, 2, 3, 4, 5]
const [first, second] = r; // 1, 2
```

Ba cú pháp trong ví dụ đều **gọi ngầm `[Symbol.iterator]()`**: `for...of`, spread (`[...r]`, và cả khi truyền đối số) và destructuring mảng. `Array.from`, `Promise.all`, `new Map(...)`, `yield*` cũng vậy.

Nhờ cơ chế này, `Array`, `String`, `Map`, `Set`, `arguments`, `NodeList` đều dùng chung một giao thức — và object tự viết cũng "hoà nhập" được chỉ bằng một method.

</details>

**15. `BigInt` ra đời để giải bài toán nào? Vì sao `10n + 1` ném `TypeError`? `10n / 3n` bằng bao nhiêu?**

<details className="qa">
<summary>Xem đáp án</summary>

**`BigInt` (ES2020)** ra đời cho **số nguyên vượt quá `Number.MAX_SAFE_INTEGER` (2^53 − 1)** — nơi `number` bắt đầu mất chính xác: id 64-bit (snowflake của Twitter/Discord), `BIGINT` từ DB, timestamp nanosecond, crypto.

```js
const bigId = 9007199254740993n; // suffix n
bigId === 9007199254740992n; // false — chính xác
BigInt("12345678901234567890");
```

**Vì sao `10n + 1` ném `TypeError`?** Vì `bigint` và `number` là **hai kiểu khác nhau với ngữ nghĩa khác nhau** — `number` có thập phân và làm tròn, `bigint` là số nguyên chính xác tuyệt đối. Nếu cho trộn ngầm, engine sẽ phải chọn ép về bên nào, và ép về `number` thì lại **âm thầm mất chính xác** — đúng thứ mà `BigInt` sinh ra để tránh. Nên spec bắt **convert tường minh**:

```js
10n + 1; // TypeError
10n + BigInt(1); // 11n
Number(10n) + 1; // 11
```

**`10n / 3n` bằng `3n`** — `BigInt` không có thập phân, phép chia **cắt bỏ phần dư** (truncate về phía 0).

Lưu ý: `BigInt` chậm hơn `number` đáng kể vì không dùng trực tiếp CPU register — chỉ dùng khi thực sự cần.

</details>

**16. `10n == 10` và `10n === 10` cho kết quả gì? Vì sao lại khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
10n == 10; // true
10n === 10; // false
```

Khác nhau vì hai toán tử làm hai việc khác nhau:

- **`===` (strict equality)** yêu cầu **cùng kiểu** trước đã. `typeof 10n` là `"bigint"`, `typeof 10` là `"number"` — khác kiểu nên trả `false` ngay, không cần so giá trị.
- **`==` (loose equality)** cho phép ép kiểu. Với cặp bigint–number, spec so sánh **giá trị toán học** của hai bên: `10n` và `10` cùng biểu diễn số 10, nên `true`.

Vài ví dụ liên quan:

```js
0n == 0; // true
0n === 0; // false
10n == "10"; // true  — chuỗi được parse thành bigint
10n > 9; // true  — toán tử so sánh CÓ cho trộn kiểu
10n + 1; // TypeError — toán tử số học thì KHÔNG

typeof 10n; // "bigint"
Boolean(0n); // false — 0n là một trong 8 giá trị falsy
```

Điểm dễ nhầm: `BigInt` cấm trộn kiểu ở **toán tử số học** (vì dễ mất chính xác), nhưng vẫn cho **so sánh** (`==`, `<`, `>`) giữa bigint và number.

</details>

**17. String là primitive, vậy vì sao `"abc".toUpperCase()` vẫn chạy được? Giải thích `wrapper object` / autoboxing và vì sao `new String("a") === "a"` là `false`.**

<details className="qa">
<summary>Xem đáp án</summary>

Primitive không có property hay method. Khi bạn viết `"abc".toUpperCase()`, engine thực hiện **autoboxing**:

1. Tạo tạm một **wrapper object** `String` bọc lấy giá trị `"abc"`.
2. Gọi method `toUpperCase` lấy từ `String.prototype` của object tạm đó.
3. Trả kết quả rồi **vứt bỏ object tạm** ngay lập tức.

Ba kiểu có wrapper tương ứng: `String`, `Number`, `Boolean` (thêm `Symbol`, `BigInt` ở dạng hạn chế). `null` và `undefined` không có — nên gọi method trên chúng là `TypeError`.

Hệ quả dễ thấy của việc object tạm bị vứt đi:

```js
let s = "hello";
s.custom = 1; // gán lên object tạm rồi bỏ
s.custom; // undefined
```

**Vì sao `new String("a") === "a"` là `false`?** Vì `new String("a")` tạo một **object thật sự**, còn `"a"` là primitive:

```js
typeof "a"; // "string"
typeof new String("a"); // "object"
new String("a") === "a"; // false — khác kiểu
new String("a") == "a"; // true  — == ép object về primitive
new String("a") === new String("a"); // false — hai object khác nhau
```

Vì vậy **không bao giờ dùng `new String`/`new Number`/`new Boolean`** — chúng còn luôn truthy, kể cả `new Boolean(false)`.

</details>

**18. `"😀".length` bằng bao nhiêu và vì sao? Làm sao đếm đúng số ký tự người dùng nhìn thấy?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
"😀".length; // 2
"😀"[0]; // "\uD83D" — nửa surrogate pair, vô nghĩa
```

Vì string trong JS là dãy **UTF-16 code unit**, và `.length` đếm **code unit chứ không đếm ký tự**. Các ký tự nằm ngoài mặt phẳng cơ bản (emoji, một số chữ Hán hiếm, ký hiệu toán học) cần **2 code unit** — gọi là **surrogate pair** — nên `.length` trả về 2.

Cách đếm đúng hơn:

```js
[..."😀"].length; // 1 — iterator của string hiểu code point
"😀".codePointAt(0); // 128512

// Đếm theo "ký tự người dùng nhìn thấy" (grapheme cluster):
const seg = new Intl.Segmenter("vi", { granularity: "grapheme" });
[...seg.segment("👨‍👩‍👧")].length; // 1
```

Vì sao cần `Intl.Segmenter`? Vì ngay cả code point cũng chưa đủ: emoji gia đình `👨‍👩‍👧` gồm nhiều code point nối bằng ZWJ, cờ quốc gia gồm 2 ký tự vùng, chữ có dấu kết hợp cũng vậy — người dùng nhìn thấy **một** ký tự.

Lưu ý thực tế: tránh `slice`/`substring` cắt giữa surrogate pair (sẽ ra ký tự hỏng), và dùng `localeCompare` khi so sánh chuỗi theo ngôn ngữ.

</details>

**19. So sánh `==` và `===`. Kể vài trường hợp coercion gây bất ngờ mà bạn từng gặp.**

<details className="qa">
<summary>Xem đáp án</summary>

|                | `==` (loose equality)          | `===` (strict equality)             |
| -------------- | ------------------------------ | ----------------------------------- |
| Kiểu khác nhau | **Ép kiểu** rồi mới so         | Trả `false` ngay                    |
| Quy tắc        | Phức tạp, nhiều bước theo spec | Đơn giản: cùng kiểu và cùng giá trị |
| Nên dùng       | Chỉ trong idiom `x == null`    | **Mặc định dùng cái này**           |

Các trường hợp coercion gây bất ngờ:

```js
"" == 0; // true  — "" ép thành 0
"0" == 0; // true
"" == "0"; // false — hai chuỗi khác nhau (!)

[] == false; // true  — [] → "" → 0, false → 0
[] == ![]; // true  — cùng lý do
[1] == 1; // true  — [1] → "1" → 1

null == undefined; // true  — luật riêng của spec
null == 0; // false — null KHÔNG ép sang số
NaN == NaN; // false — NaN không bằng chính nó

"1" === 1; // false — khác kiểu, rõ ràng
```

Chú ý `==` **không có tính bắc cầu**: `"" == 0` và `"0" == 0` đều `true` nhưng `"" == "0"` lại `false` — đủ thấy nó khó suy luận tới mức nào.

Quy tắc thực dụng: luôn dùng `===` (bật rule `eqeqeq` của ESLint), ngoại lệ duy nhất là `value == null` để bắt gọn cả `null` lẫn `undefined`.

</details>

---

## 2. Object và typeof

Bài học: [2. Object và typeof](../../javascript/03-data-types/2_object-typeof.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Object khác primitive ở điểm nào? Vì sao object được gọi là `reference type`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Primitive** (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) chỉ giữ **một giá trị duy nhất** và **immutable** — không sửa được tại chỗ, mọi thao tác đều tạo giá trị mới. **Object** gom nhiều cặp `key: value` (kể cả method) và **mutable** — sửa property trực tiếp được.

Khác biệt cốt lõi nằm ở **cách lưu**: biến primitive giữ luôn giá trị, còn biến object chỉ giữ **tham chiếu** (địa chỉ) tới vùng nhớ chứa object. Vì vậy object được gọi là **reference type**:

```js
let a = 1,
  b = a;
b = 2;
console.log(a); // 1 — copy giá trị

const o1 = { x: 1 },
  o2 = o1;
o2.x = 2;
console.log(o1.x); // 2 — copy tham chiếu, cùng một object

console.log({ x: 1 } === { x: 1 }); // false — khác tham chiếu
```

Hệ quả: gán biến không tạo bản sao, so sánh `===` so sánh tham chiếu chứ không so sánh nội dung, và truyền object vào hàm thì hàm có thể sửa được object gốc.

</details>

**2. Đoán output: `const a = { x: 1 }; const b = a; b.x = 2; console.log(a.x)`. Giải thích vì sao.**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`2`**.

```js
const a = { x: 1 };
const b = a; // KHÔNG tạo object mới — b giữ cùng tham chiếu với a
b.x = 2; // sửa property của object mà cả hai cùng trỏ tới
console.log(a.x); // 2
```

Lý do: object là **reference type**. Dòng `const b = a` chỉ copy **địa chỉ** của object, không copy nội dung. Sau đó `a` và `b` là hai biến trỏ tới **cùng một object** trong bộ nhớ, nên sửa qua `b` thì đọc qua `a` cũng thấy.

`const` cũng không cứu được: nó chỉ khoá **binding** (không cho gán lại biến), chứ không đóng băng nội dung object.

Muốn `a` không bị ảnh hưởng thì phải copy thật:

```js
const b = { ...a }; // shallow copy — b là object mới
b.x = 2;
console.log(a.x); // 1
```

</details>

**3. Key của một object thực chất được lưu ở kiểu gì? `obj[1]` và `obj["1"]` có trỏ tới cùng một property không? Còn key là `symbol` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Key của object thuần chỉ có **hai kiểu hợp lệ**: `string` và `symbol`. Mọi key khác (number, boolean, `null`, object...) đều bị **ép ngầm sang string** khi dùng làm key.

Vì vậy `obj[1]` và `obj["1"]` là **cùng một property** — số `1` được chuyển thành chuỗi `"1"`:

```js
const obj = {};
obj[1] = "a";
obj["1"] = "b";
console.log(obj[1]); // "b" — ghi đè lên cùng key
console.log(Object.keys(obj)); // ["1"] — key là string
```

**Symbol key** thì khác hẳn: mỗi `Symbol()` là duy nhất, không bao giờ trùng với key khác, và **bị ẩn** khỏi các cách duyệt thông thường:

```js
const id = Symbol("id");
const user = { name: "An", [id]: 123 };

Object.keys(user); // ["name"] — không thấy symbol
JSON.stringify(user); // '{"name":"An"}'
user[id]; // 123 — vẫn truy cập được
Object.getOwnPropertySymbols(user); // [Symbol(id)]
```

Nhờ đặc tính này, symbol hay được dùng làm key "riêng tư" hoặc metadata, tránh đụng tên với key của người khác.

</details>

**4. Khi nào bắt buộc phải dùng bracket notation thay vì dot notation?**

<details className="qa">
<summary>Xem đáp án</summary>

Dot notation chỉ dùng được khi key là một **identifier hợp lệ** viết cứng trong code. Phải chuyển sang bracket trong các trường hợp:

- **Key chứa ký tự đặc biệt hoặc khoảng trắng**: `user["full-name"]`, `user["first name"]`.
- **Key bắt đầu bằng số**: `obj["2fa"]` (viết `obj.2fa` là lỗi cú pháp).
- **Key nằm trong biến**: khi tên property chỉ biết lúc chạy.
- **Key tính toán runtime**: ghép chuỗi, lấy từ API, từ input người dùng.
- **Key là symbol**: `user[Symbol.iterator]`.

```js
const user = { name: "An", "full-name": "An Nguyễn" };

const key = "name";
user.key; // undefined — tìm property tên đúng là "key"
user[key]; // "An"     — lấy giá trị của biến key

user["full-name"]; // "An Nguyễn"
user[`user_${1}`] = true; // key ghép động
```

Lỗi kinh điển của người mới: dùng `obj.key` khi `key` là biến. Nhớ quy tắc — **dot lấy tên chữ, bracket lấy giá trị biểu thức**.

</details>

**5. `computed property` là gì và dùng trong tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Computed property** (ES6) cho phép đặt tên property bằng một **biểu thức tính lúc runtime**, viết trong cặp ngoặc vuông ngay trong object literal:

```js
const key = "name";
const user = { [key]: "An" }; // { name: "An" }

const prefix = "user_";
const obj = {
  [`${prefix}id`]: 1,
  [`${prefix}name`]: "An",
}; // { user_id: 1, user_name: "An" }
```

Trước ES6 phải tạo object rỗng rồi gán từng key bằng bracket — dài dòng và không dùng được trong literal.

Tình huống thường gặp:

- **Form động**: cập nhật state theo tên field, `setForm({ ...form, [e.target.name]: e.target.value })` — rất phổ biến trong React.
- **Biến object thành lookup table / map theo id**: `{ [item.id]: item }`.
- **Key theo hằng số hoặc symbol**: `{ [ACTION_TYPE]: handler }`, `{ [Symbol.iterator]() {...} }`.
- **i18n, cấu hình theo môi trường**: `{ [locale]: messages }`.

</details>

**6. Phân biệt `shallow copy` và `deep copy`. Spread `...` và `Object.assign` copy tới mức nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Shallow copy** (copy nông): tạo object mới, nhưng chỉ copy **một tầng**. Property là primitive thì copy giá trị; property là object thì copy **tham chiếu** — object lồng bên trong vẫn dùng chung.
- **Deep copy** (copy sâu): sao chép đệ quy toàn bộ các tầng, bản sao hoàn toàn độc lập với bản gốc.

Spread `...` và `Object.assign` đều chỉ là **shallow copy**:

```js
const a = { x: 1, user: { name: "An" } };
const b = { ...a };

b.x = 99;
console.log(a.x); // 1   — tầng 1 độc lập

b.user.name = "Bình";
console.log(a.user.name); // "Bình" — tầng 2 dùng chung tham chiếu!
```

Muốn độc lập hoàn toàn, dùng `structuredClone`:

```js
const c = structuredClone(a);
c.user.name = "Cường";
console.log(a.user.name); // "An"
```

Đây là nguồn bug rất hay gặp khi làm việc với state lồng nhau (React, Redux) — tưởng đã copy an toàn nhưng vẫn vô tình mutate dữ liệu gốc.

</details>

**7. So sánh `structuredClone` với `JSON.parse(JSON.stringify(obj))` khi deep clone. Cách thứ hai làm mất những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí                          | `structuredClone`                             | `JSON.parse(JSON.stringify(...))`          |
| --------------------------------- | --------------------------------------------- | ------------------------------------------ |
| Hỗ trợ                            | Built-in từ Node 17 và trình duyệt hiện đại   | Chạy ở mọi nơi                             |
| `Date`                            | Giữ nguyên là `Date`                          | Biến thành **string**                      |
| `Map`, `Set`                      | Clone đúng                                    | **Mất** — thành `{}`                       |
| `undefined`, `function`, `symbol` | `undefined` giữ được; function/symbol gây lỗi | Bị **bỏ qua** hoặc thành `null` trong mảng |
| `NaN`, `Infinity`                 | Giữ nguyên                                    | Thành `null`                               |
| Circular reference                | Xử lý được                                    | Ném `TypeError`                            |

```js
const a = { d: new Date(), s: new Set([1]), u: undefined, n: NaN };

JSON.parse(JSON.stringify(a));
// { d: "2024-01-01T...", s: {}, n: null } — u biến mất

structuredClone(a);
// { d: Date, s: Set(1), u: undefined, n: NaN } — đúng
```

Kết luận: `structuredClone` là lựa chọn mặc định. Hai giới hạn cần nhớ — nó **không clone được function** (ném `DataCloneError`) và **không giữ prototype** của class, object clone ra là object thuần.

</details>

**8. `typeof` trả về gì với `null`, `[]`, `{}`, `function(){}`, `NaN`? Vì sao `typeof null === "object"`?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
typeof null; // "object"   — quirk, KHÔNG phải "null"
typeof []; // "object"   — mảng cũng là object
typeof {}; // "object"
typeof function () {}; // "function" — ngoại lệ đặc biệt
typeof NaN; // "number"   — NaN là một giá trị số
```

**Vì sao `typeof null === "object"`?** Đây là **bug lịch sử** từ bản JS đầu tiên năm 1995: trong implementation gốc, kiểu của giá trị được mã hoá ở **3 bit đầu** của con trỏ. Object mang tag `000`, còn `null` được biểu diễn bằng pointer `0x00` — cũng cho ra tag `000`. Vì thế `typeof null` rơi vào nhánh "object".

Khi có đề xuất sửa trong ES5, quá nhiều code ngoài thực tế đã phụ thuộc vào hành vi này, nên quyết định **giữ lại vĩnh viễn** để không phá vỡ web.

Hệ quả thực tế: không bao giờ dùng `typeof x === "object"` để kết luận x là object — phải loại `null` trước, và dùng `Array.isArray()` để tách mảng.

</details>

**9. Làm sao phân biệt chính xác array, object thuần, `null` và `Date`? So sánh `Array.isArray`, `instanceof` và `Object.prototype.toString.call`.**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách                                | Ưu                                                | Nhược                                                        |
| ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `Array.isArray(v)`                  | Chuẩn xác, hoạt động cả cross-realm (iframe)      | Chỉ dùng cho mảng                                            |
| `v instanceof Date`                 | Đọc dễ, dùng được với mọi class                   | Sai khi giá trị đến từ realm khác; phụ thuộc prototype chain |
| `Object.prototype.toString.call(v)` | Phân biệt được hầu hết built-in type bằng một hàm | Dài dòng; có thể bị `Symbol.toStringTag` giả mạo             |

```js
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call({}); // "[object Object]"
Object.prototype.toString.call(new Date()); // "[object Date]"
```

Hàm kiểm tra kiểu thực dụng, đúng như bài đã trình bày:

```js
function getType(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
```

Thứ tự quan trọng: kiểm tra `null` **trước**, rồi tới mảng, cuối cùng mới dùng `typeof`. Với `Date` và các built-in khác thì dùng `Object.prototype.toString.call`.

</details>

**10. Vì sao `instanceof Array` có thể cho kết quả sai khi object đến từ một `iframe` khác?**

<details className="qa">
<summary>Xem đáp án</summary>

`instanceof` không so sánh "hình dạng" của giá trị — nó đi dọc **prototype chain** của object và kiểm tra xem có gặp đúng `Array.prototype` của **realm hiện tại** hay không.

Mỗi `iframe` (hay mỗi worker, mỗi vm context trong Node) là một **realm** riêng, có bộ global object riêng, nghĩa là có một `Array` và một `Array.prototype` **khác**. Mảng tạo bên trong iframe kế thừa từ `Array.prototype` của iframe đó, không phải của trang cha:

```js
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);
const arr = new iframe.contentWindow.Array(1, 2, 3);

arr instanceof Array; // false — khác realm!
Array.isArray(arr); // true  — vẫn đúng
```

`Array.isArray` được đặc tả ở mức thấp hơn: nó kiểm tra **internal slot** của giá trị chứ không dựa vào prototype, nên vượt qua được ranh giới realm.

Đây chính là lý do khuyến nghị luôn dùng `Array.isArray()` thay cho `instanceof Array` — đặc biệt trong thư viện dùng chung, code xử lý postMessage hay embed widget qua iframe.

</details>

**11. `typeof` với một biến chưa hề khai báo cho kết quả gì? Vì sao nó không ném `ReferenceError`?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả là chuỗi **`"undefined"`**, không ném lỗi:

```js
console.log(typeof khongTonTai); // "undefined" — an toàn
console.log(khongTonTai); // ReferenceError: khongTonTai is not defined
```

`typeof` là toán tử **duy nhất** được đặc tả cho phép nhận một tham chiếu chưa resolve được mà vẫn trả kết quả thay vì ném lỗi. Trong spec, `typeof` không thực hiện `GetValue` theo cách thông thường khi toán hạng là một _unresolvable reference_ — nó trả thẳng `"undefined"`.

Mục đích thực tế: cho phép **dò xem một API có tồn tại hay không** mà không cần try/catch — rất hữu ích thời chưa có module:

```js
if (typeof window !== "undefined") {
  // đang chạy trong trình duyệt
}
```

**Một ngoại lệ quan trọng:** biến khai báo bằng `let`/`const` trong **Temporal Dead Zone** vẫn ném `ReferenceError` khi gọi `typeof`:

```js
typeof x; // ReferenceError
let x = 1;
```

</details>

**12. So sánh `in`, `Object.hasOwn` và `obj.key !== undefined` khi kiểm tra sự tồn tại của property. Mỗi cách sai ở tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách                      | Xét prototype?     | Sai ở đâu                                                                                 |
| ------------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `"k" in obj`              | **Có**             | Trả `true` với property kế thừa (`"toString" in obj`) — không phải lúc nào cũng mong muốn |
| `Object.hasOwn(obj, "k")` | Không              | Gần như không có nhược điểm; chỉ cần môi trường hỗ trợ ES2022                             |
| `obj.k !== undefined`     | Có (đọc qua chain) | **Sai khi property tồn tại nhưng giá trị là `undefined`**                                 |

```js
const user = { name: "An", nickname: undefined };

"name" in user; // true
"toString" in user; // true — kế thừa từ Object.prototype
Object.hasOwn(user, "toString"); // false

"nickname" in user; // true  — property có tồn tại
Object.hasOwn(user, "nickname"); // true
user.nickname !== undefined; // false — kết luận SAI
```

Quy tắc chọn: muốn biết object **tự** có property → `Object.hasOwn`. Muốn biết truy cập được property (kể cả kế thừa từ class/prototype) → `in`. Còn `!== undefined` chỉ nên dùng khi bạn chắc chắn giá trị `undefined` không phải là dữ liệu hợp lệ.

</details>

**13. Vì sao `Object.hasOwn(obj, key)` được khuyến nghị thay cho `obj.hasOwnProperty(key)`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba lý do:

**1. Không bị object che khuất (shadow).** `obj.hasOwnProperty` là method kế thừa từ `Object.prototype`, nên nếu chính object có property trùng tên thì gọi sẽ sai hoặc crash:

```js
const obj = { hasOwnProperty: () => false };
obj.hasOwnProperty("a"); // false — luôn sai!
Object.hasOwn(obj, "a"); // false (đúng), và không bị đánh lừa
```

**2. Dùng được với object không có prototype.** `Object.create(null)` tạo object "sạch" (hay dùng làm dictionary), nó **không hề có** `hasOwnProperty`:

```js
const dict = Object.create(null);
dict.a = 1;
dict.hasOwnProperty("a"); // TypeError: is not a function
Object.hasOwn(dict, "a"); // true
```

**3. Ngắn hơn cách viết an toàn cũ.** Trước ES2022 phải viết `Object.prototype.hasOwnProperty.call(obj, key)` — dài và khó đọc.

`Object.hasOwn` (ES2022) là hàm static nên không phụ thuộc vào object đang xét. ESLint có rule `prefer-object-has-own` để tự nhắc migrate.

</details>

**14. `?.` (optional chaining) giải quyết vấn đề gì và khác gì so với chuỗi `&&`? Nó có che giấu lỗi thật không?**

<details className="qa">
<summary>Xem đáp án</summary>

`?.` giải quyết việc truy cập sâu vào object có thể `null`/`undefined` mà không ném `TypeError`. Nếu toán hạng bên trái là `null` hoặc `undefined`, biểu thức **short-circuit** và trả về `undefined`:

```js
user?.address?.city; // undefined nếu user hoặc address là null/undefined
user.getName?.(); // chỉ gọi nếu getName tồn tại
arr?.[0]; // optional với bracket
```

**Khác gì `&&`?**

|                         | `a && a.b`                                           | `a?.b`                    |
| ----------------------- | ---------------------------------------------------- | ------------------------- |
| Điều kiện dừng          | Mọi giá trị **falsy** (`0`, `""`, `NaN`, `false`...) | Chỉ `null` và `undefined` |
| Giá trị trả về khi dừng | Chính giá trị falsy đó (`0`, `""`...)                | Luôn là `undefined`       |

Vì vậy `count && count.toFixed()` sẽ trả `0` khi `count = 0`, còn `count?.toFixed()` vẫn chạy đúng.

**Có che giấu lỗi không?** Có. Rải `?.` khắp nơi sẽ biến một bug thật (gõ sai tên property, API đổi schema) thành `undefined` lặng lẽ, lỗi nổ ở chỗ khác rất khó truy. Chỉ dùng `?.` ở những nơi giá trị vắng mặt là **hợp lệ về nghiệp vụ**.

</details>

**15. `{ a: 1 } === { a: 1 }` cho kết quả gì? Bạn so sánh sâu hai object như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả là **`false`**. Object là reference type, `===` so sánh **tham chiếu** chứ không so sánh nội dung — đây là hai object khác nhau trong bộ nhớ dù trông giống hệt.

```js
const a = { x: 1 };
console.log(a === { x: 1 }); // false
console.log(a === a); // true — cùng tham chiếu
```

Các cách so sánh sâu:

- **Thư viện**: `lodash.isEqual(a, b)` — an toàn và đầy đủ nhất, xử lý được `Date`, `Map`, `Set`, mảng lồng, circular.
- **`JSON.stringify(a) === JSON.stringify(b)`**: nhanh và tiện nhưng **không đáng tin** — phụ thuộc **thứ tự key**, mất `undefined`/function, biến `Date` thành string:

  ```js
  JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ b: 2, a: 1 }); // false!
  ```

- **Tự viết đệ quy**: duyệt `Object.keys` hai bên, so số lượng key rồi so từng giá trị đệ quy — đủ dùng cho dữ liệu đơn giản, nhưng phải tự lo `null`, mảng và circular reference.

</details>

**16. So sánh `Object.keys`, `Object.entries` và `for...in` — cái nào duyệt cả property kế thừa từ prototype?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách                  | Trả về                | Own property?   | Kế thừa?  | Symbol key? |
| --------------------- | --------------------- | --------------- | --------- | ----------- |
| `Object.keys(obj)`    | Mảng các key (string) | Có (enumerable) | **Không** | Không       |
| `Object.entries(obj)` | Mảng `[key, value]`   | Có (enumerable) | **Không** | Không       |
| `for...in`            | Lặp qua từng key      | Có (enumerable) | **Có**    | Không       |

Chỉ `for...in` duyệt cả property **enumerable kế thừa** từ prototype chain:

```js
const base = { shared: 1 };
const obj = Object.create(base);
obj.own = 2;

Object.keys(obj); // ["own"]
Object.entries(obj); // [["own", 2]]
for (const k in obj) console.log(k); // "own", "shared"
```

Method built-in như `toString` không bị lộ ra vì chúng **non-enumerable**, nhưng property bạn tự thêm vào prototype thì có. Đó là lý do code cũ hay phải lọc `if (Object.hasOwn(obj, k))` bên trong `for...in`.

Thực tế: ưu tiên `Object.keys` / `Object.entries` (kết quả là mảng, dùng được `map`, `filter`, destructuring), hạn chế `for...in`. Với **mảng** thì dùng `for...of` — `for...in` duyệt index dạng string và không đảm bảo thứ tự.

</details>

**17. `const obj = {}` — vì sao vẫn thêm/sửa được property? `Object.freeze` chặn được tới đâu, có phải deep freeze không?**

<details className="qa">
<summary>Xem đáp án</summary>

`const` chỉ khoá **binding** — không cho gán lại biến sang giá trị khác. Nó hoàn toàn không đụng tới nội dung object mà biến đang trỏ tới:

```js
const obj = {};
obj.x = 1; // OK — tham chiếu không đổi
obj = { x: 1 }; // TypeError: Assignment to constant variable
```

`Object.freeze(obj)` mới thực sự đóng băng: không thêm, không xoá, không sửa property, không đổi prototype. Ở strict mode (và trong module), vi phạm sẽ ném `TypeError`; ở sloppy mode thì **thất bại im lặng**.

Nhưng `Object.freeze` chỉ **shallow** — object lồng bên trong vẫn sửa được:

```js
const o = Object.freeze({ a: 1, nested: { b: 2 } });
o.a = 99; // không đổi
o.nested.b = 99; // ĐỔI được — nested không bị freeze
```

Muốn deep freeze phải tự đệ quy:

```js
function deepFreeze(o) {
  Object.values(o).forEach((v) => {
    if (v && typeof v === "object") deepFreeze(v);
  });
  return Object.freeze(o);
}
```

</details>

**18. Khi nào nên dùng `Map` thay vì object thuần để làm dictionary?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `Map` khi:

- **Key không phải string/symbol** — `Map` chấp nhận mọi kiểu làm key, kể cả object và function; object thuần thì ép hết về string.
- **Thêm/xoá key liên tục** — `Map` được tối ưu cho thao tác này, còn `delete obj.k` làm engine phải đổi hidden class, chậm hơn.
- **Cần biết số phần tử** — `map.size` là O(1), còn object phải `Object.keys(obj).length`.
- **Cần duyệt theo đúng thứ tự chèn** — `Map` bảo toàn thứ tự chèn với mọi key; object thì key dạng số nguyên luôn bị sắp lên đầu theo giá trị tăng dần.
- **Key do người dùng/dữ liệu ngoài quyết định** — tránh đụng với property kế thừa như `__proto__`, `constructor`, `toString`.

```js
const m = new Map();
m.set({ id: 1 }, "a").set(42, "b");
m.size; // 2
for (const [k, v] of m) {
} // duyệt trực tiếp, đúng thứ tự chèn
```

Ngược lại, dùng **object thuần** khi cấu trúc cố định, key là string biết trước, hoặc cần `JSON.stringify` (Map không serialize được sang JSON).

</details>

---

## 3. Prototype và Prototypal Inheritance

Bài học: [3. Prototype và Prototypal Inheritance](../../javascript/03-data-types/3_prototype.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Prototypal inheritance` là gì? Nó khác mô hình class-based của Java/C++ ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Prototypal inheritance** là cơ chế trong đó mỗi object có một liên kết ẩn `[[Prototype]]` trỏ tới một **object khác**. Khi truy cập property không có sẵn, engine đi ngược theo chuỗi liên kết (prototype chain) để tìm. Nhờ vậy nhiều object có thể **dùng chung** một bản method thay vì mỗi object giữ một bản sao.

|                         | Class-based (Java/C++)                       | Prototype-based (JS)                          |
| ----------------------- | -------------------------------------------- | --------------------------------------------- |
| Đơn vị kế thừa          | Class — bản thiết kế, không tồn tại lúc chạy | Object thật, tồn tại trong bộ nhớ             |
| Quan hệ                 | Class kế thừa class, instance sinh từ class  | Object liên kết tới object                    |
| Thời điểm cố định       | Lúc compile                                  | Lúc runtime — đổi prototype được              |
| Thêm method sau khi tạo | Không                                        | Có — sửa `prototype` là mọi instance đổi theo |

```js
const animal = {
  eat() {
    console.log(`${this.name} đang ăn`);
  },
};
const dog = Object.create(animal); // object kế thừa object
dog.name = "Lulu";
dog.eat(); // "Lulu đang ăn"
```

JS lấy mô hình này từ ngôn ngữ **Self**. `class` của ES6 chỉ là lớp đường phủ lên đúng cơ chế prototype này, không phải kế thừa class-based thật.

</details>

**2. `[[Prototype]]`, `__proto__` và `Object.getPrototypeOf()` liên quan với nhau ra sao? Cái nào nên dùng trong code mới?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`[[Prototype]]`** là **internal slot** — tên trong đặc tả ECMAScript cho liên kết ẩn từ object tới prototype của nó. Bạn không truy cập trực tiếp được, nó chỉ là khái niệm trong spec.
- **`__proto__`** là **accessor property** (getter/setter) nằm trên `Object.prototype`, đọc và ghi vào `[[Prototype]]`. Nó vốn là phần mở rộng riêng của trình duyệt, sau mới được chuẩn hoá ở **Annex B** — tức chuẩn hoá để tương thích ngược, **không khuyến khích dùng**.
- **`Object.getPrototypeOf(obj)` / `Object.setPrototypeOf(obj, p)`** là API chính thức (ES5/ES6) để đọc và ghi cùng giá trị đó.

```js
const user = { name: "An" };

user.__proto__ === Object.prototype; // true
Object.getPrototypeOf(user) === Object.prototype; // true
```

**Code mới nên dùng `Object.getPrototypeOf`.** Lý do: `__proto__` không tồn tại trên object tạo bằng `Object.create(null)`, có thể bị shadow, và là nguồn gốc của lỗ hổng **prototype pollution** khi ghi từ dữ liệu người dùng. Muốn _tạo_ object với prototype chỉ định thì dùng `Object.create(proto)` — vừa rõ ràng vừa không phạt hiệu năng.

</details>

**3. Câu kinh điển: phân biệt `__proto__` và `prototype`. Mỗi cái thuộc về đối tượng nào và trỏ tới đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

|                     | `__proto__`                                                 | `prototype`                                                 |
| ------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| Thuộc về            | **Mọi object** (kể cả function, vì function cũng là object) | **Chỉ function** (constructor)                              |
| Trỏ tới             | Object cha trong prototype chain                            | Object sẽ trở thành cha của các instance sinh ra bằng `new` |
| Truy cập đúng chuẩn | `Object.getPrototypeOf(obj)`                                | `Constructor.prototype`                                     |
| Vai trò             | Liên kết **đang có** của object                             | **Khuôn** dùng để gắn liên kết cho instance tương lai       |

```js
function User() {}
const u = new User();

u.__proto__ === User.prototype; // true — new gắn liên kết này
User.__proto__ === Function.prototype; // true — User cũng là object
User.prototype.__proto__ === Object.prototype; // true
u.prototype; // undefined — u không phải function
```

Cách nhớ: `prototype` là **thứ constructor phát ra**, `__proto__` là **thứ object đang cầm**. Chain của `u` là `u → User.prototype → Object.prototype → null`. Nhầm lẫn hai khái niệm này là dấu hiệu chưa nắm chắc mô hình object của JS.

</details>

**4. Mô tả từng bước engine làm gì khi bạn gọi `user.toString()` trên một object thuần. Chuỗi prototype kết thúc ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
const user = { name: "An" };
user.toString(); // "[object Object]"
```

Các bước engine thực hiện:

1. Tìm **own property** `toString` trên chính `user` → không có.
2. Lấy `[[Prototype]]` của `user`, ở đây là `Object.prototype` → tìm `toString` → **tìm thấy**.
3. Gọi function đó với `this` = `user` (điểm quan trọng: `this` luôn là object **gốc** khởi đầu lời gọi, không phải object chứa method).
4. Trả về kết quả.

Nếu không tìm thấy, engine tiếp tục đi lên cho tới khi `[[Prototype]]` bằng **`null`** — đó là điểm kết thúc chuỗi. Không tìm thấy thì biểu thức trả `undefined`, và nếu bạn gọi nó như hàm sẽ nhận `TypeError: ... is not a function`.

Ví dụ các chain khác:

```
user → Object.prototype → null
arr  → Array.prototype → Object.prototype → null
fn   → Function.prototype → Object.prototype → null
```

`Object.create(null)` tạo object có `[[Prototype]]` bằng `null` ngay từ đầu — chain dài đúng một mắt xích.

</details>

**5. Vì sao mọi mảng đều có `.map` dù bạn không định nghĩa? `.map` thực sự nằm ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `.map` **không nằm trên mảng** — nó nằm trên **`Array.prototype`**, và mọi mảng đều có `[[Prototype]]` trỏ tới đó.

```js
const arr = [1, 2, 3];

Object.hasOwn(arr, "map"); // false — không phải own property
Object.getPrototypeOf(arr) === Array.prototype; // true
arr.map === Array.prototype.map; // true — chung một function
```

Khi gọi `arr.map(...)`, engine tìm `map` trên `arr` → không có → đi lên `Array.prototype` → tìm thấy → gọi với `this = arr`.

Chain đầy đủ của một mảng: `arr → Array.prototype → Object.prototype → null`. Đó cũng là lý do mảng vừa có `map`, `filter`, `push` (từ `Array.prototype`) vừa có `toString`, `hasOwnProperty` (từ `Object.prototype`).

Ích lợi của thiết kế này: dù bạn tạo một triệu mảng, trong bộ nhớ vẫn chỉ có **một bản** của `map`. Nguyên tắc tương tự áp dụng cho `"abc".toUpperCase()` (`String.prototype`) hay `fn.bind()` (`Function.prototype`).

</details>

**6. Toán tử `new` thực hiện những bước nào? Nếu constructor `return` một object thì kết quả của `new` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`new Constructor(args)` làm 4 việc:

1. Tạo một object rỗng mới.
2. Gắn `[[Prototype]]` của object đó bằng **`Constructor.prototype`**.
3. Gọi `Constructor` với `this` = object mới, truyền `args` vào.
4. Nếu constructor **không** return một object thì trả về object mới; nếu có thì trả về chính object được return.

Mô phỏng bằng code:

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype); // bước 1 + 2
  const result = Ctor.apply(obj, args); // bước 3
  return typeof result === "object" && result !== null ? result : obj; // bước 4
}
```

**Return một object thì sao?** `new` trả về **object đó**, bỏ qua object vừa tạo:

```js
function A() {
  this.x = 1;
  return { y: 2 };
}
new A(); // { y: 2 } — mất this.x

function B() {
  this.x = 1;
  return 42;
}
new B(); // { x: 1 } — return primitive bị BỎ QUA
```

Chỉ giá trị **object** (kể cả mảng, function) mới ghi đè; primitive thì bị phớt lờ. Đây là nền tảng của pattern singleton viết bằng constructor.

</details>

**7. `Object.create(proto)` khác `new Constructor()` thế nào? `Object.create(null)` tạo ra object đặc biệt ở chỗ nào và dùng khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

|                          | `Object.create(proto)`                           | `new Constructor()`                      |
| ------------------------ | ------------------------------------------------ | ---------------------------------------- |
| Prototype của object mới | Chính `proto` bạn truyền vào                     | `Constructor.prototype`                  |
| Chạy hàm khởi tạo        | **Không**                                        | Có — thân constructor chạy với `this`    |
| Object trả về            | Rỗng hoàn toàn (trừ `propertiesObject` tuỳ chọn) | Đã có các property gán trong constructor |

```js
const animal = {
  eat() {
    console.log(`${this.name} đang ăn`);
  },
};
const dog = Object.create(animal); // chưa có property nào
dog.name = "Lulu";
dog.eat(); // "Lulu đang ăn"
```

**`Object.create(null)`** tạo object **không có prototype** — chain kết thúc ngay lập tức. Nó không có `toString`, `hasOwnProperty`, `valueOf`, `__proto__`:

```js
const dict = Object.create(null);
dict.toString = "value"; // không ghi đè gì cả, chỉ là data thường
dict.hasOwnProperty; // undefined
Object.hasOwn(dict, "toString"); // true — vẫn kiểm tra được
```

Dùng khi cần **dictionary thuần** với key đến từ dữ liệu ngoài: tránh va chạm với property kế thừa và miễn nhiễm với prototype pollution qua `__proto__`. Lựa chọn hiện đại hơn cho nhu cầu này là `Map`.

</details>

**8. Đặt method trên `Constructor.prototype` khác gì đặt trong thân constructor? Vì sao `u1.greet === u2.greet` lại là `true` ở cách thứ nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt trong **thân constructor** nghĩa là mỗi lần `new` chạy, một **function object mới** được tạo và gán làm own property của instance. 1000 instance → 1000 bản sao.

Đặt trên **prototype** thì function chỉ được tạo **một lần**, mọi instance chia sẻ qua prototype chain.

```js
function A(name) {
  this.name = name;
  this.greet = function () {
    return `Hi ${this.name}`;
  }; // mỗi instance một bản
}
new A("An").greet === new A("Bình").greet; // false

function B(name) {
  this.name = name;
}
B.prototype.greet = function () {
  return `Hi ${this.name}`;
};
new B("An").greet === new B("Bình").greet; // true — cùng một function object
```

`=== ` so sánh tham chiếu. Ở cách prototype, cả `u1.greet` và `u2.greet` đều **không phải own property** — engine tra lên và lấy đúng một object hàm nằm trên `B.prototype`, nên hai biểu thức trỏ tới cùng địa chỉ → `true`.

Lợi ích thêm: tiết kiệm bộ nhớ và sửa `B.prototype.greet` một lần là mọi instance đang sống đổi theo. Method trong `class` cũng nằm trên prototype đúng như vậy.

</details>

**9. `class` của ES6 có phải cơ chế kế thừa mới không? Chỉ ra vài điểm mà `class` KHÔNG chỉ là syntactic sugar (không hoist, buộc gọi bằng `new`, luôn strict mode...).**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — mô hình kế thừa bên dưới vẫn 100% là prototype chain. Method khai báo trong class nằm trên `Class.prototype`, `typeof Class === "function"`, `Object.getPrototypeOf(instance) === Class.prototype`.

Nhưng gọi là "chỉ sugar" thì chưa đủ. Những khác biệt **thật** so với constructor function:

- **Bắt buộc gọi bằng `new`** — `User()` ném `TypeError`, còn function thường gọi thiếu `new` thì `this` thành `undefined`/global và âm thầm sai.
- **Không hoisting theo kiểu dùng được trước khi khai báo** — class nằm trong **Temporal Dead Zone**, dùng trước khi khai báo là `ReferenceError`; function declaration thì gọi trước vẫn chạy.
- **Luôn ở strict mode**, kể cả khi file không có `"use strict"`.
- **Method là non-enumerable** — không lộ ra khi `for...in`, khác với gán tay lên `prototype`.
- **`super`, class fields, private field `#x`, static block** — không có cách viết tương đương gọn bằng constructor function.
- **`new.target`, kế thừa built-in** (`class MyArr extends Array`) hoạt động đúng, còn cách cũ thì không.

Tóm lại: cú pháp mới + vài ràng buộc an toàn mới, nhưng **cơ chế** thì vẫn là prototype.

</details>

**10. `instanceof` hoạt động dựa trên cơ chế nào? Vì sao nó có thể cho kết quả sai giữa các realm khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

`obj instanceof Ctor` đi dọc **prototype chain** của `obj` và kiểm tra xem có mắt xích nào **chính là** `Ctor.prototype` hay không:

```js
function myInstanceof(obj, Ctor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Ctor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```

Vì phép so sánh là `===` trên **tham chiếu**, nên nó phụ thuộc vào việc hai bên cùng trỏ tới đúng một object `Ctor.prototype`.

**Vấn đề cross-realm:** mỗi `iframe`, worker hay vm context là một **realm** riêng với bộ global object riêng — có `Array`, `Object`, `Array.prototype` **khác**. Mảng tạo trong iframe kế thừa `Array.prototype` của iframe đó:

```js
const arr = new iframe.contentWindow.Array(1, 2, 3);
arr instanceof Array; // false — khác realm
Array.isArray(arr); // true  — kiểm tra internal slot, vượt realm
```

Vì thế nên dùng `Array.isArray()`, `Object.prototype.toString.call()` hoặc duck typing thay cho `instanceof` ở ranh giới realm. Lưu ý thêm: `Symbol.hasInstance` cho phép class tự định nghĩa lại hành vi của `instanceof`.

</details>

**11. `Constructor.prototype.constructor` là gì? Chuyện gì hỏng nếu bạn gán đè `Constructor.prototype = { ... }`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi bạn khai báo một function, JS tự tạo cho nó object `prototype`, và object đó có sẵn property `constructor` **trỏ ngược lại chính function**:

```js
function User() {}
User.prototype.constructor === User; // true
new User().constructor === User; // true — kế thừa qua chain
```

Nếu **gán đè** cả object prototype, liên kết ngược đó biến mất:

```js
function User(name) {
  this.name = name;
}
User.prototype = {
  greet() {
    return `Hi ${this.name}`;
  },
};

const u = new User("An");
u.greet(); // "Hi An" — vẫn chạy
u.constructor === User; // false!
u.constructor === Object; // true — kế thừa từ Object.prototype
```

Hậu quả: code dựa vào `obj.constructor` để clone (`new obj.constructor()`), để log tên class (`obj.constructor.name`) hay để nhận diện kiểu sẽ sai. Ngoài ra instance tạo **trước** khi gán đè vẫn giữ prototype cũ → hai nhóm instance không nhất quán.

Cách xử lý: hoặc gán từng method (`User.prototype.greet = ...`), hoặc khôi phục thủ công:

```js
User.prototype = {
  constructor: User,
  greet() {
    /* ... */
  },
};
```

</details>

**12. Khi gán `obj.toString = ...`, prototype có bị ảnh hưởng không? Việc ghi property có đi theo prototype chain giống việc đọc không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — prototype hoàn toàn không bị ảnh hưởng. Đọc và ghi hoạt động khác nhau:

- **Đọc**: nếu không có own property, engine **đi ngược prototype chain** để tìm.
- **Ghi**: engine tạo (hoặc cập nhật) **own property** ngay trên chính object đó, **không đi lên chain**. Property mới này **che khuất** (shadow) property cùng tên trên prototype.

```js
const obj = {};
obj.toString = () => "custom";

obj.toString(); // "custom" — own property che khuất
({}).toString(); // "[object Object]" — Object.prototype nguyên vẹn
Object.hasOwn(obj, "toString"); // true
delete obj.toString;
obj.toString(); // "[object Object]" — lộ lại bản kế thừa
```

Đây là lý do `Object.prototype` an toàn khi bạn chỉ gán lên instance — muốn làm ô nhiễm nó thì phải ghi trực tiếp `Object.prototype.x = ...` hoặc ghi qua `__proto__`.

**Ngoại lệ quan trọng:** nếu property trên prototype là một **accessor có setter**, phép gán sẽ gọi setter đó thay vì tạo own property. Và nếu nó là data property **read-only**, phép gán thất bại im lặng (sloppy mode) hoặc ném `TypeError` (strict mode).

</details>

**13. Vì sao `Object.setPrototypeOf` bị khuyến cáo là hại performance? Nên làm gì thay thế?**

<details className="qa">
<summary>Xem đáp án</summary>

Engine tối ưu việc truy cập property bằng **hidden class (shape)** và **inline cache**: nó ghi nhớ "object có shape X thì property `y` nằm ở vị trí này, prototype là object kia" rồi sinh mã máy nhanh dựa trên giả định đó.

`Object.setPrototypeOf(obj, proto)` **thay đổi prototype của một object đã tồn tại**, phá vỡ giả định đó. Hậu quả:

- Mọi inline cache liên quan tới object (và các object cùng shape) bị vô hiệu.
- Code đã tối ưu bị **deoptimize**, quay về chạy bytecode.
- Engine có thể đánh dấu object vào chế độ "dictionary mode" chậm hơn hẳn.

Đây là thao tác được cảnh báo rõ trong tài liệu MDN và V8 — chi phí cao hơn nhiều so với việc tạo mới một object.

**Thay thế:** quyết định prototype **ngay lúc tạo**:

```js
const dog = Object.create(animal); // đặt prototype lúc khởi tạo
const obj = { __proto__: animal, name: "Lulu" }; // literal, cũng nhanh
class Dog extends Animal {} // cách chuẩn cho hệ thống class
```

Nếu buộc phải "đổi kiểu" lúc chạy thì thường nên tạo object mới và copy dữ liệu sang, thay vì setPrototypeOf.

</details>

**14. Giải thích các biểu thức sau: `u.__proto__ === User.prototype`, `User.__proto__ === Function.prototype`, `User.prototype.__proto__ === Object.prototype`.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba đều là **`true`**, và mỗi câu nói về một chuỗi khác nhau:

```js
function User(name) {
  this.name = name;
}
const u = new User("An");
```

- **`u.__proto__ === User.prototype`** — khi `new` chạy, nó gắn `[[Prototype]]` của object mới bằng `User.prototype`. Đây là lý do `u` mượn được mọi method gắn trên `User.prototype`.
- **`User.__proto__ === Function.prototype`** — `User` bản thân nó là một **function**, mà function cũng là object. Chuỗi prototype của nó đi qua `Function.prototype`, nên `User` có sẵn `call`, `apply`, `bind`.
- **`User.prototype.__proto__ === Object.prototype`** — `User.prototype` là một object thuần được JS tự tạo, nên cha của nó là `Object.prototype`. Nhờ vậy instance của `User` vẫn dùng được `toString`, `hasOwnProperty`.

Ghép lại thành hai chuỗi song song:

```
u    → User.prototype → Object.prototype → null   (chuỗi của instance)
User → Function.prototype → Object.prototype → null (chuỗi của chính function)
```

Nhớ: `prototype` là property của function, `__proto__` là liên kết của mọi object.

</details>

**15. `prototype pollution` là gì? Mô tả kịch bản tấn công qua `__proto__` khi merge JSON từ người dùng, và cách phòng.**

<details className="qa">
<summary>Xem đáp án</summary>

**Prototype pollution** là lỗ hổng cho phép kẻ tấn công ghi property vào `Object.prototype`. Vì gần như mọi object đều kế thừa từ đó, property độc hại lập tức xuất hiện trên **toàn bộ object trong ứng dụng**.

Kịch bản kinh điển — hàm merge/clone đệ quy không lọc key:

```js
const config = {};
const userInput = JSON.parse(req.body); // {"__proto__": {"isAdmin": true}}
deepMerge(config, userInput); // ghi vào Object.prototype

({}).isAdmin; // true — mọi object trong app!
if (user.isAdmin) {
  /* bypass phân quyền */
}
```

Ngoài leo thang quyền, nó còn gây DoS (ghi đè `toString`), hoặc biến thành RCE khi kết hợp với template engine. Nhiều thư viện lớn (lodash, jQuery, minimist) từng dính CVE dạng này.

**Cách phòng:**

- **Lọc key nguy hiểm**: bỏ qua `__proto__`, `constructor`, `prototype` trong mọi hàm merge/set đệ quy.
- Dùng **`Object.create(null)`** làm object đích, hoặc `Map` cho dữ liệu đến từ người dùng.
- **`Object.freeze(Object.prototype)`** ở điểm khởi động ứng dụng.
- Dùng **schema validation** (Zod, Ajv) — chỉ nhận đúng field đã khai báo.
- Ưu tiên thư viện đã vá và dùng `structuredClone` thay cho merge tự viết.

</details>

**16. Trong ngữ cảnh prototype, `in` và `Object.hasOwn` cho kết quả khác nhau ra sao? Vì sao `for...in` hay gây bug?**

<details className="qa">
<summary>Xem đáp án</summary>

`in` tra **toàn bộ prototype chain**, còn `Object.hasOwn` chỉ xét **own property**:

```js
const animal = { eat() {} };
const dog = Object.create(animal);
dog.name = "Lulu";

"name" in dog; // true
"eat" in dog; // true  — kế thừa từ animal
"toString" in dog; // true  — kế thừa từ Object.prototype
Object.hasOwn(dog, "eat"); // false
Object.hasOwn(dog, "name"); // true
```

**`for...in` gây bug** vì nó duyệt **mọi property enumerable, kể cả kế thừa**:

```js
for (const k in dog) console.log(k); // "name", "eat"
```

Method built-in không lộ ra (chúng non-enumerable), nhưng property bạn hoặc thư viện gắn lên prototype thì có — nghĩa là một đoạn code ở file khác cũng có thể làm vòng lặp của bạn chạy sai. Đó là lý do code phòng thủ hay viết `if (!Object.hasOwn(obj, k)) continue;`.

Thực tế nên tránh `for...in`: dùng `Object.keys` / `Object.entries` cho object, `for...of` cho mảng và iterable. Prototype pollution càng làm `for...in` nguy hiểm hơn.

</details>

**17. `class B extends A` và `super()` được ánh xạ sang prototype như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`extends` thiết lập **hai** liên kết prototype, không phải một:

```js
class A {
  greet() {
    return "A";
  }
}
class B extends A {}

Object.getPrototypeOf(B.prototype) === A.prototype; // true — kế thừa method instance
Object.getPrototypeOf(B) === A; // true — kế thừa static member
```

- Liên kết thứ nhất nối `B.prototype → A.prototype`, nhờ đó instance của `B` tra được method của `A` qua chain: `b → B.prototype → A.prototype → Object.prototype → null`.
- Liên kết thứ hai nối chính `B → A`, nhờ đó `B` thừa hưởng cả **static method** của `A`.

**`super()`** trong constructor gọi constructor của lớp cha để khởi tạo phần dữ liệu của nó với `this` hiện tại. Trong class con, `this` **chưa tồn tại** cho tới khi `super()` chạy xong — dùng `this` trước đó là `ReferenceError`:

```js
class B extends A {
  constructor(name) {
    // this.x = 1;   // ReferenceError
    super();
    this.name = name;
  }
}
```

Trong method, `super.greet()` tra `greet` bắt đầu từ prototype của lớp cha nhưng vẫn chạy với `this` là instance hiện tại.

</details>

**18. Vì sao không nên mở rộng prototype của built-in (`Array.prototype.myMethod = ...`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Sửa `Array.prototype`, `Object.prototype`, `String.prototype`... là thay đổi **toàn cục**, ảnh hưởng mọi đoạn code trong ứng dụng, kể cả thư viện bên thứ ba. Các rủi ro:

- **Xung đột tên**: hai thư viện cùng thêm `Array.prototype.contains` với hành vi khác nhau → bên nào load sau thắng, bug rất khó truy.
- **Xung đột với chuẩn tương lai**: đây là chuyện có thật — đề xuất `Array.prototype.flatten` phải đổi tên thành `flat` vì MooTools đã định nghĩa `flatten` và giữ nguyên tên sẽ làm hỏng hàng loạt website ("SmooshGate").
- **Phá `for...in`**: property thêm tay mặc định là **enumerable**, nên nó lọt vào mọi vòng `for...in` trên mảng/object.
- **Hại performance**: engine phải deoptimize các inline cache dựa trên shape của built-in.
- **Bảo mật**: với `Object.prototype` thì đó chính là prototype pollution.

**Nên làm gì thay thế:** viết hàm thuần (`function chunk(arr, n) {...}`), dùng utility module, hoặc bọc bằng class riêng. Nếu bắt buộc phải thêm, ít nhất dùng `Object.defineProperty` với `enumerable: false` và đặt tên qua `Symbol` để tránh đụng chuẩn.

</details>

---

## 4. Built-in Objects

Bài học: [4. Built-in Objects](../../javascript/03-data-types/4_built-in.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Built-in object` là gì? Kể vài cái bạn dùng thường xuyên và mục đích của từng cái.**

<details className="qa">
<summary>Xem đáp án</summary>

**Built-in object** là các đối tượng do chính ngôn ngữ (chuẩn ECMAScript) cung cấp sẵn trong môi trường toàn cục — dùng được ngay, không cần import hay cài thư viện. Chúng đã được chuẩn hoá, tối ưu bằng mã native trong engine nên vừa nhanh vừa nhất quán giữa các môi trường.

Những cái dùng thường xuyên:

| Built-in                              | Mục đích                                                    |
| ------------------------------------- | ----------------------------------------------------------- |
| `JSON`                                | Serialize/deserialize dữ liệu — gọi API, lưu `localStorage` |
| `Math`                                | Toán học: làm tròn, `max`/`min`, luỹ thừa, `random`         |
| `Date`                                | Ngày giờ, timestamp, đo khoảng thời gian                    |
| `RegExp`                              | Tìm kiếm, validate, tách và thay thế chuỗi theo mẫu         |
| `Intl`                                | Định dạng số, tiền tệ, ngày giờ theo locale                 |
| `Object`, `Array`, `String`, `Number` | Kiểu dữ liệu nền tảng cùng bộ method của chúng              |
| `Map`, `Set`, `Promise`, `Symbol`     | Cấu trúc dữ liệu và bất đồng bộ                             |

Lưu ý phân biệt: `console`, `fetch`, `setTimeout`, `document` **không phải** built-in của ngôn ngữ — chúng do **runtime** (trình duyệt/Node.js) cung cấp, không nằm trong chuẩn ECMAScript.

</details>

**2. Vì sao `Math` gọi được `Math.round(...)` mà không cần `new`, còn `Date` thì phải `new Date()`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai thứ này thuộc hai loại khác nhau:

- **`Math` là một object thường**, đóng vai trò **namespace** gom các hằng số và hàm tiện ích. Nó **không phải constructor** — mọi thành viên đều là **static**, gọi thẳng qua tên object.
- **`Date` là một constructor function**. Mỗi đối tượng ngày giờ là một **instance** mang trạng thái riêng (một timestamp), nên cần `new` để tạo.

```js
typeof Math; // "object"
new Math(); // TypeError: Math is not a constructor

typeof Date; // "function"
const d = new Date(); // instance riêng, có state
Date.now(); // Date cũng có method static
```

Lý do thiết kế: `Math.round(3.5)` không cần nhớ gì giữa các lần gọi — hàm thuần, không state. Còn một `Date` phải lưu "thời điểm nào" để `getFullYear()`, `setHours()` thao tác lên.

Bẫy nhỏ: gọi `Date()` **không có `new`** không tạo object mà trả về một **chuỗi** mô tả thời gian hiện tại — nguồn bug im lặng khi lỡ quên `new`.

</details>

**3. Phân biệt `JSON.stringify` và `JSON.parse`. Chúng dùng ở đâu trong một app thực tế?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`JSON.stringify(value)`**: object/mảng JS → **chuỗi** JSON (serialize).
- **`JSON.parse(text)`**: chuỗi JSON → **giá trị** JS (deserialize).

```js
const user = { name: "An", age: 25 };

const json = JSON.stringify(user); // '{"name":"An","age":25}'
const back = JSON.parse(json); // { name: "An", age: 25 }
```

Lý do cần: dữ liệu đi qua mạng hay lưu xuống đĩa chỉ là **text/bytes**, không thể truyền thẳng một object trong bộ nhớ.

Tình huống thực tế:

- **Gọi API**: `body: JSON.stringify(payload)` khi `fetch`; chiều ngược lại `res.json()` thực chất là `JSON.parse` phía sau.
- **`localStorage` / `sessionStorage`**: chỉ lưu được string → stringify khi ghi, parse khi đọc.
- **File cấu hình**: `package.json`, `tsconfig.json`.
- **Log và debug**: `JSON.stringify(obj, null, 2)` để in đẹp.

Lưu ý `JSON.parse` ném `SyntaxError` với chuỗi không hợp lệ (ví dụ server trả HTML lỗi thay vì JSON) — nên bọc `try/catch`.

</details>

**4. `JSON.stringify` xử lý ra sao với `undefined`, `function`, `Symbol`, `NaN`, `Infinity`, `Date`, `BigInt`, `Map`/`Set`?**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị                           | Kết quả                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| `undefined`, `function`, `symbol` | **Bị bỏ qua** khi là property của object; thành `null` khi nằm trong mảng |
| `NaN`, `Infinity`, `-Infinity`    | Thành `null`                                                              |
| `Date`                            | Thành **chuỗi ISO** (do `Date.prototype.toJSON`)                          |
| `BigInt`                          | Ném **`TypeError`**                                                       |
| `Map`, `Set`                      | Thành `{}` — **mất sạch dữ liệu**                                         |
| Circular reference                | Ném `TypeError`                                                           |

```js
JSON.stringify({ fn: () => {}, u: undefined, s: Symbol() }); // '{}'
JSON.stringify([undefined, () => {}]); // '[null,null]'
JSON.stringify({ n: NaN, i: Infinity }); // '{"n":null,"i":null}'
JSON.stringify({ d: new Date() }); // '{"d":"2026-01-01T..."}'
JSON.stringify({ s: new Set([1, 2]) }); // '{"s":{}}'
JSON.stringify({ b: 10n }); // TypeError
```

Nguyên nhân: JSON là format rất tối giản, chỉ có object, array, string, number, boolean, `null`.

Cách xử lý: convert tay trước khi stringify (`Array.from(set)`), dùng `replacer`, thêm `BigInt.prototype.toJSON`, hoặc dùng thư viện như **superjson**, **devalue** khi cần giữ đúng kiểu.

</details>

**5. Tham số thứ hai và thứ ba của `JSON.stringify` (`replacer`, `space`) dùng để làm gì? Còn `reviver` của `JSON.parse`?**

<details className="qa">
<summary>Xem đáp án</summary>

**`replacer`** (tham số 2) — lọc hoặc biến đổi dữ liệu trước khi ghi ra chuỗi. Có hai dạng:

```js
const user = { name: "An", age: 25, password: "x" };

// Dạng mảng: whitelist property
JSON.stringify(user, ["name"]); // '{"name":"An"}'

// Dạng hàm: trả undefined để loại bỏ
JSON.stringify(user, (k, v) => (k === "password" ? undefined : v));
```

**`space`** (tham số 3) — thụt lề cho dễ đọc, nhận số (số khoảng trắng) hoặc chuỗi:

```js
JSON.stringify(user, null, 2); // xuống dòng, thụt 2 space
```

**`reviver`** của `JSON.parse` — chạy trên từng cặp key/value sau khi parse, để **khôi phục kiểu** đã mất khi serialize:

```js
const json = '{"createdAt":"2026-01-15T00:00:00.000Z"}';
const obj = JSON.parse(json, (k, v) => (k === "createdAt" ? new Date(v) : v));
obj.createdAt instanceof Date; // true
```

Ứng dụng phổ biến: che thông tin nhạy cảm khi log, và chuyển chuỗi ISO từ API ngược lại thành `Date`.

</details>

**6. Nếu một object có method `toJSON`, `JSON.stringify` sẽ hành xử thế nào? Vì sao `Date` lại ra chuỗi ISO?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước khi serialize một giá trị, `JSON.stringify` kiểm tra xem giá trị đó có method **`toJSON`** hay không. Nếu có, nó **gọi `toJSON()` và serialize kết quả trả về** thay cho chính object.

```js
const user = {
  name: "An",
  password: "secret",
  toJSON() {
    return { name: this.name }; // tự quyết định hình dạng JSON
  },
};

JSON.stringify(user); // '{"name":"An"}' — password không lọt ra
```

Thứ tự áp dụng: `toJSON` chạy **trước**, rồi mới tới `replacer`.

**Vì sao `Date` ra chuỗi ISO?** Vì `Date.prototype` có sẵn method `toJSON`, và nó gọi `toISOString()`:

```js
new Date().toJSON() === new Date().toISOString(); // true
JSON.stringify({ d: new Date() }); // '{"d":"2026-01-15T08:00:00.000Z"}'
```

Đây là cơ chế rất hữu ích để tự kiểm soát dữ liệu xuất ra: model của ORM, class domain, hay object chứa field nhạy cảm đều có thể định nghĩa `toJSON` riêng. Lưu ý chiều ngược lại **không tự động** — parse về vẫn là chuỗi, phải dùng `reviver`.

</details>

**7. Vì sao `JSON.parse(JSON.stringify(obj))` là cách deep clone không an toàn? Nó ném lỗi gì với circular reference, và bạn thay bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì nó đi qua format JSON, nên **mất hết** những gì JSON không biểu diễn được:

- `function`, `undefined`, `symbol` → biến mất (hoặc thành `null` trong mảng).
- `Date` → thành **chuỗi**, không còn là `Date`.
- `Map`, `Set` → thành `{}` rỗng.
- `NaN`, `Infinity` → thành `null`.
- `BigInt` → ném `TypeError`.
- Prototype/class biến mất — clone ra là object thuần.

Với **circular reference**, nó ném:

```js
const a = { name: "x" };
a.self = a;
JSON.parse(JSON.stringify(a));
// TypeError: Converting circular structure to JSON
```

Ngoài ra còn chậm với dữ liệu lớn vì phải dựng cả chuỗi trung gian.

**Thay bằng `structuredClone`** (built-in từ Node 17 và trình duyệt hiện đại):

```js
const clone = structuredClone(a); // xử lý được circular, Date, Map, Set
```

Hai giới hạn của `structuredClone`: không clone được **function** (ném `DataCloneError`) và **không giữ prototype** của class. Khi cần cả hai, dùng thư viện như `lodash.cloneDeep` hoặc tự viết clone đệ quy.

</details>

**8. So sánh `Math.round`, `Math.floor`, `Math.ceil`, `Math.trunc`. `Math.round(-3.5)` bằng bao nhiêu và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| Hàm          | Quy tắc                                                         | `3.5` | `3.2` | `-3.5` | `-3.2` |
| ------------ | --------------------------------------------------------------- | ----- | ----- | ------ | ------ |
| `Math.round` | Làm tròn về số nguyên gần nhất, `.5` làm tròn **lên phía `+∞`** | 4     | 3     | **-3** | -3     |
| `Math.floor` | Luôn xuống phía `-∞`                                            | 3     | 3     | -4     | -4     |
| `Math.ceil`  | Luôn lên phía `+∞`                                              | 4     | 4     | -3     | -3     |
| `Math.trunc` | Cắt bỏ phần thập phân                                           | 3     | 3     | -3     | -3     |

**`Math.round(-3.5)` bằng `-3`.** Lý do: đặc tả định nghĩa `Math.round(x)` là `Math.floor(x + 0.5)`. Với `-3.5` thì `-3.5 + 0.5 = -3`, `floor(-3)` = `-3`. Nói cách khác, khi gặp đúng nửa đơn vị, JS luôn làm tròn về phía **dương vô cực**, chứ không phải "làm tròn ra xa số 0" như nhiều người tưởng.

```js
Math.round(-3.5); // -3  (không phải -4)
Math.round(-3.6); // -4
```

Điểm dễ nhầm còn lại: với số âm thì `floor` và `trunc` cho kết quả **khác nhau** (`-4` vs `-3`) — với số dương thì giống nhau, nên bug chỉ lộ khi gặp giá trị âm.

</details>

**9. Viết hàm trả về số nguyên ngẫu nhiên trong khoảng `[min, max]` (bao gồm hai đầu) và giải thích công thức.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

randInt(1, 6); // 1..6 — xí ngầu
```

Giải thích từng bước:

1. `Math.random()` trả về số thực trong nửa khoảng **`[0, 1)`** — bao gồm 0, **không** bao gồm 1.
2. Nhân với `(max - min + 1)` → dải `[0, max - min + 1)`. Phải `+ 1` vì muốn bao gồm cả `max`; nếu chỉ nhân `(max - min)` thì `max` gần như không bao giờ trúng.
3. `Math.floor` cắt xuống → các số nguyên `0, 1, ..., max - min` với xác suất bằng nhau.
4. `+ min` dịch dải về đúng `[min, max]`.

Kiểm chứng với `randInt(1, 6)`: `Math.random() * 6` cho `[0, 6)`, `floor` cho `0..5`, cộng 1 thành `1..6`.

Lưu ý: dùng `Math.round` thay `Math.floor` là **sai** — hai giá trị ở hai đầu sẽ có xác suất chỉ bằng một nửa các giá trị giữa. Và nhớ rằng hàm này **không dùng được cho mục đích bảo mật**.

</details>

**10. Vì sao `Math.random()` không được dùng để sinh token, mã OTP hay mật khẩu? Nên dùng API nào thay thế?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `Math.random()` là **PRNG (pseudo-random)** — không phải nguồn ngẫu nhiên an toàn về mật mã:

- Nó chạy từ một **trạng thái nội bộ hữu hạn**; kẻ tấn công quan sát đủ output có thể suy ngược trạng thái và **dự đoán mọi giá trị tiếp theo**.
- Đặc tả **không đảm bảo** chất lượng ngẫu nhiên và nói rõ nó không phù hợp cho mục đích mật mã.
- Thuật toán khác nhau giữa các engine, seed không kiểm soát được.

Hậu quả thực tế: token reset mật khẩu, OTP, session id, mã mời sinh bằng `Math.random()` đều có thể bị đoán trước — đây là lỗ hổng bảo mật đã xuất hiện nhiều lần trong thực tế.

**Dùng Web Crypto API (CSPRNG)** thay thế:

```js
// Browser
crypto.randomUUID(); // UUID v4
crypto.getRandomValues(new Uint32Array(1))[0]; // số ngẫu nhiên an toàn

// Node.js
import { randomBytes, randomUUID, randomInt } from "node:crypto";
randomUUID();
randomBytes(32).toString("hex");
randomInt(100000, 1000000); // OTP 6 chữ số, không lệch phân phối
```

Quy tắc: bất cứ giá trị nào mà việc **đoán trúng gây hại** thì phải dùng `crypto`, không dùng `Math.random`.

</details>

**11. `getMonth()` trả về giá trị trong khoảng nào? Kể vài cái bẫy kinh điển khác của `Date`.**

<details className="qa">
<summary>Xem đáp án</summary>

`getMonth()` trả về **0–11** — tháng 1 là `0`, tháng 12 là `11`. Đây là di sản từ C, và là nguồn bug "lệch một tháng" kinh điển.

Các bẫy khác:

- **`getDate()` vs `getDay()`**: `getDate()` là ngày trong tháng (1–31), còn `getDay()` là **thứ** trong tuần (0–6, `0` = Chủ nhật). Rất dễ gọi nhầm.
- **Constructor cũng dùng tháng 0-based**: `new Date(2026, 0, 15)` là 15/01/2026.
- **Mutable**: `date.setHours(0)` sửa **chính object** chứ không trả bản mới — truyền `Date` vào hàm rồi bị sửa ngầm là chuyện thường gặp.
- **Parsing không nhất quán**: chuỗi không đúng chuẩn ISO được parse theo cách riêng của từng engine.
- **Timezone**: chỉ có UTC và giờ local của máy, không đặt được timezone tuỳ ý.
- **Tràn giá trị im lặng**: `new Date(2026, 0, 32)` không báo lỗi mà thành 01/02/2026.
- **So sánh**: `d1 === d2` luôn `false` (object); phải so `d1.getTime() === d2.getTime()`.

Vì vậy code hiện đại nên dùng date-fns, Day.js, Luxon hoặc Temporal API.

</details>

**12. So sánh `Date.now()`, `new Date()` và `performance.now()`. Đo thời gian chạy của một đoạn code thì nên dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

|                     | Trả về                          | Mốc gốc                              | Đặc điểm                                                      |
| ------------------- | ------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `Date.now()`        | Số nguyên (ms)                  | Unix epoch (1/1/1970 UTC)            | Nhanh, không tạo object; phụ thuộc **đồng hồ hệ thống**       |
| `new Date()`        | Object `Date`                   | Unix epoch                           | Đầy đủ API ngày giờ, nhưng tạo object nên nặng hơn            |
| `performance.now()` | Số thực (ms, có phần thập phân) | **Time origin** của trang/tiến trình | **Monotonic** — luôn tăng, không bị đồng hồ hệ thống tác động |

```js
const t0 = performance.now();
doSomething();
console.log(`${(performance.now() - t0).toFixed(2)} ms`);
```

**Đo thời gian chạy nên dùng `performance.now()`.** Lý do: `Date.now()` lấy theo đồng hồ treo tường, có thể **nhảy lùi hoặc nhảy tới** khi hệ thống đồng bộ NTP hay người dùng đổi giờ — kết quả đo có thể âm hoặc sai lệch. `performance.now()` thì đơn điệu tăng và có độ phân giải cao hơn.

Lưu ý: vì lý do bảo mật (Spectre), trình duyệt đã **làm thô** độ chính xác của `performance.now()`, nên với đoạn code rất nhanh hãy chạy lặp nhiều lần rồi lấy trung bình. Trong Node.js dùng `performance.now()` hoặc `process.hrtime.bigint()`.

</details>

**13. `Date` là mutable — điều đó gây rủi ro gì? `setDate(date.getDate() + 1)` xử lý ra sao khi vượt qua cuối tháng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Rủi ro của mutable:** các method `setX` sửa **chính object** và trả về timestamp, không trả bản sao. Truyền một `Date` vào hàm nghĩa là hàm đó có thể âm thầm thay đổi dữ liệu của bạn — bug rất khó truy vì lỗi nổ ở nơi khác:

```js
function addDay(d) {
  d.setDate(d.getDate() + 1); // sửa object GỐC!
  return d;
}

const start = new Date("2026-01-15");
const end = addDay(start);
start.getDate(); // 16 — start đã bị đổi, end === start
```

Cách viết an toàn là clone trước: `const copy = new Date(d)`.

**Vượt qua cuối tháng thì sao?** `Date` tự động **tràn (roll over)** sang tháng/năm kế tiếp một cách đúng đắn:

```js
const d = new Date(2026, 0, 31); // 31/01/2026
d.setDate(d.getDate() + 1); // 01/02/2026 — tự sang tháng 2
```

Đây là hành vi mong muốn. Nhưng `setMonth` thì có bẫy: từ 31/01 cộng 1 tháng sẽ ra **03/03** (vì 31/02 không tồn tại nên tràn tiếp), chứ không phải 28/02. Các thư viện như date-fns xử lý trường hợp này hợp lý hơn.

</details>

**14. `new Date("2026-01-15")` và `new Date("2026/01/15")` được parse khác nhau thế nào (UTC hay local time)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`"2026-01-15"`** đúng chuẩn **ISO 8601 dạng chỉ có ngày** → đặc tả quy định parse theo **UTC**, tức `2026-01-15T00:00:00Z`.
- **`"2026/01/15"`** **không** thuộc chuẩn ISO → rơi vào nhánh parse tuỳ ý của từng engine; trên thực tế các engine phổ biến hiểu nó là **giờ local**.

```js
// Máy ở múi giờ UTC+7 (Việt Nam)
new Date("2026-01-15").toString();
// Thu Jan 15 2026 07:00:00 GMT+0700 — vì gốc là 00:00 UTC

new Date("2026/01/15").toString();
// Thu Jan 15 2026 00:00:00 GMT+0700 — giờ local

new Date("2026-01-15").getDate(); // ở múi giờ âm (vd UTC-5) sẽ ra 14!
```

Hệ quả nguy hiểm: cùng một chuỗi ngày, người dùng ở châu Mỹ nhìn thấy **lệch một ngày** so với người dùng ở châu Á.

Cách tránh:

- Luôn dùng chuỗi ISO **đầy đủ kèm offset**: `"2026-01-15T00:00:00+07:00"`.
- Hoặc dựng bằng số: `new Date(2026, 0, 15)` (local) / `Date.UTC(2026, 0, 15)`.
- Với "ngày thuần" không có giờ (sinh nhật, hạn nộp), tốt nhất lưu dạng chuỗi `"YYYY-MM-DD"` và xử lý bằng thư viện thay vì `Date`.

</details>

**15. Bạn lưu thời gian xuống database theo chuẩn nào và vì sao? Xử lý timezone cho người dùng nhiều quốc gia ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Nguyên tắc: lưu UTC, hiển thị theo giờ người dùng.**

- Trong DB dùng kiểu có nhận biết múi giờ: `timestamptz` (PostgreSQL), `DATETIME` chuẩn hoá UTC (MySQL), hoặc lưu chuỗi **ISO 8601** `2026-01-15T08:00:00Z`.
- Server đặt timezone là UTC, API trả chuỗi ISO có hậu tố `Z`.
- Client nhận chuỗi ISO rồi format sang giờ địa phương ở **tầng hiển thị**.

Lý do: UTC là một mốc tuyệt đối, không bị ảnh hưởng bởi DST (giờ mùa hè) hay việc chính phủ đổi quy định múi giờ. Nếu lưu giờ local, cùng một giá trị có thể mơ hồ (giờ 2h sáng lặp lại khi lùi giờ) hoặc không tồn tại (khi tiến giờ).

Phía client, dùng `Intl` để format theo locale và timezone:

```js
new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date(isoString));
```

Vài lưu ý thêm: lấy timezone người dùng bằng `Intl.DateTimeFormat().resolvedOptions().timeZone`; với sự kiện tương lai (lịch họp) nên lưu **kèm tên timezone IANA** chứ không chỉ offset, vì quy tắc DST có thể thay đổi; còn "ngày thuần" như ngày sinh thì lưu `DATE`, đừng lưu timestamp.

</details>

**16. `Temporal API` giải quyết những nhược điểm nào của `Date`? Trước khi nó phổ biến, bạn dùng thư viện gì (`date-fns`, `Day.js`, `Luxon`) và vì sao không dùng Moment.js cho code mới?**

<details className="qa">
<summary>Xem đáp án</summary>

**Temporal** (đề xuất TC39, Stage 3) được thiết kế lại từ đầu để sửa các khuyết điểm của `Date`:

- **Immutable** — mọi thao tác trả về object mới, hết bug sửa ngầm.
- **Tách kiểu rõ ràng**: `Temporal.PlainDate`, `PlainTime`, `PlainDateTime`, `ZonedDateTime`, `Duration`, `Instant` — không còn nhét mọi thứ vào một kiểu.
- **Timezone và calendar là công dân hạng nhất**, hỗ trợ IANA timezone đúng nghĩa.
- **Tháng đánh số từ 1**, parse chặt chẽ và nhất quán.
- **Số học ngày giờ có sẵn**: `add`, `subtract`, `until`, `since`.

Trong thời gian chờ Temporal phổ biến:

| Thư viện     | Điểm mạnh                                                      |
| ------------ | -------------------------------------------------------------- |
| **date-fns** | Hàm thuần, tree-shakeable — chỉ bundle những gì dùng           |
| **Day.js**   | Rất nhẹ (~2KB), API giống Moment nên dễ migrate                |
| **Luxon**    | Xử lý timezone và i18n mạnh nhất, do chính tác giả Moment viết |

**Không dùng Moment.js cho code mới** vì nhóm phát triển đã tuyên bố dự án ở **chế độ bảo trì (legacy)**: bundle lớn và không tree-shake được, object **mutable** dễ gây bug, API kiểu cũ. Dự án đang dùng Moment thì giữ được, nhưng code mới nên chọn một trong ba lựa chọn trên.

</details>

**17. So sánh `regex.test`, `str.match`, `str.matchAll` và `regex.exec` — khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Method                | Trả về                                                                                                  | Dùng khi                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `regex.test(str)`     | `true` / `false`                                                                                        | Chỉ cần biết **có khớp hay không** — validate                  |
| `str.match(regex)`    | Không cờ `g`: mảng chi tiết (match, capture group, `index`); có `g`: mảng **chuỗi** khớp, **mất** group | Lấy một kết quả kèm group, hoặc lấy nhanh danh sách chuỗi khớp |
| `str.matchAll(regex)` | **Iterator** các object match đầy đủ (kèm group) — **bắt buộc** cờ `g`                                  | Cần tất cả kết quả **và** capture group                        |
| `regex.exec(str)`     | Một match kèm group, hoặc `null`; với cờ `g` thì gọi lặp để duyệt tiếp                                  | Duyệt thủ công, cần kiểm soát `lastIndex`                      |

```js
const re = /(\d{4})-(\d{2})/g;
const s = "2026-01 và 2027-02";

/\d/.test(s); // true
s.match(/(\d{4})-(\d{2})/); // ["2026-01", "2026", "01", index: 0, ...]
s.match(re); // ["2026-01", "2027-02"] — mất group!
[...s.matchAll(re)]; // 2 match, mỗi cái đầy đủ group
```

Quy tắc chọn: **validate** → `test`; **lấy tất cả kèm group** → `matchAll` (hiện đại, sạch nhất); **lấy một match** → `match` không cờ `g`. Chỉ dùng `exec` khi thực sự cần vòng lặp thủ công.

</details>

**18. Flag `g` của một `RegExp` dùng lại nhiều lần với `.test()` gây bug gì? Giải thích vai trò của `lastIndex`.**

<details className="qa">
<summary>Xem đáp án</summary>

Regex có cờ `g` (hoặc `y`) mang **trạng thái**: property `lastIndex` ghi nhớ vị trí kết thúc của lần khớp trước. Lần gọi `test`/`exec` kế tiếp bắt đầu dò **từ vị trí đó**, và khi không còn khớp thì `lastIndex` được reset về `0`. Hệ quả là cùng một chuỗi cho kết quả **luân phiên đúng/sai**:

```js
const re = /abc/g;

re.test("abc"); // true  — lastIndex = 3
re.test("abc"); // false — bắt đầu dò từ vị trí 3, hết chuỗi → reset về 0
re.test("abc"); // true
```

Bug này đặc biệt hiểm khi regex được khai báo ở **module scope** hoặc dùng làm hằng số chia sẻ giữa nhiều lần validate — form lúc pass lúc fail mà không rõ lý do.

Cách phòng:

- **Bỏ cờ `g`** nếu chỉ cần kiểm tra có khớp hay không — `test` không cần `g`.
- Reset thủ công: `re.lastIndex = 0` trước mỗi lần dùng.
- Tạo regex mới mỗi lần gọi (đánh đổi một chút hiệu năng).
- Dùng `str.match` / `str.matchAll` thay vì thao tác trực tiếp trên object regex.

`lastIndex` cũng chính là cơ chế giúp `exec` trong vòng `while` duyệt được lần lượt mọi kết quả.

</details>

**19. Phân biệt capture group thường và `named group`. Greedy và lazy quantifier khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Capture group thường** `(...)` đánh số theo thứ tự dấu mở ngoặc, truy cập qua chỉ số. **Named group** `(?<tên>...)` (ES2018) đặt tên, truy cập qua `.groups` — dễ đọc và không vỡ khi bạn thêm/bớt nhóm:

```js
"2026-01-15".match(/(\d{4})-(\d{2})-(\d{2})/)[1]; // "2026"

const m = "2026-01-15".match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
m.groups.year; // "2026"
m.groups.month; // "01"
```

Còn `(?:...)` là **non-capturing group** — nhóm để gom mà không lưu kết quả.

**Greedy vs lazy:** quantifier (`*`, `+`, `?`, `{n,m}`) mặc định là **greedy** — khớp **nhiều nhất có thể** rồi lùi dần (backtrack) cho tới khi phần còn lại khớp. Thêm `?` phía sau biến nó thành **lazy** — khớp **ít nhất có thể** rồi mở rộng dần:

```js
const html = "<b>a</b><i>b</i>";
html.match(/<.+>/)[0]; // "<b>a</b><i>b</i>" — greedy, nuốt hết
html.match(/<.+?>/)[0]; // "<b>"              — lazy, dừng sớm nhất
```

Chọn sai giữa greedy và lazy là lỗi thường gặp nhất khi trích xuất nội dung giữa hai dấu phân cách.

</details>

**20. `catastrophic backtracking` / `ReDoS` là gì? Vì sao regex validate email phức tạp có thể treo server?**

<details className="qa">
<summary>Xem đáp án</summary>

Engine regex của JS dùng thuật toán **backtracking**: khi một nhánh không khớp, nó quay lui thử tổ hợp khác. Nếu pattern có **quantifier lồng nhau** hoặc các nhánh chồng lấn nhau, số tổ hợp cần thử tăng **theo hàm mũ** với độ dài chuỗi — đó là **catastrophic backtracking**.

```js
const re = /^(a+)+$/;
re.test("aaaaaaaaaaaaaaaaaaaaaaaaaaX");
// treo rất lâu: engine thử mọi cách chia chuỗi "a" thành các nhóm
```

Các mẫu nguy hiểm điển hình: `(a+)+`, `(a|a)*`, `(\s*.*)+`, `(.*,)*`.

**Vì sao treo server?** Node.js **single-threaded** — event loop chỉ có một luồng. Regex chạy đồng bộ, không bị gián đoạn, nên một request với chuỗi input được dựng khéo có thể chiếm CPU hàng giây tới hàng phút, làm **toàn bộ** request khác đứng chờ. Đây chính là tấn công **ReDoS (Regular expression Denial of Service)** — chỉ cần vài request là hạ được cả service. Các regex email "đầy đủ" chép trên mạng rất hay chứa mẫu lồng nhau kiểu này.

**Phòng tránh:** dùng regex đơn giản (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) rồi xác thực thật bằng email kích hoạt; giới hạn độ dài input trước khi match; tránh quantifier lồng; quét bằng công cụ (ESLint plugin, `safe-regex`); và dùng thư viện validate đã kiểm chứng thay vì tự chế.

</details>

**21. `Intl.NumberFormat` và `Intl.DateTimeFormat` hơn gì so với tự format chuỗi bằng tay?**

<details className="qa">
<summary>Xem đáp án</summary>

Tự format bằng tay nghĩa là bạn phải tự gánh toàn bộ khác biệt văn hoá — và gần như chắc chắn sẽ sai ở đâu đó:

- **Dấu phân cách khác nhau theo locale**: `1.234.567` (vi-VN, de-DE) vs `1,234,567` (en-US) vs `1 234 567` (fr-FR).
- **Ký hiệu tiền tệ và vị trí đặt nó** khác nhau: `1.234.567 ₫` vs `$1,234,567`.
- **Thứ tự ngày/tháng/năm**, tên thứ và tên tháng theo ngôn ngữ, định dạng 12h/24h.
- **Quy tắc làm tròn, chữ số thập phân theo từng đơn vị tiền** (JPY không có phần lẻ, VND cũng vậy).
- **Timezone và calendar** được xử lý sẵn.

```js
new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
  1234567,
); // "1.234.567 ₫"

new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date()); // "Thứ Năm, 15 tháng 1, 2026"
```

Ngoài ra `Intl` là **chuẩn ECMA-402 built-in** — không tốn bundle size, được engine cài đặt bằng dữ liệu CLDR và cập nhật theo trình duyệt, nên bạn không phải bảo trì.

Mẹo hiệu năng: khởi tạo formatter **một lần** rồi tái sử dụng, vì việc tạo object formatter khá đắt.

</details>

**22. Kể vài class hữu ích khác của `Intl` (`RelativeTimeFormat`, `PluralRules`, `Collator`, `Segmenter`) và tình huống dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`Intl.RelativeTimeFormat`** — hiển thị thời gian tương đối như "2 ngày trước", "trong 3 tháng". Dùng cho timestamp của bài viết, bình luận, thông báo.

  ```js
  new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(-2, "day");
  // "2 ngày trước"
  ```

- **`Intl.PluralRules`** — chọn dạng số nhiều đúng theo locale. Tiếng Anh có 2 dạng, tiếng Nga/Ba Lan có tới 4 — không thể xử lý bằng `if (n > 1)`.

  ```js
  new Intl.PluralRules("en-US").select(1); // "one"
  new Intl.PluralRules("en-US").select(5); // "other"
  ```

- **`Intl.Collator`** — sắp xếp chuỗi đúng theo ngôn ngữ. `sort()` mặc định so theo mã Unicode nên tiếng Việt có dấu sẽ sai thứ tự.

  ```js
  ["Ánh", "An", "Bình"].sort(new Intl.Collator("vi").compare);
  ```

- **`Intl.Segmenter`** — tách chuỗi theo grapheme, từ hoặc câu. Cần khi đếm ký tự có emoji (`"👨‍👩‍👧".length` cho ra số lớn hơn 1) hoặc tách từ với tiếng Thái, Nhật, Trung — những ngôn ngữ không dùng khoảng trắng.

- **`Intl.ListFormat`** — nối danh sách đúng ngữ pháp: "A, B và C".

</details>
