---
sidebar_position: 3
title: "3. Type Guards, Narrowing title: "Type Guards, Narrowing & Conditional Types" Conditional Types"
---

# Type Guards, Narrowing & Conditional Types

Type guards và conditional types là cầu nối giữa logic runtime và type system. Hiểu rõ chúng giúp bạn viết code vừa an toàn vừa linh hoạt -- và đây là nhóm câu hỏi mà interviewer rất thích hỏi ở mức Senior.

---

## Câu 1: typeof và instanceof type guards hoạt động như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Type guards** là biểu thức runtime giúp TypeScript **thu hẹp (narrow)** type của biến trong một scope cụ thể.

- **`typeof`** kiểm tra primitive types: `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"object"`, `"function"`, `"symbol"`, `"bigint"`.
- **`instanceof`** kiểm tra một object có phải instance của một class cụ thể không (dựa trên prototype chain).

### Code ví dụ

```typescript
// === TYPEOF TYPE GUARD ===
function formatValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    // Narrowed: string
    return value.toUpperCase();
  }

  if (typeof value === "number") {
    // Narrowed: number
    return value.toFixed(2);
  }

  // Narrowed: boolean (TypeScript tự suy luận)
  return value ? "Yes" : "No";
}

// Lưu ý: typeof null === "object" (quirk của JavaScript!)
function processData(data: object | null) {
  if (typeof data === "object") {
    // Vẫn có thể là null! typeof null === "object"
    // Cần check thêm:
    if (data !== null) {
      // Bây giờ mới chắc là object
    }
  }
}

// === INSTANCEOF TYPE GUARD ===
class ApiError {
  constructor(
    public statusCode: number,
    public message: string
  ) {}
}

class ValidationError {
  constructor(
    public fields: Record<string, string>
  ) {}
}

function handleError(error: ApiError | ValidationError) {
  if (error instanceof ApiError) {
    // Narrowed: ApiError
    console.log(`API Error ${error.statusCode}: ${error.message}`);
  } else {
    // Narrowed: ValidationError
    console.log("Validation errors:", error.fields);
  }
}

// instanceof hoạt động với class hierarchy
class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

class NotFoundError extends HttpError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

function handle(err: Error) {
  if (err instanceof NotFoundError) {
    // Narrowed: NotFoundError
    console.log(err.statusCode); // 404
  } else if (err instanceof HttpError) {
    // Narrowed: HttpError (nhưng không phải NotFoundError)
    console.log(err.statusCode);
  } else {
    // Narrowed: Error
    console.log(err.message);
  }
}
```

### Đáp án mẫu

> "typeof guard kiểm tra primitive types tại runtime và TypeScript dùng kết quả đó để narrow type trong scope tương ứng. instanceof guard dựa trên prototype chain để xác định class instance, và TypeScript tương tự narrow type. Điểm cần nhớ là typeof null trả về 'object' -- đây là bug kinh điển của JavaScript nên cần check null riêng. Và instanceof chỉ hoạt động với class, không hoạt động với interface vì interface không tồn tại tại runtime."

---

## Câu 2: Custom type guards với từ khóa `is` `[Senior]`

### Giải thích lý thuyết

Khi typeof và instanceof không đủ (ví dụ khi làm việc với interfaces hoặc plain objects), bạn có thể tạo **custom type guard** -- một function trả về `value is Type`. Đây là cách "dạy" TypeScript tin rằng giá trị có type cụ thể sau khi function return true.

### Code ví dụ

```typescript
// === CUSTOM TYPE GUARD CƠ BẢN ===
interface Cat {
  meow: () => void;
  purr: () => void;
}

interface Dog {
  bark: () => void;
  fetch: () => void;
}

// Custom type guard function
function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}

function isDog(animal: Cat | Dog): animal is Dog {
  return "bark" in animal;
}

function handleAnimal(animal: Cat | Dog) {
  if (isCat(animal)) {
    // Narrowed: Cat
    animal.meow();
    animal.purr();
  } else {
    // Narrowed: Dog
    animal.bark();
    animal.fetch();
  }
}

// === TYPE GUARD CHO API RESPONSE ===
interface SuccessResponse<T> {
  status: "success";
  data: T;
}

interface ErrorResponse {
  status: "error";
  message: string;
  code: number;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function isSuccess<T>(res: ApiResponse<T>): res is SuccessResponse<T> {
  return res.status === "success";
}

function isError<T>(res: ApiResponse<T>): res is ErrorResponse {
  return res.status === "error";
}

async function fetchUser(id: number): Promise<void> {
  const response: ApiResponse<User> = await api.get(`/users/${id}`);

  if (isSuccess(response)) {
    // Narrowed: SuccessResponse<User>
    console.log(response.data.name); // type-safe
  } else {
    // Narrowed: ErrorResponse
    console.log(`Error ${response.code}: ${response.message}`);
  }
}

// === TYPE GUARD VỚI ARRAY FILTERING ===
interface Product {
  id: number;
  name: string;
  price: number;
}

function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "price" in value &&
    typeof (value as Product).id === "number" &&
    typeof (value as Product).name === "string" &&
    typeof (value as Product).price === "number"
  );
}

// Filter array với type guard -- kết quả được narrow!
const mixedData: unknown[] = [
  { id: 1, name: "Phone", price: 999 },
  "not a product",
  { id: 2, name: "Laptop", price: 1999 },
  null,
  42,
];

const products: Product[] = mixedData.filter(isProduct);
// TypeScript biết products là Product[] vì isProduct là type guard
```

### Đáp án mẫu

> "Custom type guard là function trả về type predicate dạng 'param is Type'. Khi function return true, TypeScript narrow type của argument trong calling scope. Điều này cực kỳ hữu ích khi làm việc với interfaces (không dùng được instanceof) hoặc khi cần complex validation logic. Một use case rất hay là dùng type guard với Array.filter -- TypeScript sẽ tự động narrow type của array sau khi filter."

---

## Câu 3: Discriminated unions là gì và dùng như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Discriminated unions** (hay tagged unions) là pattern dùng một **property chung** (discriminant) để phân biệt giữa các variant của union type. Property này thường là string literal type. TypeScript có thể tự động narrow type dựa trên giá trị của discriminant.

### Code ví dụ

```typescript
// === DISCRIMINATED UNION CƠ BẢN ===

// Mỗi variant có chung property "type" (discriminant)
type Circle = {
  type: "circle";
  radius: number;
};

type Rectangle = {
  type: "rectangle";
  width: number;
  height: number;
};

type Triangle = {
  type: "triangle";
  base: number;
  height: number;
};

type Shape = Circle | Rectangle | Triangle;

function calculateArea(shape: Shape): number {
  switch (shape.type) {
    case "circle":
      // Narrowed: Circle
      return Math.PI * shape.radius ** 2;

    case "rectangle":
      // Narrowed: Rectangle
      return shape.width * shape.height;

    case "triangle":
      // Narrowed: Triangle
      return (shape.base * shape.height) / 2;
  }
}

// === THỰC TẾ: STATE MANAGEMENT ===
type LoadingState = {
  status: "loading";
};

type SuccessState<T> = {
  status: "success";
  data: T;
};

type ErrorState = {
  status: "error";
  error: string;
};

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

function renderUserProfile(state: AsyncState<User>) {
  switch (state.status) {
    case "loading":
      return "Đang tải...";

    case "success":
      // Narrowed: SuccessState<User>
      return `Xin chào, ${state.data.name}!`;

    case "error":
      // Narrowed: ErrorState
      return `Lỗi: ${state.error}`;
  }
}

// === THỰC TẾ: REDUX-STYLE ACTIONS ===
type IncrementAction = {
  type: "INCREMENT";
  payload: number;
};

type DecrementAction = {
  type: "DECREMENT";
  payload: number;
};

type ResetAction = {
  type: "RESET";
};

type CounterAction = IncrementAction | DecrementAction | ResetAction;

function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case "INCREMENT":
      return state + action.payload;
    case "DECREMENT":
      return state - action.payload;
    case "RESET":
      return 0;
  }
}
```

### Đáp án mẫu

> "Discriminated unions dùng một common property -- thường là string literal -- làm discriminant để phân biệt các variant. TypeScript tự động narrow type khi bạn check discriminant trong switch/if. Pattern này cực kỳ phổ biến trong state management (loading/success/error), Redux actions, và bất kỳ domain nào có nhiều trạng thái. Ưu điểm lớn nhất là type safety -- TypeScript đảm bảo bạn xử lý đúng data cho mỗi variant."

---

## Câu 4: Conditional types hoạt động như thế nào? `[Senior]`

### Giải thích lý thuyết

**Conditional types** có cú pháp `T extends U ? X : Y` -- tương tự ternary operator nhưng ở type level. Nếu T là subtype của U thì kết quả là X, ngược lại là Y.

Khi dùng với union types, conditional types được **distribute** -- áp dụng cho từng member của union riêng lẻ.

### Code ví dụ

```typescript
// === CONDITIONAL TYPE CƠ BẢN ===
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"
type C = IsString<"hello">; // "yes" (literal extends string)

// === DISTRIBUTIVE CONDITIONAL TYPES ===
type ToArray<T> = T extends any ? T[] : never;

type D = ToArray<string | number>;
// Distribute: ToArray<string> | ToArray<number>
// Kết quả: string[] | number[]
// CHÚ Ý: không phải (string | number)[]

// Ngăn distribute bằng wrapping trong tuple:
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type E = ToArrayNonDist<string | number>;
// Kết quả: (string | number)[] -- không distribute!

// === THỰC TẾ: EXTRACT VÀ EXCLUDE ===
// Đây là cách TypeScript implement Exclude và Extract

// Exclude: loại các type trong T mà extends U
type MyExclude<T, U> = T extends U ? never : T;

type F = MyExclude<"a" | "b" | "c", "a">;
// Distribute:
// "a" extends "a" ? never : "a"  --> never
// "b" extends "a" ? never : "b"  --> "b"
// "c" extends "a" ? never : "c"  --> "c"
// Kết quả: "b" | "c"

// Extract: chỉ giữ các type trong T mà extends U
type MyExtract<T, U> = T extends U ? T : never;

type G = MyExtract<string | number | boolean, number | boolean>;
// Kết quả: number | boolean

// === CONDITIONAL TYPES THỰC TẾ ===

// Flatten array type
type Flatten<T> = T extends Array<infer Item> ? Item : T;

type H = Flatten<string[]>;    // string
type I = Flatten<number[][]>;  // number[] (chỉ flatten 1 cấp)
type J = Flatten<string>;      // string (không phải array, giữ nguyên)

// Unwrap Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type K = UnwrapPromise<Promise<string>>;  // string
type L = UnwrapPromise<Promise<number>>; // number
type M = UnwrapPromise<string>;           // string (không phải Promise)

// Function return type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type N = MyReturnType<() => string>;              // string
type O = MyReturnType<(x: number) => boolean>;    // boolean
```

### Đáp án mẫu

> "Conditional types dùng cú pháp T extends U ? X : Y để rẽ nhánh ở type level. Điểm quan trọng là distributive behavior -- khi T là union, conditional type được áp dụng cho từng member riêng lẻ. Ví dụ Exclude và Extract của TypeScript đều được xây dựng trên conditional types. Kết hợp với infer keyword, conditional types cho phép trích xuất type từ bên trong các type phức tạp như Promise, Array, hay Function."

---

## Câu 5: Từ khóa `infer` trong conditional types `[Senior]`

### Giải thích lý thuyết

**`infer`** cho phép bạn "khai báo" một type variable bên trong vế điều kiện của conditional type. TypeScript sẽ tự động suy luận type đó dựa trên context. Chỉ dùng được trong phần `extends` của conditional type.

Nghĩ đơn giản: `infer` là cách bạn nói với TypeScript "hãy tự suy ra type này cho tôi".

### Code ví dụ

```typescript
// === INFER CƠ BẢN: LẤY ELEMENT TYPE CỦA ARRAY ===
type ElementOf<T> = T extends Array<infer E> ? E : never;

type P = ElementOf<string[]>;     // string
type Q = ElementOf<[1, "two", 3]>; // 1 | "two" | 3

// === INFER: LẤY RETURN TYPE ===
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = GetReturnType<() => string>;          // string
type R2 = GetReturnType<() => Promise<number>>; // Promise<number>

// === INFER: LẤY PARAMETERS ===
type GetFirstParam<T> = T extends (first: infer F, ...rest: any[]) => any
  ? F
  : never;

type F1 = GetFirstParam<(name: string, age: number) => void>; // string
type F2 = GetFirstParam<() => void>;                           // never

// === INFER: LẤY PROMISE INNER TYPE (RECURSIVE) ===
type DeepUnwrapPromise<T> = T extends Promise<infer U>
  ? DeepUnwrapPromise<U>  // Recursive: unwrap tiếp nếu vẫn là Promise
  : T;

type S1 = DeepUnwrapPromise<Promise<string>>;                // string
type S2 = DeepUnwrapPromise<Promise<Promise<number>>>;       // number
type S3 = DeepUnwrapPromise<Promise<Promise<Promise<boolean>>>>; // boolean

// === INFER TRONG TEMPLATE LITERAL ===
type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractRouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

// === INFER VỚI TUPLE ===
type Head<T extends any[]> = T extends [infer First, ...any[]]
  ? First
  : never;

type Tail<T extends any[]> = T extends [any, ...infer Rest]
  ? Rest
  : never;

type Last<T extends any[]> = T extends [...any[], infer L]
  ? L
  : never;

type T1 = Head<[1, 2, 3]>;  // 1
type T2 = Tail<[1, 2, 3]>;  // [2, 3]
type T3 = Last<[1, 2, 3]>;  // 3
```

### Đáp án mẫu

> "infer cho phép khai báo type variable trong phần extends của conditional type để TypeScript tự suy luận. Ví dụ, với `T extends Array<infer E>`, TypeScript sẽ suy ra E là element type của array. infer cực kỳ mạnh khi kết hợp với recursive types -- ví dụ DeepUnwrapPromise unwrap nhiều lớp Promise, hoặc ExtractRouteParams trích xuất param names từ URL pattern. Đây là cơ sở của nhiều utility types như ReturnType, Parameters, ConstructorParameters."

---

## Câu 6: Exhaustive checking với never `[Intermediate]`

### Giải thích lý thuyết

**Exhaustive checking** là kỹ thuật đảm bảo bạn đã xử lý **tất cả** trường hợp của một union type. Dùng `never` type ở default case -- nếu có trường hợp nào bị bỏ sót, TypeScript sẽ báo lỗi tại compile time.

Đây là một trong những pattern quan trọng nhất để tránh bug khi union type được mở rộng trong tương lai.

### Code ví dụ

```typescript
// === EXHAUSTIVE CHECK CƠ BẢN ===
type PaymentMethod = "credit_card" | "bank_transfer" | "e_wallet";

function processPayment(method: PaymentMethod): string {
  switch (method) {
    case "credit_card":
      return "Processing credit card...";
    case "bank_transfer":
      return "Processing bank transfer...";
    case "e_wallet":
      return "Processing e-wallet...";
    default:
      // Nếu tất cả case đã được xử lý, method là never
      const _exhaustive: never = method;
      return _exhaustive;
  }
}

// Bây giờ, nếu ai thêm "crypto" vào PaymentMethod:
// type PaymentMethod = "credit_card" | "bank_transfer" | "e_wallet" | "crypto";
// --> TypeScript sẽ báo lỗi ở dòng `const _exhaustive: never = method`
// vì "crypto" không thể gán cho never!

// === HELPER FUNCTION CHO EXHAUSTIVE CHECK ===
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

type NotificationType = "email" | "sms" | "push";

function sendNotification(type: NotificationType, message: string) {
  switch (type) {
    case "email":
      return sendEmail(message);
    case "sms":
      return sendSMS(message);
    case "push":
      return sendPush(message);
    default:
      // Vừa check compile time VỪA throw runtime error
      assertNever(type, `Unknown notification type`);
  }
}

// === EXHAUSTIVE CHECK VỚI IF/ELSE ===
type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function handleResult<T>(result: Result<T, string>): T {
  if (result.ok === true) {
    return result.value;
  }

  if (result.ok === false) {
    throw new Error(result.error);
  }

  // Nếu logic đúng, dòng này không bao giờ chạy
  // TypeScript biết result là never ở đây
  const _check: never = result;
  return _check;
}

// === EXHAUSTIVE CHECK TRONG REACT COMPONENT ===
type ButtonVariant = "primary" | "secondary" | "danger";

function getButtonStyles(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return { backgroundColor: "blue", color: "white" };
    case "secondary":
      return { backgroundColor: "gray", color: "black" };
    case "danger":
      return { backgroundColor: "red", color: "white" };
    default:
      return assertNever(variant);
  }
}
```

### Đáp án mẫu

> "Exhaustive checking dùng never type để đảm bảo mọi trường hợp của union type đều được xử lý. Ở default case, gán giá trị cho biến kiểu never -- nếu còn trường hợp nào chưa xử lý, TypeScript sẽ báo lỗi vì type đó không thể gán cho never. Tôi luôn dùng pattern này trong production code vì nó bảo vệ team khi ai đó thêm variant mới vào union -- compiler sẽ chỉ ra chính xác những chỗ cần cập nhật."

---

## Lỗi thường gặp khi trả lời

1. **Nhầm lẫn typeof tại runtime và tại type level**: `typeof` trong `if (typeof x === "string")` là JavaScript runtime. `typeof` trong `type X = typeof value` là TypeScript compile-time. Hai cái này khác hẳn nhau.

2. **Quên rằng instanceof không hoạt động với interface**: Interface không tồn tại tại runtime, nên không thể dùng instanceof. Phải dùng custom type guard hoặc discriminant property.

3. **Không giải thích được distributive conditional types**: Khi interviewer hỏi "tại sao `ToArray<string | number>` là `string[] | number[]` mà không phải `(string | number)[]`?", bạn phải giải thích được distributive behavior.

4. **Dùng as (type assertion) thay vì type guard**: Type assertion (`value as Type`) không kiểm tra runtime -- nó chỉ nói với TypeScript "tin tôi đi". Type guard thì kiểm tra thật sự. Interviewer sẽ hỏi tại sao type guard an toàn hơn.

5. **Không biết cách ngăn distributive behavior**: Wrap type trong tuple `[T] extends [U]` để ngăn distribute. Rất nhiều ứng viên không biết trick này.

6. **Quên exhaustive check trong production code**: Nếu bạn không dùng never check trong switch case, khi union type được mở rộng, compiler sẽ không báo lỗi -- và bug sẽ lọt vào production.
