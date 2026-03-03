# Từ khóa `this`, `super`, `static` và `final` 


---

## Nội dung

1. [Từ khóa `this` trong Java](#1-từ-khóa-this-trong-java)
2. [Từ khóa `super` trong Java](#2-từ-khóa-super-trong-java)
3. [So sánh `this` và `super`](#3-so-sánh-this-và-super)
4. [Từ khóa `static` trong Java](#4-từ-khóa-static-trong-java)
5. [Từ khóa `final` trong Java](#5-từ-khóa-final-trong-java)
6. [So sánh `static` và `final`](#6-so-sánh-static-và-final)
7. [Tổng kết nhanh](#7-tổng-kết-nhanh)

---

## 1. Từ khóa `this` trong Java

### Khái niệm

`this` là **biến tham chiếu** dùng để trỏ tới **đối tượng hiện tại** của class.

### Khi nào dùng `this`

- Phân biệt biến instance và tham số
- Gọi constructor khác trong cùng class
- Truyền chính object hiện tại làm tham số

### Ví dụ

```java
public class Student {
    private int id;

    public Student(int id) {
        this.id = id;
    }
}
```

### Gọi constructor khác bằng `this()`

```java
public class User {
    private String name;
    private int age;

    public User() {
        this("Unknown", 0);
    }

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

---

## 2. Từ khóa `super` trong Java

### Khái niệm

`super` là biến tham chiếu trỏ tới **đối tượng của class cha gần nhất**.

### Công dụng của `super`

- Truy cập field của class cha
- Gọi method của class cha
- Gọi constructor của class cha

### Ví dụ

```java
class Animal {
    String name = "Animal";
}

class Dog extends Animal {
    String name = "Dog";

    void printName() {
        System.out.println(name);
        System.out.println(super.name);
    }
}
```

### Gọi constructor cha

```java
class Animal {
    Animal(String type) {
        System.out.println(type);
    }
}

class Dog extends Animal {
    Dog() {
        super("Mammal");
    }
}
```

---

## 3. So sánh `this` và `super`

| Tiêu chí | this | super |
|--------|------|-------|
| Tham chiếu tới | Object hiện tại | Object của class cha |
| Truy cập field | ✔ | ✔ |
| Gọi constructor | this() | super() |
| Phạm vi | Trong cùng class | Class con |

---

## 4. Từ khóa `static` trong Java

### Khái niệm

`static` dùng để khai báo **thuộc tính hoặc phương thức thuộc về class**, không thuộc về object.

### Đặc điểm

- Dùng chung cho mọi object
- Không cần tạo object để sử dụng
- Được cấp bộ nhớ một lần

### Ví dụ

```java
class Counter {
    static int count = 0;

    Counter() {
        count++;
    }
}
```

### Static method

```java
class MathUtils {
    static int sum(int a, int b) {
        return a + b;
    }
}
```

Gọi:

```java
MathUtils.sum(2, 3);
```

### Lưu ý với `static`

- Không dùng được `this`
- Không truy cập trực tiếp member không static

---

## 5. Từ khóa `final` trong Java

### Khái niệm

`final` dùng để **ngăn thay đổi**.

### `final` với biến

```java
final int MAX_SIZE = 100;
```

### `final` với method

```java
class Parent {
    final void show() {}
}
```

➡ Không thể override

### `final` với class

```java
final class Utility {}
```

➡ Không thể kế thừa

---

## 6. So sánh `static` và `final`

| Tiêu chí | static | final |
|-------|--------|-------|
| Mục đích | Thuộc về class | Không cho thay đổi |
| Áp dụng cho | field, method, block | field, method, class |
| Thay đổi giá trị | ✔ | ✘ |
| Gắn với object | ✘ | ✔ |

📌 Thường dùng chung:

```java
public static final String API_URL = "https://api.example.com";
```

---

## 7. Tổng kết nhanh

- `this` → object hiện tại
- `super` → object class cha
- `static` → thuộc về class
- `final` → không cho thay đổi

