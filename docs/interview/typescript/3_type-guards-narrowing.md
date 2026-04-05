---
sidebar_position: 3
title: "Type Guards, Narrowing & Conditional Types"
---

# Type Guards, Narrowing & Conditional Types

Type guards va conditional types la cau noi giua logic runtime va type system. Hieu ro chung giup ban viet code vua an toan vua linh hoat -- va day la nhom cau hoi ma interviewer rat thich hoi o muc Senior.

---

## Cau 1: typeof va instanceof type guards hoat dong nhu the nao? `[Intermediate]`

### Giai thich ly thuyet

**Type guards** la bieu thuc runtime giup TypeScript **thu hep (narrow)** type cua bien trong mot scope cu the.

- **`typeof`** kiem tra primitive types: `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"object"`, `"function"`, `"symbol"`, `"bigint"`.
- **`instanceof`** kiem tra mot object co phai instance cua mot class cu the khong (dua tren prototype chain).

### Code vi du

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

  // Narrowed: boolean (TypeScript tu suy luan)
  return value ? "Yes" : "No";
}

// Luu y: typeof null === "object" (quirk cua JavaScript!)
function processData(data: object | null) {
  if (typeof data === "object") {
    // Van co the la null! typeof null === "object"
    // Can check them:
    if (data !== null) {
      // Bay gio moi chac la object
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

// instanceof hoat dong voi class hierarchy
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
    // Narrowed: HttpError (nhung khong phai NotFoundError)
    console.log(err.statusCode);
  } else {
    // Narrowed: Error
    console.log(err.message);
  }
}
```

### Dap an mau

> "typeof guard kiem tra primitive types tai runtime va TypeScript dung ket qua do de narrow type trong scope tuong ung. instanceof guard dua tren prototype chain de xac dinh class instance, va TypeScript tuong tu narrow type. Diem can nho la typeof null tra ve 'object' -- day la bug kinh dien cua JavaScript nen can check null rieng. Va instanceof chi hoat dong voi class, khong hoat dong voi interface vi interface khong ton tai tai runtime."

---

## Cau 2: Custom type guards voi tu khoa `is` `[Senior]`

### Giai thich ly thuyet

Khi typeof va instanceof khong du (vi du khi lam viec voi interfaces hoac plain objects), ban co the tao **custom type guard** -- mot function tra ve `value is Type`. Day la cach "day" TypeScript tin rang gia tri co type cu the sau khi function return true.

### Code vi du

```typescript
// === CUSTOM TYPE GUARD CO BAN ===
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

// === TYPE GUARD VOI ARRAY FILTERING ===
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

// Filter array voi type guard -- ket qua duoc narrow!
const mixedData: unknown[] = [
  { id: 1, name: "Phone", price: 999 },
  "not a product",
  { id: 2, name: "Laptop", price: 1999 },
  null,
  42,
];

const products: Product[] = mixedData.filter(isProduct);
// TypeScript biet products la Product[] vi isProduct la type guard
```

### Dap an mau

> "Custom type guard la function tra ve type predicate dang 'param is Type'. Khi function return true, TypeScript narrow type cua argument trong calling scope. Dieu nay cuc ky huu ich khi lam viec voi interfaces (khong dung duoc instanceof) hoac khi can complex validation logic. Mot use case rat hay la dung type guard voi Array.filter -- TypeScript se tu dong narrow type cua array sau khi filter."

---

## Cau 3: Discriminated unions la gi va dung nhu the nao? `[Intermediate]`

### Giai thich ly thuyet

**Discriminated unions** (hay tagged unions) la pattern dung mot **property chung** (discriminant) de phan biet giua cac variant cua union type. Property nay thuong la string literal type. TypeScript co the tu dong narrow type dua tren gia tri cua discriminant.

### Code vi du

```typescript
// === DISCRIMINATED UNION CO BAN ===

// Moi variant co chung property "type" (discriminant)
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

// === THUC TE: STATE MANAGEMENT ===
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
      return "Dang tai...";

    case "success":
      // Narrowed: SuccessState<User>
      return `Xin chao, ${state.data.name}!`;

    case "error":
      // Narrowed: ErrorState
      return `Loi: ${state.error}`;
  }
}

// === THUC TE: REDUX-STYLE ACTIONS ===
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

### Dap an mau

> "Discriminated unions dung mot common property -- thuong la string literal -- lam discriminant de phan biet cac variant. TypeScript tu dong narrow type khi ban check discriminant trong switch/if. Pattern nay cuc ky pho bien trong state management (loading/success/error), Redux actions, va bat ky domain nao co nhieu trang thai. Uu diem lon nhat la type safety -- TypeScript dam bao ban xu ly dung data cho moi variant."

---

## Cau 4: Conditional types hoat dong nhu the nao? `[Senior]`

### Giai thich ly thuyet

**Conditional types** co cu phap `T extends U ? X : Y` -- tuong tu ternary operator nhung o type level. Neu T la subtype cua U thi ket qua la X, nguoc lai la Y.

Khi dung voi union types, conditional types duoc **distribute** -- ap dung cho tung member cua union rieng le.

### Code vi du

```typescript
// === CONDITIONAL TYPE CO BAN ===
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>;  // "yes"
type B = IsString<number>;  // "no"
type C = IsString<"hello">; // "yes" (literal extends string)

// === DISTRIBUTIVE CONDITIONAL TYPES ===
type ToArray<T> = T extends any ? T[] : never;

type D = ToArray<string | number>;
// Distribute: ToArray<string> | ToArray<number>
// Ket qua: string[] | number[]
// CHU Y: khong phai (string | number)[]

// Ngan distribute bang wrapping trong tuple:
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type E = ToArrayNonDist<string | number>;
// Ket qua: (string | number)[] -- khong distribute!

// === THUC TE: EXTRACT VA EXCLUDE ===
// Day la cach TypeScript implement Exclude va Extract

// Exclude: loai cac type trong T ma extends U
type MyExclude<T, U> = T extends U ? never : T;

type F = MyExclude<"a" | "b" | "c", "a">;
// Distribute:
// "a" extends "a" ? never : "a"  --> never
// "b" extends "a" ? never : "b"  --> "b"
// "c" extends "a" ? never : "c"  --> "c"
// Ket qua: "b" | "c"

// Extract: chi giu cac type trong T ma extends U
type MyExtract<T, U> = T extends U ? T : never;

type G = MyExtract<string | number | boolean, number | boolean>;
// Ket qua: number | boolean

// === CONDITIONAL TYPES THUC TE ===

// Flatten array type
type Flatten<T> = T extends Array<infer Item> ? Item : T;

type H = Flatten<string[]>;    // string
type I = Flatten<number[][]>;  // number[] (chi flatten 1 cap)
type J = Flatten<string>;      // string (khong phai array, giu nguyen)

// Unwrap Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type K = UnwrapPromise<Promise<string>>;  // string
type L = UnwrapPromise<Promise<number>>; // number
type M = UnwrapPromise<string>;           // string (khong phai Promise)

// Function return type
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type N = MyReturnType<() => string>;              // string
type O = MyReturnType<(x: number) => boolean>;    // boolean
```

### Dap an mau

> "Conditional types dung cu phap T extends U ? X : Y de ra nhanh o type level. Diem quan trong la distributive behavior -- khi T la union, conditional type duoc ap dung cho tung member rieng le. Vi du Exclude va Extract cua TypeScript deu duoc xay dung tren conditional types. Ket hop voi infer keyword, conditional types cho phep trich xuat type tu ben trong cac type phuc tap nhu Promise, Array, hay Function."

---

## Cau 5: Tu khoa `infer` trong conditional types `[Senior]`

### Giai thich ly thuyet

**`infer`** cho phep ban "khai bao" mot type variable ben trong ve dieu kien cua conditional type. TypeScript se tu dong suy luan type do dua tren context. Chi dung duoc trong phan `extends` cua conditional type.

Nghi don gian: `infer` la cach ban noi voi TypeScript "hay tu suy ra type nay cho toi".

### Code vi du

```typescript
// === INFER CO BAN: LAY ELEMENT TYPE CUA ARRAY ===
type ElementOf<T> = T extends Array<infer E> ? E : never;

type P = ElementOf<string[]>;     // string
type Q = ElementOf<[1, "two", 3]>; // 1 | "two" | 3

// === INFER: LAY RETURN TYPE ===
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = GetReturnType<() => string>;          // string
type R2 = GetReturnType<() => Promise<number>>; // Promise<number>

// === INFER: LAY PARAMETERS ===
type GetFirstParam<T> = T extends (first: infer F, ...rest: any[]) => any
  ? F
  : never;

type F1 = GetFirstParam<(name: string, age: number) => void>; // string
type F2 = GetFirstParam<() => void>;                           // never

// === INFER: LAY PROMISE INNER TYPE (RECURSIVE) ===
type DeepUnwrapPromise<T> = T extends Promise<infer U>
  ? DeepUnwrapPromise<U>  // Recursive: unwrap tiep neu van la Promise
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

// === INFER VOI TUPLE ===
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

### Dap an mau

> "infer cho phep khai bao type variable trong phan extends cua conditional type de TypeScript tu suy luan. Vi du, voi `T extends Array<infer E>`, TypeScript se suy ra E la element type cua array. infer cuc ky manh khi ket hop voi recursive types -- vi du DeepUnwrapPromise unwrap nhieu lop Promise, hoac ExtractRouteParams trich xuat param names tu URL pattern. Day la co so cua nhieu utility types nhu ReturnType, Parameters, ConstructorParameters."

---

## Cau 6: Exhaustive checking voi never `[Intermediate]`

### Giai thich ly thuyet

**Exhaustive checking** la ky thuat dam bao ban da xu ly **tat ca** truong hop cua mot union type. Dung `never` type o default case -- neu co truong hop nao bi bo sot, TypeScript se bao loi tai compile time.

Day la mot trong nhung pattern quan trong nhat de tranh bug khi union type duoc mo rong trong tuong lai.

### Code vi du

```typescript
// === EXHAUSTIVE CHECK CO BAN ===
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
      // Neu tat ca case da duoc xu ly, method la never
      const _exhaustive: never = method;
      return _exhaustive;
  }
}

// Bay gio, neu ai them "crypto" vao PaymentMethod:
// type PaymentMethod = "credit_card" | "bank_transfer" | "e_wallet" | "crypto";
// --> TypeScript se bao loi o dong `const _exhaustive: never = method`
// vi "crypto" khong the gan cho never!

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
      // Vua check compile time VUA throw runtime error
      assertNever(type, `Unknown notification type`);
  }
}

// === EXHAUSTIVE CHECK VOI IF/ELSE ===
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

  // Neu logic dung, dong nay khong bao gio chay
  // TypeScript biet result la never o day
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

### Dap an mau

> "Exhaustive checking dung never type de dam bao moi truong hop cua union type deu duoc xu ly. O default case, gan gia tri cho bien kieu never -- neu con truong hop nao chua xu ly, TypeScript se bao loi vi type do khong the gan cho never. Toi luon dung pattern nay trong production code vi no bao ve team khi ai do them variant moi vao union -- compiler se chi ra chinh xac nhung cho can cap nhat."

---

## Loi thuong gap khi tra loi

1. **Nham lan typeof tai runtime va tai type level**: `typeof` trong `if (typeof x === "string")` la JavaScript runtime. `typeof` trong `type X = typeof value` la TypeScript compile-time. Hai cai nay khac han nhau.

2. **Quen rang instanceof khong hoat dong voi interface**: Interface khong ton tai tai runtime, nen khong the dung instanceof. Phai dung custom type guard hoac discriminant property.

3. **Khong giai thich duoc distributive conditional types**: Khi interviewer hoi "tai sao `ToArray<string | number>` la `string[] | number[]` ma khong phai `(string | number)[]`?", ban phai giai thich duoc distributive behavior.

4. **Dung as (type assertion) thay vi type guard**: Type assertion (`value as Type`) khong kiem tra runtime -- no chi noi voi TypeScript "tin toi di". Type guard thi kiem tra that su. Interviewer se hoi tai sao type guard an toan hon.

5. **Khong biet cach ngan distributive behavior**: Wrap type trong tuple `[T] extends [U]` de ngan distribute. Rat nhieu ung vien khong biet trick nay.

6. **Quen exhaustive check trong production code**: Neu ban khong dung never check trong switch case, khi union type duoc mo rong, compiler se khong bao loi -- va bug se lot vao production.
