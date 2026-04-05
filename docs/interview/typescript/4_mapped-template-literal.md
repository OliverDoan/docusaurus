---
sidebar_position: 4
title: "Mapped Types & Template Literal Types"
---

# Mapped Types & Template Literal Types

Mapped types va template literal types la hai tinh nang nang cao cho phep ban tao ra type moi tu type co san mot cach co he thong. Day la nhom cau hoi thuong xuat hien o level Senior va giup phan biet ung vien hieu sau ve type system.

---

## Cau 1: Mapped types hoat dong nhu the nao? `[Senior]`

### Giai thich ly thuyet

**Mapped types** cho phep ban tao type moi bang cach **lap qua tung key** cua mot type co san va bien doi tung property. Cu phap: `{ [K in keyof T]: NewType }`.

Nghi don gian: mapped types giong nhu `Array.map()` nhung cho types -- ban lap qua tung property va tao ra property moi.

### Code vi du

```typescript
// === MAPPED TYPE CO BAN ===
interface User {
  id: number;
  name: string;
  email: string;
}

// Bien tat ca property thanh optional
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type OptionalUser = Optional<User>;
// { id?: number; name?: string; email?: string }

// Bien tat ca property thanh readonly
type Immutable<T> = {
  readonly [K in keyof T]: T[K];
};

type ImmutableUser = Immutable<User>;
// { readonly id: number; readonly name: string; readonly email: string }

// Bien tat ca property thanh nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; email: string | null }

// === BIEN DOI VALUE TYPE ===

// Wrap moi property trong Promise
type Async<T> = {
  [K in keyof T]: Promise<T[K]>;
};

type AsyncUser = Async<User>;
// {
//   id: Promise<number>;
//   name: Promise<string>;
//   email: Promise<string>;
// }

// Bien tat ca property thanh getter function
type Getters<T> = {
  [K in keyof T]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   id: () => number;
//   name: () => string;
//   email: () => string;
// }

// === MAPPED TYPE VOI CONDITIONAL ===
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type UserStringFields = StringKeysOnly<User>;
// { name: string; email: string }
// id bi loai vi number khong extends string
```

### Dap an mau

> "Mapped types tao type moi bang cach iterate qua keys cua type co san dung cu phap [K in keyof T]. Co the them/loai modifiers nhu optional (?) va readonly, hoac bien doi value type. Ket hop voi conditional types va key remapping, mapped types cho phep bien doi type rat linh hoat -- vi du loc chi lay string properties, wrap values trong Promise, hoac tao getter/setter types."

---

## Cau 2: Modifiers trong mapped types: +readonly, -optional `[Senior]`

### Giai thich ly thuyet

Mapped types co the **them (+)** hoac **loai bo (-)** hai modifiers:
- **`readonly`** / **`-readonly`**: Them hoac loai bo readonly
- **`?`** / **`-?`**: Them hoac loai bo optional

Dau `+` la mac dinh nen thuong bo qua. Dau `-` la phan quan trong -- no cho phep **loai bo** modifier da co.

### Code vi du

```typescript
interface Config {
  readonly host: string;
  readonly port: number;
  readonly debug?: boolean;
}

// === LOAI BO READONLY ===
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type MutableConfig = Mutable<Config>;
// { host: string; port: number; debug?: boolean }
// readonly da bi loai, optional van giu

// === LOAI BO OPTIONAL ===
type Concrete<T> = {
  [K in keyof T]-?: T[K];
};

type ConcreteConfig = Concrete<Config>;
// { readonly host: string; readonly port: number; readonly debug: boolean }
// optional da bi loai, readonly van giu

// === LOAI BO CA HAI ===
type MutableRequired<T> = {
  -readonly [K in keyof T]-?: T[K];
};

type FullConfig = MutableRequired<Config>;
// { host: string; port: number; debug: boolean }
// Ca readonly lan optional deu bi loai

// === THEM CA HAI ===
type ReadonlyOptional<T> = {
  +readonly [K in keyof T]+?: T[K];
};

type LockedConfig = ReadonlyOptional<Config>;
// { readonly host?: string; readonly port?: number; readonly debug?: boolean }

// === THUC TE: FORM STATE ===
interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

// Form state: tat ca field la optional (chua dien het)
// va mutable (nguoi dung dang nhap lieu)
type FormState<T> = {
  -readonly [K in keyof T]+?: T[K];
};

type LoginFormState = FormState<FormData>;
// { username?: string; password?: string; rememberMe?: boolean }

// Form errors: moi field co the co error message
type FormErrors<T> = {
  [K in keyof T]?: string;
};

type LoginFormErrors = FormErrors<FormData>;
// { username?: string; password?: string; rememberMe?: string }
```

### Dap an mau

> "Mapped types ho tro hai modifiers: readonly va optional (?). Dung dau + de them (mac dinh) va dau - de loai bo. Vi du -readonly loai bo readonly modifier, -? loai bo optional modifier. Day la co che ma Required va Readonly built-in types su dung. Trong thuc te, toi dung pattern nay cho form state -- FormData type la readonly va required, nhung FormState can mutable va optional de theo doi input chua hoan thanh."

---

## Cau 3: Template literal types `[Senior]`

### Giai thich ly thuyet

**Template literal types** cho phep ban tao string literal types moi bang cach **noi cac type lai** dung template string syntax. Giong template literals trong JavaScript (`Hello ${name}`), nhung o type level.

Khi ket hop voi union types, template literal types tu dong tao ra **tat ca to hop** co the.

### Code vi du

```typescript
// === TEMPLATE LITERAL CO BAN ===
type Greeting = `Hello, ${string}`;

const a: Greeting = "Hello, World";  // OK
const b: Greeting = "Hello, Thuan";  // OK
// const c: Greeting = "Hi, World";  // Error: khong bat dau bang "Hello, "

// === KET HOP VOI UNION -- TAO TO HOP ===
type Color = "red" | "green" | "blue";
type Size = "small" | "medium" | "large";

type ColorSize = `${Color}-${Size}`;
// "red-small" | "red-medium" | "red-large"
// | "green-small" | "green-medium" | "green-large"
// | "blue-small" | "blue-medium" | "blue-large"
// 9 to hop tu dong!

// === CSS UNITS ===
type CSSUnit = "px" | "rem" | "em" | "vh" | "vw" | "%";
type CSSValue = `${number}${CSSUnit}`;

const padding: CSSValue = "16px";    // OK
const margin: CSSValue = "1.5rem";   // OK
// const wrong: CSSValue = "16";     // Error: thieu unit

// === EVENT NAMES ===
type DomEvent = "click" | "focus" | "blur" | "change";
type EventHandler = `on${Capitalize<DomEvent>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange"

// === INTRINSIC STRING MANIPULATION TYPES ===
type Upper = Uppercase<"hello">;     // "HELLO"
type Lower = Lowercase<"HELLO">;     // "hello"
type Cap = Capitalize<"hello">;      // "Hello"
type Uncap = Uncapitalize<"Hello">;  // "hello"

// === THUC TE: API ENDPOINTS ===
type Resource = "users" | "posts" | "comments";
type Method = "get" | "create" | "update" | "delete";

type ApiMethod = `${Method}${Capitalize<Resource>}`;
// "getUsers" | "getPosts" | "getComments"
// | "createUsers" | "createPosts" | "createComments"
// | "updateUsers" | "updatePosts" | "updateComments"
// | "deleteUsers" | "deletePosts" | "deleteComments"

// === THUC TE: DOT NOTATION PATH ===
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

### Dap an mau

> "Template literal types dung backtick syntax o type level de tao string types moi tu cac type khac. Khi ket hop voi union, chung tu dong tao tat ca to hop -- vi du Color x Size tao ra 9 string literals. TypeScript con cung cap 4 intrinsic types: Uppercase, Lowercase, Capitalize, Uncapitalize de bien doi string types. Trong thuc te, toi dung template literals de type-safe event names, API method names, va dot-notation paths cho config objects."

---

## Cau 4: Key remapping voi `as` trong mapped types `[Senior]`

### Giai thich ly thuyet

Tu TypeScript 4.1, ban co the **doi ten key** trong mapped types dung tu khoa `as`. Cu phap: `[K in keyof T as NewKey]`. Ket hop voi template literal types, day la cong cu cuc ky manh de tao getters, setters, event handlers tu type co san.

### Code vi du

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// === TAO GETTERS ===
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getEmail: () => string;
// }

// === TAO SETTERS ===
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

// === LOC KEYS BANG AS + NEVER ===
// Chi giu cac property co type la string
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type UserStrings = StringProps<User>;
// { name: string; email: string }
// age bi loai vi number khong extends string

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

// === THUC TE: FORM VALIDATION ===
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

### Dap an mau

> "Key remapping dung as trong mapped types de doi ten hoac loc keys. Ket hop voi template literal types va Capitalize, ta co the tu dong tao getters, setters, event handlers, validators tu mot interface goc. Dung as + never de loc bo keys -- tuong tu filter. Day la pattern cuc ky huu ich khi xay dung type-safe wrappers cho forms, state management, hoac API clients."

---

## Cau 5: Recursive types `[Senior]`

### Giai thich ly thuyet

TypeScript cho phep **type tham chieu chinh no** (recursive types). Dieu nay cho phep bieu dien cac cau truc du lieu co do sau khong co dinh nhu trees, nested objects, hay JSON.

Luu y: TypeScript co gioi han do sau de-quy (thay doi theo version), nen can can than voi recursive types qua sau.

### Code vi du

```typescript
// === RECURSIVE TYPE CO BAN: JSON ===
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

// Partial thuong chi lam optional 1 cap
type ShallowPartialConfig = Partial<Config>;
// { database?: { host: string; port: number; credentials: {...} }; ... }
// Van phai truyen FULL database object neu co database key

// DeepPartial lam optional O MOI CAP
type DeepPartialConfig = DeepPartial<Config>;
// { database?: { host?: string; port?: number; credentials?: { username?: string; password?: string } } }

const partialConfig: DeepPartialConfig = {
  database: {
    port: 5433, // Chi update port, khong can truyen full object
  },
};

// === DEEP READONLY ===
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type FrozenConfig = DeepReadonly<Config>;
// Tat ca properties o moi cap deu readonly

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

### Dap an mau

> "Recursive types la types tham chieu chinh minh, cho phep bieu dien cau truc du lieu co do sau khong co dinh. Ung dung pho bien nhat la DeepPartial va DeepReadonly -- bien doi modifier o moi cap cua nested object. Ngoai ra con dung cho JSON type, tree structures, va dot-notation paths. Can luu y TypeScript co gioi han recursion depth, nen voi cau truc qua sau co the can phai dat dieu kien dung."

---

## Cau 6: Real-world use cases: API response typing va form validation `[Senior]`

### Giai thich ly thuyet

Tat ca cac khai niem mapped types, template literals, va recursive types deu huong toi mot muc tieu: **type safety trong code thuc te**. Cau nay kiem tra kha nang ap dung ly thuyet vao bai toan that.

### Code vi du

```typescript
// === USE CASE 1: TYPE-SAFE API CLIENT ===

// Dinh nghia API schema
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

// Dinh nghia form field types
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Tu dong tao validation rules type
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

// Su dung
const loginRules: ValidationRules<LoginForm> = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // min: 5, // Error! email la string, khong phai number
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 100,
    validate: (value) =>
      /[A-Z]/.test(value) ? null : "Can it nhat 1 chu hoa",
  },
  rememberMe: {
    required: false,
    // minLength: 3, // Error! boolean khong co minLength
  },
};

// Tu dong tao form state types
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

// Type-safe get voi path
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

### Dap an mau

> "Mapped types va template literals cho phep xay dung type-safe systems hoat dong o quy mo lon. Voi API client, ta co the dinh nghia schema mot lan va TypeScript se enforce dung params, query, body cho moi endpoint. Voi form validation, mapped types tu dong tao validation rules phu hop voi tung field type -- string co minLength, number co min/max. Va voi state management, template literal types + recursive types cho phep type-safe selectors dung dot notation. Day la nhung patterns toi dung hang ngay trong production."

---

## Loi thuong gap khi tra loi

1. **Khong phan biet duoc `keyof T` va `keyof typeof obj`**: `keyof T` dung khi T la mot type/interface. `keyof typeof obj` dung khi ban muon lay keys tu mot runtime value.

2. **Quen `string & K` khi dung template literal trong mapped types**: `keyof T` co the tra ve `string | number | symbol`, nhung template literal chi nhan string. Can filter bang `string & K` hoac `K extends string`.

3. **Viet recursive type qua phuc tap**: Trong interview, hay bat dau tu truong hop don gian (1 cap) roi mo rong ra recursive. Dung nhay thang vao 5-cap nested type.

4. **Khong biet modifier removal syntax**: `-readonly` va `-?` la cu phap dac biet cua mapped types. Nhieu nguoi chi biet them modifier ma khong biet cach loai bo.

5. **Nham distributive behavior cua conditional types trong mapped types**: Trong `[K in keyof T]: T[K] extends object ? ... : ...`, conditional type khong distribute vi T[K] khong phai naked type parameter. Hieu ro dieu nay giup tranh bug.

6. **Khong cho duoc vi du thuc te**: Ly thuyet mapped types thi hau nhu ai cung thuoc, nhung interviewer muon nghe ban ap dung vao bai toan cu the. Luon chuan bi 2-3 use cases that.
