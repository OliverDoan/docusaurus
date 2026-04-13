---
sidebar_position: 1
title: "1. Type System: Union, Intersection, Literal Types"
---

# Type System: Union, Intersection, Literal Types

TypeScript type system là thứ khiến ngôn ngữ này trở nên mạnh mẽ hơn JavaScript thường rất nhiều. Trong buổi phỏng vấn, đây là nhóm câu hỏi xuất hiện thường xuyên nhất -- từ junior đến senior. Bài này sẽ giúp bạn nắm vững các khái niệm cơ bản nhất của type system và trả lời tự tin trước interviewer.

---

## Câu 1: Union types và intersection types khác nhau thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Union type** (`A | B`) có nghĩa là giá trị có thể là type A **hoặc** type B. Bạn chỉ được truy cập những property chung của cả hai type.

**Intersection type** (`A & B`) có nghĩa là giá trị phải thỏa mãn **cả** type A **và** type B cùng lúc. Bạn được truy cập tất cả property của cả hai type.

Cách nhớ đơn giản:
- Union = "hoặc" (OR) -- mở rộng tập hợp giá trị
- Intersection = "và" (AND) -- thu hẹp tập hợp giá trị (nhưng mở rộng tập hợp property)

### Code ví dụ

```typescript
// === UNION TYPE ===
type Dog = {
  name: string;
  bark: () => void;
};

type Cat = {
  name: string;
  meow: () => void;
};

// Pet có thể là Dog HOẶC Cat
type Pet = Dog | Cat;

function greetPet(pet: Pet) {
  // Chỉ truy cập được property chung: name
  console.log(pet.name); // OK

  // Không truy cập được bark() hay meow() trực tiếp
  // vì TypeScript không biết pet là Dog hay Cat
  // pet.bark(); // Error!
}

// === INTERSECTION TYPE ===
type Loggable = {
  log: () => void;
};

type Serializable = {
  serialize: () => string;
};

// LogAndSerialize phải có CẢ hai: log() VÀ serialize()
type LogAndSerialize = Loggable & Serializable;

function process(item: LogAndSerialize) {
  item.log();              // OK -- từ Loggable
  item.serialize();        // OK -- từ Serializable
}
```

### Bảng so sánh

| Tiêu chí | Union (`A \| B`) | Intersection (`A & B`) |
|----------|-----------------|----------------------|
| Ý nghĩa | A hoặc B | A và B cùng lúc |
| Tập giá trị | Mở rộng (nhiều giá trị hơn) | Thu hẹp (ít giá trị hơn) |
| Property truy cập | Chỉ property chung | Tất cả property |
| Ứng dụng thường gặp | Function nhận nhiều kiểu | Mixin, compose types |
| Tương tự logic | OR | AND |

### Đáp án mẫu

> "Union type cho phép một giá trị thuộc một trong nhiều type, giống như phép OR. Intersection type yêu cầu giá trị phải thỏa mãn tất cả type cùng lúc, giống như phép AND. Điều thú vị là union mở rộng tập hợp giá trị nhưng thu hẹp tập hợp property truy cập được, còn intersection thì ngược lại -- thu hẹp tập hợp giá trị nhưng mở rộng tập hợp property."

---

## Câu 2: Literal types và type narrowing hoạt động như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Literal types** cho phép bạn định nghĩa type là một giá trị cụ thể, không phải chỉ là kiểu dữ liệu chung chung. Ví dụ: thay vì `string`, bạn có thể chỉ định `"success"` hoặc `"error"`.

**Type narrowing** là quá trình TypeScript tự động "thu hẹp" type dựa trên các điều kiện trong code. Khi bạn check `typeof x === "string"`, TypeScript biết rằng trong block đó, `x` chắc chắn là `string`.

### Code ví dụ

```typescript
// === LITERAL TYPES ===
type Direction = "up" | "down" | "left" | "right";
type HttpStatus = 200 | 301 | 404 | 500;
type Toggle = true | false; // tương đương boolean, nhưng minh họa ý tưởng

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}

move("up");      // OK
move("down");    // OK
// move("diagonal"); // Error: không phải literal hợp lệ

// === TYPE NARROWING ===
function processValue(value: string | number | null) {
  // Tại đây, value có thể là string | number | null

  if (value === null) {
    // TypeScript biết: value là null
    console.log("Giá trị rỗng");
    return;
  }

  // Tại đây: value là string | number (đã loại null)

  if (typeof value === "string") {
    // TypeScript biết: value là string
    console.log(value.toUpperCase()); // OK -- string method
  } else {
    // TypeScript biết: value là number
    console.log(value.toFixed(2)); // OK -- number method
  }
}

// === CONST ASSERTION -- tạo literal type từ giá trị ===
const config = {
  endpoint: "/api/users",
  method: "GET",
} as const;
// typeof config = { readonly endpoint: "/api/users"; readonly method: "GET" }
// Không phải { endpoint: string; method: string }
```

### Đáp án mẫu

> "Literal types cho phép giới hạn giá trị của một biến xuống một tập hợp cụ thể -- ví dụ chỉ cho phép 'success' hoặc 'error' thay vì bất kỳ string nào. Type narrowing là cơ chế TypeScript tự động suy luận type chính xác hơn dựa trên các control flow như if/else, typeof, instanceof. Hai khái niệm này kết hợp với nhau rất mạnh -- khi bạn có union của literal types, TypeScript có thể narrowing xuống đúng literal type trong mỗi nhánh điều kiện."

---

## Câu 3: Type aliases và interfaces khác nhau như thế nào? Khi nào dùng cái nào? `[Intermediate]`

### Giải thích lý thuyết

Cả hai đều định nghĩa "hình dạng" của dữ liệu, nhưng có những khác biệt quan trọng:

- **Interface** có thể được **merge** (declaration merging) -- khai báo nhiều lần sẽ tự động gộp lại.
- **Type alias** có thể biểu diễn **bất kỳ type nào**: union, intersection, tuple, primitive, conditional...
- **Interface** chỉ biểu diễn được object shapes và function signatures.

### Code ví dụ

```typescript
// === INTERFACE ===
interface User {
  name: string;
  age: number;
}

// Declaration merging -- TypeScript tự động gộp 2 khai báo
interface User {
  email: string;
}
// Kết quả: User có name, age, VÀ email

// Kế thừa (extends)
interface Admin extends User {
  role: "admin";
}

// === TYPE ALIAS ===
type UserType = {
  name: string;
  age: number;
};

// Không thể khai báo lại UserType -- sẽ báo lỗi!
// type UserType = { email: string }; // Error: Duplicate identifier

// Nhưng type alias làm được nhiều thứ mà interface không thể:
type ID = string | number;                    // Union
type Pair = [string, number];                  // Tuple
type Callback = (data: string) => void;        // Function type
type Keys = keyof User;                        // Utility
type Nullable<T> = T | null;                   // Generic utility

// Intersection (tương tự extends nhưng linh hoạt hơn)
type AdminType = UserType & { role: "admin" };
```

### Bảng so sánh chi tiết

| Tiêu chí | Interface | Type Alias |
|----------|-----------|------------|
| Object shape | Có | Có |
| Union types | Không | Có |
| Tuple types | Không | Có |
| Primitive types | Không | Có |
| Declaration merging | Có | Không |
| extends keyword | Có | Dùng intersection (`&`) |
| implements (class) | Có | Có (với object types) |
| Computed properties | Không | Có |
| Conditional types | Không | Có |
| Performance (compile) | Nhanh hơn chút | Tương đương |

### Đáp án mẫu

> "Interface phù hợp khi định nghĩa contract cho object và class, đặc biệt khi cần declaration merging (ví dụ: mở rộng type của thư viện bên thứ ba). Type alias linh hoạt hơn -- dùng được với union, tuple, conditional types. Trong thực tế, nhiều team dùng interface cho object shapes và type alias cho mọi thứ còn lại. Cả hai đều compile thành cùng một JavaScript output."

---

## Câu 4: Enum, const enum và union literal khác nhau thế nào? `[Intermediate]`

### Giải thích lý thuyết

TypeScript cung cấp nhiều cách định nghĩa tập hợp giá trị cố định. Mỗi cách có trade-off riêng:

- **Enum**: Tạo ra JavaScript object thật sự tại runtime
- **Const enum**: Được inline hoàn toàn tại compile time, không tạo JS object
- **Union literal**: Thuần type, không tạo bất kỳ JS code nào

### Code ví dụ

```typescript
// === ENUM (tạo JS code tại runtime) ===
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// JS output:
// var Direction;
// (function (Direction) {
//   Direction["Up"] = "UP";
//   ...
// })(Direction || (Direction = {}));

// Dùng như object tại runtime
console.log(Direction.Up);        // "UP"
console.log(Direction["Up"]);     // "UP"

// === CONST ENUM (inline, không tạo JS object) ===
const enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

const myStatus = Status.Active;
// JS output: const myStatus = "ACTIVE";
// Không có object Status trong JS output!

// === UNION LITERAL (thuần type, zero runtime cost) ===
type Color = "red" | "green" | "blue";

function paint(color: Color) {
  // TypeScript check tại compile time
  // Không tạo bất kỳ JS code nào cho Color type
}

paint("red");   // OK
// paint("yellow"); // Error tại compile time
```

### Bảng so sánh

| Tiêu chí | Enum | Const Enum | Union Literal |
|----------|------|------------|---------------|
| Runtime JS code | Có (object) | Không (inline) | Không |
| Bundle size | Tăng | Không tăng | Không tăng |
| Reverse mapping | Có (numeric) | Không | Không |
| Iterate được | Có (`Object.values`) | Không | Không |
| Dùng làm value | Có | Có | Có |
| Type safety | Tốt | Tốt | Tốt |
| Tree-shakeable | Khó | Tự động | Tự động |
| Khuyến nghị | Library APIs | Tránh dùng | Ưu tiên dùng |

### Đáp án mẫu

> "Enum tạo ra JS object thật sự tại runtime, cho phép reverse mapping và iteration nhưng tăng bundle size. Const enum được inline tại compile time nên không tăng bundle, nhưng không dùng được với isolatedModules và không iterate được. Union literal là lựa chọn tốt nhất trong đa số trường hợp vì hoàn toàn zero-cost tại runtime và type-safe. Kinh nghiệm của tôi là ưu tiên union literal, chỉ dùng enum khi cần iterate qua các giá trị tại runtime."

---

## Câu 5: never, unknown, any -- khi nào dùng cái nào? `[Senior]`

### Giải thích lý thuyết

Ba type này đại diện cho ba "mức độ" khác nhau trong type system:

- **`any`**: Tất cả mọi thứ đều hợp lệ -- tắt type checking hoàn toàn. Giống như viết JavaScript thường.
- **`unknown`**: An toàn hơn `any` -- bạn phải check type trước khi dùng. Là "top type" (mọi type đều là subtype của unknown).
- **`never`**: Không có giá trị nào hợp lệ -- là "bottom type". Đại diện cho trường hợp không bao giờ xảy ra.

### Code ví dụ

```typescript
// === ANY -- tắt type checking (TRÁNH DÙNG!) ===
let anything: any = 42;
anything = "hello";
anything = { foo: "bar" };
anything.nonExistent.method(); // Không lỗi tại compile time -- NGUY HIỂM!

// === UNKNOWN -- an toàn, bắt buộc check trước khi dùng ===
let uncertain: unknown = 42;

// uncertain.toFixed(2); // Error! Phải check type trước

if (typeof uncertain === "number") {
  uncertain.toFixed(2); // OK -- đã narrowing thành number
}

// Use case: Parse JSON an toàn
function parseJSON(raw: string): unknown {
  return JSON.parse(raw);
}

const data = parseJSON('{"name": "Thuan"}');
// data.name; // Error! Phải check trước

if (typeof data === "object" && data !== null && "name" in data) {
  console.log((data as { name: string }).name); // OK
}

// === NEVER -- không bao giờ xảy ra ===

// 1. Function không bao giờ return
function throwError(message: string): never {
  throw new Error(message);
}

// 2. Exhaustive check
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    case "triangle":
      return (10 * 5) / 2;
    default:
      // Nếu ai thêm type mới vào Shape mà quên xử lý,
      // TypeScript sẽ báo lỗi ở đây
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### Bảng so sánh

| Tiêu chí | `any` | `unknown` | `never` |
|----------|-------|-----------|---------|
| Cho phép mọi giá trị | Có | Có | Không |
| Truy cập property | Có (không check) | Không (phải check) | Không thể |
| Gán cho type khác | Có | Không (phải check) | Có (subtype mọi type) |
| Type safety | Không | Có | Có |
| Vị trí trong type system | Thoát khỏi system | Top type | Bottom type |
| Khi nào dùng | Migration JS, escape hatch | Input không biết type | Exhaustive check, throw |

### Đáp án mẫu

> "any là escape hatch -- tắt hoàn toàn type checking, chỉ nên dùng khi migrate từ JavaScript hoặc làm việc với thư viện không có type. unknown là bản an toàn của any -- chấp nhận mọi giá trị nhưng bắt buộc developer phải narrow type trước khi sử dụng. never đại diện cho trường hợp không bao giờ xảy ra -- dùng cho exhaustive checking và function không bao giờ return. Trong project mới, tôi luôn dùng unknown thay vì any và dùng never để đảm bảo xử lý hết tất cả case trong discriminated unions."

---

## Câu 6: Giải thích sự khác biệt giữa type widening và type narrowing `[Senior]`

### Giải thích lý thuyết

**Type widening** là khi TypeScript tự động "mở rộng" type của giá trị. Ví dụ: khi bạn khai báo `let x = "hello"`, TypeScript infer type là `string` (không phải `"hello"`), vì `let` cho phép reassign.

**Type narrowing** là ngược lại -- TypeScript "thu hẹp" type dựa trên điều kiện trong code để cho phép truy cập property cụ thể.

### Code ví dụ

```typescript
// === TYPE WIDENING ===

// let --> widening
let greeting = "hello";     // type: string (không phải "hello")
greeting = "world";         // OK vì type là string

// const --> không widening (literal type)
const farewell = "goodbye"; // type: "goodbye" (literal type)

// Object properties được widening
const config = {
  url: "https://api.com",   // type: string (không phải literal)
  port: 3000,               // type: number
};
config.url = "https://other.com"; // OK

// as const ngăn widening
const strictConfig = {
  url: "https://api.com",   // type: "https://api.com" (literal)
  port: 3000,               // type: 3000 (literal)
} as const;
// strictConfig.url = "other"; // Error: readonly

// === TYPE NARROWING ===

type Response =
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };

function handleResponse(res: Response) {
  // res là union type

  if (res.status === "success") {
    // Narrowed: { status: "success"; data: string[] }
    console.log(res.data.join(", ")); // OK
  } else {
    // Narrowed: { status: "error"; message: string }
    console.log(res.message); // OK
  }
}

// Truthiness narrowing
function printLength(value: string | null | undefined) {
  if (value) {
    // Narrowed: string (loại null và undefined)
    console.log(value.length);
  }
}

// in operator narrowing
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function moveAnimal(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // Narrowed: Fish
  } else {
    animal.fly();  // Narrowed: Bird
  }
}
```

### Đáp án mẫu

> "Type widening xảy ra khi TypeScript infer type rộng hơn literal type -- ví dụ let x = 'hello' được infer là string. Điều này hợp lý vì let cho phép reassign. Ngược lại, const thì giữ nguyên literal type. Type narrowing là quá trình TypeScript thu hẹp type dựa trên control flow -- typeof, instanceof, in operator, hoặc equality check. Hai cơ chế này làm việc đối lập nhau: widening mở rộng type khi khai báo, narrowing thu hẹp type khi sử dụng."

---

## Lỗi thường gặp khi trả lời

1. **Nhầm lẫn union và intersection với tập hợp**: Nhiều người nghĩ intersection type có ít property hơn (vì "giao" tập hợp) -- nhưng thực tế intersection **cộng dồn** property, còn union **giới hạn** property truy cập được.

2. **Nói "interface nhanh hơn type alias"**: Điều này chỉ đúng trong một số trường hợp cụ thể (declaration merging resolution). Trong thực tế, sự khác biệt performance là không đáng kể.

3. **Dùng any thay vì unknown**: Khi interviewer hỏi về type-safe parsing, nếu bạn dùng `any` thay vì `unknown`, đó là red flag. Luôn chọn `unknown` khi không biết type của input.

4. **Quên giải thích never trong exhaustive check**: Đây là một pattern cực kỳ quan trọng trong production code. Nếu bạn chỉ nói "never là type không có giá trị" mà không cho ví dụ exhaustive checking, câu trả lời sẽ thiếu chiều sâu.

5. **Không phân biệt literal type và primitive type**: `"hello"` (literal) khác với `string` (primitive). Hiểu sự khác biệt này là cơ bản nhưng nhiều ứng viên bỏ qua.

6. **Nhầm const enum là luôn tốt hơn enum**: Const enum có vấn đề với `isolatedModules` (Babel, SWC) và không iterate được tại runtime. Không phải lúc nào cũng tốt hơn.
