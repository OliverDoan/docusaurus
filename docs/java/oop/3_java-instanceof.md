# Toán tử `instanceof` trong Java


---

## Nội dung

1. [Giới thiệu toán tử instanceof](#1-giới-thiệu-toán-tử-instanceof)
2. [Kiểm tra kiểu Wrapper](#2-kiểm-tra-kiểu-wrapper)
3. [Đối tượng lớp con cũng là kiểu lớp cha](#3-đối-tượng-lớp-con-cũng-là-kiểu-lớp-cha)
4. [instanceof với biến có giá trị null](#4-instanceof-với-biến-có-giá-trị-null)
5. [Downcasting với toán tử instanceof](#5-downcasting-với-toán-tử-instanceof)
6. [Tổng kết](#6-tổng-kết)

---

## 1. Giới thiệu toán tử instanceof

Toán tử `instanceof` trong Java được sử dụng để **kiểm tra một đối tượng có phải là thể hiện của một kiểu dữ liệu cụ thể hay không**.

- `instanceof` được gọi là **toán tử so sánh kiểu**
- Giá trị trả về: `true` hoặc `false`
- Nếu biến có giá trị `null` → luôn trả về `false`

---

## 2. Kiểm tra kiểu Wrapper

Các kiểu **Wrapper** phổ biến:
- `String`
- `Integer`
- `Double`
- `Boolean`
- ...

### Ví dụ

```java
public class InstanceofExample {
    public static void main(String[] args) {
        String str = "Welcome to gpcoder.com";
        System.out.println(str instanceof String); // true

        Integer num = 10;
        System.out.println(num instanceof Integer); // true
    }
}
```

---

## 3. Đối tượng lớp con cũng là kiểu lớp cha

Nếu một lớp **kế thừa** lớp khác thì:
- Đối tượng lớp con **cũng được xem là** đối tượng lớp cha

### Ví dụ

```java
class Animal {
}

public class Dog extends Animal {
    public static void main(String[] args) {
        Dog dog = new Dog();
        System.out.println(dog instanceof Dog);    // true
        System.out.println(dog instanceof Animal); // true
    }
}
```

📌 Đây là cơ sở của **đa hình (Polymorphism)** trong Java.

---

## 4. instanceof với biến có giá trị null

Nếu sử dụng `instanceof` với biến có giá trị `null` thì kết quả **luôn là false**.

### Ví dụ

```java
public class InstanceofExample {
    public static void main(String[] args) {
        Dog dog = null;
        System.out.println(dog instanceof Dog); // false
    }
}
```

---

## 5. Downcasting với toán tử instanceof

### 5.1 Downcasting trực tiếp (LỖI)

```java
Dog dog = new Animal(); // Compilation error
```

❌ Lỗi biên dịch.

---

### 5.2 Downcasting bằng ép kiểu (RUNTIME ERROR)

```java
public class Dog extends Animal {

    static void method(Object obj) {
        Dog dog = (Dog) obj; // downcasting
        System.out.println("downcasting is ok");
    }

    public static void main(String[] args) {
        Animal dog = new Dog();
        Dog.method(dog);

        Object obj = new Rectangle();
        Dog.method(obj); // Runtime error
    }
}
```

❌ Lỗi runtime: `ClassCastException`

---

### 5.3 Downcasting an toàn với instanceof (KHUYÊN DÙNG)

```java
public class Dog extends Animal {

    static void method(Object obj) {
        if (obj instanceof Dog) {
            Dog dog = (Dog) obj;
            System.out.println("ok downcasting performed");
        } else {
            System.out.println("obj is not instance of Dog");
        }
    }

    public static void main(String[] args) {
        Animal dog = new Dog();
        Dog.method(dog);

        Object obj = new Rectangle();
        Dog.method(obj);
    }
}
```

### Kết quả

```text
ok downcasting performed
obj is not instance of Dog
```

📌 `instanceof` giúp **tránh ClassCastException** khi downcasting.

---

## 6. Tổng kết

- `instanceof` dùng để **kiểm tra kiểu đối tượng**
- Trả về `true` / `false`
- Với `null` → luôn `false`
- Đối tượng lớp con cũng là kiểu lớp cha
- **Luôn dùng `instanceof` trước khi downcasting**

