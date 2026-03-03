# Cơ chế Upcasting và Downcasting 


---

## Nội dung

1. [Giới thiệu chung](#1-giới-thiệu-chung)
2. [Upcasting trong Java](#2-upcasting-trong-java)
3. [Downcasting trong Java](#3-downcasting-trong-java)
4. [Lưu ý khi sử dụng Downcasting](#4-lưu-ý-khi-sử-dụng-downcasting)
5. [Tổng kết](#5-tổng-kết)

---

## 1. Giới thiệu chung

Trong Java, ngoài việc ép kiểu với **kiểu dữ liệu nguyên thủy**, chúng ta còn có cơ chế ép kiểu với **kiểu dữ liệu tham chiếu**, gọi là:

- **Upcasting**
- **Downcasting**

Hai cơ chế này thường được sử dụng trong **kế thừa (Inheritance)** và **đa hình (Polymorphism)**.

---

### Ví dụ nền

```java
class Animal {
    public void eat() {
        System.out.println("eating...");
    }
}

public class Cat extends Animal {
    public void meow() {
        System.out.println("meowing...");
    }
}
```

---

## 2. Upcasting trong Java

### Khái niệm

**Upcasting** xảy ra khi:
- Biến tham chiếu của **lớp cha**
- Trỏ tới đối tượng của **lớp con**

👉 Đây là cơ chế **tự động**, an toàn và được sử dụng rất nhiều trong Java.

---

### Ví dụ Upcasting

```java
public class UpcastingExample {

    public static void main(String[] args) {
        Cat cat = new Cat();

        Animal animal1 = cat;          // Upcasting không tường minh
        Animal animal2 = (Animal) cat; // Upcasting tường minh

        cat.eat();
        cat.meow();

        animal1.eat();
        animal2.eat();

        // animal2.meow(); // ❌ Không thể gọi
    }
}
```

### Kết quả

```text
eating...
meowing...
eating...
eating...
```

---

### Ghi đè phương thức khi Upcasting

Nếu lớp con **override** phương thức của lớp cha, thì khi runtime:
- JVM sẽ gọi **phương thức của lớp con**

```java
public class Cat extends Animal {

    @Override
    public void eat() {
        System.out.println("Eat meat");
    }

    public void meow() {
        System.out.println("meowing...");
    }
}
```

**Kết quả**

```text
Eat meat
meowing...
Eat meat
Eat meat
```

📌 Đây chính là **đa hình tại runtime**.

---

## 3. Downcasting trong Java

### Khái niệm

**Downcasting** là quá trình:
- Ép kiểu từ **lớp cha → lớp con**

Downcasting **không tự động**, cần ép kiểu **tường minh**.

---

### Ví dụ Downcasting

```java
public class DowncastingExample {

    public static void main(String[] args) {
        Animal animal = new Cat();
        Cat cat = (Cat) animal; // Downcasting

        cat.meow();
    }
}
```

👉 Nhờ downcasting, ta có thể gọi các phương thức **chỉ có ở lớp con**.

---

## 4. Lưu ý khi sử dụng Downcasting

### ❌ ClassCastException

Nếu đối tượng **không thực sự là thể hiện của lớp con**, chương trình sẽ lỗi runtime.

```java
Animal animal = new Animal();
Cat cat = (Cat) animal; // ❌ ClassCastException
```

---

### ✅ Cách an toàn với instanceof

```java
if (animal instanceof Cat) {
    Cat cat = (Cat) animal;
    cat.meow();
}
```

📌 Luôn kiểm tra bằng `instanceof` trước khi downcasting để tránh lỗi.

---

## 5. Tổng kết

- **Upcasting**
  - Cha ← Con
  - Tự động, an toàn
  - Dùng rất nhiều trong đa hình

- **Downcasting**
  - Con ← Cha
  - Cần ép kiểu tường minh
  - Phải kiểm tra `instanceof`
