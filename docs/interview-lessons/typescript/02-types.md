---
sidebar_position: 2
title: "2. Types"
---

# 2. Types

## 1. Primitive Types

Bài học: [1. Primitive Types](../../typescript/02-types/1_primitive-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kể sáu kiểu primitive được trình bày trong bài. Ngoài chúng, JavaScript và TypeScript còn kiểu nguyên thủy nào nữa?**

<details className="qa">
<summary>Xem đáp án</summary>

Sáu kiểu bài này trình bày:

| Kiểu | Lưu giá trị |
|---|---|
| `boolean` | true / false |
| `number` | số nguyên & số thực (IEEE-754 64-bit) |
| `string` | chuỗi ký tự |
| `void` | hàm không trả giá trị |
| `null` | rỗng có chủ ý |
| `undefined` | chưa được gán |

Ngoài ra JavaScript còn hai kiểu nguyên thủy nữa mà TypeScript cũng có type tương ứng:

- **`bigint`** (ES2020) — số nguyên lớn không giới hạn độ chính xác, viết với hậu tố `n`: `9007199254740993n`.
- **`symbol`** (ES6) — giá trị duy nhất, thường dùng làm key không đụng độ cho object.

Riêng phía TypeScript còn có các kiểu đặc biệt không phải primitive của JS như `any`, `unknown`, `never` — chúng chỉ tồn tại ở tầng type, không có ở runtime.

</details>

**2. Vì sao `number` trong TypeScript không phân biệt số nguyên với số thực? Chuẩn biểu diễn nào đứng sau?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì TypeScript chỉ là lớp kiểu phủ lên JavaScript — nó không thêm kiểu số mới ở runtime. JavaScript chỉ có **một** kiểu số duy nhất, biểu diễn theo chuẩn **IEEE-754 double precision (64-bit)**, nên `1` và `1.0` là cùng một giá trị. Do đó TypeScript không có `int`, `float`, `double`, `long` như Java hay C#; tất cả gom vào `number`.

```ts
let age: number = 25;    // "số nguyên"
let price: number = 9.99; // số thực
let hex: number = 0xff;   // vẫn là number
```

Hệ quả cần nhớ: phép chia không tự làm tròn (`5 / 2` ra `2.5`), và số thực có sai số nhị phân (`0.1 + 0.2 !== 0.3`). Muốn diễn đạt "chỉ nhận số nguyên" thì phải tự kiểm tra ở runtime (`Number.isInteger`) hoặc dùng branded type, chứ hệ kiểu không làm thay.

</details>

**3. `Number.MAX_SAFE_INTEGER` bằng bao nhiêu, và điều gì xảy ra khi phép tính vượt ngưỡng đó? Khi nào phải chuyển sang `bigint`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Number.MAX_SAFE_INTEGER` = `2^53 - 1` = `9007199254740991`. Đây là số nguyên lớn nhất mà kiểu `number` (IEEE-754 64-bit) còn biểu diễn được **chính xác từng đơn vị**.

Vượt ngưỡng, các số nguyên liền kề không còn phân biệt được nữa — kết quả bị làm tròn âm thầm, không có lỗi nào được ném ra:

```ts
const safe: number = 9007199254740991;
console.log(safe + 1); // 9007199254740992
console.log(safe + 2); // 9007199254740992 — sai!
```

Nên chuyển sang `bigint` khi làm việc với: ID lớn từ database (snowflake ID, ID 64-bit), số tiền tính theo đơn vị nhỏ nhất với giá trị rất lớn, timestamp nanosecond, hoặc tính toán mật mã. Ngược lại, với số lượng, giá tiền thông thường, chỉ số mảng thì `number` là đủ và nhanh hơn.

</details>

**4. `number` và `bigint` có tự động convert qua lại không? Đoán xem `const x: number = 1n;` báo lỗi gì.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** `number` và `bigint` là hai kiểu hoàn toàn tách biệt, không gán lẫn nhau được và cũng không trộn trong cùng phép tính số học. Muốn chuyển phải ép tường minh bằng `Number(big)` hoặc `BigInt(num)`.

```ts
const x: number = 1n;
// Error: Type 'bigint' is not assignable to type 'number'.

const a: bigint = 10n;
const b: number = 5;
a + b; // Error: Operator '+' cannot be applied to types 'bigint' and 'number'.

const ok = a + BigInt(b); // 15n — phải ép tường minh
```

Lý do của quy định nghiêm ngặt này: `Number(bigint)` có thể **mất độ chính xác** khi giá trị vượt `MAX_SAFE_INTEGER`, còn `BigInt(number)` sẽ ném `RangeError` nếu số đó không phải số nguyên. Bắt lập trình viên viết rõ bước chuyển đổi giúp lỗi mất mát dữ liệu lộ ra ngay tại chỗ.

</details>

**5. `boolean` khác `Boolean` ở điểm nào? Vì sao gán một `Boolean` cho biến `boolean` lại lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

- `boolean` (chữ thường) là **kiểu nguyên thủy** — giá trị `true` / `false` thuần.
- `Boolean` (chữ hoa) là **object wrapper** — interface mô tả đối tượng bọc quanh giá trị boolean, tạo ra bằng `new Boolean(...)`.

```ts
let a: boolean = true;
let b: Boolean = true;
a = b; // Error: Type 'Boolean' is not assignable to type 'boolean'
```

Chiều gán chỉ đi được một hướng: mọi `boolean` đều dùng được ở nơi cần `Boolean` (vì primitive tự động được bọc khi gọi method), nhưng ngược lại thì không — một `Boolean` có thể là object thực sự, mà object thì luôn truthy kể cả khi bọc giá trị `false`:

```ts
if (new Boolean(false)) console.log("vẫn chạy!"); // object luôn truthy
```

Quy tắc chung: **luôn dùng chữ thường** — `boolean`, `number`, `string`. Các wrapper `Boolean`, `Number`, `String` gần như không bao giờ nên xuất hiện trong annotation.

</details>

**6. `void` khác `undefined` như thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `void` | `undefined` |
|---|---|---|
| Ý nghĩa | "đừng quan tâm giá trị trả về" | một **giá trị thực** |
| Vị trí dùng | return type của hàm | kiểu của biến / property |
| Gán được gì | hàm trả về bất cứ thứ gì (khi khớp signature) | chỉ chính giá trị `undefined` |

Dùng `void` khi khai báo hàm chỉ chạy để gây tác dụng phụ, không dùng kết quả:

```ts
function log(msg: string): void {
  console.log(msg);
}
```

Dùng `undefined` khi mô tả một giá trị có thể vắng mặt — thường trong union:

```ts
let found: string | undefined;
function find(id: number): User | undefined { /* ... */ }
```

Điểm dễ nhầm: `void` không có nghĩa là "phải trả về `undefined`". Với biến kiểu `void`, bạn gần như không làm được gì với giá trị đó — đó đúng là ý đồ thiết kế.

</details>

**7. Vì sao `const cb: () => void = () => 42;` được compiler chấp nhận dù hàm trả về `number`? Quy tắc đó phục vụ tình huống thực tế nào, ví dụ `arr.forEach(x => other.push(x))`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `void` ở vị trí return type của một **kiểu hàm** mang nghĩa "người gọi sẽ bỏ qua giá trị trả về", chứ không phải "hàm bắt buộc trả về `undefined`". Trả thừa một giá trị mà không ai dùng thì hoàn toàn vô hại, nên TypeScript cho phép:

```ts
type Callback = () => void;
const cb: Callback = () => 42; // OK, dù trả về number
```

Lưu ý phân biệt: quy tắc nới lỏng này **chỉ áp dụng khi gán kiểu hàm**. Nếu khai báo trực tiếp `function f(): void { return 42; }` thì vẫn lỗi.

Tình huống thực tế chính là các callback rút gọn kiểu `arr.forEach(x => other.push(x))`. `forEach` khai báo callback trả `void`, còn `push` trả về `number` (độ dài mới). Nếu TypeScript bắt chặt, bạn sẽ phải viết `x => { other.push(x); }` với dấu ngoặc nhọn ở mọi chỗ. Tương tự với `.then(() => setState(...))`, `addEventListener("click", () => count++)`.

</details>

**8. `null` và `undefined` khác nhau về ngữ nghĩa ra sao? Trong thực tế nên thống nhất chọn cái nào để biểu thị "không có giá trị"?**

<details className="qa">
<summary>Xem đáp án</summary>

- `undefined`: **chưa được gán** — biến khai báo mà chưa có giá trị, property không tồn tại, hàm không `return`, tham số optional không truyền. Đây là trạng thái "vắng mặt" mặc định do chính engine tạo ra.
- `null`: **rỗng có chủ ý** — lập trình viên gán vào để nói "chỗ này cố ý trống", ví dụ user chưa chọn avatar, kết quả tìm kiếm không có.

```ts
let a: undefined = undefined; // chưa gán
let b: null = null;           // cố ý rỗng
```

Trong thực tế, **nên thống nhất một kiểu duy nhất trong codebase** để tránh phải kiểm tra cả hai ở mọi chỗ. Phần lớn dự án TypeScript hiện đại (và style guide của chính team TypeScript) chọn `undefined`, vì nó ăn khớp sẵn với optional property (`name?: string`), default parameter và optional chaining. `null` vẫn phải chấp nhận ở ranh giới hệ thống — JSON từ API, kết quả truy vấn database, các DOM API như `document.getElementById` — nên thường chuẩn hoá về `undefined` ngay tại lớp tiếp nhận dữ liệu.

</details>

**9. Bật và tắt `strictNullChecks` thì `let name: string = null;` khác nhau thế nào? Vì sao đây được coi là flag quan trọng nhất với type safety?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
// strictNullChecks: false → OK, compiler im lặng
// strictNullChecks: true  → Error: Type 'null' is not assignable to type 'string'
let name: string = null;

// Muốn hợp lệ khi bật flag, phải khai báo tường minh qua union:
let name2: string | null = null; // OK
```

- **Tắt**: `null` và `undefined` được coi là thành viên của **mọi kiểu** — gán vào đâu cũng lọt. Annotation `string` không còn bảo đảm điều gì.
- **Bật**: chúng trở thành **kiểu riêng**, muốn cho phép thì phải viết ra trong union, và compiler ép bạn thu hẹp kiểu (narrowing) trước khi dùng.

Đây là flag quan trọng nhất vì nhóm lỗi phổ biến nhất khi chạy JavaScript chính là `Cannot read property 'x' of null/undefined` — lỗi mà Tony Hoare gọi là "sai lầm tỷ đô". Khi tắt flag, TypeScript hoàn toàn bất lực trước nhóm lỗi này; bật lên thì compiler bắt gần như toàn bộ chúng ngay lúc build. `strictNullChecks` nằm trong nhóm bật sẵn khi đặt `"strict": true` trong `tsconfig.json`.

</details>

**10. String literal type là gì? Khai báo `let d: "left" | "right"` khác `let d: string` ở chỗ nào, và nó là nền tảng cho kỹ thuật nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**String literal type** là dùng chính một giá trị chuỗi cụ thể làm kiểu. Kết hợp với union, nó tạo ra tập giá trị hợp lệ đóng kín:

```ts
let direction: "left" | "right" = "left";
direction = "up"; // Error
```

Khác biệt so với `string`:

- `string` nhận **mọi** chuỗi — gõ sai `"Left"`, `"lef"` compiler vẫn chấp nhận, lỗi chỉ lộ lúc chạy.
- `"left" | "right"` chỉ nhận đúng hai giá trị, sai là báo lỗi ngay. IDE còn autocomplete sẵn danh sách, và khi thu hẹp bằng `if`/`switch` thì compiler kiểm tra được bạn đã xử lý đủ nhánh chưa.

Đây là nền tảng cho:

- **Discriminated union** — dùng một field literal (`type: "circle" | "square"`) làm "thẻ" phân biệt để thu hẹp kiểu.
- **Template literal types** — ghép literal thành mẫu chuỗi, ví dụ `` type Event = `on${"Click" | "Focus"}` `` cho ra `"onClick" | "onFocus"`.

</details>

**11. Vì sao gán chuỗi cho `const` được suy ra literal type còn gán cho `let` lại suy ra `string`? Cú pháp nào ép giữ literal type cho một object?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `const` **không thể gán lại**, giá trị của nó vĩnh viễn là chuỗi đó, nên TypeScript suy ra kiểu hẹp nhất — chính literal type. Còn `let` có thể gán lại sau này, nên compiler nới rộng (widening) lên `string` để lần gán sau không lỗi:

```ts
const a = "left"; // kiểu: "left"
let b = "left";   // kiểu: string
b = "right";      // OK vì kiểu là string
```

Với object thì property luôn bị widening, kể cả khi object đó khai báo bằng `const`. Cách ép giữ literal là **`as const`**:

```ts
const o1 = { dir: "left" };            // { dir: string }
const o2 = { dir: "left" } as const;   // { readonly dir: "left" }

const arr = ["a", "b"] as const;       // readonly ["a", "b"] — tuple
```

`as const` làm mọi property thành `readonly` và giữ nguyên literal type, rất hay dùng cho bảng cấu hình, danh sách route, hoặc để rút ra union bằng `typeof arr[number]`.

</details>

**12. `any`, `unknown` và `never` khác nhau thế nào? Vì sao `unknown` là lựa chọn an toàn hơn `any` trong hầu hết trường hợp?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `any` | `unknown` | `never` |
|---|---|---|---|
| Ý nghĩa | tắt kiểm tra kiểu | "chưa biết kiểu gì" | không giá trị nào thuộc kiểu này |
| Gán **vào** nó | mọi giá trị | mọi giá trị | không gì cả |
| Gán nó **ra** kiểu khác | được hết | chỉ `any` / `unknown` | được hết |
| Dùng trực tiếp | tự do, không kiểm tra | phải thu hẹp kiểu trước | không dùng được |

```ts
let a: any = JSON.parse(s);
a.foo.bar();        // compiler im lặng → nổ lúc runtime

let u: unknown = JSON.parse(s);
u.foo;              // Error: phải kiểm tra trước
if (typeof u === "string") u.toUpperCase(); // OK sau khi narrow
```

`unknown` an toàn hơn vì nó giữ nguyên tính "không biết": bạn vẫn nhận được mọi giá trị đầu vào, nhưng compiler **bắt buộc** kiểm tra kiểu (typeof, instanceof, type guard) trước khi dùng. `any` thì ngược lại — nó lây lan, làm tắt kiểm tra ở mọi chỗ giá trị đó đi qua, biến TypeScript về lại JavaScript một cách âm thầm. Vậy nên `unknown` là kiểu mặc định nên dùng ở ranh giới dữ liệu ngoài: `JSON.parse`, response API, biến trong `catch`.

</details>

**13. Hàm `function fail(): never { throw new Error("x"); }` — vì sao return type là `never` chứ không phải `void`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai kiểu mô tả hai chuyện khác nhau:

- `void`: hàm **chạy xong và trả về**, chỉ là không có giá trị hữu ích để trả.
- `never`: hàm **không bao giờ trả về** — nó luôn ném lỗi hoặc lặp vô hạn. Điểm cuối hàm là không thể chạm tới.

```ts
function log(msg: string): void { console.log(msg); }   // có trả về
function fail(): never { throw new Error("x"); }         // không bao giờ trả về
function loop(): never { while (true) {} }               // cũng vậy
```

Khai báo `never` cho compiler biết thêm thông tin để phân tích luồng: mọi dòng sau lời gọi `fail()` được coi là code chết, và trong nhánh `if` gọi `fail()` thì compiler hiểu nhánh đó kết thúc luôn nên phần còn lại vẫn được thu hẹp kiểu đúng. `never` cũng là kiểu rỗng — không giá trị nào thuộc về nó — nên nó là công cụ kinh điển cho exhaustiveness check trong `switch` trên discriminated union.

</details>

**14. Khi nào nên viết type annotation tường minh (`let age: number = 25`) và khi nào nên để TypeScript tự infer (`let age = 25`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc chung: **để infer cho biến cục bộ, viết tường minh ở ranh giới API**.

Nên để TypeScript tự suy ra khi:

- Khai báo biến cục bộ có giá trị khởi tạo rõ ràng — `let age = 25` đã ra `number`, ghi thêm `: number` chỉ là thừa và tạo thêm chỗ phải sửa khi refactor.
- Kết quả gán từ hàm đã có kiểu trả về rõ ràng.

Nên viết tường minh khi:

- **Tham số hàm** — TypeScript không tự đoán được, không ghi thì thành `any` ngầm.
- **Return type của hàm public** — chốt "hợp đồng" của hàm, để nếu thân hàm lỡ trả sai thì báo lỗi tại chính hàm đó chứ không phải ở nơi gọi.
- **Biến khai báo trước rồi gán sau**: `let result: string | null = null;` — không ghi thì kiểu bị suy ra hẹp sai.
- Khi muốn kiểu **rộng hơn** giá trị khởi tạo, ví dụ `let dir: "left" | "right" = "left";`.
- Shape dữ liệu quan trọng (config, model) — annotation đóng vai trò tài liệu và bắt lỗi ngay tại chỗ khai báo.

</details>

---

## 2. Object Types

Bài học: [2. Object Types](../../typescript/02-types/2_object-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `interface` dùng để mô tả cái gì, và nó khác gì so với việc chỉ gán một object literal rồi để TypeScript tự suy luận?**

<details className="qa">
<summary>Xem đáp án</summary>

`interface` mô tả **hình dạng (shape)** của object: có những property nào, tên gì, kiểu gì, bắt buộc hay tùy chọn, có `readonly` không.

Khác biệt so với để TypeScript tự suy luận từ object literal:

- **Là hợp đồng dùng lại được**: một `interface User` khai báo một lần rồi áp cho tham số hàm, giá trị trả về, mảng, props component. Object literal chỉ suy ra kiểu cho đúng biến đó.
- **Ràng buộc hai chiều**: khi có annotation, compiler bắt lỗi ngay khi **thiếu field bắt buộc** hoặc **thừa field lạ**. Không có annotation thì shape nào cũng "đúng" theo chính nó.
- **Diễn đạt được thứ suy luận không ra**: `email?: string` (optional), `readonly id`, index signature, method overload.

```ts
interface User { id: number; name: string; isActive: boolean; }
const user: User = { id: 1, name: "An" }; // Error: thiếu isActive

const u2 = { id: 1, name: "An" }; // tự suy luận, không ai than phiền
```

</details>

**2. Structural typing là gì? Vì sao truyền thẳng `{ x: 1, y: 2 }` vào hàm nhận `Point` lại hợp lệ dù không hề khai báo `implements`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Structural typing** ("duck typing" của hệ kiểu): hai kiểu tương thích khi **cấu trúc** của chúng khớp nhau, không cần khai báo quan hệ kế thừa hay `implements`. Nếu object có đủ các property mà kiểu đích yêu cầu, đúng kiểu, thì nó thuộc kiểu đó.

```ts
interface Point { x: number; y: number; }
function distance(p: Point): number { return Math.hypot(p.x, p.y); }

distance({ x: 1, y: 2 }); // OK — đủ x và y là hợp lệ
```

Đây là khác biệt lớn so với **nominal typing** của Java/C#, nơi một class chỉ thuộc về interface khi viết rõ `implements`. TypeScript chọn structural vì nó mô tả JavaScript — ngôn ngữ vốn làm việc với object literal tự do, dữ liệu JSON từ API không hề "implements" gì cả.

Lợi ích: rất linh hoạt, dễ mock trong test, không cần sửa code thư viện bên thứ ba để nó khớp interface của mình. Điểm cần cảnh giác: hai kiểu tình cờ trùng shape (ví dụ `UserId` và `OrderId` cùng là `{ id: number }`) sẽ lẫn lộn được với nhau; muốn tách bạch phải dùng thủ thuật branded type.

</details>

**3. Phân biệt property optional `name?: string` với property kiểu `name: string | undefined`. Hai cách khai báo này khác nhau ở điểm nào khi gọi/khởi tạo object?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `name?: string` | `name: string \| undefined` |
|---|---|---|
| Được phép bỏ hẳn key | Có | **Không** — phải ghi ra |
| Gán `undefined` tường minh | Được (trừ khi bật `exactOptionalPropertyTypes`) | Được |
| Kiểu khi đọc ra | `string \| undefined` | `string \| undefined` |
| `"name" in obj` | có thể `false` | luôn `true` |

```ts
interface A { name?: string; }
interface B { name: string | undefined; }

const a: A = {};                  // OK
const b: B = {};                  // Error: thiếu property 'name'
const b2: B = { name: undefined }; // OK — phải viết ra
```

Khi đọc giá trị, cả hai đều cho kiểu `string | undefined` nên cách xử lý giống nhau. Khác biệt nằm ở **phía khởi tạo**: `?` nói "có thể không cần quan tâm tới field này", còn `| undefined` nói "bắt buộc phải quyết định, và bạn được phép quyết định là không có". Dạng thứ hai hữu ích khi muốn compiler nhắc bạn không quên field nào, ví dụ khi map dữ liệu từ API sang model nội bộ.

</details>

**4. `readonly` trong `interface` có thực sự ngăn được việc thay đổi giá trị lúc chạy (runtime) không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** `readonly` chỉ tồn tại ở **tầng kiểu**, được compiler kiểm tra lúc build rồi biến mất hoàn toàn trong JavaScript sinh ra. Nó không phải `Object.freeze`.

```ts
interface Product { readonly id: number; name: string; }

const p: Product = { id: 1, name: "Bàn phím" };
p.id = 2;              // Error lúc compile

// Nhưng lách qua kiểu thì runtime vẫn đổi được:
(p as any).id = 2;     // chạy bình thường, p.id === 2
```

Lý do: TypeScript theo triết lý **type erasure** — mọi annotation bị xoá khi transpile, code chạy vẫn là JavaScript thuần, không thêm chi phí kiểm tra runtime. Vì vậy `readonly` chỉ bảo vệ khỏi **lỗi vô ý của chính team mình**, không bảo vệ khỏi dữ liệu ngoài hay `any`.

Muốn bất biến thật ở runtime thì phải dùng `Object.freeze()` (chỉ nông một cấp), thư viện immutable, hoặc đơn giản là luôn tạo object mới thay vì sửa tại chỗ.

</details>

**5. Index signature `[key: string]: unknown` giải quyết vấn đề gì, và cái giá phải trả về mặt an toàn kiểu là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Index signature cho phép mô tả object có **key động** — không biết trước tên property, ví dụ từ điển dịch, bộ đếm theo id, hoặc phần dữ liệu mở rộng tuỳ ý trong response API.

```ts
interface Dict { [key: string]: unknown; }
const d: Dict = { a: 1, b: "x" };
d["bat-ky-key-nao"] = true; // OK
```

Cái giá phải trả:

- **Mất bảo vệ lỗi gõ nhầm**: `user.nmae` không còn báo lỗi nữa vì mọi key string đều hợp lệ. Đây thường là lý do chính người ta *không* nên thêm index signature vào interface model thông thường.
- **Autocomplete kém đi** — editor không có danh sách key để gợi ý.
- **Ràng buộc các property khai báo tường minh**: mọi property cụ thể trong cùng interface phải có kiểu gán được vào kiểu của index signature.
- Nếu kiểu index là `unknown` thì phải thu hẹp kiểu trước khi dùng; nếu là `any` thì an toàn kiểu mất hẳn.

Khi biết trước tập key, dùng `Record<"a" | "b", number>` hoặc `Map` sẽ chặt chẽ hơn nhiều.

</details>

**6. Excess property check là gì? Vì sao gán object literal thừa field vào biến kiểu `interface` thì báo lỗi, nhưng gán qua một biến trung gian lại không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Excess property check** là kiểm tra bổ sung của TypeScript, chỉ áp dụng khi gán **object literal viết trực tiếp** vào một vị trí đã có kiểu: literal nào chứa property không nằm trong kiểu đích sẽ bị báo lỗi.

```ts
interface Point { x: number; y: number; }

const p: Point = { x: 1, y: 2, z: 3 }; // Error: 'z' không có trong Point

const tmp = { x: 1, y: 2, z: 3 };      // suy ra { x, y, z }
const p2: Point = tmp;                  // OK!
```

Vì sao lại khác nhau? Theo **structural typing** thuần tuý, `{ x, y, z }` có đủ `x` và `y` nên hoàn toàn tương thích với `Point` — trường hợp qua biến trung gian chính là luật gốc. Nhưng khi bạn viết literal ngay tại chỗ gán, gần như chắc chắn bạn không cố ý tạo field thừa — đó thường là **gõ nhầm tên** (`colour` thay vì `color`) hoặc hiểu sai API. Nên TypeScript thêm một lớp kiểm tra "cảnh báo thiện chí" cho riêng tình huống này.

Cách tắt có chủ đích: gán qua biến trung gian, dùng `as Point`, hoặc khai báo index signature.

</details>

**7. Khi nào nên dùng `interface`, khi nào nên dùng `type`? Nêu ít nhất hai việc `type` làm được mà `interface` không làm được.**

<details className="qa">
<summary>Xem đáp án</summary>

Với việc mô tả shape của object, hai cái gần như thay thế nhau được. Quy ước phổ biến: **`interface` cho shape object và cho API công khai có thể được mở rộng**; **`type` cho mọi thứ còn lại**.

Những việc chỉ `type` làm được:

- **Union type**: `type Status = "Active" | "Inactive";` — `interface` không diễn đạt được union.
- **Đặt tên cho primitive, tuple, kiểu hàm**: `type Id = string;`, `type Coord = [x: number, y: number];`.
- **Mapped type và conditional type**: `type Partial<T> = { [K in keyof T]?: T[K] };`, `type A<T> = T extends string ? ... : ...`.
- **Toán tử kiểu**: intersection `A & B`, `keyof`, `typeof`, template literal type.

Ngược lại, thứ `interface` có mà `type` không có là **declaration merging** — khai báo cùng tên nhiều lần sẽ được gộp lại. Đây là điểm mạnh khi cần mở rộng type của thư viện bên thứ ba, nhưng cũng là rủi ro "bị sửa ngầm" trong code ứng dụng. `interface` cũng thường cho thông báo lỗi dễ đọc hơn khi kiểu lồng nhau sâu.

</details>

**8. Nói `class` trong TypeScript vừa là kiểu vừa là giá trị nghĩa là sao? Cho ví dụ dùng cùng một `class` ở cả hai vai trò.**

<details className="qa">
<summary>Xem đáp án</summary>

Một khai báo `class` tạo ra **hai thứ cùng tên** nằm ở hai không gian khác nhau:

- **Giá trị** (value space): constructor function tồn tại thật lúc runtime — gọi được `new`, truy cập static member.
- **Kiểu** (type space): kiểu mô tả shape của instance — dùng được ở vị trí annotation.

```ts
class User {
  constructor(public id: number, public name: string) {}
  greet(): string { return `Hello ${this.name}`; }
}

// Vai trò GIÁ TRỊ: khởi tạo bằng new
const u = new User(1, "An");

// Vai trò KIỂU: annotation cho tham số
function printUser(user: User) {
  console.log(user.name);
}
printUser(u);
```

Đây là điểm khác `interface` và `type` — chúng chỉ tồn tại ở type space, bị xoá sạch khi biên dịch. Vì `class` để lại code runtime nên nó dùng được với `instanceof`, còn interface thì không. Lưu ý: kiểu `User` mô tả **instance**; muốn nói tới bản thân constructor phải viết `typeof User`.

</details>
**9. Reverse mapping của numeric `enum` hoạt động thế nào? Vì sao cơ chế này khiến `enum` sinh ra runtime code chứ không zero-cost?**

<details className="qa">
<summary>Xem đáp án</summary>

Với **numeric enum**, TypeScript sinh ra một object tra cứu được **cả hai chiều**: từ key ra số, và từ số ra key.

```ts
enum Status { Active, Inactive }
Status.Active; // 0
Status[0];     // "Active" — reverse mapping
```

Để làm được việc đó, compiler phải phát ra JavaScript thật, đại ý:

```js
var Status;
(function (Status) {
  Status[Status["Active"] = 0] = "Active";
  Status[Status["Inactive"] = 1] = "Inactive";
})(Status || (Status = {}));
```

Vì vậy `enum` **không zero-cost**: nó để lại một object trong bundle, khác hẳn `interface` hay `type` vốn bị xoá sạch. Object này cũng khó tree-shake vì được tạo trong IIFE gán vào biến, bundler khó chứng minh là không dùng tới.

Lưu ý: chỉ numeric enum mới có reverse mapping. **String enum không có** — vì giá trị chuỗi có thể trùng với tên key, ánh xạ ngược sẽ nhập nhằng.

</details>

**10. So sánh `enum` với union of string literal (`"Active" | "Inactive"`) về runtime cost, tree-shaking và mức độ an toàn kiểu.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `enum` | Union string literal |
|---|---|---|
| Runtime cost | Sinh object thật trong bundle | Bị xoá hoàn toàn, zero-cost |
| Tree-shaking | Khó (object tạo trong IIFE) | Không cần — không có gì để shake |
| An toàn kiểu | Tốt; numeric enum lỏng hơn (một số phiên bản cho gán số bất kỳ) | Tốt, chặt chẽ |
| Viết giá trị | Phải import và viết `Status.Active` | Viết thẳng `"Active"` |
| Ghép với JSON/API | Phải map qua lại | Khớp trực tiếp với chuỗi trong JSON |
| Duyệt hết giá trị | `Object.values(Status)` | Cần khai báo mảng `as const` rồi lấy `typeof arr[number]` |

```ts
type Status = "Active" | "Inactive";
const s: Status = "Active"; // gọn, không import gì

// Muốn có danh sách runtime thì:
const STATUSES = ["Active", "Inactive"] as const;
type Status2 = typeof STATUSES[number]; // "Active" | "Inactive"
```

Kết luận thực dụng: với dữ liệu đi qua API, union string literal thường là lựa chọn mặc định — nhẹ hơn, khớp thẳng với JSON, type-safe ngang nhau. `enum` vẫn hợp lý khi cần một object runtime để duyệt/hiển thị, hoặc khi codebase đã dùng thống nhất.

</details>

**11. `const enum` khác `enum` thường ở điểm nào? Vì sao nhiều team và bundler (isolatedModules) khuyến cáo tránh dùng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

`const enum` được compiler **inline thẳng giá trị** tại nơi sử dụng và **không sinh object** nào ở runtime:

```ts
const enum Direction { Up, Down }
const d = Direction.Up;
// JS sinh ra: const d = 0 /* Direction.Up */;
```

Nghe thì lý tưởng, nhưng nó phá vỡ mô hình biên dịch từng file:

- Với **`isolatedModules`** (chế độ mà Babel, esbuild, SWC, Vite dùng), mỗi file được transpile **độc lập**, không đọc file khác. Trình transpile không biết `Direction.Up` bằng mấy nên không inline được — do đó `const enum` xuyên module bị cấm hoặc xử lý sai.
- Không có object runtime nên **không duyệt được giá trị**, không `Object.values` được.
- Không dùng an toàn trong file `.d.ts` phát hành ra ngoài: người dùng biên dịch với cấu hình khác sẽ gặp giá trị inline không khớp.

Vì vậy khuyến cáo phổ biến: tránh `const enum`; nếu muốn zero-cost thì dùng union string literal, còn nếu cần object runtime thì dùng `enum` thường hoặc object `as const`.

</details>

**12. `number[]` và `Array<number>` có khác nhau không? Trường hợp nào buộc phải viết dạng generic?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách hoàn toàn **tương đương** về mặt kiểu — `number[]` chỉ là cú pháp rút gọn của `Array<number>`. Chọn cái nào là thuần quy ước code style (đa số style guide ưu tiên `T[]` cho gọn).

```ts
let nums: number[] = [1, 2, 3];
let names: Array<string> = ["An", "Bình"];
```

Trường hợp nên hoặc buộc phải dùng dạng generic:

- Khi kiểu phần tử là biểu thức phức tạp, dạng ngoặc vuông cần thêm dấu ngoặc và khó đọc: `Array<string | number>` rõ hơn `(string | number)[]`; `Array<() => void>` rõ hơn `(() => void)[]`.
- Khi muốn nhất quán với các kiểu generic khác trong cùng khai báo, ví dụ `Promise<Array<User>>`.
- Với `ReadonlyArray<T>` — có dạng rút gọn `readonly T[]`, nhưng nhiều team viết dạng đầy đủ cho rõ.

Một lưu ý nhỏ: `Array` là kiểu toàn cục do `lib.d.ts` cung cấp, nên nếu trong scope có một type tên `Array` do bạn tự khai báo thì `Array<number>` sẽ trỏ nhầm, còn `number[]` thì không bị.

</details>

**13. Tuple khác array ở những điểm nào? Đoán xem `let wrong: [string, number] = [25, "age"];` báo lỗi gì và tại sao.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Array | Tuple |
|---|---|---|
| Độ dài | linh hoạt | cố định (trừ khi có rest element) |
| Kiểu phần tử | một kiểu chung cho mọi vị trí | riêng theo **từng vị trí** |
| Ý nghĩa | tập hợp đồng nhất | bản ghi có thứ tự, mỗi ô một vai trò |
| Truy cập index | luôn ra kiểu phần tử | ra đúng kiểu của vị trí đó |

Với `let wrong: [string, number] = [25, "age"];`, TypeScript báo **hai lỗi**, mỗi vị trí một lỗi:

```ts
let wrong: [string, number] = [25, "age"];
// Type 'number' is not assignable to type 'string'.   (vị trí 0)
// Type 'string' is not assignable to type 'number'.   (vị trí 1)
```

Lý do: tuple ràng buộc kiểu **theo thứ tự vị trí**, phần tử 0 phải là `string`, phần tử 1 phải là `number`. Ở đây giá trị đúng kiểu nhưng đặt ngược chỗ, nên cả hai ô đều sai. Với `number[]` hay `Array<string | number>` thì đoạn này lại hợp lệ — đó chính là giá trị mà tuple mang lại.

</details>

**14. Flag `noUncheckedIndexedAccess` làm gì? Vì sao khi bật, `arr[0]` lại có kiểu `number | undefined`, và tại sao flag này không nằm trong `strict`?**

<details className="qa">
<summary>Xem đáp án</summary>

Flag này khiến mọi lần truy cập qua **index** (mảng, hoặc object có index signature) trả về kiểu phần tử **kèm `undefined`**:

```ts
// noUncheckedIndexedAccess: true
const arr: number[] = [1, 2, 3];
const first = arr[0];      // number | undefined
first.toFixed();           // Error: có thể undefined
if (first !== undefined) first.toFixed(); // OK
```

Vì sao đúng? Kiểu `number[]` không mang thông tin về **độ dài**. `arr[10]` trên mảng ba phần tử trả về `undefined` ở runtime, nhưng nếu không bật flag thì compiler vẫn khẳng định đó là `number` — một lời nói dối dẫn thẳng tới `Cannot read property of undefined`.

Không nằm trong `strict` vì nó gây khá nhiều "ồn ào": mọi vòng lặp theo index, mọi lần đọc `matrix[i][j]` đều phải kiểm tra hoặc dùng `!`, kể cả khi bạn biết chắc index hợp lệ. Team TypeScript giữ nó ngoài `strict` để không phá vỡ hàng loạt codebase cũ. Dù vậy, với dự án mới thì rất nên bật — dùng kèm `for...of`, `.at()`, destructuring và optional chaining sẽ đỡ rườm rà đi nhiều.

</details>

**15. Labeled tuple (`[x: number, y: number]`) có tạo khác biệt nào lúc runtime không? Nó mang lại lợi ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không có khác biệt gì lúc runtime.** Nhãn chỉ tồn tại ở tầng kiểu, biến mất hoàn toàn sau khi biên dịch — tuple vẫn là một mảng JavaScript thường, vẫn truy cập bằng chỉ số `p[0]`, `p[1]`, **không** truy cập được bằng `p.x`.

```ts
type Coord = [x: number, y: number];
const p: Coord = [10, 20];
p[0];  // 10
// p.x — không tồn tại
```

Lợi ích nằm ở khả năng đọc và tooling:

- **Tài liệu tại chỗ**: `[x: number, y: number]` nói rõ ô nào là gì, thay vì `[number, number]` mơ hồ về thứ tự.
- **Tooltip và signature help trong IDE** hiển thị tên nhãn, nhất là khi tuple được dùng làm danh sách tham số hàm (rest parameter) — lúc đó nhãn trở thành tên tham số gợi ý.
- **Thông báo lỗi dễ hiểu hơn**, nhắc đúng phần tử nào sai.

Lưu ý nhỏ về cú pháp: trong một tuple, hoặc **tất cả** phần tử đều có nhãn, hoặc không phần tử nào có — không trộn lẫn được.

</details>

**16. Rest element trong tuple (`[string, ...number[]]`) hoạt động ra sao? Có được đặt phần rest ở giữa tuple không?**

<details className="qa">
<summary>Xem đáp án</summary>

Rest element cho phép tuple có phần **cố định** kết hợp với phần **độ dài tuỳ ý**:

```ts
type StringFirst = [string, ...number[]];
const data: StringFirst = ["scores", 90, 85, 70]; // OK
const d2: StringFirst = ["scores"];               // OK — phần rest có thể rỗng
const d3: StringFirst = [90, 85];                 // Error — ô đầu phải là string
```

Về vị trí: từ TypeScript 4.2 (variadic tuple types), rest element **được phép nằm ở giữa hoặc ở đầu**, miễn là chỉ có **một** rest element trong tuple:

```ts
type A = [string, ...number[], boolean]; // hợp lệ
type B = [...string[], number];          // hợp lệ
type C = [...string[], ...number[]];     // Error: chỉ được một rest element
```

Ràng buộc còn lại: **phần tử optional (`?`) không được đứng sau rest element**, vì compiler sẽ không xác định được biên giữa hai phần. Ứng dụng thực tế phổ biến của rest tuple là mô tả danh sách tham số hàm — nền tảng cho các kiểu tiện ích như `Parameters<T>` và cho pattern bọc hàm (`(...args: [...Args, Callback]) => void`).

</details>

---

## 3. Top types và Bottom types

Bài học: [3. Top types và Bottom types](../../typescript/02-types/3_top-bottom-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Top type và bottom type là gì? Trong TypeScript mỗi loại gồm những kiểu nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai khái niệm mượn từ type theory, mô tả hai đầu của "tháp kiểu":

- **Top type** (kiểu đỉnh): kiểu chứa **mọi giá trị** — mọi kiểu khác đều gán được vào nó. Trong TypeScript có hai: **`any`** và **`unknown`**.
- **Bottom type** (kiểu đáy): kiểu **không chứa giá trị nào**, và là subtype của mọi kiểu. Trong TypeScript là **`never`**.

| Kiểu | Vị trí | Đặc điểm |
|---|---|---|
| `any` | Top | Tắt hoàn toàn type check |
| `unknown` | Top | An toàn — phải narrow trước khi dùng |
| `object` | Ở giữa | Mọi giá trị non-primitive |
| `never` | Bottom | Không bao giờ có giá trị |

Hình dung theo tập hợp: `unknown` là tập vũ trụ chứa tất cả, `never` là tập rỗng. Vì tập rỗng là tập con của mọi tập, `never` gán được vào bất cứ đâu — nhưng không có giá trị nào để mà gán. Điểm khác biệt quan trọng: `any` là top type "gian lận" — nó vừa nhận mọi thứ, vừa gán ngược ra mọi kiểu, nên phá vỡ hệ thống; `unknown` chỉ nhận vào chứ không cho ra tự do.

</details>

**2. `any` và `unknown` đều nhận được mọi giá trị — khác biệt cốt lõi giữa chúng nằm ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **chiều ra**: cả hai nhận được mọi giá trị, nhưng `any` cho phép làm mọi thứ với giá trị đó, còn `unknown` thì chặn lại cho tới khi bạn chứng minh được kiểu.

```ts
let a: any = fetchData();
a.toUpperCase();   // compiler im lặng → crash runtime nếu a là number

let u: unknown = fetchData();
u.toUpperCase();   // Error: Object is of type 'unknown'
if (typeof u === "string") {
  u.toUpperCase(); // OK — đã narrow xuống string
}
```

| | `any` | `unknown` |
|---|---|---|
| Gán vào nó | mọi giá trị | mọi giá trị |
| Gán nó ra kiểu khác | được hết | chỉ `any` / `unknown` |
| Truy cập property, gọi method | tự do | phải narrow trước |
| Ảnh hưởng tới code xung quanh | lan truyền, tắt check cả chain | khoanh vùng tại chỗ |

Nói ngắn: `any` nghĩa là "tôi từ bỏ hệ kiểu ở đây", `unknown` nghĩa là "tôi chưa biết kiểu, nhưng vẫn muốn compiler canh chừng". Vì vậy `unknown` là mặc định nên dùng ở ranh giới dữ liệu ngoài.

</details>

**3. Vì sao nói `any` lan truyền như virus? Cho ví dụ một chuỗi thao tác làm mất hoàn toàn an toàn kiểu.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì **mọi thao tác trên một giá trị `any` đều cho ra `any`**: truy cập property, gọi method, toán tử, giá trị trả về của hàm. Chỉ cần một điểm `any` ở đầu nguồn là cả chuỗi phía sau mất kiểm tra kiểu, mà không có cảnh báo nào.

```ts
const data: any = fetchData();
const name = data.user.name;       // type: any
const upper = name.toUpperCase();  // type: any — không ai check
const len: number = upper.lenght;  // gõ sai "length" vẫn lọt!
```

Tệ hơn, `any` gán được ra **mọi** kiểu, nên nó chui vào cả những biến đã khai báo kiểu đàng hoàng:

```ts
function getUser(): any { /* ... */ }
const u: User = getUser();  // không kiểm tra gì, User giờ có thể là bất cứ thứ gì
u.name.trim();              // crash nếu API đổi field
```

Đó là lý do quy tắc chung: **không dùng `any`** trừ khi đang migrate code JS cũ; dùng `unknown` rồi narrow, và bật `noImplicitAny` để compiler chỉ ra những chỗ `any` lọt vào một cách vô tình.

</details>

**4. Đoán lỗi: với `let x: unknown = fetchData();` thì `x.toUpperCase()` có biên dịch được không? Cần làm gì trước khi gọi được method đó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không biên dịch được.** Compiler báo đại ý: `'x' is of type 'unknown'` (bản cũ hơn: `Object is of type 'unknown'`). Với `unknown`, TypeScript không cho phép truy cập bất kỳ property hay method nào, kể cả `.toString()`.

Muốn dùng được, phải **thu hẹp kiểu (narrowing)** trước bằng một trong các cách:

```ts
// 1. typeof — cho primitive
if (typeof x === "string") x.toUpperCase();   // OK

// 2. instanceof — cho class
if (x instanceof Date) x.getTime();

// 3. type guard tự viết
function isUser(v: unknown): v is User {
  return typeof v === "object" && v !== null && "name" in v;
}
if (isUser(x)) x.name;

// 4. schema validation (Zod, io-ts) — an toàn nhất cho dữ liệu API
const user = UserSchema.parse(x);
```

Cũng có thể ép bằng `x as string`, nhưng đó chỉ là lời hứa với compiler chứ không kiểm tra gì ở runtime — chính là thứ mà `unknown` sinh ra để tránh.

</details>

**5. `unknown` có gán được cho `string` không, và ngược lại `string` có gán được cho `unknown` không? Giải thích theo quan hệ subtype.**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
let s: string = "hi";
let u: unknown;

u = s;  // OK — string → unknown
s = u;  // Error: Type 'unknown' is not assignable to type 'string'
```

Quy tắc gán của TypeScript: giá trị chỉ đi được từ kiểu **hẹp hơn** sang kiểu **rộng hơn** (từ subtype lên supertype).

- `unknown` là **top type** — tập chứa mọi giá trị, nên `string` là tập con của nó. Gán `string` vào `unknown` luôn an toàn: mọi chuỗi đều là "một giá trị nào đó".
- Chiều ngược lại không an toàn: một biến `unknown` có thể đang giữ `number`, `null`, object bất kỳ. Cho gán xuống `string` là compiler tự nói dối về thứ nó không biết.

Muốn đi xuống thì phải **narrow** (`typeof`, type guard, validate) hoặc dùng type assertion `u as string` — và lúc đó trách nhiệm đúng/sai thuộc về lập trình viên.

Đối lập hoàn toàn là `never`: nó là **bottom type**, subtype của mọi kiểu, nên gán `never` cho `string` hợp lệ, còn `string` không gán được cho `never`.

</details>

**6. Phân biệt `never` và `void`. Hàm trả `void` khác hàm trả `never` ở chỗ nào về mặt luồng thực thi?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `void` | `never` |
|---|---|---|
| Nghĩa | hàm **chạy xong và trả về**, chỉ không có giá trị hữu ích | hàm **không bao giờ trả về** |
| Có giá trị thuộc kiểu | có (`undefined`) | không có giá trị nào |
| Vị trí trong hệ kiểu | kiểu bình thường | bottom type |
| Code sau lời gọi | vẫn chạy | compiler coi là **không thể tới** |

```ts
function log(msg: string): void {
  console.log(msg);
}          // chạy xong, quay về nơi gọi

function fail(msg: string): never {
  throw new Error(msg);
}          // không bao giờ quay về

function loop(): never {
  while (true) {}
}
```

Khác biệt về luồng thực thi rất cụ thể trong phân tích của compiler: sau khi gọi một hàm trả `never`, TypeScript biết luồng kết thúc ở đó nên xử lý phần sau như code chết, và các nhánh còn lại vẫn được narrow đúng:

```ts
function handle(x: string | null) {
  if (x === null) fail("null!");
  x.toUpperCase(); // OK — TS biết nhánh trên không trả về
}
```

</details>

**7. Những trường hợp nào TypeScript tự suy luận ra `never`? Nêu ít nhất ba tình huống.**

<details className="qa">
<summary>Xem đáp án</summary>

Các tình huống phổ biến:

- **Hàm không bao giờ trả về**: một function expression hoặc arrow function luôn `throw` (hoặc lặp vô hạn) được suy ra kiểu trả về `never`. Lưu ý function declaration viết bằng `function ...` lại được suy ra `void`, muốn `never` thì phải khai báo tường minh.
- **Narrowing loại hết mọi khả năng**: thu hẹp tới mức không còn kiểu nào hợp lệ.

```ts
function f(x: string) {
  if (typeof x === "number") {
    x; // type: never — string không bao giờ là number
  }
}
```

- **Giao của các kiểu không tương thích**: `type A = string & number;` cho ra `never`, vì không giá trị nào vừa là chuỗi vừa là số.
- **Conditional type loại bỏ nhánh**: `Exclude<"a" | "b", "a" | "b">` cho ra `never` khi không còn thành viên nào.
- **Mảng rỗng không có ngữ cảnh kiểu** dưới `strictNullChecks`: `const a = [];` được suy ra `never[]`.
- **Nhánh `default` của một `switch` đã xử lý hết member** của discriminated union — chính là nền tảng của exhaustiveness check.

</details>

**8. Exhaustiveness check bằng `never` hoạt động thế nào? Điều gì xảy ra ở nhánh `default` khi ta thêm một member mới vào union?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: sau khi `switch` đã xử lý hết mọi member của union, kiểu của biến ở nhánh `default` bị thu hẹp còn `never`. Gán nó vào một biến khai báo `never` chính là "câu thần chú" bắt compiler xác nhận điều đó.

```ts
type Shape = { kind: "circle" } | { kind: "square" };

function area(s: Shape) {
  switch (s.kind) {
    case "circle": return 1;
    case "square": return 2;
    default:
      const _exhaustive: never = s; // s đã bị narrow còn never
      throw new Error("Unhandled");
  }
}
```

Khi thêm `{ kind: "triangle" }` vào `Shape` mà quên bổ sung `case`, ở nhánh `default` biến `s` không còn là `never` nữa mà là `{ kind: "triangle" }`. Gán nó cho biến kiểu `never` lập tức **lỗi compile**: `Type '{ kind: "triangle" }' is not assignable to type 'never'`.

Giá trị của kỹ thuật này: biến một lỗi lẽ ra chỉ lộ lúc runtime thành lỗi build, và thông báo lỗi chỉ đúng chỗ còn thiếu. Nhiều team gói nó thành hàm dùng chung `function assertNever(x: never): never { throw new Error(...) }` rồi gọi `assertNever(s)` ở `default`.

</details>
**9. Vì sao `never & T = never` còn `never | T = T`? Giải thích bằng khái niệm tập hợp.**

<details className="qa">
<summary>Xem đáp án</summary>

Coi mỗi kiểu là một **tập hợp các giá trị**. `never` là **tập rỗng** (∅) — không chứa giá trị nào.

- **Intersection (`&`) là phép giao**: `never & T` = ∅ ∩ T = ∅ = `never`. Giao của tập rỗng với bất cứ tập nào cũng rỗng, vì không có phần tử nào để mà chung.
- **Union (`|`) là phép hợp**: `never | T` = ∅ ∪ T = T. Thêm tập rỗng vào một tập không làm nó lớn thêm, nên `never` "biến mất" trong union.

```ts
type A = never & string;  // never
type B = never | string;  // string
type C = "a" | never | "b"; // "a" | "b" — never tự bị nuốt
```

Hệ quả thực tế rất hay dùng: trong **conditional type**, trả về `never` ở một nhánh đồng nghĩa với "loại thành viên này ra khỏi union". Đó là cơ chế đứng sau `Exclude`, `NonNullable`, `Extract`.

Một đặc tính liên quan: `never[]` là mảng mà không phần tử nào hợp lệ, nên giá trị duy nhất thuộc kiểu đó là mảng rỗng `[]`.

</details>

**10. Phân biệt `Object` (chữ hoa), `object` (chữ thường) và `{}`. Kiểu nào nhận được primitive, kiểu nào không?**

<details className="qa">
<summary>Xem đáp án</summary>

| Kiểu | Nhận primitive? | Nhận `null` / `undefined`? | Ý nghĩa |
|---|---|---|---|
| `Object` (hoa) | **Có** | Không | Interface của object wrapper, mọi giá trị đều có các member của `Object.prototype` |
| `object` (thường) | **Không** | Không | Mọi giá trị **non-primitive** — object, array, function |
| `{}` | **Có** | Không | "Bất cứ thứ gì không phải null/undefined" |

```ts
const a: Object = 42;        // OK — number cũng khớp Object
const b: object = 42;        // Error
const c: object = { x: 1 };  // OK
const d: {} = "hello";       // OK — {} không có nghĩa "object rỗng"!
const e: {} = null;          // Error
```

Bẫy hay gặp nhất là `{}`: nhìn tưởng "object không có property nào", nhưng thực chất nó chỉ yêu cầu "có không ít hơn 0 property" — tức là gần như mọi giá trị đều thoả, kể cả chuỗi và số. Muốn nói "object bất kỳ" thì dùng `object`; muốn nói "object có key động" thì dùng `Record<string, unknown>`; muốn nói "giá trị bất kỳ nhưng chưa biết kiểu" thì dùng `unknown`.

</details>

**11. Vì sao `@typescript-eslint` mặc định cấm dùng `Object`, `Number`, `String`, `Boolean` chữ hoa làm type annotation?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì các tên chữ hoa là **interface của object wrapper**, không phải kiểu nguyên thủy, và dùng chúng gần như luôn là nhầm lẫn:

- **Rộng hơn mức mong muốn**: `Object` nhận cả `42`, `"hi"`, `true` — không ràng buộc được gì. `{}` cũng vậy.
- **Không tương thích ngược**: `boolean` gán vào `Boolean` được, nhưng `Boolean` không gán vào `boolean` được, gây lỗi khó hiểu ở chỗ tưởng như vô hại.

```ts
let a: boolean = true;
let b: Boolean = true;
a = b; // Error: Type 'Boolean' is not assignable to type 'boolean'
```

- **Lẫn lộn với hành vi runtime nguy hiểm**: object bọc luôn truthy, nên `new Boolean(false)` vẫn vào nhánh `if`. Viết `Boolean` trong annotation dễ khiến người đọc tưởng đây là chỗ dùng wrapper thật.

Quy tắc liên quan trong ESLint là `@typescript-eslint/no-restricted-types` (trước đây là `ban-types`), và khuyến nghị của nó rất đơn giản: luôn dùng chữ thường `boolean`, `number`, `string`; thay `Object`/`{}` bằng `object`, `Record<string, unknown>` hoặc `unknown` tuỳ ý định.

</details>

**12. Flag `useUnknownInCatchVariables` làm gì? Vì sao ở cấu hình cũ biến trong `catch (e)` lại là `any`, và điều đó nguy hiểm ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Flag này (có từ TypeScript 4.4, nằm trong nhóm bật sẵn khi đặt `"strict": true`) đổi kiểu của biến trong `catch` từ `any` thành **`unknown`**.

```ts
// useUnknownInCatchVariables: true
try {
  risky();
} catch (e) {
  e.message;                    // Error: 'e' is of type 'unknown'
  if (e instanceof Error) {
    console.log(e.message);     // OK
  }
}
```

Trước đó mặc định là `any` đơn giản vì lý do lịch sử tương thích ngược — và vì `unknown` mãi tới TypeScript 3.0 mới có.

Nguy hiểm của `any` ở đây rất thật: trong JavaScript bạn có thể `throw` **bất cứ giá trị nào**, không nhất thiết là `Error`. Thư viện có thể ném chuỗi, ném object `{ code, message }`, còn Promise bị reject với giá trị bất kỳ cũng rơi vào `catch` của `await`. Viết `e.message` mà giá trị ném ra là chuỗi thì nhận `undefined`; nếu là `null` thì lỗi ngay trong chính khối `catch` — che mất lỗi gốc, cực kỳ khó debug. Ép narrow bằng `instanceof Error` khiến những trường hợp đó lộ ra lúc build.

</details>

**13. Trong `type NonNullable<T> = T extends null | undefined ? never : T`, vì sao trả về `never` lại có tác dụng loại bỏ nhánh khỏi union?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cơ chế kết hợp lại:

Thứ nhất, conditional type có tính **phân phối (distributive)** khi tham số kiểu đứng "trần" bên trái `extends`: với `T` là union, TypeScript áp dụng điều kiện cho **từng thành viên** rồi hợp kết quả lại.

Thứ hai, `never` **bị nuốt trong union** (`never | T = T`), như đã nói ở câu về tập hợp.

Ghép lại, `NonNullable<string | null>` được tính như sau:

```ts
type X = NonNullable<string | null>;
// = (string extends null|undefined ? never : string)
// | (null   extends null|undefined ? never : null)
// = string | never
// = string
```

Nhánh nào thoả điều kiện bị thay bằng `never`, và `never` tự biến mất khi hợp union — nên hiệu ứng cuối cùng đúng là "lọc bỏ thành viên đó". Đây là khuôn mẫu chung của mọi kiểu tiện ích dạng lọc: `Exclude<T, U>`, `Extract` (đảo điều kiện), hay các mapped type lọc key theo kiểu giá trị.

</details>

**14. Mảng `never[]` có ý nghĩa gì? Vì sao `const a = [];` trong một số ngữ cảnh strict lại được suy luận thành `never[]`?**

<details className="qa">
<summary>Xem đáp án</summary>

`never[]` là mảng mà **không giá trị nào là phần tử hợp lệ**. Hệ quả: giá trị duy nhất thuộc kiểu này là mảng rỗng, và mọi lần `push` đều lỗi.

```ts
const a: never[] = [];
a.push(1); // Error: 'number' không gán được cho 'never'
```

Vì sao `const a = [];` lại ra `never[]`? Vì mảng rỗng không cung cấp manh mối nào về kiểu phần tử. Khi không có **contextual type** (không có annotation, không phải tham số của hàm đã biết kiểu), compiler ở chế độ `strictNullChecks` chọn kiểu hẹp nhất có thể — `never[]`.

Trường hợp khai báo bằng `let`/`var` trong thân hàm thì TypeScript dùng cơ chế **evolving array**: nó theo dõi các lệnh `push`/gán index phía sau và mở rộng dần kiểu phần tử.

```ts
let b = [];     // theo dõi dần
b.push(1);
b.push("x");
b;              // (number | string)[]
```

Khi gặp lỗi kiểu `never[]` bất ngờ, cách xử lý đúng là khai báo kiểu ngay từ đầu: `const a: number[] = [];`.

</details>

**15. `unknown` được coi là top type an toàn, nhưng có trường hợp nào bắt buộc phải dùng `any` không? Nếu có thì nên khoanh vùng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Có một vài trường hợp `any` vẫn là lựa chọn thực tế:

- **Migrate dần code JavaScript cũ**: gắn `any` tạm cho phần chưa kịp mô tả kiểu, siết dần sau.
- **Ràng buộc generic dạng "hàm bất kỳ"**: `T extends (...args: any[]) => any` — dùng `unknown[]` ở vị trí tham số sẽ quá chặt vì tham số hàm là contravariant.
- **Bên trong phần thân của các kiểu tiện ích / code hạ tầng** mà chính chữ ký công khai vẫn chặt chẽ.
- **Type định nghĩa của thư viện bên thứ ba** quá phức tạp hoặc sai, cần lách qua tạm thời.

Cách khoanh vùng:

- Ép `any` ở **một điểm duy nhất**, ngay lập tức chuyển sang kiểu cụ thể hoặc `unknown`; đừng để nó chảy qua nhiều hàm.
- Bọc trong một hàm nhỏ có chữ ký công khai chuẩn (`function parse(raw: string): User`), phần `any` nằm gọn bên trong.
- Viết kèm `// eslint-disable-next-line` với lời giải thích, để chỗ đó hiện rõ trong review.
- Bật `noImplicitAny` để mọi `any` phải là cố ý, và cân nhắc `@typescript-eslint/no-explicit-any` ở mức cảnh báo để đếm được "nợ kỹ thuật".

</details>

---

## 4. Type Assertions

Bài học: [4. Type Assertions](../../typescript/02-types/4_assertions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Type assertion là gì? Vì sao nói nó chỉ tồn tại lúc biên dịch và biến mất hoàn toàn sau khi transpile?**

<details className="qa">
<summary>Xem đáp án</summary>

**Type assertion** là cách nói với compiler "tôi biết kiểu của giá trị này rõ hơn bạn, hãy tin tôi". Nó ghi đè kết quả suy luận kiểu, không thay đổi giá trị.

```ts
const data: unknown = "Hello";
const len = (data as string).length;
```

Nó biến mất sau khi transpile vì TypeScript theo nguyên tắc **type erasure**: mọi thứ thuộc tầng kiểu — annotation, interface, generic, assertion — bị xoá sạch, JavaScript sinh ra không có bất kỳ đoạn kiểm tra nào thêm.

```ts
// TypeScript
const len = (data as string).length;
```

```js
// JavaScript sinh ra
const len = data.length;
```

Hệ quả quan trọng nhất: assertion **không kiểm tra gì lúc chạy**. Nếu `data` thực ra là số, compiler im lặng nhưng chương trình vẫn crash. Vì thế `as` chỉ nên dùng khi bạn thật sự chắc chắn; với dữ liệu từ bên ngoài (API, input người dùng) phải dùng type guard hoặc validation runtime.

</details>

**2. `as Type` khác gì với type casting/conversion trong Java hay C#?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác nhau căn bản: một bên là **chú thích cho compiler**, một bên là **thao tác thật lúc chạy**.

| | TypeScript `as` | Cast trong Java / C# |
|---|---|---|
| Có code runtime | Không — bị xoá khi biên dịch | Có |
| Kiểm tra khi sai kiểu | Không kiểm tra gì | Ném `ClassCastException` / `InvalidCastException` |
| Chuyển đổi giá trị | Không bao giờ | `(int) 3.9` thực sự đổi thành `3` |
| Hệ kiểu nền | Structural | Nominal |

```ts
const x = "hello" as unknown as number;
x.toFixed(2); // Crash runtime: x.toFixed is not a function
```

Trong Java, `(Dog) animal` sẽ kiểm tra tại chỗ và ném exception ngay nếu `animal` không phải `Dog` — bạn biết lỗi ở đúng dòng cast. Trong TypeScript, sai kiểu chỉ lộ ra ở một nơi nào đó xa hơn, khi ai đó gọi method không tồn tại.

Vì vậy đừng gọi `as` là "ép kiểu" — cách gọi chính xác hơn là **khẳng định kiểu**. Muốn chuyển đổi giá trị thật sự thì phải dùng hàm runtime: `Number(x)`, `String(x)`, `parseInt(x)`.

</details>

**3. TypeScript có cho phép assert bừa từ `string` sang `number` không? Quy tắc nào giới hạn những cặp kiểu được phép assert trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Compiler chặn lại:

```ts
const x = "hello" as number;
// Error: Conversion of type 'string' to type 'number' may be a mistake
// because neither type sufficiently overlaps with the other.
// If this was intentional, convert the expression to 'unknown' first.
```

Quy tắc: assertion `v as T` chỉ hợp lệ khi **một trong hai kiểu gán được vào kiểu kia** — tức là T hẹp hơn kiểu hiện tại, hoặc rộng hơn. Nói cách khác, hai kiểu phải "đủ chồng lấn".

```ts
const a = someUnknown as string;          // OK — đi xuống từ top type
const b = ({} as { x?: number });          // OK — hai shape tương thích
const c = (el as HTMLElement) as HTMLInputElement; // OK — subtype
const d = "hi" as number;                  // Error — không liên quan
```

Ý đồ thiết kế: assertion chỉ nên dùng để **thu hẹp hoặc mở rộng** hiểu biết về cùng một giá trị, chứ không phải để tuyên bố một giá trị là thứ hoàn toàn khác. Khi bạn cố làm chuyện sau, gần như chắc chắn là nhầm lẫn — nên compiler bắt bạn viết rõ ý định qua hai bước `as unknown as T`, đủ xấu xí để lộ ra trong code review.

</details>

**4. Vì sao muốn ép giữa hai kiểu không liên quan lại phải đi qua `as unknown as T`? Cách viết này nguy hiểm ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `unknown` là **top type** — mọi kiểu đều gán được vào nó, và từ nó có thể assert xuống bất kỳ kiểu nào. Đi vòng qua `unknown` tách một bước cấm thành hai bước hợp lệ:

```ts
const x = "hello" as unknown as number; // TS không cản nữa
```

Nguy hiểm nằm ở chỗ nó **vô hiệu hoá đúng cái lưới an toàn** mà quy tắc chồng lấn sinh ra. Compiler đã cố nói "hai kiểu này chẳng liên quan gì, bạn đang nhầm" và bạn trả lời "cứ làm đi":

```ts
const x = "hello" as unknown as number;
const result = x.toFixed(2); // Crash runtime: x.toFixed is not a function
```

Tệ hơn, lỗi không nổ tại dòng assertion mà nổ ở nơi giá trị được dùng — có thể cách đó nhiều module, nên rất khó lần ngược.

Khi nào chấp nhận được: viết test/mock (`{} as unknown as Repository`), lách qua type definition sai của thư viện bên thứ ba, hoặc code hạ tầng generic mà chữ ký công khai vẫn chặt. Mọi trường hợp khác nên thay bằng type guard hoặc validation. Nếu buộc phải dùng, hãy kèm comment giải thích lý do.

</details>

**5. `as const` làm gì với object và array? Tính `readonly` mà nó tạo ra là nông hay sâu (deep)?**

<details className="qa">
<summary>Xem đáp án</summary>

`as const` yêu cầu compiler suy luận kiểu **hẹp nhất có thể** và đánh dấu mọi thứ là `readonly`:

- Với **array**: từ mảng thường thành **readonly tuple** giữ nguyên literal.
- Với **object**: mọi property thành `readonly`, giá trị giữ literal type thay vì bị nới rộng.

```ts
const colors = ["red", "green"];
// string[]

const colors2 = ["red", "green"] as const;
// readonly ["red", "green"]

const config = { url: "/api", method: "GET" } as const;
// { readonly url: "/api"; readonly method: "GET" }
```

Về độ sâu: `as const` áp dụng **đệ quy (deep)** trên toàn bộ cây literal viết trực tiếp — object lồng trong object, mảng lồng trong mảng đều thành `readonly` và giữ literal.

```ts
const c = { db: { host: "local", ports: [1, 2] } } as const;
// c.db.ports là readonly [1, 2]; c.db.host là "local"
```

Nhưng đây vẫn chỉ là ràng buộc **ở tầng kiểu** — không phải `Object.freeze`. Lúc chạy giá trị vẫn sửa được nếu lách qua `any`. Và `as const` chỉ dùng được với literal viết ngay tại chỗ, không áp lên biến hay lời gọi hàm.

</details>

**6. Đoán kiểu: `const a = ["GET", "POST"];` và `const b = ["GET", "POST"] as const;` — mỗi biến được suy luận ra kiểu gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
const a = ["GET", "POST"];
// type: string[]

const b = ["GET", "POST"] as const;
// type: readonly ["GET", "POST"]
```

Vì sao `a` là `string[]` dù khai báo bằng `const`? Vì `const` chỉ khoá **tham chiếu tới mảng**, còn nội dung mảng thì vẫn sửa được — `a.push("PUT")`, `a[0] = "PATCH"` đều hợp lệ. Nên compiler nới rộng (widening) từng phần tử từ literal `"GET"` lên `string`, và coi độ dài là linh hoạt.

Với `as const`, kết quả khác ở ba điểm:

- **Giữ literal type** cho từng phần tử: `"GET"`, `"POST"` chứ không phải `string`.
- **Thành tuple**: độ dài cố định 2, kiểu gắn theo từng vị trí.
- **`readonly`**: `b.push(...)`, `b[0] = ...` đều báo lỗi compile.

```ts
a[0] = "PATCH"; // OK
b[0] = "PATCH"; // Error: Cannot assign to '0' because it is a read-only property
```

Đây chính là điều kiện để sinh union từ mảng bằng `typeof b[number]`.

</details>

**7. Pattern `typeof ARR[number]` để sinh union từ một mảng hoạt động thế nào? Vì sao bắt buộc phải có `as const` mới ra kết quả mong muốn?**

<details className="qa">
<summary>Xem đáp án</summary>

Pattern này gồm hai bước:

```ts
const ROLES = ["admin", "user", "guest"] as const;
type Role = typeof ROLES[number]; // "admin" | "user" | "guest"
```

- `typeof ROLES` chuyển **giá trị** `ROLES` sang **kiểu** của nó: `readonly ["admin", "user", "guest"]`.
- `[number]` là **indexed access type** — lấy kiểu tại mọi chỉ số kiểu `number`. Với tuple, kết quả là union của mọi phần tử.

Không có `as const` thì bước một đã hỏng:

```ts
const ROLES2 = ["admin", "user", "guest"];
type Role2 = typeof ROLES2[number]; // string — vô dụng
```

Vì mảng không `as const` được suy ra `string[]`, mọi phần tử đều là `string`, nên indexed access chỉ cho lại `string`.

Giá trị của pattern: **một nguồn sự thật duy nhất**. Bạn có mảng dùng được lúc runtime (để render dropdown, để validate) và union type sinh tự động từ chính nó. Thêm `"moderator"` vào mảng là type cập nhật theo ngay, không phải sửa hai chỗ và không sợ lệch nhau.

</details>

**8. Non-null assertion `!` khác gì optional chaining `?.` và toán tử nullish coalescing `??`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba thứ này hay bị xếp chung nhưng bản chất khác hẳn: `!` thuộc **tầng kiểu**, hai cái còn lại là **toán tử JavaScript thật**.

| | `!` | `?.` | `??` |
|---|---|---|---|
| Tồn tại lúc runtime | Không — bị xoá khi biên dịch | Có | Có |
| Việc nó làm | Khẳng định "không null/undefined" | Dừng và trả `undefined` nếu bên trái null/undefined | Trả vế phải nếu vế trái là null/undefined |
| Nếu giá trị thật là null | **Crash** | An toàn, trả `undefined` | An toàn, dùng giá trị mặc định |

```ts
user!.name;          // TS tin bạn; null → TypeError lúc chạy
user?.name;          // undefined nếu user null — an toàn
user?.name ?? "N/A"; // có giá trị mặc định
```

Lưu ý `??` chỉ nhảy vào vế phải khi vế trái là `null` hoặc `undefined`, khác `||` vốn nhảy với cả `0`, `""`, `false` — nên `count ?? 10` giữ được `count = 0`, còn `count || 10` thì không.

Quy tắc chọn: cần xử lý thật thì dùng `?.` / `??`; chỉ khi bạn có bằng chứng logic chắc chắn mà compiler không thấy được thì mới dùng `!`.

</details>

**9. Vì sao `!` bị coi là một trong những tính năng nguy hiểm nhất của TypeScript? Khi nào thì chấp nhận được?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì nó **tắt đúng cái bảo vệ giá trị nhất** mà TypeScript mang lại — `strictNullChecks` — và làm việc đó chỉ bằng một ký tự, dễ gõ, dễ lọt qua review.

```ts
const el = document.getElementById("not-exist")!;
el.innerHTML = "Hi"; // TypeError: Cannot set properties of null
```

Mấy điểm khiến nó đặc biệt rủi ro:

- Không để lại dấu vết runtime, nên khi crash không có thông báo nào chỉ về chỗ đã khẳng định sai.
- Nó thường được dùng như cách "làm im lỗi đỏ trong editor" chứ không phải sau khi suy nghĩ.
- Giả định có thể **đúng hôm nay, sai ngày mai** — DOM đổi, API đổi field, thứ tự khởi tạo đổi, mà `!` thì không ai xem lại.

Chấp nhận được khi bạn có lý do logic vững và nói ra được: giá trị đã được khởi tạo bởi framework trước khi code chạy; đã kiểm tra ở một chỗ mà control-flow analysis không lần được qua (ví dụ sau một hàm helper kiểm tra); hoặc trong test/script nhỏ. Kể cả vậy, phương án tốt hơn thường có sẵn:

```ts
const el = document.getElementById("app");
if (!el) throw new Error("Missing #app");
el.innerHTML = "Hi"; // narrow thật, thông báo lỗi rõ ràng
```

</details>

**10. Đoán lỗi: `const el = document.getElementById("app")!; el.innerHTML = "x";` — đoạn này đã an toàn chưa, chuyện gì xảy ra nếu phần tử không tồn tại?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chưa an toàn.** Đoạn code biên dịch sạch vì `!` đã thu kiểu từ `HTMLElement | null` xuống `HTMLElement`, nhưng chẳng có kiểm tra nào ở runtime.

Nếu trang không có phần tử `id="app"`, `getElementById` trả về `null`, và dòng sau ném:

```
TypeError: Cannot set properties of null (setting 'innerHTML')
```

Các tình huống thực tế khiến nó xảy ra: script chạy trong `<head>` trước khi DOM parse xong, id bị đổi tên trong HTML, component render muộn, hoặc cùng đoạn code chạy trên một trang khác không có phần tử đó.

Cách viết an toàn — kiểm tra thật, và thông báo lỗi nói rõ nguyên nhân:

```ts
const el = document.getElementById("app");
if (!el) throw new Error("Missing #app element");
el.innerHTML = "x"; // el đã được narrow thành HTMLElement
```

Hoặc xử lý mềm hơn khi phần tử là tuỳ chọn:

```ts
document.getElementById("app")?.replaceChildren("x");
```

Khác biệt cốt lõi: `!` giấu vấn đề, còn `if (!el) throw` biến nó thành lỗi có tên và có vị trí rõ ràng.

</details>

**11. `satisfies` (TS 4.9+) khác `as T` và khác annotation `: T` ở điểm nào? Hãy điền bảng hai cột: có kiểm tra constraint / có giữ literal type.**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách viết | Kiểm tra constraint? | Giữ kiểu suy luận chi tiết? |
|---|---|---|
| `const x: T = ...` | Có | **Không** — kiểu của `x` bị rộng thành `T` |
| `const x = ... as T` | **Không** — chỉ khẳng định | Không — kiểu thành `T` |
| `const x = ... satisfies T` | Có | **Có** — giữ kiểu suy luận từ giá trị |

```ts
type Palette = Record<string, string | number>;

const colors1: Palette = { red: "#f00", blue: 42 };
colors1.red.toUpperCase(); // Error: red có thể là number

const colors2 = { red: "#f00", blue: 42 } satisfies Palette;
colors2.red.toUpperCase(); // OK — TS vẫn biết red là string
```

`satisfies` giải đúng thế lưỡng nan cũ: trước đây muốn được kiểm tra shape thì phải viết `: T` và chịu mất thông tin chi tiết, còn muốn giữ chi tiết thì bỏ annotation và mất luôn kiểm tra. Nay bạn được cả hai — compiler xác minh giá trị thoả `T`, nhưng kiểu của biến vẫn là kiểu suy luận từ chính giá trị đó. `as T` thì tệ nhất trong ba: nó không xác minh gì cả. Vì vậy `satisfies` nên là lựa chọn mặc định cho object cấu hình, bảng hằng số, map route.

</details>

**12. Cho `const config = { port: 3000 } satisfies Config;` — `config.port` có kiểu gì? Nếu đổi sang `const config: Config = { port: 3000 }` thì kiểu đó thay đổi ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Câu trả lời phụ thuộc vào `Config` khai báo `port` rộng đến đâu — và đó chính là điểm mấu chốt.

Nếu `Config = { port: number }` thì cả hai cách đều cho `config.port` kiểu `number`: `satisfies` giữ kiểu suy luận từ giá trị, mà property của object literal vốn bị nới rộng từ `3000` lên `number`.

Khác biệt lộ ra khi kiểu trong `Config` rộng hơn giá trị thật:

```ts
type Config = { port: number | string; host?: string };

const a = { port: 3000 } satisfies Config;
a.port;        // number — giữ được kiểu hẹp
a.host;        // Error: property 'host' không tồn tại trên kiểu của a

const b: Config = { port: 3000 };
b.port;        // number | string — phải narrow mới dùng được
b.port.toFixed(2); // Error
b.host;        // string | undefined
```

Muốn giữ literal `3000` thì kết hợp cả hai: `{ port: 3000 } as const satisfies Config`. Điểm chung của cả hai cách là **đều được kiểm tra** thoả `Config` — thiếu field bắt buộc hay thừa field lạ đều báo lỗi; khác biệt nằm ở kiểu mà biến mang sau đó.

</details>

**13. Vì sao `as any` tạo ra cảm giác an toàn giả? Nêu phương án thay thế khi thật sự chưa biết kiểu của dữ liệu.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì file vẫn là `.ts`, build vẫn xanh, editor vẫn không gạch đỏ — nhưng từ điểm đó trở đi bạn đang viết JavaScript thuần mà không hay biết. Đó là tình huống tệ hơn cả không dùng TypeScript: khi không có TS, ít nhất bạn còn cảnh giác.

```ts
const data = (response as any).user.name.trim();
// mọi bước đều là any, gõ sai tên field cũng không ai báo
```

`any` còn **lan truyền**: giá trị đó chảy vào các hàm khác, gán vào biến đã khai báo kiểu tử tế, làm hỏng bảo đảm ở những nơi rất xa chỗ bạn viết `as any`.

Phương án thay thế, xếp theo thứ tự ưu tiên:

- **`unknown` + type guard** — vẫn nhận mọi giá trị nhưng compiler bắt kiểm tra trước khi dùng.
- **Schema validation (Zod, Valibot, io-ts)** — tốt nhất cho dữ liệu ngoài, vì kiểm tra thật lúc chạy rồi suy ra kiểu từ schema.
- **`as unknown as T`** — nếu buộc phải khẳng định, ít nhất bạn nêu rõ kiểu đích mong muốn.
- **Viết type cho thư viện thiếu định nghĩa** trong file `.d.ts`, thay vì bôi `any` khắp nơi.

Nếu vẫn phải dùng `any`, hãy khoanh nó trong một hàm nhỏ có chữ ký công khai chặt chẽ, kèm comment giải thích.

</details>

**14. Assertion function (`function assert(x: unknown): asserts x is string`) khác type guard (`function isStr(x: unknown): x is string`) ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Type guard `x is T` | Assertion function `asserts x is T` |
|---|---|---|
| Trả về | `boolean` | không trả gì (`void`) |
| Khi sai kiểu | trả `false` | **ném lỗi** |
| Cách narrow | trong nhánh `if` | từ dòng gọi trở đi trong cả scope |

```ts
function isStr(x: unknown): x is string {
  return typeof x === "string";
}

function assertStr(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("Not a string");
}

function demo(v: unknown) {
  if (isStr(v)) v.toUpperCase();   // chỉ narrow trong if
  assertStr(v);
  v.toUpperCase();                 // narrow từ đây trở xuống
}
```

Chọn cái nào: type guard khi cần **rẽ nhánh** (giá trị sai vẫn là tình huống hợp lệ); assertion function khi giá trị sai là **lỗi lập trình** và nên dừng ngay — kiểu như `assertIsDefined`, `assertNever`.

Một quy định cú pháp dễ vấp: hàm dùng `asserts` phải được gọi qua một tham chiếu có **annotation kiểu tường minh**. Viết `const assertStr = (x: unknown): asserts x is string => {...}` sẽ bị compiler từ chối, phải khai báo dạng `function` hoặc gán kèm kiểu tường minh cho biến.

</details>

**15. Khi nào nên dùng validation runtime (Zod, type guard) thay vì assertion? Minh hoạ bằng luồng xử lý JSON trả về từ API.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: dùng validation runtime ở **mọi ranh giới mà dữ liệu đến từ ngoài chương trình** — response API, `localStorage`, query string, file cấu hình, message từ WebSocket, input người dùng. Ở đó bạn không kiểm soát được hình dạng dữ liệu, nên một lời khẳng định `as` chỉ là mong ước.

Luồng sai lầm quen thuộc:

```ts
const user = (await fetch("/api/user").then(r => r.json())) as User;
user.profile.avatar; // API đổi field → crash, và crash ở tận component
```

Luồng đúng — validate ngay tại chỗ tiếp nhận:

```ts
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

async function loadUser(): Promise<User> {
  const raw: unknown = await fetch("/api/user").then(r => r.json());
  return UserSchema.parse(raw); // sai shape → ném lỗi ngay tại đây
}
```

Lợi ích: lỗi nổ đúng chỗ, đúng lúc, kèm thông báo chỉ rõ field nào sai; kiểu được **suy ra từ schema** (`z.infer<typeof UserSchema>`) nên chỉ có một nguồn sự thật. `as` vẫn hợp lý cho dữ liệu nội bộ mà bạn kiểm soát hoàn toàn — ví dụ ép một DOM element mà chính bạn vừa tạo ra.

</details>

**16. Trong file `.tsx`, cú pháp assertion kiểu `<Type>value` có dùng được không? Vì sao, và phải viết thay thế thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không dùng được.** Trong `.tsx`, dấu `<` mở đầu một biểu thức được parser hiểu là bắt đầu **JSX element**, nên `<string>value` bị đọc thành một thẻ JSX tên `string` chưa đóng — lỗi cú pháp, không có cách nào phân biệt được hai ý nghĩa.

```tsx
const a = <string>value;  // Error trong .tsx
const b = value as string; // OK
```

Cú pháp `<Type>value` là dạng assertion cũ, vẫn hợp lệ trong file `.ts` thuần, nhưng khuyến nghị chung hiện nay là **luôn dùng `as`** cho nhất quán — code dễ di chuyển giữa `.ts` và `.tsx`, và hầu hết style guide đều quy định vậy.

Một tình huống liên quan hay gặp: khai báo generic arrow function trong `.tsx` cũng vướng cùng vấn đề. `const f = <T>(x: T) => x;` bị hiểu là JSX; cách viết thường dùng là thêm dấu phẩy hoặc ràng buộc:

```tsx
const f = <T,>(x: T) => x;          // dấu phẩy báo cho parser đây là generic
const g = <T extends unknown>(x: T) => x; // hoặc dùng extends
```

</details>

---

## 5. Type Inference và Compatibility

Bài học: [5. Type Inference và Compatibility](../../typescript/02-types/5_type-inference.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Type inference là gì? TypeScript dựa vào những nguồn nào để suy luận kiểu cho một biến hoặc một hàm?**

<details className="qa">
<summary>Xem đáp án</summary>

**Type inference** là khả năng TypeScript tự đoán kiểu của biến hoặc biểu thức mà bạn không cần viết annotation. Nhờ vậy code gọn hơn nhưng vẫn type-safe.

Các nguồn chính TS dựa vào:

- **Initializer** — giá trị khởi tạo của biến: `const n = 5` → `number`.
- **Return của hàm** — TS suy từ các lệnh `return` bên trong: `function add(a: number, b: number) { return a + b }` → return type `number`.
- **Contextual typing** — suy từ ngữ cảnh nơi biểu thức được dùng, ví dụ tham số của callback truyền vào `addEventListener`.
- **Best common type** — khi mảng chứa nhiều kiểu, TS chọn kiểu chung tốt nhất (thường là union).
- **Giá trị mặc định của tham số** — `function f(x = 0)` → `x: number`.

Nguyên tắc dùng: để TS suy luận khi kiểu đã hiển nhiên, chỉ annotate tham số hàm, public API, hoặc khi inference cho ra kiểu sai/quá rộng.

</details>

**2. Đoán kiểu: `let count = 10;` và `const PI = 3.14;` — hai biến được suy luận thành kiểu gì, và vì sao lại khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
let count = 10;    // number
const PI = 3.14;   // 3.14 (literal type)
```

- `count` được suy thành `number` — kiểu **rộng**.
- `PI` được suy thành literal type `3.14` — kiểu **hẹp**, chỉ chứa đúng giá trị đó.

Khác nhau vì **widening**. Biến khai báo bằng `let` có thể gán lại sau này, nên giữ literal `10` là vô nghĩa — TS mở rộng (widen) lên `number` để mọi phép gán số sau đó đều hợp lệ. Còn `const` với giá trị primitive không bao giờ đổi được, nên TS giữ nguyên literal type, cho phép dùng nó ở những nơi cần đúng giá trị cụ thể (ví dụ khớp với union literal).

Lưu ý: quy tắc này chỉ áp dụng cho primitive. `const obj = { a: 1 }` vẫn suy thành `{ a: number }` vì property bên trong object vẫn sửa được.

</details>

**3. Widening là gì? Vì sao `let x = "hello"` cho ra `string` còn `const y = "hello"` giữ nguyên literal `"hello"`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Widening** là việc TypeScript mở rộng một literal type thành kiểu chung bao trùm nó — `"hello"` thành `string`, `10` thành `number`, `true` thành `boolean`.

```ts
let x = "hello";    // string (widened)
const y = "hello";  // "hello" (literal, không widen)

x = "world";        // OK vì kiểu là string
```

Lý do nằm ở khả năng gán lại:

- `let` cho phép gán giá trị mới. Nếu TS giữ kiểu `"hello"` thì dòng `x = "world"` sẽ lỗi ngay — vô lý với ý định của lập trình viên. Nên TS widen lên `string`.
- `const` với primitive thì giá trị cố định vĩnh viễn, giữ literal type là an toàn và còn hữu ích hơn.

Hệ quả thực tế: khi cần truyền một chuỗi vào tham số kiểu union literal, hãy dùng `const` (hoặc `as const`) thay vì `let`, nếu không giá trị sẽ bị widen thành `string` và gán không được.

</details>

**4. Khi nào nên khai báo kiểu tường minh thay vì để TypeScript tự suy luận? Nêu tiêu chí cho code nội bộ và cho public API.**

<details className="qa">
<summary>Xem đáp án</summary>

Quy tắc vàng: **để TS suy luận khi đã rõ, chỉ annotate khi thật sự cần**.

Với **code nội bộ**:

- Bỏ annotation thừa cho biến có initializer rõ ràng: viết `const count = 0` thay vì `const count: number = 0`.
- Để return type tự suy ra cho hàm private/helper.
- Vẫn phải annotate **tham số hàm** — TS không có gì để suy ra từ đó (trừ khi hàm nằm trong ngữ cảnh contextual typing).
- Annotate khi inference cho ra kiểu **sai hoặc quá rộng**, ví dụ mảng khởi tạo rỗng `const list = []` cho ra `any[]`.

Với **public API** (hàm/biến `export`):

- Nên annotate return type để **khoá hợp đồng** — nếu sau này sửa thân hàm làm đổi kiểu trả về, compiler báo lỗi ngay tại chỗ định nghĩa thay vì để lỗi lan ra chỗ gọi.
- Giúp file `.d.ts` sinh ra ổn định và đọc được, không phụ thuộc chi tiết cài đặt bên trong.

</details>

**5. Contextual typing hoạt động thế nào? Vì sao trong `addEventListener("click", (e) => ...)` TypeScript biết `e` là `MouseEvent` mà không cần annotate?**

<details className="qa">
<summary>Xem đáp án</summary>

**Contextual typing** là chiều suy luận **ngược**: thay vì suy kiểu của biểu thức từ giá trị của nó, TS suy từ **vị trí mà biểu thức được dùng**. Khi một hàm được đặt vào chỗ đang mong đợi một kiểu hàm cụ thể, TS lấy signature mong đợi đó để gán kiểu cho các tham số.

```ts
window.addEventListener("click", (event) => {
  console.log(event.button); // event: MouseEvent
});

[1, 2, 3].map((x) => x * 2); // x: number
```

Với `addEventListener`, khai báo trong lib DOM dùng overload theo tên sự kiện: chuỗi `"click"` khớp với entry `click` trong `WindowEventMap`, và entry đó khai báo handler nhận `MouseEvent`. TS đọc ngược signature này rồi gán `event: MouseEvent`. Đổi sang `"keydown"` thì `event` sẽ là `KeyboardEvent`.

Nhờ contextual typing, callback trong array method, Promise `.then`, event handler... đều không cần annotate tham số.

</details>

**6. Best common type là gì? Đoán kiểu suy luận của `const arr = [1, "hello", true];` và của `const items = [{ a: 1 }, { b: 2 }];`**

<details className="qa">
<summary>Xem đáp án</summary>

**Best common type** là cơ chế TS dùng khi suy kiểu cho mảng có nhiều phần tử khác kiểu: nó xét kiểu của từng phần tử rồi chọn một kiểu chung bao được tất cả — thường là **union** của các kiểu đó.

```ts
const arr = [1, "hello", true];
// inferred: (string | number | boolean)[]

const items = [{ a: 1 }, { b: 2 }];
// inferred: ({ a: number } | { b: number })[]
```

Điểm cần chú ý ở ví dụ thứ hai: TS **không** trộn hai object thành `{ a?: number; b?: number }`, mà giữ chúng thành union hai shape riêng. Hệ quả là `items[0].a` sẽ báo lỗi, vì trên union đó property `a` không tồn tại trên mọi nhánh — muốn truy cập phải narrow trước (ví dụ bằng toán tử `in`).

Nếu muốn kiểm soát, hãy annotate tường minh kiểu phần tử thay vì phụ thuộc vào best common type.

</details>

**7. Vì sao return type của hàm thường không cần annotate, nhưng với hàm được export ra ngoài lại nên khai báo tường minh?**

<details className="qa">
<summary>Xem đáp án</summary>

Với hàm nội bộ, TS suy return type từ chính các lệnh `return` — annotation chỉ là lặp lại thông tin đã hiển nhiên, làm code dài thêm mà không tăng an toàn.

Với hàm **export** (public API) thì khác, vì annotation đóng vai trò **hợp đồng**:

- **Bắt lỗi tại đúng nơi gây ra.** Nếu để suy luận, một thay đổi nhỏ trong thân hàm (lỡ trả thêm `undefined`) sẽ âm thầm đổi kiểu trả về, và lỗi chỉ nổ ra ở hàng chục chỗ gọi phía ngoài. Có annotation, compiler chặn ngay tại định nghĩa.
- **Ổn định đầu ra.** Kiểu công khai không còn phụ thuộc chi tiết cài đặt bên trong, nên refactor nội bộ không vô tình phá vỡ người dùng thư viện.
- **Tài liệu hoá và tăng tốc biên dịch.** File `.d.ts` sinh ra gọn, dễ đọc; TS cũng không phải suy luận lại toàn bộ thân hàm.

```ts
export function format(user: User): string {
  return user.name;
}
```

</details>

**8. Narrowing là gì? Liệt kê các cơ chế mà control flow analysis dùng để thu hẹp kiểu.**

<details className="qa">
<summary>Xem đáp án</summary>

**Narrowing** là việc TypeScript **thu hẹp** kiểu của một biến (thường là union) xuống kiểu cụ thể hơn khi gặp điều kiện kiểm tra. Engine phụ trách việc này là **control flow analysis** — nó đi theo dòng chảy code và biết ở mỗi nhánh biến còn có thể mang kiểu gì.

```ts
function format(x: string | number) {
  if (typeof x === "string") {
    return x.toUpperCase(); // x: string
  }
  return x.toFixed(2);      // x: number
}
```

Các cơ chế narrowing chính:

- `typeof` — cho primitive.
- `instanceof` — cho instance của class.
- Toán tử `in` — kiểm tra sự tồn tại của property.
- Truthy check (`if (x)`) — loại `null`, `undefined`, giá trị falsy.
- Tagged (discriminated) union — `if (shape.kind === "circle")`.
- `Array.isArray()`.
- User-defined type guard — `function isUser(x): x is User`.
- Assertion function — `function assert(x): asserts x is string`.

Narrow đúng giúp loại bỏ phần lớn các ép kiểu `as` không cần thiết.

</details>

**9. Phân biệt narrowing bằng `typeof`, `instanceof` và `in` — mỗi cách phù hợp với dạng dữ liệu nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Kiểm tra gì | Phù hợp với |
|---|---|---|
| `typeof x === "string"` | Kiểu primitive tại runtime | Phân biệt `string`, `number`, `boolean`, `symbol`, `bigint`, `function`, `undefined` |
| `x instanceof Foo` | Có nằm trên prototype chain của `Foo` không | Instance của class hoặc constructor function (`Date`, `Error`, class tự viết) |
| `"prop" in x` | Object có property tên đó không | Union các object shape khác nhau, không có class và không có trường phân biệt |

```ts
function handle(x: string | Date | { a: number } | { b: number }) {
  if (typeof x === "string") return x.toUpperCase();
  if (x instanceof Date) return x.getFullYear();
  if ("a" in x) return x.a;
  return x.b;
}
```

Điểm yếu cần nhớ: `typeof null === "object"` nên không dùng `typeof` để loại `null`; `instanceof` không hoạt động với `interface` hay `type` thuần (chúng bị xoá lúc biên dịch), và cũng không đáng tin khi object đi qua ranh giới realm khác.

</details>

**10. User-defined type guard (`x is User`) khác assertion function (`asserts x is string`) ở điểm nào về cách compiler xử lý luồng code sau đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều dạy compiler cách narrow, nhưng khác nhau ở **phạm vi ảnh hưởng**.

**Type guard** (`x is User`) trả về `boolean`. Nó chỉ narrow **bên trong nhánh điều kiện** dùng kết quả đó:

```ts
function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null && "name" in x;
}

if (isUser(data)) {
  data.name; // data: User, chỉ trong block này
}
// ra khỏi if, data trở lại unknown
```

**Assertion function** (`asserts x is string`) trả về `void`. Nếu điều kiện sai thì nó **throw**; nếu hàm trả về bình thường, compiler coi như khẳng định đã đúng và narrow **toàn bộ phần code còn lại** của scope, không cần `if`:

```ts
function assertString(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("not a string");
}

assertString(input);
input.toUpperCase(); // input: string từ đây trở đi
```

Lưu ý: assertion function phải được gọi qua một biến có annotation kiểu tường minh, không dùng được với arrow function suy luận kiểu.

</details>

**11. Structural typing khác nominal typing ra sao? Vì sao một instance của `class Person` gán được cho biến kiểu `interface Named`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Nominal typing** (Java, C#): hai kiểu tương thích khi chúng **cùng tên** hoặc có quan hệ kế thừa khai báo tường minh. Muốn gán được, class phải `implements` interface đó.
- **Structural typing** (TypeScript): hai kiểu tương thích khi **shape khớp** — có đủ property với kiểu phù hợp. Tên gọi và quan hệ khai báo không quan trọng.

```ts
interface Named { name: string; }
class Person { constructor(public name: string) {} }

const p: Named = new Person("An"); // OK — cùng shape
```

`Person` không hề khai báo `implements Named`, nhưng nó có property `name: string` — đủ để thoả shape của `Named`, nên phép gán hợp lệ.

Quy tắc chung: kiểu **nguồn** chỉ cần có **ít nhất** các thuộc tính mà kiểu **đích** yêu cầu; thừa thì không sao (trừ trường hợp excess property check với object literal). Cách kiểm tra này hợp với tinh thần "duck typing" của JavaScript, giúp TS làm việc được với code JS có sẵn mà không cần sửa khai báo.

</details>

**12. Excess property check là gì? Vì sao gán object literal có field thừa thì báo lỗi, còn gán qua biến trung gian lại không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Excess property check** là một lớp kiểm tra bổ sung, chỉ áp dụng khi bạn gán **object literal viết trực tiếp** vào một kiểu đã biết: TS báo lỗi nếu literal có property không tồn tại trong kiểu đích.

```ts
interface Point { x: number; y: number; }

const a: Point = { x: 1, y: 2, z: 3 }; // Error: 'z' không có trong Point

const tmp = { x: 1, y: 2, z: 3 };
const b: Point = tmp;                  // OK — không còn là literal trực tiếp
```

Vì sao khác nhau? Theo quy tắc structural typing thuần, cả hai đều hợp lệ — `tmp` đã có đủ `x` và `y`. Nhưng khi bạn viết literal ngay tại chỗ gán, property thừa gần như chắc chắn là **lỗi gõ nhầm tên** (`widht` thay vì `width`) hoặc hiểu nhầm API, chứ không ai cố tình tạo giá trị rác. Nên TS thêm cảnh báo cho riêng trường hợp đó.

Muốn bỏ qua có chủ đích: gán qua biến trung gian, dùng `as Point`, hoặc khai báo index signature trong kiểu đích.

</details>

**13. Variance: vì sao tham số hàm được kiểm tra theo contravariance còn return type theo covariance? Giải thích bằng ví dụ `Animal` và `Dog`.**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
type Animal = { name: string };
type Dog = Animal & { breed: string };
```

`Dog` hẹp hơn (cụ thể hơn) `Animal`.

**Return type — covariance (chiều thuận):** nơi nào cần một hàm trả về `Animal`, đưa hàm trả về `Dog` vẫn an toàn, vì mọi `Dog` đều là `Animal` — người gọi nhận về nhiều thông tin hơn mức cần, không hỏng gì.

```ts
let getAnimal: () => Animal;
let getDog: () => Dog;
getAnimal = getDog; // OK
```

**Tham số — contravariance (chiều ngược):** nơi nào cần một hàm xử lý **mọi** `Animal`, không thể đưa hàm chỉ biết xử lý `Dog` — người gọi có quyền truyền vào một `Animal` không phải chó, và hàm sẽ truy cập `breed` trên giá trị không có property đó. Ngược lại, hàm nhận `Animal` thì dùng được ở chỗ cần hàm nhận `Dog`, vì nó chỉ đòi ít hơn.

```ts
let animalFn: (a: Animal) => void;
let dogFn: (d: Dog) => void;
animalFn = dogFn; // Error
dogFn = animalFn; // OK
```

</details>

**14. Đoán lỗi: với `let animalFn: (a: Animal) => void;` và `let dogFn: (d: Dog) => void;` thì `animalFn = dogFn` có lỗi không? Flag `strictFunctionTypes` ảnh hưởng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Có lỗi — **khi bật `strictFunctionTypes`**.

```ts
animalFn = dogFn; // Error (strictFunctionTypes)
dogFn = animalFn; // OK
```

Lý do: gán `dogFn` vào `animalFn` nghĩa là sau đó ai cũng có thể gọi `animalFn({ name: "Miu" })` với một `Animal` không có `breed`, trong khi thân hàm `dogFn` lại giả định tham số là `Dog`. Đây chính là vi phạm contravariance của tham số.

Vai trò của flag:

- **`strictFunctionTypes: false`** (mặc định khi không bật `strict`): TS kiểm tra tham số theo **bivariance** — cả hai chiều gán đều được chấp nhận, tiện nhưng không an toàn. Đây là di sản từ thời TS ưu tiên tương thích với code JS cũ.
- **`strictFunctionTypes: true`** (bật kèm `strict`): TS kiểm tra contravariance đúng chuẩn cho các kiểu hàm viết dạng function type, và bắt lỗi ở dòng trên.

Nên bật flag này để tránh lỗi kiểu chỉ lộ ra lúc runtime.

</details>

**15. Vì sao method khai báo dạng shorthand trong `interface` lại được kiểm tra bivariant, trong khi property kiểu function type thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

`strictFunctionTypes` chỉ áp dụng contravariance cho **function type syntax**, còn **method shorthand** vẫn được kiểm tra **bivariant** — đây là ngoại lệ có chủ ý.

```ts
interface A {
  handle(x: Dog): void;        // method shorthand → bivariant
  onEvent: (x: Dog) => void;   // property function type → contravariant
}
```

Lý do là **tương thích ngược với thư viện chuẩn và code JS sẵn có**. Rất nhiều API được xây dựng trên giả định bivariance, điển hình là `Array`: `Dog[]` cần gán được cho `Animal[]` để dùng thoải mái, nhưng các method như `push(item: T)`, `forEach(cb: (item: T) => void)` nhận `T` ở vị trí tham số. Nếu áp contravariance chặt, `Dog[]` sẽ không còn tương thích với `Animal[]`, và hàng loạt code đang chạy tốt sẽ đỏ lỗi.

Nói cách khác, mảng của TypeScript vốn đã unsound theo covariance; giữ method bivariant là cái giá đánh đổi để hệ thống kiểu vẫn dùng được trong thực tế. Khi cần chặt chẽ thật sự, hãy khai báo dạng property function type.

</details>

**16. `as const` ảnh hưởng đến widening ra sao? Cho ví dụ một trường hợp thiếu `as const` khiến không gán được vào tham số kiểu union literal.**

<details className="qa">
<summary>Xem đáp án</summary>

`as const` là **const assertion** — nó chặn widening, giữ mọi giá trị ở literal type hẹp nhất, đồng thời làm object/array trở thành `readonly` (array thành tuple).

```ts
const a = { method: "GET" };            // { method: string }
const b = { method: "GET" } as const;   // { readonly method: "GET" }

const arr1 = ["a", "b"];                // string[]
const arr2 = ["a", "b"] as const;       // readonly ["a", "b"]
```

Trường hợp kinh điển thiếu `as const`:

```ts
type Method = "GET" | "POST";
function request(url: string, method: Method) {}

const opts = { method: "GET" };
request("/api", opts.method);
// Error: 'string' không gán được cho 'Method'

const opts2 = { method: "GET" } as const;
request("/api", opts2.method); // OK — kiểu là "GET"
```

Property bên trong object luôn bị widen (vì có thể gán lại), nên `opts.method` thành `string`. Thêm `as const` giữ đúng literal `"GET"`, khớp với union. Cách khác: annotate `const opts: { method: Method } = ...`.

</details>
