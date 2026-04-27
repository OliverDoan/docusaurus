---
sidebar_position: 2
title: "2. Generics & Utility Types"
---

# Generics & Utility Types

Generics là một trong những tính năng mạnh nhất của TypeScript -- cho phép bạn viết code vừa type-safe vừa tái sử dụng được. Kết hợp với utility types có sẵn, bạn có thể biểu diễn hầu hết mọi pattern mà không cần lặp lại code. Đây là nhóm câu hỏi thường gặp ở mức Intermediate đến Senior.

---


---

## Mục lục

- [Câu 1: Generics là gì? Generic function và generic constraints hoạt động như thế nào? `[Intermediate]`](#câu-1-generics-là-gì-generic-function-và-generic-constraints-hoạt-động-như-thế-nào-intermediate)
- [Câu 2: Giải thích các utility types: Partial, Required, Pick, Omit, Record, Readonly `[Intermediate]`](#câu-2-giải-thích-các-utility-types-partial-required-pick-omit-record-readonly-intermediate)
- [Câu 3: Tự implement Partial, Pick, và Omit `[Senior]`](#câu-3-tự-implement-partial-pick-và-omit-senior)
- [Câu 4: Generic với default type parameters `[Intermediate]`](#câu-4-generic-với-default-type-parameters-intermediate)
- [Câu 5: keyof và typeof operators trong TypeScript `[Intermediate]`](#câu-5-keyof-và-typeof-operators-trong-typescript-intermediate)
- [Câu 6: Viết một generic function `merge` type-safe `[Senior]`](#câu-6-viết-một-generic-function-merge-type-safe-senior)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: Generics là gì? Generic function và generic constraints hoạt động như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Generics** cho phép bạn tạo ra các function, class, interface mà **không cố định type cụ thể** tại thời điểm viết code. Type sẽ được "truyền vào" khi sử dụng, giống như truyền tham số cho function.

**Generic constraints** (`extends`) cho phép bạn giới hạn type parameter phải thỏa mãn một điều kiện nhất định -- ví dụ phải có property `length`, hoặc phải là subtype của một type nào đó.

### Code ví dụ

```typescript
// === GENERIC FUNCTION CƠ BẢN ===

// Không có generic -- phải viết nhiều function
function identityString(value: string): string {
  return value;
}
function identityNumber(value: number): number {
  return value;
}

// Với generic -- một function cho tất cả
function identity<T>(value: T): T {
  return value;
}

const str = identity("hello");   // T được infer là "hello"
const num = identity(42);        // T được infer là 42
const explicit = identity<string>("hello"); // Chỉ định type rõ ràng

// === GENERIC CONSTRAINTS ===

// Không có constraint -- không truy cập được property nào
function logLength<T>(value: T): void {
  // console.log(value.length); // Error: T không chắc có .length
}

// Với constraint: T phải có property length
function logLengthSafe<T extends { length: number }>(value: T): T {
  console.log(`Length: ${value.length}`); // OK
  return value;
}

logLengthSafe("hello");        // OK -- string có length
logLengthSafe([1, 2, 3]);      // OK -- array có length
// logLengthSafe(42);           // Error -- number không có length

// === MULTIPLE TYPE PARAMETERS ===
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

const numbers = map(["1", "2", "3"], (s) => parseInt(s));
// T = string, U = number, kết quả: number[]

// === GENERIC VỚI keyof CONSTRAINT ===
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Thuan", age: 28, email: "thuan@dev.com" };

const name = getProperty(user, "name");   // type: string
const age = getProperty(user, "age");     // type: number
// getProperty(user, "salary");            // Error: "salary" không phải key của user
```

### Đáp án mẫu

> "Generics cho phép viết code tái sử dụng được mà vẫn giữ type safety. Thay vì dùng any, ta dùng type parameter T để TypeScript tự động suy luận type chính xác. Generic constraints dùng extends để giới hạn -- ví dụ T extends HasLength đảm bảo T phải có property length. Kết hợp với keyof, ta có thể tạo các function type-safe như getProperty mà chỉ chấp nhận key thật sự tồn tại trên object."

---

## Câu 2: Giải thích các utility types: Partial, Required, Pick, Omit, Record, Readonly `[Intermediate]`

### Giải thích lý thuyết

TypeScript cung cấp nhiều **utility types** có sẵn để biến đổi type mà không cần viết lại từ đầu. Đây là những type thao tác phổ biến nhất.

### Code ví dụ

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// === PARTIAL<T> -- Tất cả property trở thành optional ===
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; avatar?: string }

// Use case: Update function chỉ cần truyền field cần update
function updateUser(id: number, updates: Partial<User>): User {
  const existing = getUserById(id);
  return { ...existing, ...updates };
}
updateUser(1, { name: "New Name" }); // Chỉ update name

// === REQUIRED<T> -- Tất cả property trở thành bắt buộc ===
type RequiredUser = Required<User>;
// { id: number; name: string; email: string; avatar: string }
// avatar không còn optional nữa!

// === PICK<T, K> -- Chỉ lấy một số property ===
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Use case: API response chỉ trả về một số field
function getUserPreview(id: number): UserPreview {
  const user = getUserById(id);
  return { id: user.id, name: user.name };
}

// === OMIT<T, K> -- Loại bỏ một số property ===
type UserWithoutEmail = Omit<User, "email">;
// { id: number; name: string; avatar?: string }

// Use case: Tạo type cho form (không cần id từ server)
type CreateUserDto = Omit<User, "id">;
// { name: string; email: string; avatar?: string }

// === RECORD<K, V> -- Tạo object type với key và value type ===
type Role = "admin" | "editor" | "viewer";

type RolePermissions = Record<Role, string[]>;
// { admin: string[]; editor: string[]; viewer: string[] }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};

// === READONLY<T> -- Tất cả property trở thành readonly ===
type ReadonlyUser = Readonly<User>;

const frozenUser: ReadonlyUser = {
  id: 1,
  name: "Thuan",
  email: "thuan@dev.com",
};
// frozenUser.name = "Other"; // Error: Cannot assign to 'name'
```

### Bảng tổng hợp utility types

| Utility Type | Tác dụng | Ví dụ Input | Ví dụ Output |
|-------------|---------|-------------|-------------|
| `Partial<T>` | Tất cả optional | `{ a: string; b: number }` | `{ a?: string; b?: number }` |
| `Required<T>` | Tất cả bắt buộc | `{ a?: string; b?: number }` | `{ a: string; b: number }` |
| `Pick<T, K>` | Chỉ lấy key K | `Pick<User, "name">` | `{ name: string }` |
| `Omit<T, K>` | Loại bỏ key K | `Omit<User, "id">` | `{ name; email; ... }` |
| `Record<K, V>` | Object với key K, value V | `Record<"a" \| "b", number>` | `{ a: number; b: number }` |
| `Readonly<T>` | Tất cả readonly | `{ a: string }` | `{ readonly a: string }` |
| `ReturnType<T>` | Lấy return type của function | `ReturnType<() => string>` | `string` |
| `Parameters<T>` | Lấy parameters type | `Parameters<(a: string) => void>` | `[string]` |
| `Exclude<T, U>` | Loại U khỏi union T | `Exclude<"a" \| "b", "a">` | `"b"` |
| `Extract<T, U>` | Lấy phần chung | `Extract<"a" \| "b", "a" \| "c">` | `"a"` |
| `NonNullable<T>` | Loại null và undefined | `NonNullable<string \| null>` | `string` |

### Đáp án mẫu

> "TypeScript cung cấp nhiều utility types để biến đổi type mà không cần tạo type mới từ đầu. Partial biến tất cả property thành optional -- rất hữu ích cho update functions. Pick và Omit cho phép chọn hoặc loại bỏ property -- dùng cho DTO và API response. Record tạo object type từ union keys -- tốt cho mapping. Trong dự án thực tế, tôi dùng Omit nhiều nhất để tạo CreateDto từ entity type bằng cách loại id và timestamps."

---

## Câu 3: Tự implement Partial, Pick, và Omit `[Senior]`

### Giải thích lý thuyết

Hiểu cách implement utility types giúp bạn hiểu sâu về mapped types và conditional types -- hai khái niệm nền tảng của type-level programming trong TypeScript.

### Code ví dụ

```typescript
// === TỰ IMPLEMENT PARTIAL ===
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Giải thích:
// - keyof T: lấy tất cả key của T
// - [K in keyof T]: lặp qua từng key
// - ?: biến mỗi property thành optional
// - T[K]: giữ nguyên type của property

// Test
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type PartialTodo = MyPartial<Todo>;
// { title?: string; description?: string; completed?: boolean }

// === TỰ IMPLEMENT PICK ===
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Giải thích:
// - K extends keyof T: K phải là key của T (constraint)
// - [P in K]: chỉ lặp qua các key trong K (không phải tất cả key của T)
// - T[P]: lấy type của property P trong T

type TodoPreview = MyPick<Todo, "title" | "completed">;
// { title: string; completed: boolean }

// === TỰ IMPLEMENT OMIT ===
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// Giải thích:
// - [P in keyof T]: lặp qua tất cả key của T
// - as P extends K ? never : P: key remapping
//   - Nếu P nằm trong K --> never (loại bỏ)
//   - Nếu không --> giữ lại P
// - T[P]: giữ nguyên type

// Cách implement khác (dùng Exclude):
type MyOmit2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type TodoWithoutDescription = MyOmit<Todo, "description">;
// { title: string; completed: boolean }

// === TỰ IMPLEMENT REQUIRED ===
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};
// -? loại bỏ optional modifier

// === TỰ IMPLEMENT READONLY ===
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// === TỰ IMPLEMENT RECORD ===
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

// keyof any = string | number | symbol (tất cả các key hợp lệ)
```

### Đáp án mẫu

> "Partial được implement bằng mapped type: lặp qua keyof T và thêm ? modifier cho mỗi property. Pick giới hạn mapped type chỉ lặp qua các key K thay vì toàn bộ keyof T. Omit phức tạp hơn -- có thể dùng key remapping với as để filter key, hoặc combine Pick và Exclude. Hiểu cách implement giúp tôi tự tin tạo các custom utility types cho dự án, ví dụ DeepPartial cho nested objects hoặc Mutable để loại readonly."

---

## Câu 4: Generic với default type parameters `[Intermediate]`

### Giải thích lý thuyết

Tương tự default parameters của function, generic type parameters cũng có thể có giá trị mặc định. Khi người dùng không truyền type parameter, TypeScript sẽ dùng default type.

### Code ví dụ

```typescript
// === DEFAULT TYPE PARAMETER ===
interface ApiResponse<TData = unknown, TError = string> {
  success: boolean;
  data?: TData;
  error?: TError;
}

// Sử dụng với type cụ thể
const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: 1, name: "Thuan", email: "thuan@dev.com" },
};

// Sử dụng với default (TData = unknown, TError = string)
const genericResponse: ApiResponse = {
  success: false,
  error: "Something went wrong",
};

// Chỉ chỉ định TData, TError dùng default
const listResponse: ApiResponse<User[]> = {
  success: true,
  data: [{ id: 1, name: "Thuan", email: "thuan@dev.com" }],
};

// === DEFAULT VỚI CONSTRAINT ===
interface Repository<T extends { id: number | string } = { id: number }> {
  findById(id: T["id"]): Promise<T | null>;
  save(entity: T): Promise<T>;
}

// Dùng default type
const defaultRepo: Repository = {
  findById: async (id: number) => null,
  save: async (entity) => entity,
};

// === GENERIC CLASS VỚI DEFAULT ===
class EventEmitter<TEvents extends Record<string, any> = Record<string, any>> {
  private listeners = new Map<keyof TEvents, Set<Function>>();

  on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]) {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }
}

// Type-safe events
type AppEvents = {
  login: { userId: string };
  logout: undefined;
  error: { message: string; code: number };
};

const emitter = new EventEmitter<AppEvents>();
emitter.on("login", (data) => {
  console.log(data.userId); // type-safe: data là { userId: string }
});
// emitter.emit("login", { wrong: true }); // Error!
```

### Đáp án mẫu

> "Default type parameters cho phép tạo generic type mà người dùng không bắt buộc phải truyền type argument. Giống như default function params, default types được dùng khi không có explicit type argument và TypeScript không thể infer được. Điều này rất hữu ích cho API design -- ví dụ ApiResponse có thể dùng mà không cần chỉ định type cụ thể, nhưng vẫn cho phép type-safe khi cần."

---

## Câu 5: keyof và typeof operators trong TypeScript `[Intermediate]`

### Giải thích lý thuyết

- **`keyof`** lấy ra union type của tất cả **key** của một type. Ví dụ: `keyof User` trả về `"name" | "age" | "email"`.
- **`typeof`** trong TypeScript context lấy ra **type** của một giá trị (khác với typeof trong JavaScript chỉ trả về string).

Hai operator này kết hợp với nhau rất mạnh để tạo type từ giá trị có sẵn.

### Code ví dụ

```typescript
// === KEYOF ===
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // "id" | "name" | "email"

// Ứng dụng: type-safe property access
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, name: "Thuan", email: "thuan@dev.com" };
const name = getValue(user, "name");   // type: string
const id = getValue(user, "id");       // type: number
// getValue(user, "phone");             // Error!

// === TYPEOF (trong type context) ===
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
} as const;

// Lấy type từ giá trị có sẵn
type Config = typeof config;
// { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3 }

type ConfigKeys = keyof typeof config;
// "apiUrl" | "timeout" | "retries"

// === KẾT HỢP KEYOF VÀ TYPEOF ===

// Tạo type từ enum-like object
const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
// "GET" | "POST" | "PUT" | "DELETE"

// Tạo type từ function return value
function createUser() {
  return {
    id: Math.random(),
    name: "default",
    createdAt: new Date(),
  };
}

type CreatedUser = ReturnType<typeof createUser>;
// { id: number; name: string; createdAt: Date }

// === KEYOF VỚI MAPPED TYPES ===
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string;
// }
```

### Đáp án mẫu

> "keyof lấy union type của tất cả key trong một type -- cực kỳ hữu ích cho type-safe object access. typeof trong type context trích xuất type từ một giá trị runtime -- cho phép derive type từ objects, functions, và constants mà không cần khai báo type riêng. Kết hợp cả hai: keyof typeof cho phép lấy keys của một runtime object dưới dạng type. Pattern này rất phổ biến khi làm việc với config objects hoặc const enums."

---

## Câu 6: Viết một generic function `merge` type-safe `[Senior]`

### Giải thích lý thuyết

Câu hỏi này kiểm tra khả năng áp dụng generics vào bài toán thực tế. Yêu cầu: viết function merge hai object mà kết quả phải có type chính xác, không mất bất kỳ type information nào.

### Code ví dụ

```typescript
// === BÀI TOÁN: Type-safe merge ===

// Cách SAI -- mất type information
function mergeWrong(a: object, b: object): object {
  return { ...a, ...b };
}
const result1 = mergeWrong({ name: "Thuan" }, { age: 28 });
// result1.name; // Error: Property 'name' does not exist on type 'object'

// Cách ĐÚNG -- generic giữ toàn bộ type
function merge<A extends object, B extends object>(a: A, b: B): A & B {
  return { ...a, ...b } as A & B;
}

const result2 = merge({ name: "Thuan" }, { age: 28 });
// type: { name: string } & { age: number }
console.log(result2.name); // OK: string
console.log(result2.age);  // OK: number

// === NÂNG CẤP: Deep merge với generics ===
type DeepMerge<A, B> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? K extends keyof A
      ? A[K] extends object
        ? B[K] extends object
          ? DeepMerge<A[K], B[K]>
          : B[K]
        : B[K]
      : B[K]
    : K extends keyof A
      ? A[K]
      : never;
};

// === GENERIC VỚI OVERLOADS ===
function createElement<T extends "div">(tag: T): HTMLDivElement;
function createElement<T extends "span">(tag: T): HTMLSpanElement;
function createElement<T extends "input">(tag: T): HTMLInputElement;
function createElement<T extends string>(tag: T): HTMLElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const div = createElement("div");     // HTMLDivElement
const span = createElement("span");   // HTMLSpanElement
const input = createElement("input"); // HTMLInputElement
const custom = createElement("my-component"); // HTMLElement
```

### Đáp án mẫu

> "Để merge type-safe, ta dùng two generic type parameters A và B với constraint extends object, và return type là A & B (intersection). Điều này đảm bảo kết quả có tất cả property của cả hai input objects với type chính xác. Với trường hợp phức tạp hơn như deep merge, ta cần recursive conditional types. Đây là một pattern rất thường gặp khi xây dựng utility functions cho state management hoặc config merging."

---

## Lỗi thường gặp khi trả lời

1. **Dùng any thay vì generic**: Khi interviewer hỏi "làm sao viết function tái sử dụng được?", nếu bạn dùng `any` thay vì generic `T`, bạn mất type safety và mất điểm.

2. **Quên constraint cho generic**: Viết `function log<T>(value: T)` rồi truy cập `value.length` sẽ lỗi. Phải thêm constraint: `T extends { length: number }`.

3. **Nhầm lẫn keyof với Object.keys()**: `keyof` hoạt động ở **type level** (compile time), `Object.keys()` hoạt động ở **runtime**. Hai cái này khác nhau về bản chất.

4. **Không biết cách implement utility types**: Nếu interviewer hỏi "implement Partial", mà bạn không biết mapped types `[K in keyof T]`, đó là gap lớn. Hãy học cách implement ít nhất Partial, Pick, Omit.

5. **Nhầm generic default với any**: `T = unknown` nghĩa là khi không truyền type, T là unknown (vẫn type-safe). `T = any` thì tắt type checking -- hai cái rất khác nhau.

6. **Không hiểu typeof trong type context vs runtime**: `typeof` trong TypeScript có hai nghĩa. Trong type position (`type X = typeof value`), nó lấy type. Trong expression position (`if (typeof x === "string")`), nó là JavaScript typeof operator.
