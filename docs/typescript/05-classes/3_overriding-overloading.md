---
sidebar_position: 3
title: "3. Method Overriding và Constructor Overloading"
---

# Method Overriding và Constructor Overloading

---

## Mục lục

- [Method Overriding](#method-overriding)
- [Từ khóa override](#từ-khóa-override)
- [Constructor Overloading](#constructor-overloading)
- [Method Overloading](#method-overloading)

---

## Method Overriding

Class con **viết lại** method của class cha với cùng tên và signature.

```ts
class Animal {
  speak(): string {
    return "Generic sound";
  }
}

class Dog extends Animal {
  speak(): string {
    return "Woof!";
  }
}

new Animal().speak(); // "Generic sound"
new Dog().speak();    // "Woof!"
```

Gọi method cha qua `super`:

```ts
class Puppy extends Dog {
  speak(): string {
    return super.speak() + " (yếu)";
  }
}
```

---

## Từ khóa override

`override` (TS 4.3+) đánh dấu rõ rằng method đang **ghi đè** method cha.

```ts
class Animal {
  speak(): string { return ""; }
}

class Dog extends Animal {
  override speak(): string {
    return "Woof!";
  }
}
```

Không bắt buộc, nhưng giúp tránh bug khi rename method ở cha.

:::warning[Cần lưu ý]

Bật flag `noImplicitOverride: true` trong `tsconfig.json` để TS **bắt
buộc** dùng `override` mỗi khi ghi đè:

```ts
// noImplicitOverride: true
class Dog extends Animal {
  speak(): string { return "Woof"; }
  //   ^ Error: This member must have an 'override' modifier
}
```

Tác dụng quan trọng — phát hiện khi:

- Rename method ở class cha mà quên ở class con.
- Vô tình "ghi đè" mà thực ra cha không có method đó (typo).

Đây là một trong các flag "siêu strict" được khuyến nghị cho codebase
nghiêm túc.

:::

---

## Constructor Overloading

Class có **nhiều cách khởi tạo** khác nhau — dùng kỹ thuật overload signature.

```ts
class Point {
  x: number;
  y: number;

  constructor(x: number, y: number);
  constructor(coord: [number, number]);
  constructor(a: number | [number, number], b?: number) {
    if (typeof a === "number") {
      this.x = a;
      this.y = b!;
    } else {
      this.x = a[0];
      this.y = a[1];
    }
  }
}

new Point(1, 2);     // OK
new Point([3, 4]);   // OK
```

:::info[Phân tích]

Constructor overload có cùng hạn chế như function overload:

- Implementation **không nhìn thấy** từ ngoài.
- Logic bên trong dễ rối khi có nhiều case → maintain khó.

**Pattern thay thế** thường gọn hơn — **static factory method**:

```ts
class Point {
  private constructor(public x: number, public y: number) {}

  static fromXY(x: number, y: number): Point {
    return new Point(x, y);
  }

  static fromTuple(t: [number, number]): Point {
    return new Point(t[0], t[1]);
  }
}

Point.fromXY(1, 2);
Point.fromTuple([3, 4]);
```

Mỗi factory **có tên rõ ràng**, dễ đọc, dễ test, không cần check `typeof`.
Đây là pattern được khuyến khích trong codebase domain-driven.

:::

---

## Method Overloading

Tương tự function overload — method có nhiều signature.

```ts
class Calculator {
  add(a: number, b: number): number;
  add(a: string, b: string): string;
  add(a: any, b: any): any {
    return a + b;
  }
}

const c = new Calculator();
c.add(1, 2);       // type: number
c.add("a", "b");   // type: string
```

:::tip[Mẹo]

Trong code app, **generic** hoặc **union với type guard** thường rõ
hơn overload:

```ts
class Calculator {
  add<T extends number | string>(a: T, b: T): T {
    return (a as any) + (b as any);
  }
}
```

Overload chỉ thực sự cần khi **return type không thể biểu diễn bằng
generic** (vd hai signature trả về type hoàn toàn khác nhau).

:::
