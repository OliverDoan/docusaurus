---
sidebar_position: 5
title: "5. Data Structures"
---

# 5. Data Structures

## 1. Map, Set, WeakMap, WeakSet

Bài học: [1. Map, Set, WeakMap, WeakSet](../../javascript/05-data-structures/1_keyed-collections.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Map` khác `Object` ở những điểm nào (kiểu key, thứ tự, `size`, iteration, prototype, JSON)? Khi nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

|           | `Map`                                         | `Object`                                                 |
| --------- | --------------------------------------------- | -------------------------------------------------------- |
| Key       | **Bất kỳ kiểu** — object, function, số, `NaN` | Chỉ String / Symbol (mọi key khác bị ép về string)       |
| Thứ tự    | Giữ nguyên thứ tự chèn                        | Key số bị engine tự sắp tăng dần trước                   |
| Size      | `.size` trực tiếp                             | Phải `Object.keys(o).length`                             |
| Iteration | Iterable sẵn, `for...of` chạy thẳng           | Cần `Object.entries()` / `for...in`                      |
| Prototype | Không có prototype chain gây nhiễu            | Kế thừa `Object.prototype` → dễ xung đột (`toString`...) |
| JSON      | Không hỗ trợ trực tiếp                        | Native                                                   |
| Hiệu năng | Tốt khi thêm/xoá key liên tục                 | Tốt khi shape cố định (nhờ hidden class của V8)          |

**Chọn thế nào:**

- **`Map`** khi key động, key không phải string, cần `size`/duyệt thường xuyên, hoặc dictionary lớn thêm–xoá nhiều.
- **`Object`** khi shape cố định, cần `JSON.stringify` trực tiếp, dữ liệu config/DTO, hoặc cần destructuring.

</details>

**2. Vì sao dùng plain object làm dictionary lại nguy hiểm? Điều gì xảy ra với `obj[1]` và `obj["1"]`, hoặc khi key trùng `toString`?**

<details className="qa">
<summary>Xem đáp án</summary>

Object có ba cái bẫy khi bị dùng như dictionary:

```js
const map = {};

map[1] = "số một";
map["1"] = "chuỗi một";
map[1]; // "chuỗi một" — key số bị ép thành string, đè lên nhau!

const user = { id: 1 };
map[user] = "data"; // key thành "[object Object]" — mọi object đều đè nhau

map["toString"]; // vốn đã tồn tại từ prototype, dù ta chưa set gì
```

- **Key luôn bị ép về string**: `1` và `"1"` là cùng một key, nên dữ liệu ghi đè âm thầm. Object làm key thì thành `"[object Object]"` — mọi object khác nhau đều trỏ về một ô.
- **Ô nhiễm prototype**: object kế thừa `Object.prototype`, nên `"toString"`, `"constructor"`, `"__proto__"` luôn "có sẵn". Kiểm tra `if (map[key])` với dữ liệu người dùng nhập có thể ra kết quả sai, thậm chí dẫn tới lỗ hổng _prototype pollution_.
- **Thứ tự và đếm**: key dạng số nguyên bị engine sắp lại, và không có `.size`.

Nếu buộc dùng object, hãy tạo bằng `Object.create(null)` để bỏ prototype — còn tốt nhất là dùng `Map`.

</details>

**3. Thuật toán nào được `Map` và `Set` dùng để so sánh key? Vì sao `new Set([NaN, NaN]).size` bằng `1`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Map` và `Set` so sánh key/phần tử bằng thuật toán **SameValueZero**. Nó gần như giống `===`, chỉ khác đúng hai chỗ:

- **`NaN` được coi là bằng chính nó** (khác `===`, vì `NaN === NaN` là `false`).
- **`+0` và `-0` được coi là cùng một giá trị** (khác `Object.is`, vốn phân biệt hai giá trị này).

```js
new Set([NaN, NaN]).size; // 1 — SameValueZero coi hai NaN là một
NaN === NaN; // false
new Set([0, -0]).size; // 1 — +0 và -0 gộp làm một
Object.is(0, -0); // false — Object.is thì phân biệt

const m = new Map();
m.set(NaN, "ok");
m.get(NaN); // "ok" — tra cứu bằng NaN vẫn ra kết quả
```

Đây là lựa chọn thiết kế thực dụng: nếu dùng `===`, bạn sẽ không bao giờ lấy lại được giá trị đã lưu với key `NaN`. Lưu ý quan trọng: SameValueZero **vẫn so sánh object theo reference**, nên hai object có nội dung giống nhau vẫn là hai phần tử khác nhau.

</details>

**4. Đoán output: `new Set([{a: 1}, {a: 1}]).size`. Vì sao `Set` không loại được hai object trông giống nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Output là **`2`**.

```js
new Set([{ a: 1 }, { a: 1 }]).size; // 2

const a = { id: 1 };
new Set([a, a]).size; // 1 — cùng một reference
```

Lý do: `Set` so sánh bằng **SameValueZero**, mà với object thì thuật toán này so sánh **reference** (địa chỉ trong bộ nhớ), không so sánh nội dung. Hai literal `{a: 1}` tạo ra **hai object riêng biệt** nằm ở hai vùng nhớ khác nhau, nên `{a:1} === {a:1}` là `false` — với `Set` chúng là hai phần tử hợp lệ.

JavaScript không có khái niệm "so sánh sâu" tích hợp sẵn cho object, và cũng không có cách để ta tự định nghĩa cách băm/so sánh như `equals`/`hashCode` trong Java. Muốn loại trùng theo nội dung, phải tự chọn một **khoá primitive** đại diện cho object (một property định danh, hoặc chuỗi `JSON.stringify`) rồi dùng `Map`/`Set` trên khoá đó.

</details>

**5. Viết cách loại phần tử trùng trong mảng object theo một property (ví dụ `id`) — vì sao `[...new Set(arr)]` không đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

`[...new Set(arr)]` **không đủ** vì `Set` so sánh object theo reference — hai object khác reference dù cùng `id` vẫn được giữ lại cả hai.

Cách gọn nhất là dùng `Map` làm index theo `id`: key primitive nên so sánh đúng bằng giá trị, và `Map` giữ nguyên thứ tự chèn.

```js
const arr = [
  { id: 1, name: "An" },
  { id: 2, name: "Bình" },
  { id: 1, name: "An (bản mới)" },
];

const unique = [...new Map(arr.map((o) => [o.id, o])).values()];
// [{id:1, name:"An (bản mới)"}, {id:2, name:"Bình"}]
```

Lưu ý hành vi: khi trùng `id`, bản **xuất hiện sau sẽ ghi đè** bản trước (vì `set` cùng key), nhưng **vị trí trong thứ tự vẫn là vị trí lần chèn đầu tiên**. Muốn giữ bản đầu tiên thay vì bản cuối, đảo mảng trước hoặc lọc bằng `Set` chứa các `id` đã gặp:

```js
const seen = new Set();
const unique2 = arr.filter((o) => !seen.has(o.id) && seen.add(o.id));
```

</details>

**6. `Set` có giữ thứ tự chèn không? Duyệt `Map` bằng `for...of` trả về gì, và `keys()`, `values()`, `entries()` khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có** — cả `Map` và `Set` đều **giữ đúng thứ tự chèn**, và spec đảm bảo điều này (khác hẳn object, nơi key dạng số nguyên bị sắp lại). Nếu `set`/`add` lại một key đã tồn tại, giá trị được cập nhật nhưng **vị trí cũ được giữ nguyên**.

Duyệt `Map` bằng `for...of` trả về **từng cặp `[key, value]`** dạng mảng hai phần tử, nên thường destructuring luôn:

```js
const m = new Map([
  ["name", "An"],
  ["age", 25],
]);

for (const [k, v] of m) {
} // ["name","An"], rồi ["age",25]
for (const k of m.keys()) {
} // "name", "age"
for (const v of m.values()) {
} // "An", 25
for (const e of m.entries()) {
} // giống for...of trực tiếp
```

- `keys()` → iterator các key.
- `values()` → iterator các value.
- `entries()` → iterator các cặp `[key, value]`; đây chính là **iterator mặc định** của `Map`, nên `for...of m` tương đương `for...of m.entries()`.

Với `Set`, key và value là một, nên `keys()` và `values()` cho cùng kết quả, còn `entries()` trả về `[v, v]` — tồn tại chỉ để giữ API thống nhất với `Map`.

</details>

**7. Làm sao serialize một `Map` sang JSON và khôi phục lại? Vì sao `JSON.stringify(new Map(...))` cho ra `{}`?**

<details className="qa">
<summary>Xem đáp án</summary>

`JSON.stringify` chỉ duyệt các **own enumerable property** của object. Dữ liệu của `Map` không nằm ở property nào cả — nó được giữ trong **internal slot** của engine, chỉ truy cập được qua `get`/`set`/iterator. Không có property nào để duyệt nên kết quả là `{}`.

```js
const m = new Map([
  ["name", "An"],
  ["age", 25],
]);
JSON.stringify(m); // "{}" — mất sạch dữ liệu
```

**Serialize** — chuyển Map về dạng JSON hiểu được:

```js
JSON.stringify([...m]); // '[["name","An"],["age",25]]'
JSON.stringify(Object.fromEntries(m)); // '{"name":"An","age":25}'
```

**Khôi phục:**

```js
const m2 = new Map(JSON.parse('[["name","An"],["age",25]]'));
const m3 = new Map(Object.entries(JSON.parse('{"name":"An"}')));
```

Dạng **mảng tuple** giữ được key không phải string (số, boolean) nên an toàn hơn; dạng `Object.fromEntries` đọc dễ hơn nhưng mọi key bị ép thành string. Key là object thì không serialize được — phải tự ánh xạ sang một định danh primitive. `Set` cũng tương tự: dùng `JSON.stringify([...s])` và `new Set(JSON.parse(...))`.

</details>

**8. `WeakMap` khác `Map` ở những điểm nào? Vì sao `WeakMap` không có `size` và không iterable được?**

<details className="qa">
<summary>Xem đáp án</summary>

|                    | `Map`                                                   | `WeakMap`                                          |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------- |
| Key                | Bất kỳ kiểu                                             | **Bắt buộc là object** (hoặc symbol không đăng ký) |
| Tham chiếu tới key | Mạnh — giữ key sống mãi                                 | **Yếu** — GC được phép thu hồi                     |
| API                | `size`, `keys`, `values`, `entries`, `forEach`, `clear` | Chỉ `get`, `set`, `has`, `delete`                  |
| Iterable           | Có                                                      | **Không**                                          |

```js
const wm = new WeakMap();
const key = { id: 1 };
wm.set(key, "secret");
wm.get(key); // "secret"
wm.size; // undefined
```

**Vì sao không có `size` và không duyệt được?** Vì nội dung của `WeakMap` **không xác định (non-deterministic)**: một entry có thể biến mất bất cứ lúc nào khi GC chạy, mà thời điểm GC chạy thì JavaScript không kiểm soát và không nên để lập trình viên quan sát. Nếu cho phép đọc `size` hay duyệt, cùng một đoạn code sẽ cho kết quả khác nhau giữa hai lần chạy, và chương trình sẽ "nhìn thấy" được hành vi của bộ dọn rác — điều spec cố tình che giấu.

</details>

**9. Vì sao `WeakMap` chỉ nhận object (và `Symbol` không đăng ký) làm key? Điều gì xảy ra khi bạn `set` một primitive?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì cơ chế của `WeakMap` dựa trên **danh tính (identity) của một giá trị có thể bị thu hồi**. Primitive như `1`, `"abc"`, `true` không có danh tính riêng trong bộ nhớ — mọi `"abc"` đều là cùng một giá trị, không bao giờ "không còn ai dùng tới" để GC dọn. Weak reference tới chúng là vô nghĩa, nên spec cấm luôn để tránh hiểu nhầm.

Object (và từ ES2023 là **symbol không đăng ký**, tức không tạo qua `Symbol.for`) thì có danh tính duy nhất và có thể trở thành rác, nên làm key hợp lệ.

`set` với primitive sẽ **ném `TypeError` ngay lập tức**, không im lặng bỏ qua:

```js
const wm = new WeakMap();
wm.set("key", 1); // TypeError: Invalid value used as weak map key
wm.set(1, "x"); // TypeError

wm.set({}, "ok"); // hợp lệ
wm.set(Symbol("id"), "ok"); // hợp lệ (ES2023+)
wm.set(Symbol.for("id"), "x"); // TypeError — symbol đăng ký sống mãi trong registry
```

Riêng `get`/`has` với primitive thì không ném lỗi, chỉ trả `undefined`/`false`.

</details>

**10. Giải thích cơ chế `weak reference` và vai trò của `garbage collector` với `WeakMap`. Khi nào entry thực sự bị dọn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Strong reference** (tham chiếu mạnh) là loại tham chiếu thông thường: chừng nào còn một tham chiếu mạnh trỏ tới object, GC **không được phép** thu hồi object đó. Một `Map` bình thường giữ tham chiếu mạnh tới key — nên dù bạn đã xoá mọi biến khác trỏ tới object, nó vẫn sống chỉ vì nằm trong Map.

**Weak reference** (tham chiếu yếu) thì **không tính vào tiêu chí sống còn**. GC coi như tham chiếu đó không tồn tại khi quyết định object còn được dùng hay không.

```js
let key = { id: 1 };
const m = new Map();
m.set(key, "data");
const wm = new WeakMap();
wm.set(key, "data");

key = null;
// Với m: object vẫn sống vì Map giữ reference mạnh → leak nếu quên delete
// Với wm: không còn reference mạnh nào → GC được phép dọn cả key lẫn entry
```

**Khi nào entry thực sự bị dọn?** Khi **không còn bất kỳ tham chiếu mạnh nào** tới object key, và GC chạy tới. Thời điểm đó **không xác định** — có thể ngay lập tức, có thể vài phút sau, tuỳ engine và áp lực bộ nhớ. Vì vậy không được viết logic phụ thuộc vào việc entry đã biến mất hay chưa; `WeakMap` chỉ là cam kết "sẽ không giữ object sống", không phải công cụ để xoá theo ý muốn.

</details>

**11. Trong `WeakMap`, key là weak nhưng value thì sao? Mô tả kịch bản memory leak khi value trỏ ngược lại key.**

<details className="qa">
<summary>Xem đáp án</summary>

`WeakMap` **chỉ weak ở key**. Value được giữ bằng **tham chiếu mạnh** — nó sống chừng nào entry còn sống. Cơ chế đúng là: _nếu key còn sống thì value còn sống; khi key chết, cả entry (kể cả value) mới được dọn_.

Vấn đề phát sinh khi **value trỏ ngược lại key**, tạo thành vòng:

```js
const wm = new WeakMap();
let key = {};
const value = { key }; // value giữ reference mạnh tới key
wm.set(key, value);

key = null;
// value vẫn nằm trong entry → value giữ mạnh key → key không bao giờ "chết"
// → entry không bao giờ bị dọn → leak
```

Ở đây tham chiếu mạnh từ value tới key đã "vô hiệu hoá" toàn bộ tính weak. Một biến thể tinh vi hơn là value là một **closure** vô tình bắt biến key trong scope.

**Cách tránh:**

- Chỉ lưu value là dữ liệu thuần, không chứa reference ngược tới key.
- Nếu cần liên kết hai chiều, lưu một định danh primitive (`id`) thay vì object.
- Khi không chắc, `wm.delete(key)` tường minh ở thời điểm biết chắc vòng đời đã kết thúc.

</details>

**12. Nêu use case thực tế của `WeakMap` (cache theo object, private data, metadata cho DOM node) và vì sao `Map` không thay thế được.**

<details className="qa">
<summary>Xem đáp án</summary>

Điểm chung của mọi use case: **dữ liệu phụ gắn với một object có vòng đời riêng, và phải biến mất cùng object đó**.

**Cache kết quả tính toán nặng theo object:**

```js
const cache = new WeakMap();
function expensiveCalc(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = heavyWork(obj);
  cache.set(obj, result);
  return result;
}
```

**Private data cho instance** (trước khi có `#field`):

```js
const privates = new WeakMap();
class User {
  constructor(pwd) {
    privates.set(this, { pwd });
  }
  check(p) {
    return privates.get(this).pwd === p;
  }
}
```

**Metadata cho DOM node**: gắn dữ liệu phụ vào node mà không sửa node, không tạo property lạ.

**Vì sao `Map` không thay được:** `Map` giữ tham chiếu **mạnh** tới key. Object đã bị xoá khỏi UI/state vẫn bị Map "níu" lại mãi mãi, entry tích tụ dần → **memory leak**. Bạn buộc phải tự `delete` đúng thời điểm, mà thời điểm đó thường không ai biết. `WeakMap` chuyển trách nhiệm đó cho GC.

</details>

**13. `WeakSet` dùng để làm gì? Cho một ví dụ đánh dấu object đã xử lý mà không gây rò bộ nhớ.**

<details className="qa">
<summary>Xem đáp án</summary>

`WeakSet` dùng để **đánh dấu (tag) một tập object** — trả lời câu hỏi "object này đã được xử lý / đã đăng ký / có thuộc nhóm này không?" — mà không giữ object sống.

```js
const visited = new WeakSet();

function process(node) {
  if (visited.has(node)) return; // đã xử lý rồi, bỏ qua
  visited.add(node);
  // ... xử lý node
  node.children.forEach(process);
}
```

Đây là cách chống lặp vô hạn khi duyệt cấu trúc có chu trình (cây DOM, đồ thị, deep clone). Khi `node` bị gỡ khỏi DOM và không còn ai giữ, entry trong `WeakSet` tự biến mất.

Các ứng dụng khác: đánh dấu instance đã khởi tạo đúng cách, đánh dấu object đã được validate, theo dõi các listener đã đăng ký.

**Vì sao không dùng `Set`:** `Set` giữ reference mạnh, nên mọi node từng được duyệt sẽ sống mãi trong bộ nhớ dù trang đã điều hướng đi nơi khác. Hạn chế của `WeakSet`: chỉ nhận object, không có `size`, không duyệt được — nó chỉ trả lời được đúng câu hỏi "có/không" cho một object cụ thể.

</details>

**14. So sánh độ phức tạp tra cứu của `Map`/`Set` với việc dùng `Array.prototype.includes` hoặc `indexOf` trên mảng lớn.**

<details className="qa">
<summary>Xem đáp án</summary>

| Thao tác                                      | `Map`/`Set`                     | `Array`                              |
| --------------------------------------------- | ------------------------------- | ------------------------------------ |
| Tra cứu (`has`/`get` vs `includes`/`indexOf`) | ~**O(1)** trung bình (bảng băm) | **O(n)** — quét tuần tự              |
| Thêm                                          | ~O(1) (`set`/`add`)             | O(1) với `push`                      |
| Xoá                                           | ~O(1) (`delete`)                | O(n) với `splice` (phải dời phần tử) |

Hệ quả rõ nhất là ở bài toán **lọc trùng hoặc kiểm tra thành viên trong vòng lặp**:

```js
// O(n²) — với 100k phần tử là treo trình duyệt
const dup = arr.filter((x, i) => arr.indexOf(x) !== i);

// O(n) — nhanh hơn hàng nghìn lần ở dữ liệu lớn
const seen = new Set();
const dup2 = arr.filter((x) => (seen.has(x) ? true : (seen.add(x), false)));
```

Lưu ý thực tế: với mảng **rất nhỏ** (vài chục phần tử), `includes` thường vẫn nhanh hơn vì `Set` tốn chi phí khởi tạo và băm. Ngoài ra, nếu bạn phải duyệt mảng để **dựng** `Set` rồi chỉ tra cứu đúng một lần thì không lợi gì — `Set` chỉ đáng giá khi tra cứu lặp lại nhiều lần. Và nhớ rằng `includes` dùng SameValueZero nên tìm được `NaN`, còn `indexOf` (dùng `===`) thì không.

</details>

**15. Bạn cần đếm tần suất xuất hiện của phần tử trong một mảng lớn — chọn `Map` hay `Object`? Giải thích lý do theo hiệu năng và tính đúng đắn.**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn **`Map`**.

```js
const counts = new Map();
for (const x of arr) {
  counts.set(x, (counts.get(x) ?? 0) + 1);
}
```

**Về tính đúng đắn** — đây là lý do quan trọng hơn:

- `Map` **giữ nguyên kiểu key**: `1` và `"1"` là hai key riêng, đếm không bị trộn. Với object, cả hai bị ép về `"1"` và cộng dồn nhầm.
- **Không dính prototype**: nếu dữ liệu chứa `"toString"`, `"constructor"` hay `"__proto__"`, object cho kết quả sai hoặc thậm chí ném lỗi. `Map` an toàn tuyệt đối. (Nếu buộc dùng object, phải `Object.create(null)`.)
- Key có thể là object, số, `NaN`, `boolean` — không cần tự chuyển sang string.

**Về hiệu năng:**

- `Map` được tối ưu cho việc **thêm/xoá key liên tục** — đúng kịch bản đếm tần suất với hàng nghìn key khác nhau. Object với key động liên tục sẽ khiến V8 chuyển sang **dictionary mode**, mất lợi thế hidden class.
- `Map` có `.size` sẵn, giữ thứ tự chèn, và duyệt kết quả bằng `for...of` trực tiếp.

Chỉ nên chọn `Object` khi key chắc chắn là string cố định, ít và cần `JSON.stringify` kết quả ngay.

</details>

---

## 2. Arrays và Typed Arrays

Bài học: [2. Arrays và Typed Arrays](../../javascript/05-data-structures/2_indexed-collections.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `typeof []` trả về `"object"`? Có những cách nào để kiểm tra một giá trị là array, và vì sao `Array.isArray()` được ưu tiên?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì **array trong JavaScript thực chất là object** — một object đặc biệt với key dạng số, prototype là `Array.prototype` và property `length` tự cập nhật. `typeof` chỉ phân biệt được 8 kiểu cơ bản, không có nhánh riêng cho array.

Các cách kiểm tra:

```js
Array.isArray([]); // true — chuẩn xác nhất
Object.prototype.toString.call([]); // "[object Array]"
[] instanceof Array; // true — nhưng có bẫy
typeof []; // "object" — vô dụng
```

`Array.isArray()` được ưu tiên vì nó kiểm tra **internal slot** của giá trị, đúng trong mọi tình huống:

- `instanceof Array` **sai khi mảng đến từ realm khác** — ví dụ mảng tạo trong một `iframe` hoặc `vm` của Node có `Array.prototype` riêng, nên `arr instanceof Array` trả về `false` dù nó thật sự là mảng.
- `instanceof` cũng bị đánh lừa nếu ai đó sửa `Symbol.hasInstance` hoặc prototype chain.
- `Object.prototype.toString.call()` thì đúng nhưng dài dòng và cũng có thể bị can thiệp qua `Symbol.toStringTag`.

</details>

**2. Phân loại các array method thành nhóm `mutating` và `non-mutating`. Kể ít nhất 4 method mỗi nhóm.**

<details className="qa">
<summary>Xem đáp án</summary>

| Mutating (sửa mảng gốc)           | Non-mutating (trả mảng/giá trị mới)                    |
| --------------------------------- | ------------------------------------------------------ |
| `push`, `pop`, `shift`, `unshift` | `map`, `filter`, `slice`, `concat`                     |
| `splice`, `sort`, `reverse`       | `flat`, `flatMap`, `join`, `reduce`                    |
| `fill`, `copyWithin`              | `toSorted`, `toReversed`, `toSpliced`, `with` (ES2023) |

```js
const arr = [3, 1, 2];

arr.sort(); // arr thành [1, 2, 3] — ĐÃ đổi mảng gốc
arr.map((x) => x); // trả mảng mới, arr giữ nguyên
```

**Mẹo nhớ:** 7 method mutating kinh điển là `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`. Hai cái nguy hiểm nhất là **`sort` và `reverse`**, vì tên nghe như "trả về kết quả" nhưng thật ra sửa tại chỗ rồi trả về chính mảng đó — rất dễ gây bug trong React khi vô tình mutate state. ES2023 thêm bộ `to*` chính là để có bản non-mutating cho ba method này cộng thêm `with`.

</details>

**3. So sánh `slice()` và `splice()` về tham số, giá trị trả về và tác động lên mảng gốc. Đoán output của `[1,2,3,4].splice(1, 2)`.**

<details className="qa">
<summary>Xem đáp án</summary>

|          | `slice(start, end)`                                  | `splice(start, deleteCount, ...items)`                      |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| Tham số  | Vị trí bắt đầu và **kết thúc** (không bao gồm `end`) | Vị trí bắt đầu, **số lượng cần xoá**, các phần tử chèn thêm |
| Trả về   | Mảng mới gồm các phần tử được cắt                    | Mảng chứa các phần tử **bị xoá**                            |
| Mảng gốc | **Không đổi**                                        | **Bị sửa tại chỗ**                                          |

```js
const a = [1, 2, 3, 4];
a.splice(1, 2); // trả về [2, 3]
console.log(a); // [1, 4] — mảng gốc đã bị cắt

const b = [1, 2, 3, 4];
b.slice(1, 2); // trả về [2]
console.log(b); // [1, 2, 3, 4] — nguyên vẹn

[1, 2, 3].splice(1, 0, "x"); // trả về [] — chèn "x", không xoá gì
```

Điểm bẫy thường gặp: tham số thứ hai mang ý nghĩa **khác hẳn nhau** — với `slice` là index kết thúc, với `splice` là số phần tử bị xoá. Bản non-mutating của `splice` là `toSpliced` (ES2023), trả về mảng mới sau khi cắt.

</details>

**4. `map()`, `filter()`, `forEach()` khác nhau thế nào về giá trị trả về? Khi nào dùng `forEach` là sai lựa chọn?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
const a = [1, 2, 3];

a.map((x) => x * 2); // [2, 4, 6] — mảng MỚI, cùng độ dài, phần tử đã biến đổi
a.filter((x) => x > 1); // [2, 3]    — mảng MỚI, độ dài <= gốc, giữ nguyên phần tử
a.forEach((x) => x * 2); // undefined — không trả về gì
```

- `map` — **biến đổi** từng phần tử, luôn giữ đúng số phần tử.
- `filter` — **chọn lọc** theo điều kiện, không đổi phần tử.
- `forEach` — chỉ **lặp để gây side effect** (log, gọi API, cập nhật DOM).

**Khi nào `forEach` là sai lựa chọn:**

- Khi bạn cần một kết quả — dùng `map`/`filter`/`reduce` để code nói rõ ý định và nối chuỗi được, thay vì `forEach` + `push` vào mảng ngoài.
- Khi cần **dừng sớm**: `forEach` không hỗ trợ `break`/`return` để thoát vòng lặp (`return` chỉ thoát một lần gọi callback). Dùng `for...of`, `some`, `find`.
- Khi callback là **async** và bạn cần chờ: `forEach` không `await` từng lần lặp. Dùng `for...of` với `await`, hoặc `Promise.all(arr.map(...))`.

</details>

**5. Giải thích `reduce()`: các tham số của callback, vai trò của `initialValue`, và điều gì xảy ra nếu gọi `reduce` trên mảng rỗng mà không có `initialValue`.**

<details className="qa">
<summary>Xem đáp án</summary>

`reduce` gộp cả mảng về **một giá trị duy nhất**. Callback nhận 4 tham số:

```js
arr.reduce((accumulator, currentValue, currentIndex, array) => {
  return accumulator; // giá trị trả về trở thành accumulator của vòng sau
}, initialValue);
```

**Vai trò của `initialValue`:**

- **Có** `initialValue`: `acc` bắt đầu bằng giá trị này, callback chạy từ index `0`.
- **Không** có: phần tử đầu tiên được lấy làm `acc`, callback chạy từ index `1`.

```js
[1, 2, 3].reduce((s, x) => s + x, 0); // 6
[1, 2, 3].reduce((s, x) => s + x); // 6 — nhưng chạy 2 vòng thay vì 3
[].reduce((s, x) => s + x, 0); // 0 — an toàn
[].reduce((s, x) => s + x); // TypeError: Reduce of empty array
// with no initial value
```

**Luôn truyền `initialValue`** vì hai lý do: tránh `TypeError` khi mảng rỗng (rất hay gặp với dữ liệu API), và bảo đảm **kiểu của `acc` đúng như mong muốn** — ví dụ gộp mảng object thành một object thì `acc` phải là `{}` ngay từ đầu, không thể là object đầu tiên.

</details>

**6. Cài đặt lại `map` (hoặc `filter`) bằng `reduce`. Điều này cho thấy gì về quan hệ giữa các method?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
// map bằng reduce
const map = (arr, fn) =>
  arr.reduce((acc, x, i) => {
    acc.push(fn(x, i, arr));
    return acc;
  }, []);

// filter bằng reduce
const filter = (arr, fn) =>
  arr.reduce((acc, x, i) => (fn(x, i, arr) ? [...acc, x] : acc), []);

map([1, 2, 3], (x) => x * 2); // [2, 4, 6]
filter([1, 2, 3], (x) => x > 1); // [2, 3]
```

Điều này cho thấy `reduce` là **method tổng quát nhất** trong nhóm — `map`, `filter`, `some`, `every`, `find`, `join`, `flat` đều có thể diễn đạt lại bằng `reduce`, vì bản chất chung của chúng là "duyệt mảng và tích luỹ một kết quả". `reduce` chỉ để lộ trực tiếp biến tích luỹ đó cho ta điều khiển.

Nhưng **có thể** không có nghĩa là **nên**: `map`/`filter` đọc ra ý định ngay lập tức, còn `reduce` bắt người đọc phải giải mã logic bên trong. Chỉ dùng `reduce` khi thật sự cần gộp về một giá trị (tổng, object nhóm, chuỗi) hoặc khi cần làm nhiều việc trong một lượt duyệt.

</details>

**7. Vì sao `[10, 9, 1].sort()` cho kết quả `[1, 10, 9]`? `sort()` mặc định so sánh thế nào và làm sao sắp xếp số đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `sort()` **không có compare function** thì mặc định **ép mọi phần tử sang string** rồi so sánh theo thứ tự các đơn vị mã UTF-16 (gần như thứ tự từ điển):

```js
[10, 9, 1].sort(); // [1, 10, 9]
// so sánh "10", "9", "1" như chuỗi:
// "1" < "10" < "9" vì ký tự đầu "1" đứng trước "9"
```

Muốn sắp xếp số đúng, phải truyền **comparator** trả về số âm/0/dương:

```js
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10] — tăng dần
[10, 9, 1].sort((a, b) => b - a); // [10, 9, 1] — giảm dần

// Với chuỗi tiếng Việt / có dấu, dùng localeCompare
["Ẩn", "An", "Ân"].sort((a, b) => a.localeCompare(b, "vi"));
```

Quy ước của comparator: trả **âm** nghĩa là `a` đứng trước `b`, **dương** là `b` đứng trước, **0** là giữ nguyên thứ tự tương đối. Lưu ý đừng dùng `a > b` (trả boolean) làm comparator — boolean bị ép về `1`/`0`, không bao giờ ra số âm, nên kết quả sai.

</details>

**8. `sort()` có `stable` không, có mutate mảng gốc không, và trả về gì? Làm sao sắp xếp mà giữ nguyên mảng ban đầu?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Stable:** có. Từ **ES2019**, spec bắt buộc `Array.prototype.sort` phải ổn định — hai phần tử được coi là bằng nhau sẽ giữ nguyên thứ tự tương đối ban đầu. Trước đó mỗi engine làm một kiểu (V8 từng dùng quicksort không ổn định cho mảng lớn).
- **Mutate:** có — `sort` sắp xếp **tại chỗ**.
- **Trả về:** chính **tham chiếu tới mảng gốc** đó, không phải bản sao. Đây là bẫy phổ biến:

```js
const a = [3, 1, 2];
const b = a.sort();
b === a; // true — cùng một mảng!
console.log(a); // [1, 2, 3] — a đã bị đổi
```

**Sắp xếp mà giữ nguyên mảng gốc** — ba cách:

```js
const sorted1 = a.toSorted((x, y) => x - y); // ES2023, gọn nhất
const sorted2 = [...a].sort((x, y) => x - y); // copy rồi sort
const sorted3 = a.slice().sort((x, y) => x - y);
```

Tính stable rất quan trọng khi **sắp xếp nhiều tiêu chí liên tiếp**: sort theo tên trước, rồi sort theo tuổi — những người cùng tuổi vẫn giữ đúng thứ tự tên đã sắp trước đó.

</details>

**9. `find()` khác `filter()` ở điểm nào? `some()` và `every()` trả về gì với mảng rỗng, và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

|          | `find()`                                              | `filter()`                                       |
| -------- | ----------------------------------------------------- | ------------------------------------------------ |
| Trả về   | **Phần tử đầu tiên** thoả điều kiện, hoặc `undefined` | **Mảng mới** chứa mọi phần tử thoả (có thể rỗng) |
| Dừng sớm | Có — gặp kết quả là dừng                              | Không — luôn duyệt hết mảng                      |

```js
const users = [{ id: 1 }, { id: 2 }, { id: 1 }];
users.find((u) => u.id === 1); // { id: 1 } — object đầu tiên
users.filter((u) => u.id === 1); // [{id:1}, {id:1}] — mảng
users.find((u) => u.id === 9); // undefined
users.filter((u) => u.id === 9); // [] — mảng rỗng, vẫn truthy!
```

Sai lầm hay gặp: `if (users.filter(...))` luôn đúng vì mảng rỗng là truthy — phải kiểm tra `.length`.

**Với mảng rỗng:**

```js
[].some((x) => true); // false
[].every((x) => false); // true (!)
```

`some` hỏi "có **ít nhất một** phần tử thoả không?" — không có phần tử nào thì không thể có cái nào thoả → `false`. `every` hỏi "có phần tử nào **vi phạm** không?" — không có phần tử nào thì không có gì vi phạm → `true`. Đây là quy ước logic gọi là **vacuous truth** (đúng một cách rỗng), thống nhất với toán học.

</details>

**10. So sánh `indexOf()` và `includes()`. Vì sao `[NaN].indexOf(NaN)` ra `-1` nhưng `[NaN].includes(NaN)` lại là `true`?**

<details className="qa">
<summary>Xem đáp án</summary>

|                                 | `indexOf(x)`                                  | `includes(x)`           |
| ------------------------------- | --------------------------------------------- | ----------------------- |
| Trả về                          | **Index** của phần tử, hoặc `-1` nếu không có | **Boolean**             |
| Thuật toán so sánh              | **Strict equality (`===`)**                   | **SameValueZero**       |
| Tìm được `NaN`                  | Không                                         | Có                      |
| Nhìn thấy lỗ trong sparse array | Không                                         | Có (coi là `undefined`) |

```js
[NaN].indexOf(NaN); // -1
[NaN].includes(NaN); // true
[1, 2, 3].indexOf(2); // 1
[1, 2, 3].includes(2); // true
[, ,].includes(undefined); // true
[, ,].indexOf(undefined); // -1
```

**Lý do:** `indexOf` dùng `===`, mà theo chuẩn IEEE 754 thì `NaN === NaN` là `false` — `NaN` không bằng chính nó, nên không bao giờ tìm thấy. `includes` (ES2016) được thiết kế sau và dùng **SameValueZero**, thuật toán giống `===` nhưng coi `NaN` bằng `NaN` (và gộp `+0` với `-0`). Đây cũng chính là thuật toán mà `Map`/`Set` dùng.

Thực hành: cần biết "có tồn tại không" thì dùng `includes` (rõ nghĩa và an toàn với `NaN`); cần biết "ở vị trí nào" mới dùng `indexOf`.

</details>

**11. `sparse array` là gì? Điều gì xảy ra với `a[100] = 1` trên mảng rỗng, và các method như `map`/`forEach` xử lý lỗ hổng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Sparse array** (mảng thưa) là mảng có **"lỗ"** — những index nằm trong khoảng `0..length-1` nhưng chưa bao giờ được gán giá trị. Lỗ khác `undefined`: index đó thật sự **không tồn tại** như một property.

```js
const a = [];
a[100] = 1;
a.length; // 101 — length nhảy lên theo index lớn nhất + 1
a[50]; // undefined — nhưng 50 in a → false
Object.keys(a); // ["100"] — chỉ đúng một property tồn tại
```

Các method xử lý lỗ **không nhất quán**, đây là nguồn bug khó chịu:

```js
[1, , 3].forEach((x) => console.log(x)); // in 1, 3 — BỎ QUA lỗ
[1, , 3].map((x) => x * 2); // [2, <1 empty>, 6] — giữ nguyên lỗ
[1, , 3].filter(() => true); // [1, 3] — LOẠI BỎ lỗ
[1, , 3].join("-"); // "1--3" — lỗ thành chuỗi rỗng
[1, , 3].includes(undefined); // true
```

**Nên tránh sparse array** vì hai lý do: hành vi khó đoán như trên, và **hiệu năng** — V8 tối ưu cho _packed array_; khi "đục lỗ", mảng bị chuyển sang **dictionary mode** chậm hơn nhiều. Vì vậy đừng viết `new Array(10000)` rồi gán rải rác; dùng `Array.from({length: n}, ...)` hoặc `new Array(n).fill(0)` để có mảng packed.

</details>

**12. Các method ES2023 `toSorted`, `toReversed`, `toSpliced`, `with` giải quyết vấn đề gì? Vì sao chúng hợp với React state?**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng là **bản non-mutating** của `sort`, `reverse`, `splice` và của phép gán `arr[i] = v` — trả về mảng mới, để nguyên mảng gốc.

```js
const arr = [3, 1, 2];

arr.toSorted(); // [1, 2, 3]
arr.toReversed(); // [2, 1, 3]
arr.toSpliced(1, 1); // [3, 2] — bỏ phần tử index 1
arr.with(0, 99); // [99, 1, 2] — thay index 0
console.log(arr); // [3, 1, 2] — vẫn nguyên vẹn
```

**Vấn đề chúng giải quyết:** trước đây phải tự sao chép rồi mới sửa (`[...items].sort(...)`) — dài dòng và rất dễ quên, mà quên một lần là mutate nhầm dữ liệu dùng chung.

**Vì sao hợp với React:** React so sánh state bằng **tham chiếu** (`Object.is`) để quyết định có render lại hay không. Nếu `sort` mảng state tại chỗ, tham chiếu **không đổi** → React tưởng không có gì thay đổi → **UI không cập nhật**, mà dữ liệu thì đã bị sửa ngầm. Các method `to*` luôn tạo mảng mới với tham chiếu mới, đúng mô hình immutable state:

```js
setItems(items.toSorted((a, b) => a.id - b.id));
setItems(items.with(index, newItem));
```

</details>

**13. Phân biệt `shallow copy` và `deep copy` với mảng. `slice()`, spread `[...arr]`, `structuredClone()` khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Shallow copy** chỉ sao chép **một tầng**: mảng mới là mảng riêng, nhưng các phần tử là object vẫn **dùng chung tham chiếu** với bản gốc. **Deep copy** sao chép đệ quy toàn bộ các tầng lồng nhau.

```js
const arr = [{ n: 1 }, { n: 2 }];

const shallow = [...arr]; // hoặc arr.slice(), arr.concat()
shallow[0].n = 99;
arr[0].n; // 99 — object bị sửa lây!
shallow.push({}); // nhưng arr.length không đổi

const deep = structuredClone(arr);
deep[0].n = 1;
arr[0].n; // 99 — độc lập hoàn toàn
```

| Cách                                              | Mức độ  | Ghi chú                                                                                  |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `slice()`, `[...arr]`, `concat()`, `Array.from()` | Shallow | Nhanh, đủ dùng cho mảng primitive                                                        |
| `structuredClone(arr)`                            | Deep    | Native, giữ được `Date`, `Map`, `Set`, `RegExp` và cả **tham chiếu vòng**                |
| `JSON.parse(JSON.stringify(arr))`                 | Deep    | Mất `undefined`, `function`, `Symbol`; `Date` biến thành string; lỗi với tham chiếu vòng |

`structuredClone` là lựa chọn mặc định hiện nay, nhưng **không clone được function, DOM node hay class instance** (mất prototype) — gặp những thứ đó sẽ ném `DataCloneError`.

</details>

**14. So sánh `flat()` và `flatMap()`. Làm phẳng mảng lồng nhiều cấp bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `flat(depth)` — làm phẳng mảng lồng, mặc định **1 cấp**, đồng thời **loại bỏ luôn các lỗ** của sparse array.
- `flatMap(fn)` — tương đương `map(fn)` rồi `flat(1)`, nhưng chỉ duyệt một lượt nên hiệu quả hơn. **Chỉ làm phẳng đúng 1 cấp**, không nhận tham số `depth`.

```js
[1, [2, [3, [4]]]].flat(); // [1, 2, [3, [4]]] — chỉ 1 cấp
[1, [2, [3, [4]]]].flat(2); // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4] — mọi cấp

[1, 2, 3].flatMap((x) => [x, x * 2]); // [1, 2, 2, 4, 3, 6]
[1, 2, 3].map((x) => [x, x * 2]).flat(); // kết quả giống, chậm hơn
```

**Làm phẳng nhiều cấp:** dùng `flat(Infinity)` khi không biết trước độ sâu — đây là cách gọn và chuẩn nhất.

`flatMap` đặc biệt hữu ích cho pattern **"map kèm lọc"**: trả về `[]` để bỏ phần tử, trả về `[x]` để giữ, trả về nhiều phần tử để nhân bản — làm được cả ba việc trong một lượt:

```js
users.flatMap((u) => (u.active ? [u.name] : [])); // vừa filter vừa map
```

</details>

**15. `TypedArray` khác `Array` thường ở những điểm nào? Vì sao `TypedArray` không có `push`/`splice`?**

<details className="qa">
<summary>Xem đáp án</summary>

|              | `Array`                                    | `TypedArray`                                                            |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| Kiểu phần tử | Bất kỳ, trộn lẫn tuỳ ý                     | **Một kiểu số cố định** (`Uint8`, `Int32`, `Float64`...)                |
| Kích thước   | Co giãn động                               | **Cố định** từ lúc khởi tạo                                             |
| Bộ nhớ       | Object với các property được engine tối ưu | Vùng byte liên tục trên `ArrayBuffer`, giống mảng C                     |
| Sparse       | Có thể có lỗ                               | Không — mọi ô luôn có giá trị (khởi tạo `0`)                            |
| API          | Đầy đủ                                     | Chỉ **tập con**: có `map`, `filter`, `slice`, `sort`, `set`, `subarray` |

```js
const u8 = new Uint8Array(3); // [0, 0, 0] — tự khởi tạo 0
u8[0] = 300; // 44 — bị wrap quanh 256, không báo lỗi
u8.push; // undefined
u8.length = 10; // không có tác dụng
```

**Vì sao không có `push`/`splice`:** `TypedArray` chỉ là một **view** lên một `ArrayBuffer` có kích thước byte cố định đã cấp phát sẵn. Thêm hay chèn phần tử đồng nghĩa phải cấp phát lại toàn bộ vùng nhớ và sao chép — trái ngược với mục đích của TypedArray là truy cập bộ nhớ trực tiếp, không tốn chi phí. Muốn "nối", phải tự tạo buffer mới lớn hơn rồi dùng `set()` để chép dữ liệu sang.

</details>

**16. Giải thích quan hệ giữa `ArrayBuffer` và các view như `Uint8Array`, `Int32Array`. Hai view khác kiểu trên cùng buffer sẽ thấy dữ liệu thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`ArrayBuffer` là **vùng nhớ nhị phân thô** — chỉ là một dãy byte, không có kiểu và **không đọc/ghi trực tiếp được**. Muốn thao tác phải tạo một **view** lên nó: `Uint8Array`, `Int32Array`, `Float64Array`... Mỗi view quy định cách **diễn giải** cùng những byte đó.

Nhiều view có thể trỏ vào **cùng một buffer**, và chúng chia sẻ đúng một vùng nhớ — ghi qua view này thì view kia thấy ngay:

```js
const buf = new ArrayBuffer(16); // 16 byte thô

const i32 = new Int32Array(buf); // 4 phần tử, mỗi phần tử 4 byte
const u8 = new Uint8Array(buf); // 16 phần tử, mỗi phần tử 1 byte

i32[0] = 0x12345678;
u8[0]; // 0x78 — byte thấp nhất, do CPU x86/ARM dùng little-endian
u8[1]; // 0x56
u8[3]; // 0x12
```

Một giá trị 32-bit được nhìn qua `Uint8Array` thành **4 byte riêng lẻ**, theo thứ tự little-endian (byte thấp trước). Đây chính là cách ta bóc tách hoặc lắp ghép dữ liệu nhị phân — ví dụ đọc header của file ảnh.

Khi cần kiểm soát endianness một cách tường minh (đọc format mạng theo big-endian), dùng **`DataView`** thay vì TypedArray, vì nó cho phép chỉ định endianness ở từng lần đọc/ghi.

</details>

**17. Khi nào bạn thực sự cần `TypedArray` trong dự án web? Nêu vài Web API bắt buộc dùng nó.**

<details className="qa">
<summary>Xem đáp án</summary>

Cần `TypedArray` khi làm việc với **dữ liệu nhị phân thật sự** hoặc khi cần **hiệu năng cao trên mảng số lớn**. Trong ứng dụng web nghiệp vụ thông thường (CRUD, form, danh sách) thì gần như không cần.

Các tình huống điển hình:

- **Xử lý ảnh trên canvas** — `ctx.getImageData().data` là một `Uint8ClampedArray` chứa từng pixel RGBA.
- **Đọc file/nhị phân từ mạng** — `await file.arrayBuffer()` hoặc `await response.arrayBuffer()` rồi bọc bằng `Uint8Array`.
- **Âm thanh** — WebAudio làm việc với `Float32Array` cho từng mẫu tín hiệu.
- **Đồ hoạ 3D** — WebGL nhận vertex/index buffer dưới dạng `Float32Array`, `Uint16Array`.
- **Mã hoá** — `crypto.getRandomValues()`, `crypto.subtle` nhận và trả `TypedArray`/`ArrayBuffer`.
- **Chuỗi ↔ byte** — `TextEncoder().encode(s)` trả `Uint8Array`, `TextDecoder().decode(bytes)` trả chuỗi.
- **WebAssembly** — bộ nhớ tuyến tính của Wasm được truy cập qua TypedArray.
- **Đa luồng** — `SharedArrayBuffer` chia sẻ bộ nhớ giữa Worker (cần header COOP/COEP), kết hợp `Atomics` để đồng bộ.

</details>
