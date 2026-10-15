---
sidebar_position: 10
title: "10. Functions"
---

# 10. Functions

## 1. Function Parameters

Bài học: [1. Function Parameters](../../javascript/10-functions/1_parameters.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Điều gì xảy ra khi bạn gọi hàm với ít hơn hoặc nhiều hơn số parameter đã khai báo? JavaScript có báo lỗi không?**

<details className="qa">
<summary>Xem đáp án</summary>

JS **không báo lỗi** trong cả hai trường hợp — đây là điểm khác hẳn các ngôn ngữ static typing như Java hay C#.

- **Truyền thiếu**: các parameter không nhận được đối số sẽ mang giá trị `undefined` (hoặc giá trị default nếu có khai báo).
- **Truyền thừa**: đối số dư bị **bỏ qua** hoàn toàn, nhưng vẫn truy cập được qua `arguments` (với hàm thường) hoặc qua rest parameter.

```js
function greet(name, greeting) {
  console.log(name, greeting);
}

greet("An");                    // "An" undefined
greet("An", "Hi", "thừa", 42);  // "An" "Hi" — hai đối số cuối bị bỏ qua
```

Hệ quả thực tế: lỗi thiếu đối số chỉ lộ ra khi code chạy tới chỗ dùng biến `undefined`, thường ở dạng `TypeError: Cannot read properties of undefined` — xa nguyên nhân gốc. Vì vậy nên:

- Đặt **default parameter** cho các tham số tùy chọn.
- **Validate** tường minh các tham số bắt buộc, hoặc dùng TypeScript để bắt lỗi từ lúc compile.

Tính "khoan dung" này cũng chính là thứ cho phép `[1,2,3].map(x => x * 2)` hoạt động, dù `map` truyền tới 3 đối số cho callback.

</details>

**2. Default parameter chỉ apply trong trường hợp nào? Đoán output với `function test(x = 10)` khi gọi `test()`, `test(undefined)`, `test(null)`, `test(0)`, `test("")`.**

<details className="qa">
<summary>Xem đáp án</summary>

Default parameter **chỉ apply khi đối số đúng bằng `undefined`** — tức không truyền gì, hoặc truyền tường minh `undefined`. Mọi giá trị falsy khác vẫn được giữ nguyên.

```js
function test(x = 10) { console.log(x); }

test();          // 10   — không truyền → undefined → apply default
test(undefined); // 10   — truyền undefined → apply default
test(null);      // null — null KHÔNG trigger default
test(0);         // 0
test("");        // ""   (chuỗi rỗng)
test(false);     // false
```

Đây là điểm ưu việt so với kiểu cũ `x = x || 10`, vốn nuốt oan cả `0`, `""` và `false`.

Nhưng cũng là pitfall hay gặp khi làm việc với API: nhiều backend trả `null` cho field "không có giá trị", và default sẽ không đỡ được. Muốn xử lý cả `null`, dùng `??` bên trong hàm:

```js
function test(x) {
  const value = x ?? 10;   // cả null lẫn undefined đều thành 10
}
```

Ghi nhớ ngắn gọn: **default parameter và destructuring default chỉ bắt `undefined`; `??` bắt cả `null` lẫn `undefined`**.

</details>

**3. Default parameter được đánh giá một lần lúc định nghĩa hàm hay mỗi lần gọi? Chứng minh bằng `function push(item, arr = [])`.**

<details className="qa">
<summary>Xem đáp án</summary>

Default parameter được đánh giá **mỗi lần gọi hàm**, và chỉ khi đối số tương ứng là `undefined`. Nó là một **biểu thức**, không phải giá trị chốt sẵn lúc định nghĩa.

```js
function push(item, arr = []) {
  arr.push(item);
  return arr;
}

push(1);   // [1]
push(2);   // [2]  — mảng MỚI mỗi lần, không phải [1, 2]
```

Mỗi lần gọi mà không truyền `arr`, biểu thức `[]` chạy lại và tạo ra một mảng hoàn toàn mới. Đây là điểm JS làm **đúng hơn Python**: trong Python, `def push(item, arr=[])` đánh giá default **một lần duy nhất** lúc định nghĩa, nên mảng bị dùng chung giữa các lời gọi — một cái bẫy kinh điển.

Hệ quả khác của việc đánh giá lúc gọi: default có thể là bất kỳ biểu thức nào, kể cả lời gọi hàm, và nó chạy **lười** (chỉ khi cần):

```js
function log(msg, time = new Date()) { }   // mỗi lần gọi là một mốc thời gian mới
function f(id = generateId()) { }          // generateId() chỉ chạy khi không truyền id
```

</details>

**4. Default của một parameter có tham chiếu được parameter khác không? `function f(a = b, b = 2)` chạy được không, vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có**, nhưng chỉ tham chiếu được các parameter **đứng trước** nó. Lý do: các parameter được khởi tạo **lần lượt từ trái sang phải**, parameter chưa tới lượt vẫn đang trong **Temporal Dead Zone (TDZ)**.

```js
function range(start, end = start + 10) { }   // OK — end nhìn thấy start
range(5);   // end = 15

function f(a = b, b = 2) { }
f();        // ReferenceError: Cannot access 'b' before initialization
f(1);       // OK! — a được truyền nên default không chạy, b khởi tạo bình thường
```

Điểm thú vị: `f(1)` **chạy được**, vì khi có đối số cho `a` thì biểu thức default `b` không hề được đánh giá. Nghĩa là lỗi ở đây là **lỗi runtime có điều kiện**, không phải lỗi cú pháp — càng nguy hiểm vì có thể lọt qua test.

Default cũng nhìn thấy được biến ở scope ngoài, và có thể gọi hàm khác:

```js
function f(a, b = a * 2, c = a + b) { }   // hợp lệ, phụ thuộc theo thứ tự
```

Quy tắc thực hành: xếp các parameter có default phụ thuộc **sau** parameter mà chúng phụ thuộc vào, và tránh chuỗi phụ thuộc quá dài vì rất khó đọc.

</details>

**5. So sánh `rest parameter` với `arguments` object: kiểu dữ liệu, method khả dụng, hoạt động trong arrow function.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `...rest` | `arguments` |
|---|---|---|
| Kiểu dữ liệu | **Array thật** | Array-like (có `length` và index, không phải Array) |
| Method của Array | Đầy đủ (`map`, `filter`, `reduce`, `sort`...) | Không có — phải convert trước |
| Arrow function | **Dùng được** | **Không có** — arrow kế thừa `arguments` của hàm bao ngoài |
| Nội dung | Chỉ các đối số **còn lại** sau parameter thường | **Tất cả** đối số truyền vào |
| Đặt tên | Tự đặt, ý nghĩa rõ ràng | Tên cố định, khó đọc |
| Tối ưu hóa | Engine tối ưu tốt | Từng là "optimization killer" |

```js
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);   // dùng thẳng reduce
}

function oldSum() {
  return Array.prototype.slice.call(arguments).reduce((a, b) => a + b, 0);
}

const arrow = (...args) => args.length;   // OK
const bad = () => arguments.length;       // lỗi hoặc lấy nhầm của hàm ngoài
```

Kết luận: `arguments` là di sản thời ES5, chỉ nên biết để đọc code cũ. Code mới **luôn dùng rest parameter** — rõ nghĩa hơn, có đủ method, và hoạt động nhất quán với arrow function.

</details>

**6. Rest parameter phải đặt ở vị trí nào? Một hàm có được khai báo nhiều rest parameter không?**

<details className="qa">
<summary>Xem đáp án</summary>

Rest parameter **bắt buộc phải là parameter cuối cùng**, và mỗi hàm chỉ được có **đúng một** rest parameter. Vi phạm là `SyntaxError` — phát hiện ngay lúc parse, trước khi code chạy.

```js
function log(level, ...messages) { }      // OK
function bad(...a, b) { }                 // SyntaxError: Rest parameter must be last
function bad2(...a, ...b) { }             // SyntaxError
function bad3(...rest,) { }               // SyntaxError — không cho dấu phẩy sau rest
```

Lý do rất trực quan: rest nghĩa là "gom **tất cả phần còn lại**". Nếu cho phép có parameter đứng sau, engine sẽ không có cách nào xác định rest nên dừng ở đâu — cú pháp trở nên mơ hồ. Cũng vì vậy hai rest cùng lúc là vô nghĩa.

Lưu ý thêm:

- Rest parameter **không được có giá trị default**: `function f(...args = [])` là `SyntaxError`. Không cần thiết, vì khi không truyền gì nó đã tự là mảng rỗng `[]`.
- Rest **không tính** vào `function.length`: `function c(x, ...r) {}` có `c.length === 1`.
- Quy tắc tương tự cũng áp dụng cho rest trong destructuring: `const [a, ...rest] = arr` — `rest` phải đứng cuối.

</details>

**7. Phân biệt `...` ở chỗ khai báo hàm (`rest`) và ở chỗ gọi hàm (`spread`). Đoán kết quả khi gọi `f(...arr)` với `function f(a, b)`.**

<details className="qa">
<summary>Xem đáp án</summary>

Cùng ký hiệu `...` nhưng **ngược chiều nhau**, phân biệt bằng **ngữ cảnh xuất hiện**:

- **Rest** — ở **danh sách parameter** khi khai báo hàm: **gom** nhiều đối số rời thành một mảng.
- **Spread** — ở **danh sách đối số** khi gọi hàm (hoặc trong array/object literal): **trải** một mảng ra thành các đối số rời.

```js
function f(a, b) { console.log(a, b); }

const arr = [1, 2, 3];
f(...arr);        // 1 2  — trải thành f(1, 2, 3), đối số thứ ba bị bỏ qua

const short = [1];
f(...short);      // 1 undefined — thiếu thì b là undefined

function g(...args) { }   // rest: g(1,2,3) → args = [1, 2, 3]
```

Với `f(...arr)` và `arr = [1, 2, 3]`: spread biến lời gọi thành `f(1, 2, 3)`, nên `a = 1`, `b = 2`, còn `3` **bị bỏ qua** vì hàm chỉ khai báo hai parameter (nó vẫn nằm trong `arguments`).

Mẹo nhớ: nhìn `...` nằm ở **nơi nhận** (khai báo parameter, vế trái destructuring) thì là **rest**; nằm ở **nơi cho** (đối số lời gọi, literal) thì là **spread**.

</details>

**8. `arguments` là array hay array-like? Có mấy cách chuyển nó thành mảng thật?**

<details className="qa">
<summary>Xem đáp án</summary>

`arguments` là **array-like**, không phải Array. Nó có `length` và truy cập được bằng index, nhưng prototype của nó là `Object.prototype` chứ không phải `Array.prototype` — nên không có `map`, `filter`, `reduce`, `slice`...

```js
function f() {
  Array.isArray(arguments);      // false
  arguments.map;                 // undefined
  typeof arguments;              // "object"
}
```

Các cách chuyển thành mảng thật:

```js
function f() {
  const a1 = [...arguments];                        // spread (ES6) — gọn nhất
  const a2 = Array.from(arguments);                 // ES6, hỗ trợ mapFn
  const a3 = Array.prototype.slice.call(arguments); // kiểu cũ ES5
  const a4 = [].slice.call(arguments);              // biến thể ngắn của a3
}
```

Hai cách ES6 dùng được vì `arguments` là **iterable** (có `Symbol.iterator`); `Array.from` thì chỉ cần array-like nên còn tổng quát hơn.

Tuy nhiên, trong code hiện đại **tốt nhất là không dùng `arguments`**: chỉ cần khai báo `function f(...args)` là có ngay mảng thật, không tốn bước convert, lại đặt tên được và chạy trong arrow function.

</details>

**9. `arguments` có "liên kết" với parameter không (sửa `arguments[0]` thì parameter đổi theo)? Điều đó thay đổi thế nào trong `strict mode` hoặc khi hàm có default/rest?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong **sloppy mode** và khi hàm có **danh sách parameter đơn giản** (không default, rest hay destructuring), `arguments` là **mapped** — liên kết hai chiều với parameter:

```js
function f(x) {
  arguments[0] = 99;
  console.log(x);      // 99 — parameter đổi theo!
  x = 5;
  console.log(arguments[0]);  // 5 — và ngược lại
}
f(1);
```

Liên kết này **biến mất (unmapped)** trong các trường hợp:

- Hàm ở **strict mode** (`"use strict"`, thân class, ES module).
- Hàm có **default parameter**, **rest parameter**, hoặc **destructuring parameter** — kể cả khi không ở strict mode.

```js
function g(x = 0) {
  "use strict";
  arguments[0] = 99;
  console.log(x);     // 1 — KHÔNG đổi, arguments chỉ là bản chụp
}
g(1);
```

Đây là nguồn bug rất khó lần vì hành vi thay đổi âm thầm chỉ vì bạn thêm một default parameter. Spec loại bỏ mapping cũng vì nó gây khó cho engine khi tối ưu.

Lời khuyên: **đừng bao giờ ghi vào `arguments`**, và tốt nhất là dùng rest parameter để tránh toàn bộ vấn đề này.

</details>

**10. `function.length` đếm cái gì? Đoán output cho `function a(x, y) {}`, `function b(x, y = 1) {}`, `function c(x, ...r) {}`, `function d({ x } = {}) {}`.**

<details className="qa">
<summary>Xem đáp án</summary>

`function.length` đếm số parameter **trước parameter đầu tiên có default hoặc rest** — nói cách khác là số đối số "bắt buộc" theo cách hiểu của engine. Rest parameter và mọi parameter từ cái có default trở đi đều **không được tính**.

```js
function a(x, y) {}            a.length;  // 2
function b(x, y = 1) {}        b.length;  // 1 — y có default
function c(x, ...r) {}         c.length;  // 1 — rest không tính
function d({ x } = {}) {}      d.length;  // 0 — parameter duy nhất có default
```

Vài trường hợp đáng chú ý:

```js
function e({ x, y }) {}        e.length;  // 1 — destructuring không default vẫn tính là 1
function h(x = 1, y) {}        h.length;  // 0 — dừng đếm ngay tại x
```

Ví dụ `h` cho thấy `length` **dừng đếm** tại parameter có default đầu tiên, dù sau nó còn parameter thường.

`length` là thuộc tính **non-writable nhưng configurable**, nên có thể chỉnh bằng `Object.defineProperty` — các thư viện currying thỉnh thoảng làm vậy để giữ đúng arity. Ứng dụng thực tế phổ biến nhất là để framework tự dò "chữ ký" hàm, ví dụ Express phân biệt error middleware.

</details>

**11. Express phân biệt error middleware với middleware thường bằng cách nào, và điều đó liên quan gì tới `function.length`?**

<details className="qa">
<summary>Xem đáp án</summary>

Express dựa vào **`fn.length`** — số parameter khai báo của hàm middleware:

```js
function normal(req, res, next) {}           // length = 3 → middleware thường
function errorHandler(err, req, res, next) {} // length = 4 → error handler
```

Khi có lỗi (một middleware gọi `next(err)` hoặc throw đồng bộ), Express **bỏ qua** mọi middleware có `length` khác 4 và nhảy thẳng tới handler bốn tham số gần nhất trong chuỗi.

Hệ quả rất quan trọng trong thực tế:

- **Thứ tự parameter là cố định** — không thể đảo, không thể bỏ bớt. Viết `function errorHandler(err, req, res)` (3 tham số) sẽ khiến Express hiểu nhầm đó là middleware thường và **không bao giờ gọi** nó khi có lỗi.
- **Không được bỏ `next`** dù không dùng tới. Nhiều linter cảnh báo biến không dùng, nhưng ở đây phải giữ lại — thường thêm comment hoặc cấu hình linter bỏ qua.
- Error handler phải được `app.use` **sau cùng**, sau mọi route.

Lưu ý bổ sung: Express 4 **không tự bắt** rejection từ handler `async` (vì throw xảy ra ở microtask sau), cần `express-async-errors` hoặc wrapper; Express 5 đã xử lý sẵn.

</details>

**12. Destructuring parameter là gì? Vì sao `function f({ a, b } = {})` cần `= {}` ở cuối — bỏ đi thì gọi `f()` gặp lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Destructuring parameter** là việc tách thẳng property (hoặc phần tử mảng) ngay tại danh sách tham số, thay vì nhận cả object rồi gỡ từng cái trong thân hàm:

```js
function createUser({ name, age }) {   // dùng name, age trực tiếp
  // ...
}
createUser({ name: "An", age: 25 });
```

Phần `= {}` là **default cho chính object tham số**. Khi gọi `f()` mà không truyền gì, tham số là `undefined`; destructuring thực chất là phép truy cập property, mà đọc property của `undefined` thì ném lỗi:

```js
function f({ a, b }) { }
f();   // TypeError: Cannot destructure property 'a' of 'undefined'

function g({ a, b } = {}) { }
g();   // OK — a, b đều là undefined
```

Vì vậy quy tắc: **hễ mọi property đều optional thì luôn thêm `= {}`**, để hàm gọi được mà không cần đối số. Ngược lại, nếu object là bắt buộc, việc **không** đặt `= {}` lại là cố ý — nó buộc người gọi phải truyền vào và "fail fast" ngay.

Kết hợp cả hai tầng default là pattern chuẩn cho hàm cấu hình:

```js
function setup({ timeout = 3000, retries = 3 } = {}) { }
setup();                    // timeout 3000, retries 3
setup({ timeout: 5000 });   // retries vẫn 3
```

</details>

**13. Với `function f({ a = 1 } = {})`, gọi `f({ a: null })` thì `a` bằng bao nhiêu? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

`a` bằng **`null`**, không phải `1`.

```js
function f({ a = 1 } = {}) { console.log(a); }

f();                // 1    — không truyền → dùng {} → a thiếu → undefined → default
f({});              // 1    — a thiếu → undefined → default
f({ a: undefined }); // 1    — undefined → default
f({ a: null });      // null — KHÔNG apply default
f({ a: 0 });         // 0
```

Lý do: giá trị mặc định trong destructuring (cũng như default parameter) chỉ kích hoạt khi giá trị **đúng bằng `undefined`**. `null` là một giá trị hợp lệ, mang ý nghĩa "cố tình rỗng", nên JS tôn trọng và giữ nguyên.

Đây là bẫy rất hay gặp khi nhận dữ liệu từ API — backend (nhất là SQL) thường trả `null` cho field trống:

```js
function Avatar({ src = "/default.png" } = {}) { }
Avatar({ src: null });   // src = null → ảnh vỡ
```

Cách xử lý an toàn là thêm một lớp `??` bên trong hàm, vì `??` bắt cả `null` lẫn `undefined`:

```js
function f({ a } = {}) {
  const value = a ?? 1;   // null cũng thành 1
}
```

</details>

**14. JavaScript có `named arguments` như Python không? Pattern thay thế là gì, và bạn dựa vào tiêu chí nào để chuyển từ positional sang object parameter?**

<details className="qa">
<summary>Xem đáp án</summary>

JS **không có** named arguments kiểu `fn(name="x")` như Python. Pattern thay thế tiêu chuẩn là **truyền một object rồi destructure tại tham số**:

```js
// Không tốt — thứ tự dễ nhớ sai, call site khó đọc
function createButton(text, color, size, disabled, onClick) {}
createButton("Save", "blue", "lg", false, handleClick);

// Tốt — "named arguments" qua object
function createButton({ text, color, size, disabled, onClick } = {}) {}
createButton({ text: "Save", color: "blue", size: "lg", disabled: false });
```

Lợi ích: không phụ thuộc thứ tự, bỏ qua tùy ý các tham số optional (không cần nhồi `undefined` vào giữa), đọc call site là hiểu ngay ý nghĩa từng giá trị, và thêm tham số mới mà không phá vỡ code cũ.

Tiêu chí chuyển đổi:

- Hàm có **≤ 2 parameter** → giữ positional, ngắn gọn (`add(a, b)`).
- Hàm có **≥ 3 parameter**, hoặc nhiều tham số **optional** → dùng object.
- Có **boolean parameter** → **luôn** dùng object, vì `fn(true)` ở call site không nói lên điều gì.
- Nhiều tham số **cùng kiểu** liền nhau (dễ hoán vị nhầm) → dùng object.

Đánh đổi: object parameter tạo thêm một object mỗi lần gọi và viết dài hơn chút — không đáng kể so với lợi ích về tính rõ ràng.

</details>

**15. Vì sao boolean parameter kiểu `slice(arr, 0, 5, true)` bị coi là code smell? Cách viết tốt hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề nằm ở **call site**: đọc `slice(arr, 0, 5, true)` không ai biết `true` nghĩa là gì — phải mở định nghĩa hàm ra tra. Người ta gọi đây là **boolean trap**.

Các tác hại kèm theo:

- Nếu có **hai boolean** liền nhau (`fn(true, false)`) thì gần như chắc chắn sẽ có lúc truyền nhầm thứ tự, mà vẫn chạy không báo lỗi.
- Một cờ boolean thường báo hiệu hàm đang làm **hai việc khác nhau** — vi phạm nguyên tắc mỗi hàm một nhiệm vụ.
- Thêm tùy chọn thứ ba (không còn đúng/sai) sẽ phải phá vỡ chữ ký hàm.

Cách viết tốt hơn — đặt tên cho cờ bằng object:

```js
// Tệ
slice(arr, 0, 5, true);

// Tốt
slice(arr, 0, 5, { inPlace: true });
```

Hai lựa chọn thay thế khác:

- **Tách thành hai hàm** có tên rõ ràng: `slice()` và `sliceInPlace()` — thường là giải pháp sạch nhất khi cờ làm đổi hẳn hành vi.
- Dùng **enum/hằng chuỗi** khi tương lai có thể có nhiều hơn hai trạng thái: `sort(arr, { order: "desc" })` thay vì `sort(arr, true)`.

</details>

**16. JavaScript truyền tham số theo `pass by value` hay `pass by reference`? Sửa property của object tham số bên trong hàm có ảnh hưởng ra ngoài không, còn gán lại cả object thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

JavaScript **luôn luôn là pass by value**. Điểm gây nhầm lẫn: với object, cái "value" được sao chép chính là **tham chiếu** tới object đó. Cách gọi chính xác hơn là **pass by sharing** — hàm nhận một bản sao của tham chiếu, cùng trỏ tới một object duy nhất.

Hệ quả:

```js
function mutate(obj) {
  obj.name = "B";       // SỬA object chung → ảnh hưởng ra ngoài
}
function reassign(obj) {
  obj = { name: "C" };  // gán lại BIẾN cục bộ → KHÔNG ảnh hưởng ra ngoài
}

const user = { name: "A" };
mutate(user);    user.name;  // "B"
reassign(user);  user.name;  // "B" — vẫn thế
```

Giải thích: `obj.name = "B"` đi **qua** tham chiếu để chạm vào object gốc. Còn `obj = {...}` chỉ trỏ **biến cục bộ** `obj` sang một object mới, biến `user` bên ngoài vẫn trỏ về chỗ cũ.

Với primitive (number, string, boolean...) thì không có gì để nhầm — hàm nhận bản sao giá trị, mọi thay đổi đều cục bộ.

Thực hành: hàm nên **tránh mutate** tham số object vì đó là side effect ẩn. Tạo bản mới bằng `{ ...obj, name: "B" }` rồi trả về — an toàn hơn và hợp với các framework dùng so sánh tham chiếu như React.

</details>

**17. Danh sách parameter có tạo scope riêng tách khỏi thân hàm không? Điều gì xảy ra khi default parameter tham chiếu một biến `let` khai báo trong thân hàm?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có** — khi hàm có danh sách parameter **không đơn giản** (có default, rest hoặc destructuring), engine tạo một **scope riêng cho parameter**, bao ngoài scope của thân hàm. Biểu thức default chỉ nhìn thấy các parameter trước nó và các biến ở **scope ngoài hàm**, **không nhìn thấy** biến khai báo trong thân hàm.

Nếu default tham chiếu một biến chỉ tồn tại trong thân hàm, sẽ có `ReferenceError`:

```js
function g(a = y) {
  let y = 1;
  return a;
}
g();   // ReferenceError: y is not defined
```

Nếu tên đó cũng tồn tại ở scope ngoài, default lấy **biến ngoài**, còn thân hàm lại dùng biến trong — hai giá trị khác nhau cho cùng một tên:

```js
let x = "outer";
function f(a = x) {
  let x = "inner";
  return [a, x];
}
f();   // ["outer", "inner"]
```

Một hệ quả nữa: khi parameter list không đơn giản, **không được đặt `"use strict"`** trong thân hàm (`SyntaxError`), và `arguments` trở thành unmapped.

Lời khuyên: đừng đặt tên biến trong thân hàm trùng với parameter, và giữ biểu thức default đơn giản — chỉ dựa vào parameter trước đó hoặc hằng số.

</details>

---

## 2. Arrow Functions và IIFE

Bài học: [2. Arrow Functions và IIFE](../../javascript/10-functions/2_function-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Liệt kê các cách khai báo hàm trong JavaScript (`function declaration`, `function expression`, `arrow function`, method shorthand). Chúng khác nhau thế nào về hoisting?**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn cách chính:

| Cách viết | Ví dụ | Hoisting |
|---|---|---|
| Function declaration | `function f() {}` | Được hoist **cả thân hàm** — gọi trước khi khai báo vẫn chạy |
| Function expression | `const f = function () {}` | Chỉ hoist biến; `const`/`let` nằm trong TDZ → gọi trước là `ReferenceError` |
| Arrow function | `const f = () => {}` | Giống function expression — không hoist thân hàm |
| Method shorthand | `{ f() {} }` / method trong `class` | Là property của object/prototype, chỉ tồn tại sau khi object (hoặc class) được tạo |

```js
sayHi();            // "hi" — declaration được hoist đầy đủ
function sayHi() { console.log("hi"); }

sayBye();           // ReferenceError — TDZ
const sayBye = () => console.log("bye");
```

Ngoài ra method shorthand và arrow không có tên ràng buộc bên trong để tự đệ quy như named function expression, và method shorthand cho phép dùng `super`.

</details>

**2. Arrow function khác function thường ở những điểm nào? Kể ít nhất bốn điểm: `this`, `arguments`, `new`, `prototype`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Arrow | Function thường |
|---|---|---|
| `this` | **Lexical** — lấy từ scope nơi định nghĩa | Tùy cách gọi |
| `arguments` | Không có object `arguments` riêng | Có |
| `new` | Không dùng được (`TypeError`) | Dùng được |
| `prototype` | Không có property `prototype` | Có |
| Hoisting | Không (gán vào `const`/`let`) | Function declaration được hoist |
| `super` / `new.target` | Lexical, lấy từ ngoài | Riêng cho từng hàm |

Vì bốn điểm đầu, arrow thích hợp làm **callback ngắn** (`map`, `filter`, `.then`, `setTimeout`) nơi ta muốn giữ `this` của scope ngoài, nhưng **không** thích hợp làm method của object, prototype method, constructor hay event handler cần `this` là element.

</details>

**3. "Arrow function không có `this` riêng" nghĩa là gì? `this` bên trong arrow được quyết định lúc định nghĩa hay lúc gọi?**

<details className="qa">
<summary>Xem đáp án</summary>

Nghĩa là engine **không tạo binding `this` mới** khi gọi arrow function. Khi code bên trong arrow đọc `this`, nó được giải quyết như một biến thường: đi ngược scope chain ra hàm bao ngoài gần nhất có `this` riêng, và lấy giá trị ở đó. Vì scope chain được xác định **lúc định nghĩa**, nên `this` của arrow là **lexical** — chốt ở nơi viết code, không phụ thuộc cách gọi.

```js
class Timer {
  count = 0;
  start() {
    setInterval(() => {
      this.count++; // this = instance Timer, lấy từ start()
    }, 1000);
  }
}
```

Hệ quả: `call`, `apply`, `bind` hay gọi qua object đều **không đổi được** `this` của arrow. Đây vừa là ưu điểm (khỏi cần `var self = this` hay `.bind(this)`), vừa là nhược điểm khi ta thực sự cần `this` động.

</details>

**4. `this` trong function thường được xác định theo những quy tắc nào (gọi độc lập, gọi qua object, `new`, `call`/`apply`/`bind`)? Thứ tự ưu tiên ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự ưu tiên từ cao xuống thấp:

1. **`new Fn()`** — `this` là object mới vừa tạo. Ràng buộc mạnh nhất, kể cả hàm đã `bind` thì `new` vẫn thắng.
2. **Explicit binding** — `fn.call(ctx)`, `fn.apply(ctx)`, `fn.bind(ctx)`: `this` là `ctx`.
3. **Implicit binding** — `obj.fn()`: `this` là `obj` (object ngay trước dấu chấm).
4. **Default binding** — `fn()` gọi độc lập: `this` là `undefined` ở strict mode/ES Module, là `globalThis` (`window`) ở sloppy mode.

```js
const user = { name: "An", greet() { console.log(this.name); } };
user.greet();          // "An"  — implicit
const f = user.greet;
f();                   // undefined / lỗi — default binding, mất ngữ cảnh
f.call(user);          // "An"  — explicit
```

Điểm hay bị hỏi: mất ngữ cảnh khi truyền method làm callback (`setTimeout(user.greet, 0)`) — cách chữa là `.bind(user)` hoặc bọc trong arrow.

</details>

**5. `call`, `apply`, `bind` khác nhau chỗ nào? Gọi `.bind(obj)` lên một arrow function có đổi được `this` không, vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| Method | Gọi hàm ngay? | Truyền tham số |
|---|---|---|
| `fn.call(ctx, a, b)` | Có | Liệt kê rời từng tham số |
| `fn.apply(ctx, [a, b])` | Có | Truyền bằng mảng |
| `fn.bind(ctx, a)` | Không — trả về **hàm mới** đã gắn `this` | Cho phép áp dụng trước một phần (partial application) |

```js
function greet(greeting) { return `${greeting}, ${this.name}`; }
const user = { name: "An" };

greet.call(user, "Chào");      // "Chào, An"
greet.apply(user, ["Chào"]);   // "Chào, An"
const bound = greet.bind(user);
bound("Chào");                 // "Chào, An"
```

**Với arrow function thì không.** `bind` chỉ gắn `this` cho hàm có binding `this` riêng; arrow không có nên giá trị `ctx` bị bỏ qua, `this` vẫn lấy theo lexical scope. Gọi không lỗi, chỉ là vô tác dụng — `bind` vẫn dùng được để cố định tham số. Điều này cũng đúng với `call`/`apply`.

</details>

**6. Đoán output: object literal có `greet: () => console.log(this.name)` khi gọi `user.greet()`. Giải thích, rồi sửa lại cho đúng.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
const user = {
  name: "An",
  greet: () => console.log(this.name),
};
user.greet();
```

Kết quả **không phải** `"An"`. Object literal **không tạo scope** cho `this`, nên arrow lấy `this` của scope bao ngoài nơi nó được định nghĩa — tức top-level. Trong script thường ở trình duyệt, `this` là `window` và `window.name` là chuỗi rỗng nên in ra dòng trống; trong ES Module (hoặc strict/Node module) `this` là `undefined` → ném `TypeError: Cannot read properties of undefined`.

Sửa bằng method shorthand (hoặc function expression) để hàm có `this` riêng, xác định theo cách gọi:

```js
const user2 = {
  name: "An",
  greet() { console.log(this.name); },
};
user2.greet(); // "An"
```

Bài học: đừng dùng arrow làm method khi cần `this` trỏ về chính object.

</details>

**7. Vì sao `new (() => {})` ném `TypeError`? Arrow function thiếu những gì để làm constructor?**

<details className="qa">
<summary>Xem đáp án</summary>

Toán tử `new` cần hàm có internal method `[[Construct]]`. Arrow function chỉ có `[[Call]]`, nên engine báo ngay `TypeError: ... is not a constructor`.

Cụ thể arrow thiếu ba thứ cần cho vai trò constructor:

- **Không có `[[Construct]]`** — không thể bị gọi bằng `new`.
- **Không có property `prototype`** — `new` cần `Fn.prototype` để làm `[[Prototype]]` cho instance mới; arrow không có object này.
- **Không có binding `this` riêng** — `new` phải tạo object mới rồi gắn vào `this` bên trong hàm, nhưng arrow lấy `this` lexical nên không có chỗ để gắn.

```js
const Person = (name) => { this.name = name; };
new Person("An"); // TypeError: Person is not a constructor
```

Muốn tạo object thì dùng `class`, function declaration/expression, hoặc factory function trả về object literal.

</details>

**8. Trong class, so sánh `handleClick() {}` (prototype method) với `handleClick = () => {}` (class field arrow): khác nhau về `this`, về bộ nhớ khi tạo nhiều instance, và về khả năng override/spy khi viết test.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Prototype method | Class field arrow |
|---|---|---|
| Nơi lưu | `Class.prototype` — dùng chung | Property riêng của từng instance |
| `this` | Theo cách gọi; mất ngữ cảnh khi truyền làm callback | Lexical, luôn là instance — auto-bind |
| Bộ nhớ | Một bản duy nhất cho mọi instance | Tạo một closure mới cho **mỗi** instance |
| Kế thừa / `super` | Lớp con override được, gọi được `super.method()` | Field của lớp con **ghi đè** field lớp cha; không dùng `super` như method |
| Test / spy | Spy trên `Class.prototype.method` áp dụng cho mọi instance, kể cả instance tạo sau | Phải spy trên **từng instance** sau khi khởi tạo |

```js
class A {
  onClick() { console.log(this); }      // mất this nếu truyền trực tiếp
  onClickAuto = () => console.log(this); // luôn đúng this
}
```

Đánh đổi: field arrow tiện và an toàn `this`, nhưng tốn bộ nhớ hơn và khó mock/override hơn. Với component tạo nhiều instance, ưu tiên prototype method kèm `.bind` trong constructor.

</details>

**9. Trước ES6, người ta giữ `this` trong callback bằng những cách nào (`var self = this`, `.bind(this)`, tham số `thisArg` của `forEach`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba cách phổ biến:

```js
function Timer() {
  this.count = 0;

  // 1. Biến trung gian — self / that / _this
  var self = this;
  setInterval(function () { self.count++; }, 1000);

  // 2. .bind(this) — tạo hàm mới đã gắn this
  setInterval(function () { this.count++; }.bind(this), 1000);

  // 3. thisArg — tham số thứ hai của forEach/map/filter/some...
  [1, 2].forEach(function (n) { this.count += n; }, this);
}
```

Nhược điểm chung: rườm rà, dễ quên (quên `.bind` là sinh bug `this is undefined`), và `thisArg` chỉ có ở một số method mảng chứ không phải mọi API nhận callback. Đây chính là động lực ES6 đưa ra arrow function với lexical `this` — cả ba cách trên gọn lại thành `setInterval(() => { this.count++; }, 1000)`.

</details>

**10. Với `addEventListener`, `this` bên trong handler là gì khi dùng function thường và khi dùng arrow function? Khi nào sự khác biệt này gây bug?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Function thường**: DOM gọi handler với `this` là **element đang gắn listener** (`currentTarget`).
- **Arrow function**: không có `this` riêng nên lấy lexical — là `this` của scope bao ngoài (`window`/`undefined` ở top-level, hoặc instance nếu viết trong class field).

```js
button.addEventListener("click", function () {
  console.log(this); // <button>
});

button.addEventListener("click", () => {
  console.log(this); // window / undefined / instance — KHÔNG phải button
});
```

Bug hay gặp theo hai chiều: viết arrow rồi dùng `this.classList.toggle(...)` tưởng `this` là element → lỗi; hoặc trong class dùng function thường làm handler rồi gọi `this.setState(...)` → `this` lại là element chứ không phải instance. Cách an toàn: luôn dùng `event.currentTarget` để lấy element, và dùng arrow (hoặc `bind`) khi cần `this` là instance của class.

</details>

**11. Arrow function có `arguments` không? Nếu viết `arguments` bên trong một arrow thì nó tham chiếu tới đâu, và thay thế bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Arrow **không có** object `arguments` riêng. Cũng giống `this`, `arguments` được tra theo scope chain: nó trỏ tới `arguments` của **function thường bao ngoài gần nhất**; nếu không có hàm nào bao ngoài thì `ReferenceError: arguments is not defined`.

```js
function outer() {
  const inner = () => arguments[0];
  return inner();
}
outer("a", "b"); // "a" — arguments của outer, không phải của inner

const f = () => arguments; // ReferenceError khi gọi ở top-level module
```

Thay thế bằng **rest parameters** — vừa rõ ràng vừa là mảng thật:

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
sum(1, 2, 3); // 6
```

Rest params tốt hơn `arguments` cả với function thường: `arguments` chỉ là array-like, phải `Array.from` mới dùng được method mảng.

</details>

**12. Cú pháp arrow: khi nào bỏ được `()` quanh tham số, khi nào bỏ được `{}` và `return`? Vì sao `x => { name: x }` không trả về object như bạn tưởng?**

<details className="qa">
<summary>Xem đáp án</summary>

- Bỏ được `()` khi có **đúng một tham số** và tham số đó không có giá trị mặc định, không destructuring, không rest. Không tham số hoặc từ hai trở lên thì bắt buộc giữ `()`.
- Bỏ được `{}` và `return` khi thân hàm là **một biểu thức duy nhất** (concise body) — giá trị biểu thức chính là giá trị trả về.

```js
const double = x => x * 2;          // OK
const random = () => Math.random(); // không tham số -> cần ()
const add = (a, b) => a + b;        // hai tham số -> cần ()
```

Với `x => { name: x }`, dấu `{` ngay sau `=>` được parser hiểu là **mở block statement**, không phải object literal. Bên trong, `name:` trở thành một **label** và `x` là biểu thức vô nghĩa; hàm không có `return` nên trả về `undefined`. Muốn trả object thì bọc trong ngoặc đơn để ép thành biểu thức:

```js
const make = x => ({ name: x });
make("An"); // { name: "An" }
```

</details>

**13. Arrow function có được hoisted không? Đoán output khi gọi hàm ở dòng phía trên khai báo `const fn = () => {}`.**

<details className="qa">
<summary>Xem đáp án</summary>

Arrow luôn là một **expression** gán vào biến, nên nó theo luật hoisting của biến chứ không phải của function declaration. Với `const`/`let`, biến được hoist lên đầu block nhưng nằm trong **TDZ (Temporal Dead Zone)** cho tới dòng khai báo.

```js
fn();                       // ReferenceError: Cannot access 'fn' before initialization
const fn = () => "hello";
```

Nếu dùng `var` thì không phải TDZ mà là `TypeError`, vì `fn` đã tồn tại với giá trị `undefined`:

```js
fn();                 // TypeError: fn is not a function
var fn = () => "hi";
```

So sánh: function declaration được hoist cả thân hàm nên gọi trước vẫn chạy bình thường. Vì vậy với arrow (và function expression) phải **khai báo trước khi dùng**.

</details>

**14. `IIFE` là gì và vì sao phải bọc function trong `()` thì mới gọi ngay được? Nêu vài cách viết IIFE khác nhau.**

<details className="qa">
<summary>Xem đáp án</summary>

**IIFE (Immediately Invoked Function Expression)** là hàm được định nghĩa và gọi ngay lập tức tại chỗ.

Lý do cần ngoặc: khi một câu lệnh **bắt đầu** bằng từ khóa `function`, parser hiểu đó là **function declaration** — mà declaration thì bắt buộc có tên và không thể theo sau bằng `()` để gọi, nên báo `SyntaxError`. Bọc trong `()` (hoặc bất kỳ ngữ cảnh biểu thức nào) buộc parser hiểu đó là **function expression**, khi ấy mới gọi ngay được.

```js
(function () { console.log("A"); })();   // kiểu phổ biến nhất
(function () { console.log("B"); }());   // gọi bên trong ngoặc
(() => { console.log("C"); })();         // arrow IIFE
(async () => { await fetch("/api"); })(); // async IIFE
!function () { console.log("D"); }();     // ép thành biểu thức bằng toán tử
void function () { console.log("E"); }();
```

Arrow IIFE vẫn cần ngoặc để gắn đúng lời gọi vào biểu thức hàm.

</details>

**15. IIFE ra đời để giải quyết vấn đề gì, và vì sao code hiện đại gần như không cần nó nữa?**

<details className="qa">
<summary>Xem đáp án</summary>

Thời ES5 chỉ có `var` (function scope) và chưa có module, nên mọi biến khai báo ở top-level đều rơi vào global, dễ trùng tên giữa các file `<script>`. IIFE giải quyết bằng cách tạo **một scope hàm dùng một lần**:

- **Private scope** — biến bên trong không lọt ra global.
- **Module pattern** — trả về object chỉ phơi ra API công khai, giấu phần còn lại.

```js
var App = (function () {
  var secret = "x";                 // private
  return { get() { return secret; } };
})();
App.get();    // "x"
App.secret;   // undefined
```

Ngày nay không cần nữa vì: `let`/`const` đã có **block scope**; **ES Module** cho mỗi file một scope riêng, chỉ những gì `export` mới ra ngoài; **top-level await** thay được async IIFE. IIFE chỉ còn hữu dụng trong script legacy không phải module, trong output của bundler (UMD), và để khởi tạo một hằng số phức tạp gọn trong một biểu thức.

</details>

**16. Vòng lặp `for (var i = 0; i < 3; i++)` kết hợp `setTimeout` in ra kết quả sai — IIFE khắc phục thế nào, và `let` thay thế được ra sao? Giải thích theo closure.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3, 3, 3
```

`var` có function scope nên cả ba callback cùng **closure lên một biến `i` duy nhất**. Callback chỉ chạy sau khi vòng lặp kết thúc, lúc đó `i` đã là `3`.

Cách cũ dùng IIFE để tạo một scope mới mỗi vòng, **chụp lại giá trị** `i` vào tham số riêng:

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// 0, 1, 2
```

Cách hiện đại chỉ cần đổi `var` thành `let`: mỗi lần lặp tạo **một binding `i` mới** trong block scope, nên mỗi closure giữ một bản riêng.

```js
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0, 1, 2
```

</details>

**17. `async IIFE` dùng khi nào? `top-level await` thay được nó trong hoàn cảnh nào và không thay được khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`async IIFE` sinh ra để dùng `await` ở nơi không cho phép — trước đây `await` chỉ hợp lệ bên trong hàm `async`, nên muốn chạy code bất đồng bộ ở top-level phải bọc lại:

```js
(async () => {
  const res = await fetch("/api");
  console.log(await res.json());
})();
```

**Top-level await thay được** khi code nằm trong **ES Module** (file `.mjs` hoặc `package.json` có `"type": "module"`, hoặc `<script type="module">`): viết thẳng `const data = await fetch("/api")` ở cấp cao nhất.

**Không thay được khi:**

- Code là **CommonJS** (`require`) hoặc script cổ điển không phải module.
- Cần chạy tác vụ async **không chặn** phần còn lại — top-level await làm module chờ và trì hoãn cả các module import nó, còn async IIFE chạy nền.
- Cần một scope riêng cho `try/catch` hoặc biến tạm, hay muốn chạy nhiều tác vụ song song rồi bỏ qua kết quả.

</details>

**18. Arrow function có dùng làm generator (`function*`) được không? Còn `yield` bên trong arrow thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Cú pháp arrow không hỗ trợ generator — không có dạng `*() => {}` hay `() *=> {}`; viết như vậy là `SyntaxError`. Muốn có generator phải dùng `function*`, hoặc method shorthand `*gen() {}` trong object/class.

```js
// SyntaxError
// const gen = *() => { yield 1; };

function* gen() { yield 1; yield 2; }   // đúng
const obj = { *gen() { yield 1; } };    // đúng — method shorthand
```

Về `yield`: nó chỉ hợp lệ **trực tiếp trong thân một generator**. Arrow không phải generator, nên `yield` bên trong arrow là lỗi cú pháp — kể cả khi arrow đó nằm bên trong một generator:

```js
function* outer() {
  const f = () => yield 1; // SyntaxError
}
```

Điểm chung với `await`: một arrow thường cũng không dùng được `await`, phải viết `async () => { await ... }`. Lý do sâu xa là arrow được thiết kế làm hàm "nhẹ", không có `this`, `arguments`, `new.target` — và cũng không mang trạng thái tạm dừng/tiếp tục của generator.

</details>

---

## 3. Function Internals: arguments, Stack

Bài học: [3. Function Internals: arguments, Stack](../../javascript/10-functions/3_internals.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `arguments` object là gì? Vì sao nó được gọi là `array-like` mà không phải một Array thật?**

<details className="qa">
<summary>Xem đáp án</summary>

`arguments` là object được engine tự tạo bên trong mỗi function thường (không phải arrow), chứa **mọi argument thực sự được truyền vào**, kể cả những argument không có tham số tương ứng trong khai báo.

```js
function show(a) {
  console.log(arguments.length); // 3 — dù chỉ khai báo 1 tham số
  console.log(arguments[2]);     // "c"
}
show("a", "b", "c");
```

Gọi là **array-like** vì nó chỉ có hai đặc điểm giống mảng: các key số (`0`, `1`, `2`...) và property `length`. Nhưng `Object.getPrototypeOf(arguments)` là `Object.prototype` chứ không phải `Array.prototype`, nên nó **không thừa hưởng** bất kỳ method mảng nào (`map`, `filter`, `reduce`, `slice`...), và `Array.isArray(arguments)` trả về `false`. Nó cũng là iterable (spread được) nhưng đó là do có `Symbol.iterator`, không phải vì là mảng.

</details>

**2. Vì sao `arguments.map(...)` hay `arguments.reduce(...)` ném `TypeError`? Có những cách nào chuyển `arguments` thành Array thật?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `arguments` không kế thừa `Array.prototype`, nên `arguments.map` là `undefined` — gọi `undefined(...)` cho `TypeError: arguments.map is not a function`.

Các cách chuyển sang Array thật:

```js
function sum() {
  const a = [...arguments];                       // spread — gọn nhất
  const b = Array.from(arguments);                // rõ ý đồ, nhận thêm mapFn
  const c = Array.prototype.slice.call(arguments); // cách cũ thời ES5
  return a.reduce((x, y) => x + y, 0);
}
sum(1, 2, 3); // 6
```

`Array.from` còn tiện ở chỗ nhận tham số thứ hai để map luôn: `Array.from(arguments, Number)`.

Tuy vậy giải pháp tốt nhất là **không chuyển đổi gì cả** — dùng rest parameter ngay từ đầu:

```js
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0); // nums đã là Array thật
}
```

</details>

**3. So sánh `arguments` với `rest parameter` (`...args`). Vì sao code hiện đại khuyên bỏ hẳn `arguments`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `arguments` | Rest parameter `...args` |
|---|---|---|
| Kiểu | Array-like, không có method mảng | **Array thật** |
| Phạm vi | Chỉ có trong function thường | Dùng được cả trong arrow |
| Nội dung | **Tất cả** argument truyền vào | Chỉ những argument **còn lại** sau các tham số đã khai báo |
| Tên gọi | Cố định, không diễn đạt ý nghĩa | Tự đặt tên có nghĩa (`...nums`, `...handlers`) |
| Tối ưu | Có thể cản trở engine tối ưu, sloppy mode còn liên kết ngược với tham số | Rõ ràng, thân thiện với engine |

```js
function log(prefix, ...rest) {
  console.log(prefix, rest);   // rest là Array, không chứa prefix
}
```

Lý do khuyên bỏ `arguments`: nó không hoạt động trong arrow (kiểu hàm chiếm đa số code hiện đại), phải convert mới dùng được method mảng, và làm signature của hàm trở nên "vô hình" với người đọc lẫn với TypeScript. Rest parameter giải quyết trọn vẹn cả ba điểm.

</details>

**4. Truy cập `arguments` bên trong một arrow function thì điều gì xảy ra? Giải thích lý do.**

<details className="qa">
<summary>Xem đáp án</summary>

Arrow function **không tạo binding `arguments` riêng**. Vì thế `arguments` được tra như một biến thường theo scope chain:

- Nếu arrow nằm **bên trong một function thường**, nó lấy `arguments` của hàm bao ngoài đó.
- Nếu không có hàm thường nào bao ngoài (arrow ở top-level module/strict mode), sẽ ném `ReferenceError: arguments is not defined`.

```js
function outer() {
  const inner = () => arguments[0];
  return inner("x");     // "a" — arguments của outer, không phải của inner
}
outer("a", "b");

const f = () => arguments; // ReferenceError khi gọi ở top-level
```

Đây là hành vi song song với `this`: arrow không có `this`, `arguments`, `super`, `new.target` của riêng nó mà mượn từ scope nơi định nghĩa. Giải pháp là dùng rest parameter — hoạt động bình thường trong arrow và cho ra Array thật: `const f = (...args) => args`.

</details>

**5. `Call Stack` là gì? Mô tả chính xác điều gì xảy ra với `stack frame` khi một hàm được gọi và khi nó `return`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Call Stack** là cấu trúc dữ liệu kiểu ngăn xếp mà engine dùng để theo dõi các hàm đang thực thi. Mỗi lời gọi hàm tạo ra một **stack frame** (execution context) lưu: tham số, biến cục bộ, giá trị `this`, và **địa chỉ quay về** — vị trí trong hàm gọi để tiếp tục sau khi hàm con xong.

Khi **gọi hàm**: engine tạo frame mới và **push** lên đỉnh stack; quyền điều khiển chuyển sang hàm đó. Khi hàm **return** (hoặc chạy hết thân hàm, hoặc ném lỗi): frame ở đỉnh bị **pop** ra, bộ nhớ cục bộ của nó được giải phóng, giá trị trả về chuyển cho frame bên dưới và chương trình chạy tiếp từ địa chỉ quay về.

```js
function third() { console.log("third"); }
function second() { third(); }
function first() { second(); }
first();
// Stack lúc console.log chạy: third | second | first | <main>
```

Ở đáy stack luôn là global execution context (`<main>`); stack rỗng nghĩa là code đồng bộ đã chạy xong.

</details>

**6. Vì sao Call Stack hoạt động theo nguyên tắc LIFO? Cho một stack trace, bạn đọc theo thứ tự nào để biết hàm nào gọi hàm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

LIFO (Last In — First Out) là hệ quả tự nhiên của cách hàm lồng nhau: hàm được gọi sau cùng phải hoàn thành trước thì hàm gọi nó mới tiếp tục được. Nếu pop theo thứ tự khác, engine sẽ không biết quay về đâu — địa chỉ trả về và biến cục bộ của các frame đang chờ sẽ mất ý nghĩa.

**Đọc stack trace:** dòng **trên cùng** là nơi lỗi thực sự xảy ra (frame đang ở đỉnh stack), rồi càng đi xuống càng là hàm gọi ở tầng ngoài, cho tới entry point.

```
Error: oops
    at third (file.js:2)     ← nơi ném lỗi
    at second (file.js:6)    ← second gọi third
    at first (file.js:10)    ← first gọi second
    at file.js:13            ← top-level gọi first
```

Vậy chiều "ai gọi ai" đọc từ **dưới lên**, còn chiều "lỗi phát sinh ở đâu" đọc từ **trên xuống**. Khi debug, thường nhìn dòng đầu tiên thuộc code của mình (bỏ qua các frame trong thư viện).

</details>

**7. Cho `first()` gọi `second()`, `second()` gọi `third()` — hãy vẽ trạng thái call stack tại thời điểm `third` đang chạy, rồi mô tả thứ tự pop.**

<details className="qa">
<summary>Xem đáp án</summary>

Tại thời điểm `third` đang chạy, stack có 4 frame:

```
| third  |  ← top (đang thực thi)
| second |
| first  |
| <main> |  ← bottom (global context)
```

Diễn biến push: `<main>` gọi `first` → push `first`; `first` gọi `second` → push `second`; `second` gọi `third` → push `third`.

Thứ tự pop ngược lại, đúng nguyên tắc LIFO:

1. `third` chạy xong / `return` → pop `third`, điều khiển về `second`.
2. `second` không còn gì để làm → pop `second`, về `first`.
3. `first` return → pop `first`, về `<main>`.
4. Hết code đồng bộ → stack chỉ còn `<main>` (rồi rỗng khi chương trình kết thúc).

Nếu `third` ném lỗi mà không ai `catch`, các frame vẫn bị pop lần lượt trong lúc lỗi "nổi" lên trên — và stack trace chính là ảnh chụp stack ngay lúc lỗi được tạo ra.

</details>

**8. Lỗi `RangeError: Maximum call stack size exceeded` xuất hiện khi nào? Nêu ít nhất hai nguyên nhân phổ biến trong code thật.**

<details className="qa">
<summary>Xem đáp án</summary>

Xuất hiện khi số frame trên call stack vượt giới hạn của engine (cỡ hàng chục nghìn frame, tùy engine và kích thước từng frame). Mỗi lời gọi push thêm frame mà không có lời gọi nào pop ra, stack cao dần rồi tràn.

Nguyên nhân phổ biến:

- **Đệ quy thiếu base case** — kinh điển nhất: `function recurse() { return recurse(); }`.
- **Đệ quy quá sâu trên dữ liệu lớn** — duyệt cây/linked list lồng vài chục nghìn tầng, dù logic hoàn toàn đúng.
- **Hai hàm gọi vòng tròn** — `a()` gọi `b()`, `b()` gọi lại `a()`.
- **Vô tình tự gọi qua getter/setter hoặc proxy** — ví dụ `get value() { return this.value; }`.
- **Truyền mảng cực lớn vào hàm dùng spread** — `Math.max(...hugeArray)` đẩy hàng trăm nghìn argument lên stack.

Cách xử lý: thêm base case, giới hạn độ sâu, hoặc chuyển sang vòng lặp với stack thủ công.

</details>

**9. "JavaScript là `single-threaded`, chỉ có một call stack" nghĩa là gì? Vì sao một vòng `while` chạy 3 giây làm treo toàn bộ UI trình duyệt?**

<details className="qa">
<summary>Xem đáp án</summary>

Nghĩa là tại một thời điểm chỉ có **một luồng thực thi JS với một call stack duy nhất** — không có hai đoạn code JS chạy song song trên cùng luồng. Mọi thứ khác (callback của `setTimeout`, event handler, Promise, và cả việc render của trình duyệt) đều phải chờ stack rỗng mới tới lượt.

```js
function blockUI() {
  const end = Date.now() + 3000;
  while (Date.now() < end) {}   // giữ frame trên stack suốt 3 giây
}
```

Trong 3 giây đó frame của `blockUI` không pop, event loop không lấy được task nào từ queue, trình duyệt không repaint, click và scroll không phản hồi — đó chính là "freeze".

Cách tránh: chia nhỏ công việc rồi `setTimeout(..., 0)` để nhường nhịp cho browser; dùng async cho I/O; đẩy tính toán nặng sang **Web Worker** (Node.js là `worker_threads`) — worker có luồng và call stack riêng nên không chặn luồng chính.

</details>

**10. Khi phải duyệt một cây lồng rất sâu, làm sao tránh tràn stack? So sánh cách viết đệ quy với cách viết `iterative` dùng stack thủ công.**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: thay vì để engine giữ trạng thái trên call stack, ta **tự quản lý một mảng làm stack** trên heap — heap lớn hơn stack rất nhiều nên độ sâu gần như chỉ giới hạn bởi bộ nhớ.

```js
// Đệ quy — mỗi tầng một frame, cây sâu là tràn
function depth(node) {
  if (!node) return 0;
  return 1 + Math.max(depth(node.left), depth(node.right));
}

// Iterative — stack thủ công, không tràn
function depthIter(root) {
  const stack = [[root, 0]];
  let max = 0;
  while (stack.length) {
    const [node, d] = stack.pop();
    if (!node) continue;
    max = Math.max(max, d);
    stack.push([node.left, d + 1], [node.right, d + 1]);
  }
  return max;
}
```

| | Đệ quy | Iterative |
|---|---|---|
| Độ sâu tối đa | Giới hạn call stack | Giới hạn bộ nhớ heap |
| Dễ đọc | Rất gọn, sát định nghĩa bài toán | Dài hơn, phải tự quản lý trạng thái |

Kinh nghiệm: dữ liệu nhỏ và có kiểm soát thì dùng đệ quy cho dễ đọc; dữ liệu do người dùng/hệ thống sinh ra với độ sâu không đoán trước thì viết iterative.

</details>

**11. `Tail-call optimization` là gì? Các engine phổ biến (V8, SpiderMonkey, JavaScriptCore) hỗ trợ tới đâu, và điều đó ảnh hưởng thế nào tới cách bạn viết đệ quy?**

<details className="qa">
<summary>Xem đáp án</summary>

**Tail call** là lời gọi hàm nằm ở **vị trí cuối cùng** của một hàm — kết quả của nó được trả về ngay, không cần làm gì thêm. Khi đó frame hiện tại không còn việc gì để làm, nên về lý thuyết engine có thể **tái sử dụng frame đó** thay vì push frame mới: đệ quy chạy với bộ nhớ stack hằng số. Đó là **tail-call optimization (TCO)**, được đưa vào chuẩn ES6 dưới tên "proper tail calls".

```js
// Tail call: kết quả của fact được return trực tiếp
function fact(n, acc = 1) {
  if (n <= 1) return acc;
  return fact(n - 1, n * acc);
}

// KHÔNG phải tail call: còn phép nhân sau khi hàm con trả về
function factBad(n) {
  return n <= 1 ? 1 : n * factBad(n - 1);
}
```

Thực tế: chỉ **JavaScriptCore (Safari)** triển khai; **V8** và **SpiderMonkey** không (V8 từng thử rồi bỏ). Vì vậy **đừng bao giờ dựa vào TCO** — code chạy tốt trên Safari vẫn tràn stack trên Chrome/Node. Khi độ sâu đệ quy không đoán trước, hãy viết vòng lặp hoặc dùng stack thủ công / trampoline.

</details>

**12. Đoán output: `isNaN("hello")` và `Number.isNaN("hello")` trả về gì? Giải thích vì sao khác nhau và nên dùng cái nào.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
isNaN("hello");          // true
Number.isNaN("hello");   // false
```

`isNaN` (hàm global cũ) **ép kiểu** đối số sang number trước rồi mới kiểm tra: `Number("hello")` là `NaN` nên trả `true`. Nó thực chất trả lời câu hỏi "giá trị này không chuyển được thành số phải không?", chứ không phải "giá trị này có phải `NaN` không".

`Number.isNaN` (ES6) **không ép kiểu**: chỉ trả `true` khi đối số đúng là giá trị `NaN`.

```js
isNaN(undefined);         // true   — Number(undefined) là NaN
Number.isNaN(undefined);  // false
isNaN("");                // false  — Number("") là 0
Number.isNaN(NaN);        // true
```

**Nên dùng `Number.isNaN`** vì ngữ nghĩa rõ ràng, không có bất ngờ do coercion. Tương tự, dùng `Number.isFinite` thay `isFinite`. Nếu mục đích thật sự là "chuỗi này có parse được thành số không" thì viết tường minh: `Number.isNaN(Number(x))`.

</details>

**13. `setTimeout(fn, 0)` có chạy hàm ngay lập tức không? Nó liên quan gì tới call stack và event loop?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** `setTimeout` chỉ **đăng ký** callback với timer của runtime rồi trả về ngay. Sau khi hết thời gian chờ, callback được đưa vào **macrotask queue**. Event loop chỉ lấy task từ queue khi **call stack đã rỗng** — tức toàn bộ code đồng bộ đang chạy phải xong trước.

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
// Output: 1 → 4 → 3 → 2
```

`3` in trước `2` vì microtask queue (Promise) luôn được xử lý cạn trước macrotask. Ngoài ra `0` không có nghĩa là 0ms: trình duyệt ép mức tối thiểu khoảng 4ms khi timer lồng nhiều tầng, và nếu stack đang bận 3 giây thì callback cũng phải chờ đủ 3 giây.

Ứng dụng: `setTimeout(heavyTask, 0)` để nhường một nhịp cho trình duyệt repaint, hoặc chia nhỏ công việc nặng thành nhiều task tránh treo UI.

</details>

**14. So sánh `parseInt("08")`, `Number("08")` và `+"08"`. Vì sao luôn nên truyền `radix` cho `parseInt`?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba đều cho `8` trong JS hiện đại. Khác biệt nằm ở cách xử lý chuỗi "không sạch":

```js
parseInt("08");     // 8
Number("08");       // 8
+"08";              // 8

parseInt("12px");   // 12   — đọc tới ký tự không hợp lệ thì dừng
Number("12px");     // NaN  — phải là số hợp lệ toàn phần
parseInt("");       // NaN
Number("");         // 0    — chuỗi rỗng thành 0
parseInt("0x1A");   // 26   — tự nhận diện tiền tố hex
```

`Number(x)` và `+x` hoạt động giống nhau (đều dùng ToNumber), chỉ khác về độ dễ đọc.

**Vì sao cần `radix`:** `parseInt(str, radix)` không có radix sẽ **tự đoán** hệ cơ số theo tiền tố — `"0x..."` thành hệ 16. Các engine rất cũ còn coi tiền tố `"0"` là hệ 8, khiến `parseInt("08")` từng ra `0`. Truyền `parseInt(x, 10)` loại bỏ mọi mơ hồ. Bẫy kinh điển liên quan:

```js
["1", "2", "3"].map(parseInt); // [1, NaN, NaN] — index bị nhận làm radix
["1", "2", "3"].map((s) => parseInt(s, 10)); // [1, 2, 3]
```

</details>

---

## 4. Recursion, Lexical Scope, Closures

Bài học: [4. Recursion, Lexical Scope, Closures](../../javascript/10-functions/4_advanced.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Một hàm đệ quy bắt buộc phải có những thành phần nào? Điều gì xảy ra nếu thiếu `base case`?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thành phần bắt buộc:

- **Base case** — điều kiện dừng, trả kết quả trực tiếp mà không gọi lại chính nó.
- **Recursive case** — gọi lại chính nó với input **nhỏ hơn**, đảm bảo tiến dần về base case.

```js
function factorial(n) {
  if (n <= 1) return 1;        // base case
  return n * factorial(n - 1); // recursive case, n giảm dần
}
factorial(5); // 120
```

Nếu thiếu base case (hoặc recursive case không thu nhỏ input), hàm tự gọi vô tận. Mỗi lời gọi push thêm một stack frame mà không frame nào được pop, stack cao dần tới giới hạn engine và ném `RangeError: Maximum call stack size exceeded`.

Lưu ý thêm: có base case vẫn có thể tràn stack nếu dữ liệu quá sâu — ví dụ duyệt cây vài chục nghìn tầng. Khi đó phải chuyển sang vòng lặp với stack thủ công.

</details>

**2. `Lexical scope` nghĩa là gì? Phạm vi của một biến được quyết định tại nơi VIẾT hàm hay nơi GỌI hàm?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lexical scope** (static scope) nghĩa là phạm vi của biến được xác định **tại nơi viết code** — dựa vào cấu trúc lồng nhau của các block/hàm trong file nguồn, chốt ngay lúc parse, không phụ thuộc runtime.

```js
const x = "outer";

function outer() {
  const x = "inner outer";
  function inner() { console.log(x); }
  return inner;
}

const fn = outer();
fn(); // "inner outer" — theo nơi VIẾT, không phải nơi GỌI
```

Dù `fn()` được gọi ở global (nơi có `x = "outer"`), `inner` vẫn nhìn thấy `x` của `outer` vì nó **được viết** bên trong `outer`.

Đối lập là **dynamic scope** — biến được tra theo chuỗi lời gọi lúc runtime; JS không dùng mô hình này. (`this` là ngoại lệ duy nhất đáng nhớ: với function thường, `this` được quyết định theo **cách gọi**, không theo lexical.)

</details>

**3. Mô tả `scope chain`: khi engine gặp một biến, nó tìm theo thứ tự nào và dừng lại ở đâu? Nếu không tìm thấy thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Scope chain** là chuỗi các Lexical Environment liên kết từ scope hiện tại ngược lên scope cha, cho tới global. Khi gặp một biến, engine tìm **từ trong ra ngoài**:

1. Scope cục bộ của hàm/block đang chạy.
2. Scope của hàm/block bao ngoài gần nhất.
3. Tiếp tục ngược lên các scope cha.
4. Cuối cùng là global scope.

Engine **dừng ngay ở scope đầu tiên tìm thấy** tên biến — đó là lý do biến ở trong "che" (shadow) biến cùng tên ở ngoài.

Nếu tra hết chuỗi mà không thấy:

- Đọc biến → `ReferenceError: x is not defined`.
- Gán biến ở **strict mode / ES Module** → cũng `ReferenceError`.
- Gán biến ở **sloppy mode** → vô tình tạo biến global (một trong những lý do nên luôn dùng strict mode).

Quan trọng: chuỗi này đi theo **nơi hàm được định nghĩa**, không phải nơi được gọi.

</details>

**4. `Closure` là gì? Giải thích cơ chế vì sao biến của hàm cha không bị `Garbage Collector` thu hồi sau khi hàm cha đã `return`.**

<details className="qa">
<summary>Xem đáp án</summary>

**Closure** là một hàm cùng với **môi trường từ vựng (Lexical Environment)** nơi nó được tạo ra — nhờ đó hàm vẫn truy cập được biến của scope ngoài kể cả khi scope đó đã kết thúc.

```js
function makeCounter() {
  let count = 0;
  return function () { count++; return count; };
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
```

Cơ chế: khi gọi `makeCounter`, engine tạo một Lexical Environment chứa `count`. Hàm trả về lưu một **liên kết nội bộ tới environment đó** (`[[Environment]]`). Khi `makeCounter` return, biến `counter` ở ngoài giữ hàm này, hàm này lại giữ environment — nên environment vẫn **reachable**.

Garbage Collector của JS hoạt động theo nguyên tắc **reachability**: chỉ thu hồi những gì không còn đường nào tới được từ gốc. Vì còn chuỗi tham chiếu `counter → function → environment → count`, `count` không bị dọn. Chỉ khi `counter = null` thì cả chuỗi mới trở thành rác.

</details>

**5. Với hàm factory `makeCounter()`, gọi hai lần tạo ra `a` và `b` — hai counter này có dùng chung biến `count` không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Mỗi lời gọi `makeCounter()` tạo ra một **Lexical Environment mới** với biến `count` riêng, và hàm trả về lần đó gắn với chính environment ấy.

```js
const a = makeCounter();
const b = makeCounter();
a(); // 1
a(); // 2
b(); // 1 — hoàn toàn độc lập với a
```

Nói cách khác, closure không phải là "một biến tĩnh dùng chung" mà là **một thể hiện state riêng cho mỗi lần gọi factory** — tương tự cách mỗi instance của class có field riêng.

Trường hợp **có** dùng chung là khi biến nằm ở scope cao hơn factory:

```js
let shared = 0;                       // ngoài makeCounter
function makeCounter() {
  return () => ++shared;              // mọi counter dùng chung shared
}
```

Hiểu điều này giúp giải thích vì sao nhiều component/hook React tạo từ cùng một factory vẫn giữ state độc lập.

</details>

**6. Câu kinh điển: vòng `for (var i = 0; i < 3; i++)` push vào mảng các hàm trả về `i`. Gọi từng hàm ra kết quả gì? Đổi `var` thành `let` thì sao — giải thích cơ chế.**

<details className="qa">
<summary>Xem đáp án</summary>

```js
const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(function () { return i; });
}
fns[0](); // 3
fns[1](); // 3
fns[2](); // 3
```

`var` có **function scope**, nên cả vòng lặp chỉ có **một biến `i` duy nhất**. Cả ba closure cùng tham chiếu biến đó; lúc gọi, vòng lặp đã kết thúc và `i` bằng `3`. Chúng không "chụp giá trị" mà **giữ tham chiếu tới biến**.

Đổi sang `let`:

```js
for (let i = 0; i < 3; i++) {
  fns.push(function () { return i; });
}
// 0, 1, 2
```

`let` trong `for` được spec quy định đặc biệt: mỗi lần lặp tạo **một binding `i` mới** trong block scope của vòng lặp, và giá trị cuối vòng trước được copy sang binding mới. Nhờ vậy mỗi closure gắn với một biến riêng, giữ đúng giá trị tại thời điểm đó.

</details>

**7. Ngoài việc đổi sang `let`, còn cách nào khác để sửa bài toán vòng lặp trên? (gợi ý: `IIFE`, tham số thứ ba của `setTimeout`, `forEach`)**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng chung: tạo một **scope mới cho mỗi vòng lặp** để "đóng băng" giá trị hiện tại.

Dùng IIFE — truyền `i` làm tham số, tham số là biến cục bộ của mỗi lời gọi:

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// 0, 1, 2
```

Dùng tham số phụ của `setTimeout` — các argument từ vị trí thứ ba được truyền vào callback:

```js
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 0, i);
}
```

Dùng `forEach` (hoặc `map`) — mỗi lần lặp là một lời gọi hàm nên có scope riêng:

```js
[0, 1, 2].forEach((i) => setTimeout(() => console.log(i), 0));
```

Cách khác nữa: `fns.push(((j) => () => j)(i))`, hoặc `fn.bind(null, i)`. Trong code mới, `let` vẫn là lựa chọn gọn và rõ nhất.

</details>

**8. `IIFE` là gì và trước khi có ES Module người ta dùng nó để giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**IIFE (Immediately Invoked Function Expression)** là hàm được định nghĩa và gọi ngay tại chỗ. Phải bọc trong `()` vì câu lệnh bắt đầu bằng `function` sẽ bị parser hiểu là function declaration và không gọi ngay được.

```js
(function () { console.log("chạy ngay"); })();
(() => { console.log("arrow IIFE"); })();
```

Thời ES5 chỉ có `var` (function scope) và không có module, mọi biến top-level của mỗi file `<script>` đều rơi vào global — rất dễ trùng tên giữa các thư viện. IIFE giải quyết bằng cách tạo một scope dùng một lần:

- **Tránh ô nhiễm global** — biến bên trong không lọt ra ngoài.
- **Module pattern** — trả về object chỉ phơi ra API công khai, giấu phần còn lại.

```js
var App = (function () {
  var secret = "x";                    // private
  return { get() { return secret; } }; // public API
})();
App.secret; // undefined
```

Ngày nay `let`/`const` block scope và ES Module đã thay thế gần hết vai trò này.

</details>

**9. Làm sao tạo biến "riêng tư" bằng closure (`module pattern`)? So với `#privateField` của `class` thì khác nhau ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Module pattern: khai báo biến trong factory rồi trả về object chứa các method — chỉ những method này "nhìn thấy" biến qua closure.

```js
function createAccount(initial) {
  let balance = initial;                    // private
  return {
    deposit(n) { balance += n; },
    getBalance() { return balance; },
  };
}
const acc = createAccount(100);
acc.deposit(50);
acc.getBalance(); // 150
acc.balance;      // undefined
```

| | Closure / module pattern | `#privateField` |
|---|---|---|
| Cơ chế | Biến nằm trong scope, không phải property | Property thật, được engine bảo vệ ở tầng ngôn ngữ |
| Bộ nhớ | Mỗi instance tạo một bộ method mới | Method nằm trên prototype, dùng chung |
| Kế thừa | Không có prototype chain để override | Dùng được với `extends`, `super` |
| Truy cập ngoài | Không có cách nào | Truy cập ngoài class là **SyntaxError** |
| Tương thích | Chạy mọi nơi | Cần ES2022 hoặc transpile |

Cả hai đều cho tính riêng tư thật (khác với quy ước `_name`). Chọn `class` + `#field` cho model có nhiều instance; chọn closure cho factory nhỏ, hàm cấu hình, hoặc khi cần `this` an toàn.

</details>

**10. `Currying` là gì? Viết hàm cho phép gọi `add(1)(2)(3)`. Currying dựa vào closure ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Currying** là kỹ thuật biến một hàm nhận nhiều tham số thành **chuỗi các hàm, mỗi hàm nhận đúng một tham số**, và chỉ tính kết quả khi đã đủ tham số.

```js
const add = (a) => (b) => (c) => a + b + c;
add(1)(2)(3); // 6

// Tương đương viết dài
function addLong(a) {
  return function (b) {
    return function (c) { return a + b + c; };
  };
}
```

**Vai trò của closure:** khi `add(1)` trả về hàm nhận `b`, hàm đó phải "nhớ" `a = 1`. Giá trị này sống trong Lexical Environment của lời gọi `add(1)` và được hàm trả về giữ tham chiếu — chính là closure. Tương tự, hàm cuối nhớ cả `a` lẫn `b` qua hai tầng scope chain.

Lợi ích thực tế: tạo hàm chuyên biệt từ hàm tổng quát, rất hợp với việc kết hợp hàm (composition) và pipeline dữ liệu:

```js
const greet = (greeting) => (name) => `${greeting}, ${name}!`;
const hi = greet("Hi");
hi("An"); // "Hi, An!"
```

</details>

**11. Phân biệt `currying` và `partial application`. Cho ví dụ mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều "cố định trước" một phần tham số, nhưng khác về hình dạng kết quả:

| | Currying | Partial application |
|---|---|---|
| Kết quả | Chuỗi hàm, **mỗi hàm nhận 1 tham số** | **Một** hàm mới nhận phần tham số còn lại |
| Số lời gọi | Bằng số tham số | Thường chỉ thêm một lời gọi |
| Cách gọi | `f(1)(2)(3)` | `g = partial(f, 1); g(2, 3)` |

```js
// Currying
const add3 = (a) => (b) => (c) => a + b + c;
add3(1)(2)(3); // 6

// Partial application — bind cố định tham số đầu
function add(a, b, c) { return a + b + c; }
const add1 = add.bind(null, 1);
add1(2, 3);    // 6

// Partial application viết tay
const partial = (fn, ...fixed) => (...rest) => fn(...fixed, ...rest);
const add12 = partial(add, 1, 2);
add12(3);      // 6
```

Nói ngắn: currying **đổi cấu trúc** hàm thành nhiều tầng một tham số; partial application chỉ **giảm số tham số** của hàm hiện có. Cả hai đều dựa vào closure để giữ các tham số đã cố định.

</details>

**12. Tự implement `memoize` bằng closure. Dùng `JSON.stringify(args)` làm cache key có hạn chế gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
function memoize(fn) {
  const cache = new Map();            // sống nhờ closure
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

Hạn chế của `JSON.stringify(args)` làm key:

- **Thứ tự property ảnh hưởng key**: `{a:1,b:2}` và `{b:2,a:1}` cho hai chuỗi khác nhau dù logic như nhau.
- **Mất thông tin kiểu**: `undefined`, hàm và `Symbol` bị bỏ qua hoặc thành `null`; `NaN`/`Infinity` thành `null`; `Date` thành chuỗi; `Map`/`Set` thành `{}` — nên `f(new Set([1]))` và `f(new Set([2]))` trùng key.
- **Cấu trúc vòng (circular)** khiến `JSON.stringify` ném `TypeError`.
- **Chi phí**: serialize object lớn có thể tốn hơn chính phép tính cần cache.
- **Cache không có giới hạn**: giữ mọi kết quả mãi mãi → rò rỉ bộ nhớ.

Cải thiện: dùng `WeakMap` khi tham số là object (cho phép GC), giới hạn kích thước cache kiểu LRU, hoặc cho phép truyền hàm tạo key tùy biến (`memoize(fn, keyFn)`).

</details>

**13. Implement `once`, `debounce` và `throttle` bằng closure. `debounce` và `throttle` khác nhau ở hành vi nào, mỗi cái hợp với tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);                                  // mỗi lần gọi reset đồng hồ
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, delay) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) { last = now; return fn.apply(this, args); }
  };
}
```

Closure giữ `called`, `timer`, `last` qua các lần gọi mà không cần biến global.

| | Debounce | Throttle |
|---|---|---|
| Hành vi | Chỉ chạy **sau khi ngừng gọi** đủ `delay` | Chạy **tối đa một lần mỗi** `delay` |
| Sự kiện dồn dập | Gom lại thành 1 lần chạy | Chạy đều đặn theo nhịp |
| Hợp với | Ô tìm kiếm gõ phím, validate form, resize xong mới tính lại | Scroll, mousemove, kéo thả, bắn API theo nhịp cố định |

</details>

**14. Closure gây `memory leak` như thế nào? Cho ví dụ một event listener giữ sống mảng lớn và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

Closure giữ tham chiếu tới cả Lexical Environment của hàm cha, không chỉ biến nó dùng. Nếu closure đó sống lâu (event listener, timer, callback đăng ký ở đâu đó), toàn bộ biến trong environment không bị GC — kể cả biến to mà closure chẳng dùng tới.

```js
function setup() {
  const hugeData = new Array(1_000_000).fill(0);
  document.getElementById("btn").addEventListener("click", () => {
    console.log("clicked");   // không dùng hugeData
  });                          // nhưng environment vẫn giữ hugeData
}
```

Cách phòng tránh:

- Gán `null` cho biến lớn sau khi dùng xong: `hugeData = null` (khai báo bằng `let`).
- Chỉ giữ đúng phần dữ liệu cần: trích `const total = hugeData.length` rồi để mảng ra ngoài tầm với của closure.
- **Gỡ listener** khi không cần: `removeEventListener`, `clearInterval`, hoặc `AbortController` với `{ signal }`.
- Trong React, luôn trả về hàm cleanup trong `useEffect`.
- Dùng `WeakMap`/`WeakRef` khi cần liên kết dữ liệu với object mà không chặn GC.

Công cụ kiểm chứng: tab Memory của DevTools — chụp heap snapshot trước/sau để tìm object không được giải phóng.

</details>

**15. `Stale closure` trong React hooks là gì? Vì sao `setInterval` trong `useEffect` với deps rỗng luôn thấy `count = 0`, và vì sao `setCount(c => c + 1)` sửa được?**

<details className="qa">
<summary>Xem đáp án</summary>

**Stale closure** là closure "chụp" giá trị của một lần render cũ và không bao giờ thấy giá trị mới. Mỗi lần render, React chạy lại thân component, tạo ra các biến và hàm **mới**; hàm nào được giữ lại từ render cũ sẽ mãi nhìn thấy dữ liệu của render đó.

```js
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);   // count luôn là 0
  }, 1000);
  return () => clearInterval(timer);
}, []);                     // deps rỗng → effect chỉ chạy 1 lần
```

Deps rỗng nghĩa là effect (và callback bên trong) chỉ được tạo ở render đầu, khi `count = 0`. Interval chạy mãi vẫn tính `0 + 1`, nên state dừng ở `1`.

`setCount(c => c + 1)` sửa được vì dùng **updater function**: React truyền vào giá trị state **mới nhất** tại thời điểm cập nhật, không phụ thuộc biến `count` bị chụp trong closure.

Cách khác: thêm `count` vào deps (interval sẽ được tạo lại mỗi lần đổi), hoặc lưu giá trị mới nhất trong `useRef`.

</details>

**16. Khi nào nên chọn đệ quy, khi nào nên chọn vòng lặp? Đệ quy trên dữ liệu lớn có rủi ro gì về mặt call stack?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chọn đệ quy** khi bài toán tự nó có cấu trúc đệ quy và độ sâu có kiểm soát: duyệt cây/DOM, xử lý JSON lồng nhau, backtracking, chia để trị (quicksort, merge sort). Code ngắn, sát định nghĩa bài toán, dễ đọc.

**Chọn vòng lặp** khi dữ liệu tuyến tính hoặc độ sâu không đoán trước: duyệt mảng, xử lý stream, tính toán nóng cần hiệu năng. Vòng lặp không tốn stack frame và thường nhanh hơn.

**Rủi ro với dữ liệu lớn:** mỗi lời gọi đệ quy push một stack frame; vượt giới hạn engine (cỡ hàng chục nghìn frame) là `RangeError: Maximum call stack size exceeded`. Nguy hiểm ở chỗ code có thể chạy đúng với dữ liệu test nhỏ rồi sập trên production. Đừng trông chờ tail-call optimization — chỉ JavaScriptCore (Safari) triển khai, V8 và SpiderMonkey thì không.

Giải pháp khi cần độ sâu lớn: viết iterative với **stack thủ công** trên heap, dùng trampoline, hoặc chia nhỏ công việc qua nhiều task bất đồng bộ.

</details>
