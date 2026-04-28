---
sidebar_position: 1
title: "1. Câu hỏi phỏng vấn TypeScript"
---

# Câu hỏi phỏng vấn TypeScript

---

## Mục lục

- [Phần 1: Basic & Fundamentals](#phần-1-basic--fundamentals)
- [Phần 2: Types & Type System](#phần-2-types--type-system)
- [Phần 3: Generics & Advanced Types](#phần-3-generics--advanced-types)
- [Phần 4: OOP & Architecture](#phần-4-oop--architecture)
- [Phần 5: Practical & Real-world](#phần-5-practical--real-world)

---

## Phần 1: Basic & Fundamentals

### Câu 1: TypeScript là gì và nó giải quyết vấn đề gì?

**Đáp án:**
TypeScript là siêu tập của JavaScript (superset) - tất cả code JavaScript hợp lệ đều là TypeScript hợp lệ. Nó thêm tính năng **static typing** (kiểu dữ liệu tĩnh) và **compile-time error checking** (kiểm tra lỗi tại thời gian biên dịch).

**Vấn đề giải quyết:**
- ❌ JavaScript: `const user = { name: 'Alice' }; user.age` → không lỗi cho đến runtime
- ✅ TypeScript: Phát hiện lỗi ngay lập tức tại editor

**Lợi ích:**
1. Early error detection (phát hiện sai lầm sớm)
2. Better IDE support (autocomplete, refactoring)
3. Self-documenting code (code tự giải thích)
4. Easier refactoring (tái cấu trúc an toàn)
5. Scalability (dễ maintain khi dự án lớn)

---

### Câu 2: Các kiểu dữ liệu nguyên thủy (primitive types) trong TypeScript là gì?

**Đáp án:**

TypeScript hỗ trợ các kiểu nguyên thủy sau:

```typescript
// Number
const age: number = 25;
const pi: number = 3.14;

// String
const name: string = "Alice";
const message: string = `Hello ${name}`;

// Boolean
const isActive: boolean = true;

// Undefined
const x: undefined = undefined;

// Null
const y: null = null;

// Symbol
const sym: symbol = Symbol('id');

// BigInt
const bigNumber: bigint = 123n;
```

**Khác biệt với JavaScript:**
- TypeScript **compile-time** kiểm tra kiểu
- JavaScript chỉ kiểm tra **runtime**

---

### Câu 3: Sự khác nhau giữa var, let và const trong TypeScript là gì?

**Đáp án:**

| Điểm | var | let | const |
|-----|-----|-----|-------|
| **Scope** | Function-scoped | Block-scoped | Block-scoped |
| **Hoisting** | Hoisted (undefined) | Hoisted (TDZ) | Hoisted (TDZ) |
| **Reassign** | ✅ Yes | ✅ Yes | ❌ No |
| **Best Practice** | ❌ Avoid | ✅ Use | ✅ Prefer |

**Ví dụ:**

```typescript
// ❌ var - function scope
function example() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 (leaked to function scope!)
}

// ✅ let - block scope
function example2() {
  if (true) {
    let y = 2;
  }
  console.log(y); // Error: y not defined
}

// ✅ const - block scope, immutable
const user = { name: 'Alice' };
user.name = 'Bob'; // OK (object mutable)
user = {}; // Error: cannot reassign
```

**Best Practice:** LUÔN dùng `const`, sau đó `let` nếu cần reassign, tránh `var`.

---

### Câu 4: Void là gì, và khi nào sử dụng kiểu void?

**Đáp án:**

`void` là kiểu cho hàm **không trả về giá trị** hoặc biến **chỉ có thể là undefined**.

```typescript
// Hàm không return gì
function log(message: string): void {
  console.log(message);
}

// Biến void (hiếm khi dùng)
const x: void = undefined;
const y: void = null; // OK nếu strictNullChecks = false

// Callback không cần return
const handlers: Array<() => void> = [
  () => console.log('Handler 1'),
  () => console.log('Handler 2')
];
```

**Khác với `undefined`:**
```typescript
// ❌ undefined - biến có kiểu undefined
const x: undefined = undefined;

// ✅ void - hàm không return
function log(): void {
  console.log('No return');
}
```

---

### Câu 5: TypeScript hoạt động như thế nào?

**Đáp án:**

TypeScript dùng **compilation step** (bước biên dịch):

```
TypeScript Code (.ts)
      ↓
TypeScript Compiler (tsc)
      ↓
Type Checking (validate types)
      ↓
JavaScript Code (.js)
      ↓
JavaScript Runtime
```

**Quy trình:**
1. **Parsing**: Parse code thành AST (Abstract Syntax Tree)
2. **Type Checking**: Validate types (không ghi trực tiếp)
3. **Transpilation**: Convert sang JavaScript (xóa type annotations)
4. **Output**: Ghi .js file, ready để chạy

**Ví dụ:**

```typescript
// TypeScript input (input.ts)
const name: string = "Alice";
const age: number = 25;
console.log(name);

// JavaScript output (input.js) — type annotations bị xóa
const name = "Alice";
const age = 25;
console.log(name);
```

**Quan trọng:** TypeScript **không kiểm tra kiểu ở runtime**, chỉ ở compile time!

---

## Phần 2: Types & Type System

### Câu 6: Interface trong TypeScript là gì?

**Đáp án:**

`interface` định nghĩa **hợp đồng** (contract) cho đối tượng - mô tả cấu trúc và kiểu dữ liệu.

```typescript
// Định nghĩa interface
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // optional
}

// Sử dụng interface
const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
  // age không bắt buộc
};

// Implement interface trong class
class UserService implements User {
  id = 1;
  name = 'Alice';
  email = 'alice@example.com';
}
```

**Interface vs Type:**

```typescript
// Interface - dùng cho objects
interface Animal {
  name: string;
  eat(): void;
}

// Type - dùng cho unions, primitives, tuples
type ID = string | number;
type Point = [number, number];

// Interface có thể extend
interface Dog extends Animal {
  breed: string;
}

// Type có thể use union
type Pet = Dog | Cat;
```

---

### Câu 7: Type Assertion là gì?

**Đáp án:**

`Type Assertion` (as keyword) báo cho TypeScript biết bạn **biết chắc chắn kiểu** của giá trị hơn TypeScript.

```typescript
// Khi TypeScript suy luận sai
const value: any = 'hello';

// ❌ TypeScript không biết value là string
console.log(value.length); // Error: any không có property length

// ✅ Dùng as để assert kiểu
const str = value as string;
console.log(str.length); // OK

// Hoặc angle bracket syntax (cũ)
const str2 = <string>value;
```

**Khi nào dùng:**

```typescript
// 1. API responses (từ any sang type cụ thể)
const response = await fetch('/api/users');
const users = (await response.json()) as User[];

// 2. DOM manipulation
const input = document.querySelector('#name') as HTMLInputElement;
console.log(input.value);

// 3. Narrowing union types
type Result = { success: true; data: User } | { success: false; error: string };

function handle(result: Result) {
  if (result.success) {
    const user = result as { success: true; data: User }; // assert
    console.log(user.data.name);
  }
}
```

**⚠️ Cảnh báo:** Type Assertion **không an toàn** - TypeScript không kiểm tra! Dùng **type guards** thay vào đó.

---

### Câu 8: Type Alias là gì? Làm thế nào để tạo Type Alias?

**Đáp án:**

`Type Alias` dùng keyword `type` để tạo tên cho bất kỳ kiểu nào.

```typescript
// Primitive alias
type Age = number;
const age: Age = 25;

// Union types
type Status = 'pending' | 'success' | 'error';
const status: Status = 'pending';

// Intersection
type Admin = User & { role: 'admin' };

// Tuple
type Coordinates = [number, number];
const point: Coordinates = [10, 20];

// Function type
type Callback = (data: string) => void;
const log: Callback = (msg) => console.log(msg);

// Generic type alias
type Container<T> = {
  value: T;
  getValue(): T;
};

const numberContainer: Container<number> = {
  value: 42,
  getValue() { return this.value; }
};
```

**Interface vs Type Alias:**

| Điểm | Interface | Type Alias |
|-----|-----------|-----------|
| **Extends** | ✅ extends | ❌ Dùng & |
| **Union** | ❌ | ✅ Yes |
| **Primitives** | ❌ | ✅ Yes |
| **Declaration Merging** | ✅ | ❌ |

---

### Câu 9: Sự khác biệt giữa kiểu 'any' và 'unknown' là gì?

**Đáp án:**

| Điểm | `any` | `unknown` |
|-----|-------|---------|
| **Assignable to** | Tất cả | Không gì |
| **Property access** | ✅ Tự do | ❌ Cần type guard |
| **Type safety** | ❌ Không | ✅ Có |
| **Use case** | Escape hatch | Truly unknown |

**Ví dụ:**

```typescript
// ❌ any - bypass type checking
const x: any = 'hello';
console.log(x.length); // OK (nhưng có thể sai!)
x.nonexistent(); // OK nhưng runtime error!

// ✅ unknown - type-safe
const y: unknown = 'hello';
// console.log(y.length); // Error: unknown không có property length

// Cần type guard
if (typeof y === 'string') {
  console.log(y.length); // OK
}

// Hoặc assertion
console.log((y as string).length);
```

**Best Practice:** **LUÔN dùng `unknown`** thay vì `any`, sau đó narrow type.

---

### Câu 10: null và undefined khác gì, và cách xử lý chúng?

**Đáp án:**

| Điểm | `null` | `undefined` |
|-----|--------|-----------|
| **Ý nghĩa** | Explicit "no value" | Uninitialized/missing |
| **API default** | No value (user sets) | Default (JS returns) |
| **Typeof** | "object" | "undefined" |

```typescript
// Xử lý null & undefined
let user: User | null | undefined;

// ❌ Unsafe
console.log(user.name); // Error: user có thể null!

// ✅ Optional chaining
console.log(user?.name); // undefined nếu user null

// ✅ Nullish coalescing
const userName = user?.name ?? 'Guest'; // 'Guest' nếu name null/undefined

// ✅ Non-null assertion (cảnh báo!)
const safeName = user!.name; // Báo rằng user chắc chắn không null
```

**strictNullChecks:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true // LUÔN enable!
  }
}

// Với strictNullChecks: true
let name: string = 'Alice';
name = null; // Error: cannot assign null

let age: number | null = null; // OK
age = 25; // OK
```

---

### Câu 11: TypeScript hỗ trợ những Access modifier nào?

**Đáp án:**

TypeScript hỗ trợ 3 access modifier cho class:

```typescript
class User {
  // Public - mặc định, có thể access từ bất kỳ đâu
  public name: string = 'Alice';

  // Private - chỉ access trong class
  private password: string = 'secret';

  // Protected - access trong class + subclasses
  protected email: string = 'alice@example.com';

  getPassword() {
    return this.password; // OK
  }
}

const user = new User();
console.log(user.name); // OK
console.log(user.password); // Error: private
console.log(user.email); // Error: protected

class AdminUser extends User {
  showEmail() {
    return this.email; // OK - protected
  }
}
```

**Shorthand:**

```typescript
// Thay vì
class User {
  private id: number;
  private name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

// Viết ngắn gọn
class User {
  constructor(
    private id: number,
    private name: string
  ) {}
}
```

---

## Phần 3: Generics & Advanced Types

### Câu 12: Generic là gì và cách sử dụng chúng?

**Đáp án:**

`Generics` cho phép tạo **reusable components** với kiểu dữ liệu **flexible**.

```typescript
// Generic function
function getFirstItem<T>(items: T[]): T {
  return items[0];
}

console.log(getFirstItem([1, 2, 3])); // 1 (inferred: number)
console.log(getFirstItem(['a', 'b', 'c'])); // 'a' (inferred: string)

// Generic interface
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

const numberContainer: Container<number> = {
  value: 42,
  getValue() { return this.value; },
  setValue(v) { this.value = v; }
};

// Generic class
class Stack<T> {
  private items: T[] = [];

  push(item: T) {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push('string'); // Error: expected number
```

**Generic constraints:**

```typescript
// Constraint: T phải có property length
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength('hello'); // OK
getLength([1, 2, 3]); // OK
getLength(42); // Error: number không có length

// Extends specific type
function merge<T extends object, U extends object>(obj1: T, obj2: U) {
  return { ...obj1, ...obj2 };
}

merge({ a: 1 }, { b: 2 }); // OK
merge('string', 'number'); // Error
```

---

### Câu 13: Type inference hoạt động như thế nào trong TypeScript?

**Đáp án:**

`Type inference` = TypeScript **tự động suy luận kiểu** mà không cần explicit annotation.

```typescript
// Inferred from value
const name = 'Alice'; // type: string
const age = 25; // type: number
const active = true; // type: boolean

// Inferred from return
function add(a: number, b: number) {
  return a + b; // return type: number (inferred)
}

// Inferred in generics
const array = [1, 2, 3]; // type: number[]
const map = new Map<string, number>();
const value = map.get('key'); // type: number | undefined (inferred)

// Contextual typing
const handleClick: (event: MouseEvent) => void = (event) => {
  // event type: MouseEvent (inferred from context)
  console.log(event.clientX);
};
```

**Type widening:**

```typescript
let x = 'hello'; // type: string (widened)
let y: 'hello' = 'hello'; // type: 'hello' (literal)

const z = 'hello'; // type: 'hello' (const narrows)
```

**Type narrowing:**

```typescript
let value: string | number = 'hello';

if (typeof value === 'string') {
  // Trong block này: type: string
  console.log(value.toUpperCase());
}

// Ngoài block: type: string | number
```

---

### Câu 14: Utility Types là gì? Ví dụ về các utility types phổ biến?

**Đáp án:**

Utility types là **built-in types** giúp biến đổi types khác.

```typescript
// 1. Partial<T> - tất cả properties optional
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

const user: PartialUser = { name: 'Alice' }; // OK

// 2. Required<T> - tất cả properties required
type RequiredUser = Required<PartialUser>;
// { id: number; name: string; email: string; }

// 3. Readonly<T> - tất cả properties readonly
type ReadonlyUser = Readonly<User>;
const roUser: ReadonlyUser = { id: 1, name: 'Alice', email: 'a@a.com' };
roUser.name = 'Bob'; // Error: readonly

// 4. Pick<T, K> - chọn properties cụ thể
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// 5. Omit<T, K> - bỏ properties cụ thể
type UserWithoutEmail = Omit<User, 'email'>;
// { id: number; name: string; }

// 6. Record<K, T> - object với keys cụ thể
type Permissions = Record<'read' | 'write' | 'delete', boolean>;
// { read: boolean; write: boolean; delete: boolean; }

const perms: Permissions = {
  read: true,
  write: true,
  delete: false
};

// 7. Exclude<T, U> - remove types from union
type NotString = Exclude<string | number | boolean, string>;
// number | boolean

// 8. Extract<T, U> - chọn types từ union
type StringOrNumber = Extract<string | number | boolean, string | number>;
// string | number
```

---

### Câu 15: Conditional types là gì?

**Đáp án:**

`Conditional types` là **ternary operators cho types**.

```typescript
// Syntax: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<123>; // false

// Thực tế hơn: Flatten array
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>; // number

// Distributed conditional types
type ToArray<T> = T extends any ? T[] : never;

type StrArr = ToArray<string | number>; // string[] | number[]

// Infer keyword - extract types
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type NumReturn = GetReturnType<() => number>; // number
```

---

## Phần 4: OOP & Architecture

### Câu 16: Class trong TypeScript là gì? Cách định nghĩa và sử dụng?

**Đáp án:**

Class là blueprint cho tạo objects với properties và methods.

```typescript
class User {
  // Properties
  id: number;
  name: string;
  private email: string;

  // Constructor
  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  // Methods
  getEmail(): string {
    return this.email;
  }

  setEmail(email: string): void {
    if (email.includes('@')) {
      this.email = email;
    }
  }

  // Static method
  static create(name: string): User {
    return new User(Math.random(), name, 'default@example.com');
  }
}

// Usage
const user = new User(1, 'Alice', 'alice@example.com');
console.log(user.name); // 'Alice'
console.log(user.getEmail()); // 'alice@example.com'

const user2 = User.create('Bob'); // Static method
```

---

### Câu 17: Inheritance (kế thừa) trong TypeScript là gì?

**Đáp án:**

Inheritance cho phép class **kế thừa** properties & methods từ class khác.

```typescript
// Parent class
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak(): void {
    console.log(`${this.name} makes a sound`);
  }
}

// Child class extends parent
class Dog extends Animal {
  breed: string;

  constructor(name: string, breed: string) {
    super(name); // Call parent constructor
    this.breed = breed;
  }

  // Override parent method
  speak(): void {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Rex', 'Labrador');
dog.speak(); // 'Rex barks'
```

---

### Câu 18: Abstract class là gì? Khác với interface như thế nào?

**Đáp án:**

`Abstract class` không thể instantiate trực tiếp - phải inherit.

```typescript
// Abstract class
abstract class Shape {
  // Abstract method - child phải implement
  abstract getArea(): number;

  // Concrete method
  printArea(): void {
    console.log(`Area: ${this.getArea()}`);
  }
}

// Child must implement abstract method
class Circle extends Shape {
  radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

const circle = new Circle(5);
circle.printArea(); // 'Area: 78.5...'

const shape = new Shape(); // Error: cannot instantiate abstract
```

**Abstract vs Interface:**

| Điểm | Abstract | Interface |
|-----|----------|-----------|
| **Instantiate** | ❌ | ❌ |
| **Implementation** | ✅ Có code | ❌ Chỉ signature |
| **Inheritance** | extends (1) | implements (nhiều) |
| **Use case** | Shared behavior | Shape/contract |

---

## Phần 5: Practical & Real-world

### Câu 19: Làm thế nào để xử lý error trong TypeScript?

**Đáp án:**

```typescript
// 1. Try-catch với typing
try {
  const response = await fetch('/api/users');
  const data = await response.json();
} catch (error) {
  // error: unknown - cần type guard!
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// 2. Custom error class
class AppError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// 3. Result pattern (Better)
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

async function getUser(id: number): Promise<Result<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      return { success: false, error: new Error('Not found') };
    }
    const user = await res.json();
    return { success: true, value: user };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

// Usage
const result = await getUser(1);
if (result.success) {
  console.log(result.value.name);
} else {
  console.error(result.error.message);
}
```

---

### Câu 20: Làm thế nào để làm biến thuộc tính bất biến (immutable) trong TypeScript?

**Đáp án:**

```typescript
// 1. readonly keyword
interface User {
  readonly id: number;
  readonly name: string;
  email: string; // mutable
}

const user: User = { id: 1, name: 'Alice', email: 'a@a.com' };
user.email = 'b@b.com'; // OK
user.name = 'Bob'; // Error: readonly

// 2. Readonly<T> utility
type ReadonlyUser = Readonly<User>;
// Tất cả properties thành readonly

// 3. as const - literal types
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;

config.apiUrl = 'new'; // Error: readonly

// 4. Immutable objects
type ImmutableUser = {
  readonly [K in keyof User]: User[K];
};
```

---

### Câu 21: Làm cách nào để work với generic constraints hiệu quả?

**Đáp án:**

```typescript
// 1. Extends cụ thể type
function getString<T extends string>(value: T): T {
  return value.toUpperCase() as T;
}

// 2. Extends object
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 25 };
const name = getProperty(user, 'name'); // type: string

// 3. Multiple constraints (intersection)
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// 4. Conditional constraints
function processValue<T extends string | number>(value: T): T extends string ? number : string {
  if (typeof value === 'string') {
    return value.length as any;
  }
  return value.toString() as any;
}
```

---

### Câu 22: Decorators là gì? Cách sử dụng trong TypeScript?

**Đáp án:**

`Decorators` là **functions** gắn metadata vào classes, methods, properties.

```typescript
// Enable in tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}

// 1. Class decorator
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class User {
  name: string = 'Alice';
}

// 2. Method decorator
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(1, 2); // Logs: Calling add with [1, 2]

// 3. Property decorator
function default_value(value: any) {
  return function(target: any, key: string) {
    target[key] = value;
  };
}

class Config {
  @default_value('localhost')
  host: string;
}
```

---

### Câu 23: TypeScript trong React - best practices?

**Đáp án:**

```typescript
// 1. Typed props
interface ButtonProps {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// 2. Typed state
const [count, setCount] = useState<number>(0);

// 3. Typed useEffect
useEffect<React.EffectCallback>(() => {
  // side effect
}, []);

// 4. Custom hooks với generics
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then((json: T) => {
        setData(json);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
}

// 5. Event handlers
const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
  console.log(event.target.value);
};

// 6. useRef với generics
const inputRef = useRef<HTMLInputElement>(null);
```

---

### Câu 24: Làm thế nào để debug TypeScript?

**Đáp án:**

```typescript
// 1. Hover để xem inferred type (IDE)
const x = { name: 'Alice' }; // Hover: { name: string }

// 2. typeof để check type
type Check = typeof x; // { name: string }

// 3. never type để catch unreachable code
function exhaustiveCheck(value: never): never {
  throw new Error(`Unhandled value: ${value}`);
}

type Status = 'pending' | 'success' | 'error';

function handle(status: Status) {
  switch (status) {
    case 'pending': return 'waiting';
    case 'success': return 'done';
    case 'error': return 'failed';
    default: exhaustiveCheck(status); // Error if missing case!
  }
}

// 4. Type assertions để test
const x = 'hello' as const; // literal: 'hello'

// 5. ts-expect-error comment
// @ts-expect-error - intentional error for testing
const value: number = 'string';

// 6. Type checking utilities
type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

type Test = Equals<string, string>; // true
```

---

### Câu 25: Performance optimization trong TypeScript?

**Đáp án:**

```typescript
// 1. Tránh over-complex generics
// ❌ Chậm
type ComplexType<A, B, C, D, E, F> =
  A extends B ? C extends D ? E extends F ? A & B & C : E : D : F;

// ✅ Nhanh - break down
type Simple<T, U> = T extends U ? T & U : never;

// 2. Sử dụng satisfies (TS 4.9+)
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} satisfies Record<string, string | number>;
// Type checking nhưng không lose specific types

// 3. Incremental compilation
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}

// 4. Use skipLibCheck
{
  "compilerOptions": {
    "skipLibCheck": true // Skip type checking node_modules
  }
}

// 5. Avoid 'any'
const data: any = ...; // SLOW type checking
const data: unknown = ...; // FASTER, still type-safe
```

---

## Tổng kết

TypeScript là công cụ mạnh mẽ giúp:
- ✅ Phát hiện lỗi sớm
- ✅ Improve code quality
- ✅ Better IDE support
- ✅ Self-documenting code

**Best Practices:**
- Luôn enable `strict: true` trong tsconfig
- Dùng `const` thay vì `var`
- Dùng `unknown` thay vì `any`
- Implement type guards cho safety
- Reuse generic constraints
- Use utility types hiệu quả
