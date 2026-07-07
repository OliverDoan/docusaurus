---
sidebar_position: 3
title: "3. Method Overriding và Constructor Overloading"
---

# Method Overriding và Constructor Overloading

**Method overriding** (ghi đè phương thức) là khi lớp con định nghĩa lại một phương thức đã có sẵn ở lớp cha để thay đổi hành vi của nó. **Overloading** (nạp chồng) cho phép khai báo nhiều "phiên bản" chữ ký cho cùng một hàm hoặc constructor, để cùng một tên có thể nhận các tham số khác nhau. Bài này giúp bạn mới học hiểu cách tùy biến hành vi kế thừa và viết hàm linh hoạt hơn trong TypeScript.

---

## Mục lục

- [Vì sao có overriding & overloading?](#vì-sao-có-overriding--overloading)
- [Method Overriding](#method-overriding)
- [Từ khóa override](#từ-khóa-override)
- [Constructor Overloading](#constructor-overloading)
- [Method Overloading](#method-overloading)

---

## Vì sao có overriding & overloading?

**Vấn đề:**

```ts
// (1) Ghi đè method cha bằng cách gõ tay — gõ sai tên là JS lặng lẽ
// tạo method MỚI chứ không báo lỗi → bug khó tìm.
class Animal {
  speak(): string { return "..."; }
}

class Dog extends Animal {
  speack(): string { return "Woof!"; } // typo "speack"!
  // JS coi đây là method mới, Animal.speak() vẫn được gọi → sai hành vi.
}

// (2) Một hàm cần nhận NHIỀU DẠNG tham số với kiểu trả về tương ứng,
// nhưng một chữ ký đơn không diễn tả chính xác được.
function parse(input: string | number): string | number {
  return input; // gọi parse("x") cũng cho kiểu string | number → mơ hồ
}
```

**Giải pháp:**

```ts
// (1) Từ khóa override — TS báo lỗi nếu method cha KHÔNG tồn tại.
// Bật noImplicitOverride để ghi đè luôn an toàn.
class Dog extends Animal {
  override speack(): string { return "Woof!"; }
  //       ^ Error: This member cannot have an 'override' modifier
  //         because it is not declared in the base class 'Animal'.
}

// (2) Overload — khai báo nhiều chữ ký, một phần cài đặt.
// Compiler chọn đúng kiểu trả về theo đối số.
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number {
  return input;
}

parse("x"); // type: string
parse(10);  // type: number
```

Sơ đồ dưới phân biệt hai khái niệm dễ nhầm: **override** xảy ra giữa lớp cha và lớp con, còn **overload** là nhiều chữ ký cho cùng một tên trong một phạm vi.

```mermaid
flowchart TD
    Q{"Muốn làm gì?"}
    Q -->|"Viết lại method cha ở lớp con"| OV["Override<br/>(cùng tên, cùng signature)"]
    Q -->|"Một tên nhận nhiều dạng tham số"| OL["Overload<br/>(nhiều signature, 1 cài đặt)"]
    OV --> OVK["Dùng 'override' + noImplicitOverride<br/>để chặn typo và rename lệch"]
    OV --> OVR["Runtime dynamic dispatch<br/>chọn version theo class thực"]
    OL --> OLK["Khai báo các signature trước<br/>rồi 1 hàm cài đặt chung"]
    OL --> OLR["Compile-time: TS chọn kiểu trả về<br/>theo đối số truyền vào"]
```

:::tip[Dùng thực tế]

- Ghi đè method an toàn khi kế thừa: `override` + `noImplicitOverride` chặn typo và bắt lỗi khi method cha bị rename.
- Hàm tạo nhận `(string)` hoặc `(number)` và trả về kiểu khác nhau tùy đối số.
- API linh hoạt nhưng vẫn type-safe: một tên hàm phục vụ nhiều dạng input, IntelliSense gợi ý đúng từng overload.
- Refactor lớp cha yên tâm: đổi chữ ký method cha là TS lập tức báo mọi nơi ghi đè bị lệch.

:::

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

Sơ đồ dưới mô tả cách compiler khớp lời gọi với đúng overload signature để suy ra kiểu trả về.

```mermaid
flowchart TD
    Call["c.add(x, y)"] --> Match{"Khớp signature nào?"}
    Match -->|"(number, number)"| S1["Trả về number"]
    Match -->|"(string, string)"| S2["Trả về string"]
    Match -->|"Không khớp signature nào"| Err["Compile error"]
    S1 --> Impl["Chạy phần cài đặt add(a, b)"]
    S2 --> Impl
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
