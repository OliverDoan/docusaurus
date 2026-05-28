---
sidebar_position: 1
title: "1. Type System Fundamentals"
---

# Type System Fundamentals

> *TypeScript hỏi không khó nhưng cực kỳ phân biệt được "dùng được" và "dùng đúng". Câu trả lời nông sẽ lộ ngay.*

---

## Câu 1: `interface` vs `type` — chọn cái nào? `[Intermediate]`

### Câu hỏi

> Em đang khai báo shape của một User. `interface` hay `type`? Em quyết định dựa trên gì?

### Giải thích lý thuyết

| Tính chất              | `interface`                                 | `type`                                |
| ---------------------- | ------------------------------------------- | ------------------------------------- |
| Object shape           | Có                                          | Có                                    |
| Union / intersection   | Không trực tiếp                             | Có                                    |
| Tuple, primitive alias | Không                                       | Có                                    |
| Mapped/conditional     | Không                                       | Có                                    |
| Declaration merging    | **Có**                                      | Không                                 |
| `extends`              | `interface A extends B`                     | `type A = B & {...}`                  |
| Implements (class)     | Có                                          | Có                                    |

### Code minh hoạ

```typescript
// Interface — extension + declaration merging
interface User { id: string; email: string; }
interface User { createdAt: Date; } // merge — User giờ có 3 field

interface AdminUser extends User { role: "admin"; }

// Type — union, mapped, conditional
type Role = "admin" | "member" | "guest";
type Nullable<T> = T | null;
type UserKeys = keyof User; // "id" | "email" | "createdAt"

type ApiResult<T> =
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

// Type không merge — duplicate là error
type X = { a: number };
// type X = { b: number }; // ❌ Duplicate identifier
```

### Đáp án mẫu

> "Em theo quy tắc: dùng `interface` cho object shape có khả năng được extend hoặc dùng làm contract giữa nhiều file (đặc biệt khi expose qua public API hoặc khi declaration merging có ích — ví dụ extend global type). Dùng `type` cho union, tuple, mapped type, conditional type — những thứ `interface` không làm được. Trong React em hay dùng `type` cho component props vì cần union (`'primary' | 'secondary'`) và đôi khi intersect với HTML attributes. Quy tắc thật: chọn cái phù hợp với feature cần, đừng cứng nhắc 'luôn dùng interface' hay 'luôn dùng type'."

---

## Câu 2: `any` vs `unknown` vs `never` `[Intermediate]`

### Câu hỏi

> Anh thấy nhiều bạn cứ gặp lỗi type là gắn `any` cho xong. Em hiểu sao về `any`, `unknown`, `never`? Khi nào dùng cái nào?

### Giải thích lý thuyết

| Type      | Ý nghĩa                                                | Type-check                                      |
| --------- | ------------------------------------------------------ | ----------------------------------------------- |
| `any`     | "Tắt type-check cho biến này"                          | Cho phép mọi operation — vứt safety             |
| `unknown` | "Có giá trị nhưng chưa biết type"                      | Bắt buộc narrow trước khi dùng                  |
| `never`   | Giá trị không thể tồn tại (throw, infinite loop, unreachable) | Dùng cho exhaustive check                 |

### Code minh hoạ

```typescript
// any — tránh trừ khi tích hợp legacy
function legacy(data: any) {
  data.foo.bar.baz; // OK với TS, nhưng có thể throw runtime
}

// unknown — buộc narrow
function safeParse(json: string): unknown {
  return JSON.parse(json);
}
const data = safeParse(input);
// data.foo; // ❌ Error: data is unknown
if (typeof data === "object" && data !== null && "foo" in data) {
  // narrowed
}

// never — exhaustive check
type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.r ** 2;
    case "square": return shape.s ** 2;
    default:
      const _exhaustive: never = shape; // ✅ Nếu thêm kind mới, đây sẽ TypeError
      throw new Error(_exhaustive);
  }
}

// Function trả về never
function fail(msg: string): never {
  throw new Error(msg);
}
```

### Đáp án mẫu

> "`any` là 'tắt type-check' — em coi như không có TypeScript. Em chỉ dùng khi tích hợp với lib cũ không có @types và đã quá muộn để fix. `unknown` là phiên bản 'an toàn' của `any` — có giá trị nhưng buộc phải narrow (kiểm tra type) trước khi dùng. Em dùng `unknown` cho output của `JSON.parse`, response API chưa biết shape, hoặc generic error trong catch (`catch (e: unknown)`). `never` thì em dùng cho 2 việc: exhaustive check trong switch (đảm bảo thêm case mới sẽ TS báo lỗi), và return type cho function luôn throw hoặc loop vô hạn. `never` là 'cảnh báo sớm tại compile time' rất mạnh."

---

## Câu 3: Type narrowing — em có những cách nào? `[Intermediate]`

### Câu hỏi

> Em có biến `value: string | number | null`. Liệt kê tất cả cách em có thể narrow type của nó.

### Giải thích lý thuyết

TypeScript có **control flow analysis** — sau mỗi check, type của biến được hẹp lại trong nhánh tương ứng:

1. `typeof` — primitive
2. `instanceof` — class
3. `in` operator — property existence
4. Equality (`===`, `!==`)
5. Truthy/falsy check
6. Discriminated union (kiểm tra `.kind`/`.type`)
7. User-defined type guard (`is`)
8. `Array.isArray`
9. Assertion functions (`asserts x is T`)

### Code minh hoạ

```typescript
type Value = string | number | null;

function process(v: Value) {
  // 1. typeof
  if (typeof v === "string") v.toUpperCase(); // v: string
  if (typeof v === "number") v.toFixed(2);    // v: number

  // 2. Equality + null check
  if (v !== null) v; // v: string | number
  if (v === null) return;
  v; // v: string | number sau early return
}

// 3. instanceof
class ApiError extends Error { status: number = 500; }
function handle(e: unknown) {
  if (e instanceof ApiError) e.status; // narrowed
}

// 4. `in` operator
type Cat = { meow: () => void };
type Dog = { bark: () => void };
function speak(animal: Cat | Dog) {
  if ("meow" in animal) animal.meow();
  else animal.bark();
}

// 5. Discriminated union (pattern phổ biến nhất)
type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function render<T>(s: AsyncState<T>) {
  switch (s.status) {
    case "loading": return <Spinner />;
    case "success": return <View data={s.data} />;     // narrowed
    case "error":   return <Err msg={s.error} />;      // narrowed
  }
}

// 6. User-defined type guard
function isString(v: unknown): v is string {
  return typeof v === "string";
}
function trim(v: unknown) {
  if (isString(v)) v.trim(); // narrowed
}

// 7. Assertion function
function assertDefined<T>(v: T | undefined, msg: string): asserts v is T {
  if (v === undefined) throw new Error(msg);
}
function use(id?: string) {
  assertDefined(id, "id required");
  id.toUpperCase(); // id: string sau assertion
}
```

### Đáp án mẫu

> "Có nhiều cách: `typeof` cho primitive, `instanceof` cho class, `in` để check property, equality để loại bỏ `null`/`undefined`, và truthy check. Pattern em hay dùng nhất là **discriminated union** — đặt một field `kind` hoặc `status` để switch — TypeScript narrow tự động và force exhaustive nếu kết hợp với `never`. Khi check phức tạp không thể inline, em viết **user-defined type guard** `function isUser(v: unknown): v is User` để tái sử dụng. Cho null check chắc chắn, em dùng **assertion function** `asserts v is T` để vừa throw runtime vừa narrow type cho cả block sau đó."

---

## Câu 4: `enum` vs string literal union vs `as const` `[Senior]`

### Câu hỏi

> Em đang định nghĩa các role: admin, member, guest. Em chọn `enum`, union `'admin' | 'member' | 'guest'`, hay object `as const`? Tại sao?

### Giải thích lý thuyết

| Cách                                    | Output runtime                         | Type | Tree-shake | Reverse mapping |
| --------------------------------------- | -------------------------------------- | ---- | ---------- | --------------- |
| `enum Role { admin, member, guest }`    | **IIFE object lớn** trong JS output    | Có   | Khó        | Có (number enum) |
| `const enum Role {...}`                 | Inline số trong code                   | Có   | Tốt        | Không            |
| `type Role = 'admin' \| 'member'`       | Không runtime                          | Có   | Tốt        | N/A              |
| `const ROLES = ['admin','member'] as const; type Role = typeof ROLES[number]` | Array nhỏ | Có | Tốt | Iterable |

### Code minh hoạ

```typescript
// ❌ Enum — Sinh code runtime
enum Role { Admin = "admin", Member = "member" }
// Compile output: var Role; (function(...){ ... })(Role || (Role = {}));

// ✅ String literal union — pure type, không sinh code
type Role = "admin" | "member" | "guest";
const r: Role = "admin";

// ✅ as const — vừa có type, vừa có array để iterate
const ROLES = ["admin", "member", "guest"] as const;
type Role2 = typeof ROLES[number]; // "admin" | "member" | "guest"

// Iterate dropdown
ROLES.map((r) => <option key={r} value={r}>{r}</option>);

// ✅ const object as const
const ROLE = {
  Admin: "admin",
  Member: "member",
  Guest: "guest",
} as const;
type Role3 = typeof ROLE[keyof typeof ROLE]; // "admin" | "member" | "guest"
ROLE.Admin; // type: "admin" (literal, không phải string)

// Enum bẫy:
enum Status { Active = 1 }
const s: Status = 999; // ❌ Lý ra phải báo lỗi, nhưng TS cho phép với number enum
```

### Đáp án mẫu

> "Em **không** dùng `enum` — đặc biệt là number enum. Lý do: nó sinh code runtime (IIFE object) không tree-shake được, mất trade-off vì TypeScript không phát hiện được khi bạn assign số ngoài enum cho number enum, và xu hướng cộng đồng (Microsoft, các style guide) đang khuyên tránh. Em chọn 1 trong 2: string literal union `type Role = 'admin' | 'member'` nếu chỉ cần type, hoặc `as const` array/object nếu cần iterate ở runtime (ví dụ render dropdown). Pattern em hay dùng nhất là `const ROLES = ['admin','member','guest'] as const; type Role = typeof ROLES[number]` — vừa có array để map vừa có union type derived tự động, single source of truth."

---

## Câu 5: Structural vs Nominal typing `[Senior]`

### Câu hỏi

> ```typescript
> type UserId = string;
> type OrderId = string;
> function findUser(id: UserId) {}
> const orderId: OrderId = "abc";
> findUser(orderId); // TS có báo lỗi không?
> ```

### Giải thích lý thuyết

TypeScript dùng **structural typing** ("duck typing") — 2 type tương đương nếu có cùng shape, không quan tâm tên. Khác với **nominal typing** (Java, C#) — phải khai báo `implements` mới tương thích.

Hệ quả: type alias `string` thì tương đương `string` — không bảo vệ khỏi mix `UserId` và `OrderId`.

Cách "giả" nominal trong TS: **branded type** với intersection của symbol/unique string.

### Code minh hoạ

```typescript
// Vấn đề: structural — không phân biệt UserId vs OrderId
type UserIdSimple = string;
type OrderIdSimple = string;

function findUser(id: UserIdSimple) {}
const orderId: OrderIdSimple = "abc";
findUser(orderId); // ✅ TS cho phép — đây là bug semantic

// Fix: branded type
type Brand<K, T> = K & { __brand: T };
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function createUserId(s: string): UserId { return s as UserId; }
function createOrderId(s: string): OrderId { return s as OrderId; }
function findUser2(id: UserId) {}

const u = createUserId("u1");
const o = createOrderId("o1");
findUser2(u);   // ✅
findUser2(o);   // ❌ Type error — argument of type 'OrderId' not assignable to 'UserId'

// Structural OK cho tương thích shape
interface User { name: string; }
function greet(u: User) {}
greet({ name: "A", extra: "OK" }); // ✅ extra field OK (excess property check chỉ với literal)
```

### Đáp án mẫu

> "Không, TS không báo lỗi — vì `UserId` và `OrderId` đều chỉ là alias của `string`. TypeScript dùng structural typing, hai type chỉ cần có cùng shape là tương đương. Hệ quả thực tế là `findUser(orderId)` compile pass nhưng sai semantic. Cách fix là **branded type**: `type UserId = string & { __brand: 'UserId' }` — intersection với object có field đặc biệt, không tồn tại ở runtime nhưng force TS phải distinguish. Em dùng pattern này cho ID quan trọng (user/order/post id) và cho 'validated' string như Email, NonEmptyString. Trade-off là phải có hàm `createUserId` để 'gán nhãn', không thể assign trực tiếp."

---

## Câu 6: TypeScript Compiler Options quan trọng `[Senior]`

### Câu hỏi

> Em mở `tsconfig.json` lên đọc. 5 option em **phải** bật để codebase strict thực sự là gì?

### Giải thích lý thuyết

Các flag quan trọng:

| Flag                              | Tác dụng                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `strict`                          | Bật tất cả strict check (`strictNullChecks`, ...)         |
| `noUncheckedIndexedAccess`        | `arr[i]` trả `T \| undefined` thay vì `T`                 |
| `noImplicitOverride`              | Bắt `override` khi override method parent class           |
| `exactOptionalPropertyTypes`      | `{ a?: string }` không cho gán `a: undefined`             |
| `noFallthroughCasesInSwitch`      | Bắt switch case thiếu `break`/`return`                    |
| `forceConsistentCasingInFileNames`| Tránh import lệch case (gây bug trên Linux CI)            |

### Code minh hoạ

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                          // bật strict (gồm strictNullChecks, noImplicitAny...)
    "noUncheckedIndexedAccess": true,        // arr[i] có thể undefined
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,

    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",           // hoặc "NodeNext" cho Node
    "isolatedModules": true,                 // mỗi file phải compile độc lập (Vite/SWC)
    "skipLibCheck": true                     // bỏ check .d.ts của lib — tăng tốc
  }
}
```

```typescript
// Khi noUncheckedIndexedAccess: true
const arr = ["a", "b"];
const first = arr[0];        // string | undefined (đúng!)
first.toUpperCase();         // ❌ TS bắt — buộc check
if (first) first.toUpperCase();

// Khi exactOptionalPropertyTypes: true
type Props = { name?: string };
const p1: Props = {};                  // ✅
const p2: Props = { name: "A" };       // ✅
const p3: Props = { name: undefined }; // ❌ — không cho gán explicit undefined
```

### Đáp án mẫu

> "Bắt buộc bật `strict: true` — đây bao gồm `strictNullChecks`, `noImplicitAny` và các check khác. Ngoài ra em luôn bật 4 cái nữa: `noUncheckedIndexedAccess` — buộc check `undefined` khi truy cập array/object bằng index, fix một class bug rất phổ biến. `noImplicitOverride` để bắt khi override method mà quên `override` keyword. `exactOptionalPropertyTypes` — phân biệt 'không có key' và 'key = undefined', quan trọng cho API contract. `noFallthroughCasesInSwitch` để bắt switch thiếu break. Một flag không liên quan strict nhưng cực kỳ quan trọng: `forceConsistentCasingInFileNames` — tránh bug 'chạy local OK, CI Linux fail' do case-sensitive."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                    | Đúng là                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| "TypeScript bảo vệ khỏi runtime error"                     | Chỉ compile-time. Runtime data từ API vẫn cần validate (Zod)     |
| "`unknown` và `any` giống nhau"                            | `unknown` buộc narrow trước khi dùng; `any` thì không            |
| "`interface` luôn tốt hơn `type`"                          | Mỗi cái có use case. Type mạnh hơn cho union/mapped              |
| "`enum` an toàn vì có type"                                | Number enum cho phép assign số ngoài enum mà không báo lỗi       |
| "`strict: true` bật mọi check"                             | Còn nhiều flag ngoài strict family (noUncheckedIndexedAccess...)  |
