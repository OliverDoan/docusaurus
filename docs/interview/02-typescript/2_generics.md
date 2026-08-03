---
sidebar_position: 2
title: "2. Generics"
---

# Generics

> *Generics là phần ranh giới giữa "dùng TS như JS có type" và "thực sự hiểu TS". Câu hỏi generics ở vòng phỏng vấn senior thường là loại "type challenge" nho nhỏ.*

:::note[Ghi nhớ nhanh]

- ⭐ **Generic = type parameter** — viết hàm/component reusable mà vẫn type-safe (giữ type relationship, khác `any` mất hoàn toàn); use case: fetch wrapper, custom hook, event emitter có type.
- ⭐ **`extends` có 2 nghĩa** — constraint `<T extends U>` ("T phải là U") vs conditional `T extends U ? X : Y` ("T có phải U không", branching type-level).
- **Constraint + `keyof`** — `getField<T, K extends keyof T>(obj, key): T[K]` cho safe property access; `T extends HasId` để giới hạn shape.
- **`infer`** — đặt tên type chưa biết trong vế `extends` của conditional (như pattern matching); nền tảng của `Parameters`, `ReturnType`, `Awaited`, tuple `First`/`Tail`.
- **Distribution** — conditional distribute khi T trần là union (`T extends any ? T[] : never` cho `string[] | number[]`); wrap `[T] extends [U]` để tắt.
- **Variance** — array covariant nhưng unsound (mutate gây bug), dùng `ReadonlyArray` để an toàn; function param contravariant.
- **`Readonly<T>` chỉ shallow** — tự viết `DeepReadonly<T>` bằng mapped type đệ quy, nhớ loại trừ primitive/Function/Map/Set.

:::

---

## Câu 1: Generic là gì và khi nào nên dùng? `[Intermediate]`

### Câu hỏi

> Em hãy viết một hàm `identity` generic. Sau đó cho anh ví dụ một use case generic mà em đã thực sự dùng trong dự án.

### Giải thích lý thuyết

Generic = type parameter — type biến số, được suy ra hoặc truyền vào lúc gọi. Giúp viết hàm/component **reusable mà vẫn type-safe**.

Khi nào nên dùng:

- Hàm xử lý nhiều type với cùng logic.
- API trả về data với shape phụ thuộc input.
- Container/wrapper (List, Result, Optional...).

### Code minh hoạ

```typescript
// Cơ bản — TS infer T tự động
function identity<T>(value: T): T {
  return value;
}
const a = identity(42);       // a: number
const b = identity("hello");  // b: string

// Use case 1: fetch wrapper trả về data type rõ ràng
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}

interface User { id: string; email: string; }
const user = await apiGet<User>("/api/me"); // user: User

// Use case 2: React custom hook
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  const set = (v: T) => {
    setVal(v);
    localStorage.setItem(key, JSON.stringify(v));
  };
  return [val, set];
}

const [theme] = useLocalStorage("theme", "light"); // theme: string
const [user2] = useLocalStorage<User | null>("user", null);

// Use case 3: Strongly-typed event emitter
type EventMap = {
  login: { userId: string };
  logout: void;
};

class Emitter<E extends Record<string, any>> {
  on<K extends keyof E>(event: K, cb: (payload: E[K]) => void) {}
  emit<K extends keyof E>(event: K, payload: E[K]) {}
}

const em = new Emitter<EventMap>();
em.on("login", (p) => p.userId); // p: { userId: string }
em.emit("login", { userId: "u1" });
// em.emit("login", {});           // ❌ thiếu userId
// em.emit("typo", {} as any);     // ❌ event không tồn tại
```

### Đáp án mẫu

> "Generic là type parameter — kiểu type biến số, được infer hoặc truyền vào khi gọi. Em dùng nhiều nhất ở 3 chỗ: thứ nhất là **API fetch wrapper** — `apiGet<User>('/api/me')` trả `Promise<User>` thay vì `any`; thứ hai là **custom React hook** như `useLocalStorage<User>` để giữ type qua tầng abstraction; thứ ba là **event emitter có type** — với generic và `keyof EventMap`, sai event name hoặc sai payload sẽ TS báo ngay. Generic không khó về cú pháp nhưng khó về thiết kế — viết generic phải tự hỏi 'caller cần ổn định cái gì, biến đổi cái gì'."

---

## Câu 2: Generic constraint với `extends` `[Intermediate]`

### Câu hỏi

> Em viết hàm `getField(obj, key)` để lấy field từ object. Làm sao để TS bắt nếu `key` không thuộc `obj`?

### Giải thích lý thuyết

`extends` trong generic position = **constraint** (hạn chế T phải là subtype của X). Kết hợp với `keyof` cho phép viết hàm safe access.

### Code minh hoạ

```typescript
// Sai: T không có constraint, key bất kỳ
function getField<T, K>(obj: T, key: K) {
  return obj[key]; // ❌ TS error: key not assignable to keyof T
}

// Đúng: constraint key extends keyof T
function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: "u1", name: "An", age: 25 };
getField(user, "name");  // string
getField(user, "age");   // number
// getField(user, "wrong"); // ❌ Argument 'wrong' is not assignable to keyof user

// Constraint với shape
interface HasId { id: string; }
function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((i) => i.id === id);
}

// Default generic
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}
const r1: ApiResponse = { data: "anything", status: 200 };       // T = unknown
const r2: ApiResponse<User[]> = { data: [], status: 200 };       // T = User[]

// Multiple type params
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((x, i) => [x, b[i]]);
}
const z = zip([1, 2, 3], ["a", "b", "c"]); // [number, string][]
```

### Đáp án mẫu

> "Em dùng constraint `K extends keyof T` — `function getField<T, K extends keyof T>(obj: T, key: K): T[K]`. Vế trái `extends` nói 'K phải là một trong các key của T', vế trả về `T[K]` lookup type tại key đó nên giữ được type chính xác (string, number...). Nếu caller pass key sai sẽ compile error. Pattern khác em hay dùng: `T extends HasId` để hàm chỉ làm việc với object có shape nhất định — `findById<T extends HasId>(items: T[], id)` chấp nhận User, Order, Product... miễn là có `id`."

---

## Câu 3: `extends` trong conditional type — khác `extends` trong constraint không? `[Senior]`

### Câu hỏi

> ```typescript
> type IsString<T> = T extends string ? true : false;
> type A = IsString<"hello">; // ?
> type B = IsString<number>;  // ?
> ```
>
> `extends` ở đây nghĩa là gì? Khác với `extends` trong generic constraint thế nào?

### Giải thích lý thuyết

`T extends U` có 2 ngữ cảnh:

1. **Generic constraint**: `<T extends U>` — hạn chế T phải là subtype của U. Compile error nếu T không hợp lệ.
2. **Conditional type**: `T extends U ? X : Y` — kiểm tra T có assignable tới U không. Nếu có → X, không → Y. Là branching type-level.

Conditional type còn có **distribution**: nếu T là union, conditional sẽ "distribute" qua từng nhánh.

### Code minh hoạ

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true — "hello" là subtype của string
type B = IsString<number>;  // false

// Distribution: T là union → conditional áp dụng cho từng nhánh
type ToArray<T> = T extends any ? T[] : never;
type X = ToArray<string | number>;
// X = ToArray<string> | ToArray<number> = string[] | number[]

// Tắt distribution: wrap [T] trong tuple
type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
type Y = ToArrayNoDist<string | number>; // (string | number)[]

// Use case: extract return type
type ReturnType<T> = T extends (...args: any) => infer R ? R : never;

function getUser() { return { id: "u1" }; }
type User = ReturnType<typeof getUser>; // { id: string }

// Use case: NonNullable
type NonNullable<T> = T extends null | undefined ? never : T;

// Phân biệt 2 nghĩa
function constraintExample<T extends string>(x: T) {}  // constraint
type ConditionalExample<T> = T extends string ? T : never; // conditional
```

### Đáp án mẫu

> "Hai nghĩa khác nhau hoàn toàn dù cùng từ khoá. Trong generic constraint, `<T extends string>` là điều kiện — caller pass T không phải string sẽ compile error. Trong conditional type, `T extends U ? X : Y` là expression type-level — branching dựa trên T có assignable tới U không. Với `IsString<'hello'>` ra `true`, `IsString<number>` ra `false`. Một đặc tính mạnh nhưng dễ bẫy: conditional type **distribute** khi T là union — `T extends any ? T[] : never` với T = `string | number` sẽ ra `string[] | number[]` chứ không phải `(string | number)[]`. Muốn tắt distribute thì wrap `[T] extends [U]`."

---

## Câu 4: `infer` keyword — dùng để làm gì? `[Senior]`

### Câu hỏi

> ```typescript
> type Params<F> = F extends (...args: infer A) => any ? A : never;
> ```
>
> Giải thích `infer A` ở đây. Em đã viết utility type nào dùng `infer` chưa?

### Giải thích lý thuyết

`infer` chỉ dùng trong vế `extends` của conditional type. Nó "đặt tên" cho một type chưa biết và để TS tự suy ra. Như đặt biến trong pattern matching.

### Code minh hoạ

```typescript
// 1. Lấy parameters của function
type Params<F> = F extends (...args: infer A) => any ? A : never;
type P = Params<(a: number, b: string) => void>; // [a: number, b: string]

// 2. Lấy return type
type Ret<F> = F extends (...args: any) => infer R ? R : never;
type R = Ret<() => Promise<User>>; // Promise<User>

// 3. Unwrap Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T; // recursive
type X = Awaited<Promise<Promise<number>>>; // number

// 4. Lấy first element của tuple
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type F1 = First<[1, 2, 3]>; // 1

// 5. Tail: bỏ phần tử đầu
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type T1 = Tail<[1, 2, 3]>; // [2, 3]

// 6. Trích type từ object
type ElementOf<T> = T extends (infer E)[] ? E : never;
type E = ElementOf<string[]>; // string

// 7. Use case thực tế: viết useMutation hook
type MutationFn<Args extends any[], Return> = (...args: Args) => Promise<Return>;
type MutationResult<F> = F extends MutationFn<infer A, infer R>
  ? { mutate: (...args: A) => void; data: R | undefined }
  : never;
```

### Đáp án mẫu

> "`infer` cho TS tự suy ra một type và đặt tên trong vế `extends` của conditional. Trong ví dụ, `F extends (...args: infer A) => any ? A : never` nói 'nếu F là function, đặt A là kiểu của args và trả về A'. Em đã viết vài utility type với `infer`: `Awaited<T>` để unwrap Promise lồng nhau (recursive với `infer U`); `First<T>` và `Tail<T>` cho tuple manipulation; và phổ biến nhất là `Parameters<F>`/`ReturnType<F>` đều dùng `infer`. Use case thực tế: viết hook generic suy ra type của args và data từ một mutation function, để consumer không phải gõ lại type."

---

## Câu 5: Variance — generic có covariant không? `[Senior]`

### Câu hỏi

> ```typescript
> type Animal = { name: string };
> type Dog = Animal & { bark: () => void };
>
> let animals: Animal[] = [];
> let dogs: Dog[] = [];
>
> animals = dogs; // OK hay error?
> dogs = animals; // OK hay error?
> ```

### Giải thích lý thuyết

- **Covariant** (`Dog ≤ Animal` ⇒ `Container<Dog> ≤ Container<Animal>`): array, readonly types.
- **Contravariant**: parameter của function.
- **Bivariant**: TypeScript "lỏng" mặc định cho function parameter trong method (gây bug).
- **Invariant**: không cùng chiều nào — mutable container về lý thuyết phải invariant.

TS không có cú pháp explicit cho variance ở generic (trừ flag `strictFunctionTypes`).

### Code minh hoạ

```typescript
type Animal = { name: string };
type Dog = Animal & { bark: () => void };

// Array: TS coi covariant (lỏng, không hoàn toàn type-safe)
let animals: Animal[] = [];
let dogs: Dog[] = [];

animals = dogs; // ✅ OK — Dog[] gán cho Animal[] (covariant)
// dogs = animals; // ❌ Error — Animal[] không assignable Dog[]

// Tuy nhiên, animals.push({ name: "cat" }) có thể được — và bug runtime
animals.push({ name: "cat" });
// dogs giờ chứa cat nhưng TS không biết
// dogs[0].bark(); // crash runtime nếu thực sự cùng reference

// Function param: contravariant (strictFunctionTypes)
type HandleAnimal = (a: Animal) => void;
type HandleDog = (d: Dog) => void;

let handleAnimal: HandleAnimal = (a) => console.log(a.name);
let handleDog: HandleDog = (d) => d.bark();

handleDog = handleAnimal; // ✅ Animal handler có thể nhận Dog (contravariant)
// handleAnimal = handleDog; // ❌ Dog handler cần .bark, Animal không có

// Readonly bypass — an toàn hơn cho covariance
let animalsR: ReadonlyArray<Animal> = dogs; // OK và an toàn (không push được)
```

### Đáp án mẫu

> "`animals = dogs` OK vì TS coi array covariant — Dog là subtype của Animal nên Dog[] gán cho Animal[] được. Nhưng đây thực ra **unsound**: sau khi gán, `animals.push({name: 'cat'})` sẽ insert object không phải Dog vào array mà cả 2 cùng tham chiếu — bug runtime. TS chấp nhận trade-off này vì practical (nếu invariant chặt thì code phải cast khắp nơi). Để safer, em dùng `ReadonlyArray<Animal>` — covariance an toàn vì không mutate được. Function parameter thì contravariant: handler nhận Animal có thể được dùng chỗ cần handler nhận Dog (Dog là Animal nên handler hợp lý), không ngược lại. Variance thường không lộ trong code thường ngày nhưng khi viết library generic cần hiểu để API không lừa user."

---

## Câu 6: Type Challenge — viết `DeepReadonly<T>` `[Senior]`

### Câu hỏi

> Viết một utility type `DeepReadonly<T>` làm tất cả field (kể cả nested) thành readonly.

### Giải thích lý thuyết

`Readonly<T>` built-in chỉ shallow:

```typescript
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

`DeepReadonly` đệ quy vào nested object. Cần xử lý: object, array, function, primitive.

### Code minh hoạ

```typescript
// Phiên bản cơ bản
type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

// Vấn đề: function/Date cũng bị "đệ quy" vào — không mong muốn
// Phiên bản tốt hơn: phân biệt primitive vs object
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type DeepReadonly2<T> = T extends Primitive
  ? T
  : T extends Function
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly2<U>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly2<K>, DeepReadonly2<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepReadonly2<U>>
  : { readonly [K in keyof T]: DeepReadonly2<T[K]> };

// Test
interface State {
  user: {
    name: string;
    posts: { id: string; tags: string[] }[];
  };
  settings: Map<string, boolean>;
}

type ReadonlyState = DeepReadonly2<State>;
// readonly user: { readonly name: ...; readonly posts: ReadonlyArray<{readonly id; readonly tags: ReadonlyArray<string>}> }

declare const s: ReadonlyState;
// s.user.name = "X";              // ❌ readonly
// s.user.posts.push({} as any);   // ❌ ReadonlyArray
// s.settings.set("a", true);      // ❌ ReadonlyMap

// Pattern tương tự: DeepPartial, DeepRequired
type DeepPartial<T> = T extends Primitive
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> };
```

### Đáp án mẫu

> "Phiên bản đơn giản là mapped type đệ quy: `type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }`. Nhưng phiên bản này có vấn đề: nó sẽ 'đệ quy' vào Function, Date, Map, Set — biến chúng thành object với mọi method readonly. Phiên bản production cần phân biệt: primitive thì trả nguyên T, function trả nguyên, array dùng `ReadonlyArray`, Map dùng `ReadonlyMap`, Set dùng `ReadonlySet`, còn lại mới mapped recursion. Em hay viết sẵn `Primitive` type và set Function check ở đầu để cover edge case. Cùng pattern này còn áp dụng cho `DeepPartial`, `DeepRequired`, `DeepNonNullable`."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| "Generic và `any` giống nhau, đều linh hoạt"           | Generic giữ type relationship, `any` mất hoàn toàn               |
| "`extends` trong constraint và conditional cùng nghĩa" | Constraint = "phải là"; conditional = "có phải là không"          |
| "Conditional type không distribute"                    | Distribute khi T trần là union — wrap `[T]` để tắt                |
| "`Readonly<T>` deep"                                   | Built-in chỉ shallow; cần tự viết DeepReadonly                    |
| "Variance không quan trọng với app code"               | Quan trọng khi viết library API, đặc biệt mutable container       |
