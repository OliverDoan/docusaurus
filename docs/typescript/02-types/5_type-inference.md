---
sidebar_position: 5
title: "5. Type Inference và Compatibility"
---

# Type Inference và Compatibility

**Type inference** (suy luận kiểu tự động) là khả năng TypeScript tự đoán ra kiểu dữ liệu của biến hay biểu thức mà bạn không cần viết kiểu một cách tường minh. **Type compatibility** (tính tương thích kiểu) là quy tắc giúp TypeScript quyết định khi nào một kiểu có thể được gán cho kiểu khác. Hiểu hai khái niệm này giúp bạn viết code gọn hơn mà vẫn an toàn về kiểu.

---

## Mục lục

- [Vì sao cần type inference?](#vì-sao-cần-type-inference)
- [Type Inference](#type-inference)
- [Contextual Typing](#contextual-typing)
- [Best Common Type](#best-common-type)
- [Widening và Narrowing](#widening-và-narrowing)
- [Type Compatibility](#type-compatibility)

---

## Vì sao cần type inference?

**Vấn đề:** Nếu phải ghi chú thích kiểu cho **mọi** biến và **mọi** return,
code trở nên rườm rà, trùng lặp — kiểu hiển nhiên vẫn phải viết lại, vừa
dài vừa nản:

```ts
const n: number = 5;
const name: string = "An";
const tags: string[] = ["a", "b"];

function add(a: number, b: number): number {
  return a + b; // return number rõ ràng mà vẫn phải khai báo
}
```

**Giải pháp:** TypeScript **tự suy luận kiểu** từ giá trị và ngữ cảnh
(initializer, return, đối số mặc định, contextual typing) → code gọn
**nhưng vẫn type-safe**. Nguyên tắc: để TS suy luận khi đã rõ ràng, chỉ
annotate khi thật sự cần (tham số hàm, public API, hoặc khi inference sai
hay quá rộng):

```ts
const n = 5;             // number
const name = "An";       // string
const tags = ["a", "b"]; // string[]

function add(a: number, b: number) {
  return a + b; // return type tự suy ra: number
}
```

:::tip[Dùng thực tế]

- Bỏ chú thích thừa cho biến khởi tạo: `const count = 0;` thay vì
  `const count: number = 0;`.
- Để return type tự suy ra cho hàm nội bộ, chỉ annotate return ở public
  API để khoá hợp đồng (contract) rõ ràng.
- Callback của array method tự biết kiểu phần tử:
  `[1, 2, 3].map((x) => x * 2)` — TS biết `x: number`.
- Cân bằng: để TS suy luận khi hiển nhiên, annotate tham số hàm và những
  chỗ inference cho ra kiểu sai hoặc quá rộng.

:::

---

## Type Inference

TypeScript có thể **tự suy ra type** mà không cần khai báo, dựa trên
giá trị khởi tạo.

```ts
let count = 10;          // inferred: number
let name = "An";         // inferred: string
let active = true;       // inferred: boolean
const PI = 3.14;         // inferred: 3.14 (literal!)
```

Cũng infer cho return type của hàm:

```ts
function add(a: number, b: number) {
  return a + b; // return type inferred: number
}
```

:::tip[Mẹo]

**Quy tắc vàng**: chỉ khai báo type **khi inference không đủ rõ** hoặc
đó là **public API**. Code đẹp là code ít annotation thừa:

```ts
// Thừa
const name: string = "An";

// Đẹp
const name = "An";

// Cần annotation — public API export
export function format(user: User): string {
  return user.name;
}
```

:::

---

## Contextual Typing

TS suy luận type từ **ngữ cảnh** (vị trí dùng), không chỉ từ giá trị:

```ts
window.addEventListener("click", (event) => {
  console.log(event.button); // event: MouseEvent (TS biết từ context)
});
```

Trong callback hoặc tham số, TS tìm signature mong đợi để gán type.

---

## Best Common Type

Khi mảng có nhiều phần tử khác kiểu, TS chọn **kiểu chung tốt nhất**
(thường là union):

```ts
const arr = [1, "hello", true];
// inferred: (string | number | boolean)[]
```

Nếu không có kiểu chung phù hợp, TS sẽ widen lên `(A | B)[]`:

```ts
const items = [{ a: 1 }, { b: 2 }];
// inferred: ({ a: number } | { b: number })[]
```

---

## Widening và Narrowing

**Widening**: TS mở rộng literal type thành kiểu chung.

```ts
let x = "hello";  // type: string (widened)
const y = "hello"; // type: "hello" (literal, không widen)
```

Lý do: `let` cho phép gán lại nên không thể giữ literal; `const` thì cố
định.

**Narrowing**: TS thu hẹp type khi gặp điều kiện kiểm tra.

```ts
function format(x: string | number) {
  if (typeof x === "string") {
    return x.toUpperCase(); // x: string ở đây
  }
  return x.toFixed(2);      // x: number ở đây
}
```

:::info[Phân tích]

**Control flow analysis** là engine giúp TS narrow type theo dòng chảy
code. Nó hiểu được:

- `typeof`, `instanceof`, `in`.
- Truthy check (`if (x)`).
- Tagged union (`if (shape.kind === "circle")`).
- `Array.isArray()`.
- User-defined type guards (`function isUser(x): x is User`).
- Assertion functions (`function assert(x): asserts x is string`).

Hiểu sâu narrowing là kỹ năng phân biệt junior và senior khi viết TS.
Một function được narrow đúng có thể loại bỏ hàng chục `as` không cần
thiết.

:::

---

## Type Compatibility

TS dùng **structural typing** — hai type tương thích nếu **shape** khớp,
không cần cùng tên.

```ts
interface Named { name: string; }
class Person { constructor(public name: string) {} }

const p: Named = new Person("An"); // OK — cùng shape
```

**Quy tắc**: type **đích (target)** chỉ cần các thuộc tính của **nguồn
(source)** là tập con — không thiếu là được.

```ts
interface Point { x: number; y: number; }
const a: Point = { x: 1, y: 2, z: 3 }; // OK — z thừa nhưng không sao*
```

(* `*` Khi gán object literal trực tiếp, TS có **excess property check**
chặt hơn — sẽ báo lỗi `z`. Gán qua biến trung gian thì không.)

:::warning[Cần lưu ý]

**Variance** trong hàm khác với type thường:

- **Tham số hàm** kiểm tra theo **contravariance** (chiều ngược):

```ts
type Animal = { name: string };
type Dog = Animal & { breed: string };

let animalFn: (a: Animal) => void;
let dogFn: (d: Dog) => void;

animalFn = dogFn; // Error (strictFunctionTypes)
dogFn = animalFn; // OK
```

Lý do: nếu một chỗ cần hàm xử lý mọi `Animal`, không thể đưa hàm chỉ
biết xử lý `Dog`.

- **Return type** kiểm tra theo **covariance** (chiều thuận):

```ts
let getAnimal: () => Animal;
let getDog: () => Dog;

getAnimal = getDog; // OK — Dog vẫn là Animal
```

Bật flag `strictFunctionTypes: true` để TS check contravariance đúng.

:::
