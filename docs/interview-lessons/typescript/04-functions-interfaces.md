---
sidebar_position: 4
title: "4. Functions & Interfaces"
---

# 4. Functions & Interfaces

## 1. Typing Functions

Bài học: [1. Typing Functions](../../typescript/04-functions-interfaces/1_functions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao định kiểu tham số và giá trị trả về lại quan trọng? Nêu ba loại bug mà JS thuần bỏ lọt còn TS bắt được.**

<details className="qa">
<summary>Xem đáp án</summary>

Trong JavaScript, gọi hàm sai gần như không bao giờ báo gì lúc viết code — lỗi chỉ lộ ra khi chạy, thường ở xa nơi gây ra.

```ts
function add(a, b) { return a + b; }

add(1);         // NaN — thiếu đối số
add(1, 2, 3);   // 3 — đối số thừa bị bỏ qua im lặng
add("1", 2);    // "12" — nối chuỗi thay vì cộng số
```

Ba loại bug TypeScript bắt được:

- **Thiếu đối số** — `add(1)` báo lỗi "Expected 2 arguments, but got 1" thay vì trả về `NaN`.
- **Thừa đối số** — `add(1, 2, 3)` bị chặn, tránh trường hợp gọi nhầm API cũ sau khi hàm đổi signature.
- **Sai kiểu / sai thứ tự đối số** — `add("1", 2)` báo lỗi ngay, không âm thầm nối chuỗi.

Lợi ích kèm theo: editor autocomplete đối số, biết chắc kiểu trả về nên dùng kết quả cũng an toàn, và signature trở thành tài liệu sống cho đồng đội.

</details>

**2. Return type nên khai báo tường minh hay để TS `infer`? Trả lời khác nhau ra sao giữa hàm nội bộ và hàm `export`?**

<details className="qa">
<summary>Xem đáp án</summary>

Với **hàm nội bộ** (helper, hàm cục bộ trong module): để TS tự suy luận. Annotation chỉ lặp lại thông tin đã hiển nhiên, làm code dài mà không tăng an toàn.

```ts
function add(a: number, b: number) {
  return a + b; // return type suy ra: number
}
```

Với **hàm `export`** (public API): nên khai báo tường minh, vì nó đóng vai trò **hợp đồng**.

```ts
export function format(user: User): string {
  return user.name;
}
```

Lý do:

- Nếu để suy luận, một thay đổi nhỏ trong thân hàm (lỡ trả thêm `undefined`) sẽ âm thầm đổi kiểu trả về, và lỗi nổ ra ở hàng chục nơi gọi thay vì ngay tại định nghĩa.
- Kiểu công khai không còn phụ thuộc chi tiết cài đặt bên trong, nên refactor nội bộ không phá vỡ người dùng.
- File `.d.ts` sinh ra gọn, dễ đọc; compiler cũng đỡ phải suy luận lại toàn bộ thân hàm.

Ngoại lệ đáng annotate cả với hàm nội bộ: khi inference cho ra kiểu quá rộng hoặc sai ý định.

</details>

**3. Kể bốn dạng tham số mà TypeScript hỗ trợ và thứ tự bắt buộc khi khai báo chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn dạng:

- **Bắt buộc** — `a: number`, caller phải truyền.
- **Optional** — `b?: string`, có thể bỏ qua; bên trong kiểu là `string | undefined`.
- **Default value** — `c = "Mr."`, kiểu được suy từ giá trị mặc định; caller cũng có thể bỏ qua.
- **Rest** — `...args: number[]`, gộp mọi đối số còn lại thành mảng.

```ts
function f(a: number, b?: string, c = "Mr.", ...rest: boolean[]) {}
```

Thứ tự bắt buộc:

- Tham số **bắt buộc phải đứng trước optional** — viết ngược lại là lỗi "A required parameter cannot follow an optional parameter".
- **Rest luôn đứng cuối cùng**, và chỉ được có một.
- Tham số có default value về mặt cú pháp được đặt ở bất kỳ đâu, nhưng nếu nó đứng trước tham số bắt buộc thì caller phải truyền `undefined` tường minh để lấy giá trị mặc định — nên trên thực tế vẫn nên đặt sau.

</details>

**4. Tham số optional `b?: string` khác `b: string | undefined` ở điểm nào? Đoán kết quả khi gọi hàm mà không truyền đối số.**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
function a(x?: string) {}
function b(x: string | undefined) {}

a();           // OK
b();           // Error — Expected 1 arguments, but got 0
b(undefined);  // OK
```

Khác biệt nằm ở **có được phép bỏ qua đối số hay không**:

- `?` — caller **không cần truyền**. Bên trong hàm, kiểu của `x` vẫn là `string | undefined`, nên vẫn phải kiểm tra trước khi dùng.
- `| undefined` — caller **bắt buộc truyền**, nhưng được phép truyền `undefined`.

Về mặt kiểu bên trong thân hàm thì hai cách giống nhau; khác nhau ở phía nơi gọi. (Kỹ thuật hơn: `?` còn làm `arguments.length` khác nhau và ảnh hưởng tới cách compiler đếm arity.)

Chọn thế nào: dùng `?` cho public API khi đối số thực sự tuỳ chọn — caller viết gọn hơn. Dùng `| undefined` khi bạn muốn **ép caller ra quyết định tường minh**, tránh trường hợp quên truyền một giá trị quan trọng.

</details>

**5. Vì sao tham số optional không được đặt trước tham số bắt buộc? Có cách nào lách và có nên lách không?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì JavaScript truyền đối số **theo vị trí**, không theo tên. Nếu optional đứng trước, compiler không có cách nào biết đối số bạn truyền ứng với tham số nào.

```ts
function f(a?: number, b: string) {} // Error: A required parameter cannot
                                      // follow an optional parameter.
f("hi"); // ứng với a hay b? Không xác định được
```

Cách "lách" có thể gặp:

- Khai báo `a: number | undefined, b: string` rồi bắt caller truyền `undefined` tường minh: `f(undefined, "hi")`.
- Dùng **function overload** để mô tả các dạng gọi khác nhau.
- Đảo thứ tự cho hợp lý — cách tự nhiên nhất.

Có nên lách không? Nói chung là **không**. Khi thấy mình cần vậy, đó là dấu hiệu signature đang quá phức tạp. Giải pháp sạch hơn là gom đối số vào một **object options**:

```ts
function f({ a, b }: { a?: number; b: string }) {}
f({ b: "hi" });
```

Cách này còn tránh được bẫy "boolean trap" và không cần nhớ thứ tự đối số.

</details>

**6. Tham số có `default value` thì kiểu được suy ra thế nào? Nó có tự động thành optional với caller không?**

<details className="qa">
<summary>Xem đáp án</summary>

Kiểu được **suy ra từ chính giá trị mặc định** (đã widen), nên thường không cần annotate:

```ts
function greet(name: string, title = "Mr.") {
  return `${title} ${name}`; // title: string
}
```

Với caller, tham số đó **trở thành optional** — bỏ qua được:

```ts
greet("An");          // "Mr. An"
greet("An", "Dr.");   // "Dr. An"
greet("An", undefined); // "Mr. An" — truyền undefined cũng kích hoạt default
```

Vài điểm cần nhớ:

- Bên trong thân hàm, kiểu **không** chứa `undefined` (khác với `title?: string`) — vì default đã đảm bảo luôn có giá trị. Đây là ưu điểm lớn: không phải kiểm tra null.
- Chỉ `undefined` mới kích hoạt giá trị mặc định; truyền `null` thì `title` sẽ là `null`.
- Không viết `title?: string = "Mr."` — TS báo lỗi, vì `?` và default là thừa nhau.
- Muốn kiểu rộng hơn giá trị mặc định thì vẫn annotate được: `function f(mode: "a" | "b" = "a") {}`.

</details>

**7. `Rest parameter` phải khai báo kiểu ra sao? Vì sao nó bắt buộc đứng cuối danh sách tham số?**

<details className="qa">
<summary>Xem đáp án</summary>

Rest parameter phải có kiểu **mảng** (hoặc tuple), vì nó gom nhiều đối số lại thành một mảng:

```ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

function log(level: "info" | "error", ...messages: string[]) {
  console.log(`[${level}]`, ...messages);
}
```

Viết `...nums: number` là lỗi — TS yêu cầu kiểu mảng.

Vì sao phải đứng cuối: rest "hút" **tất cả đối số còn lại**, số lượng không xác định trước. Nếu có tham số nào đứng sau nó, compiler (và cả runtime JS) không thể biết đối số nào thuộc về rest và đối số nào thuộc tham số phía sau — ranh giới hoàn toàn nhập nhằng. Đây là quy tắc của chính JavaScript, TypeScript chỉ tuân theo.

Cũng vì thế mỗi hàm chỉ được có **một** rest parameter, và nó không kết hợp được với giá trị mặc định.

</details>

**8. Dùng `tuple type` cho rest parameter mang lại lợi ích gì so với mảng thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Mảng thường (`...args: number[]`) chỉ nói "bao nhiêu số cũng được". Tuple cho phép mô tả **số lượng cố định, kiểu riêng cho từng vị trí, và cả tên nhãn**:

```ts
function point(...args: [x: number, y: number, label?: string]) {}
point(1, 2);            // OK
point(1, 2, "A");       // OK
point(1);               // Error — thiếu y
point(1, "2");          // Error — sai kiểu vị trí thứ hai
```

Lợi ích:

- **Kiểm tra theo vị trí** thay vì một kiểu chung cho mọi đối số.
- **Nhãn tham số** hiện ra trong autocomplete và thông báo lỗi, đọc dễ hơn `args[0]`, `args[1]`.
- Hỗ trợ **arity chính xác**: bắt được thiếu/thừa đối số.

Ứng dụng mạnh nhất là **chuyển tiếp đối số** trong hàm wrapper generic, kết hợp với `Parameters<T>`:

```ts
function withLog<T extends (...args: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log("gọi", args);
    return fn(...args);
  };
}
```

Nhờ tuple, wrapper giữ nguyên chữ ký của hàm gốc thay vì suy biến thành `any[]`.

</details>

**9. So sánh `type BinaryOp = (a: number, b: number) => number` với `call signature` viết trong `interface`: khác nhau ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
type BinaryOp = (a: number, b: number) => number;

interface BinaryOp2 {
  (a: number, b: number): number;
}
```

Về khả năng mô tả hàm thuần, hai cách **tương đương** — gán hàm vào biến kiểu nào cũng như nhau.

Khác biệt:

| | Function type expression (`type`) | Call signature (`interface`) |
|---|---|---|
| Cú pháp | Gọn, dùng `=>` | Dài hơn, dùng `:` |
| Thêm property cho hàm | Phải dùng intersection `&` | Viết thẳng trong thân interface |
| Nhiều overload | Khó (phải dùng intersection) | Liệt kê nhiều call signature |
| Declaration merging | Không | Có |

Call signature mạnh hơn khi hàm còn mang **property** (hybrid type) hoặc cần **overload**:

```ts
interface Counter {
  (): number;        // gọi như hàm
  count: number;     // có property
  reset(): void;     // có method
}
```

Thực tế: dùng `type` cho callback và chữ ký hàm thông thường vì gọn và đọc nhanh; chuyển sang `interface` với call signature khi cần callable object hoặc khi typing thư viện cũ.

</details>

**10. `Function overloading` trong TS hoạt động ở thời điểm nào — biên dịch hay chạy? Điều đó ảnh hưởng gì tới cách viết thân hàm?**

<details className="qa">
<summary>Xem đáp án</summary>

Overload chỉ tồn tại ở **compile-time**. Sau khi biên dịch, mọi overload signature bị xoá sạch; JavaScript sinh ra chỉ có **một hàm duy nhất** — thân implementation.

```ts
function parse(input: string): string[];
function parse(input: number): number[];
function parse(input: string | number): string[] | number[] {
  if (typeof input === "string") return input.split(",");
  return [input];
}

const a = parse("a,b,c"); // string[]
const b = parse(42);      // number[]
```

Hệ quả với cách viết thân hàm:

- Thân hàm phải **tự phân biệt kiểu lúc runtime** bằng type guard (`typeof`, `Array.isArray`, kiểm tra `arguments.length`...) — không có cơ chế dispatch tự động như Java hay C++.
- Tham số của implementation phải đủ rộng để nhận **mọi** overload, thường là union.
- Kiểu trả về của implementation cũng phải bao hết các khả năng.

Đây là khác biệt cốt lõi so với overload trong ngôn ngữ compiled truyền thống: ở TS, overload chỉ là cách **mô tả** cho compiler và editor, còn logic rẽ nhánh vẫn do bạn viết tay.

</details>

**11. Nêu ba quy tắc viết overload đúng. Vì sao signature cụ thể phải đứng trước signature tổng quát?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba quy tắc:

1. Liệt kê signature **cụ thể nhất trước, tổng quát nhất sau**.
2. Signature **implementation** (cái cuối cùng, có thân hàm) **không hiển thị** với caller — nó chỉ là chỗ chứa logic.
3. Implementation phải **tương thích với mọi** overload signature: tham số đủ rộng, kiểu trả về bao hết các khả năng.

Vì sao thứ tự quan trọng: compiler duyệt danh sách overload **từ trên xuống** và chọn **signature đầu tiên khớp** với đối số. Nếu đặt cái tổng quát lên trước, nó sẽ "nuốt" hết các lời gọi và signature cụ thể phía sau không bao giờ được chọn.

```ts
// Sai thứ tự
function get(x: any): any;
function get(x: string): string[];   // không bao giờ tới lượt

// Đúng thứ tự
function get(x: string): string[];
function get(x: any): any;
```

Kết quả của việc sai thứ tự không phải là lỗi biên dịch, mà là **kiểu trả về tệ hơn mong đợi** (`any` thay vì `string[]`) — âm thầm làm mất an toàn kiểu, nên rất dễ lọt qua review.

</details>

**12. Signature `implementation` có hiển thị với caller không? Chuyện gì xảy ra nếu nó không tương thích với một overload?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không hiển thị.** Khi một hàm có overload, caller chỉ "nhìn thấy" các overload signature đã liệt kê; signature của implementation bị ẩn hoàn toàn.

```ts
function parse(input: string): string[];
function parse(input: number): number[];
function parse(input: string | number): string[] | number[] {
  if (typeof input === "string") return input.split(",");
  return [input];
}

parse("a,b");            // string[]
const x: string | number = Math.random() > 0.5 ? "a" : 1;
parse(x);                // Error — dù implementation nhận union!
```

Đây là chi tiết hay bị bất ngờ: implementation nhận `string | number` nhưng caller vẫn không được truyền union, vì không overload nào khai báo dạng đó. Muốn cho phép thì phải bổ sung một overload tương ứng.

Nếu implementation **không tương thích** với một overload — ví dụ overload khai báo trả `string[]` nhưng implementation chỉ trả `number[]` — compiler báo lỗi *"This overload signature is not compatible with its implementation signature"* ngay tại chỗ khai báo. Tuy vậy, việc kiểm tra này khá lỏng: nếu implementation dùng `any` hoặc ép kiểu, lỗi logic vẫn có thể lọt xuống runtime.

</details>

**13. Khi nào nên thay overload bằng `generic` hoặc `union return type`? Cho một ví dụ mỗi hướng.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: chỉ dùng overload khi các kiểu trả về **khác hẳn nhau** và không diễn đạt được bằng cách khác. Overload dài dòng, khó bảo trì, và dễ sai thứ tự.

**Dùng generic** khi kiểu trả về phụ thuộc kiểu đầu vào theo một quy luật:

```ts
// Thay vì overload cho từng kiểu
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2]);       // number | undefined
first(["a", "b"]);   // string | undefined
```

**Dùng union return type** khi hàm thật sự có thể trả về vài dạng và caller nên narrow:

```ts
type Result = { ok: true; data: string } | { ok: false; error: string };
function run(): Result { /* ... */ }
```

**Vẫn nên dùng overload** khi số lượng và kiểu tham số khác nhau hẳn giữa các cách gọi, ví dụ `document.createElement("div")` trả `HTMLDivElement` còn `createElement("a")` trả `HTMLAnchorElement` — quan hệ tra bảng, không suy ra bằng generic đơn giản (lib DOM thực tế dùng map kiểu kết hợp generic).

Thứ tự ưu tiên đề xuất: generic → union → overload.

</details>

**14. `Hybrid type` (callable object) là gì và vì sao nó hay xuất hiện khi typing thư viện cũ?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hybrid type** là kiểu mô tả một giá trị vừa **gọi được như hàm**, vừa **có property/method như object**. Trong TypeScript, nó được viết bằng `interface` chứa call signature kèm các thành viên khác:

```ts
interface Counter {
  (): number;        // gọi như hàm
  count: number;     // có property
  reset(): void;     // có method
}

const c: Counter = (() => c.count++) as Counter;
c.count = 0;
c();       // 0
c.reset;
```

Vì sao hay gặp ở thư viện cũ: trong JavaScript, hàm **chính là object**, nên gắn thêm property vào hàm là mẫu rất phổ biến trước thời module ES. Ví dụ kinh điển:

- **jQuery** — `$(selector)` gọi được, đồng thời có `$.ajax`, `$.extend`.
- **Express** — `express()` tạo app, còn `express.static`, `express.Router` là property.
- Nhiều thư viện cũ dùng chính hàm chính làm namespace cho các tiện ích liên quan.

Khi viết file khai báo `.d.ts` cho những thư viện này, hybrid type là cách duy nhất mô tả đúng. Trong code mới, mẫu này ít được khuyến khích — nên tách hàm và namespace riêng cho rõ ràng và dễ tree-shake.

</details>

**15. Kiểu của `this` trong hàm được khai báo thế nào? Vì sao arrow function không nhận tham số `this`?**

<details className="qa">
<summary>Xem đáp án</summary>

TypeScript cho phép khai báo `this` như một **tham số giả ở vị trí đầu tiên**. Nó chỉ tồn tại lúc biên dịch, bị xoá khi sinh JS, và không tính vào danh sách đối số của caller:

```ts
function handleClick(this: HTMLButtonElement, event: MouseEvent) {
  console.log(this.disabled); // this được định kiểu đúng
}
button.addEventListener("click", handleClick);
```

Nhờ đó, dùng sai `this` bị bắt ngay lúc biên dịch thay vì thành `undefined` lúc chạy (đặc biệt khi bật `strictBindCallApply` và `noImplicitThis`).

**Arrow function không nhận tham số `this`** vì bản thân nó **không có `this` riêng**: theo chuẩn ES, arrow function lấy `this` theo **lexical scope** — tức `this` của phạm vi bao quanh nơi nó được định nghĩa, và giá trị đó không thể thay đổi bằng `call`, `apply`, `bind` hay bằng cách gọi như method. Vì `this` đã bị cố định từ ngữ cảnh, việc khai báo kiểu cho nó là vô nghĩa, nên TS báo lỗi nếu bạn thử.

Hệ quả thực tế: dùng `function` khi cần `this` động (method của object, event handler DOM), dùng arrow function khi muốn giữ `this` của bên ngoài (callback trong class).

</details>

**16. Đoán lỗi: khai báo `function f(cb: (x: number) => void)` rồi truyền vào một hàm không nhận tham số nào — TS chấp nhận hay báo lỗi? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

TypeScript **chấp nhận** — không báo lỗi.

```ts
function f(cb: (x: number) => void) {
  cb(42);
}

f(() => console.log("xong")); // OK
f((x) => console.log(x));     // OK
f((x, y) => {});              // Error — thừa tham số
```

Lý do: một hàm **nhận ít tham số hơn** luôn dùng được ở chỗ cần hàm nhận nhiều tham số hơn. Người gọi vẫn truyền đủ đối số, hàm chỉ đơn giản **bỏ qua** những cái nó không khai báo — hoàn toàn an toàn. Ngược lại mới nguy hiểm: hàm đòi nhiều tham số hơn mức được cung cấp sẽ nhận `undefined`, nên TS chặn.

Quy tắc này phản ánh đúng thực tế JavaScript và cực kỳ hữu ích:

```ts
[1, 2, 3].forEach((x) => console.log(x));
// forEach thật ra truyền (value, index, array) — bạn chỉ lấy cái cần
["1", "2", "3"].map(Number);  // Number chỉ nhận 1 tham số, an toàn
```

Bẫy kinh điển liên quan: `["1","2","3"].map(parseInt)` cho `[1, NaN, NaN]`, vì `parseInt` nhận hai tham số và nhận luôn index làm cơ số.

</details>

---

## 2. Interfaces

Bài học: [2. Interfaces](../../typescript/04-functions-interfaces/2_interfaces.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Interface` là gì và vì sao gọi nó là một "hợp đồng"? Nêu vấn đề mà nó giải quyết so với viết inline type lặp lại.**

<details className="qa">
<summary>Xem đáp án</summary>

`interface` là cách **đặt TÊN cho một hình dạng object** để tái sử dụng. Gọi là "hợp đồng" (contract) vì nó chỉ mô tả *cần có gì* (property, method, kiểu của chúng) mà không quy định *cài đặt thế nào* — bên nào nhận kiểu đó thì phải đáp ứng đủ.

Vấn đề khi viết inline type lặp lại:

```ts
function createUser(u: { id: number; name: string; email: string }) {}
function updateUser(u: { id: number; name: string; email: string }) {}
function renderUser(u: { id: number; name: string }) {} // quên email → sai lệch
```

Thêm field `role` là phải sửa thủ công từng nơi, sót một chỗ là lệch contract mà compiler không biết. Đặt tên bằng `interface User` thì sửa một nơi, áp dụng mọi nơi. Ngoài ra interface còn mở ra `extends` (kế thừa), `implements` (class cam kết theo contract — nền tảng cho DI và repository pattern) và declaration merging.

</details>

**2. Câu kinh điển: `interface` khác `type` ở những điểm nào? Kể ít nhất năm khác biệt cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tính năng | `interface` | `type` |
|---|---|---|
| Object shape | OK | OK |
| Function type | OK (call signature) | OK |
| Union | **Không** | OK |
| Intersection | qua `extends` | qua `&` |
| Tuple | Khó | OK |
| Mapped type | Không | OK |
| Conditional / template literal | Không | OK |
| Declaration merging | **Có** | Không |
| Module augmentation | **Có** | Không |
| Hiệu năng compile khi lồng nhiều tầng | Thường nhanh hơn | Chậm hơn với nhiều `&` |

Tóm lại: `interface` mạnh ở mảng **object shape có thể mở rộng**; `type` mạnh ở mảng **tổ hợp kiểu** (union, tuple, mapped, conditional). Cả hai đều dùng được cho object shape và function type, nên phần lớn tranh luận "chọn cái nào" chỉ xoay quanh quy ước, trừ khi bạn cần đúng một tính năng riêng của một bên.

</details>

**3. Tính năng nào của `interface` mà `type` hoàn toàn không có? Tính năng nào của `type` mà `interface` không có?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chỉ `interface` có:**

- **Declaration merging** — khai báo cùng tên nhiều lần được TS tự gộp lại.
- **Module augmentation / `declare global`** — mở rộng kiểu của thư viện bên ngoài (`Window`, `express.Request`...). Đây là hệ quả trực tiếp của merging và là lý do chính khiến bạn không thể bỏ hẳn `interface`.

**Chỉ `type` có:**

- **Union**: `type Status = "idle" | "loading"`.
- **Tuple**: `type Pair = [string, number]`.
- **Mapped type**: `type Partial<T> = { [K in keyof T]?: T[K] }`.
- **Conditional type**: `type Ret<T> = T extends () => infer R ? R : never`.
- **Template literal type**: ``type Evt = `on${Capitalize<string>}` ``.
- Đặt tên cho primitive/kiểu bất kỳ: `type ID = string`.

</details>

**4. `Declaration merging` là gì? Cho ví dụ và giải thích vì sao khai báo trùng tên bằng `type` lại báo lỗi.**

<details className="qa">
<summary>Xem đáp án</summary>

**Declaration merging** là cơ chế TS **tự gộp** nhiều khai báo `interface` cùng tên trong cùng scope thành một kiểu duy nhất:

```ts
interface User { id: number }
interface User { name: string }

// TS tự gộp thành: { id: number; name: string }
const u: User = { id: 1, name: "An" };
```

Vì sao `type` không làm được? Vì `type X = ...` là một **type alias** — một tên gán cho đúng một biểu thức kiểu, giống như `const`. Nó phải được giải (resolve) ra đúng một giá trị kiểu tại chỗ khai báo, nên khai báo lại cùng tên là định nghĩa trùng → TS báo `Duplicate identifier`. Ngược lại, interface được thiết kế như một **khai báo mở (open-ended)**: TS thu thập mọi khai báo cùng tên rồi mới dựng ra shape cuối cùng.

</details>

**5. `Module augmentation` dùng để làm gì? Viết ví dụ mở rộng `Window` hoặc `express.Request`.**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng để **thêm property/method vào kiểu có sẵn của thư viện bên ngoài** mà không phải sửa file khai báo của thư viện đó — chính là declaration merging áp dụng xuyên module.

Mở rộng global `Window`:

```ts
declare global {
  interface Window {
    myApp: { version: string };
  }
}

window.myApp = { version: "1.0" }; // TS hiểu, không còn lỗi
```

Augment module npm:

```ts
declare module "express" {
  interface Request {
    userId?: string;
  }
}
```

Tình huống điển hình: middleware auth gắn `req.userId`, analytics gắn biến toàn cục lên `window`, hoặc thêm field vào `ProcessEnv`. Lưu ý file chứa `declare global` phải là module (có `import`/`export`), còn `declare module "x"` chỉ augment được module đã tồn tại — sai tên là bạn vô tình khai báo mới một module rỗng.

</details>

**6. `Declaration merging` có rủi ro gì trong codebase lớn? Vì sao nhiều team lại thích `type` vì lý do này?**

<details className="qa">
<summary>Xem đáp án</summary>

Rủi ro chính là **tính "mở" ngoài ý muốn**:

- Bất kỳ file nào trong dự án (hoặc trong một package bạn cài) cũng có thể âm thầm thêm property vào interface của bạn, không cần bạn đồng ý.
- Khi đọc một interface, bạn **không thấy được shape thật** — phải tìm hết các khai báo cùng tên rải rác mới biết đủ. Đi ngược nguyên tắc "một chỗ là nguồn sự thật".
- Gõ nhầm tên interface không báo lỗi — nó lặng lẽ merge vào một interface có sẵn thay vì tạo kiểu mới.
- Với `declare global`, phạm vi ảnh hưởng là toàn dự án, rất khó truy nguồn khi có xung đột.

Vì vậy nhiều team dùng `type` làm mặc định: type alias là **đóng (closed)** — định nghĩa tại một chỗ, muốn mở rộng phải cố ý tạo kiểu mới bằng `&`, khai báo trùng thì lỗi ngay. Họ chỉ dùng `interface` khi thật sự cần augment thư viện.

</details>

**7. So sánh `extends` của interface với `&` (intersection) của type: khác nhau ra sao khi hai bên có property trùng tên nhưng khác kiểu?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **thời điểm phát hiện xung đột**:

```ts
interface A { x: string }

// extends: LỖI NGAY tại khai báo
interface B extends A {
  x: number; // Interface 'B' incorrectly extends interface 'A'
}

// intersection: KHÔNG lỗi tại khai báo
type C = { x: string } & { x: number };
// C.x có kiểu string & number → never
const c: C = { x: ??? }; // không giá trị nào gán được
```

| | `extends` | `&` |
|---|---|---|
| Xung đột kiểu | Báo lỗi ngay tại khai báo | Im lặng, gộp thành intersection |
| Kết quả khi trùng | Không compile | Kiểu thành `never` (với method thì thành overload) |
| Lộ lỗi lúc nào | Khi khai báo | Khi cố gán giá trị, thông báo khó hiểu |

Vì vậy `extends` an toàn hơn cho public API: nó buộc bạn xử lý xung đột ngay, thay vì để một kiểu `never` lặng lẽ trôi xuống tận nơi sử dụng.

</details>

**8. Vì sao `interface` với `extends` thường compile nhanh hơn `type` với nhiều `&` lồng nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì cách TS lưu trữ và kiểm tra hai thứ này khác nhau:

- `interface` tạo ra **một object type có tên, phẳng và được cache**. TS resolve các member một lần rồi ghi nhớ; khi kiểm tra tương thích giữa hai interface, nó còn có cơ chế cache kết quả so sánh theo cặp tên kiểu.
- `A & B & C` tạo ra một **intersection type** — TS phải giữ lại danh sách các thành phần và **hợp nhất member mỗi lần** cần kiểm tra. Lồng nhiều tầng intersection thì công việc này nhân lên, và thông báo lỗi cũng phình to vì phải in ra cả cây kiểu.

Hệ quả thực tế: trong monorepo lớn (hàng trăm nghìn dòng, props component chồng nhiều tầng), đổi từ chuỗi `&` sang `interface extends` có thể rút ngắn thời gian type-check thấy rõ. Đây cũng là khuyến nghị trong tài liệu performance của chính TypeScript.

</details>

**9. Một interface có thể `extends` nhiều interface cùng lúc không? Còn `type` thì làm điều tương tự bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Có — `extends` nhận danh sách phân tách bằng dấu phẩy:

```ts
interface Swimmer { swim(): void }
interface Flyer { fly(): void }

interface Duck extends Swimmer, Flyer {
  name: string;
}
```

`Duck` khi đó có đủ `swim`, `fly` và `name`. Đây là điểm khác class: class chỉ `extends` được **một** class, nhưng `implements` được nhiều interface.

Với `type`, tương đương là **intersection**:

```ts
type Duck = Swimmer & Flyer & { name: string };
```

Kết quả sử dụng gần như giống nhau, nhưng như câu trên: nếu hai bên có property trùng tên khác kiểu, bản `extends` báo lỗi ngay tại khai báo, còn bản `&` thì đẩy lỗi xuống lúc gán giá trị.

</details>

**10. `interface` có thể `extends` một `type alias` không? Điều kiện là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Được, với điều kiện type alias đó phải resolve về một **object type có các member xác định tĩnh** (statically known members):

```ts
type Point = { x: number; y: number };

interface Point3D extends Point {  // OK
  z: number;
}
```

Không được khi alias là:

```ts
type Shape = { kind: "a" } | { kind: "b" };
interface X extends Shape {}   // LỖI: không extends được union

type Id = string;
interface Y extends Id {}      // LỖI: không phải object type
```

Với những trường hợp không extends được, cách thay thế là dùng intersection: `type X = Shape & { extra: number }` — nhưng lưu ý với union thì intersection sẽ phân phối vào từng nhánh, ngữ nghĩa không hoàn toàn giống kế thừa. Chiều ngược lại thì luôn thoải mái: `type T = SomeInterface & { ... }` hợp lệ với mọi interface.

</details>

**11. `Optional property` (`email?: string`) và `readonly property` khác nhau thế nào? `readonly` có ngăn được mọi thay đổi không?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thứ kiểm soát hai chiều khác nhau:

- `email?: string` — **có thể vắng mặt**. Kiểu thực tế là `string | undefined`, nên phải kiểm tra trước khi dùng. Ảnh hưởng lúc *khởi tạo*.
- `readonly createdAt: Date` — **bắt buộc có, nhưng không gán lại được** sau khi khởi tạo. Ảnh hưởng lúc *ghi*.

```ts
interface User {
  email?: string;
  readonly createdAt: Date;
}

const u: User = { createdAt: new Date() }; // OK, thiếu email vẫn hợp lệ
u.createdAt = new Date();  // LỖI: Cannot assign to 'createdAt'
u.createdAt.setFullYear(2030); // KHÔNG lỗi — readonly chỉ nông (shallow)
```

`readonly` **không** ngăn được mọi thay đổi:

- Chỉ **nông**: object/array bên trong vẫn mutate được.
- Chỉ tồn tại **lúc compile**, biến mất khi ra JS — không giống `Object.freeze` (thật sự chặn lúc runtime).
- Có thể lách bằng cách gán qua một kiểu không có `readonly`, vì `readonly` không tham gia kiểm tra tương thích kiểu.

</details>

**12. `Index signature` (`[key: string]: string`) là gì? Vì sao khi có index signature thì mọi property khác phải tương thích kiểu với nó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Index signature** khai báo rằng object có thể có **số lượng key không biết trước**, và mọi key kiểu đó trả về một kiểu cố định — tức mô tả một dictionary:

```ts
interface StringDict {
  [key: string]: string;
}

const d: StringDict = { name: "An", city: "HN" }; // key nào cũng được
d.anything; // TS cho là string
```

Vì sao property khai báo tường minh phải tương thích? Vì index signature là lời hứa áp dụng cho **mọi** key kiểu `string`, và tên property cụ thể cũng là một key kiểu `string`. Nếu cho phép mâu thuẫn thì cùng một key sẽ có hai kiểu:

```ts
interface Bad {
  [key: string]: string;
  count: number; // LỖI: 'number' không gán được cho 'string'
}
```

Muốn trộn, hãy nới kiểu của index signature (`[key: string]: string | number`) hoặc tách thành hai kiểu rồi kết hợp.

</details>

**13. Vì sao interface có index signature không gán được từ một `type` object thông thường trong một số trường hợp — liên quan gì tới `implicit index signature`?**

<details className="qa">
<summary>Xem đáp án</summary>

Thực ra chiều gây khó là: gán một **interface** vào một kiểu có index signature (ví dụ `Record<string, string>`) thì lỗi, còn gán một **type alias** tương đương thì được:

```ts
interface IUser { name: string }
type TUser = { name: string };

const a: Record<string, string> = {} as IUser; // LỖI
const b: Record<string, string> = {} as TUser; // OK
```

Lý do: TS cho phép object type **khai báo bằng type alias** có **implicit index signature** — vì shape của nó là đóng, TS biết chắc nó chỉ có đúng những member đó. Còn `interface` là **mở**: ở bất kỳ file nào sau đó cũng có thể declaration-merge thêm property kiểu khác vào, nên TS không dám suy ra index signature ngầm.

Cách xử lý: đổi sang `type`, hoặc cho interface một index signature tường minh, hoặc để hàm nhận generic `<T extends object>`.

</details>

**14. `Hybrid type` là gì? Viết interface mô tả một giá trị vừa gọi được như hàm vừa có property.**

<details className="qa">
<summary>Xem đáp án</summary>

**Hybrid type** là kiểu mô tả một giá trị **vừa là hàm vừa là object** (callable object). Trong JS hàm cũng là object nên gắn thêm property lên hàm là hoàn toàn hợp lệ — interface dùng **call signature** để mô tả phần gọi được, và các member thường để mô tả phần object:

```ts
interface Counter {
  (start: number): string;  // call signature — gọi như hàm
  interval: number;          // property
  reset(): void;             // method
}

function createCounter(): Counter {
  const fn = ((start: number) => `${start}`) as Counter;
  fn.interval = 100;
  fn.reset = () => {};
  return fn;
}

const c = createCounter();
c(5);        // gọi như hàm
c.interval;  // đọc property
c.reset();
```

Pattern này hay gặp khi typing thư viện kiểu **jQuery** (`$(...)` nhưng cũng có `$.ajax`) hay **lodash chain**. Cần ép kiểu (`as Counter`) ở bước khởi tạo vì TS chưa thể suy ra khi property được gán dần.

</details>

**15. `excess property check` hoạt động thế nào khi gán object literal cho biến kiểu interface? Vì sao gán qua biến trung gian lại không báo lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

TS dùng **structural typing**: chỉ cần có đủ member là tương thích, thừa cũng không sao. Nhưng riêng với **object literal gán trực tiếp**, TS bật thêm một bước kiểm tra nghiêm hơn gọi là *excess property check* — báo lỗi nếu có property lạ, vì đó gần như luôn là gõ nhầm hoặc hiểu sai API:

```ts
interface User { id: number; name: string }

const u1: User = { id: 1, name: "An", age: 20 };
// LỖI: 'age' does not exist in type 'User'

const tmp = { id: 1, name: "An", age: 20 };
const u2: User = tmp; // KHÔNG lỗi
```

Lý do trường hợp hai không lỗi: object literal khi gán cho `tmp` đã trở thành một giá trị có kiểu suy luận riêng; lúc gán `tmp` vào `u2`, TS chỉ áp dụng quy tắc tương thích cấu trúc thông thường — `tmp` có đủ `id` và `name` nên hợp lệ. Excess property check chỉ áp dụng cho object literal **tươi** (fresh). Muốn bỏ qua chủ động thì dùng `as User` hoặc thêm index signature.

</details>

**16. Class dùng `implements` interface thì compiler kiểm tra những gì? `implements` có làm class kế thừa code nào không?**

<details className="qa">
<summary>Xem đáp án</summary>

`implements` chỉ là một **lời kiểm tra**, không phải cơ chế tái sử dụng code. Compiler xác nhận class có khai báo **đủ** các member mà interface yêu cầu, với kiểu tương thích:

```ts
interface Repository {
  findById(id: number): User | null;
}

class UserRepo implements Repository {
  findById(id: number): User | null {
    return null;
  }
}
```

Những điều cần nhớ:

- **Không kế thừa gì cả** — không có implementation, không có property mặc định. Thiếu member nào là bạn phải tự viết.
- Interface chỉ mô tả phần **public**; member `private`/`protected` không thỏa mãn được yêu cầu của interface.
- `implements` **không ảnh hưởng tới suy luận kiểu bên trong class** — tham số không được TS tự điền kiểu từ interface, bạn vẫn phải khai báo (nếu không sẽ là `any` ngầm).
- Một class `implements` được **nhiều** interface, trong khi chỉ `extends` được một class.
- Ở JS đầu ra, `implements` biến mất hoàn toàn.

</details>

**17. Khi nào bạn bắt buộc phải dùng `type` thay vì `interface`? Kể các trường hợp union, tuple, mapped, conditional, template literal.**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt buộc dùng `type` khi kiểu bạn cần **không phải là một object shape đơn thuần**:

```ts
type Status = "idle" | "loading" | "done";          // union
type Pair = [string, number];                        // tuple
type Optional<T> = { [K in keyof T]?: T[K] };        // mapped type
type Ret<T> = T extends (...a: any[]) => infer R ? R : never; // conditional + infer
type EventName = `on${Capitalize<string>}`;          // template literal
type ID = string;                                    // alias cho primitive
```

Thêm vài trường hợp nữa cũng chỉ `type` làm được: đặt tên cho kiểu hàm dạng `type Fn = (a: number) => void` kết hợp union, dùng `typeof`/`keyof` để lấy kiểu từ giá trị (`type Conf = typeof config`), hay các kiểu đệ quy phức tạp.

Ngược lại, chỉ `interface` làm được declaration merging và module augmentation. Ngoài hai vùng "độc quyền" đó, cả hai tương đương cho object shape — nên chọn theo quy ước của team.

</details>

**18. Interface có mô tả được `union type` không? Nếu cần một union của nhiều shape thì làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Thân `interface` luôn là **một** object shape, không có cú pháp `|` ở cấp khai báo. Cách làm: định nghĩa từng shape bằng interface rồi dùng `type` để hợp chúng lại:

```ts
interface Circle { kind: "circle"; radius: number }
interface Square { kind: "square"; side: number }

type Shape = Circle | Square;   // phải là type

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side ** 2;
  }
}
```

Đây chính là **discriminated union** — mỗi nhánh có một property phân biệt (`kind`) là literal type, giúp TS thu hẹp kiểu (narrowing) trong `switch`/`if`. Lưu ý: union **không phải** `interface Shape extends Circle, Square` — cái đó nghĩa là "có cả hai", hoàn toàn khác "là một trong hai".

</details>

**19. Quy ước chọn `interface` hay `type` trong team bạn là gì? Bạn bảo vệ lựa chọn đó bằng lập luận nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có đáp án "đúng" tuyệt đối — điều người phỏng vấn muốn nghe là bạn **có lập luận nhất quán**. Một quy ước gọn thường dùng:

- `interface` cho **object public API** — props của component, model dữ liệu, contract giữa các module, và mọi trường hợp cần `extends`, `implements`, augment thư viện.
- `type` cho **mọi thứ còn lại** — union, tuple, mapped, conditional, alias hàm.

Lập luận bảo vệ: interface báo lỗi xung đột ngay tại khai báo khi `extends`, thông báo lỗi ngắn và dễ đọc hơn (TS hiển thị tên interface thay vì bung cả cây intersection), và compile nhanh hơn ở codebase lớn nhiều tầng kế thừa.

Phe ngược lại (mặc định `type`) cũng có lý: type alias là kiểu **đóng**, không ai merge lén được, một cú pháp dùng cho mọi loại kiểu nên ít phải cân nhắc. Quan trọng nhất: chốt một quy ước, ghi vào lint rule (`@typescript-eslint/consistent-type-definitions`) và giữ nhất quán toàn dự án.

</details>

**20. Đoán lỗi: hai file khác nhau cùng khai báo `interface User` ở phạm vi global với property trùng tên nhưng khác kiểu — chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai khai báo cùng tên ở cùng scope global sẽ **được declaration merging cố gắng gộp lại**, và vì property trùng tên khác kiểu nên TS báo lỗi:

```ts
// a.d.ts
interface User { id: number }

// b.d.ts
interface User { id: string }
// LỖI: Subsequent property declarations must have the same type.
// Property 'id' must be of type 'number', but here has type 'string'.
```

Quy tắc merging: property **không trùng tên** thì gộp bình thường; property trùng tên thì **kiểu phải giống hệt**, khác kiểu là lỗi. Riêng **method** trùng tên lại được xử lý khác — chúng gộp thành **overload** chứ không báo lỗi, và khai báo đến sau được ưu tiên xếp lên trước trong danh sách overload.

Đây chính là rủi ro của merging trong codebase lớn: lỗi hiện ở một file bạn không hề sửa, và nguyên nhân nằm ở file khác. Cách phòng: đặt kiểu trong module (có `import`/`export`) thay vì để ở global, và đặt tên có namespace rõ ràng.

</details>
