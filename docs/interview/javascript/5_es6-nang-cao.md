---
sidebar_position: 5
title: "5. ES6+: Destructuring, Spread, Proxy, WeakMap, Symbol"
---

# ES6+: Destructuring, Spread, Proxy, WeakMap, Symbol

ES6+ mang đến rất nhiều tính năng mạnh mẽ mà interviewer thường hỏi để kiểm tra bạn có thực sự cập nhật kiến thức hay không. Phần này tập trung vào những tính năng "nâng cao hơn" mà không phải developer nào cũng nắm vững.

---

## Mục lục

- [Câu 1: Destructuring nâng cao `[Intermediate]`](#câu-1-destructuring-nâng-cao-intermediate)
- [Câu 2: Spread và Rest operator `[Intermediate]`](#câu-2-spread-và-rest-operator-intermediate)
- [Câu 3: Symbol -- use cases và well-known symbols `[Senior]`](#câu-3-symbol-use-cases-và-well-known-symbols-senior)
- [Câu 4: WeakMap, WeakSet vs Map, Set `[Senior]`](#câu-4-weakmap-weakset-vs-map-set-senior)
- [Câu 5: Proxy và Reflect `[Senior]`](#câu-5-proxy-và-reflect-senior)
- [Câu 6: Optional chaining, nullish coalescing `[Intermediate]`](#câu-6-optional-chaining-nullish-coalescing-intermediate)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: Destructuring nâng cao `[Intermediate]`

### Câu hỏi

> Cho ví dụ về nested destructuring, default values, và rename. Những trường hợp nào destructuring có thể gây lỗi?

### Giải thích lý thuyết

Destructuring là cú pháp "bóc tách" giá trị từ object/array vào biến riêng. Ngoài cách dùng cơ bản, nó còn hỗ trợ:

- **Nested destructuring**: Bóc tách object/array lồng nhau
- **Default values**: Gán giá trị mặc định khi property là `undefined`
- **Rename**: Đổi tên biến khi destructure
- **Rest**: Lấy phần còn lại vào một biến

### Code ví dụ

```javascript
// ===== Nested destructuring =====
const response = {
  data: {
    user: {
      name: "An",
      address: {
        city: "Ha Noi",
        district: "Cau Giay",
      },
    },
    meta: {
      page: 1,
      total: 100,
    },
  },
  status: 200,
};

// Bóc tách sâu nhiều tầng
const {
  data: {
    user: {
      name,
      address: { city, district },
    },
    meta: { page, total },
  },
  status,
} = response;

console.log(name); // "An"
console.log(city); // "Ha Noi"
console.log(page); // 1
console.log(status); // 200
// Lưu ý: "data", "user", "address", "meta" KHÔNG là biến -- chỉ là đường dẫn

// ===== Default values =====
const config = { theme: "dark" };

const {
  theme = "light", // có giá trị -> "dark"
  language = "vi", // undefined -> dùng default "vi"
  fontSize = 14, // undefined -> dùng default 14
} = config;

console.log(theme); // "dark" (giá trị thực)
console.log(language); // "vi" (default)
console.log(fontSize); // 14 (default)

// CẢNH BÁO: Default chỉ áp dụng với undefined, KHÔNG áp dụng với null
const { value = 42 } = { value: null };
console.log(value); // null -- KHÔNG phải 42!

// ===== Rename =====
const apiResponse = {
  user_name: "An",
  user_age: 25,
  is_active: true,
};

// Rename từ snake_case sang camelCase
const {
  user_name: userName,
  user_age: userAge,
  is_active: isActive,
} = apiResponse;

console.log(userName); // "An"
console.log(userAge); // 25

// ===== Rename + Default =====
const { role: userRole = "member" } = {};
console.log(userRole); // "member"

// ===== Array destructuring nâng cao =====
const matrix = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const [[a, b], [c, d], [e, f]] = matrix;
console.log(a, b, c, d, e, f); // 1 2 3 4 5 6

// Bỏ qua phần tử
const [first, , third] = [10, 20, 30];
console.log(first, third); // 10 30

// Swap biến không cần temp
let x = 1;
let y = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1

// ===== Function parameters destructuring =====
function createUser({
  name,
  email,
  role = "member",
  notifications = true,
} = {}) {
  return { name, email, role, notifications };
}

// Gọi với object
createUser({ name: "An", email: "an@example.com" });
// Gọi không có tham số cũng không lỗi (nhờ = {})
createUser();

// ===== Trường hợp gây lỗi =====
// const { a } = undefined; // TypeError: Cannot destructure property 'a' of undefined
// const { a } = null;      // TypeError

// An toàn với default:
const { a: safeA } = undefined || {};
console.log(safeA); // undefined (không lỗi)
```

### Đáp án mẫu

> "Destructuring hỗ trợ nested, default values, rename và rest pattern. Điểm cần lưu ý: default chỉ áp dụng với `undefined` (không áp dụng với `null`), destructure từ `undefined`/`null` sẽ throw TypeError, và khi nested destructure thì các 'đường dẫn' trung gian không trở thành biến. Trong thực tế, destructuring function parameters với default value là pattern cực kỳ hữu ích để tạo clean API."

---

## Câu 2: Spread và Rest operator `[Intermediate]`

### Câu hỏi

> Phân biệt spread (`...`) và rest (`...`) operator. Spread có phải deep copy không?

### Giải thích lý thuyết

Cùng cú pháp `...` nhưng hai chức năng:

| Chức năng  | Vị trí                                    | Ý nghĩa                |
| ---------- | ----------------------------------------- | ---------------------- |
| **Spread** | Trong array/object literal, function call | "Trải ra" các phần tử  |
| **Rest**   | Trong destructuring, function params      | "Thu gom" phần còn lại |

**Quan trọng**: Spread chỉ tạo **shallow copy** -- object/array lồng bên trong vẫn là reference!

### Code ví dụ

```javascript
// ===== Spread: "Trải ra" =====

// Spread array
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]
const withExtra = [0, ...arr1, 99]; // [0, 1, 2, 3, 99]

// Spread object
const defaults = { theme: "light", lang: "vi", fontSize: 14 };
const userPrefs = { theme: "dark", fontSize: 16 };
const config = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "vi", fontSize: 16 }
// Property sau ghi đè property trước

// Spread trong function call
const numbers = [3, 1, 4, 1, 5];
console.log(Math.max(...numbers)); // 5 -- tương đương Math.max(3, 1, 4, 1, 5)

// ===== Rest: "Thu gom" =====

// Rest trong destructuring
const { theme: t, ...otherConfig } = config;
console.log(t); // "dark"
console.log(otherConfig); // { lang: "vi", fontSize: 16 }

// Rest trong function params
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// Kết hợp params và rest
function logWithPrefix(prefix, ...messages) {
  messages.forEach((msg) => console.log(`[${prefix}] ${msg}`));
}
logWithPrefix("INFO", "Server started", "Port 3000");
// [INFO] Server started
// [INFO] Port 3000

// ===== SHALLOW COPY -- cực kỳ quan trọng! =====
const original = {
  name: "An",
  scores: [90, 85, 92],
  address: { city: "Ha Noi" },
};

const copy = { ...original };

// Primitive values: được copy
copy.name = "Binh";
console.log(original.name); // "An" -- không bị ảnh hưởng

// Objects/Arrays: chỉ copy REFERENCE
copy.scores.push(100);
console.log(original.scores); // [90, 85, 92, 100] -- BỊ ẢNH HƯỞNG!

copy.address.city = "Da Nang";
console.log(original.address.city); // "Da Nang" -- BỊ ẢNH HƯỞNG!

// ===== Deep copy đúng cách =====
// Cách 1: structuredClone (modern, khuyên dùng)
const deepCopy1 = structuredClone(original);

// Cách 2: JSON (đơn giản nhưng có hạn chế -- mất function, Date bị convert)
const deepCopy2 = JSON.parse(JSON.stringify(original));

// Cách 3: Thư viện (lodash)
// const deepCopy3 = _.cloneDeep(original);

// ===== Thực hành: immutable update pattern =====
const users = [
  { id: 1, name: "An", active: true },
  { id: 2, name: "Binh", active: true },
  { id: 3, name: "Cuong", active: false },
];

// Update user id=2, không mutate array gốc
const updatedUsers = users.map((user) =>
  user.id === 2 ? { ...user, name: "Binh Updated" } : user,
);
// original users vẫn như cũ
```

### Đáp án mẫu

> "Spread trải ra phần tử (dùng trong array/object literal và function call), rest thu gom phần còn lại (dùng trong destructuring và function params). Điểm cực kỳ quan trọng là spread chỉ tạo **shallow copy** -- nested objects/arrays vẫn là reference chung. Để deep copy, dùng `structuredClone` (ES2022) hoặc JSON parse/stringify. Trong React/Redux, immutable update pattern dùng spread + map để update state mà không mutate."

---

## Câu 3: Symbol -- use cases và well-known symbols `[Senior]`

### Câu hỏi

> Symbol là gì? Cho ví dụ use case thực tế. Well-known Symbols là gì?

### Giải thích lý thuyết

**Symbol** là primitive type được giới thiệu trong ES6. Mỗi Symbol là **duy nhất** (unique), không bao giờ bằng Symbol khác.

Use cases chính:

1. **Unique property keys**: Tránh trùng tên property
2. **Constants không trùng**: Enum pattern
3. **Well-known Symbols**: Tùy chỉnh hành vi của các built-in operations

### Code ví dụ

```javascript
// ===== Cơ bản: Symbol là duy nhất =====
const sym1 = Symbol("mô tả");
const sym2 = Symbol("mô tả");
console.log(sym1 === sym2); // false! Dù cùng description

// Symbol không tự convert sang string
// console.log("Value: " + sym1); // TypeError!
console.log(`Value: ${sym1.toString()}`); // "Value: Symbol(mô tả)"
console.log(`Value: ${sym1.description}`); // "Value: mô tả"

// ===== Use Case 1: Unique property keys =====
const LOG_LEVEL = Symbol("logLevel");
const CREATED_AT = Symbol("createdAt");

const request = {
  url: "/api/users",
  method: "GET",
  // Metadata ẩn, không xung đột với property bình thường
  [LOG_LEVEL]: "debug",
  [CREATED_AT]: Date.now(),
};

console.log(request.url); // "/api/users"
console.log(request[LOG_LEVEL]); // "debug"

// Symbol keys KHÔNG xuất hiện trong:
console.log(Object.keys(request)); // ["url", "method"]
console.log(JSON.stringify(request)); // '{"url":"/api/users","method":"GET"}'
// Chỉ thấy qua:
console.log(Object.getOwnPropertySymbols(request)); // [Symbol(logLevel), Symbol(createdAt)]

// ===== Use Case 2: Enum pattern =====
const Status = Object.freeze({
  PENDING: Symbol("PENDING"),
  APPROVED: Symbol("APPROVED"),
  REJECTED: Symbol("REJECTED"),
});

function processRequest(status) {
  switch (status) {
    case Status.PENDING:
      return "Đang chờ xử lý";
    case Status.APPROVED:
      return "Đã duyệt";
    case Status.REJECTED:
      return "Từ chối";
    default:
      throw new Error("Trạng thái không hợp lệ");
  }
}

// Không ai có thể "giả mạo" status vì Symbol là duy nhất
// processRequest("PENDING") -> throw Error (string không === Symbol)

// ===== Use Case 3: Symbol.for -- global registry =====
const globalSym1 = Symbol.for("app.config");
const globalSym2 = Symbol.for("app.config");
console.log(globalSym1 === globalSym2); // true! Cùng key trong global registry

// ===== Well-known Symbols =====

// Symbol.iterator -- tùy chỉnh for...of
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      },
    };
  },
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
console.log([...range]); // [1, 2, 3, 4, 5]

// Symbol.toPrimitive -- tùy chỉnh type conversion
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number":
        return this.amount;
      case "string":
        return `${this.amount} ${this.currency}`;
      default:
        return this.amount;
    }
  }
}

const price = new Money(100000, "VND");
console.log(+price); // 100000 (number hint)
console.log(`${price}`); // "100000 VND" (string hint)
console.log(price + 50000); // 150000 (default hint)
```

### Đáp án mẫu

> "Symbol là primitive type, mỗi Symbol là duy nhất. Use case chính là tạo unique property keys (tránh xung đột tên), enum pattern (không ai giả mạo được), và Well-known Symbols để tùy chỉnh hành vi của object (Symbol.iterator cho for...of, Symbol.toPrimitive cho type conversion). Symbol.for tạo symbol trong global registry, có thể truy cập ở nhiều nơi. Symbol properties ẩn với Object.keys và JSON.stringify, chỉ thấy qua getOwnPropertySymbols."

---

## Câu 4: WeakMap, WeakSet vs Map, Set `[Senior]`

### Câu hỏi

> WeakMap khác Map ở điểm nào? Khi nào nên dùng WeakMap?

### Giải thích lý thuyết

| Tiêu chí           | Map                                    | WeakMap                                   |
| ------------------ | -------------------------------------- | ----------------------------------------- |
| Key types          | Bất kỳ giá trị                         | Chỉ **object** (và non-registered symbol) |
| Garbage Collection | Key bị giữ reference (không bị GC)     | Key là **weak reference** (có thể bị GC)  |
| Iterable           | Có (`for...of`, `.forEach`, `.keys()`) | **Không**                                 |
| `.size`            | Có                                     | **Không**                                 |
| Use case           | General-purpose                        | Cache, private data, metadata             |

Tương tự cho Set vs WeakSet.

**Điểm then chốt**: Trong WeakMap, nếu không còn reference nào khác trỏ đến key object, key và value sẽ được **garbage collected tự động**. Đây là lý do chính để dùng WeakMap -- tránh memory leak.

### Code ví dụ

```javascript
// ===== Map vs WeakMap -- Memory behavior =====

// Với Map -- giữ reference, không bị GC
const map = new Map();
let objForMap = { name: "Temporary" };
map.set(objForMap, "some data");

objForMap = null; // Xóa reference
// NHƯNG map vẫn giữ reference đến object -> KHÔNG bị GC
// -> Potential memory leak!

// Với WeakMap -- weak reference, có thể bị GC
const weakMap = new WeakMap();
let objForWeak = { name: "Temporary" };
weakMap.set(objForWeak, "some data");

objForWeak = null; // Xóa reference
// Không còn ai reference đến object -> GC sẽ thu hồi nó
// weakMap tự động mất entry này -> KHÔNG memory leak

// ===== Use Case 1: Cache kết quả tính toán =====
const computeCache = new WeakMap();

function expensiveCompute(obj) {
  if (computeCache.has(obj)) {
    console.log("Cache hit!");
    return computeCache.get(obj);
  }

  console.log("Computing...");
  const result = /* tính toán phức tạp */ JSON.stringify(obj).length;
  computeCache.set(obj, result);
  return result;
}

let data = { users: [1, 2, 3, 4, 5] };
expensiveCompute(data); // "Computing..."
expensiveCompute(data); // "Cache hit!"

data = null; // Khi data không còn dùng -> cache tự động được GC
// Không cần manual cache.delete(data)

// ===== Use Case 2: Private data cho class =====
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    // Lưu password "riêng tư" -- không thể truy cập từ bên ngoài
    privateData.set(this, { password });
  }

  checkPassword(input) {
    return privateData.get(this).password === input;
  }
}

const user = new User("An", "secret123");
console.log(user.name); // "An"
console.log(user.checkPassword("secret123")); // true
// Không thể truy cập password từ bên ngoài
// Khi user bị GC -> privateData tự động dọn sạch

// ===== Use Case 3: DOM metadata =====
const nodeMetadata = new WeakMap();

function trackElement(element) {
  nodeMetadata.set(element, {
    clickCount: 0,
    lastClicked: null,
  });

  element.addEventListener("click", () => {
    const meta = nodeMetadata.get(element);
    nodeMetadata.set(element, {
      clickCount: meta.clickCount + 1,
      lastClicked: new Date(),
    });
  });
}

// Khi DOM element bị remove -> metadata tự động được GC
// Không cần manual cleanup!

// ===== WeakSet =====
// Use case: Đánh dấu object đã xử lý
const processed = new WeakSet();

function processItem(item) {
  if (processed.has(item)) {
    console.log("Đã xử lý rồi, bỏ qua");
    return;
  }

  // Xử lý item...
  processed.add(item);
  console.log("Xử lý xong:", item.id);
}

let item1 = { id: 1 };
processItem(item1); // "Xử lý xong: 1"
processItem(item1); // "Đã xử lý rồi, bỏ qua"

item1 = null; // item bị GC -> WeakSet tự động xóa
```

### Đáp án mẫu

> "WeakMap chỉ nhận object làm key và giữ **weak reference** -- nếu không còn reference nào khác đến key, cả key và value sẽ được garbage collected tự động. Map giữ strong reference nên có thể gây memory leak. WeakMap không iterable và không có `.size`. Ba use case chính là: (1) cache tự động dọn dẹp, (2) private data cho class, và (3) metadata cho DOM elements. Dùng WeakMap khi data phụ thuộc vào lifecycle của object -- khi object 'chết', data cũng 'chết' theo."

---

## Câu 5: Proxy và Reflect `[Senior]`

### Câu hỏi

> Proxy là gì? Cho ví dụ thực tế. Reflect dùng để làm gì?

### Giải thích lý thuyết

**Proxy** tạo một "lớp trung gian" bao quanh object, cho phép **chặn và tùy chỉnh** các thao tác cơ bản (đọc property, ghi property, gọi function, etc.).

**Reflect** cung cấp các static methods tương ứng với các trap của Proxy, đảm bảo thực hiện hành vi mặc định đúng cách.

| Trap             | Thao tác bị chặn  | Reflect tương ứng          |
| ---------------- | ----------------- | -------------------------- |
| `get`            | Đọc property      | `Reflect.get()`            |
| `set`            | Ghi property      | `Reflect.set()`            |
| `has`            | Operator `in`     | `Reflect.has()`            |
| `deleteProperty` | Operator `delete` | `Reflect.deleteProperty()` |
| `apply`          | Gọi function      | `Reflect.apply()`          |

### Code ví dụ

```javascript
// ===== Cơ bản: Validation proxy =====
function createValidatedObject(schema) {
  return new Proxy(
    {},
    {
      set(target, property, value) {
        const validator = schema[property];

        if (!validator) {
          throw new Error(`Property "${property}" không được phép`);
        }

        if (!validator(value)) {
          throw new Error(`Giá trị không hợp lệ cho "${property}": ${value}`);
        }

        return Reflect.set(target, property, value);
      },
    },
  );
}

const user = createValidatedObject({
  name: (v) => typeof v === "string" && v.length > 0,
  age: (v) => typeof v === "number" && v >= 0 && v <= 150,
  email: (v) => typeof v === "string" && v.includes("@"),
});

user.name = "An"; // OK
user.age = 25; // OK
user.email = "an@ex.com"; // OK
// user.age = -5;         // Error: Giá trị không hợp lệ cho "age": -5
// user.phone = "123";    // Error: Property "phone" không được phép

// ===== Logging proxy -- debug và monitoring =====
function createLoggingProxy(target, label) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = Reflect.get(obj, prop);
      console.log(`[${label}] GET ${String(prop)} = ${JSON.stringify(value)}`);
      return value;
    },
    set(obj, prop, value) {
      console.log(`[${label}] SET ${String(prop)} = ${JSON.stringify(value)}`);
      return Reflect.set(obj, prop, value);
    },
  });
}

const config = createLoggingProxy({ theme: "dark" }, "Config");
config.theme; // [Config] GET theme = "dark"
config.language = "vi"; // [Config] SET language = "vi"

// ===== Negative array index (Python-style) =====
function createNegativeArray(array) {
  return new Proxy(array, {
    get(target, prop) {
      const index = Number(prop);
      if (Number.isInteger(index) && index < 0) {
        // arr[-1] -> phần tử cuối
        return target[target.length + index];
      }
      return Reflect.get(target, prop);
    },
  });
}

const arr = createNegativeArray([10, 20, 30, 40, 50]);
console.log(arr[-1]); // 50
console.log(arr[-2]); // 40
console.log(arr[0]); // 10

// ===== Reactive data (giống Vue 3 reactivity system) =====
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, property, value) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value);

      if (oldValue !== value) {
        onChange(property, value, oldValue);
      }

      return result;
    },
  });
}

const state = reactive({ count: 0, name: "An" }, (prop, newVal, oldVal) => {
  console.log(`${prop} thay đổi: ${oldVal} -> ${newVal}`);
  // Re-render UI ở đây...
});

state.count = 1; // "count thay đổi: 0 -> 1"
state.name = "Binh"; // "name thay đổi: An -> Binh"
state.count = 1; // Không log (giá trị không thay đổi)
```

### Đáp án mẫu

> "Proxy tạo lớp trung gian chặn và tùy chỉnh các thao tác trên object (get, set, has, delete, etc.). Use case thực tế gồm: validation (kiểm tra giá trị trước khi set), logging/debugging, reactive data (nền tảng của Vue 3), và tạo API thân thiện hơn (như negative array index). Reflect cung cấp các method tương ứng để thực hiện hành vi mặc định đúng cách bên trong trap. Proxy mạnh nhưng ảnh hưởng performance, nên chỉ dùng khi cần thiết."

---

## Câu 6: Optional chaining, nullish coalescing `[Intermediate]`

### Câu hỏi

> Optional chaining (`?.`) và nullish coalescing (`??`) giải quyết vấn đề gì? Khác gì với `&&` và `||`?

### Giải thích lý thuyết

| Operator | Cú pháp                           | Mục đích                                                             |
| -------- | --------------------------------- | -------------------------------------------------------------------- |
| `?.`     | `obj?.prop`, `arr?.[0]`, `fn?.()` | Truy cập an toàn, trả về `undefined` nếu null/undefined              |
| `??`     | `a ?? b`                          | Trả về `b` chỉ khi `a` là `null` hoặc `undefined`                    |
| `\|\|`   | `a \|\| b`                        | Trả về `b` khi `a` là **falsy** (0, "", false, null, undefined, NaN) |

**Điểm khác biệt quan trọng**: `??` chỉ xét `null`/`undefined`, còn `||` xét tất cả falsy values.

### Code ví dụ

```javascript
// ===== Optional chaining =====
const user = {
  name: "An",
  address: {
    city: "Ha Noi",
  },
  // settings không tồn tại
};

// Trước ES2020:
const city1 = user && user.address && user.address.city;

// Với optional chaining:
const city2 = user?.address?.city; // "Ha Noi"
const zip = user?.address?.zipCode; // undefined (không lỗi)
const phone = user?.contact?.phone; // undefined (không lỗi)

// Với array và function
const users = [{ name: "An" }];
console.log(users?.[0]?.name); // "An"
console.log(users?.[5]?.name); // undefined (không lỗi)

const callback = null;
callback?.(); // Không làm gì (không lỗi)

// Method có thể không tồn tại
const result = user?.getFullName?.(); // undefined nếu không có method

// ===== Nullish coalescing =====

// Vấn đề với || :
const port1 = 0 || 3000; // 3000 -- SAI! 0 là port hợp lệ
const debug1 = false || true; // true -- SAI! false là giá trị có ý nghĩa
const title1 = "" || "Default"; // "Default" -- Có thể SAI nếu "" là hợp lệ

// Với ?? :
const port2 = 0 ?? 3000; // 0 -- ĐÚNG! 0 không phải null/undefined
const debug2 = false ?? true; // false -- ĐÚNG!
const title2 = "" ?? "Default"; // "" -- ĐÚNG!
const name2 = null ?? "Guest"; // "Guest" -- ĐÚNG! null -> dùng default
const age2 = undefined ?? 18; // 18 -- ĐÚNG! undefined -> dùng default

// ===== Kết hợp ?. và ?? =====
const config = {
  database: {
    // port không được set
  },
};

const dbPort = config?.database?.port ?? 5432;
console.log(dbPort); // 5432 (default vì port là undefined)

// ===== Thực tế: Parse API response an toàn =====
function getUserDisplayName(apiResponse) {
  return (
    apiResponse?.data?.user?.displayName ??
    apiResponse?.data?.user?.email?.split("@")?.[0] ??
    "Anonymous"
  );
}

console.log(getUserDisplayName({ data: { user: { displayName: "An" } } }));
// "An"

console.log(getUserDisplayName({ data: { user: { email: "an@ex.com" } } }));
// "an"

console.log(getUserDisplayName({}));
// "Anonymous"

console.log(getUserDisplayName(null));
// "Anonymous"

// ===== Bảng so sánh || vs ?? =====
// | Giá trị a      | a || b    | a ?? b    |
// |----------------|-----------|-----------|
// | null           | b         | b         |
// | undefined      | b         | b         |
// | 0              | b         | a (= 0)   |
// | ""             | b         | a (= "")  |
// | false          | b         | a (= false)|
// | NaN            | b         | a (= NaN)  |
// | "hello"        | a         | a         |
// | 42             | a         | a         |
```

### Đáp án mẫu

> "Optional chaining (`?.`) cho phép truy cập property an toàn -- trả về `undefined` thay vì throw TypeError khi gặp null/undefined. Nullish coalescing (`??`) cung cấp giá trị default chỉ khi giá trị là `null` hoặc `undefined`, khác với `||` xét tất cả falsy. Đây là sự khác biệt quan trọng: `0 ?? 10` trả về `0` (đúng), `0 || 10` trả về `10` (sai khi 0 là giá trị hợp lệ). Kết hợp `?.` và `??` tạo pattern truy cập dữ liệu cực kỳ an toàn."

---

## Lỗi thường gặp khi trả lời

| Lỗi                                        | Giải thích đúng                                                                                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Spread tạo deep copy"                     | Sai -- spread chỉ tạo **shallow copy**. Nested objects vẫn là reference. Dùng `structuredClone` cho deep copy.                                                  |
| "Symbol giống string constant"             | Không -- Symbol là **duy nhất**, hai Symbol với cùng description vẫn khác nhau. String constants có thể trùng.                                                  |
| "WeakMap chậm hơn Map"                     | Không nhất thiết. WeakMap có trade-off khác: không iterable, không có `.size`, nhưng performance get/set tương đương. Lợi thế chính là memory management.       |
| "Proxy giống middleware"                   | Gần đúng nhưng không chính xác. Proxy chặn **thao tác trên object** (get, set, delete), middleware chặn **request/response**. Proxy hoạt động ở level thấp hơn. |
| "`??` giống `\|\|`"                        | Sai -- `??` chỉ xét null/undefined. `\|\|` xét tất cả falsy values (0, "", false, NaN). Đây là khác biệt cực kỳ quan trọng trong thực tế.                       |
| "Destructuring tạo biến cho tất cả levels" | Sai -- khi nested destructure như `{ a: { b } } = obj`, chỉ `b` là biến. `a` chỉ là "đường dẫn", không trở thành biến.                                          |
