---
sidebar_position: 2
title: "2. Abstract Classes và Inheritance"
---

# Abstract Classes và Inheritance

**Inheritance** (kế thừa) cho phép một class con tái sử dụng và mở rộng thuộc tính, phương thức từ một class cha. **Abstract class** (lớp trừu tượng) là class chỉ dùng làm khuôn mẫu chung, không thể tạo đối tượng trực tiếp mà phải được class con kế thừa và hoàn thiện. Hai khái niệm này giúp bạn chia sẻ code chung và xây dựng hệ thống class có cấu trúc rõ ràng.

---

## Mục lục

- [Inheritance (kế thừa)](#inheritance-kế-thừa)
- [Abstract Class](#abstract-class)
- [Polymorphism (đa hình)](#polymorphism-đa-hình)
- [Interface vs Abstract Class](#interface-vs-abstract-class)

---

## Inheritance (kế thừa)

Dùng `extends` để class con kế thừa từ class cha.

```ts
class Animal {
  constructor(public name: string) {}

  move() {
    console.log(`${this.name} đang di chuyển`);
  }
}

class Dog extends Animal {
  bark() {
    console.log(`${this.name} sủa`);
  }
}

const d = new Dog("Lulu");
d.move(); // Kế thừa từ Animal
d.bark();
```

Class con có thể gọi `super` để truy cập class cha:

```ts
class Puppy extends Dog {
  constructor(name: string) {
    super(name); // Bắt buộc gọi nếu cha có constructor
  }

  bark() {
    super.bark();           // Gọi method cha
    console.log("(yếu)");
  }
}
```

---

## Abstract Class

`abstract` — class **không thể new trực tiếp**, dùng để định nghĩa
template cho class con.

```ts
abstract class Shape {
  abstract area(): number; // Method abstract — class con phải implement

  describe() {
    return `Diện tích: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

new Shape();         // Error
new Circle(5);       // OK
```

:::info[Phân tích]

Abstract class **khác** interface ở những điểm quan trọng:

| | Abstract Class | Interface |
|--|--|--|
| Có thể chứa code | **Có** (method, constructor, field) | Không (chỉ shape) |
| Tồn tại runtime | **Có** (sinh JS class) | Không (bị xoá) |
| Inheritance | `extends` (1 cha duy nhất) | `implements` (nhiều cùng lúc) |
| Có constructor | Có | Không |

→ Dùng **abstract class** khi muốn **chia sẻ code và bắt subclass tuân
thủ contract** cùng lúc. Dùng **interface** khi chỉ cần contract.

:::

---

## Polymorphism (đa hình)

Đa hình — gọi cùng một method, nhưng kết quả khác nhau tùy class cụ thể.

```ts
abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(private r: number) { super(); }
  area(): number { return Math.PI * this.r ** 2; }
}

class Square extends Shape {
  constructor(private s: number) { super(); }
  area(): number { return this.s ** 2; }
}

function printArea(shapes: Shape[]) {
  for (const s of shapes) {
    console.log(s.area()); // Tự gọi đúng version
  }
}

printArea([new Circle(5), new Square(4)]);
```

TS hỗ trợ đa hình qua **dynamic dispatch** (giống Java) — runtime tự
quyết định gọi method nào dựa trên class thực của object.

---

## Interface vs Abstract Class

```ts
// Cách 1 — interface
interface Repository<T> {
  findById(id: number): T | null;
  save(entity: T): void;
}

class UserRepo implements Repository<User> {
  findById(id: number) { /* ... */ return null; }
  save(user: User) { /* ... */ }
}

// Cách 2 — abstract class
abstract class BaseRepo<T> {
  abstract findById(id: number): T | null;
  abstract save(entity: T): void;

  // Có thể có method dùng chung
  log(action: string) {
    console.log(`[Repo] ${action}`);
  }
}

class UserRepo2 extends BaseRepo<User> {
  findById(id: number) { return null; }
  save(user: User) { this.log("save"); }
}
```

:::tip[Mẹo]

**Khi nào chọn cái nào?**

- Cần **chia sẻ logic** (template method, hook lifecycle) → abstract class.
- Chỉ cần **shape contract** → interface.
- Muốn class có thể implement **nhiều interface** → interface (TS chỉ
  cho `extends` 1 class).
- Muốn **type-only**, không tồn tại runtime → interface.

Trong React/Node app hiện đại, **interface + composition** thường gọn
và linh hoạt hơn abstract class. Abstract class hợp khi xây framework,
ORM, hoặc library cần lifecycle phức tạp.

:::
