---
sidebar_position: 10
title: "10. Kế thừa & interface"
---

# 10. Kế thừa & interface (Inheritance & Interfaces)

:::note[Ghi nhớ nhanh]

- `extends` để kế thừa — **giống JS**. `super(...)` gọi constructor cha — cũng giống JS.
- Java **chỉ kế thừa được 1 class** (đơn kế thừa), nhưng **implements được nhiều interface**.
- **Interface** là "hợp đồng" liệt kê các method mà class phải có — JS không có khái niệm này (TypeScript thì có).
- `@Override` đánh dấu method ghi đè — nên viết để compiler kiểm tra giúp.
- Java kế thừa dựa trên **class** (giống `class` của JS), không phải prototype ẩn phía sau như JS thuần.

:::

---

## Kế thừa với `extends`

Cú pháp gần như giống hệt JS:

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} kêu`;
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} sủa`;
  }
}
```

</td>
<td>

```java
class Animal {
    String name;
    Animal(String name) {
        this.name = name;
    }
    String speak() {
        return name + " kêu";
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);   // gọi constructor cha
    }
    @Override
    String speak() {
        return name + " sủa";
    }
}
```

</td>
</tr>
</table>

`super(name)` gọi constructor lớp cha — giống hệt JS. `@Override` là **annotation** (chú thích) báo cho compiler "đây là method ghi đè"; nếu bạn gõ sai tên, compiler báo lỗi ngay.

---

## Interface — khái niệm mới (nếu bạn chưa dùng TypeScript)

**Interface** là một "hợp đồng": nó liệt kê các method mà class thực thi **phải có**, nhưng không viết phần thân. Nếu bạn từng dùng `interface` trong TypeScript thì ý tưởng tương tự.

```java
interface Payable {
    double calculatePay();   // chỉ có chữ ký, không có thân
}

class Employee implements Payable {
    @Override
    public double calculatePay() {
        return 1000.0;   // class bắt buộc phải hiện thực method này
    }
}
```

Nếu `Employee` quên viết `calculatePay()`, code **không biên dịch được**. Đây là cách Java đảm bảo mọi class "ký hợp đồng" đều tuân thủ.

---

## Đơn kế thừa class, đa "kế thừa" interface

Đây là quy tắc quan trọng khác JS:

```java
// ✅ chỉ 1 class cha
class Dog extends Animal { }

// ✅ nhưng nhiều interface cùng lúc
class Duck extends Animal implements Swimmer, Flyer { }
```

| | Số lượng cho phép |
|---|---|
| `extends` (class) | Tối đa **1** |
| `implements` (interface) | **Nhiều** |

Quy tắc này tránh sự nhập nhằng "kim cương" khi kế thừa nhiều class có cùng method.

---

## Abstract class — nửa class nửa interface

`abstract class` là class **không tạo object trực tiếp được**, dùng làm khuôn chung cho lớp con:

```java
abstract class Shape {
    abstract double area();      // method trừu tượng, lớp con phải viết

    void describe() {            // method thường, dùng chung
        System.out.println("Diện tích: " + area());
    }
}

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    @Override
    double area() { return Math.PI * r * r; }
}
```

JS không có `abstract` chính thức — thường phải giả lập bằng cách ném lỗi trong method. Java hỗ trợ sẵn.

---

## Access modifier — mức độ truy cập

Khi làm OOP nghiêm túc, bạn sẽ gặp 4 mức truy cập (JS chỉ có `#private` và mặc định công khai):

| Modifier | Truy cập được từ |
|---|---|
| `public` | Mọi nơi |
| `protected` | Cùng package + lớp con |
| *(không ghi)* | Cùng package |
| `private` | Chỉ trong class đó |
