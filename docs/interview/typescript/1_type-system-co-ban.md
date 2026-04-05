---
sidebar_position: 1
title: "Type System: Union, Intersection, Literal Types"
---

# Type System: Union, Intersection, Literal Types

TypeScript type system la thu khien ngon ngu nay tro nen manh me hon JavaScript thuong rat nhieu. Trong buoi phong van, day la nhom cau hoi xuat hien thuong xuyen nhat -- tu junior den senior. Bai nay se giup ban nam vung cac khai niem co ban nhat cua type system va tra loi tu tin truoc interviewer.

---

## Cau 1: Union types va intersection types khac nhau the nao? `[Intermediate]`

### Giai thich ly thuyet

**Union type** (`A | B`) co nghia la gia tri co the la type A **hoac** type B. Ban chi duoc truy cap nhung property chung cua ca hai type.

**Intersection type** (`A & B`) co nghia la gia tri phai thoa man **ca** type A **va** type B cung luc. Ban duoc truy cap tat ca property cua ca hai type.

Cach nho don gian:
- Union = "hoac" (OR) -- mo rong tap hop gia tri
- Intersection = "va" (AND) -- thu hep tap hop gia tri (nhung mo rong tap hop property)

### Code vi du

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

// Pet co the la Dog HOAC Cat
type Pet = Dog | Cat;

function greetPet(pet: Pet) {
  // Chi truy cap duoc property chung: name
  console.log(pet.name); // OK

  // Khong truy cap duoc bark() hay meow() truc tiep
  // vi TypeScript khong biet pet la Dog hay Cat
  // pet.bark(); // Error!
}

// === INTERSECTION TYPE ===
type Loggable = {
  log: () => void;
};

type Serializable = {
  serialize: () => string;
};

// LogAndSerialize phai co CA hai: log() VA serialize()
type LogAndSerialize = Loggable & Serializable;

function process(item: LogAndSerialize) {
  item.log();              // OK -- tu Loggable
  item.serialize();        // OK -- tu Serializable
}
```

### Bang so sanh

| Tieu chi | Union (`A \| B`) | Intersection (`A & B`) |
|----------|-----------------|----------------------|
| Y nghia | A hoac B | A va B cung luc |
| Tap gia tri | Mo rong (nhieu gia tri hon) | Thu hep (it gia tri hon) |
| Property truy cap | Chi property chung | Tat ca property |
| Ung dung thuong gap | Function nhan nhieu kieu | Mixin, compose types |
| Tuong tu logic | OR | AND |

### Dap an mau

> "Union type cho phep mot gia tri thuoc mot trong nhieu type, giong nhu phep OR. Intersection type yeu cau gia tri phai thoa man tat ca type cung luc, giong nhu phep AND. Dieu thu vi la union mo rong tap hop gia tri nhung thu hep tap hop property truy cap duoc, con intersection thi nguoc lai -- thu hep tap hop gia tri nhung mo rong tap hop property."

---

## Cau 2: Literal types va type narrowing hoat dong nhu the nao? `[Intermediate]`

### Giai thich ly thuyet

**Literal types** cho phep ban dinh nghia type la mot gia tri cu the, khong phai chi la kieu du lieu chung chung. Vi du: thay vi `string`, ban co the chi dinh `"success"` hoac `"error"`.

**Type narrowing** la qua trinh TypeScript tu dong "thu hep" type dua tren cac dieu kien trong code. Khi ban check `typeof x === "string"`, TypeScript biet rang trong block do, `x` chac chan la `string`.

### Code vi du

```typescript
// === LITERAL TYPES ===
type Direction = "up" | "down" | "left" | "right";
type HttpStatus = 200 | 301 | 404 | 500;
type Toggle = true | false; // tuong duong boolean, nhung minh hoa y tuong

function move(direction: Direction) {
  console.log(`Moving ${direction}`);
}

move("up");      // OK
move("down");    // OK
// move("diagonal"); // Error: khong phai literal hop le

// === TYPE NARROWING ===
function processValue(value: string | number | null) {
  // Tai day, value co the la string | number | null

  if (value === null) {
    // TypeScript biet: value la null
    console.log("Gia tri rong");
    return;
  }

  // Tai day: value la string | number (da loai null)

  if (typeof value === "string") {
    // TypeScript biet: value la string
    console.log(value.toUpperCase()); // OK -- string method
  } else {
    // TypeScript biet: value la number
    console.log(value.toFixed(2)); // OK -- number method
  }
}

// === CONST ASSERTION -- tao literal type tu gia tri ===
const config = {
  endpoint: "/api/users",
  method: "GET",
} as const;
// typeof config = { readonly endpoint: "/api/users"; readonly method: "GET" }
// Khong phai { endpoint: string; method: string }
```

### Dap an mau

> "Literal types cho phep gioi han gia tri cua mot bien xuong mot tap hop cu the -- vi du chi cho phep 'success' hoac 'error' thay vi bat ky string nao. Type narrowing la co che TypeScript tu dong suy luan type chinh xac hon dua tren cac control flow nhu if/else, typeof, instanceof. Hai khai niem nay ket hop voi nhau rat manh -- khi ban co union cua literal types, TypeScript co the narrowing xuong dung literal type trong moi nhanh dieu kien."

---

## Cau 3: Type aliases va interfaces khac nhau nhu the nao? Khi nao dung cai nao? `[Intermediate]`

### Giai thich ly thuyet

Ca hai deu dinh nghia "hinh dang" cua du lieu, nhung co nhung khac biet quan trong:

- **Interface** co the duoc **merge** (declaration merging) -- khai bao nhieu lan se tu dong gop lai.
- **Type alias** co the bieu dien **bat ky type nao**: union, intersection, tuple, primitive, conditional...
- **Interface** chi bieu dien duoc object shapes va function signatures.

### Code vi du

```typescript
// === INTERFACE ===
interface User {
  name: string;
  age: number;
}

// Declaration merging -- TypeScript tu dong gop 2 khai bao
interface User {
  email: string;
}
// Ket qua: User co name, age, VA email

// Ke thua (extends)
interface Admin extends User {
  role: "admin";
}

// === TYPE ALIAS ===
type UserType = {
  name: string;
  age: number;
};

// Khong the khai bao lai UserType -- se bao loi!
// type UserType = { email: string }; // Error: Duplicate identifier

// Nhung type alias lam duoc nhieu thu ma interface khong the:
type ID = string | number;                    // Union
type Pair = [string, number];                  // Tuple
type Callback = (data: string) => void;        // Function type
type Keys = keyof User;                        // Utility
type Nullable<T> = T | null;                   // Generic utility

// Intersection (tuong tu extends nhung linh hoat hon)
type AdminType = UserType & { role: "admin" };
```

### Bang so sanh chi tiet

| Tieu chi | Interface | Type Alias |
|----------|-----------|------------|
| Object shape | Co | Co |
| Union types | Khong | Co |
| Tuple types | Khong | Co |
| Primitive types | Khong | Co |
| Declaration merging | Co | Khong |
| extends keyword | Co | Dung intersection (`&`) |
| implements (class) | Co | Co (voi object types) |
| Computed properties | Khong | Co |
| Conditional types | Khong | Co |
| Performance (compile) | Nhanh hon chut | Tuong duong |

### Dap an mau

> "Interface phu hop khi dinh nghia contract cho object va class, dac biet khi can declaration merging (vi du: mo rong type cua thu vien ben thu ba). Type alias linh hoat hon -- dung duoc voi union, tuple, conditional types. Trong thuc te, nhieu team dung interface cho object shapes va type alias cho moi thu con lai. Ca hai deu compile thanh cung mot JavaScript output."

---

## Cau 4: Enum, const enum va union literal khac nhau the nao? `[Intermediate]`

### Giai thich ly thuyet

TypeScript cung cap nhieu cach dinh nghia tap hop gia tri co dinh. Moi cach co trade-off rieng:

- **Enum**: Tao ra JavaScript object that su tai runtime
- **Const enum**: Duoc inline hoan toan tai compile time, khong tao JS object
- **Union literal**: Thuan type, khong tao bat ky JS code nao

### Code vi du

```typescript
// === ENUM (tao JS code tai runtime) ===
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

// Dung nhu object tai runtime
console.log(Direction.Up);        // "UP"
console.log(Direction["Up"]);     // "UP"

// === CONST ENUM (inline, khong tao JS object) ===
const enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

const myStatus = Status.Active;
// JS output: const myStatus = "ACTIVE";
// Khong co object Status trong JS output!

// === UNION LITERAL (thuan type, zero runtime cost) ===
type Color = "red" | "green" | "blue";

function paint(color: Color) {
  // TypeScript check tai compile time
  // Khong tao bat ky JS code nao cho Color type
}

paint("red");   // OK
// paint("yellow"); // Error tai compile time
```

### Bang so sanh

| Tieu chi | Enum | Const Enum | Union Literal |
|----------|------|------------|---------------|
| Runtime JS code | Co (object) | Khong (inline) | Khong |
| Bundle size | Tang | Khong tang | Khong tang |
| Reverse mapping | Co (numeric) | Khong | Khong |
| Iterate duoc | Co (`Object.values`) | Khong | Khong |
| Dung lam value | Co | Co | Co |
| Type safety | Tot | Tot | Tot |
| Tree-shakeable | Kho | Tu dong | Tu dong |
| Khuyen nghi | Library APIs | Tranh dung | Uu tien dung |

### Dap an mau

> "Enum tao ra JS object that su tai runtime, cho phep reverse mapping va iteration nhung tang bundle size. Const enum duoc inline tai compile time nen khong tang bundle, nhung khong dung duoc voi isolatedModules va khong iterate duoc. Union literal la lua chon tot nhat trong da so truong hop vi hoan toan zero-cost tai runtime va type-safe. Kinh nghiem cua toi la uu tien union literal, chi dung enum khi can iterate qua cac gia tri tai runtime."

---

## Cau 5: never, unknown, any -- khi nao dung cai nao? `[Senior]`

### Giai thich ly thuyet

Ba type nay dai dien cho ba "muc do" khac nhau trong type system:

- **`any`**: Tat ca moi thu deu hop le -- tat type checking hoan toan. Giong nhu viet JavaScript thuong.
- **`unknown`**: An toan hon `any` -- ban phai check type truoc khi dung. La "top type" (moi type deu la subtype cua unknown).
- **`never`**: Khong co gia tri nao hop le -- la "bottom type". Dai dien cho truong hop khong bao gio xay ra.

### Code vi du

```typescript
// === ANY -- tat type checking (TRANH DUNG!) ===
let anything: any = 42;
anything = "hello";
anything = { foo: "bar" };
anything.nonExistent.method(); // Khong loi tai compile time -- NGUY HIEM!

// === UNKNOWN -- an toan, bat buoc check truoc khi dung ===
let uncertain: unknown = 42;

// uncertain.toFixed(2); // Error! Phai check type truoc

if (typeof uncertain === "number") {
  uncertain.toFixed(2); // OK -- da narrowing thanh number
}

// Use case: Parse JSON an toan
function parseJSON(raw: string): unknown {
  return JSON.parse(raw);
}

const data = parseJSON('{"name": "Thuan"}');
// data.name; // Error! Phai check truoc

if (typeof data === "object" && data !== null && "name" in data) {
  console.log((data as { name: string }).name); // OK
}

// === NEVER -- khong bao gio xay ra ===

// 1. Function khong bao gio return
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
      // Neu ai them type moi vao Shape ma quen xu ly,
      // TypeScript se bao loi o day
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### Bang so sanh

| Tieu chi | `any` | `unknown` | `never` |
|----------|-------|-----------|---------|
| Cho phep moi gia tri | Co | Co | Khong |
| Truy cap property | Co (khong check) | Khong (phai check) | Khong the |
| Gan cho type khac | Co | Khong (phai check) | Co (subtype moi type) |
| Type safety | Khong | Co | Co |
| Vi tri trong type system | Thoat khoi system | Top type | Bottom type |
| Khi nao dung | Migration JS, escape hatch | Input khong biet type | Exhaustive check, throw |

### Dap an mau

> "any la escape hatch -- tat hoan toan type checking, chi nen dung khi migrate tu JavaScript hoac lam viec voi thu vien khong co type. unknown la ban an toan cua any -- chap nhan moi gia tri nhung bat buoc developer phai narrow type truoc khi su dung. never dai dien cho truong hop khong bao gio xay ra -- dung cho exhaustive checking va function khong bao gio return. Trong project moi, toi luon dung unknown thay vi any va dung never de dam bao xu ly het tat ca case trong discriminated unions."

---

## Cau 6: Giai thich su khac biet giua type widening va type narrowing `[Senior]`

### Giai thich ly thuyet

**Type widening** la khi TypeScript tu dong "mo rong" type cua gia tri. Vi du: khi ban khai bao `let x = "hello"`, TypeScript infer type la `string` (khong phai `"hello"`), vi `let` cho phep reassign.

**Type narrowing** la nguoc lai -- TypeScript "thu hep" type dua tren dieu kien trong code de cho phep truy cap property cu the.

### Code vi du

```typescript
// === TYPE WIDENING ===

// let --> widening
let greeting = "hello";     // type: string (khong phai "hello")
greeting = "world";         // OK vi type la string

// const --> khong widening (literal type)
const farewell = "goodbye"; // type: "goodbye" (literal type)

// Object properties duoc widening
const config = {
  url: "https://api.com",   // type: string (khong phai literal)
  port: 3000,               // type: number
};
config.url = "https://other.com"; // OK

// as const ngan widening
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
  // res la union type

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
    // Narrowed: string (loai null va undefined)
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

### Dap an mau

> "Type widening xay ra khi TypeScript infer type rong hon literal type -- vi du let x = 'hello' duoc infer la string. Dieu nay hop ly vi let cho phep reassign. Nguoc lai, const thi giu nguyen literal type. Type narrowing la qua trinh TypeScript thu hep type dua tren control flow -- typeof, instanceof, in operator, hoac equality check. Hai co che nay lam viec doi lap nhau: widening mo rong type khi khai bao, narrowing thu hep type khi su dung."

---

## Loi thuong gap khi tra loi

1. **Nham lan union va intersection voi tap hop**: Nhieu nguoi nghi intersection type co it property hon (vi "giao" tap hop) -- nhung thuc te intersection **cong don** property, con union **gioi han** property truy cap duoc.

2. **Noi "interface nhanh hon type alias"**: Dieu nay chi dung trong mot so truong hop cu the (declaration merging resolution). Trong thuc te, su khac biet performance la khong dang ke.

3. **Dung any thay vi unknown**: Khi interviewer hoi ve type-safe parsing, neu ban dung `any` thay vi `unknown`, do la red flag. Luon chon `unknown` khi khong biet type cua input.

4. **Quen giai thich never trong exhaustive check**: Day la mot pattern cuc ky quan trong trong production code. Neu ban chi noi "never la type khong co gia tri" ma khong cho vi du exhaustive checking, cau tra loi se thieu chieu sau.

5. **Khong phan biet literal type va primitive type**: `"hello"` (literal) khac voi `string` (primitive). Hieu su khac biet nay la co ban nhung nhieu ung vien bo qua.

6. **Nham const enum la luon tot hon enum**: Const enum co van de voi `isolatedModules` (Babel, SWC) va khong iterate duoc tai runtime. Khong phai luc nao cung tot hon.
