---
sidebar_position: 5
title: "ES6+: Destructuring, Spread, Proxy, WeakMap, Symbol"
---

# ES6+: Destructuring, Spread, Proxy, WeakMap, Symbol

ES6+ mang den rat nhieu tinh nang manh me ma interviewer thuong hoi de kiem tra ban co thuc su cap nhat kien thuc hay khong. Phan nay tap trung vao nhung tinh nang "nang cao hon" ma khong phai developer nao cung nam vung.

---

## Cau 1: Destructuring nang cao `[Intermediate]`

### Cau hoi

> Cho vi du ve nested destructuring, default values, va rename. Nhung truong hop nao destructuring co the gay loi?

### Giai thich ly thuyet

Destructuring la cu phap "boc tach" gia tri tu object/array vao bien rieng. Ngoai cach dung co ban, no con ho tro:

- **Nested destructuring**: Boc tach object/array long nhau
- **Default values**: Gan gia tri mac dinh khi property la `undefined`
- **Rename**: Doi ten bien khi destructure
- **Rest**: Lay phan con lai vao mot bien

### Code vi du

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

// Boc tach sau nhieu tang
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

console.log(name);     // "An"
console.log(city);     // "Ha Noi"
console.log(page);     // 1
console.log(status);   // 200
// Luu y: "data", "user", "address", "meta" KHONG la bien -- chi la duong dan

// ===== Default values =====
const config = { theme: "dark" };

const {
  theme = "light",       // co gia tri -> "dark"
  language = "vi",       // undefined -> dung default "vi"
  fontSize = 14,         // undefined -> dung default 14
} = config;

console.log(theme);    // "dark" (gia tri thuc)
console.log(language); // "vi" (default)
console.log(fontSize); // 14 (default)

// CANH BAO: Default chi ap dung voi undefined, KHONG ap dung voi null
const { value = 42 } = { value: null };
console.log(value); // null -- KHONG phai 42!

// ===== Rename =====
const apiResponse = {
  user_name: "An",
  user_age: 25,
  is_active: true,
};

// Rename tu snake_case sang camelCase
const {
  user_name: userName,
  user_age: userAge,
  is_active: isActive,
} = apiResponse;

console.log(userName); // "An"
console.log(userAge);  // 25

// ===== Rename + Default =====
const { role: userRole = "member" } = {};
console.log(userRole); // "member"

// ===== Array destructuring nang cao =====
const matrix = [[1, 2], [3, 4], [5, 6]];
const [[a, b], [c, d], [e, f]] = matrix;
console.log(a, b, c, d, e, f); // 1 2 3 4 5 6

// Bo qua phan tu
const [first, , third] = [10, 20, 30];
console.log(first, third); // 10 30

// Swap bien khong can temp
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

// Goi voi object
createUser({ name: "An", email: "an@example.com" });
// Goi khong co tham so cung khong loi (nho = {})
createUser();

// ===== Truong hop gay loi =====
// const { a } = undefined; // TypeError: Cannot destructure property 'a' of undefined
// const { a } = null;      // TypeError

// An toan voi default:
const { a: safeA } = undefined || {};
console.log(safeA); // undefined (khong loi)
```

### Dap an mau

> "Destructuring ho tro nested, default values, rename va rest pattern. Diem can luu y: default chi ap dung voi `undefined` (khong ap dung voi `null`), destructure tu `undefined`/`null` se throw TypeError, va khi nested destructure thi cac 'duong dan' trung gian khong tro thanh bien. Trong thuc te, destructuring function parameters voi default value la pattern cuc ky huu ich de tao clean API."

---

## Cau 2: Spread va Rest operator `[Intermediate]`

### Cau hoi

> Phan biet spread (`...`) va rest (`...`) operator. Spread co phai deep copy khong?

### Giai thich ly thuyet

Cung cu phap `...` nhung hai chuc nang:

| Chuc nang | Vi tri | Y nghia |
|---|---|---|
| **Spread** | Trong array/object literal, function call | "Trai ra" cac phan tu |
| **Rest** | Trong destructuring, function params | "Thu gom" phan con lai |

**Quan trong**: Spread chi tao **shallow copy** -- object/array long ben trong van la reference!

### Code vi du

```javascript
// ===== Spread: "Trai ra" =====

// Spread array
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2];     // [1, 2, 3, 4, 5, 6]
const withExtra = [0, ...arr1, 99];    // [0, 1, 2, 3, 99]

// Spread object
const defaults = { theme: "light", lang: "vi", fontSize: 14 };
const userPrefs = { theme: "dark", fontSize: 16 };
const config = { ...defaults, ...userPrefs };
// { theme: "dark", lang: "vi", fontSize: 16 }
// Property sau ghi de property truoc

// Spread trong function call
const numbers = [3, 1, 4, 1, 5];
console.log(Math.max(...numbers)); // 5 -- tuong duong Math.max(3, 1, 4, 1, 5)

// ===== Rest: "Thu gom" =====

// Rest trong destructuring
const { theme: t, ...otherConfig } = config;
console.log(t);           // "dark"
console.log(otherConfig); // { lang: "vi", fontSize: 16 }

// Rest trong function params
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// Ket hop params va rest
function logWithPrefix(prefix, ...messages) {
  messages.forEach((msg) => console.log(`[${prefix}] ${msg}`));
}
logWithPrefix("INFO", "Server started", "Port 3000");
// [INFO] Server started
// [INFO] Port 3000

// ===== SHALLOW COPY -- cuc ky quan trong! =====
const original = {
  name: "An",
  scores: [90, 85, 92],
  address: { city: "Ha Noi" },
};

const copy = { ...original };

// Primitive values: duoc copy
copy.name = "Binh";
console.log(original.name); // "An" -- khong bi anh huong

// Objects/Arrays: chi copy REFERENCE
copy.scores.push(100);
console.log(original.scores); // [90, 85, 92, 100] -- BI ANH HUONG!

copy.address.city = "Da Nang";
console.log(original.address.city); // "Da Nang" -- BI ANH HUONG!

// ===== Deep copy dung cach =====
// Cach 1: structuredClone (modern, khuyen dung)
const deepCopy1 = structuredClone(original);

// Cach 2: JSON (don gian nhung co han che -- mat function, Date bi convert)
const deepCopy2 = JSON.parse(JSON.stringify(original));

// Cach 3: Thu vien (lodash)
// const deepCopy3 = _.cloneDeep(original);

// ===== Thuc hanh: immutable update pattern =====
const users = [
  { id: 1, name: "An", active: true },
  { id: 2, name: "Binh", active: true },
  { id: 3, name: "Cuong", active: false },
];

// Update user id=2, khong mutate array goc
const updatedUsers = users.map((user) =>
  user.id === 2 ? { ...user, name: "Binh Updated" } : user
);
// original users van nhu cu
```

### Dap an mau

> "Spread trai ra phan tu (dung trong array/object literal va function call), rest thu gom phan con lai (dung trong destructuring va function params). Diem cuc ky quan trong la spread chi tao **shallow copy** -- nested objects/arrays van la reference chung. De deep copy, dung `structuredClone` (ES2022) hoac JSON parse/stringify. Trong React/Redux, immutable update pattern dung spread + map de update state ma khong mutate."

---

## Cau 3: Symbol -- use cases va well-known symbols `[Senior]`

### Cau hoi

> Symbol la gi? Cho vi du use case thuc te. Well-known Symbols la gi?

### Giai thich ly thuyet

**Symbol** la primitive type duoc gioi thieu trong ES6. Moi Symbol la **duy nhat** (unique), khong bao gio bang Symbol khac.

Use cases chinh:
1. **Unique property keys**: Tranh trung ten property
2. **Constants khong trung**: Enum pattern
3. **Well-known Symbols**: Tuy chinh hanh vi cua cac built-in operations

### Code vi du

```javascript
// ===== Co ban: Symbol la duy nhat =====
const sym1 = Symbol("mo ta");
const sym2 = Symbol("mo ta");
console.log(sym1 === sym2); // false! Du cung description

// Symbol khong tu convert sang string
// console.log("Value: " + sym1); // TypeError!
console.log(`Value: ${sym1.toString()}`); // "Value: Symbol(mo ta)"
console.log(`Value: ${sym1.description}`); // "Value: mo ta"

// ===== Use Case 1: Unique property keys =====
const LOG_LEVEL = Symbol("logLevel");
const CREATED_AT = Symbol("createdAt");

const request = {
  url: "/api/users",
  method: "GET",
  // Metadata an, khong xung dot voi property binh thuong
  [LOG_LEVEL]: "debug",
  [CREATED_AT]: Date.now(),
};

console.log(request.url);        // "/api/users"
console.log(request[LOG_LEVEL]); // "debug"

// Symbol keys KHONG xuat hien trong:
console.log(Object.keys(request));           // ["url", "method"]
console.log(JSON.stringify(request));         // '{"url":"/api/users","method":"GET"}'
// Chi thay qua:
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
      return "Dang cho xu ly";
    case Status.APPROVED:
      return "Da duyet";
    case Status.REJECTED:
      return "Tu choi";
    default:
      throw new Error("Trang thai khong hop le");
  }
}

// Khong ai co the "gia mao" status vi Symbol la duy nhat
// processRequest("PENDING") -> throw Error (string khong === Symbol)

// ===== Use Case 3: Symbol.for -- global registry =====
const globalSym1 = Symbol.for("app.config");
const globalSym2 = Symbol.for("app.config");
console.log(globalSym1 === globalSym2); // true! Cung key trong global registry

// ===== Well-known Symbols =====

// Symbol.iterator -- tuy chinh for...of
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

// Symbol.toPrimitive -- tuy chinh type conversion
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
console.log(+price);      // 100000 (number hint)
console.log(`${price}`);   // "100000 VND" (string hint)
console.log(price + 50000); // 150000 (default hint)
```

### Dap an mau

> "Symbol la primitive type, moi Symbol la duy nhat. Use case chinh la tao unique property keys (tranh xung dot ten), enum pattern (khong ai gia mao duoc), va Well-known Symbols de tuy chinh hanh vi cua object (Symbol.iterator cho for...of, Symbol.toPrimitive cho type conversion). Symbol.for tao symbol trong global registry, co the truy cap o nhieu noi. Symbol properties an voi Object.keys va JSON.stringify, chi thay qua getOwnPropertySymbols."

---

## Cau 4: WeakMap, WeakSet vs Map, Set `[Senior]`

### Cau hoi

> WeakMap khac Map o diem nao? Khi nao nen dung WeakMap?

### Giai thich ly thuyet

| Tieu chi | Map | WeakMap |
|---|---|---|
| Key types | Bat ky gia tri | Chi **object** (va non-registered symbol) |
| Garbage Collection | Key bi giu reference (khong bi GC) | Key la **weak reference** (co the bi GC) |
| Iterable | Co (`for...of`, `.forEach`, `.keys()`) | **Khong** |
| `.size` | Co | **Khong** |
| Use case | General-purpose | Cache, private data, metadata |

Tuong tu cho Set vs WeakSet.

**Diem then chot**: Trong WeakMap, neu khong con reference nao khac tro den key object, key va value se duoc **garbage collected tu dong**. Day la ly do chinh de dung WeakMap -- tranh memory leak.

### Code vi du

```javascript
// ===== Map vs WeakMap -- Memory behavior =====

// Voi Map -- giu reference, khong bi GC
const map = new Map();
let objForMap = { name: "Temporary" };
map.set(objForMap, "some data");

objForMap = null; // Xoa reference
// NHUNG map van giu reference den object -> KHONG bi GC
// -> Potential memory leak!

// Voi WeakMap -- weak reference, co the bi GC
const weakMap = new WeakMap();
let objForWeak = { name: "Temporary" };
weakMap.set(objForWeak, "some data");

objForWeak = null; // Xoa reference
// Khong con ai reference den object -> GC se thu hoi no
// weakMap tu dong mat entry nay -> KHONG memory leak

// ===== Use Case 1: Cache ket qua tinh toan =====
const computeCache = new WeakMap();

function expensiveCompute(obj) {
  if (computeCache.has(obj)) {
    console.log("Cache hit!");
    return computeCache.get(obj);
  }

  console.log("Computing...");
  const result = /* tinh toan phuc tap */ JSON.stringify(obj).length;
  computeCache.set(obj, result);
  return result;
}

let data = { users: [1, 2, 3, 4, 5] };
expensiveCompute(data); // "Computing..."
expensiveCompute(data); // "Cache hit!"

data = null; // Khi data khong con dung -> cache tu dong duoc GC
// Khong can manual cache.delete(data)

// ===== Use Case 2: Private data cho class =====
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    // Luu password "rieng tu" -- khong the truy cap tu ben ngoai
    privateData.set(this, { password });
  }

  checkPassword(input) {
    return privateData.get(this).password === input;
  }
}

const user = new User("An", "secret123");
console.log(user.name);                   // "An"
console.log(user.checkPassword("secret123")); // true
// Khong the truy cap password tu ben ngoai
// Khi user bi GC -> privateData tu dong don sach

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

// Khi DOM element bi remove -> metadata tu dong duoc GC
// Khong can manual cleanup!

// ===== WeakSet =====
// Use case: Danh dau object da xu ly
const processed = new WeakSet();

function processItem(item) {
  if (processed.has(item)) {
    console.log("Da xu ly roi, bo qua");
    return;
  }

  // Xu ly item...
  processed.add(item);
  console.log("Xu ly xong:", item.id);
}

let item1 = { id: 1 };
processItem(item1); // "Xu ly xong: 1"
processItem(item1); // "Da xu ly roi, bo qua"

item1 = null; // item bi GC -> WeakSet tu dong xoa
```

### Dap an mau

> "WeakMap chi nhan object lam key va giu **weak reference** -- neu khong con reference nao khac den key, ca key va value se duoc garbage collected tu dong. Map giu strong reference nen co the gay memory leak. WeakMap khong iterable va khong co `.size`. Ba use case chinh la: (1) cache tu dong don dep, (2) private data cho class, va (3) metadata cho DOM elements. Dung WeakMap khi data phu thuoc vao lifecycle cua object -- khi object 'chet', data cung 'chet' theo."

---

## Cau 5: Proxy va Reflect `[Senior]`

### Cau hoi

> Proxy la gi? Cho vi du thuc te. Reflect dung de lam gi?

### Giai thich ly thuyet

**Proxy** tao mot "lop trung gian" bao quanh object, cho phep **chan va tuy chinh** cac thao tac co ban (doc property, ghi property, goi function, etc.).

**Reflect** cung cap cac static methods tuong ung voi cac trap cua Proxy, dam bao thuc hien hanh vi mac dinh dung cach.

| Trap | Thao tac bi chan | Reflect tuong ung |
|---|---|---|
| `get` | Doc property | `Reflect.get()` |
| `set` | Ghi property | `Reflect.set()` |
| `has` | Operator `in` | `Reflect.has()` |
| `deleteProperty` | Operator `delete` | `Reflect.deleteProperty()` |
| `apply` | Goi function | `Reflect.apply()` |

### Code vi du

```javascript
// ===== Co ban: Validation proxy =====
function createValidatedObject(schema) {
  return new Proxy(
    {},
    {
      set(target, property, value) {
        const validator = schema[property];

        if (!validator) {
          throw new Error(`Property "${property}" khong duoc phep`);
        }

        if (!validator(value)) {
          throw new Error(`Gia tri khong hop le cho "${property}": ${value}`);
        }

        return Reflect.set(target, property, value);
      },
    }
  );
}

const user = createValidatedObject({
  name: (v) => typeof v === "string" && v.length > 0,
  age: (v) => typeof v === "number" && v >= 0 && v <= 150,
  email: (v) => typeof v === "string" && v.includes("@"),
});

user.name = "An";        // OK
user.age = 25;           // OK
user.email = "an@ex.com"; // OK
// user.age = -5;         // Error: Gia tri khong hop le cho "age": -5
// user.phone = "123";    // Error: Property "phone" khong duoc phep

// ===== Logging proxy -- debug va monitoring =====
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
config.theme;            // [Config] GET theme = "dark"
config.language = "vi";  // [Config] SET language = "vi"

// ===== Negative array index (Python-style) =====
function createNegativeArray(array) {
  return new Proxy(array, {
    get(target, prop) {
      const index = Number(prop);
      if (Number.isInteger(index) && index < 0) {
        // arr[-1] -> phan tu cuoi
        return target[target.length + index];
      }
      return Reflect.get(target, prop);
    },
  });
}

const arr = createNegativeArray([10, 20, 30, 40, 50]);
console.log(arr[-1]); // 50
console.log(arr[-2]); // 40
console.log(arr[0]);  // 10

// ===== Reactive data (giong Vue 3 reactivity system) =====
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
  console.log(`${prop} thay doi: ${oldVal} -> ${newVal}`);
  // Re-render UI o day...
});

state.count = 1; // "count thay doi: 0 -> 1"
state.name = "Binh"; // "name thay doi: An -> Binh"
state.count = 1; // Khong log (gia tri khong thay doi)
```

### Dap an mau

> "Proxy tao lop trung gian chan va tuy chinh cac thao tac tren object (get, set, has, delete, etc.). Use case thuc te gom: validation (kiem tra gia tri truoc khi set), logging/debugging, reactive data (nen tang cua Vue 3), va tao API than thien hon (nhu negative array index). Reflect cung cap cac method tuong ung de thuc hien hanh vi mac dinh dung cach ben trong trap. Proxy manh nhung anh huong performance, nen chi dung khi can thiet."

---

## Cau 6: Optional chaining, nullish coalescing `[Intermediate]`

### Cau hoi

> Optional chaining (`?.`) va nullish coalescing (`??`) giai quyet van de gi? Khac gi voi `&&` va `||`?

### Giai thich ly thuyet

| Operator | Cu phap | Muc dich |
|---|---|---|
| `?.` | `obj?.prop`, `arr?.[0]`, `fn?.()` | Truy cap an toan, tra ve `undefined` neu null/undefined |
| `??` | `a ?? b` | Tra ve `b` chi khi `a` la `null` hoac `undefined` |
| `\|\|` | `a \|\| b` | Tra ve `b` khi `a` la **falsy** (0, "", false, null, undefined, NaN) |

**Diem khac biet quan trong**: `??` chi xet `null`/`undefined`, con `||` xet tat ca falsy values.

### Code vi du

```javascript
// ===== Optional chaining =====
const user = {
  name: "An",
  address: {
    city: "Ha Noi",
  },
  // settings khong ton tai
};

// Truoc ES2020:
const city1 = user && user.address && user.address.city;

// Voi optional chaining:
const city2 = user?.address?.city; // "Ha Noi"
const zip = user?.address?.zipCode; // undefined (khong loi)
const phone = user?.contact?.phone; // undefined (khong loi)

// Voi array va function
const users = [{ name: "An" }];
console.log(users?.[0]?.name); // "An"
console.log(users?.[5]?.name); // undefined (khong loi)

const callback = null;
callback?.(); // Khong lam gi (khong loi)

// Method co the khong ton tai
const result = user?.getFullName?.(); // undefined neu khong co method

// ===== Nullish coalescing =====

// Van de voi || :
const port1 = 0 || 3000;        // 3000 -- SAI! 0 la port hop le
const debug1 = false || true;     // true -- SAI! false la gia tri co y nghia
const title1 = "" || "Default";  // "Default" -- Co the SAI neu "" la hop le

// Voi ?? :
const port2 = 0 ?? 3000;        // 0 -- DUNG! 0 khong phai null/undefined
const debug2 = false ?? true;     // false -- DUNG!
const title2 = "" ?? "Default";  // "" -- DUNG!
const name2 = null ?? "Guest";   // "Guest" -- DUNG! null -> dung default
const age2 = undefined ?? 18;    // 18 -- DUNG! undefined -> dung default

// ===== Ket hop ?. va ?? =====
const config = {
  database: {
    // port khong duoc set
  },
};

const dbPort = config?.database?.port ?? 5432;
console.log(dbPort); // 5432 (default vi port la undefined)

// ===== Thuc te: Parse API response an toan =====
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

// ===== Bang so sanh || vs ?? =====
// | Gia tri a      | a || b    | a ?? b    |
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

### Dap an mau

> "Optional chaining (`?.`) cho phep truy cap property an toan -- tra ve `undefined` thay vi throw TypeError khi gap null/undefined. Nullish coalescing (`??`) cung cap gia tri default chi khi gia tri la `null` hoac `undefined`, khac voi `||` xet tat ca falsy. Day la su khac biet quan trong: `0 ?? 10` tra ve `0` (dung), `0 || 10` tra ve `10` (sai khi 0 la gia tri hop le). Ket hop `?.` va `??` tao pattern truy cap du lieu cuc ky an toan."

---

## Loi thuong gap khi tra loi

| Loi | Giai thich dung |
|---|---|
| "Spread tao deep copy" | Sai -- spread chi tao **shallow copy**. Nested objects van la reference. Dung `structuredClone` cho deep copy. |
| "Symbol giong string constant" | Khong -- Symbol la **duy nhat**, hai Symbol voi cung description van khac nhau. String constants co the trung. |
| "WeakMap cham hon Map" | Khong nhat thiet. WeakMap co trade-off khac: khong iterable, khong co `.size`, nhung performance get/set tuong duong. Loi the chinh la memory management. |
| "Proxy giong middleware" | Gan dung nhung khong chinh xac. Proxy chan **thao tac tren object** (get, set, delete), middleware chan **request/response**. Proxy hoat dong o level thap hon. |
| "`??` giong `\|\|`" | Sai -- `??` chi xet null/undefined. `\|\|` xet tat ca falsy values (0, "", false, NaN). Day la khac biet cuc ky quan trong trong thuc te. |
| "Destructuring tao bien cho tat ca levels" | Sai -- khi nested destructure nhu `{ a: { b } } = obj`, chi `b` la bien. `a` chi la "duong dan", khong tro thanh bien. |
