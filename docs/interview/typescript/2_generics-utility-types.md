---
sidebar_position: 2
title: "Generics & Utility Types"
---

# Generics & Utility Types

Generics la mot trong nhung tinh nang manh nhat cua TypeScript -- cho phep ban viet code vua type-safe vua tai su dung duoc. Ket hop voi utility types co san, ban co the bieu dien hau het moi pattern ma khong can lap lai code. Day la nhom cau hoi thuong gap o muc Intermediate den Senior.

---

## Cau 1: Generics la gi? Generic function va generic constraints hoat dong nhu the nao? `[Intermediate]`

### Giai thich ly thuyet

**Generics** cho phep ban tao ra cac function, class, interface ma **khong co dinh type cu the** tai thoi diem viet code. Type se duoc "truyen vao" khi su dung, giong nhu truyen tham so cho function.

**Generic constraints** (`extends`) cho phep ban gioi han type parameter phai thoa man mot dieu kien nhat dinh -- vi du phai co property `length`, hoac phai la subtype cua mot type nao do.

### Code vi du

```typescript
// === GENERIC FUNCTION CO BAN ===

// Khong co generic -- phai viet nhieu function
function identityString(value: string): string {
  return value;
}
function identityNumber(value: number): number {
  return value;
}

// Voi generic -- mot function cho tat ca
function identity<T>(value: T): T {
  return value;
}

const str = identity("hello");   // T duoc infer la "hello"
const num = identity(42);        // T duoc infer la 42
const explicit = identity<string>("hello"); // Chi dinh type ro rang

// === GENERIC CONSTRAINTS ===

// Khong co constraint -- khong truy cap duoc property nao
function logLength<T>(value: T): void {
  // console.log(value.length); // Error: T khong chac co .length
}

// Voi constraint: T phai co property length
function logLengthSafe<T extends { length: number }>(value: T): T {
  console.log(`Length: ${value.length}`); // OK
  return value;
}

logLengthSafe("hello");        // OK -- string co length
logLengthSafe([1, 2, 3]);      // OK -- array co length
// logLengthSafe(42);           // Error -- number khong co length

// === MULTIPLE TYPE PARAMETERS ===
function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}

const numbers = map(["1", "2", "3"], (s) => parseInt(s));
// T = string, U = number, ket qua: number[]

// === GENERIC VOI keyof CONSTRAINT ===
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Thuan", age: 28, email: "thuan@dev.com" };

const name = getProperty(user, "name");   // type: string
const age = getProperty(user, "age");     // type: number
// getProperty(user, "salary");            // Error: "salary" khong phai key cua user
```

### Dap an mau

> "Generics cho phep viet code tai su dung duoc ma van giu type safety. Thay vi dung any, ta dung type parameter T de TypeScript tu dong suy luan type chinh xac. Generic constraints dung extends de gioi han -- vi du T extends HasLength dam bao T phai co property length. Ket hop voi keyof, ta co the tao cac function type-safe nhu getProperty ma chi chap nhan key that su ton tai tren object."

---

## Cau 2: Giai thich cac utility types: Partial, Required, Pick, Omit, Record, Readonly `[Intermediate]`

### Giai thich ly thuyet

TypeScript cung cap nhieu **utility types** co san de bien doi type ma khong can viet lai tu dau. Day la nhung type thao tac pho bien nhat.

### Code vi du

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// === PARTIAL<T> -- Tat ca property tro thanh optional ===
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; avatar?: string }

// Use case: Update function chi can truyen field can update
function updateUser(id: number, updates: Partial<User>): User {
  const existing = getUserById(id);
  return { ...existing, ...updates };
}
updateUser(1, { name: "New Name" }); // Chi update name

// === REQUIRED<T> -- Tat ca property tro thanh bat buoc ===
type RequiredUser = Required<User>;
// { id: number; name: string; email: string; avatar: string }
// avatar khong con optional nua!

// === PICK<T, K> -- Chi lay mot so property ===
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Use case: API response chi tra ve mot so field
function getUserPreview(id: number): UserPreview {
  const user = getUserById(id);
  return { id: user.id, name: user.name };
}

// === OMIT<T, K> -- Loai bo mot so property ===
type UserWithoutEmail = Omit<User, "email">;
// { id: number; name: string; avatar?: string }

// Use case: Tao type cho form (khong can id tu server)
type CreateUserDto = Omit<User, "id">;
// { name: string; email: string; avatar?: string }

// === RECORD<K, V> -- Tao object type voi key va value type ===
type Role = "admin" | "editor" | "viewer";

type RolePermissions = Record<Role, string[]>;
// { admin: string[]; editor: string[]; viewer: string[] }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
};

// === READONLY<T> -- Tat ca property tro thanh readonly ===
type ReadonlyUser = Readonly<User>;

const frozenUser: ReadonlyUser = {
  id: 1,
  name: "Thuan",
  email: "thuan@dev.com",
};
// frozenUser.name = "Other"; // Error: Cannot assign to 'name'
```

### Bang tong hop utility types

| Utility Type | Tac dung | Vi du Input | Vi du Output |
|-------------|---------|-------------|-------------|
| `Partial<T>` | Tat ca optional | `{ a: string; b: number }` | `{ a?: string; b?: number }` |
| `Required<T>` | Tat ca bat buoc | `{ a?: string; b?: number }` | `{ a: string; b: number }` |
| `Pick<T, K>` | Chi lay key K | `Pick<User, "name">` | `{ name: string }` |
| `Omit<T, K>` | Loai bo key K | `Omit<User, "id">` | `{ name; email; ... }` |
| `Record<K, V>` | Object voi key K, value V | `Record<"a" \| "b", number>` | `{ a: number; b: number }` |
| `Readonly<T>` | Tat ca readonly | `{ a: string }` | `{ readonly a: string }` |
| `ReturnType<T>` | Lay return type cua function | `ReturnType<() => string>` | `string` |
| `Parameters<T>` | Lay parameters type | `Parameters<(a: string) => void>` | `[string]` |
| `Exclude<T, U>` | Loai U khoi union T | `Exclude<"a" \| "b", "a">` | `"b"` |
| `Extract<T, U>` | Lay phan chung | `Extract<"a" \| "b", "a" \| "c">` | `"a"` |
| `NonNullable<T>` | Loai null va undefined | `NonNullable<string \| null>` | `string` |

### Dap an mau

> "TypeScript cung cap nhieu utility types de bien doi type ma khong can tao type moi tu dau. Partial bien tat ca property thanh optional -- rat huu ich cho update functions. Pick va Omit cho phep chon hoac loai bo property -- dung cho DTO va API response. Record tao object type tu union keys -- tot cho mapping. Trong du an thuc te, toi dung Omit nhieu nhat de tao CreateDto tu entity type bang cach loai id va timestamps."

---

## Cau 3: Tu implement Partial, Pick, va Omit `[Senior]`

### Giai thich ly thuyet

Hieu cach implement utility types giup ban hieu sau ve mapped types va conditional types -- hai khai niem nen tang cua type-level programming trong TypeScript.

### Code vi du

```typescript
// === TU IMPLEMENT PARTIAL ===
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Giai thich:
// - keyof T: lay tat ca key cua T
// - [K in keyof T]: lap qua tung key
// - ?: bien moi property thanh optional
// - T[K]: giu nguyen type cua property

// Test
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type PartialTodo = MyPartial<Todo>;
// { title?: string; description?: string; completed?: boolean }

// === TU IMPLEMENT PICK ===
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Giai thich:
// - K extends keyof T: K phai la key cua T (constraint)
// - [P in K]: chi lap qua cac key trong K (khong phai tat ca key cua T)
// - T[P]: lay type cua property P trong T

type TodoPreview = MyPick<Todo, "title" | "completed">;
// { title: string; completed: boolean }

// === TU IMPLEMENT OMIT ===
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// Giai thich:
// - [P in keyof T]: lap qua tat ca key cua T
// - as P extends K ? never : P: key remapping
//   - Neu P nam trong K --> never (loai bo)
//   - Neu khong --> giu lai P
// - T[P]: giu nguyen type

// Cach implement khac (dung Exclude):
type MyOmit2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type TodoWithoutDescription = MyOmit<Todo, "description">;
// { title: string; completed: boolean }

// === TU IMPLEMENT REQUIRED ===
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};
// -? loai bo optional modifier

// === TU IMPLEMENT READONLY ===
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// === TU IMPLEMENT RECORD ===
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

// keyof any = string | number | symbol (tat ca cac key hop le)
```

### Dap an mau

> "Partial duoc implement bang mapped type: lap qua keyof T va them ? modifier cho moi property. Pick gioi han mapped type chi lap qua cac key K thay vi toan bo keyof T. Omit phuc tap hon -- co the dung key remapping voi as de filter key, hoac combine Pick va Exclude. Hieu cach implement giup toi tu tin tao cac custom utility types cho du an, vi du DeepPartial cho nested objects hoac Mutable de loai readonly."

---

## Cau 4: Generic voi default type parameters `[Intermediate]`

### Giai thich ly thuyet

Tuong tu default parameters cua function, generic type parameters cung co the co gia tri mac dinh. Khi nguoi dung khong truyen type parameter, TypeScript se dung default type.

### Code vi du

```typescript
// === DEFAULT TYPE PARAMETER ===
interface ApiResponse<TData = unknown, TError = string> {
  success: boolean;
  data?: TData;
  error?: TError;
}

// Su dung voi type cu the
const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: 1, name: "Thuan", email: "thuan@dev.com" },
};

// Su dung voi default (TData = unknown, TError = string)
const genericResponse: ApiResponse = {
  success: false,
  error: "Something went wrong",
};

// Chi chi dinh TData, TError dung default
const listResponse: ApiResponse<User[]> = {
  success: true,
  data: [{ id: 1, name: "Thuan", email: "thuan@dev.com" }],
};

// === DEFAULT VOI CONSTRAINT ===
interface Repository<T extends { id: number | string } = { id: number }> {
  findById(id: T["id"]): Promise<T | null>;
  save(entity: T): Promise<T>;
}

// Dung default type
const defaultRepo: Repository = {
  findById: async (id: number) => null,
  save: async (entity) => entity,
};

// === GENERIC CLASS VOI DEFAULT ===
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
  console.log(data.userId); // type-safe: data la { userId: string }
});
// emitter.emit("login", { wrong: true }); // Error!
```

### Dap an mau

> "Default type parameters cho phep tao generic type ma nguoi dung khong bat buoc phai truyen type argument. Giong nhu default function params, default types duoc dung khi khong co explicit type argument va TypeScript khong the infer duoc. Dieu nay rat huu ich cho API design -- vi du ApiResponse co the dung ma khong can chi dinh type cu the, nhung van cho phep type-safe khi can."

---

## Cau 5: keyof va typeof operators trong TypeScript `[Intermediate]`

### Giai thich ly thuyet

- **`keyof`** lay ra union type cua tat ca **key** cua mot type. Vi du: `keyof User` tra ve `"name" | "age" | "email"`.
- **`typeof`** trong TypeScript context lay ra **type** cua mot gia tri (khac voi typeof trong JavaScript chi tra ve string).

Hai operator nay ket hop voi nhau rat manh de tao type tu gia tri co san.

### Code vi du

```typescript
// === KEYOF ===
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // "id" | "name" | "email"

// Ung dung: type-safe property access
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

// Lay type tu gia tri co san
type Config = typeof config;
// { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3 }

type ConfigKeys = keyof typeof config;
// "apiUrl" | "timeout" | "retries"

// === KET HOP KEYOF VA TYPEOF ===

// Tao type tu enum-like object
const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
// "GET" | "POST" | "PUT" | "DELETE"

// Tao type tu function return value
function createUser() {
  return {
    id: Math.random(),
    name: "default",
    createdAt: new Date(),
  };
}

type CreatedUser = ReturnType<typeof createUser>;
// { id: number; name: string; createdAt: Date }

// === KEYOF VOI MAPPED TYPES ===
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

### Dap an mau

> "keyof lay union type cua tat ca key trong mot type -- cuc ky huu ich cho type-safe object access. typeof trong type context trich xuat type tu mot gia tri runtime -- cho phep derive type tu objects, functions, va constants ma khong can khai bao type rieng. Ket hop ca hai: keyof typeof cho phep lay keys cua mot runtime object duoi dang type. Pattern nay rat pho bien khi lam viec voi config objects hoac const enums."

---

## Cau 6: Viet mot generic function `merge` type-safe `[Senior]`

### Giai thich ly thuyet

Cau hoi nay kiem tra kha nang ap dung generics vao bai toan thuc te. Yeu cau: viet function merge hai object ma ket qua phai co type chinh xac, khong mat bat ky type information nao.

### Code vi du

```typescript
// === BAI TOAN: Type-safe merge ===

// Cach SAI -- mat type information
function mergeWrong(a: object, b: object): object {
  return { ...a, ...b };
}
const result1 = mergeWrong({ name: "Thuan" }, { age: 28 });
// result1.name; // Error: Property 'name' does not exist on type 'object'

// Cach DUNG -- generic giu toan bo type
function merge<A extends object, B extends object>(a: A, b: B): A & B {
  return { ...a, ...b } as A & B;
}

const result2 = merge({ name: "Thuan" }, { age: 28 });
// type: { name: string } & { age: number }
console.log(result2.name); // OK: string
console.log(result2.age);  // OK: number

// === NANG CAP: Deep merge voi generics ===
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

// === GENERIC VOI OVERLOADS ===
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

### Dap an mau

> "De merge type-safe, ta dung two generic type parameters A va B voi constraint extends object, va return type la A & B (intersection). Dieu nay dam bao ket qua co tat ca property cua ca hai input objects voi type chinh xac. Voi truong hop phuc tap hon nhu deep merge, ta can recursive conditional types. Day la mot pattern rat thuong gap khi xay dung utility functions cho state management hoac config merging."

---

## Loi thuong gap khi tra loi

1. **Dung any thay vi generic**: Khi interviewer hoi "lam sao viet function tai su dung duoc?", neu ban dung `any` thay vi generic `T`, ban mat type safety va mat diem.

2. **Quen constraint cho generic**: Viet `function log<T>(value: T)` roi truy cap `value.length` se loi. Phai them constraint: `T extends { length: number }`.

3. **Nham lan keyof voi Object.keys()**: `keyof` hoat dong o **type level** (compile time), `Object.keys()` hoat dong o **runtime**. Hai cai nay khac nhau ve ban chat.

4. **Khong biet cach implement utility types**: Neu interviewer hoi "implement Partial", ma ban khong biet mapped types `[K in keyof T]`, do la gap lon. Hay hoc cach implement it nhat Partial, Pick, Omit.

5. **Nham generic default voi any**: `T = unknown` nghia la khi khong truyen type, T la unknown (van type-safe). `T = any` thi tat type checking -- hai cai rat khac nhau.

6. **Khong hieu typeof trong type context vs runtime**: `typeof` trong TypeScript co hai nghia. Trong type position (`type X = typeof value`), no lay type. Trong expression position (`if (typeof x === "string")`), no la JavaScript typeof operator.
