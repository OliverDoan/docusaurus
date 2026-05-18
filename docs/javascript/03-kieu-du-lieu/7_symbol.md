---
sidebar_position: 7
title: "7. Symbol"
---

# Symbol

---

## Mục lục

- [Symbol là gì?](#symbol-là-gì)
- [Tại sao cần Symbol?](#tại-sao-cần-symbol)
- [Tạo Symbol](#tạo-symbol)
- [Symbol làm property key](#symbol-làm-property-key)
- [Symbol.for() — Global Symbol Registry](#symbolfor--global-symbol-registry)
- [Well-known Symbols](#well-known-symbols)
- [Use case thực tế](#use-case-thực-tế)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Symbol là gì?

`Symbol` là **kiểu dữ liệu nguyên thuỷ** (primitive) được giới thiệu trong **ES6**. Mỗi symbol là một **giá trị duy nhất** (unique) — không có hai symbol nào bằng nhau.

```js
const a = Symbol("id");
const b = Symbol("id");

a === b;        // false (mặc dù cùng description!)
typeof a;       // "symbol"
```

> **Ví dụ thực tế:** Hãy tưởng tượng Symbol như **vân tay** — mỗi người có vân tay duy nhất, không ai trùng ai, ngay cả khi cùng tên cùng tuổi.

## Tại sao cần Symbol?

### Vấn đề: trùng tên property

Trước ES6, mọi key của object đều là **string** → dễ bị **đè** khi merge:

```js
const user = { name: "Alice", id: 1 };

// Thư viện A thêm metadata
user.meta = { author: "lib-a" };

// Thư viện B cũng thêm
user.meta = { tracking: "lib-b" };   // ⚠️ ĐÈ lên A!

console.log(user.meta);   // { tracking: "lib-b" } — A đã mất
```

### Giải pháp: Symbol làm key duy nhất

```js
const META_A = Symbol("metaA");
const META_B = Symbol("metaB");

const user = { name: "Alice", id: 1 };
user[META_A] = { author: "lib-a" };
user[META_B] = { tracking: "lib-b" };

// Không bao giờ đụng nhau, kể cả khi description giống
console.log(user[META_A]);   // { author: "lib-a" }
console.log(user[META_B]);   // { tracking: "lib-b" }
```

## Tạo Symbol

### Cú pháp

```js
const s1 = Symbol();
const s2 = Symbol("mô tả");        // description chỉ để debug
const s3 = Symbol("mô tả");        // s2 !== s3

console.log(s2.description);   // "mô tả"
console.log(s2.toString());    // "Symbol(mô tả)"
```

### Không dùng `new`

```js
const s = new Symbol();   // ❌ TypeError: Symbol is not a constructor
```

Symbol là primitive — không thể tạo bằng `new`.

### So sánh

```js
Symbol("a") === Symbol("a");        // false
Symbol("a") == Symbol("a");         // false

const s = Symbol("a");
s === s;                            // true (cùng tham chiếu)
```

## Symbol làm property key

### Set / Get property

```js
const ID = Symbol("id");
const user = {
  name: "Alice",
  [ID]: 12345          // computed property name
};

console.log(user[ID]);     // 12345
console.log(user.name);    // "Alice"
```

### Symbol là property "ẩn"

```js
const user = {
  name: "Alice",
  [Symbol("secret")]: "hidden"
};

// Symbol KHÔNG xuất hiện trong:
Object.keys(user);              // ["name"]
Object.entries(user);           // [["name", "Alice"]]
for (let k in user) console.log(k);  // "name"
JSON.stringify(user);           // '{"name":"Alice"}'

// Symbol XUẤT HIỆN qua API riêng:
Object.getOwnPropertySymbols(user);   // [Symbol(secret)]
Reflect.ownKeys(user);                // ["name", Symbol(secret)]
```

> **Quan trọng:** Symbol **không phải là tính riêng tư thực sự** — vẫn truy cập được qua `Object.getOwnPropertySymbols`. Dùng `#privateField` (ES2022) nếu cần private thực sự.

## Symbol.for() — Global Symbol Registry

Đôi khi bạn muốn **chia sẻ symbol** giữa nhiều module/file. `Symbol.for(key)` tạo symbol trong **registry toàn cục**:

```js
const s1 = Symbol.for("app.id");
const s2 = Symbol.for("app.id");

s1 === s2;   // ✅ true!

// Tra ngược key từ symbol
Symbol.keyFor(s1);   // "app.id"
Symbol.keyFor(Symbol("local"));   // undefined (không trong registry)
```

| | `Symbol()` | `Symbol.for()` |
|---|------------|----------------|
| Tạo mới mỗi lần | ✅ | ❌ (cache theo key) |
| Cùng key → cùng symbol | ❌ | ✅ |
| Phù hợp cho | Property private trong scope nhỏ | Chia sẻ giữa module |

## Well-known Symbols

JavaScript định nghĩa sẵn nhiều symbol đặc biệt để **tùy biến hành vi** của object. Chúng là property của `Symbol`:

### `Symbol.iterator` — tuỳ biến vòng lặp

```js
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const n of range) console.log(n);   // 1, 2, 3, 4, 5
[...range];   // [1, 2, 3, 4, 5]
```

### `Symbol.asyncIterator` — async iteration

```js
const stream = {
  async *[Symbol.asyncIterator]() {
    yield 1;
    await sleep(100);
    yield 2;
  }
};

for await (const n of stream) console.log(n);   // 1, 2
```

### `Symbol.toPrimitive` — tuỳ biến chuyển đổi kiểu

```js
const money = {
  amount: 100,
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return `$${this.amount}`;
    return this.amount;
  }
};

+money;          // 100   (hint = "number")
`${money}`;      // "$100" (hint = "string")
money + "";      // 100 (default)
```

### Các well-known symbols khác

| Symbol | Vai trò |
|--------|---------|
| `Symbol.iterator` | `for...of`, spread, destructuring |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | Chuyển đổi sang primitive |
| `Symbol.hasInstance` | `instanceof` |
| `Symbol.isConcatSpreadable` | `Array.concat` |
| `Symbol.toStringTag` | `Object.prototype.toString` |
| `Symbol.species` | Tạo derived object |

## Use case thực tế

### 1. Property "ẩn" trong library

```js
// lib.js
const INTERNAL = Symbol("internal");

export function createInstance() {
  return {
    name: "public",
    [INTERNAL]: "secret state"
  };
}

// user.js
const inst = createInstance();
console.log(Object.keys(inst));   // ["name"]  — secret bị ẩn
```

### 2. Enum-like constants

```js
const Status = {
  PENDING: Symbol("pending"),
  APPROVED: Symbol("approved"),
  REJECTED: Symbol("rejected")
};

// Không thể tạo trùng từ ngoài
const fake = Symbol("pending");
fake === Status.PENDING;   // false ✅ an toàn
```

### 3. Tránh xung đột khi extend object

```js
// Thư viện A
Array.prototype[Symbol.for("uniqueLib.shuffle")] = function() {
  // ...
};

// Thư viện B
Array.prototype[Symbol.for("anotherLib.shuffle")] = function() {
  // ...
};

// Không đụng nhau dù cùng tên "shuffle"
```

### 4. Tuỳ biến iteration

```js
class LinkedList {
  // ... implementation ...

  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}

const list = new LinkedList();
for (const x of list) console.log(x);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Symbol khác string làm key như thế nào?

**Đáp án:**

| | String key | Symbol key |
|---|-----------|------------|
| Trùng nhau | Có thể đè | Mỗi symbol là unique |
| `Object.keys()` | ✅ Có | ❌ Không |
| `JSON.stringify` | ✅ Có | ❌ Bỏ qua |
| `for...in` | ✅ Có | ❌ Không |
| Truy cập | `obj.key` hoặc `obj["key"]` | Phải `obj[symbol]` |
| Use case | Dữ liệu công khai | Metadata / property ẩn |

### Câu 2: Đoán kết quả

```js
const s1 = Symbol("a");
const s2 = Symbol("a");
const s3 = Symbol.for("b");
const s4 = Symbol.for("b");

console.log(s1 === s2);
console.log(s3 === s4);
console.log(Symbol.keyFor(s1));
console.log(Symbol.keyFor(s3));
```

**Đáp án:**

```
false       (Symbol() luôn unique)
true        (Symbol.for tạo từ global registry)
undefined   (s1 không trong registry)
"b"         (s3 có key "b")
```

### Câu 3: Symbol có làm property "private" thực sự không?

**Đáp án:**

**Không** — Symbol property bị **ẩn khỏi** các phương thức enumerate thông thường (`Object.keys`, `for...in`, `JSON.stringify`), nhưng vẫn truy cập được qua:

```js
Object.getOwnPropertySymbols(obj);
Reflect.ownKeys(obj);
```

Để tạo property **private thực sự**, dùng **private class fields (ES2022)**:

```js
class User {
  #password;   // private thực sự
  constructor(p) { this.#password = p; }
}
```

### Câu 4: Khi nào dùng `Symbol.for` thay vì `Symbol()`?

**Đáp án:**

- `Symbol()` — khi cần symbol **cục bộ**, chỉ dùng trong scope/module riêng. Mỗi lần gọi tạo mới, không chia sẻ.
- `Symbol.for(key)` — khi cần symbol **chia sẻ giữa nhiều module/realm** (vd: iframe khác, worker khác). Đảm bảo cùng `key` → cùng symbol.

Ví dụ thực tế: `Symbol.for("react.element")` được React dùng để các React element nhận diện nhau qua các realm.
