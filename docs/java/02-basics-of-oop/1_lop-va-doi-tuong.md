---
sidebar_position: 1
title: "1. Lớp và Đối tượng (Class & Object)"
---

# Lớp và Đối tượng (Class & Object)

Lớp (class) và đối tượng (object) là hai khái niệm nền tảng nhất của lập trình hướng đối tượng trong Java. Lớp giống như bản thiết kế mô tả một sự vật có dữ liệu gì và làm được gì, còn đối tượng là thực thể cụ thể được tạo ra từ bản thiết kế đó. Hiểu rõ hai khái niệm này là bước đầu tiên bắt buộc trước khi học sâu hơn về OOP. Bài này giới thiệu class, object, từ khóa `new`, constructor và `this`.

---

## Mục lục

- [Vì sao cần class & object?](#vì-sao-cần-class--object)
- [OOP là gì?](#oop-là-gì)
- [Lớp (Class) — Khuôn mẫu](#lớp-class--khuôn-mẫu)
- [Đối tượng (Object) — Thực thể cụ thể](#đối-tượng-object--thực-thể-cụ-thể)
- [Tạo đối tượng bằng từ khóa new](#tạo-đối-tượng-bằng-từ-khóa-new)
- [Constructor — Hàm khởi tạo](#constructor--hàm-khởi-tạo)
- [Từ khóa this](#từ-khóa-this)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần class & object?

**Vấn đề:** Giả sử cần lưu thông tin 100 user, mỗi user có tên, email, tuổi. Nếu
dùng các biến rời rạc thì code nhanh chóng hỗn loạn, dữ liệu không gắn được với
hành vi liên quan, và không có "khuôn" để tái lập.

```java
// Mỗi user lại đẻ ra thêm 3 biến rời rạc...
String ten1 = "An";   String email1 = "an@mail.com";   int tuoi1 = 20;
String ten2 = "Bình"; String email2 = "binh@mail.com"; int tuoi2 = 22;
String ten3 = "Cường";String email3 = "cuong@mail.com";int tuoi3 = 19;
// ... lặp tới user thứ 100 thì không thể quản nổi
```

**Giải pháp:** Định nghĩa MỘT **class** làm khuôn mẫu (gồm thuộc tính + phương
thức), rồi tạo bao nhiêu **object** cũng được từ khuôn đó bằng `new`. Mỗi object
giữ dữ liệu riêng và gắn sẵn hành vi liên quan.

```java
// Class User: khuôn mẫu định nghĩa thuộc tính + hành vi
public class User {
    String ten;
    String email;
    int tuoi;

    void chao() {
        System.out.println("Xin chào, tôi là " + ten);
    }
}

// Tạo bao nhiêu object cũng được, mỗi object có dữ liệu riêng
User u1 = new User(); u1.ten = "An";    u1.email = "an@mail.com";   u1.tuoi = 20;
User u2 = new User(); u2.ten = "Bình";  u2.email = "binh@mail.com"; u2.tuoi = 22;
u1.chao(); // Xin chào, tôi là An
```

:::tip[Dùng thực tế]
- **Tạo nhiều thực thể từ một khuôn:** một class `User` sinh ra hàng trăm user mà không cần viết lại cấu trúc.
- **Mỗi object giữ state riêng:** sửa `u1` không ảnh hưởng `u2`.
- **Gắn method với dữ liệu:** hành vi (`chao()`) đi kèm ngay dữ liệu nó cần.
- **Mô hình hoá thực thể nghiệp vụ:** sản phẩm, đơn hàng, tài khoản... mỗi loại là một class.
:::

---

## OOP là gì?

**OOP** (Object-Oriented Programming — lập trình hướng đối tượng) là một cách viết
chương trình bằng cách mô phỏng lại **các sự vật trong thế giới thực** thành các
"đối tượng" trong code. Thay vì viết ra hàng loạt lệnh rời rạc, ta gom dữ liệu và
hành vi liên quan lại với nhau thành từng "khối" gọn gàng.

Ví dụ đời thường: hãy nghĩ về một chiếc **xe hơi**. Một chiếc xe có:

- **Dữ liệu** (đặc điểm): màu sắc, hãng xe, tốc độ hiện tại.
- **Hành vi** (việc nó làm được): tăng tốc, phanh, bấm còi.

OOP cho phép ta gom cả đặc điểm lẫn hành vi của "xe hơi" vào chung một chỗ trong code.

---

## Lớp (Class) — Khuôn mẫu

**Class** (lớp — bản thiết kế/khuôn mẫu để tạo ra đối tượng) giống như **bản vẽ thiết kế**
của một ngôi nhà. Bản vẽ KHÔNG phải là ngôi nhà thật, nó chỉ mô tả ngôi nhà sẽ trông
như thế nào. Từ MỘT bản vẽ, ta có thể xây ra NHIỀU ngôi nhà giống nhau.

Tương tự, một class mô tả: một đối tượng sẽ có những dữ liệu gì và làm được những việc gì.

```java
// Định nghĩa một lớp tên là Car (Xe hơi)
public class Car {
    // Các thuộc tính (dữ liệu mà mỗi chiếc xe sẽ có)
    String color;   // màu sắc
    String brand;   // hãng xe
    int speed;      // tốc độ hiện tại

    // Một phương thức (hành vi mà xe làm được)
    void honk() {
        System.out.println("Bíp bíp!");
    }
}
```

:::tip Quy ước đặt tên
Tên class trong Java được viết theo kiểu **PascalCase**: chữ cái đầu mỗi từ viết hoa,
ví dụ `Car`, `BankAccount`, `StudentRecord`.
:::

---

## Đối tượng (Object) — Thực thể cụ thể

**Object** (đối tượng — một thực thể cụ thể được tạo ra từ class) chính là "ngôi nhà thật"
được xây từ bản vẽ. Từ một class `Car`, ta có thể tạo ra rất nhiều object: chiếc xe đỏ
của bạn, chiếc xe trắng của hàng xóm... Mỗi object có dữ liệu riêng của nó.

| Khái niệm | Ví dụ thực tế | Trong code |
|-----------|---------------|------------|
| Class (khuôn mẫu) | Bản vẽ thiết kế xe | `class Car { ... }` |
| Object (thực thể) | Chiếc xe đỏ cụ thể | `Car myCar = new Car();` |

Một object còn được gọi là một **instance** (thể hiện — một bản cụ thể của class).

---

## Tạo đối tượng bằng từ khóa new

Để tạo một object từ class, ta dùng từ khóa **`new`** (tạo mới — yêu cầu Java cấp phát
bộ nhớ và tạo ra một đối tượng mới).

```java
public class Main {
    public static void main(String[] args) {
        // Tạo một đối tượng Car mới và đặt tên biến là myCar
        Car myCar = new Car();

        // Gán dữ liệu cho từng thuộc tính của object này
        myCar.color = "Đỏ";
        myCar.brand = "Toyota";
        myCar.speed = 0;

        // Truy cập thuộc tính bằng dấu chấm (.)
        System.out.println("Màu xe: " + myCar.color);   // In ra: Màu xe: Đỏ

        // Gọi phương thức của object
        myCar.honk();   // In ra: Bíp bíp!

        // Tạo thêm một đối tượng khác — hoàn toàn độc lập với myCar
        Car yourCar = new Car();
        yourCar.color = "Trắng";
        System.out.println("Màu xe của bạn: " + yourCar.color); // Trắng
    }
}
```

Lưu ý: `myCar` và `yourCar` là hai object riêng biệt. Đổi màu của `myCar` không ảnh
hưởng gì tới `yourCar`.

---

## Constructor — Hàm khởi tạo

**Constructor** (hàm khởi tạo — một hàm đặc biệt chạy tự động ngay khi object được tạo)
giúp ta gán dữ liệu ban đầu cho object NGAY lúc tạo, thay vì phải gán từng dòng như trên.

Đặc điểm của constructor:

- Tên của nó **trùng y hệt** tên class.
- KHÔNG có kiểu trả về (không có `void`, không có `int`...).

```java
public class Car {
    String color;
    String brand;
    int speed;

    // Constructor: nhận màu và hãng để gán ngay khi tạo object
    public Car(String color, String brand) {
        this.color = color;   // gán tham số color vào thuộc tính color
        this.brand = brand;
        this.speed = 0;       // tốc độ ban đầu luôn là 0
    }
}
```

Khi đã có constructor, việc tạo object gọn hơn nhiều:

```java
// Truyền dữ liệu thẳng vào lúc tạo object
Car myCar = new Car("Đỏ", "Toyota");
System.out.println(myCar.brand); // Toyota
```

:::info Constructor mặc định
Nếu bạn KHÔNG viết constructor nào, Java tự cấp cho class một **constructor mặc định**
(default constructor) rỗng, không tham số. Nhưng khi bạn đã tự viết một constructor có
tham số, Java sẽ KHÔNG còn tự cấp cái rỗng nữa.
:::

---

## Từ khóa this

**`this`** (từ khóa tham chiếu tới chính object đang được thao tác) dùng để phân biệt giữa
**thuộc tính của object** và **tham số của hàm** khi chúng trùng tên.

```java
public class Car {
    String color;

    public Car(String color) {
        // this.color -> thuộc tính của object
        // color      -> tham số truyền vào
        this.color = color; // gán tham số vào thuộc tính
    }
}
```

Nếu KHÔNG dùng `this`, dòng `color = color;` sẽ tự gán tham số cho chính nó, và thuộc
tính của object vẫn rỗng — một lỗi rất hay gặp ở người mới.

---

## Lỗi thường gặp

1. **Quên từ khóa `new`**: `Car myCar = Car();` sẽ báo lỗi biên dịch. Phải là
   `Car myCar = new Car();`.
2. **`NullPointerException`**: Khai báo `Car myCar;` nhưng chưa `new` mà đã dùng
   `myCar.color` sẽ gây lỗi vì object chưa tồn tại (đang là `null` — rỗng).
3. **Constructor có kiểu trả về**: viết `public void Car(...)` thì đây KHÔNG phải
   constructor mà chỉ là một phương thức bình thường. Constructor không có kiểu trả về.
4. **Quên `this`**: khi tham số trùng tên thuộc tính, thiếu `this` khiến thuộc tính
   không được gán đúng.

---

## Tóm tắt

- **Class** là khuôn mẫu/bản thiết kế; **object** là thực thể cụ thể tạo ra từ class.
- Dùng từ khóa **`new`** để tạo object: `Car c = new Car();`.
- **Constructor** là hàm chạy tự động khi tạo object, dùng để gán dữ liệu ban đầu;
  tên trùng tên class và không có kiểu trả về.
- **`this`** trỏ tới chính object hiện tại, dùng để phân biệt thuộc tính với tham số.
- Mỗi object có dữ liệu riêng, độc lập với các object khác cùng class.
