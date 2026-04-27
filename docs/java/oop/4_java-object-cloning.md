---
sidebar_position: 4
title: "4. Object Cloning trong Java"
---

# Object Cloning trong Java

Hãy tưởng tượng bạn có một bản thiết kế nhà (object) và muốn tạo một **bản sao** y hệt. Bạn có thể photocopy bản thiết kế — nhưng câu hỏi là: bản sao đó có **độc lập** hoàn toàn hay vẫn **dùng chung** một số thứ với bản gốc? Đó chính là vấn đề **Shallow Copy vs Deep Copy** trong Java.

---


---

## Mục lục

- [1. Object Cloning là gì?](#1-object-cloning-là-gì)
- [2. Shallow Copy vs Deep Copy](#2-shallow-copy-vs-deep-copy)
- [3. Cloneable interface và clone()](#3-cloneable-interface-và-clone)
- [4. Deep Clone](#4-deep-clone)
- [5. Copy Constructor — Giải pháp thay thế](#5-copy-constructor-giải-pháp-thay-thế)
- [6. So sánh các phương pháp Clone](#6-so-sánh-các-phương-pháp-clone)
- [7. Clone bằng Serialization](#7-clone-bằng-serialization)
- [8. Lỗi thường gặp](#8-lỗi-thường-gặp)
- [9. Câu hỏi phỏng vấn](#9-câu-hỏi-phỏng-vấn)

---

## 1. Object Cloning là gì?

**Object Cloning** là quá trình tạo một **bản sao** (copy) của một object. Object mới có cùng giá trị các field với object gốc.

```java
// Thay vì tạo object mới và set từng field:
Student s1 = new Student("An", 20);
Student s2 = new Student(s1.getName(), s1.getAge()); // Thủ công, mệt!

// Cloning giúp tạo bản sao nhanh chóng:
Student s2 = (Student) s1.clone(); // Một dòng!
```

### Tại sao cần cloning?

| Tình huống | Giải pháp |
|---|---|
| Tạo bản sao object để chỉnh sửa mà không ảnh hưởng bản gốc | Clone |
| Lưu trạng thái object tại một thời điểm (snapshot) | Clone |
| Truyền bản sao vào method thay vì truyền reference gốc | Clone |
| Prototype design pattern | Clone |

---

## 2. Shallow Copy vs Deep Copy

Đây là khái niệm **quan trọng nhất** khi nói về cloning.

### Shallow Copy (Sao chép nông)

Shallow copy tạo object mới, **copy giá trị** các field. Nhưng nếu field là **reference type** (object), nó chỉ copy **địa chỉ tham chiếu**, không copy object bên trong.

```
Bản gốc:  [name: "An", address: ──→ {city: "HCM"}]
                                        ↑
Shallow:  [name: "An", address: ────────┘ ]  (dùng chung address!)
```

### Deep Copy (Sao chép sâu)

Deep copy tạo object mới VÀ copy **toàn bộ** các object con bên trong. Mọi thứ đều độc lập.

```
Bản gốc:  [name: "An", address: ──→ {city: "HCM"}]

Deep:     [name: "An", address: ──→ {city: "HCM"}]  (address riêng!)
```

### So sánh

| Tiêu chí | Shallow Copy | Deep Copy |
|---|---|---|
| **Primitive fields** | Copy giá trị | Copy giá trị |
| **Reference fields** | Copy địa chỉ (dùng chung) | Copy toàn bộ object con |
| **Độc lập** | Không hoàn toàn | Hoàn toàn |
| **Tốc độ** | Nhanh | Chậm hơn |
| **Bộ nhớ** | Ít hơn | Nhiều hơn |
| **Rủi ro** | Thay đổi bản sao ảnh hưởng bản gốc | An toàn |

---

## 3. Cloneable interface và clone()

Java cung cấp cơ chế clone thông qua:
1. Implement interface `Cloneable`
2. Override method `clone()` từ class `Object`

### Shallow Clone

```java
class Address {
    String city;
    String street;

    Address(String city, String street) {
        this.city = city;
        this.street = street;
    }

    @Override
    public String toString() {
        return city + ", " + street;
    }
}

class Student implements Cloneable {
    String name;
    int age;
    Address address; // Reference type!

    Student(String name, int age, Address address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }

    // Shallow clone — chỉ copy reference của address
    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone(); // Gọi Object.clone() — shallow copy
    }

    @Override
    public String toString() {
        return name + " (" + age + ") - " + address;
    }
}
```

### Kiểm tra Shallow Clone

```java
public class ShallowCloneDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Address addr = new Address("HCM", "Nguyen Hue");
        Student s1 = new Student("An", 20, addr);
        Student s2 = (Student) s1.clone();

        System.out.println("Trước khi thay đổi:");
        System.out.println("s1: " + s1); // An (20) - HCM, Nguyen Hue
        System.out.println("s2: " + s2); // An (20) - HCM, Nguyen Hue

        // Thay đổi address của s2
        s2.address.city = "Ha Noi"; // ⚠ Thay đổi cả s1!
        s2.name = "Binh";           // Không ảnh hưởng s1 (String là immutable)

        System.out.println("\nSau khi thay đổi s2:");
        System.out.println("s1: " + s1); // An (20) - Ha Noi, Nguyen Hue  ← BỊ ẢNH HƯỞNG!
        System.out.println("s2: " + s2); // Binh (20) - Ha Noi, Nguyen Hue
    }
}
```

**Kết quả:** Thay đổi `s2.address.city` ảnh hưởng luôn `s1` vì cả hai dùng chung object `Address`.

---

## 4. Deep Clone

Để deep clone, bạn phải tự clone từng object con:

```java
class Address implements Cloneable {
    String city;
    String street;

    Address(String city, String street) {
        this.city = city;
        this.street = street;
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone(); // Address chỉ có primitive/String, shallow OK
    }

    @Override
    public String toString() {
        return city + ", " + street;
    }
}

class Student implements Cloneable {
    String name;
    int age;
    Address address;

    Student(String name, int age, Address address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }

    // Deep clone — clone cả address
    @Override
    public Object clone() throws CloneNotSupportedException {
        Student cloned = (Student) super.clone();
        cloned.address = (Address) this.address.clone(); // Clone address riêng!
        return cloned;
    }

    @Override
    public String toString() {
        return name + " (" + age + ") - " + address;
    }
}
```

### Kiểm tra Deep Clone

```java
public class DeepCloneDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Address addr = new Address("HCM", "Nguyen Hue");
        Student s1 = new Student("An", 20, addr);
        Student s2 = (Student) s1.clone();

        s2.address.city = "Ha Noi";
        s2.name = "Binh";

        System.out.println("s1: " + s1); // An (20) - HCM, Nguyen Hue  ← KHÔNG bị ảnh hưởng!
        System.out.println("s2: " + s2); // Binh (20) - Ha Noi, Nguyen Hue
    }
}
```

---

## 5. Copy Constructor — Giải pháp thay thế

Nhiều developer ưa chuộng **copy constructor** hơn `clone()` vì nó rõ ràng và không cần ép kiểu:

```java
class Address {
    String city;
    String street;

    Address(String city, String street) {
        this.city = city;
        this.street = street;
    }

    // Copy constructor
    Address(Address other) {
        this.city = other.city;
        this.street = other.street;
    }
}

class Student {
    String name;
    int age;
    Address address;

    Student(String name, int age, Address address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }

    // Copy constructor — deep copy
    Student(Student other) {
        this.name = other.name;
        this.age = other.age;
        this.address = new Address(other.address); // Tạo Address mới
    }
}
```

### Sử dụng

```java
Student s1 = new Student("An", 20, new Address("HCM", "Nguyen Hue"));
Student s2 = new Student(s1); // Deep copy qua copy constructor

s2.address.city = "Ha Noi";
System.out.println(s1.address.city); // HCM — không bị ảnh hưởng!
```

---

## 6. So sánh các phương pháp Clone

| Phương pháp | Ưu điểm | Nhược điểm |
|---|---|---|
| **clone() (Shallow)** | Nhanh, đơn giản | Reference fields dùng chung |
| **clone() (Deep)** | Độc lập hoàn toàn | Phải override clone() ở mọi class con |
| **Copy Constructor** | Rõ ràng, không cần Cloneable | Phải viết constructor cho mỗi class |
| **Serialization** | Deep copy tự động mọi field | Chậm, cần Serializable |

---

## 7. Clone bằng Serialization

Nếu object phức tạp (nhiều tầng reference), có thể dùng Serialization để deep clone tự động:

```java
import java.io.*;

class DeepCopyUtil {
    @SuppressWarnings("unchecked")
    public static <T extends Serializable> T deepCopy(T object) {
        try {
            // Serialize object thành byte array
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(object);
            oos.flush();

            // Deserialize byte array thành object mới
            ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
            ObjectInputStream ois = new ObjectInputStream(bis);
            return (T) ois.readObject();
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Deep copy failed", e);
        }
    }
}
```

**Lưu ý:** Tất cả class phải implement `Serializable`.

---

## 8. Lỗi thường gặp

### Lỗi 1: Quên implement Cloneable

```java
// SAI — CloneNotSupportedException!
class Student {
    String name;

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone(); // Lỗi vì không implement Cloneable
    }
}

// ĐÚNG
class Student implements Cloneable {
    String name;

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}
```

### Lỗi 2: Nghĩ shallow clone là đủ

```java
// SAI — Dùng shallow clone khi có reference fields
Student s2 = (Student) s1.clone();
s2.address.city = "Da Nang"; // ⚠ s1.address.city cũng bị đổi!

// ĐÚNG — Dùng deep clone
@Override
public Object clone() throws CloneNotSupportedException {
    Student cloned = (Student) super.clone();
    cloned.address = (Address) this.address.clone();
    return cloned;
}
```

### Lỗi 3: Không check null khi deep clone

```java
// SAI — NullPointerException nếu address là null
@Override
public Object clone() throws CloneNotSupportedException {
    Student cloned = (Student) super.clone();
    cloned.address = (Address) this.address.clone(); // NPE nếu address == null!
    return cloned;
}

// ĐÚNG — Check null
@Override
public Object clone() throws CloneNotSupportedException {
    Student cloned = (Student) super.clone();
    if (this.address != null) {
        cloned.address = (Address) this.address.clone();
    }
    return cloned;
}
```

---

## 9. Câu hỏi phỏng vấn

### Câu 1: Shallow copy và deep copy khác nhau thế nào?

**Trả lời:** Shallow copy tạo object mới và copy giá trị các field. Với **primitive fields**, giá trị được copy trực tiếp. Với **reference fields**, chỉ copy địa chỉ tham chiếu — cả bản gốc và bản sao cùng trỏ đến một object. Deep copy tạo object mới VÀ copy (clone) toàn bộ các object con bên trong, nên bản sao hoàn toàn độc lập với bản gốc.

### Câu 2: Tại sao clone() trong Object là protected?

**Trả lời:** `clone()` là `protected` trong class `Object` để ngăn việc clone bừa bãi. Chỉ class nào chủ động implement `Cloneable` và override `clone()` thành `public` mới cho phép clone từ bên ngoài. Nếu `clone()` là `public` mặc định, mọi object đều có thể bị clone, gây ra vấn đề bảo mật và logic.

### Câu 3: Cloneable interface không có method nào, vậy tại sao phải implement nó?

**Trả lời:** `Cloneable` là một **marker interface** — interface không có method, chỉ đánh dấu rằng class hỗ trợ cloning. Khi gọi `super.clone()`, JVM kiểm tra class có implement `Cloneable` hay không. Nếu không, nó ném `CloneNotSupportedException`. Đây là cơ chế để developer **chủ động cho phép** clone.

### Câu 4: Copy constructor vs clone(), nên dùng cái nào?

**Trả lời:** Trong thực tế, **copy constructor được ưa chuộng hơn** vì:
- Không cần implement interface hay ép kiểu
- Rõ ràng và dễ đọc
- Không ném checked exception
- Kiểm soát được deep/shallow copy

Effective Java (Joshua Bloch) cũng khuyến nghị dùng copy constructor hoặc static factory method thay vì `clone()`. `clone()` chỉ nên dùng khi làm việc với legacy code hoặc khi cần tương thích với API yêu cầu `Cloneable`.

### Câu 5: Làm sao để deep clone một object phức tạp có nhiều tầng reference?

**Trả lời:** Có 3 cách:
1. **Override clone() thủ công** — clone từng field ở mỗi tầng. Chính xác nhưng tốn công khi object phức tạp.
2. **Copy constructor** — tạo constructor nhận object cùng type và copy từng field. Rõ ràng nhất.
3. **Serialization** — serialize object thành byte array rồi deserialize lại. Tự động deep copy mọi tầng, nhưng yêu cầu tất cả class implement `Serializable` và chậm hơn.
