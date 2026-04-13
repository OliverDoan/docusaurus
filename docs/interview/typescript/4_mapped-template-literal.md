---
sidebar_position: 4
title: "4. Mapped Types title: "Mapped Types & Template Literal Types" Template Literal Types"
---

# Mapped Types & Template Literal Types

Mapped types và template literal types là hai tính năng nâng cao cho phép bạn tạo ra type mới từ type có sẵn một cách có hệ thống. Đây là nhóm câu hỏi thường xuất hiện ở level Senior và giúp phân biệt ứng viên hiểu sâu về type system.

---

## Câu 1: Mapped types hoạt động như thế nào? `[Senior]`

### Giải thích lý thuyết

**Mapped types** cho phép bạn tạo type mới bằng cách **lặp qua từng key** của một type có sẵn và biến đổi từng property. Cú pháp: `{ [K in keyof T]: NewType }`.

Nghĩ đơn giản: mapped types giống như `Array.map()` nhưng cho types -- bạn lặp qua từng property và tạo ra property mới.

### Code ví dụ

```typescript
// === MAPPED TYPE CƠ BẢN ===
interface User {
  id: number;
  name: string;
  email: string;
}

// Biến tất cả property thành optional
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type OptionalUser = Optional<User>;
// { id?: number; name?: string; email?: string }

// Biến tất cả property thành readonly
type Immutable<T> = {
  readonly [K in keyof T]: T[K];
};

type ImmutableUser = Immutable<User>;
// { readonly id: number; readonly name: string; readonly email: string }

// Biến tất cả property thành nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; email: string | null }

// === BIẾN ĐỔI VALUE TYPE ===

// Wrap mỗi property trong Promise
type Async<T> = {
  [K in keyof T]: Promise<T[K]>;
};

type AsyncUser = Async<User>;
// {
//   id: Promise<number>;
//   name: Promise<string>;
//   email: Promise<string>;
// }

// Biến tất cả property thành getter function
type Getters<T> = {
  [K in keyof T]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   id: () => number;
//   name: () => string;
//   email: () => string;
// }

// === MAPPED TYPE VỚI CONDITIONAL ===
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type UserStringFields = StringKeysOnly<User>;
// { name: string; email: string }
// id bị loại vì number không extends string
```

### Đáp án mẫu

> "Mapped types tạo type mới bằng cách iterate qua keys của type có sẵn dùng cú pháp [K in keyof T]. Có thể thêm/loại modifiers như optional (?) và readonly, hoặc biến đổi value type. Kết hợp với conditional types và key remapping, mapped types cho phép biến đổi type rất linh hoạt -- ví dụ lọc chỉ lấy string properties, wrap values trong Promise, hoặc tạo getter/setter types."

---

## Câu 2: Modifiers trong mapped types: +readonly, -optional `[Senior]`

### Giải thích lý thuyết

Mapped types có thể **thêm (+)** hoặc **loại bỏ (-)** hai modifiers:
- **`readonly`** / **`-readonly`**: Thêm hoặc loại bỏ readonly
- **`?`** / **`-?`**: Thêm hoặc loại bỏ optional

Dấu `+` là mặc định nên thường bỏ qua. Dấu `-` là phần quan trọng -- nó cho phép **loại bỏ** modifier đã có.

### Code ví dụ

```typescript
interface Config {
  readonly host: string;
  readonly port: number;
  readonly debug?: boolean;
}

// === LOẠI BỎ READONLY ===
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type MutableConfig = Mutable<Config>;
// { host: string; port: number; debug?: boolean }
// readonly đã bị loại, optional vẫn giữ

// === LOẠI BỎ OPTIONAL ===
type Concrete<T> = {
  [K in keyof T]-?: T[K];
};

type ConcreteConfig = Concrete<Config>;
// { readonly host: string; readonly port: number; readonly debug: boolean }
// optional đã bị loại, readonly vẫn giữ

// === LOẠI BỎ CẢ HAI ===
type MutableRequired<T> = {
  -readonly [K in keyof T]-?: T[K];
};

type FullConfig = MutableRequired<Config>;
// { host: string; port: number; debug: boolean }
// Cả readonly lẫn optional đều bị loại

// === THÊM CẢ HAI ===
type ReadonlyOptional<T> = {
  +readonly [K in keyof T]+?: T[K];
};

type LockedConfig = ReadonlyOptional<Config>;
// { readonly host?: string; readonly port?: number; readonly debug?: boolean }

// === THỰC TẾ: FORM STATE ===
interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

// Form state: tất cả field là optional (chưa điền hết)
// và mutable (người dùng đang nhập liệu)
type FormState<T> = {
  -readonly [K in keyof T]+?: T[K];
};

type LoginFormState = FormState<FormData>;
// { username?: string; password?: string; rememberMe?: boolean }

// Form errors: mỗi field có thể có error message
type FormErrors<T> = {
  [K in keyof T]?: string;
};

type LoginFormErrors = FormErrors<FormData>;
// { username?: string; password?: string; rememberMe?: string }
```

### Đáp án mẫu

> "Mapped types hỗ trợ hai modifiers: readonly và optional (?). Dùng dấu + để thêm (mặc định) và dấu - để loại bỏ. Ví dụ -readonly loại bỏ readonly modifier, -? loại bỏ optional modifier. Đây là cơ chế mà Required và Readonly built-in types sử dụng. Trong thực tế, tôi dùng pattern này cho form state -- FormData type là readonly và required, nhưng FormState cần mutable và optional để theo dõi input chưa hoàn thành."

---

## Câu 3: Template literal types `[Senior]`

### Giải thích lý thuyết

**Template literal types** cho phép bạn tạo string literal types mới bằng cách **nối các type lại** dùng template string syntax. Giống template literals trong JavaScript (`Hello ${name}`), nhưng ở type level.

Khi kết hợp với union types, template literal types tự động tạo ra **tất cả tổ hợp** có thể.

### Code ví dụ

```typescript
// === TEMPLATE LITERAL CƠ BẢN ===
type Greeting = `Hello, ${string}`;

const a: Greeting = "Hello, World";  // OK
const b: Greeting = "Hello, Thuan";  // OK
// const c: Greeting = "Hi, World";  // Error: không bắt đầu bằng "Hello, "

// === KẾT HỢP VỚI UNION -- TẠO TỔ HỢP ===
type Color = "red" | "green" | "blue";
type Size = "small" | "medium" | "large";

type ColorSize = `${Color}-${Size}`;
// "red-small" | "red-medium" | "red-large"
// | "green-small" | "green-medium" | "green-large"
// | "blue-small" | "blue-medium" | "blue-large"
// 9 tổ hợp tự động!

// === CSS UNITS ===
type CSSUnit = "px" | "rem" | "em" | "vh" | "vw" | "%";
type CSSValue = `${number}${CSSUnit}`;

const padding: CSSValue = "16px";    // OK
const margin: CSSValue = "1.5rem";   // OK
// const wrong: CSSValue = "16";     // Error: thiếu unit

// === EVENT NAMES ===
type DomEvent = "click" | "focus" | "blur" | "change";
type EventHandler = `on${Capitalize<DomEvent>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange"

// === INTRINSIC STRING MANIPULATION TYPES ===
type Upper = Uppercase<"hello">;     // "HELLO"
type Lower = Lowercase<"HELLO">;     // "hello"
type Cap = Capitalize<"hello">;      // "Hello"
type Uncap = Uncapitalize<"Hello">;  // "hello"

// === THỰC TẾ: API ENDPOINTS ===
type Resource = "users" | "posts" | "comments";
type Method = "get" | "create" | "update" | "delete";

type ApiMethod = `${Method}${Capitalize<Resource>}`;
// "getUsers" | "getPosts" | "getComments"
// | "createUsers" | "createPosts" | "createComments"
// | "updateUsers" | "updatePosts" | "updateComments"
// | "deleteUsers" | "deletePosts" | "deleteComments"

// === THỰC TẾ: DOT NOTATION PATH ===
type NestedKeys<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? NestedKeys<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

interface Settings {
  theme: {
    color: string;
    fontSize: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

type SettingPaths = NestedKeys<Settings>;
// "theme.color" | "theme.fontSize" | "notifications.email" | "notifications.push"
```

### Đáp án mẫu

> "Template literal types dùng backtick syntax ở type level để tạo string types mới từ các type khác. Khi kết hợp với union, chúng tự động tạo tất cả tổ hợp -- ví dụ Color x Size tạo ra 9 string literals. TypeScript còn cung cấp 4 intrinsic types: Uppercase, Lowercase, Capitalize, Uncapitalize để biến đổi string types. Trong thực tế, tôi dùng template literals để type-safe event names, API method names, và dot-notation paths cho config objects."

---

## Câu 4: Key remapping với `as` trong mapped types `[Senior]`

### Giải thích lý thuyết

Từ TypeScript 4.1, bạn có thể **đổi tên key** trong mapped types dùng từ khóa `as`. Cú pháp: `[K in keyof T as NewKey]`. Kết hợp với template literal types, đây là công cụ cực kỳ mạnh để tạo getters, setters, event handlers từ type có sẵn.

### Code ví dụ

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// === TẠO GETTERS ===
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getEmail: () => string;
// }

// === TẠO SETTERS ===
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type UserSetters = Setters<User>;
// {
//   setName: (value: string) => void;
//   setAge: (value: number) => void;
//   setEmail: (value: string) => void;
// }

// === EVENT HANDLERS ===
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    newValue: T[K],
    oldValue: T[K]
  ) => void;
};

type UserEventHandlers = EventHandlers<User>;
// {
//   onNameChange: (newValue: string, oldValue: string) => void;
//   onAgeChange: (newValue: number, oldValue: number) => void;
//   onEmailChange: (newValue: string, oldValue: string) => void;
// }

// === LỌC KEYS BẰNG AS + NEVER ===
// Chỉ giữ các property có type là string
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type UserStrings = StringProps<User>;
// { name: string; email: string }
// age bị loại vì number không extends string

// === REMOVE PREFIX ===
type RemovePrefix<
  T,
  Prefix extends string
> = {
  [K in keyof T as K extends `${Prefix}${infer Rest}` ? Uncapitalize<Rest> : K]: T[K];
};

interface ApiUser {
  userName: string;
  userAge: number;
  userEmail: string;
}

type CleanUser = RemovePrefix<ApiUser, "user">;
// { name: string; age: number; email: string }

// === THỰC TẾ: FORM VALIDATION ===
type FormValidators<T> = {
  [K in keyof T as `validate${Capitalize<string & K>}`]: (
    value: T[K]
  ) => string | null;
};

interface RegisterForm {
  username: string;
  password: string;
  email: string;
}

type RegisterValidators = FormValidators<RegisterForm>;
// {
//   validateUsername: (value: string) => string | null;
//   validatePassword: (value: string) => string | null;
//   validateEmail: (value: string) => string | null;
// }
```

### Đáp án mẫu

> "Key remapping dùng as trong mapped types để đổi tên hoặc lọc keys. Kết hợp với template literal types và Capitalize, ta có thể tự động tạo getters, setters, event handlers, validators từ một interface gốc. Dùng as + never để lọc bỏ keys -- tương tự filter. Đây là pattern cực kỳ hữu ích khi xây dựng type-safe wrappers cho forms, state management, hoặc API clients."

---

## Câu 5: Recursive types `[Senior]`

### Giải thích lý thuyết

TypeScript cho phép **type tham chiếu chính nó** (recursive types). Điều này cho phép biểu diễn các cấu trúc dữ liệu có độ sâu không cố định như trees, nested objects, hay JSON.

Lưu ý: TypeScript có giới hạn độ sâu đệ quy (thay đổi theo version), nên cần cẩn thận với recursive types quá sâu.

### Code ví dụ

```typescript
// === RECURSIVE TYPE CƠ BẢN: JSON ===
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const validJson: JsonValue = {
  name: "Thuan",
  age: 28,
  skills: ["TypeScript", "React"],
  address: {
    city: "HCMC",
    country: "Vietnam",
  },
};

// === DEEP PARTIAL ===
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  logging: {
    level: string;
    format: string;
  };
}

// Partial thường chỉ làm optional 1 cấp
type ShallowPartialConfig = Partial<Config>;
// { database?: { host: string; port: number; credentials: {...} }; ... }
// Vẫn phải truyền FULL database object nếu có database key

// DeepPartial làm optional Ở MỌI CẤP
type DeepPartialConfig = DeepPartial<Config>;
// { database?: { host?: string; port?: number; credentials?: { username?: string; password?: string } } }

const partialConfig: DeepPartialConfig = {
  database: {
    port: 5433, // Chỉ update port, không cần truyền full object
  },
};

// === DEEP READONLY ===
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type FrozenConfig = DeepReadonly<Config>;
// Tất cả properties ở mọi cấp đều readonly

// === TREE STRUCTURE ===
type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};

const fileTree: TreeNode<string> = {
  value: "root",
  children: [
    {
      value: "src",
      children: [
        { value: "index.ts", children: [] },
        { value: "utils.ts", children: [] },
      ],
    },
    {
      value: "package.json",
      children: [],
    },
  ],
};

// === LINKED LIST ===
type LinkedList<T> = {
  value: T;
  next: LinkedList<T> | null;
};

const list: LinkedList<number> = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: null,
    },
  },
};

// === DOT NOTATION ACCESS ===
type PathsOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]:
        | `${Prefix}${K}`
        | PathsOf<T[K], `${Prefix}${K}.`>;
    }[keyof T & string]
  : never;

type ConfigPaths = PathsOf<Config>;
// "database" | "database.host" | "database.port"
// | "database.credentials" | "database.credentials.username"
// | "database.credentials.password" | "logging" | "logging.level"
// | "logging.format"
```

### Đáp án mẫu

> "Recursive types là types tham chiếu chính mình, cho phép biểu diễn cấu trúc dữ liệu có độ sâu không cố định. Ứng dụng phổ biến nhất là DeepPartial và DeepReadonly -- biến đổi modifier ở mọi cấp của nested object. Ngoài ra còn dùng cho JSON type, tree structures, và dot-notation paths. Cần lưu ý TypeScript có giới hạn recursion depth, nên với cấu trúc quá sâu có thể cần phải đặt điều kiện dừng."

---

## Câu 6: Real-world use cases: API response typing và form validation `[Senior]`

### Giải thích lý thuyết

Tất cả các khái niệm mapped types, template literals, và recursive types đều hướng tới một mục tiêu: **type safety trong code thực tế**. Câu này kiểm tra khả năng áp dụng lý thuyết vào bài toán thật.

### Code ví dụ

```typescript
// === USE CASE 1: TYPE-SAFE API CLIENT ===

// Định nghĩa API schema
interface ApiSchema {
  "/users": {
    GET: { response: User[]; query: { page: number; limit: number } };
    POST: { response: User; body: CreateUserDto };
  };
  "/users/:id": {
    GET: { response: User; params: { id: string } };
    PUT: { response: User; params: { id: string }; body: UpdateUserDto };
    DELETE: { response: void; params: { id: string } };
  };
  "/posts": {
    GET: { response: Post[]; query: { authorId?: string } };
  };
}

// Type-safe fetch wrapper
type ApiClient = {
  [Path in keyof ApiSchema]: {
    [Method in keyof ApiSchema[Path]]: ApiSchema[Path][Method] extends {
      response: infer R;
      params?: infer P;
      query?: infer Q;
      body?: infer B;
    }
      ? (
          options: (P extends undefined ? {} : { params: P }) &
            (Q extends undefined ? {} : { query: Q }) &
            (B extends undefined ? {} : { body: B })
        ) => Promise<R>
      : never;
  };
};

// === USE CASE 2: FORM VALIDATION SYSTEM ===

// Định nghĩa form field types
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Tự động tạo validation rules type
type ValidationRules<T> = {
  [K in keyof T]: {
    required?: boolean;
    validate?: (value: T[K]) => string | null;
    minLength?: T[K] extends string ? number : never;
    maxLength?: T[K] extends string ? number : never;
    min?: T[K] extends number ? number : never;
    max?: T[K] extends number ? number : never;
    pattern?: T[K] extends string ? RegExp : never;
  };
};

// Sử dụng
const loginRules: ValidationRules<LoginForm> = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // min: 5, // Error! email là string, không phải number
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 100,
    validate: (value) =>
      /[A-Z]/.test(value) ? null : "Cần ít nhất 1 chữ hoa",
  },
  rememberMe: {
    required: false,
    // minLength: 3, // Error! boolean không có minLength
  },
};

// Tự động tạo form state types
type FormState<T> = {
  values: Partial<T>;
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isSubmitting: boolean;
};

// === USE CASE 3: TYPE-SAFE STORE (REDUX-LIKE) ===

interface StoreState {
  user: {
    profile: User | null;
    preferences: { theme: "light" | "dark"; language: string };
  };
  cart: {
    items: CartItem[];
    total: number;
  };
}

// Type-safe selector
type DeepPaths<T, P extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${P}${K}` | DeepPaths<T[K], `${P}${K}.`>
        : `${P}${K}`;
    }[keyof T & string]
  : never;

type StatePaths = DeepPaths<StoreState>;
// "user" | "user.profile" | "user.preferences" | "user.preferences.theme" | ...

// Type-safe get với path
type GetByPath<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? GetByPath<T[Key], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

type ThemeType = GetByPath<StoreState, "user.preferences.theme">;
// "light" | "dark"

type CartItems = GetByPath<StoreState, "cart.items">;
// CartItem[]
```

### Đáp án mẫu

> "Mapped types và template literals cho phép xây dựng type-safe systems hoạt động ở quy mô lớn. Với API client, ta có thể định nghĩa schema một lần và TypeScript sẽ enforce đúng params, query, body cho mỗi endpoint. Với form validation, mapped types tự động tạo validation rules phù hợp với từng field type -- string có minLength, number có min/max. Và với state management, template literal types + recursive types cho phép type-safe selectors dùng dot notation. Đây là những patterns tôi dùng hàng ngày trong production."

---

## Lỗi thường gặp khi trả lời

1. **Không phân biệt được `keyof T` và `keyof typeof obj`**: `keyof T` dùng khi T là một type/interface. `keyof typeof obj` dùng khi bạn muốn lấy keys từ một runtime value.

2. **Quên `string & K` khi dùng template literal trong mapped types**: `keyof T` có thể trả về `string | number | symbol`, nhưng template literal chỉ nhận string. Cần filter bằng `string & K` hoặc `K extends string`.

3. **Viết recursive type quá phức tạp**: Trong interview, hãy bắt đầu từ trường hợp đơn giản (1 cấp) rồi mở rộng ra recursive. Đừng nhảy thẳng vào 5-cấp nested type.

4. **Không biết modifier removal syntax**: `-readonly` và `-?` là cú pháp đặc biệt của mapped types. Nhiều người chỉ biết thêm modifier mà không biết cách loại bỏ.

5. **Nhầm distributive behavior của conditional types trong mapped types**: Trong `[K in keyof T]: T[K] extends object ? ... : ...`, conditional type không distribute vì T[K] không phải naked type parameter. Hiểu rõ điều này giúp tránh bug.

6. **Không cho được ví dụ thực tế**: Lý thuyết mapped types thì hầu như ai cũng thuộc, nhưng interviewer muốn nghe bạn áp dụng vào bài toán cụ thể. Luôn chuẩn bị 2-3 use cases thật.
