---
sidebar_position: 1
title: "1. Class cơ bản và Access Modifiers"
---

# Class cơ bản và Access Modifiers

---

## Mục lục

- [Khai báo class](#khai-báo-class)
- [Constructor và parameter properties](#constructor-và-parameter-properties)
- [Access modifiers](#access-modifiers)
- [readonly property](#readonly-property)
- [static member](#static-member)

---

## Khai báo class

```ts
class User {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  greet(): string {
    return `Hello ${this.name}`;
  }
}

const u = new User(1, "An");
```

---

## Constructor và parameter properties

TypeScript có **shortcut** — khai báo property ngay trong constructor:

```ts
class User {
  constructor(
    public id: number,
    public name: string,
    private password: string,
  ) {}
}
```

Tương đương:

```ts
class User {
  public id: number;
  public name: string;
  private password: string;

  constructor(id: number, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }
}
```

Tiết kiệm dòng đáng kể, đặc biệt khi class có nhiều property.

---

## Access modifiers

| Modifier | Truy cập được từ |
|----------|------------------|
| `public` (mặc định) | Bất kỳ đâu |
| `protected` | Class này và class con |
| `private` | Chỉ class này |

```ts
class Account {
  public username: string;
  protected balance: number;
  private password: string;

  constructor(u: string, b: number, p: string) {
    this.username = u;
    this.balance = b;
    this.password = p;
  }
}

class Saver extends Account {
  showBalance() {
    console.log(this.balance);  // OK — protected
    console.log(this.password); // Error — private
  }
}
```

:::info[Phân tích]

TS có **hai cách** đánh dấu private:

| | `private` (TS) | `#field` (JS) |
|--|--|--|
| Áp dụng từ | TS 1.0 | ECMAScript 2022 |
| Kiểm tra ở | Compile-time | **Runtime** |
| Truy cập từ JS thuần | **Vẫn được** | **Không** (TypeError) |
| Tương thích với `[]` | Vẫn truy cập được | Không |

```ts
class A {
  private a = 1;
  #b = 2;
}

const x = new A() as any;
x.a;     // 1 (TS private bị "lách")
x["a"];  // 1
x["#b"]; // undefined — true private
```

→ Khi cần private **thực sự an toàn** (security, lib API), dùng `#field`.
Còn private cho code app thì `private` TS đủ tốt và dễ debug hơn.

:::

---

## readonly property

`readonly` — chỉ được gán trong constructor, không sửa sau đó.

```ts
class Config {
  constructor(public readonly apiUrl: string) {}
}

const c = new Config("/api");
c.apiUrl = "/other"; // Error
```

Kết hợp với `private`:

```ts
class User {
  constructor(
    private readonly _id: number,
    public name: string,
  ) {}

  get id(): number { return this._id; }
}
```

---

## static member

`static` thuộc về **chính class**, không phải instance.

```ts
class MathUtils {
  static PI = 3.14159;

  static double(n: number): number {
    return n * 2;
  }
}

MathUtils.PI;        // 3.14159
MathUtils.double(5); // 10
```

Static block (TS 4.4+) — chạy khi class được load:

```ts
class App {
  static config: Record<string, string>;

  static {
    App.config = loadConfig();
  }
}
```

:::tip[Mẹo]

**Khi nào dùng static thay vì hàm thường?**

- Khi method **liên quan trực tiếp** đến class (factory, helper, hằng số).
- Khi cần **gom logic** thành namespace (vd `Math.*`, `Array.from`).

Không nên dùng static để gom **mọi util** — sẽ thành "god class". Module
file riêng (`utils/math.ts`) thường gọn hơn.

:::
