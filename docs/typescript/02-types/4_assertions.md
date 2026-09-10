---
sidebar_position: 4
title: "4. Type Assertions"
---

# Type Assertions

**Type assertion** (khẳng định kiểu) là cách bạn chủ động nói với TypeScript rằng một giá trị thuộc kiểu nào đó mà bạn đã biết chắc, để compiler tin theo thay vì tự suy luận. Lưu ý quan trọng: assertion chỉ tác động lúc biên dịch và **không kiểm tra tại runtime** (lúc chạy). Bài này giới thiệu các dạng assertion phổ biến như `as`, `as const`, non-null `!` và từ khóa `satisfies`.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Assertion không kiểm tra runtime** — chỉ "lừa" type system lúc biên dịch; nếu giá trị thực sai vẫn crash lúc chạy, nên ưu tiên type guard/validation (Zod).
- ⭐ **`satisfies` (TS 4.9+) là lựa chọn tốt nhất** — vừa kiểm tra constraint vừa giữ literal type, khác `: T` (widen) và `as T` (không check).
- **`as Type`** — ép sang kiểu cụ thể; chỉ dùng khi chắc chắn 100% về kiểu.
- **`as const`** — cố định literal thành readonly; mạnh khi kết hợp `typeof ARR[number]` để sinh union từ giá trị.
- **Non-null `!`** — khẳng định không `null`/`undefined`; chỉ tắt cảnh báo, vẫn crash nếu thực sự null. Tránh `as any` vì tạo an toàn giả.

:::

---

## Mục lục

- [Vì sao có type assertion?](#vì-sao-có-type-assertion)
- [Assertion là gì?](#assertion-là-gì)
- [as Type](#as-type)
- [as const](#as-const)
- [as any](#as-any)
- [Non-null assertion (!)](#non-null-assertion-)
- [Từ khóa satisfies](#từ-khóa-satisfies)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao có type assertion?

Đôi khi **lập trình viên biết kiểu chính xác hơn compiler**. TS phải suy luận an toàn nên trả về kiểu rộng hoặc cảnh báo quá thận trọng, dù bạn biết rõ giá trị thật là gì.

**Vấn đề:**

```ts
// getElementById trả HTMLElement | null, nhưng ta biết đó là input
const el = document.getElementById("name");
el.value = "abc"; // Error: el có thể null, và HTMLElement không có .value

// JSON.parse trả về any → mất hết kiểu
const data = JSON.parse('{"id":1}');
data.id; // any, không gợi ý gì
```

**Giải pháp:**

```ts
// `as` — nói cho compiler kiểu thật
const el = document.getElementById("name") as HTMLInputElement;
el.value = "abc"; // OK

// `as const` — cố định literal, biến thành readonly
const cfg = { method: "GET" } as const; // method: "GET" (không phải string)

// non-null `!` — khẳng định không null/undefined
const node = document.querySelector("#app")!;
```

:::tip[Dùng thực tế]

- **Ép kiểu DOM element**: `getElementById(...) as HTMLInputElement` để truy cập `.value`, `.checked`...
- **Kết quả `JSON.parse`**: gán kiểu cho dữ liệu `any` trả về (nhưng nên kèm validation cho dữ liệu ngoài).
- **Thu hẹp literal với `as const`**: tạo union/readonly từ mảng hoặc object hằng số.
- **Khẳng định non-null sau khi đã check**: khi logic đảm bảo giá trị tồn tại nhưng TS chưa suy luận được.

**Lưu ý:** assertion **không kiểm tra lúc chạy** — nó chỉ ghi đè kiểu cho compiler. Nếu giá trị thực sai, code vẫn lỗi runtime → ưu tiên **type guard** khi có thể.

:::

---

## Assertion là gì?

Assertion là cách **nói với TypeScript** rằng "tôi biết kiểu của giá trị
này, hãy tin tôi". TS sẽ **không kiểm tra runtime** — chỉ nhận type bạn
khai báo.

```ts
const data: unknown = "Hello";
const len = (data as string).length;
```

Có 5 dạng assertion chính, mỗi dạng có mục đích riêng.

Sơ đồ dưới đây tóm tắt: tùy mục đích mà chọn dạng assertion phù hợp.

```mermaid
flowchart TD
    A["Giá trị cần khẳng định kiểu"] --> B{"Mục đích là gì?"}
    B -->|"Ép sang kiểu cụ thể"| C["as Type"]
    B -->|"Cố định literal thành readonly"| D["as const"]
    B -->|"Tắt mọi kiểm tra (tạm thời)"| E["as any"]
    B -->|"Khẳng định không null/undefined"| F["non-null (!)"]
    B -->|"Ràng buộc shape mà giữ literal"| G["satisfies"]
```

---

## as Type

Ép kiểu sang một type cụ thể.

```ts
const input = document.getElementById("name") as HTMLInputElement;
console.log(input.value); // OK
```

Có thể chain qua `unknown` khi hai type không tương thích:

```ts
const x = "hello" as unknown as number; // Hai bước, TS không cản
```

:::warning[Cần lưu ý]

`as` **không phải ép kiểu runtime** — nó chỉ "lừa" type system. Nếu giá
trị thực sự không đúng, code vẫn crash:

```ts
const x = "hello" as unknown as number;
const result = x.toFixed(2); // Crash runtime: x.toFixed is not a function
```

→ Chỉ dùng `as` khi **bạn chắc chắn 100%** về kiểu. Với dữ liệu từ ngoài
(API, user), dùng validation runtime (Zod) thay vì `as`.

:::

Sơ đồ sau minh họa rủi ro: assertion chỉ tác động lúc biên dịch, nếu giá trị thực sai thì vẫn crash lúc chạy.

```mermaid
flowchart LR
    A["Viết assertion (as / !)"] --> B["Compile-time: TS tin và bỏ qua kiểm tra"]
    B --> C{"Giá trị thực có đúng kiểu?"}
    C -->|"Đúng"| D["Chạy bình thường"]
    C -->|"Sai"| E["Runtime crash (TS không cứu được)"]
```

---

## as const

Biến giá trị thành **literal type bất biến (readonly)**.

```ts
const colors = ["red", "green"];
// type: string[]

const colors2 = ["red", "green"] as const;
// type: readonly ["red", "green"]
```

Áp dụng cho object — toàn bộ property thành `readonly`:

```ts
const config = {
  url: "/api",
  method: "GET",
} as const;
// type: { readonly url: "/api"; readonly method: "GET" }
```

:::tip[Mẹo]

`as const` cực mạnh khi kết hợp với `typeof` để tạo type từ giá trị
thực — không phải maintain hai chỗ:

```ts
const ROLES = ["admin", "user", "guest"] as const;
type Role = typeof ROLES[number]; // "admin" | "user" | "guest"
```

Một thay đổi (thêm "moderator" vào ROLES) tự động cập nhật type.

:::

---

## as any

Ép sang `any` — **tắt mọi check**. Dùng tạm khi không tìm được type
đúng, nhưng để lại nợ kỹ thuật.

```ts
const data = (response as any).user.name;
```

:::warning[Cần lưu ý]

`as any` là **tệ hơn cả** việc không dùng TS — vì nó tạo cảm giác an
toàn giả. Trong code review, mỗi lần thấy `as any` đều cần lý do rõ
ràng và TODO khắc phục.

Nếu chỉ muốn "qua lỗi tạm thời", dùng `as unknown as T` ít nguy hiểm
hơn — vì ít nhất bạn đã khai báo kiểu cuối mong muốn.

:::

---

## Non-null assertion (!)

Toán tử `!` nói "giá trị này chắc chắn không phải `null`/`undefined`".

```ts
function find(id: number): User | null {
  // ...
}

const user = find(1)!; // type: User (không còn null)
console.log(user.name);
```

Cũng dùng được trên truy cập property:

```ts
const el = document.getElementById("app")!;
el.innerHTML = "Hi";
```

:::warning[Cần lưu ý]

`!` chỉ tắt cảnh báo của TS — nếu giá trị thực sự là `null`, vẫn crash:

```ts
const el = document.getElementById("not-exist")!;
el.innerHTML = "Hi"; // TypeError: Cannot set properties of null
```

→ Ưu tiên dùng **kiểm tra thực**:

```ts
const el = document.getElementById("app");
if (!el) throw new Error("Missing #app");
el.innerHTML = "Hi";
```

`!` chỉ chấp nhận khi bạn có lý do logic chắc chắn (đã check ở chỗ
khác, framework đảm bảo...).

:::

---

## Từ khóa satisfies

`satisfies` (TS 4.9+) là cách **kiểm tra constraint** mà **không làm
mất type chính xác** (literal narrowing).

```ts
type Palette = Record<string, string | number>;

// Cách cũ — dùng `:` mất literal type
const colors1: Palette = {
  red: "#f00",
  blue: 42,
};
colors1.red.toUpperCase(); // Error: red có thể là number

// Cách mới — dùng `satisfies` giữ literal type
const colors2 = {
  red: "#f00",
  blue: 42,
} satisfies Palette;
colors2.red.toUpperCase(); // OK — TS biết red là string
```

:::info[Phân tích]

Khác biệt cốt lõi giữa 3 dạng:

| Cách viết | Kiểm tra constraint? | Giữ literal type? |
|-----------|---------------------|-------------------|
| `const x: T = ...` | Có | **Không** (widen) |
| `const x = ... as T` | **Không** (lừa TS) | Tùy |
| `const x = ... satisfies T` | Có | **Có** |

`satisfies` là cách viết "đúng nhất" trong 90% trường hợp khi bạn vừa
muốn ràng buộc shape, vừa muốn dùng được giá trị cụ thể bên trong.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Type assertion là gì? Vì sao nói nó chỉ tồn tại lúc biên dịch và biến mất hoàn toàn sau khi transpile?
2. `as Type` khác gì với type casting/conversion trong Java hay C#?
3. TypeScript có cho phép assert bừa từ `string` sang `number` không? Quy tắc nào giới hạn những cặp kiểu được phép assert trực tiếp?
4. Vì sao muốn ép giữa hai kiểu không liên quan lại phải đi qua `as unknown as T`? Cách viết này nguy hiểm ở chỗ nào?
5. `as const` làm gì với object và array? Tính `readonly` mà nó tạo ra là nông hay sâu (deep)?
6. Đoán kiểu: `const a = ["GET", "POST"];` và `const b = ["GET", "POST"] as const;` — mỗi biến được suy luận ra kiểu gì?
7. Pattern `typeof ARR[number]` để sinh union từ một mảng hoạt động thế nào? Vì sao bắt buộc phải có `as const` mới ra kết quả mong muốn?
8. Non-null assertion `!` khác gì optional chaining `?.` và toán tử nullish coalescing `??`?
9. Vì sao `!` bị coi là một trong những tính năng nguy hiểm nhất của TypeScript? Khi nào thì chấp nhận được?
10. Đoán lỗi: `const el = document.getElementById("app")!; el.innerHTML = "x";` — đoạn này đã an toàn chưa, chuyện gì xảy ra nếu phần tử không tồn tại?
11. `satisfies` (TS 4.9+) khác `as T` và khác annotation `: T` ở điểm nào? Hãy điền bảng hai cột: có kiểm tra constraint / có giữ literal type.
12. Cho `const config = { port: 3000 } satisfies Config;` — `config.port` có kiểu gì? Nếu đổi sang `const config: Config = { port: 3000 }` thì kiểu đó thay đổi ra sao?
13. Vì sao `as any` tạo ra cảm giác an toàn giả? Nêu phương án thay thế khi thật sự chưa biết kiểu của dữ liệu.
14. Assertion function (`function assert(x: unknown): asserts x is string`) khác type guard (`function isStr(x: unknown): x is string`) ở điểm nào?
15. Khi nào nên dùng validation runtime (Zod, type guard) thay vì assertion? Minh hoạ bằng luồng xử lý JSON trả về từ API.
16. Trong file `.tsx`, cú pháp assertion kiểu `<Type>value` có dùng được không? Vì sao, và phải viết thay thế thế nào?
