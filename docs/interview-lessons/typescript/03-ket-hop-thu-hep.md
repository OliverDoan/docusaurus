---
sidebar_position: 3
title: "3. Kết hợp & Thu hẹp Type"
---

# 3. Kết hợp & Thu hẹp Type

## 1. Combining Types

Bài học: [1. Combining Types](../../typescript/03-ket-hop-thu-hep/1_combining-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Union (`|`) và intersection (`&`) khác nhau ra sao? Liên hệ với phép OR/AND trên tập hợp giá trị.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Union `A \| B` | Intersection `A & B` |
|---|---|---|
| Ý nghĩa | OR — là **một trong** các kiểu | AND — thoả mãn **đồng thời** mọi kiểu |
| Tập hợp giá trị | Hợp của hai tập | Giao của hai tập |
| Truy cập thuộc tính | Chỉ thuộc tính **chung** mọi nhánh | Có **đủ** thuộc tính của cả hai |

```ts
let id: number | string;      // là number HOẶC string
id = 1;  id = "abc";          // đều OK

type Named = { name: string };
type Aged = { age: number };
const p: Named & Aged = { name: "An", age: 25 }; // phải đủ cả hai
```

Điểm dễ nhầm: với **object type**, union làm tập *giá trị* rộng ra nhưng tập *thuộc tính dùng được* lại hẹp lại; intersection thì ngược lại — tập giá trị hẹp hơn (phải thoả cả hai shape) nhưng thuộc tính dùng được nhiều hơn. Nhớ theo tập hợp giá trị, đừng nhớ theo "gộp field", sẽ tránh được nhầm lẫn.

</details>

**2. Vì sao truy cập `x.legs` trên kiểu `Animal | Fish` bị báo lỗi, trong khi `x.name` lại hợp lệ?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
type Animal = { name: string; legs: number };
type Fish = { name: string; fins: number };

function describe(x: Animal | Fish) {
  console.log(x.name); // OK
  console.log(x.legs); // Error
}
```

Với union, TypeScript chỉ biết chắc `x` là **một trong hai** nhánh, nhưng không biết là nhánh nào. Để phép truy cập an toàn ở **mọi** khả năng, TS chỉ cho phép các thuộc tính có mặt trên **tất cả** các nhánh.

- `name` tồn tại ở cả `Animal` lẫn `Fish` → truy cập luôn an toàn → hợp lệ.
- `legs` chỉ có ở `Animal`. Nếu runtime `x` là `Fish`, `x.legs` sẽ là `undefined` và có thể gây lỗi ở bước sau → TS chặn.

Muốn dùng `legs`, phải **narrow** `x` về đúng nhánh `Animal` trước (bằng `in`, type guard, hoặc discriminant). Đây chính là lý do discriminated union được ưa chuộng.

</details>

**3. Làm sao thu hẹp một union xuống đúng một nhánh trước khi dùng thuộc tính riêng? Nêu ít nhất ba cách.**

<details className="qa">
<summary>Xem đáp án</summary>

Các cách narrow phổ biến:

- **Toán tử `in`** — kiểm tra sự tồn tại của property, hợp với union các object shape.
- **`typeof`** — khi union trộn primitive (`string | number`).
- **`instanceof`** — khi các nhánh là instance của class (`Date`, `Error`, class tự viết).
- **Discriminant check** — so sánh trường phân biệt: `if (shape.kind === "circle")`.
- **User-defined type guard** — `function isFish(x: Animal | Fish): x is Fish`.

```ts
function describe(x: Animal | Fish) {
  if ("legs" in x) {
    return x.legs;  // x: Animal
  }
  return x.fins;    // x: Fish
}

function isFish(x: Animal | Fish): x is Fish {
  return "fins" in x;
}
```

Sau khi narrow, control flow analysis tự cập nhật kiểu của `x` trong từng nhánh, nên không cần ép kiểu `as`. Nếu thấy mình phải viết nhiều `as`, thường là dấu hiệu union chưa được thiết kế tốt — nên thêm trường discriminant.

</details>

**4. Discriminated union (tagged union) là gì? Trường discriminant cần thoả điều kiện nào để narrow hoạt động?**

<details className="qa">
<summary>Xem đáp án</summary>

**Discriminated union** là union các object type, trong đó mọi nhánh cùng có một property đóng vai trò "nhãn" (discriminant / tag) để phân biệt. So sánh nhãn là TS narrow được ngay.

```ts
type Result =
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; message: string };

function render(r: Result) {
  if (r.status === "success") return r.data;      // r: nhánh success
  if (r.status === "error") return r.message;     // r: nhánh error
  return "Đang tải...";
}
```

Điều kiện để narrow hoạt động:

- Property discriminant phải **có mặt ở mọi nhánh** của union.
- Kiểu của nó phải là **literal type** (hoặc kiểu đơn vị như `null`, `undefined`, enum member) — không phải `string` chung chung.
- Mỗi nhánh mang một giá trị literal **khác nhau**.

Lợi ích kèm theo: kết hợp với `switch` và biến kiểu `never` ở nhánh `default`, compiler sẽ báo lỗi khi bạn thêm nhánh mới mà quên xử lý (exhaustiveness check).

</details>

**5. Đoán kết quả: `type A = { a: string } & { a: number };` — thuộc tính `a` có kiểu gì, và có tạo được giá trị hợp lệ cho `A` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Thuộc tính `a` có kiểu `string & number`, tức là **`never`**.

```ts
type A = { a: string } & { a: number };

const x: A = { a: "hi" }; // Error: string không gán được cho never
const y: A = { a: 1 };    // Error: number không gán được cho never
```

Giải thích: intersection trên object type được áp dụng **theo từng property trùng tên**. `a` phải đồng thời là `string` và là `number` — không tồn tại giá trị nào như vậy, nên kiểu của nó rút gọn về `never`.

Kết quả là **không tạo được giá trị hợp lệ nào cho `A`**. Điều đáng chú ý: bản thân type `A` **không** bị rút gọn thành `never` — nó vẫn là một object type có property kiểu `never`, nên khai báo `type A` không báo lỗi; lỗi chỉ xuất hiện lúc bạn thử gán giá trị.

Đây là cái bẫy kinh điển khi gộp hai type nguồn có field trùng tên khác kiểu: TS không cảnh báo tại chỗ định nghĩa, phải tới lúc dùng mới lộ.

</details>

**6. Intersection giữa hai primitive khác nhau như `string & number` cho ra kiểu gì? Giải thích theo góc nhìn tập hợp.**

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả là **`never`** — kiểu rỗng, không có giá trị nào thuộc về nó.

```ts
type Impossible = string & number; // never
type S = "a" & "b";                // never
type Ok = "a" & string;            // "a"
```

Theo góc nhìn tập hợp: mỗi kiểu là một **tập các giá trị**. `string` là tập mọi chuỗi, `number` là tập mọi số. Intersection chính là **phép giao**. Hai tập này hoàn toàn rời nhau (không giá trị nào vừa là chuỗi vừa là số), nên giao của chúng là **tập rỗng** — trong TypeScript tập rỗng được biểu diễn bằng `never`.

Cũng theo logic đó, `"a" & string` cho ra `"a"`, vì tập `{"a"}` nằm trọn trong tập `string` nên giao lại chính là `{"a"}`.

Hệ quả cần nhớ: `never` gán được cho mọi kiểu nhưng không kiểu nào (ngoài chính nó) gán được cho `never`. Khi thấy kiểu bất ngờ thành `never`, hãy nghi ngờ một intersection đang giao hai tập rời nhau.

</details>

**7. Khi nào dùng `type`, khi nào dùng `interface`? Liệt kê những thứ `type` biểu diễn được mà `interface` thì không.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `type` | `interface` |
|---|---|---|
| Object shape | OK | OK |
| Union / primitive | **OK** | Không |
| Tuple / function type | **OK** | Khó |
| Mapped, conditional, template literal | **OK** | Không |
| Mở rộng | `&` (intersection) | `extends` |
| Khai báo nhiều lần (merge) | Không | **Có** |

Những thứ chỉ `type` làm được: alias cho primitive (`type ID = string`), union (`type Status = "a" \| "b"`), tuple (`type Pair = [number, number]`), mapped type, conditional type, template literal type, và cả `typeof`/indexed access.

Cách chọn:

- Dùng `interface` cho shape object có thể bị `extends`/`implements`, đặc biệt với **public API của thư viện** — declaration merging cho phép người dùng "vá" thêm field.
- Dùng `type` cho union, intersection, tuple, và mọi kiểu không phải shape thuần.

Trong code ứng dụng, dùng cái nào cũng được — quan trọng là **chọn một quy ước và giữ nhất quán** trong codebase.

</details>

**8. Declaration merging của `interface` là gì? Vì sao tính năng này hữu ích cho thư viện nhưng lại rủi ro trong code ứng dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Declaration merging**: khai báo cùng một tên `interface` nhiều lần thì TS **gộp** tất cả lại thành một, thay vì báo lỗi trùng tên. `type` không có khả năng này — khai báo lại là lỗi ngay.

```ts
interface User { id: number; }
interface User { name: string; }
// User giờ là { id: number; name: string }
```

**Hữu ích cho thư viện** — đây là cơ chế chính thức để mở rộng kiểu của bên thứ ba mà không phải fork chúng. Ví dụ điển hình là bổ sung field vào `Request` của Express hay mở rộng `Window`:

```ts
declare global {
  interface Window { myAnalytics: { track(e: string): void }; }
}
```

**Rủi ro trong code ứng dụng:**

- Kiểu bị "mở" ngầm — một file ở đâu đó thêm field vào interface của bạn mà đọc code tại chỗ khai báo gốc không hề thấy.
- Khó truy nguồn khi debug: định nghĩa thật của một kiểu nằm rải rác nhiều file.
- Trùng tên vô tình không bị compiler bắt, biến thành merge im lặng.

Vì thế trong app code, nhiều team ưu tiên `type` (hoặc chỉ dùng merging trong file `.d.ts` dành riêng cho việc mở rộng).

</details>

**9. `extends` của `interface` và `&` của intersection khác nhau thế nào khi hai type có field trùng tên nhưng khác kiểu?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác nhau rõ nhất ở **thời điểm báo lỗi**.

**`interface extends`** — compiler kiểm tra tính tương thích ngay tại chỗ khai báo và **báo lỗi**:

```ts
interface A { x: string; }
interface B extends A { x: number; }
// Error: Interface 'B' incorrectly extends interface 'A'
```

**Intersection `&`** — không kiểm tra gì tại chỗ khai báo, chỉ **âm thầm giao hai kiểu** của property:

```ts
type A2 = { x: string };
type B2 = A2 & { x: number };
// x có kiểu string & number = never — khai báo không lỗi
const b: B2 = { x: 1 }; // Error chỉ xuất hiện lúc gán
```

Về mặt trải nghiệm: `extends` "fail fast", buộc bạn sửa xung đột ngay; `&` để lỗi trượt tới tận nơi sử dụng, thường khó hiểu hơn vì thông báo nhắc tới `never` chứ không nhắc xung đột.

Một khác biệt nữa: `extends` tạo quan hệ kế thừa được ghi nhận (hữu ích cho `implements`, cho thông báo lỗi dễ đọc, và tận dụng cache của compiler), còn `&` chỉ là phép hợp thành kiểu mới ẩn danh.

</details>

**10. `keyof T` trả về gì? Đoán kết quả của `keyof User` với `type User = { id: number; name: string; email: string }`.**

<details className="qa">
<summary>Xem đáp án</summary>

`keyof T` trả về **union các key** (dưới dạng literal type) của kiểu `T`.

```ts
type User = { id: number; name: string; email: string };
type UserKey = keyof User; // "id" | "name" | "email"
```

Kết quả là union ba string literal, **không phải** `string` chung chung. Nhờ vậy nó dùng được ở những chỗ cần giá trị chính xác:

```ts
const k: UserKey = "name";   // OK
const bad: UserKey = "age";  // Error
```

Vài điểm cần nhớ:

- `keyof` chỉ lấy key **công khai** của kiểu, kể cả key optional.
- Với object rỗng `keyof {}` cho `never`.
- Với type có index signature, kết quả không còn là literal (xem câu tiếp theo).

`keyof` gần như luôn đi kèm generic constraint `K extends keyof T` và indexed access `T[K]` — bộ ba này là nền tảng để viết hàm thao tác property an toàn kiểu.

</details>

**11. Vì sao `keyof` áp lên type có index signature dạng `[key: string]: number` lại ra `string | number` chứ không phải `string`?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
type Dict = { [key: string]: number };
type K = keyof Dict; // string | number
```

Lý do nằm ở hành vi của JavaScript: khi truy cập property bằng key số, JS **tự chuyển số thành chuỗi**.

```js
const o = {};
o[1] = "x";
o["1"]; // "x" — cùng một property
```

Nghĩa là với một object có index signature `[key: string]`, việc viết `dict[1]` là hoàn toàn hợp lệ tại runtime — số `1` sẽ được ép về `"1"` và khớp với index signature chuỗi. Để phản ánh đúng thực tế đó, TypeScript đưa cả `number` vào kết quả của `keyof`.

Đối xứng lại, nếu index signature là kiểu số thì không có chiều ngược:

```ts
type NumDict = { [key: number]: string };
type K2 = keyof NumDict; // number (không có string)
```

vì một key chuỗi bất kỳ (`"abc"`) không tự trở thành số được. Đây là chi tiết nhỏ nhưng hay bị hỏi để kiểm tra mức độ hiểu quan hệ giữa hệ thống kiểu TS và ngữ nghĩa JS bên dưới.

</details>

**12. Giải thích signature `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]` — vai trò của ràng buộc `extends keyof T` và của indexed access `T[K]`.**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "An" };
const id = getProp(user, "id");   // number
const x = getProp(user, "email"); // Error: "email" không phải key của user
```

Vai trò từng phần:

- **`T`** — kiểu của object, được suy luận từ đối số truyền vào.
- **`K extends keyof T`** — ràng buộc (constraint) buộc `K` phải là một trong các key thật của `T`. Đây là phần chặn lỗi gõ sai tên property ngay lúc biên dịch. Nếu bỏ ràng buộc và để `key: string`, TS sẽ không biết `obj[key]` trả về gì và cũng không chặn được key không tồn tại.
- **`T[K]`** — **indexed access type**, lấy đúng kiểu của property có tên `K` trong `T`. Nhờ nó, kiểu trả về thay đổi theo từng lần gọi: gọi với `"id"` được `number`, gọi với `"name"` được `string` — thay vì trả về union của mọi value type.

Đây là mẫu chuẩn cho mọi hàm truy cập/ghi property động mà vẫn giữ an toàn kiểu.

</details>

**13. `T[keyof T]` cho ra kết quả gì? Ứng dụng nó để lấy union các value type như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`T[keyof T]` là indexed access với key là **toàn bộ union key** của `T`, nên kết quả là **union các kiểu giá trị** của `T`.

```ts
type Values<T> = T[keyof T];

type Color = { red: 1; green: 2; blue: 3 };
type ColorValue = Values<Color>; // 1 | 2 | 3

type User = { id: number; name: string };
type UserValue = Values<User>;   // string | number
```

Cơ chế: `keyof Color` là `"red" | "green" | "blue"`, và indexed access phân phối trên union key, cho ra `Color["red"] | Color["green"] | Color["blue"]` tức `1 | 2 | 3`.

Ứng dụng thực tế phổ biến nhất là lấy union giá trị từ một object hằng, thay cho `enum`:

```ts
const Role = { Admin: "admin", User: "user" } as const;
type Role = (typeof Role)[keyof typeof Role]; // "admin" | "user"
```

Ở đây `as const` giữ literal type, `typeof Role` lấy kiểu của object, rồi `[keyof ...]` rút ra union các giá trị — cho ta cả object tra cứu lúc runtime lẫn kiểu chặt lúc biên dịch.

</details>

**14. Union distribution trong conditional type là gì? Vì sao `T extends U ? X : Y` lại phân phối khi `T` là một union, và làm sao tắt hành vi đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi `T` trong conditional type là một **naked type parameter** (đứng trần, không bị bọc), TS **áp điều kiện lên từng nhánh của union rồi hợp kết quả lại** — đó là union distribution.

```ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>; // string[] | number[] (không phải (string|number)[])

type Exclude2<T, U> = T extends U ? never : T;
type R2 = Exclude2<"a" | "b" | "c", "a">; // "b" | "c"
```

Cơ chế này chính là nền tảng của các utility type có sẵn như `Exclude`, `Extract`, `NonNullable`.

**Tắt distribution** bằng cách bọc cả hai vế trong tuple một phần tử, khiến `T` không còn "trần":

```ts
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type R3 = ToArrayNonDist<string | number>; // (string | number)[]
```

Khi nào cần tắt? Khi bạn muốn so sánh **cả union như một khối**, ví dụ kiểm tra `[T] extends [never]` để bắt đúng trường hợp `T` là `never` — nếu để phân phối, `never` (union rỗng) sẽ cho ra `never` một cách khó hiểu.

</details>

**15. Type alias có hỗ trợ đệ quy không? Hãy phác thảo định nghĩa kiểu `JsonValue` bao gồm cả object và array lồng nhau.**

<details className="qa">
<summary>Xem đáp án</summary>

Có. Type alias được phép tham chiếu tới chính nó, miễn là lần tham chiếu đó nằm trong một cấu trúc "trì hoãn" — property của object, phần tử của array/tuple, hoặc một nhánh của conditional type. Đệ quy trực tiếp kiểu `type X = X | string` mới bị cấm.

```ts
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const data: JsonValue = {
  name: "An",
  tags: ["a", "b"],
  meta: { active: true, score: null },
};
```

Ở đây `JsonValue` xuất hiện lại ở hai chỗ: phần tử của mảng và value của index signature — cả hai đều hợp lệ vì TS chỉ cần "mở" kiểu khi thực sự dùng tới.

Ứng dụng thường gặp: mô tả dữ liệu trả về từ `JSON.parse`, cấu trúc cây (menu, comment lồng nhau), hoặc kiểu đệ quy tiện ích như `DeepPartial<T>`. Lưu ý thực tế: kiểu đệ quy quá sâu có thể làm compiler chậm hoặc báo lỗi "type instantiation is excessively deep".

</details>

**16. Vì sao literal type kết hợp union (ví dụ `type Method = "GET" | "POST"`) thường được ưu tiên hơn `enum` trong codebase hiện đại?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
type Method = "GET" | "POST";      // literal union
enum MethodEnum { GET = "GET", POST = "POST" }
```

Lý do ưu tiên literal union:

- **Không sinh code runtime.** `type` bị xoá hoàn toàn khi biên dịch; `enum` (trừ `const enum`) sinh ra một object JS thật, làm tăng bundle size.
- **Dùng trực tiếp giá trị JS.** Với union bạn viết `request("GET")`; với enum phải import và viết `MethodEnum.GET`, bất tiện khi dữ liệu đến từ JSON hay API.
- **Hợp với dữ liệu ngoài.** Chuỗi từ API khớp thẳng vào union; với enum phải ép kiểu hoặc map lại.
- **Enum số có lỗ hổng an toàn:** numeric enum cho phép gán số bất kỳ ở nhiều phiên bản TS, và giá trị ngược (reverse mapping) dễ gây bất ngờ.
- **Enum dùng nominal typing** — hai enum cùng giá trị vẫn không tương thích, khác hẳn phần còn lại của TypeScript vốn structural.

Nếu vẫn cần một object tra cứu lúc runtime, mẫu thay thế phổ biến là `const` object kèm `as const`, rồi rút kiểu bằng `(typeof Obj)[keyof typeof Obj]`.

</details>

---

## 2. Type Guards và Narrowing

Bài học: [2. Type Guards và Narrowing](../../typescript/03-ket-hop-thu-hep/2_type-guards.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Type guard` và `narrowing` khác nhau thế nào? Cái nào là công cụ, cái nào là kết quả?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Type guard** là **công cụ** — đoạn code kiểm tra kiểu thực tế của giá trị tại thời điểm chạy: `typeof x === "string"`, `x instanceof Dog`, `"permissions" in p`, hay hàm predicate `isFish(pet)`.
- **Narrowing** là **kết quả** — quá trình compiler dựa vào các kiểm tra đó để rút gọn kiểu rộng (thường là union) thành kiểu cụ thể hơn trong từng nhánh code.

```ts
function shout(x: string | number) {
  if (typeof x === "string") { // type guard (công cụ)
    return x.toUpperCase();    // narrowing: x đã là string (kết quả)
  }
  return x.toFixed(2);         // nhánh còn lại: x là number
}
```

Nói cách khác: bạn viết guard, compiler thực hiện narrowing. Cầu nối giữa hai thứ là **control flow analysis** — engine theo dõi dòng chảy code để biết ở mỗi vị trí biến còn có thể mang kiểu gì. Guard chạy thật lúc runtime; narrowing chỉ tồn tại lúc biên dịch.

</details>

**2. Vì sao gọi `x.toUpperCase()` trên biến kiểu `string | number` bị báo lỗi, dù lúc chạy giá trị đúng là chuỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì TypeScript kiểm tra **tại thời điểm biên dịch**, còn "lúc chạy giá trị đúng là chuỗi" là thông tin chỉ có ở runtime. Compiler chỉ biết kiểu khai báo là `string | number`, và nó phải bảo đảm code hợp lệ với **mọi** khả năng của union đó.

```ts
function shout(x: string | number) {
  return x.toUpperCase();
  // Error: Property 'toUpperCase' does not exist on type 'string | number'.
}
```

Quy tắc: trên một union, chỉ truy cập được thành viên có mặt ở **tất cả** các nhánh. `toUpperCase` chỉ tồn tại trên `string`, `number` không có — nếu cho phép, một lần gọi `shout(5)` sẽ nổ `TypeError` lúc chạy.

Cách sửa là narrow trước khi dùng:

```ts
if (typeof x === "string") return x.toUpperCase();
```

Trong nhánh đó TS đã loại `number`, nên phép gọi trở nên an toàn — và bạn còn được autocomplete đúng method của `string`.

</details>

**3. `Control flow analysis` là gì và nó giúp compiler biết kiểu của biến tại từng điểm code ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Control flow analysis (CFA)** là engine của TypeScript đi theo **dòng chảy thực thi** của code — rẽ nhánh `if/else`, `switch`, `return`, `throw`, toán tử logic, vòng lặp — để tính ra kiểu **khả dĩ** của mỗi biến tại từng vị trí, thay vì chỉ dùng kiểu khai báo ban đầu.

```ts
function format(x: string | number) {
  // ở đây: x là string | number
  if (typeof x === "string") {
    return x.toUpperCase(); // nhánh true: x là string
  }
  return x.toFixed(2);      // nhánh false: x là number
}
```

CFA cũng hiểu các dạng thoát sớm:

```ts
function f(x: string | null) {
  if (x === null) return;   // thoát nếu null
  x.toUpperCase();          // từ đây trở đi x: string
}
```

Nó nhận diện `typeof`, `instanceof`, `in`, truthiness, so sánh literal, `Array.isArray`, type predicate và assertion function. Nhờ CFA, phần lớn ép kiểu `as` trở nên không cần thiết — nếu vẫn phải dùng `as` nhiều, thường là do cấu trúc dữ liệu chưa được mô hình hoá tốt.

</details>

**4. `typeof` trả về được bao nhiêu chuỗi kết quả? Vì sao `typeof null` lại là `"object"` và điều đó gây bẫy gì khi narrow?**

<details className="qa">
<summary>Xem đáp án</summary>

`typeof` trả về **8** chuỗi: `"string"`, `"number"`, `"boolean"`, `"bigint"`, `"symbol"`, `"undefined"`, `"object"`, `"function"`.

`typeof null === "object"` là một **bug lịch sử** của JavaScript từ bản đầu tiên (giá trị `null` được biểu diễn bằng con trỏ rỗng, mà các giá trị dạng object đều mang cùng tag kiểu). Sửa lại sẽ phá vỡ vô số code đang chạy, nên nó được giữ vĩnh viễn.

Cái bẫy khi narrow:

```ts
function f(x: { a: number } | null) {
  if (typeof x === "object") {
    x.a; // Error: 'x' is possibly 'null' — null vẫn lọt vào nhánh này
  }
}
```

Cách viết đúng:

```ts
if (x !== null) { x.a; }      // rõ ràng nhất
if (x) { x.a; }               // truthiness cũng loại null
if (typeof x === "object" && x !== null) { x.a; }
```

May là TypeScript đủ thông minh để **không** tự loại `null` trong nhánh `typeof x === "object"`, nên lỗi được bắt lúc biên dịch thay vì lúc chạy.

</details>

**5. Khi nào dùng `instanceof` thay cho `typeof`? Cho ví dụ mà `typeof` hoàn toàn không giúp được.**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `instanceof` khi cần phân biệt các **instance của class / constructor function**, vì `typeof` chỉ có 8 kết quả và mọi object đều trả về `"object"` — không phân biệt nổi.

```ts
class Dog { bark() {} }
class Cat { meow() {} }

function speak(a: Dog | Cat) {
  if (typeof a === "object") {
    // vô dụng: cả Dog lẫn Cat đều là "object"
  }
  if (a instanceof Dog) {
    a.bark();   // a: Dog
  } else {
    a.meow();   // a: Cat
  }
}
```

Ví dụ thực tế khác: phân biệt `Date` với `string`, hay xử lý lỗi:

```ts
try {
  risky();
} catch (e) {          // e: unknown
  if (e instanceof TypeError) console.log(e.message);
  else if (e instanceof Error) console.log(e.stack);
}
```

`instanceof` kiểm tra prototype chain lúc runtime, nên chỉ đúng với thứ thực sự tồn tại ở runtime: class, constructor function, các built-in như `Date`, `Error`, `RegExp`, `Map`.

</details>

**6. Vì sao `instanceof` không dùng được với `interface` hay `type alias`? Giải thích theo cơ chế `type erasure` lúc biên dịch.**

<details className="qa">
<summary>Xem đáp án</summary>

TypeScript áp dụng **type erasure**: mọi thứ thuần kiểu — `interface`, `type alias`, generic parameter, annotation — bị **xoá sạch** khi biên dịch sang JavaScript. File `.js` sinh ra không còn dấu vết nào của chúng.

```ts
interface Fish { swim(): void }

function isFish(x: unknown) {
  return x instanceof Fish; // Error: 'Fish' only refers to a type
}
```

Mà `instanceof` là toán tử **runtime**: nó lấy giá trị bên phải (phải là một constructor thật, có property `prototype`) rồi dò prototype chain của bên trái. `Fish` không tồn tại lúc chạy, nên không có gì để dò.

`class` thì khác — nó vừa là kiểu vừa là **giá trị runtime**, nên dùng được với `instanceof`.

Với interface, type alias hay object literal, hãy dùng:

- Toán tử **`in`**: `if ("swim" in pet)`.
- **Type predicate** tự viết: `function isFish(pet: Fish | Bird): pet is Fish { return "swim" in pet; }`.
- **Discriminated union** với field tag — cách sạch và mở rộng tốt nhất.

</details>

**7. Toán tử `in` narrow bằng cách nào? So với `instanceof`, khi nào bạn ưu tiên `in`?**

<details className="qa">
<summary>Xem đáp án</summary>

`in` kiểm tra **sự tồn tại của property** trên object (kể cả kế thừa qua prototype chain). TS dùng thông tin đó để giữ lại những nhánh của union có khai báo property ấy và loại các nhánh còn lại.

```ts
type Admin = { role: "admin"; permissions: string[] };
type User = { role: "user"; email: string };

function check(p: Admin | User) {
  if ("permissions" in p) {
    console.log(p.permissions); // p: Admin
  } else {
    console.log(p.email);       // p: User
  }
}
```

| | `in` | `instanceof` |
|---|---|---|
| Cần gì ở runtime | Chỉ cần object có property | Cần một constructor thật |
| Dùng với interface / type alias | **Được** | Không |
| Dùng với object literal, dữ liệu JSON | **Được** | Không |
| Qua iframe / worker | Vẫn đúng | Có thể sai |

Ưu tiên `in` khi làm việc với shape thuần (dữ liệu API, object literal, interface) — tức phần lớn code TypeScript đời thường. Chỉ chọn `instanceof` khi đối tượng thật sự là instance của class.

Lưu ý: property optional (`a?: string`) làm `in` kém tin cậy, vì nó có thể vắng mặt ở nhánh đáng lẽ khớp.

</details>

**8. Đoán lỗi: hàm nhận `n: number | undefined`, bên trong viết `if (n)` rồi xử lý. Bug nào sẽ xuất hiện và sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bug: **giá trị `0` bị loại nhầm cùng với `undefined`**.

```ts
function setCount(n: number | undefined) {
  if (n) {
    console.log(n); // n: number — nhưng n === 0 không bao giờ vào đây
  }
}

setCount(0); // không in gì cả — thường là sai ý định
```

Truthiness check loại bỏ **mọi giá trị falsy**, mà `0` (và `NaN`) là số falsy. Về mặt kiểu thì TS vẫn narrow đúng thành `number`, nên compiler không báo gì — đây là lỗi **logic**, chỉ lộ ra lúc chạy. Đó là lý do nó hay được hỏi trong phỏng vấn.

Cách sửa — kiểm tra tường minh:

```ts
if (n !== undefined) { console.log(n); }      // rõ ràng nhất
if (typeof n === "number") { console.log(n); }
const count = n ?? 10;                        // ?? chỉ bắt null/undefined, giữ 0
```

Chú ý cùng họ: `||` cũng dính bẫy này (`n || 10` biến `0` thành `10`), nên với giá trị mặc định hãy dùng `??` (nullish coalescing).

</details>

**9. `Truthiness check` loại bỏ những giá trị nào? Kể đủ danh sách `falsy` và giải thích rủi ro với `string` rỗng.**

<details className="qa">
<summary>Xem đáp án</summary>

Danh sách **falsy** trong JavaScript gồm 7 giá trị: `false`, `0` (và `-0`), `0n` (BigInt zero), `""` (chuỗi rỗng), `null`, `undefined`, `NaN`. Mọi thứ còn lại đều truthy — kể cả `[]`, `{}` và `"0"`.

```ts
function greet(name: string | null) {
  if (name) {
    console.log(name.toUpperCase()); // name: string, null đã bị loại
  }
}
```

**Rủi ro với chuỗi rỗng:** `""` là một `string` hợp lệ, nhưng truthiness check vứt nó đi cùng `null`/`undefined`.

```ts
function render(label: string | undefined) {
  if (label) {
    show(label);     // label === "" sẽ bị bỏ qua
  }
}
```

Nếu chuỗi rỗng mang ý nghĩa (người dùng cố tình xoá trắng một trường, tên hiển thị để trống), logic này sai. Sửa bằng kiểm tra tường minh `if (label !== undefined)`, hoặc dùng `??` thay `||` khi đặt giá trị mặc định: `const text = label ?? "Không có";` giữ nguyên `""`, còn `label || "Không có"` thì không.

</details>

**10. Vì sao `equality check` (`dir === "left"`) cũng narrow được? Điều gì trong hệ kiểu cho phép việc đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì TypeScript có **literal type** — `"left"` không chỉ là giá trị mà còn là một kiểu chỉ chứa đúng giá trị đó. Khi so sánh bằng `===`, compiler biết trong nhánh true biến phải nằm trong giao của kiểu hiện tại và literal đó; các nhánh không khớp bị loại khỏi union.

```ts
function move(dir: "left" | "right" | "up") {
  if (dir === "left") {
    // dir: "left"
  } else {
    // dir: "right" | "up"  — TS tự trừ đi nhánh đã xử lý
  }
}
```

Điều kiện để hoạt động: kiểu của biến phải là union các **kiểu đơn vị** (literal string/number/boolean, `null`, `undefined`, enum member). Nếu kiểu là `string` chung chung thì `dir === "left"` không narrow được gì thêm — vẫn là `string`.

So sánh hai biến với nhau cũng narrow cả hai chiều, và `!==` narrow nhánh còn lại. Đây chính là cơ chế nền của **discriminated union**: so sánh field tag bằng `===` (hoặc `switch`) để rẽ nhánh toàn bộ object.

</details>

**11. `Discriminated union` là gì? Field `discriminator` phải thoả điều kiện gì để TS narrow tự động trong `switch`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Discriminated union** (tagged union) là union các object type, mọi nhánh cùng có một field đóng vai trò "nhãn" để phân biệt. So sánh nhãn đó là TS narrow được cả object.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    case "rect":   return s.w * s.h;
  }
}
```

Điều kiện của field discriminator:

- **Có mặt ở mọi nhánh** của union.
- Kiểu là **literal / kiểu đơn vị** (string literal, number literal, boolean, enum member) — không được là `string` chung chung.
- Mỗi nhánh mang **giá trị khác nhau**, không trùng lặp.
- Nên là field bắt buộc, không optional.

Đây là pattern ưa thích cho state machine, Redux action, node của AST, kết quả API dạng `{ status: "success" | "error" }`.

</details>

**12. Vì sao `discriminated union` được coi là mạnh hơn việc kiểm tra sự tồn tại của property? Nêu ít nhất hai lý do.**

<details className="qa">
<summary>Xem đáp án</summary>

So với việc dò property bằng `in` hay `!== undefined`:

- **Ý định rõ ràng, không phụ thuộc chi tiết cài đặt.** Tag `kind: "circle"` nói thẳng "đây là hình tròn"; còn `"radius" in s` chỉ suy đoán gián tiếp qua một field ngẫu nhiên. Khi hai nhánh lỡ có chung field, cách dò property gãy ngay.
- **Hỗ trợ `switch` và exhaustiveness check.** Với tag, bạn viết `switch (s.kind)` rồi thêm nhánh `default` gán vào `never` — thêm một loại mới vào union mà quên xử lý là compiler báo lỗi ngay. Dò property không cho bạn cơ chế này.
- **Mở rộng tốt.** Thêm nhánh mới chỉ cần đặt tag mới; không phải tìm xem field nào là "duy nhất" của nhánh đó.
- **An toàn với optional property.** `"email" in p` cho kết quả sai nếu `email` là optional và tình cờ vắng mặt; tag thì luôn có.
- **Đọc và debug dễ.** Dữ liệu tự mô tả — nhìn JSON log là biết ngay object thuộc loại nào.

</details>

**13. Viết `type predicate` dạng `pet is Fish` nghĩa là gì với compiler? Chuyện gì xảy ra nếu thân hàm trả về sai kết quả?**

<details className="qa">
<summary>Xem đáp án</summary>

`pet is Fish` là **type predicate** — nó nói với compiler: "hàm này trả về `boolean`, và khi kết quả là `true` thì tham số `pet` chắc chắn thuộc kiểu `Fish`". Nhờ đó TS narrow được ở nơi gọi.

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) pet.swim(); // pet: Fish
  else pet.fly();              // pet: Bird
}
```

Nếu thân hàm **trả về sai**, compiler không phát hiện được. TS chỉ kiểm tra rất lỏng rằng kiểu predicate có liên quan tới kiểu tham số, còn **logic bên trong là lời hứa của bạn** — nó không xác minh.

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return true; // biên dịch trót lọt!
}
// hệ quả: gọi pet.swim() trên một Bird → TypeError lúc chạy
```

Vì vậy predicate phải được viết cẩn thận, kiểm tra đủ mọi field đặc trưng. Với dữ liệu ngoài (API), nên dùng thư viện validate như Zod và lấy predicate từ đó thay vì tự viết thủ công.

</details>

**14. So sánh `type predicate` (`is`) với `assertion function` (`asserts`): khác nhau ở thời điểm narrow và cách báo lỗi.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Type predicate (`is`) | Assertion function (`asserts`) |
|---|---|---|
| Kiểu trả về | `boolean` | `void` (hoặc không bao giờ trả về) |
| Thời điểm narrow | **Trong nhánh `if`** dùng kết quả | **Sau lời gọi**, cho phần còn lại của scope |
| Khi điều kiện sai | Trả `false`, bạn tự xử lý nhánh else | **Throw** — dừng luồng thực thi |
| Hợp với | Rẽ nhánh, `filter`, kiểm tra tuỳ chọn | Validate đầu vào, "fail fast" |

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
if (isFish(pet)) pet.swim();   // narrow trong if

function assertString(val: unknown): asserts val is string {
  if (typeof val !== "string") throw new Error("Not a string");
}
function upper(x: unknown) {
  assertString(x);
  return x.toUpperCase();      // narrow từ đây trở đi
}
```

Chọn predicate khi cả hai nhánh đều hợp lệ và cần xử lý riêng; chọn assertion khi dữ liệu sai kiểu là lỗi nghiêm trọng, không có gì để làm tiếp — nó giúp code phẳng hơn, tránh lồng `if` nhiều tầng.

</details>

**15. Vì sao một `assertion function` gán vào biến (dạng `const assertIsString = ...`) lại phải khai báo kiểu tường minh?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì TypeScript yêu cầu: mọi tên trong biểu thức gọi một assertion function phải được khai báo với **kiểu tường minh**. Nếu chỉ để suy luận, compiler báo lỗi *"Assertions require every name in the call target to be declared with an explicit type annotation"*.

```ts
// Không được — kiểu chỉ được suy luận
const assertIsString = (val: unknown): asserts val is string => {
  if (typeof val !== "string") throw new Error("Not a string");
};
assertIsString(x); // Error

// Được — annotate tường minh cho biến
type AssertIsString = (val: unknown) => asserts val is string;
const assertIsString2: AssertIsString = (val) => {
  if (typeof val !== "string") throw new Error("Not a string");
};
assertIsString2(x);
x.toUpperCase(); // OK
```

Lý do thiết kế: hiệu ứng `asserts` ảnh hưởng tới **toàn bộ dòng code phía sau**, nên nó phải được xác định chắc chắn ngay từ khai báo, không được phụ thuộc vào suy luận có thể đổi khi refactor. Vì biến có thể bị gán lại, TS không tin vào kiểu suy luận trong trường hợp này.

Cách đơn giản nhất để tránh rắc rối: khai báo assertion function bằng `function` declaration thay vì arrow function gán vào biến.

</details>

**16. `Exhaustiveness check` với `never` hoạt động ra sao? Nó giúp gì khi bạn thêm một nhánh mới vào union?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: sau khi `switch` đã xử lý hết mọi nhánh của một discriminated union, kiểu còn lại ở `default` phải là `never`. Gán nó vào một biến kiểu `never` để compiler kiểm hộ.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.size ** 2;
    default: {
      const _exhaustive: never = s; // s: never nếu đã xử lý đủ
      throw new Error(`Shape không hỗ trợ: ${_exhaustive}`);
    }
  }
}
```

Khi bạn **thêm nhánh mới** (ví dụ `{ kind: "rect"; w: number; h: number }`) mà quên bổ sung `case`, kiểu của `s` ở `default` không còn là `never` mà là nhánh `rect` — phép gán vào `never` **báo lỗi biên dịch ngay**.

Giá trị thực tế: biến một lỗi runtime im lặng (hàm trả về `undefined`, UI hiển thị sai) thành lỗi compile, và compiler tự chỉ cho bạn mọi chỗ cần cập nhật khi union mở rộng. Rất hữu ích với reducer, state machine, router.

</details>

**17. Khi nào bạn chọn `type predicate` tự viết thay vì `as` (type assertion)? Rủi ro của `as` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt cốt lõi: **`as` chỉ là lời khẳng định suông lúc biên dịch, không sinh ra bất kỳ kiểm tra nào lúc chạy**; còn type predicate buộc bạn viết logic kiểm tra thật.

```ts
const user = data as User;      // không kiểm tra gì, tin là đúng
user.name.toUpperCase();        // nổ nếu data không có name

function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null && "name" in x;
}
if (isUser(data)) data.name.toUpperCase(); // an toàn
```

Rủi ro của `as`:

- **Tắt kiểm tra kiểu** đúng chỗ nguy hiểm nhất, thường là ranh giới dữ liệu ngoài (API, `JSON.parse`, `localStorage`).
- Lỗi bị đẩy sang runtime, xa nơi gây ra, khó debug.
- Khi kiểu đích thay đổi, `as` vẫn im lặng — không có cảnh báo nào.

Chọn predicate khi giá trị đến từ **bên ngoài** hệ thống kiểu, khi cần narrow dùng lại ở nhiều nơi, hoặc khi dùng trong `filter`. Chỉ dùng `as` khi bạn biết chắc hơn compiler và giá trị vốn đã nằm trong code của mình (ví dụ ép literal, `as const`, hoặc thu hẹp sau một kiểm tra đã làm ở nơi khác).

</details>

**18. Narrowing bị "mất" trong những tình huống nào (callback, closure, gán lại biến, property của object)? Cách xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Narrowing chỉ có hiệu lực khi compiler chắc chắn giá trị không đổi giữa lúc kiểm tra và lúc dùng. Các tình huống bị mất:

- **Callback / closure**: TS không biết callback chạy lúc nào, nên narrowing bên ngoài không giữ được với biến `let`.
- **Gán lại biến**: sau một phép gán mới, kiểu quay về kiểu khai báo.
- **Property của object**: sau khi gọi một hàm bất kỳ, TS coi như property có thể đã bị thay đổi nên xoá narrowing (nhất là với property mutable của object không phải `const`).
- **Phần tử mảng truy cập bằng index**: `arr[i]` không được theo dõi narrowing.

```ts
function f(x: string | null) {
  if (x) {
    setTimeout(() => x.toUpperCase(), 0); // OK nếu x là tham số (không gán lại)
  }
}

function g(o: { v?: string }) {
  if (o.v) {
    doSomething();
    o.v.toUpperCase(); // có thể mất narrowing
  }
}
```

Cách xử lý: **gán ra biến `const` cục bộ** ngay sau khi narrow rồi dùng biến đó (`const v = o.v; if (v) v.toUpperCase();`); ưu tiên `const` thay `let`; dùng optional chaining `o.v?.toUpperCase()`; hoặc destructure property ra trước khi kiểm tra.

</details>
