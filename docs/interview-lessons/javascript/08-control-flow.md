---
sidebar_position: 8
title: "8. Control Flow"
---

# 8. Control Flow

## 1. Conditional Statements

Bài học: [1. Conditional Statements](../../javascript/08-control-flow/1_conditional.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `statement` và `expression`. Vì sao `if/else` là statement còn ternary `? :` là expression, và điều đó ảnh hưởng thế nào khi bạn cần rẽ nhánh bên trong JSX?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Expression** (biểu thức): đoạn code **cho ra một giá trị** — `1 + 2`, `age >= 18`, `fn()`. Có thể gán vào biến, truyền làm tham số, nhúng vào chỗ cần giá trị.
- **Statement** (câu lệnh): đoạn code **thực hiện một hành động**, không tự nó cho ra giá trị — `if`, `for`, `switch`, khai báo biến.

`if/else` là statement vì nó chỉ *điều khiển luồng chạy*; `const x = if (a) {...}` là `SyntaxError`. Ternary là expression vì nó **trả về giá trị** của một trong hai nhánh.

```js
const status = age >= 18 ? "adult" : "minor"; // OK
```

**Ảnh hưởng trong JSX:** phần trong `{...}` của JSX **chỉ nhận expression**, nên không viết `if` vào đó được. Vì vậy ternary (và `&&`) là cách rẽ nhánh inline duy nhất:

```jsx
{isLoading ? <Spinner /> : <Content />}
{user && <UserCard user={user} />}
```

Nếu logic phức tạp, hãy tách ra biến hoặc hàm phía trên rồi dùng `if` bình thường, thay vì lồng ternary.

</details>

**2. Liệt kê đầy đủ các giá trị `falsy` trong JavaScript. `[]`, `{}`, `"0"`, `NaN` — cái nào truthy, cái nào falsy?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ có **8 giá trị falsy**, học thuộc là xong — mọi giá trị còn lại đều truthy:

```js
false
0
-0
0n        // BigInt zero
""        // chuỗi rỗng (cả '' và ``)
null
undefined
NaN
```

Trả lời câu hỏi:

| Giá trị | Truthy / Falsy | Ghi chú |
|---|---|---|
| `[]` | **Truthy** | Mảng rỗng vẫn là object |
| `{}` | **Truthy** | Object rỗng vẫn là object |
| `"0"` | **Truthy** | Chuỗi không rỗng, dù nội dung là "0" |
| `NaN` | **Falsy** | Nằm trong danh sách 8 giá trị trên |

Bẫy hay gặp: mọi object đều truthy, kể cả `new Boolean(false)`.

```js
if ([]) console.log("chạy");        // có chạy
if ([] == false) console.log("ơ");  // cũng chạy — nhưng do == ép kiểu, khác chuyện truthy
```

Đây cũng là lý do `if (!value)` khác `if (value == null)`: `0` và `""` là falsy nhưng không phải nullish.

</details>

**3. `switch` so khớp `case` bằng `==` hay `===`? Đoán output khi `switch ("1")` có cả `case 1:` lẫn `case "1":`.**

<details className="qa">
<summary>Xem đáp án</summary>

`switch` so khớp bằng **`===`** (strict equality) — **không ép kiểu**.

```js
switch ("1") {
  case 1:
    console.log("số 1");
    break;
  case "1":
    console.log("chuỗi 1");
    break;
  default:
    console.log("không khớp");
}
// Output: "chuỗi 1"
```

`case 1` bị bỏ qua vì `"1" === 1` là `false` (khác kiểu). Chỉ `case "1"` khớp.

Hệ quả thực tế: giá trị lấy từ `input.value`, `params` của URL hay `dataset` đều là **string**, nên `switch (input.value) { case 1: ... }` sẽ không bao giờ khớp. Phải ép kiểu trước (`Number(input.value)`) hoặc viết case dạng chuỗi.

Một hệ quả nữa của `===`: `switch (NaN)` không bao giờ khớp `case NaN`, vì `NaN !== NaN`.

</details>

**4. `fall-through` trong `switch` là gì? Khi nào bạn cố ý dùng nó, và làm sao để ESLint cảnh báo lúc quên `break`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Fall-through** là hành vi: khi một `case` khớp, code chạy tiếp **xuyên qua các case phía dưới** cho tới khi gặp `break`, `return`, `throw` hoặc hết `switch`. Quên `break` là bug kinh điển:

```js
switch (x) {
  case 1:
    console.log("one");
    // quên break → chạy luôn xuống case 2!
  case 2:
    console.log("two");
    break;
}
// x = 1 → in cả "one" lẫn "two"
```

**Cố ý dùng khi nhiều case chia chung một xử lý** — xếp các `case` liền nhau, không có code ở giữa:

```js
switch (day) {
  case 6:
  case 7:
    console.log("Cuối tuần");
    break;
  default:
    console.log("Ngày thường");
}
```

Trường hợp fall-through *có code* ở giữa mà vẫn cố ý thì bắt buộc ghi chú `// fall through` để người sau biết là chủ ý.

**ESLint:** bật rule **`no-fallthrough`** — nó cảnh báo khi một case có code nhưng không kết thúc bằng `break`/`return`, và tự bỏ qua khi thấy comment `// fall through`.

</details>

**5. Vì sao `case` có khai báo `let`/`const` lại nên bọc trong `{}`? Không bọc thì gặp lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì **toàn bộ thân `switch` là MỘT block scope duy nhất**, không phải mỗi `case` một scope. Nên `let`/`const` khai báo trong `case` này vẫn "thuộc về" cả `switch`, dẫn tới hai lỗi:

```js
switch (action) {
  case "ADD":
    const item = createItem();   // khai báo trong scope của switch
    return [...state, item];
  case "REMOVE":
    const item = findItem();     // SyntaxError: Identifier 'item' has already been declared
    return state.filter(x => x !== item);
}
```

Lỗi thứ hai là **`ReferenceError` do temporal dead zone**: nếu nhánh chạy là `"REMOVE"`, biến `item` của nhánh `"ADD"` vẫn được hoisted vào scope nhưng chưa khởi tạo — chạm vào là lỗi.

**Cách sửa — bọc mỗi case trong `{}`** để tạo block scope riêng:

```js
switch (action) {
  case "ADD": {
    const item = createItem();
    return [...state, item];
  }
  case "REMOVE": {
    const item = findItem();     // không còn xung đột
    return state.filter(x => x !== item);
  }
}
```

ESLint có rule `no-case-declarations` bắt đúng lỗi này.

</details>

**6. `&&` và `||` trả về boolean hay trả về chính toán hạng? Đoán output của `0 || "a"`, `"" && "b"`, `null || 0 || "c"`.**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng trả về **chính một trong hai toán hạng**, không phải boolean. Chỉ toán tử `!` mới luôn trả boolean.

- `||` trả về **toán hạng truthy đầu tiên**; nếu không có thì trả toán hạng cuối cùng.
- `&&` trả về **toán hạng falsy đầu tiên**; nếu không có thì trả toán hạng cuối cùng.

```js
0 || "a";            // "a"  — 0 falsy nên lấy vế sau
"" && "b";           // ""   — "" falsy, dừng ngay, trả về ""
null || 0 || "c";    // "c"  — null falsy, 0 falsy, lấy "c"

"x" || "y";          // "x"  — truthy đầu tiên
"x" && "y";          // "y"  — không có falsy nào, trả toán hạng cuối
0 || null;           // null — không có truthy nào, trả toán hạng cuối
```

Đặc tính này chính là nền cho các idiom quen thuộc: `const name = input || "Anonymous"` (giá trị mặc định) và `user && user.greet()` (gọi có điều kiện), cũng như `{user && <UserCard />}` trong React.

</details>

**7. So sánh `||` với `??`. Đoán output: `0 || 100`, `0 ?? 100`, `"" || "x"`, `"" ?? "x"`, `false ?? true`.**

<details className="qa">
<summary>Xem đáp án</summary>

Khác nhau ở **điều kiện kích hoạt fallback**:

- `||` fallback khi vế trái **falsy** (bao gồm `0`, `""`, `false`, `NaN`).
- `??` (nullish coalescing, ES2020) fallback **chỉ khi vế trái là `null` hoặc `undefined`**.

```js
0 || 100;       // 100  — 0 là falsy
0 ?? 100;       // 0    — 0 không nullish, giữ nguyên
"" || "x";      // "x"  — "" là falsy
"" ?? "x";      // ""   — "" không nullish, giữ nguyên
false ?? true;  // false — false không nullish, giữ nguyên
```

Vì sao quan trọng: với config/tham số, `0` và `""` và `false` thường là **giá trị hợp lệ** mà người dùng cố ý đặt. Dùng `||` sẽ âm thầm nuốt mất chúng:

```js
const pageSize = options.pageSize || 20;  // người dùng đặt 0 → bị ép thành 20
const pageSize = options.pageSize ?? 20;  // giữ đúng 0
const showAds  = settings.showAds ?? true; // giữ đúng false
```

Quy tắc: mặc định dùng `??`; chỉ dùng `||` khi thật sự muốn **mọi** giá trị falsy đều rơi vào fallback (ví dụ chuỗi rỗng cũng coi là "chưa nhập"). ESLint có rule `prefer-nullish-coalescing` để nhắc migrate.

</details>

**8. `short-circuit evaluation` nghĩa là gì? Nó ảnh hưởng ra sao khi vế phải có side effect, ví dụ `isValid() || logError()`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Short-circuit evaluation** (đánh giá ngắn mạch) nghĩa là toán tử logic **dừng ngay khi đã đủ để kết luận**, và **không thèm chạy vế phải**:

- `a || b` — nếu `a` truthy thì trả `a` luôn, `b` **không được thực thi**.
- `a && b` — nếu `a` falsy thì trả `a` luôn, `b` **không được thực thi**.

Với vế phải có side effect, điều này quyết định side effect đó **có xảy ra hay không**:

```js
isValid() || logError();  // logError() CHỈ chạy khi isValid() trả falsy
user && user.save();      // save() CHỈ chạy khi user truthy
cache[key] || fetchData(key); // chỉ gọi API khi cache miss
```

Đây vừa là tính năng hữu ích, vừa là bẫy. Hữu ích vì nó cho phép bảo vệ: `obj && obj.prop` không nổ khi `obj` là `null`. Là bẫy vì một lời gọi hàm quan trọng có thể **âm thầm không chạy**:

```js
let count = 0;
false && count++;   // count vẫn 0 — dòng này trông như luôn tăng
```

Lời khuyên: dùng short-circuit cho luồng đơn giản, dễ nhìn. Khi vế phải là logic quan trọng có side effect, viết `if` tường minh để người đọc thấy rõ điều kiện.

</details>

**9. Vì sao `a ?? b || c` ném `SyntaxError`? Giải thích theo độ ưu tiên toán tử và cách viết đúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì spec **cố tình cấm trộn `??` với `||` hoặc `&&` mà không có dấu ngoặc**.

```js
const x = a ?? b || c;   // SyntaxError
const y = a || b ?? c;   // SyntaxError
```

Lý do: `??` có **cùng mức ưu tiên** với `||` và `&&` trong bảng ưu tiên, nên nếu cho phép viết chung, người đọc không thể nhìn ra ý định thật là `(a ?? b) || c` hay `a ?? (b || c)` — mà hai cách nhóm cho kết quả **khác nhau**:

```js
const a = 0, b = "x", c = "fallback";

(a ?? b) || c;   // (0 ?? "x") → 0 → falsy → "fallback"
a ?? (b || c);   // 0 không nullish → 0
```

Thay vì chọn ngầm một cách nhóm rồi để lập trình viên đoán sai, TC39 quyết định báo lỗi cú pháp ngay.

**Cách viết đúng: thêm ngoặc để nói rõ ý định.**

```js
const x = (a ?? b) || c;
const y = a ?? (b || c);
```

Lưu ý `??` **được phép** đi cùng `?.` mà không cần ngoặc: `user?.name ?? "Ẩn danh"` hoàn toàn hợp lệ.

</details>

**10. Trong React, `{count && <List />}` khi `count === 0` sẽ render ra gì? Vì sao, và bạn sửa lại thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó render ra **số `0` hiện trên màn hình** — không phải render "không gì cả" như mong đợi.

**Vì sao:** `&&` trả về **chính toán hạng**, không phải boolean. `count` là `0` (falsy) nên biểu thức short-circuit và trả về `0`. React **bỏ qua** `false`, `null`, `undefined` khi render, nhưng **số `0` thì render ra**. Kết quả là giữa giao diện xuất hiện một chữ "0" lạc lõng.

```jsx
{count && <List />}     // count = 0 → hiện "0"
{items.length && <List />} // mảng rỗng → hiện "0"
```

**Cách sửa** — biến vế trái thành boolean thật, hoặc dùng ternary:

```jsx
{count > 0 && <List />}          // rõ ràng nhất
{Boolean(count) && <List />}     // ép sang boolean
{!!count && <List />}            // ngắn gọn, cùng ý
{count ? <List /> : null}        // ternary — an toàn tuyệt đối
```

Cùng bẫy này xảy ra với chuỗi rỗng ở một số môi trường và với `NaN`. Quy tắc an toàn: trong JSX, **luôn đưa vế trái của `&&` về boolean**, đừng dựa vào truthy của số hay chuỗi.

</details>

**11. `?.` xử lý ra sao khi một mắt xích giữa chuỗi là `null`? So sánh `obj?.a.b.c` với `obj?.a?.b?.c` — trường hợp nào vẫn có thể nổ `TypeError`?**

<details className="qa">
<summary>Xem đáp án</summary>

`?.` (optional chaining) hoạt động như sau: nếu giá trị **ngay trước dấu `?.`** là `null` hoặc `undefined`, **toàn bộ phần còn lại của chuỗi bị bỏ qua** và biểu thức trả về `undefined` ngay, không ném lỗi.

Điểm mấu chốt: `?.` chỉ bảo vệ **đúng mắt xích mà nó đứng sau**.

```js
const obj = { a: undefined };

obj?.a.b.c;    // TypeError: Cannot read properties of undefined (reading 'b')
obj?.a?.b?.c;  // undefined — an toàn
```

- **`obj?.a.b.c`** chỉ bảo vệ trường hợp `obj` là nullish. Nếu `obj` tồn tại nhưng `obj.a` là `undefined`, việc đọc `.b` vẫn **nổ `TypeError`** vì `.b` là truy cập thường.
- **`obj?.a?.b?.c`** bảo vệ **từng mắt xích**, nên an toàn ở mọi vị trí.

```js
const user = null;
user?.address.city;   // undefined — short-circuit ngay từ user, cả chuỗi bị bỏ qua
```

Lời khuyên: chỉ đặt `?.` ở những mắt xích **thật sự có thể thiếu**. Rải `?.` khắp nơi sẽ che giấu bug — dữ liệu sai sẽ âm thầm thành `undefined` thay vì báo lỗi sớm. Kết hợp `??` để đặt mặc định: `user?.address?.city ?? "Chưa cập nhật"`.

</details>

**12. `obj?.method()` khác `obj.method?.()` ở điểm nào? Mỗi cách bảo vệ bạn khỏi lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách bảo vệ **hai thứ khác nhau**:

- **`obj?.method()`** — bảo vệ **`obj`** khỏi nullish. Nếu `obj` là `null`/`undefined`, trả `undefined` ngay. Nhưng nếu `obj` tồn tại mà `method` không tồn tại, vẫn nổ `TypeError: obj.method is not a function`.
- **`obj.method?.()`** — đây là **optional call**, bảo vệ **`method`**: chỉ gọi khi `method` không nullish. Nhưng nếu `obj` là `null`, vẫn nổ `TypeError` ngay ở `obj.method`.

```js
const obj = {};
obj?.method();     // TypeError: obj.method is not a function
obj.method?.();    // undefined — an toàn

const nothing = null;
nothing?.method(); // undefined — an toàn
nothing.method?.(); // TypeError: Cannot read properties of null
```

**Muốn an toàn cả hai, ghép lại:**

```js
obj?.method?.();
```

Use case điển hình của optional call là gọi callback tuỳ chọn:

```js
function Button({ onClick }) {
  const handle = () => onClick?.(); // không cần if (onClick)
}
```

Lưu ý `?.()` chỉ kiểm tra nullish, không kiểm tra "có phải hàm không" — nếu `method` là một số thì vẫn ném lỗi.

</details>

**13. `guard clause` / `early return` giải quyết vấn đề gì so với lồng `if` nhiều tầng (pyramid of doom)?**

<details className="qa">
<summary>Xem đáp án</summary>

Lồng `if` nhiều tầng đẩy logic chính vào sâu bên trong, khiến người đọc phải giữ nhiều điều kiện trong đầu cùng lúc và mắt phải quét qua nhiều mức thụt lề.

```js
// Tệ — pyramid of doom
function process(user) {
  if (user) {
    if (user.active) {
      if (user.permissions.includes("write")) {
        return doWork(user);
      }
    }
  }
  return null;
}

// Tốt — guard clauses
function process(user) {
  if (!user) return null;
  if (!user.active) return null;
  if (!user.permissions.includes("write")) return null;
  return doWork(user);
}
```

**Guard clause giải quyết:**

- **Giảm độ sâu thụt lề** — code phẳng, dễ quét mắt.
- **Tách bạch "trường hợp loại trừ" và "luồng chính"**: loại trừ xử lý trước và ra khỏi hàm sớm, phần chính nằm ở cuối, không lồng.
- **Giảm tải nhận thức**: đọc tới dòng nào cũng biết mọi điều kiện phía trên đã thoả.
- **Dễ thêm điều kiện mới** — chỉ thêm một dòng, không phải bọc thêm một tầng.
- Dễ gắn thông báo lỗi cụ thể cho từng trường hợp thay vì gộp chung một `return null`.

Nguyên tắc: **xử lý case không hợp lệ trước, trả về sớm.**

</details>

**14. Khi nào bạn chọn `switch`, khi nào chọn object lookup map, khi nào chọn chuỗi `if / else if`? Đánh đổi của từng cách là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Dùng khi | Đánh đổi |
|---|---|---|
| `if / else if` | Điều kiện là **biểu thức khác nhau** (khoảng giá trị, nhiều biến, so sánh phức tạp) | Linh hoạt nhất, nhưng dài và khó đọc khi nhiều nhánh |
| `switch` | Nhiều nhánh dựa trên **một giá trị** rời rạc; mỗi nhánh có vài dòng logic | Gom nhóm case được, nhưng dễ quên `break` và phải bọc `{}` khi khai báo biến |
| Object lookup | Ánh xạ **giá trị → giá trị/hàm**, danh sách case có thể mở rộng hoặc cấu hình được | Ngắn gọn nhất, nhưng phải xử lý key không tồn tại và cẩn thận với key kế thừa |

```js
// Điều kiện theo khoảng → if/else if
if (score >= 90) grade = "A";
else if (score >= 70) grade = "B";

// Nhiều nhánh theo một giá trị, mỗi nhánh nhiều dòng → switch
switch (action.type) { case "ADD": { /* ... */ } }

// Ánh xạ đơn giản → object lookup
const LABELS = { pending: "Đang chờ", paid: "Đã thanh toán" };
const label = LABELS[status] ?? "Không rõ";
```

Quy tắc của tôi: ánh xạ thuần dữ liệu thì dùng object (dễ test, dễ đưa ra file config); có logic thật sự cho từng nhánh thì `switch`; điều kiện không cùng một biến thì `if/else if`.

</details>

**15. Ternary lồng nhiều tầng bị chê ở điểm nào? Bạn refactor một biểu thức 4 tầng ternary như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ternary lồng bị chê vì: khó xác định `:` nào ăn với `?` nào, không gắn được comment cho từng nhánh, diff git rối khi sửa một nhánh, và khi xuống dòng thì định dạng mỗi người một kiểu. ESLint có rule `no-nested-ternary` để chặn.

```js
// Tệ — 4 tầng
const label = s === "a" ? "A" : s === "b" ? "B" : s === "c" ? "C" : s === "d" ? "D" : "?";
```

**Cách refactor, theo thứ tự ưu tiên:**

1. **Object lookup** — nếu chỉ là ánh xạ giá trị:

```js
const LABELS = { a: "A", b: "B", c: "C", d: "D" };
const label = LABELS[s] ?? "?";
```

2. **Tách thành hàm với guard clause** — nếu mỗi nhánh có điều kiện phức tạp:

```js
function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}
```

3. **`switch`** — nếu mỗi nhánh cần vài dòng xử lý.

Ternary **một tầng** vẫn rất tốt và nên dùng: `const badge = isActive ? "active" : "inactive"`. Ranh giới thực dụng: quá một tầng là tín hiệu nên tách ra.

</details>

---

## 2. Exception Handling

Bài học: [2. Exception Handling](../../javascript/08-control-flow/2_exception-handling.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `try`, `catch`, `finally` chạy theo thứ tự nào? Có thể viết `try` mà không có `catch` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự: khối `try` chạy trước. Nếu **không** có lỗi thì `catch` bị bỏ qua, rồi `finally` chạy. Nếu **có** lỗi, phần còn lại của `try` bị hủy, `catch` chạy để xử lý, sau đó `finally` chạy. Dù lỗi được xử lý hay tiếp tục bubble lên tầng trên, `finally` **luôn** chạy — đó là chỗ dọn dẹp tài nguyên (đóng connection, file, hủy timer).

Về cú pháp, bắt buộc phải có ít nhất một trong hai khối `catch` hoặc `finally`. Nên `try` không `catch` là hợp lệ, miễn có `finally`:

```js
try {
  return fetchData();   // lỗi vẫn bubble lên tầng trên
} finally {
  closeConnection();    // nhưng vẫn kịp dọn dẹp
}
```

Dạng này rất hữu ích khi bạn **không muốn nuốt lỗi** mà chỉ muốn đảm bảo giải phóng tài nguyên. Viết `try` trơ trọi không `catch` lẫn `finally` sẽ là `SyntaxError`.

</details>

**2. Vì sao nên `throw new Error(...)` thay vì `throw "lỗi"` hay `throw { code: 1 }`? Bạn mất gì khi throw giá trị nguyên thủy?**

<details className="qa">
<summary>Xem đáp án</summary>

JS cho phép `throw` bất kỳ giá trị nào, nhưng chỉ instance của `Error` mới mang đủ thông tin để debug. Khi throw chuỗi hay object thường, bạn mất:

- **`stack`** — stack trace chỉ ra lỗi phát sinh ở file/dòng nào. Đây là thứ mất mát đau nhất, không có nó việc truy vết gần như bất khả thi.
- **`name` và `message`** chuẩn hóa — mọi logger, framework, dịch vụ monitoring (Sentry...) đều đọc hai field này.
- **Khả năng phân loại bằng `instanceof`** — không thể viết `err instanceof ValidationError` với một chuỗi.

```js
throw "lỗi";            // tệ — err.message là undefined, không có stack
throw { code: 1 };      // tệ — logger in ra "[object Object]"
throw new Error("Không chia cho 0");  // tốt
```

Hậu quả thực tế: `catch (err) { console.error(err.message) }` sẽ in `undefined` khi ai đó throw chuỗi. Vì vậy quy tắc là **luôn throw một instance kế thừa `Error`**; cần thêm metadata thì tạo custom Error class chứ đừng throw object trần.

</details>

**3. `finally` có chạy không khi trong `try` đã `return`? Nếu cả `try` lẫn `finally` cùng `return` thì giá trị nào thắng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có** — `finally` luôn chạy, kể cả khi `try` đã `return`, `break` hay `continue`. Cơ chế: engine **tính xong giá trị trả về** của `try` và giữ lại (pending completion), rồi chạy `finally`, sau đó mới thực sự thoát hàm.

Hệ quả quan trọng: nếu `finally` cũng có `return`, nó **ghi đè** hoàn toàn giá trị (hoặc lỗi) đang chờ của `try`/`catch`:

```js
function f() {
  try {
    return 1;
  } finally {
    return 2;   // thắng
  }
}
f(); // 2
```

Tương tự, `return` trong `finally` còn **nuốt luôn exception** đang bubble lên — lỗi biến mất không dấu vết, rất khó debug.

Vì vậy nguyên tắc thực hành: `finally` chỉ nên dùng để **dọn dẹp** (`conn?.close()`, `clearTimeout`), **không đặt `return`, `throw`, `break` bên trong**. Lưu ý thêm: sửa biến trong `finally` không ảnh hưởng giá trị đã trả về, vì giá trị đó đã được chốt trước khi `finally` chạy.

</details>

**4. Đoán output: hàm có `try { return 1 } finally { return 2 }`. Giải thích cơ chế.**

<details className="qa">
<summary>Xem đáp án</summary>

Output là **`2`**.

```js
function f() {
  try {
    return 1;    // completion record {type: return, value: 1} — bị giữ lại
  } finally {
    return 2;    // completion record mới ghi đè cái cũ
  }
}
console.log(f()); // 2
```

Cơ chế theo spec: mỗi khối sinh ra một **completion record** (gồm loại — normal / return / throw / break — và giá trị). Khi `try` gặp `return 1`, engine ghi nhận completion `return 1` nhưng **chưa thoát hàm ngay**, vì `finally` bắt buộc phải chạy trước. Khi `finally` chạy và tự nó tạo ra một **abrupt completion** mới (`return 2`), completion mới **thay thế** completion đang chờ. Kết quả là `1` bị vứt bỏ.

Điều tương tự xảy ra với exception: `try { throw new Error("x") } finally { return 2 }` sẽ trả về `2` và lỗi **biến mất hoàn toàn**. Đây chính là lý do không nên đặt `return`/`throw` trong `finally`.

</details>

**5. `optional catch binding` (ES2019) là gì và khi nào nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Optional catch binding** là tính năng ES2019 cho phép **bỏ hẳn tham số** của `catch` khi bạn không dùng tới object lỗi:

```js
// Trước ES2019 — bắt buộc khai báo err dù không dùng
try { JSON.parse(input); } catch (err) { return null; }

// Từ ES2019
try { JSON.parse(input); } catch { return null; }
```

Lợi ích: code gọn hơn và tránh biến không dùng bị linter (`no-unused-vars`) cảnh báo.

Khi nào nên dùng: chỉ khi bạn thực sự **không quan tâm chi tiết lỗi**, ví dụ kiểm tra một chuỗi có phải JSON hợp lệ không, hoặc thử một API có tồn tại trong môi trường hiện tại không (feature detection) — tức mọi lỗi đều dẫn tới cùng một hành động fallback.

Cảnh báo: đừng lạm dụng nó để **nuốt lỗi im lặng**. Nếu lỗi có nhiều nguyên nhân khác nhau và cần phân loại hay log lại, hãy giữ `catch (err)` để còn `err.message`, `err.stack` mà điều tra.

</details>

**6. Phân biệt `TypeError`, `ReferenceError`, `SyntaxError`, `RangeError`. Cho một đoạn code sinh ra từng loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| Class | Nguyên nhân |
|---|---|
| `TypeError` | Giá trị **tồn tại nhưng sai kiểu** cho thao tác đang làm: gọi thứ không phải function, đọc property của `null`/`undefined`, gán lại `const` |
| `ReferenceError` | Truy cập **biến không tồn tại** hoặc biến `let`/`const` trong Temporal Dead Zone |
| `SyntaxError` | **Cú pháp sai** — phát hiện lúc parse, không phải lúc chạy. Cũng gặp khi `JSON.parse` dữ liệu hỏng |
| `RangeError` | Giá trị đúng kiểu nhưng **ngoài phạm vi cho phép**: độ dài mảng âm, đệ quy tràn stack |

```js
null.foo;                  // TypeError: Cannot read properties of null
undefinedVar;              // ReferenceError: undefinedVar is not defined
JSON.parse("{bad}");       // SyntaxError: Unexpected token b in JSON
new Array(-1);             // RangeError: Invalid array length
```

Lưu ý: `SyntaxError` do cú pháp sai trong chính file code **không bắt được bằng `try/catch`** vì lỗi xảy ra ở bước parse, trước khi code chạy. Chỉ `SyntaxError` sinh lúc runtime (từ `JSON.parse`, `eval`, `new Function`) mới bắt được.

</details>

**7. Một Error object có những thuộc tính nào? `err.stack` đã được chuẩn hoá trong spec chưa, và điều đó ảnh hưởng gì tới code cross-platform?**

<details className="qa">
<summary>Xem đáp án</summary>

Thuộc tính chuẩn theo ECMAScript:

- **`name`** — tên loại lỗi (`"Error"`, `"TypeError"`, hoặc giá trị bạn gán cho custom Error).
- **`message`** — mô tả lỗi, chính là tham số truyền vào `new Error(message)`.
- **`cause`** (ES2022) — lỗi gốc, truyền qua `new Error(msg, { cause: err })`.

**`stack` thì KHÔNG nằm trong chuẩn ECMAScript** — nó là de-facto standard được mọi engine hỗ trợ nhưng **định dạng khác nhau**: V8 (Chrome/Node) bắt đầu bằng dòng `"TypeError: message"` rồi tới các frame `at ...`; SpiderMonkey (Firefox) và JavaScriptCore (Safari) dùng format khác hẳn.

Ảnh hưởng tới code cross-platform:

- **Đừng parse `err.stack` bằng regex** để lấy file/dòng — logic sẽ vỡ khi đổi trình duyệt hoặc runtime.
- `Error.captureStackTrace` và `Error.stackTraceLimit` là **API riêng của V8**, gọi trên Safari sẽ lỗi → dùng optional call `Error.captureStackTrace?.(this, this.constructor)`.
- Muốn xử lý stack đáng tin cậy nên dùng thư viện chuyên dụng hoặc dịch vụ monitoring thay vì tự viết.

</details>

**8. Vì sao `try/catch` bọc ngoài không bắt được lỗi throw bên trong `setTimeout(() => { throw new Error() })`? Giải thích theo `call stack` và `event loop`.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
try {
  setTimeout(() => { throw new Error("boom"); }, 0);
} catch (err) {
  console.log("không bao giờ chạy");   // KHÔNG bắt được
}
// → lỗi nổi lên thành uncaught error toàn cục
```

Lý do: `try/catch` là cơ chế **gắn với call stack**, chỉ bắt được lỗi phát sinh trong **cùng một lượt thực thi (tick)** của stack đó.

Diễn biến: lời gọi `setTimeout` chỉ **đăng ký** callback với runtime rồi trả về ngay. Khối `try` kết thúc, stack rỗng, `catch` đã "hết nhiệm kỳ". Sau đó event loop mới lấy callback từ macrotask queue đẩy lên một call stack **hoàn toàn mới** — stack này không còn frame nào của khối `try` nữa, nên không có `catch` nào che nó.

Cách xử lý đúng: đặt `try/catch` **bên trong** chính callback, hoặc bọc `setTimeout` thành Promise rồi `await` nó trong `try/catch`. Ở mức safety net, dùng `window.onerror` / `process.on("uncaughtException")`.

</details>

**9. Gọi một hàm `async` mà không `await` bên trong `try/catch` đồng bộ thì lỗi có bị bắt không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không bắt được.** Hàm `async` luôn trả về một Promise; khi bên trong nó throw, Promise đó bị **reject** chứ không throw đồng bộ lên call stack.

```js
async function load() {
  throw new Error("boom");
}

try {
  load();              // trả về Promise bị reject — try/catch không thấy gì
} catch (err) {
  console.log("không chạy");
}
// → UnhandledPromiseRejection

try {
  await load();        // await "mở gói" rejection thành throw → bắt được
} catch (err) {
  console.log(err.message); // "boom"
}
```

Cơ chế: `try/catch` chỉ bắt được exception ném ra **trong cùng lượt thực thi đồng bộ**. Gọi `load()` không `await` chỉ tạo Promise rồi trả về ngay — khối `try` kết thúc bình thường. Rejection xảy ra ở microtask sau đó, lúc `catch` không còn hiệu lực.

Chính `await` là toán tử biến rejection thành exception đồng bộ trong ngữ cảnh hàm async. Nếu cố ý không `await` (fire-and-forget), hãy gắn `.catch()` cho Promise đó để tránh unhandled rejection.

</details>

**10. So sánh `.catch()` trong promise chain với `try/catch` + `async/await`. `.then(onFulfilled, onRejected)` khác `.then(...).catch(...)` chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Promise chain + `.catch()` | `async/await` + `try/catch` |
|---|---|---|
| Cú pháp | Nối chuỗi callback | Giống code đồng bộ, dễ đọc |
| Phạm vi bắt lỗi | Bắt lỗi của **mọi mắt xích phía trước** | Bắt mọi `await` trong khối `try` |
| Biến trung gian | Khó chia sẻ giữa các `.then` | Dùng biến bình thường |
| Debug / stack trace | Stack thường khó lần | Stack rõ ràng hơn |

Cả hai đều đúng về mặt ngữ nghĩa; `async/await` được ưu tiên trong code hiện đại, còn `.catch()` vẫn tiện cho chuỗi ngắn.

**Khác biệt giữa hai dạng xử lý reject:**

```js
p.then(onOk, onErr);        // onErr KHÔNG bắt lỗi do chính onOk ném ra
p.then(onOk).catch(onErr);  // onErr bắt cả lỗi của p LẪN lỗi trong onOk
```

Với `.then(onFulfilled, onRejected)`, hai callback là **hai nhánh song song** trên cùng một Promise — nếu `onFulfilled` chạy rồi throw, `onRejected` đã bị bỏ qua nên không bắt được. `.catch()` đứng **sau** nên phủ được cả hai trường hợp. Vì vậy mặc định nên dùng `.then(...).catch(...)`.

</details>

**11. `unhandled promise rejection` là gì? Node.js từ phiên bản 15 xử lý nó ra sao, và bắt tổng ở browser/Node bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Unhandled promise rejection** là tình huống một Promise bị reject nhưng **không có handler nào** (`.catch()` hoặc `try/catch` quanh `await`) xử lý nó:

```js
async function load() {
  await fetch("/bad-url");   // throw
}
load();  // không await, không catch → unhandled rejection
```

**Node.js:** trước v15, unhandled rejection chỉ in warning và chương trình chạy tiếp — rất nguy hiểm vì lỗi bị giấu. Từ **Node.js ≥ 15**, hành vi mặc định đổi thành `throw`, nghĩa là **crash process** như một uncaught exception. Triết lý: fail nhanh và lộ rõ còn hơn chạy tiếp trong trạng thái sai.

**Browser:** in lỗi ra console kèm cảnh báo, không crash trang.

Bắt tổng:

```js
// Browser
window.addEventListener("unhandledrejection", e => console.error(e.reason));

// Node.js
process.on("unhandledRejection", err => console.error(err));
```

Nhớ rằng đây chỉ là **safety net** để log và báo monitoring trước khi thoát, **không thay thế** việc đặt `try/catch`/`.catch()` đúng chỗ.

</details>

**12. Viết một custom Error class kế thừa `Error` cần lưu ý gì: `super(message)`, `this.name`, `Error.captureStackTrace`, và vì sao `instanceof` có thể hỏng khi transpile xuống ES5?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
class AppError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause }); // bắt buộc, set message + cause
    this.name = this.constructor.name;        // nếu quên, name vẫn là "Error"
    this.statusCode = options.statusCode ?? 500;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
```

Các điểm cần nhớ:

- **`super(message)`** phải gọi trước khi dùng `this`, và là thứ gán `this.message` cho bạn.
- **`this.name`** không tự động theo tên class — phải gán tay, nếu không log ra vẫn hiện `"Error: ..."`. Dùng `this.constructor.name` thì subclass tự có tên đúng.
- **`Error.captureStackTrace(this, this.constructor)`** loại bỏ frame của chính constructor khỏi stack, cho trace sạch. Đây là API riêng của V8 → gọi kèm `?.`.

**Vì sao `instanceof` hỏng khi transpile xuống ES5?** ES5 không có `class` thật, Babel mô phỏng kế thừa bằng constructor function. Nhưng `Error` là **built-in exotic**: gọi `Error.call(this, msg)` trả về một object **mới** thay vì khởi tạo `this`, khiến prototype chain bị đứt và `err instanceof AppError` trả `false`. Cách chữa: thêm `Object.setPrototypeOf(this, new.target.prototype)` trong constructor, hoặc đặt target biên dịch từ ES6 trở lên.

</details>

**13. `Error.cause` (ES2022) dùng để làm gì? So với việc nhồi lỗi gốc vào `message` thì hơn ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`Error.cause` cho phép **gắn lỗi gốc** vào lỗi mới khi bạn bắt lỗi tầng dưới rồi throw lại lỗi mang ngữ nghĩa nghiệp vụ:

```js
try {
  await fetch(url);
} catch (err) {
  throw new Error("Failed to load user", { cause: err });
}
// Tầng trên: err.message → ngữ cảnh; err.cause → lỗi mạng gốc, còn nguyên stack
```

So với cách cũ là nối chuỗi vào `message` (`new Error("Failed: " + err.message)`):

| | Nhồi vào `message` | `Error.cause` |
|---|---|---|
| Stack của lỗi gốc | **Mất hoàn toàn** | Giữ nguyên trong `err.cause.stack` |
| Kiểu lỗi gốc | Mất — không `instanceof` được nữa | Vẫn kiểm tra được `err.cause instanceof TimeoutError` |
| Metadata khác (`statusCode`, `code`) | Mất | Còn nguyên |
| Đọc tự động | Phải parse chuỗi | Truy cập property |

Nhờ vậy bạn xây được một **chuỗi nguyên nhân** (error chain) nhiều tầng: mỗi tầng thêm ngữ cảnh của mình mà không phá hủy thông tin tầng dưới. Các công cụ hiện đại (Node `console.error`, Sentry) đã tự in/hiển thị chuỗi `cause` này.

</details>

**14. So sánh `Promise.all`, `Promise.allSettled`, `Promise.any`, `Promise.race` về hành vi khi có promise fail. `AggregateError` xuất hiện trong trường hợp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Method | Fulfill khi | Reject khi | Kết quả |
|---|---|---|---|
| `Promise.all` | **Tất cả** fulfill | **Bất kỳ** cái nào reject (fail-fast) | Mảng giá trị / lý do reject đầu tiên |
| `Promise.allSettled` | Khi **tất cả** đã settle | **Không bao giờ** reject | Mảng `{status, value}` hoặc `{status, reason}` |
| `Promise.any` | Cái **đầu tiên** fulfill | Khi **tất cả** đều reject | Giá trị đầu tiên thành công / `AggregateError` |
| `Promise.race` | Cái settle **đầu tiên**, dù fulfill hay reject | Nếu cái đầu tiên settle là reject | Giá trị hoặc lý do của cái nhanh nhất |

```js
const results = await Promise.allSettled([fetch(u1), fetch(u2)]);
results.forEach(r =>
  r.status === "fulfilled" ? console.log(r.value) : console.error(r.reason)
);
```

Chọn theo nhu cầu: cần **tất cả** thành công thì `all`; muốn biết **từng cái** ra sao mà không fail-fast thì `allSettled`; cần **một nguồn nào cũng được** (fallback mirror) thì `any`; đặt **timeout** cho một tác vụ thì `race`.

**`AggregateError`** xuất hiện khi `Promise.any` thất bại toàn bộ — nó gom mọi lý do reject vào thuộc tính `err.errors` (một mảng).

</details>

**15. Vì sao `catch` rồi chỉ `console.log` bị coi là anti-pattern? Khi nào nên rethrow bằng `throw err`?**

<details className="qa">
<summary>Xem đáp án</summary>

`catch` rồi chỉ log là **nuốt lỗi có trang trí**: bạn đã "tuyên bố" với runtime rằng lỗi này đã được xử lý, nên nó dừng bubble lên.

```js
try { doSomething(); } catch (err) { console.log(err); }
// Code chạy tiếp với dữ liệu sai → lỗi thật nổ ở chỗ khác, xa nguyên nhân
```

Tác hại:

- Hàm **trả về `undefined`** hoặc trạng thái nửa vời, lỗi thật lộ ra ở nơi khác rất khó truy vết.
- Người dùng **không nhận được phản hồi** nào, tưởng thao tác đã thành công.
- Monitoring không ghi nhận, `console.log` trên production thường chẳng ai đọc.

**Khi nào rethrow `throw err`:** khi bạn chỉ xử lý được **một phần** lỗi (log thêm ngữ cảnh, rollback transaction, đóng connection) nhưng **không quyết định được** chuyện gì xảy ra tiếp theo. Cũng rethrow khi bạn chỉ quan tâm một loại lỗi cụ thể:

```js
catch (err) {
  if (err instanceof NetworkError) return retry();
  throw err;   // loại khác: để tầng trên xử lý
}
```

Nguyên tắc: **chỉ catch khi biết xử lý**; không biết thì để lỗi bubble lên top-level handler.

</details>

**16. Có nên bọc `try/catch` quanh mọi lời gọi hàm không? Nêu nguyên tắc quyết định "catch ở tầng nào".**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Bọc `try/catch` khắp nơi làm code nhiễu, che mất luồng chính, và tệ nhất là dễ dẫn tới nuốt lỗi — đúng cái vấn đề mà cơ chế exception sinh ra để tránh.

Nguyên tắc chọn tầng:

- **Catch ở tầng biết quyết định.** Chỉ bắt lỗi ở nơi bạn có đủ ngữ cảnh để làm gì đó có ý nghĩa: retry, dùng giá trị mặc định, hiển thị thông báo cho người dùng, trả HTTP status.
- **Tầng thấp (util, repository) nên throw, không catch.** Một hàm `parseConfig` không biết app muốn dừng hay dùng default — hãy để nó throw và cung cấp lỗi giàu thông tin.
- **Catch ở biên hệ thống (boundary).** Những nơi đáng đặt handler: request handler / middleware của server, event handler của UI, `main()` của CLI, Error Boundary của React, hàng đợi job.
- **Catch có chọn lọc.** Bắt đúng loại lỗi mình xử lý được, còn lại `throw err`.
- **Dùng `try/finally` không `catch`** khi chỉ cần dọn dẹp tài nguyên mà không muốn chặn lỗi.

Tóm lại: **throw sớm, catch muộn** — và luôn có một top-level handler làm lưới an toàn cuối cùng để log về monitoring.

</details>

**17. Trong một API server (Express/Nest), bạn thiết kế xử lý lỗi tập trung thế nào để map error class sang HTTP status mà không rải `if (error)` khắp nơi?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **Error hierarchy + một error handler duy nhất ở tầng cao nhất**.

Bước 1 — định nghĩa cây lỗi nghiệp vụ, mang sẵn metadata HTTP:

```js
class AppError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
class NotFoundError extends AppError {
  constructor(resource) { super(`${resource} not found`, { statusCode: 404 }); }
}
```

Bước 2 — tầng service chỉ việc `throw new NotFoundError("User")`, controller **không** `if (error)` gì cả.

Bước 3 — một middleware cuối chuỗi (Express) hoặc `ExceptionFilter` (Nest) làm nơi duy nhất map lỗi sang response: lấy `err.statusCode` nếu là `AppError`, còn lỗi lạ thì mặc định `500`.

Các điểm cần thêm:

- **Không rò rỉ thông tin**: chỉ trả `err.message` cho lỗi 4xx đã kiểm soát; lỗi 500 trả thông điệp chung, còn stack và `err.cause` thì log nội bộ.
- **Bắt lỗi async**: Express 4 không tự bắt rejection từ handler `async` — cần `express-async-errors` hoặc wrapper `asyncHandler`; Express 5 và Nest đã xử lý sẵn.
- **Safety net**: đăng ký `process.on("unhandledRejection")` và `uncaughtException` để log rồi shutdown có trật tự.

</details>
