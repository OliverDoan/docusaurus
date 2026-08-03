---
sidebar_position: 3
title: "3. Utility Types & Mapped Types"
---

# Utility Types & Mapped Types

> *Câu hỏi loại này tách "biết dùng" và "viết được". Utility type built-in dễ thuộc, nhưng viết tay cái mới (cho code base lớn) là kỹ năng Senior.*

:::note[Ghi nhớ nhanh]

- ⭐ **Utility type built-in** — `Partial`/`Required`/`Pick`/`Omit`/`Record`/`ReturnType`/`Awaited`/`NonNullable`; combo `Awaited<ReturnType<typeof fn>>` để derive type không maintain 2 chỗ.
- ⭐ **`satisfies` (TS 4.9+)** — validate value match type NHƯNG giữ literal type; thay cho `as` (skip check, unsafe) và annotation `:T` (mất literal).
- **Mapped type** — `{ [K in keyof T]: ... }` với modifiers `?`/`readonly` và `-?`/`-readonly` để thêm/xoá; `as` để remap/filter key theo điều kiện.
- **Template literal type** — compose string type (`on${Capitalize<...>}`), dùng `infer` để parse dot-path; ứng dụng i18n key type-safe, CSS property gen.
- **`keyof` vs `typeof` vs `in`** — `keyof T` union các key; `typeof value` lấy type từ runtime value (mạnh với `as const`); `in` iterate union trong mapped type.
- **Deep utility tự viết** — `Partial`/`Readonly` built-in chỉ shallow; viết `DeepPartial`/`DeepReadonly` đệ quy, nhớ loại trừ primitive/Function/Date/Map/Set.

:::

---

## Câu 1: 5 utility type em dùng nhiều nhất là gì? `[Intermediate]`

### Câu hỏi

> Liệt kê 5 utility type em dùng thường xuyên và cho ví dụ cụ thể.

### Giải thích lý thuyết

| Utility            | Tác dụng                                              |
| ------------------ | ----------------------------------------------------- |
| `Partial<T>`       | Mọi field thành optional                              |
| `Required<T>`      | Mọi field thành required                              |
| `Pick<T, K>`       | Chỉ chọn các key K từ T                               |
| `Omit<T, K>`       | Bỏ các key K                                          |
| `Readonly<T>`      | Mọi field readonly                                    |
| `Record<K, V>`     | Object với key K và value V                           |
| `ReturnType<F>`    | Kiểu return của F                                     |
| `Parameters<F>`    | Tuple kiểu params của F                               |
| `Awaited<T>`       | Unwrap Promise                                        |
| `NonNullable<T>`   | Bỏ null/undefined                                     |

### Code minh hoạ

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// 1. Partial — form update
function updateUser(id: string, patch: Partial<User>) {
  return api.patch(`/users/${id}`, patch);
}
updateUser("u1", { name: "An" });  // chỉ name, không cần truyền cả object

// 2. Omit — tạo User mới (chưa có id, createdAt do server gen)
type CreateUserInput = Omit<User, "id" | "createdAt">;
async function createUser(input: CreateUserInput): Promise<User> { ... }

// 3. Pick — chỉ expose subset
type UserPublic = Pick<User, "id" | "name">;

// 4. Record — dictionary có type chặt
const roleLabels: Record<"admin" | "member" | "guest", string> = {
  admin: "Quản trị",
  member: "Thành viên",
  guest: "Khách",
};

// 5. ReturnType + Parameters
async function fetchUser(id: string) {
  return api.get<User>(`/users/${id}`);
}
type FetchUserResult = Awaited<ReturnType<typeof fetchUser>>; // User
type FetchUserArgs = Parameters<typeof fetchUser>;            // [id: string]

// 6. NonNullable — sau check
function processUser(u: User | null) {
  if (!u) return;
  const safe: NonNullable<typeof u> = u; // safe: User
}
```

### Đáp án mẫu

> "Top 5 em dùng nhất: **Omit** cho 'CreateUserInput = Omit\<User, 'id'|'createdAt'\>' — tách biệt input form và DB shape. **Partial** cho PATCH endpoint hoặc form update. **Pick** cho DTO public — chỉ expose subset. **Record\<K, V\>** cho dictionary type-safe — ví dụ `Record<Role, string>` để map role sang label, TS bắt nếu thiếu role. **ReturnType + Awaited** combo: khi có function `fetchUser`, em dùng `Awaited<ReturnType<typeof fetchUser>>` để derive type của data — không phải maintain type 2 chỗ. Trick này em dùng rất nhiều khi làm với react-query."

---

## Câu 2: Mapped Type — viết utility tự custom `[Intermediate]`

### Câu hỏi

> Viết utility `Nullable<T>` làm tất cả field của T có thể null. Sau đó viết `RemoveNullable<T>` để revert.

### Giải thích lý thuyết

Mapped type cú pháp:

```typescript
type Mapped<T> = {
  [K in keyof T]: SomeTransform<T[K]>;
};
```

Modifiers:
- `readonly` — gắn readonly (hoặc `-readonly` để xoá).
- `?` — gắn optional (hoặc `-?` để xoá).

### Code minh hoạ

```typescript
// Nullable: thêm null vào mỗi field
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface User { id: string; age: number; }
type NullableUser = Nullable<User>;
// { id: string | null; age: number | null }

// RemoveNullable: xoá null/undefined khỏi value
type RemoveNullable<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

// Toggle optional
type RequiredAll<T> = { [K in keyof T]-?: T[K] };       // xoá ?
type OptionalAll<T> = { [K in keyof T]?: T[K] };        // thêm ?

// Toggle readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// Key remapping với `as`
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// { getId: () => string; getAge: () => number }

// Filter key bằng `as` + conditional
type StringFields<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface Mixed { id: string; age: number; name: string; }
type Strings = StringFields<Mixed>; // { id: string; name: string }
```

### Đáp án mẫu

> "`type Nullable<T> = { [K in keyof T]: T[K] | null }` — mapped type iterate qua keys của T và union từng value type với null. `RemoveNullable<T> = { [K in keyof T]: NonNullable<T[K]> }` — dùng built-in NonNullable để strip null/undefined. Mapped type còn 3 trick nâng cao em dùng: `-?` để **xoá** optional (Required built-in dùng cái này), `as` để **remap key** — ví dụ tạo `Getters<T>` với key `get` + capitalize, và `as ... extends ... ? K : never` để **filter key theo điều kiện**. Cái cuối cùng cực hữu ích khi muốn lấy ra subset key có shape nào đó."

---

## Câu 3: Template Literal Type `[Intermediate]`

### Câu hỏi

> ```typescript
> type Event = `on${Capitalize<'click' | 'hover'>}`;
> ```
>
> Type này resolve ra gì? Em đã dùng template literal type cho việc gì?

### Giải thích lý thuyết

TS 4.1+ hỗ trợ template literal trong type position. Kết hợp với utility intrinsic (`Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`) tạo nhiều type pattern.

Tính chất:
- **Distribute** qua union.
- Có thể `infer` từ template để parse.

### Code minh hoạ

```typescript
// Resolve
type Event = `on${Capitalize<"click" | "hover">}`;
// = `on${'Click'}` | `on${'Hover'}`
// = "onClick" | "onHover"

// CSS property generator
type CSSProperty = "margin" | "padding";
type Side = "Top" | "Right" | "Bottom" | "Left";
type CSSWithSide = `${CSSProperty}${Side}`; // 8 combinations

// Path joining
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;
type Path = Join<"user", "name">; // "user.name"

// Parse với infer
type ParseInt<S extends string> = S extends `${infer N extends number}` ? N : never;
type N = ParseInt<"42">; // 42 (literal type)

// Dot path → nested key access
type DotPath<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? DotPath<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

interface State { user: { profile: { name: string } } }
type Name = DotPath<State, "user.profile.name">; // string

// Use case: i18n type-safe
const translations = { "user.greeting": "Xin chào", "user.farewell": "Tạm biệt" };
type Key = keyof typeof translations;

function t(key: Key) { return translations[key]; }
t("user.greeting");   // ✅
// t("user.unknown");  // ❌ Type error
```

### Đáp án mẫu

> "Resolve ra `'onClick' | 'onHover'` — `Capitalize` viết hoa chữ đầu của mỗi nhánh union, rồi template literal compose lại. Em dùng template literal type cho 3 việc: **CSS property generator** — tạo `marginTop | marginRight | ...` từ base + side; **i18n key type-safe** — derive union type từ keys của translation object để `t(key)` chỉ chấp nhận key tồn tại; và **dot-path access** — viết `DotPath<State, 'user.profile.name'>` parse string thành chain key lookup, type chính xác cho lib như zustand selector. Trick cốt lõi là dùng `infer` trong template để parse string thành nhiều phần."

---

## Câu 4: `keyof`, `typeof`, `in` — phân biệt `[Intermediate]`

### Câu hỏi

> Cả 3 đều là keyword TS. Khi nào dùng cái nào? Cho ví dụ.

### Giải thích lý thuyết

- **`keyof T`**: type-level — lấy union các key của T.
- **`typeof value`**: type-level (khi dùng trong type position) — lấy type của một value runtime.
- **`in`** trong mapped type — iterate union để tạo mapped type. Khác với `in` runtime (check property exist).

### Code minh hoạ

```typescript
// keyof — lấy union keys
interface User { id: string; name: string; age: number; }
type UserKey = keyof User; // "id" | "name" | "age"

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// typeof — chuyển value sang type
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
} as const;

type Config = typeof config;
// { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000 }

type Url = typeof config.apiUrl; // "https://api.example.com"

// Combine: typeof + keyof
type ConfigKey = keyof typeof config; // "apiUrl" | "timeout"

// `as const` array → union via index access
const STATUSES = ["loading", "success", "error"] as const;
type Status = typeof STATUSES[number]; // "loading" | "success" | "error"

// `in` trong mapped type — iterate union
type Flags<K extends string> = { [P in K]: boolean };
type UserFlags = Flags<"isAdmin" | "isActive">;
// { isAdmin: boolean; isActive: boolean }

// `in` runtime (khác cú pháp) — check property
function hasName(o: object): o is { name: string } {
  return "name" in o;
}
```

### Đáp án mẫu

> "Cả 3 cùng là TS keyword nhưng vai trò khác hẳn. **`keyof T`** trả về union các key của T — `keyof User` ra `'id' | 'name' | 'age'`. Em dùng cho generic constraint hoặc dynamic property access. **`typeof value`** trong type position lấy type của một runtime value — đặc biệt mạnh với `as const`. Em hay dùng pattern `typeof config[number]` để derive union từ array. **`in`** trong mapped type là iterate `[P in K]` — tạo object type từ union of keys. Đừng nhầm với `in` runtime (`'name' in obj`) — cùng từ khoá nhưng nghĩa khác. Trick em hay dùng: `keyof typeof obj` combo — vừa lấy keys vừa từ runtime object."

---

## Câu 5: Builder utility type — `DeepPartial<T>` `[Senior]`

### Câu hỏi

> Viết `DeepPartial<T>` để dùng cho mock data trong test — tất cả field nested đều optional.

### Giải thích lý thuyết

Built-in `Partial<T>` chỉ shallow. Cần đệ quy, đồng thời lưu ý:

- Primitive (string, number) trả nguyên (không có "partial" cho primitive).
- Array: optional array hay array các DeepPartial?
- Function, Date, Map: trả nguyên — không "đệ quy".

### Code minh hoạ

```typescript
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type DeepPartial<T> = T extends Primitive
  ? T
  : T extends Function
  ? T
  : T extends Date
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends Map<infer K, infer V>
  ? Map<DeepPartial<K>, DeepPartial<V>>
  : T extends Set<infer U>
  ? Set<DeepPartial<U>>
  : { [K in keyof T]?: DeepPartial<T[K]> };

// Test
interface User {
  id: string;
  profile: {
    name: string;
    address: { city: string; zip: string };
  };
  tags: string[];
  createdAt: Date;
}

const mock: DeepPartial<User> = {
  profile: {
    name: "An",        // OK — không cần address
    // address: { city: "HN" } cũng OK — city OK, không cần zip
  },
  // id, tags, createdAt đều optional
};

// Tương tự cho test mock factory
function buildUser(overrides: DeepPartial<User> = {}): User {
  return mergeDeep(defaultUser, overrides);
}

const u = buildUser({ profile: { name: "An" } });

// Khi production cần required ngược lại
type DeepRequired<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? Array<DeepRequired<U>>
  : { [K in keyof T]-?: DeepRequired<T[K]> };
```

### Đáp án mẫu

> "Cách đơn giản: `type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }` — recursion. Nhưng phiên bản này gây vấn đề với Date, Function, Map — chúng sẽ bị 'đệ quy' thành object với mọi method optional. Phiên bản production em viết kèm các check: primitive trả nguyên, Function/Date trả nguyên, Array recurse vào element type, Map/Set tương tự. Use case chính của em là **test mock factory** — `buildUser({ profile: { name: 'An' } })` chỉ override field cần test, không phải khai báo full object. Pattern tương tự: `DeepReadonly`, `DeepRequired`, `DeepNonNullable` — cùng nguyên lý chỉ khác transform."

---

## Câu 6: `satisfies` operator (TS 4.9+) — khi nào dùng? `[Senior]`

### Câu hỏi

> Em có nghe về `satisfies` trong TS 4.9 chưa? So sánh với type annotation và `as` thường.

### Giải thích lý thuyết

3 cách "gắn type":

| Cách                | Hành vi                                                          |
| ------------------- | ---------------------------------------------------------------- |
| Annotation `: T`    | Force value tuân T, **mất** literal type chính xác                |
| Assertion `as T`    | Override type-check (unsafe), không validate value               |
| `satisfies T`       | **Validate** value match T, nhưng **giữ** literal type chi tiết  |

### Code minh hoạ

```typescript
type Color = "red" | "green" | "blue";

// 1. Annotation — mất literal
const palette: Record<string, Color> = {
  primary: "red",
  secondary: "green",
};
// palette.primary type là Color, không phải "red"
palette.unknown; // OK (Record<string, ...>)

// 2. Assertion — unsafe
const wrong = {
  primary: "purple", // ❌ Lý ra phải báo lỗi
} as Record<string, Color>; // assert qua, không validate

// 3. satisfies — validate + giữ literal
const palette2 = {
  primary: "red",
  secondary: "green",
} satisfies Record<string, Color>;

// palette2.primary type vẫn là literal "red", không phải Color
const p: "red" = palette2.primary; // ✅

// Lỗi sai value
const palette3 = {
  primary: "purple", // ❌ Type 'purple' not assignable to Color
} satisfies Record<string, Color>;

// Lỗi key thì không bắt với Record<string, ...> vì key string OK
// Muốn force tên cụ thể:
const palette4 = {
  primary: "red",
  secondary: "green",
} satisfies Record<"primary" | "secondary", Color>;

// Use case: config object
const routes = {
  home: { path: "/", title: "Home" },
  user: { path: "/user/:id", title: "User" },
} satisfies Record<string, { path: string; title: string }>;

routes.home.title; // type "Home" (literal!) — không phải string

// Use case: function returning specific shape
function getButton() {
  return {
    variant: "primary",
    size: "md",
  } satisfies { variant: "primary" | "secondary"; size: "sm" | "md" | "lg" };
}
const btn = getButton();
btn.variant; // "primary" literal — không phải "primary" | "secondary"
```

### Đáp án mẫu

> "`satisfies` là 'best of both worlds'. Annotation `:T` validate value nhưng widen type — mất literal info. `as T` giữ thông tin nhưng unsafe — TS không check value có thực sự match T không. `satisfies` thì validate value PHẢI match T (compile error nếu sai), nhưng **giữ literal type** chi tiết. Em dùng `satisfies` cho 3 use case: config object có shape biết trước nhưng muốn auto-complete chính xác từng key (route table, theme palette); enum-like dùng `as const` kết hợp `satisfies` để vừa giữ literal vừa validate; và return type của factory function khi cần caller biết literal cụ thể. Quy tắc của em: nếu thấy mình viết `as` để 'fix type', thử `satisfies` trước — thường safer."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                                |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| "`Partial<T>` đệ quy"                                  | Chỉ shallow — phải tự viết `DeepPartial` cho nested                    |
| "`as` và `satisfies` đều validate"                     | `as` skip check, `satisfies` validate                                  |
| "Template literal type không recurse được"             | Có thể dùng `infer` recurse pattern (parse path, split string...)      |
| "`keyof T` cho object có index signature trả empty"    | Không — trả `string`/`number`/`symbol` tuỳ index signature             |
| "Mapped type không xoá modifier được"                  | Dùng `-?` và `-readonly` để xoá                                         |
