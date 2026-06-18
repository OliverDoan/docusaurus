---
sidebar_position: 6
title: "6. Nâng cao (bổ sung)"
---

# Nâng cao (bổ sung)

> *Tổng hợp các câu hỏi phỏng vấn TypeScript nâng cao bổ sung — bao gồm utility types chuyên sâu, tích hợp với React, decorators, function overloads và tối ưu hiệu năng type checking.*

---

## Câu 1: `Exclude` và `Extract` là gì? `[Intermediate]`

### Câu hỏi

> `Exclude` và `Extract` trong TypeScript dùng để làm gì? Phân biệt hai utility type này và cho ví dụ thực tế.

### Giải thích lý thuyết

`Exclude<T, U>` và `Extract<T, U>` là hai utility types đối lập nhau, hoạt động trên union types:

| Utility type | Định nghĩa | Kết quả |
|---|---|---|
| `Exclude<T, U>` | Loại bỏ các thành viên của `T` mà có thể gán cho `U` | Phần còn lại sau khi trừ |
| `Extract<T, U>` | Giữ lại các thành viên của `T` mà có thể gán cho `U` | Phần giao nhau |

Cả hai đều được implement bằng conditional types phân phối (distributive conditional types):

- `Exclude<T, U>` tương đương: `T extends U ? never : T`
- `Extract<T, U>` tương đương: `T extends U ? T : never`

### Code minh hoạ

```typescript
type Status = "pending" | "active" | "inactive" | "deleted";

// Exclude: loại bỏ các trạng thái "nguy hiểm"
type SafeStatus = Exclude<Status, "deleted" | "inactive">;
// Kết quả: "pending" | "active"

// Extract: chỉ lấy các trạng thái hợp lệ
type ActiveStatus = Extract<Status, "active" | "pending">;
// Kết quả: "active" | "pending"

// Ứng dụng thực tế: lọc union type theo điều kiện
type Primitive = string | number | boolean | null | undefined;
type NonNullPrimitive = Exclude<Primitive, null | undefined>;
// Kết quả: string | number | boolean

// Kết hợp với keyof để lọc thuộc tính
interface User {
  id: number;
  name: string;
  password: string;
  email: string;
}

type PublicKeys = Exclude<keyof User, "password">;
// Kết quả: "id" | "name" | "email"

type PublicUser = Pick<User, PublicKeys>;
// Kết quả: { id: number; name: string; email: string }

// Extract với function types
type FunctionMembers = Extract<string | number | (() => void), Function>;
// Kết quả: () => void
```

### Đáp án mẫu

> `Exclude<T, U>` **loại bỏ** các thành viên của union `T` có thể gán cho `U`; `Extract<T, U>` **giữ lại** các thành viên đó. Chúng là công cụ mạnh để lọc union types, thường kết hợp với `keyof` để tạo các kiểu dẫn xuất an toàn.

---

## Câu 2: TypeScript với React: cách type events (sự kiện) là gì? `[Intermediate]`

### Câu hỏi

> Khi viết event handlers trong React + TypeScript, cần type như thế nào? Các loại event phổ biến sử dụng kiểu gì?

### Giải thích lý thuyết

React định nghĩa các event types trong namespace `React`, mỗi event handler nhận một `SyntheticEvent` đặc thù cho từng loại element. Các kiểu quan trọng:

| Event | Kiểu TypeScript |
|---|---|
| Input change | `React.ChangeEvent<HTMLInputElement>` |
| Form submit | `React.FormEvent<HTMLFormElement>` |
| Button click | `React.MouseEvent<HTMLButtonElement>` |
| Keyboard | `React.KeyboardEvent<HTMLInputElement>` |
| Drag & Drop | `React.DragEvent<HTMLDivElement>` |
| Focus | `React.FocusEvent<HTMLInputElement>` |

Có hai cách khai báo: inline (TypeScript tự suy luận) hoặc tách ra thành named handler (cần khai báo tường minh).

### Code minh hoạ

```typescript
import React, { useState } from "react";

// Cách 1: Inline handler — TypeScript tự suy luận kiểu
function InlineExample() {
  const [value, setValue] = useState("");

  return (
    <input
      onChange={(e) => setValue(e.target.value)}
      // e được suy luận là React.ChangeEvent<HTMLInputElement>
    />
  );
}

// Cách 2: Named handler — cần khai báo tường minh
function NamedHandlerExample() {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted:", value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Enter pressed");
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Clicked at:", e.clientX, e.clientY);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" onClick={handleClick}>
        Submit
      </button>
    </form>
  );
}

// Ứng dụng: generic event handler tái sử dụng
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

function createInputHandler(setter: (value: string) => void): InputChangeHandler {
  return (e) => setter(e.target.value);
}

function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form>
      <input onChange={createInputHandler(setName)} placeholder="Name" />
      <input onChange={createInputHandler(setEmail)} placeholder="Email" />
    </form>
  );
}
```

### Đáp án mẫu

> Dùng `React.ChangeEvent<HTMLInputElement>` cho input, `React.FormEvent<HTMLFormElement>` cho form submit, `React.MouseEvent<HTMLButtonElement>` cho click. Với inline handlers TypeScript tự suy luận; với named handlers cần khai báo tường minh để tránh lỗi kiểu.

---

## Câu 3: Path aliases trong TypeScript (cấu hình `paths`) là gì? `[Basic]`

### Câu hỏi

> Path aliases trong TypeScript là gì? Cách cấu hình `paths` trong `tsconfig.json` và tại sao nên dùng?

### Giải thích lý thuyết

Path aliases cho phép thay thế các import đường dẫn tương đối dài bằng các alias ngắn gọn. Thay vì viết `../../../components/Button`, có thể viết `@/components/Button`.

Cấu hình gồm hai phần:
1. `baseUrl`: thư mục gốc để resolve các path không tương đối
2. `paths`: mapping từ alias pattern sang đường dẫn thực

**Lưu ý quan trọng**: `tsconfig.json` chỉ xử lý type checking — bundler (Vite, Webpack, Next.js) cần được cấu hình riêng để resolve alias lúc runtime.

### Code minh hoạ

```typescript
// tsconfig.json
// {
//   "compilerOptions": {
//     "baseUrl": ".",
//     "paths": {
//       "@/*": ["src/*"],
//       "@components/*": ["src/components/*"],
//       "@utils/*": ["src/utils/*"],
//       "@hooks/*": ["src/hooks/*"],
//       "@types/*": ["src/types/*"]
//     }
//   }
// }

// Trước khi dùng path aliases (khó đọc):
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../../utils/date";
import { useAuth } from "../../../hooks/useAuth";

// Sau khi dùng path aliases (rõ ràng):
import { Button } from "@components/ui/Button";
import { formatDate } from "@utils/date";
import { useAuth } from "@hooks/useAuth";

// Cấu hình cho Vite (vite.config.ts):
// import { defineConfig } from 'vite'
// import path from 'path'
//
// export default defineConfig({
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//       '@components': path.resolve(__dirname, './src/components'),
//       '@utils': path.resolve(__dirname, './src/utils'),
//     }
//   }
// })

// Cấu hình cho Next.js (next.config.js) — tự động đọc từ tsconfig.json
// module.exports = {
//   experimental: { appDir: true }
// }
// Next.js hỗ trợ path aliases từ tsconfig tự động

// Ví dụ file thực tế sử dụng aliases
// src/pages/Dashboard.tsx
import { UserCard } from "@components/UserCard";
import { useCurrentUser } from "@hooks/useCurrentUser";
import type { User } from "@types/user";

function Dashboard() {
  const user: User = useCurrentUser();
  return <UserCard user={user} />;
}
```

### Đáp án mẫu

> Path aliases được cấu hình qua `baseUrl` và `paths` trong `tsconfig.json`, giúp thay thế import đường dẫn dài bằng alias ngắn như `@/components`. Cần cấu hình thêm phía bundler (Vite, Webpack) để resolve alias lúc runtime vì TypeScript chỉ xử lý type checking.

---

## Câu 4: Decorators trong TypeScript là gì? `[Advanced]`

### Câu hỏi

> Decorators trong TypeScript là gì? Các loại decorator khác nhau và cách sử dụng chúng?

### Giải thích lý thuyết

Decorators là cú pháp `@expression` dùng để annotate hoặc modify các class, method, property, accessor, hoặc parameter. Chúng là higher-order functions được gọi tại thời điểm khai báo (không phải runtime của từng lần gọi).

TypeScript hỗ trợ **5 loại decorator**:

| Loại | Áp dụng lên | Tham số nhận |
|---|---|---|
| Class decorator | Class | `constructor` |
| Method decorator | Method | `target`, `propertyKey`, `descriptor` |
| Property decorator | Property | `target`, `propertyKey` |
| Accessor decorator | Getter/Setter | `target`, `propertyKey`, `descriptor` |
| Parameter decorator | Tham số hàm | `target`, `propertyKey`, `parameterIndex` |

Cần bật `"experimentalDecorators": true` trong `tsconfig.json`.

### Code minh hoạ

```typescript
// tsconfig.json: "experimentalDecorators": true

// 1. Class Decorator — thêm metadata hoặc modify class
function Singleton<T extends { new (...args: unknown[]): object }>(
  constructor: T
) {
  let instance: InstanceType<T>;
  return class extends constructor {
    constructor(...args: unknown[]) {
      if (instance) return instance;
      super(...args);
      instance = this as InstanceType<T>;
    }
  } as T;
}

@Singleton
class DatabaseConnection {
  connect() {
    console.log("Connected to DB");
  }
}

const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
console.log(db1 === db2); // true — cùng một instance

// 2. Method Decorator — bọc logic xung quanh method
function Log(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = original.apply(this, args);
    console.log(`${propertyKey} returned`, result);
    return result;
  };
  return descriptor;
}

function Memoize(
  _target: object,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const cache = new Map<string, unknown>();
  const original = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
  return descriptor;
}

class MathService {
  @Log
  @Memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

// 3. Property Decorator — validate hoặc transform property
function MinLength(min: number) {
  return function (target: object, propertyKey: string) {
    let value: string;
    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newValue: string) => {
        if (newValue.length < min) {
          throw new Error(
            `${propertyKey} must be at least ${min} characters`
          );
        }
        value = newValue;
      },
    });
  };
}

class User {
  @MinLength(3)
  name: string = "";
}

const user = new User();
user.name = "Al"; // Throws: name must be at least 3 characters
```

### Đáp án mẫu

> Decorators là higher-order functions dùng cú pháp `@expression` để annotate/modify class, method, property, hoặc parameter tại thời điểm khai báo. Cần bật `experimentalDecorators` trong tsconfig. Thường dùng để implement cross-cutting concerns như logging, caching, validation mà không làm ô nhiễm business logic.

---

## Câu 5: Decorator metadata và `reflect-metadata` là gì? `[Advanced]`

### Câu hỏi

> `reflect-metadata` là gì? Cách kết hợp với decorators để lưu trữ và truy xuất metadata?

### Giải thích lý thuyết

`reflect-metadata` là một polyfill cho Reflect Metadata API — cho phép đính kèm metadata vào các class, method, property thông qua decorators và sau đó truy xuất chúng lúc runtime.

Cần bật `"emitDecoratorMetadata": true` trong tsconfig để TypeScript tự động emit type metadata.

Các API chính:
- `Reflect.defineMetadata(key, value, target)` — lưu metadata
- `Reflect.getMetadata(key, target)` — đọc metadata
- `Reflect.hasMetadata(key, target)` — kiểm tra tồn tại
- `"design:type"`, `"design:paramtypes"`, `"design:returntype"` — metadata tự động từ TypeScript

Đây là nền tảng của Dependency Injection frameworks như NestJS, Angular.

### Code minh hoạ

```typescript
// Cài đặt: npm install reflect-metadata
// tsconfig.json:
// "experimentalDecorators": true,
// "emitDecoratorMetadata": true

import "reflect-metadata";

// 1. Lưu và đọc metadata tùy chỉnh
const ROLES_KEY = "roles";

function Roles(...roles: string[]) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(ROLES_KEY, roles, target, propertyKey);
  };
}

class UserController {
  @Roles("admin", "moderator")
  deleteUser(id: string) {
    console.log("Deleting user", id);
  }

  @Roles("admin")
  banUser(id: string) {
    console.log("Banning user", id);
  }
}

// Đọc metadata để kiểm tra quyền
function canAccess(
  controller: object,
  methodName: string,
  userRole: string
): boolean {
  const requiredRoles = Reflect.getMetadata(
    ROLES_KEY,
    controller,
    methodName
  ) as string[] | undefined;
  if (!requiredRoles) return true;
  return requiredRoles.includes(userRole);
}

const ctrl = new UserController();
console.log(canAccess(ctrl, "deleteUser", "moderator")); // true
console.log(canAccess(ctrl, "banUser", "moderator"));    // false

// 2. TypeScript tự động emit type metadata
function LogType(target: object, propertyKey: string) {
  const type = Reflect.getMetadata("design:type", target, propertyKey);
  console.log(`${propertyKey} has type: ${(type as { name: string }).name}`);
}

class Product {
  @LogType
  name: string = ""; // Logs: "name has type: String"

  @LogType
  price: number = 0; // Logs: "price has type: Number"
}

// 3. Simple Dependency Injection container
const INJECTABLE_KEY = "injectable";

function Injectable() {
  return function (constructor: Function) {
    Reflect.defineMetadata(INJECTABLE_KEY, true, constructor);
  };
}

function Inject(token: Function) {
  return function (
    target: object,
    _propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    const existing: Record<number, Function> =
      Reflect.getMetadata("inject:params", target) || {};
    existing[parameterIndex] = token;
    Reflect.defineMetadata("inject:params", existing, target);
  };
}

@Injectable()
class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

@Injectable()
class UserService {
  constructor(@Inject(Logger) private logger: Logger) {}

  createUser(name: string) {
    this.logger.log(`Creating user: ${name}`);
  }
}
```

### Đáp án mẫu

> `reflect-metadata` là polyfill cho Reflect Metadata API, cho phép đính kèm metadata vào class/method/property qua decorators và đọc lại lúc runtime. Kết hợp `emitDecoratorMetadata: true` để TypeScript tự emit type info. Đây là nền tảng của DI frameworks như NestJS — container đọc metadata để biết cần inject dependency nào.

---

## Câu 6: Function overloads (nạp chồng hàm) trong TypeScript là gì? `[Intermediate]`

### Câu hỏi

> Function overloads trong TypeScript là gì? Cách khai báo và sử dụng, cũng như khi nào nên dùng?

### Giải thích lý thuyết

Function overloads cho phép một hàm có nhiều "chữ ký" (signatures) khác nhau — mỗi signature mô tả một cách gọi hàm với kiểu tham số và kiểu trả về khác nhau. TypeScript sẽ chọn signature phù hợp tại compile time.

Cấu trúc gồm:
1. Một hoặc nhiều **overload signatures** (không có body)
2. Một **implementation signature** (có body, phải tương thích với tất cả overloads)

Caller chỉ thấy overload signatures, không thấy implementation signature.

### Code minh hoạ

```typescript
// Ví dụ 1: Hàm xử lý input đa dạng
function processInput(input: string): string;
function processInput(input: number): number;
function processInput(input: string[]): string[];
// Implementation signature — phải bao phủ tất cả cases trên
function processInput(input: string | number | string[]): string | number | string[] {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  if (typeof input === "number") {
    return input * 2;
  }
  return input.map((s) => s.toUpperCase());
}

const a = processInput("hello");   // TypeScript biết: string
const b = processInput(42);        // TypeScript biết: number
const c = processInput(["a", "b"]); // TypeScript biết: string[]

// Ví dụ 2: Hàm tạo element với overload theo tag name
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: "button"): HTMLButtonElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const div = createElement("div");      // kiểu: HTMLDivElement
const input = createElement("input");  // kiểu: HTMLInputElement

// Ví dụ 3: Overload với optional params
function formatDate(date: Date): string;
function formatDate(date: Date, format: "short" | "long"): string;
function formatDate(timestamp: number): string;
function formatDate(
  dateOrTimestamp: Date | number,
  format: "short" | "long" = "short"
): string {
  const date =
    typeof dateOrTimestamp === "number"
      ? new Date(dateOrTimestamp)
      : dateOrTimestamp;

  if (format === "long") {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("vi-VN");
}

// Khi NÊN dùng overloads vs union types
// Union types: khi kiểu trả về không phụ thuộc vào kiểu tham số
function echo(input: string | number): string | number {
  return input;
}

// Overloads: khi kiểu trả về PHỤ THUỘC vào kiểu tham số
function parse(input: string): number;
function parse(input: number): string;
function parse(input: string | number): number | string {
  return typeof input === "string" ? parseInt(input) : input.toString();
}

const num = parse("42");   // TypeScript biết: number (không phải string | number)
const str = parse(42);     // TypeScript biết: string
```

### Đáp án mẫu

> Function overloads cho phép khai báo nhiều signatures cho cùng một hàm, giúp TypeScript suy luận kiểu trả về chính xác dựa trên kiểu tham số. Nên dùng khi kiểu trả về phụ thuộc vào kiểu tham số (thay vì union type). Implementation signature là internal và không visible với caller.

---

## Câu 7: TypeScript với React: generics trong components là gì? `[Advanced]`

### Câu hỏi

> Cách sử dụng generics trong React components với TypeScript? Cho ví dụ về generic components thực tế.

### Giải thích lý thuyết

Generic components là components có thể làm việc với nhiều kiểu dữ liệu khác nhau mà vẫn đảm bảo type safety. Thay vì dùng `any` hoặc viết nhiều components tương tự, generic cho phép tạo một component tái sử dụng.

Cú pháp trong `.tsx` cần thêm constraint hoặc dùng `function` keyword thay vì arrow function để TypeScript không nhầm `<T>` với JSX tag.

### Code minh hoạ

```typescript
import React, { useState } from "react";

// 1. Generic List component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

// Dùng `function` keyword hoặc thêm constraint để tránh nhầm với JSX
function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = "Không có dữ liệu",
}: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Sử dụng với User
interface User {
  id: number;
  name: string;
  email: string;
}

function UserList({ users }: { users: User[] }) {
  return (
    <List
      items={users}
      keyExtractor={(user) => String(user.id)}
      renderItem={(user) => (
        <span>
          {user.name} — {user.email}
        </span>
      )}
    />
  );
}

// 2. Generic Select/Dropdown component
interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  placeholder?: string;
}

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Chọn một giá trị",
}: SelectProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = options.find((opt) => getValue(opt) === e.target.value);
    if (selected !== undefined) {
      onChange(selected);
    }
  };

  return (
    <select
      value={value !== null ? getValue(value) : ""}
      onChange={handleChange}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

// Sử dụng
interface Country {
  code: string;
  name: string;
}

function CountrySelect() {
  const [selected, setSelected] = useState<Country | null>(null);
  const countries: Country[] = [
    { code: "VN", name: "Việt Nam" },
    { code: "US", name: "Hoa Kỳ" },
  ];

  return (
    <Select
      options={countries}
      value={selected}
      onChange={setSelected}
      getLabel={(c) => c.name}
      getValue={(c) => c.code}
    />
  );
}

// 3. Generic Hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore =
      value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}

// Sử dụng với type safety đầy đủ
function Settings() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">(
    "theme",
    "light"
  );
  return (
    <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
      Chủ đề: {theme}
    </button>
  );
}
```

### Đáp án mẫu

> Generic components trong React+TypeScript cho phép viết components tái sử dụng với type safety đầy đủ. Dùng `function` keyword thay vì arrow function trong `.tsx` để tránh nhầm lẫn với JSX. Kết hợp với generic hooks tạo ra hệ thống abstraction mạnh mẽ mà không mất type inference.

---

## Câu 8: Discriminated unions vs class hierarchy — khi nào dùng cái nào? `[Advanced]`

### Câu hỏi

> So sánh discriminated unions và class hierarchy trong TypeScript. Khi nào nên dùng cách nào?

### Giải thích lý thuyết

Đây là hai cách tiếp cận khác nhau để mô hình hóa dữ liệu có nhiều biến thể:

| Tiêu chí | Discriminated Unions | Class Hierarchy |
|---|---|---|
| Mô hình | Kiểu dữ liệu (algebraic data types) | Đối tượng hướng OOP |
| Thêm biến thể mới | Dễ (thêm vào union) | Trung bình (thêm subclass) |
| Thêm operation mới | Khó (cập nhật tất cả switch) | Dễ (thêm method vào subclass) |
| Immutability | Tự nhiên | Cần nỗ lực thêm |
| Serialization | Đơn giản (plain object) | Phức tạp (mất methods) |
| Pattern matching | Xuất sắc (exhaustive checks) | Kém (cần instanceof) |
| Khi nên dùng | Data-heavy, functional style | Behavior-heavy, OOP style |

Nguyên tắc **Expression Problem**: Discriminated unions dễ thêm operation; class hierarchy dễ thêm kiểu mới.

### Code minh hoạ

```typescript
// === DISCRIMINATED UNIONS ===
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Triangle = {
  kind: "triangle";
  base: number;
  height: number;
};

type Shape = Circle | Rectangle | Triangle;

// Thêm operation mới: dễ dàng
function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    // TypeScript cảnh báo nếu thiếu case (exhaustive check)
  }
}

function getPerimeter(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return 2 * Math.PI * shape.radius;
    case "rectangle":
      return 2 * (shape.width + shape.height);
    case "triangle":
      // Simplified
      return shape.base + shape.height * 2;
  }
}

// Serialization đơn giản
const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
];
const json = JSON.stringify(shapes); // Hoạt động hoàn hảo
const restored: Shape[] = JSON.parse(json) as Shape[]; // Restore dễ dàng

// === CLASS HIERARCHY ===
abstract class ShapeClass {
  abstract getArea(): number;
  abstract getPerimeter(): number;

  // Behavior dùng chung
  describe(): string {
    return `Shape with area ${this.getArea().toFixed(2)}`;
  }
}

class CircleClass extends ShapeClass {
  constructor(public readonly radius: number) {
    super();
  }
  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
  getPerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
  // Thêm behavior riêng dễ dàng
  getDiameter(): number {
    return this.radius * 2;
  }
}

class RectangleClass extends ShapeClass {
  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    super();
  }
  getArea(): number {
    return this.width * this.height;
  }
  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }
  isSquare(): boolean {
    return this.width === this.height;
  }
}

// Thêm kiểu mới: chỉ cần thêm class mới, không đụng code cũ
class EllipseClass extends ShapeClass {
  constructor(
    public readonly semiMajor: number,
    public readonly semiMinor: number
  ) {
    super();
  }
  getArea(): number {
    return Math.PI * this.semiMajor * this.semiMinor;
  }
  getPerimeter(): number {
    // Ramanujan approximation
    const h =
      ((this.semiMajor - this.semiMinor) ** 2) /
      (this.semiMajor + this.semiMinor) ** 2;
    return Math.PI * (this.semiMajor + this.semiMinor) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }
}

// Khi nào dùng cái nào?
// Discriminated unions: API responses, state management, Redux actions
type ApiResult<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

// Class hierarchy: khi cần behavior phức tạp, inheritance, DI
abstract class Repository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<T>;

  async findOrThrow(id: string): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) throw new Error(`Entity ${id} not found`);
    return entity;
  }
}
```

### Đáp án mẫu

> Dùng **discriminated unions** cho data-centric modeling (API responses, state, Redux actions) khi cần immutability và pattern matching mạnh. Dùng **class hierarchy** khi cần behavior phức tạp, kế thừa method, hoặc thêm kiểu mới thường xuyên. Trong TypeScript hiện đại, discriminated unions thường được ưu tiên vì tự nhiên hơn với functional style và serialization dễ hơn.

---

## Câu 9: TypeScript performance: tại sao type checking có thể chậm và cách cải thiện? `[Advanced]`

### Câu hỏi

> Tại sao TypeScript type checking có thể trở nên chậm trong các dự án lớn? Các kỹ thuật nào giúp cải thiện hiệu năng?

### Giải thích lý thuyết

TypeScript type checking có thể chậm do nhiều nguyên nhân:

| Nguyên nhân | Giải thích |
|---|---|
| Deep recursive types | Conditional types và mapped types lồng nhau sâu |
| Large union types | Union có hàng chục members làm tăng complexity |
| `infer` chains | Nhiều `infer` trong nested conditionals |
| Re-exporting nhiều | Barrel files (`index.ts`) import tất cả |
| `any` lan rộng | `any` tắt checking nhưng tạo overhead khác |
| Thiếu type annotations | TypeScript phải suy luận nhiều hơn |
| `.d.ts` không được cache | Không dùng `skipLibCheck` |

Công cụ chẩn đoán: `tsc --extendedDiagnostics` và `--generateTrace`.

### Code minh hoạ

```typescript
// === VẤN ĐỀ: Deep recursive types ===
// Chậm: lồng nhau quá sâu
type DeepReadonly<T> = T extends (infer U)[]
  ? DeepReadonlyArray<U>
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;
type DeepReadonlyObject<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Giải pháp: giới hạn độ sâu hoặc dùng thư viện (type-fest)
// import type { ReadonlyDeep } from 'type-fest'

// === VẤN ĐỀ: Large union types ===
// Chậm: union quá lớn
type AllColors =
  | "red" | "blue" | "green" | "yellow" | "orange"
  | "purple" | "pink" | "brown" | "black" | "white"
  | "gray" | "cyan" | "magenta" | "lime" | "indigo";
  // ... thêm 50 màu nữa

// Tốt hơn: dùng string literal với constraint
type Color = string; // Hoặc dùng enum
enum Colors {
  Red = "red",
  Blue = "blue",
  // ...
}

// === VẤN ĐỀ: Barrel files (index.ts) ===
// Chậm: re-export tất cả
// src/index.ts
// export * from './components/Button'
// export * from './components/Modal'
// export * from './components/Form'
// ... 100 exports khác

// Tốt hơn: import trực tiếp từ file nguồn
import { Button } from "./components/Button"; // Thay vì từ '../'

// === GIẢI PHÁP: tsconfig tối ưu ===
// tsconfig.json tối ưu cho performance:
// {
//   "compilerOptions": {
//     "skipLibCheck": true,          // Bỏ qua check .d.ts của node_modules
//     "incremental": true,           // Cache build incremental
//     "tsBuildInfoFile": ".tsbuildinfo",
//     "isolatedModules": true,       // Mỗi file compile độc lập (Babel/esbuild)
//     "strict": true,
//     "noUnusedLocals": false,       // Tắt khi dev để tăng tốc
//     "noUnusedParameters": false
//   },
//   "include": ["src"],
//   "exclude": ["node_modules", "dist", "**/*.test.ts"]
// }

// === GIẢI PHÁP: Explicit type annotations ===
// Chậm: TypeScript suy luận kiểu phức tạp
const processItems = (items: unknown[]) =>
  items
    .filter((item) => typeof item === "string")
    .map((item) => (item as string).toUpperCase())
    .reduce((acc, item) => ({ ...acc, [item]: item.length }), {});
// TypeScript phải suy luận kiểu trả về phức tạp

// Nhanh hơn: khai báo tường minh kiểu trả về
const processItemsFast = (items: unknown[]): Record<string, number> =>
  items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.toUpperCase())
    .reduce(
      (acc, item) => ({ ...acc, [item]: item.length }),
      {} as Record<string, number>
    );

// === GIẢI PHÁP: Project references ===
// Chia dự án lớn thành các sub-projects với tsconfig riêng
// packages/core/tsconfig.json: { "compilerOptions": { "composite": true } }
// packages/ui/tsconfig.json:   { "references": [{ "path": "../core" }] }
// Root tsconfig.json:          { "references": [{ "path": "packages/core" }, { "path": "packages/ui" }] }
// Chạy: tsc --build (chỉ rebuild phần thay đổi)

// === CHẨN ĐOÁN: Tìm file/type gây chậm ===
// Terminal commands:
// tsc --extendedDiagnostics        # Xem thống kê chi tiết
// tsc --generateTrace ./trace-dir  # Tạo trace để phân tích trong Chrome DevTools
// npx @typescript/analyze-trace ./trace-dir  # Phân tích trace
```

### Đáp án mẫu

> TypeScript type checking chậm thường do: recursive types quá sâu, union types lớn, barrel files import nhiều, và thiếu type annotations tường minh. Giải pháp: bật `skipLibCheck` và `incremental` trong tsconfig, tránh barrel files, thêm return type annotations cho hàm phức tạp, và dùng project references cho monorepo. Dùng `tsc --extendedDiagnostics` để chẩn đoán bottleneck.

---
