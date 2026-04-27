---
sidebar_position: 33
title: "33. Marker Interface"
---

# Marker Interface trong Java


---

## Mục lục

- [Marker Interface là gì?](#marker-interface-là-gì)
- [1. Cấu trúc của Marker Interface](#1-cấu-trúc-của-marker-interface)
- [2. Built-in Marker Interface trong Java](#2-built-in-marker-interface-trong-java)
- [3. Tạo Custom Marker Interface](#3-tạo-custom-marker-interface)
- [4. Marker Interface vs Annotation](#4-marker-interface-vs-annotation)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Marker Interface là gì?

**Marker Interface** (hay còn gọi là **Tagging Interface**) là một interface **không có bất kỳ method hay constant nào**. Nó là một interface rỗng, chỉ được dùng để **đánh dấu (mark)** rằng một class có một khả năng hoặc đặc tính nào đó.

Hãy tưởng tượng như **tem dán trên hộp hàng**: bạn có 2 hộp trông giống hệt nhau, nhưng một hộp dán tem "DỄ VỠ" -- nhân viên vận chuyển sẽ xử lý hộp đó cách khác (nhẹ nhàng hơn). Marker interface giống như cái tem đó: nó không thay đổi nội dung của class, nhưng báo cho JVM hoặc framework biết **cách xử lý class đó khác đi**.

Đây là kỹ thuật có từ những phiên bản Java đầu tiên và vẫn được sử dụng rộng rãi đến ngày nay.

---

## 1. Cấu trúc của Marker Interface

```java
// Marker interface: KHONG co method nao
public interface Marker {
    // Trong -- khong co method, khong co constant
}

// Class implement marker interface
public class MyClass implements Marker {
    // Class nay duoc "danh dau" boi Marker
}
```

Cách kiểm tra class có implement marker interface không:

```java
public class MarkerCheckDemo {
    public static void main(String[] args) {
        MyClass obj = new MyClass();

        if (obj instanceof Marker) {
            System.out.println("Object nay da duoc danh dau!");
        }
    }
}

interface Marker { }

class MyClass implements Marker { }
```

---

## 2. Built-in Marker Interface trong Java

Java có 3 marker interface quan trọng nhất:

### 2.1 Serializable -- Cho phép serialize object

```java
import java.io.*;

// ✅ Implement Serializable -> co the serialize
class Student implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
    int age;

    Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + "}";
    }
}

// ❌ KHONG implement Serializable -> loi khi serialize
class Teacher {
    String name;
    Teacher(String name) { this.name = name; }
}

public class SerializableDemo {
    public static void main(String[] args) {
        Student student = new Student("An", 20);

        // Serialize object thanh file
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new FileOutputStream("student.ser"))) {
            oos.writeObject(student);
            System.out.println("Serialize thanh cong: " + student);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Deserialize object tu file
        try (ObjectInputStream ois = new ObjectInputStream(
                new FileInputStream("student.ser"))) {
            Student loaded = (Student) ois.readObject();
            System.out.println("Deserialize thanh cong: " + loaded);
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }

        // Thu serialize class KHONG co Serializable
        Teacher teacher = new Teacher("Ba");
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new FileOutputStream("teacher.ser"))) {
            oos.writeObject(teacher); // NotSerializableException!
        } catch (IOException e) {
            System.out.println("Loi: " + e.getClass().getSimpleName());
            // "NotSerializableException"
        }
    }
}
```

### 2.2 Cloneable -- Cho phép clone object

```java
// ✅ Implement Cloneable -> co the clone
class Product implements Cloneable {
    String name;
    double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public Product clone() {
        try {
            return (Product) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e); // Khong xay ra vi da implement Cloneable
        }
    }

    @Override
    public String toString() {
        return "Product{name='" + name + "', price=" + price + "}";
    }
}

// ❌ KHONG implement Cloneable -> loi khi clone
class Order {
    String id;
    Order(String id) { this.id = id; }

    @Override
    public Order clone() throws CloneNotSupportedException {
        return (Order) super.clone(); // CloneNotSupportedException!
    }
}

public class CloneableDemo {
    public static void main(String[] args) {
        Product original = new Product("Laptop", 1500.0);
        Product copy = original.clone();

        System.out.println("Original: " + original);
        System.out.println("Copy: " + copy);
        System.out.println("Cung object? " + (original == copy)); // false

        // Thu clone class khong co Cloneable
        Order order = new Order("ORD-001");
        try {
            Order orderCopy = order.clone();
        } catch (CloneNotSupportedException e) {
            System.out.println("Loi: " + e.getClass().getSimpleName());
            // "CloneNotSupportedException"
        }
    }
}
```

### 2.3 RandomAccess -- Đánh dấu hỗ trợ truy cập ngẫu nhiên

```java
import java.util.*;

public class RandomAccessDemo {
    public static void main(String[] args) {
        List<String> arrayList = new ArrayList<>(List.of("A", "B", "C"));
        List<String> linkedList = new LinkedList<>(List.of("A", "B", "C"));

        // ArrayList implement RandomAccess
        System.out.println("ArrayList la RandomAccess: " +
            (arrayList instanceof RandomAccess)); // true

        // LinkedList KHONG implement RandomAccess
        System.out.println("LinkedList la RandomAccess: " +
            (linkedList instanceof RandomAccess)); // false

        // Ung dung thuc te: chon thuat toan phu hop
        processlist(arrayList);   // Dung for-index (nhanh)
        processlist(linkedList);  // Dung iterator (nhanh)
    }

    // Chon cach duyet toi uu dua tren RandomAccess
    static void processlist(List<String> list) {
        if (list instanceof RandomAccess) {
            // Truy cap bang index: O(1) cho ArrayList
            for (int i = 0; i < list.size(); i++) {
                System.out.print(list.get(i) + " ");
            }
        } else {
            // Dung iterator: O(1) cho LinkedList
            for (String item : list) {
                System.out.print(item + " ");
            }
        }
        System.out.println();
    }
}
```

---

## 3. Tạo Custom Marker Interface

Bạn có thể tạo marker interface riêng để đánh dấu class trong ứng dụng của mình:

```java
// Dinh nghia marker interface
interface Loggable {
    // Trong -- danh dau class can log
}

interface Auditable {
    // Trong -- danh dau class can audit
}

// Cac class implement marker
class UserService implements Loggable, Auditable {
    public void createUser(String name) {
        System.out.println("Tao user: " + name);
    }
}

class PaymentService implements Loggable {
    public void processPayment(double amount) {
        System.out.println("Xu ly thanh toan: " + amount);
    }
}

class NotificationService {
    // Khong implement marker nao
    public void send(String message) {
        System.out.println("Gui thong bao: " + message);
    }
}

// Framework xu ly dua tren marker
public class CustomMarkerDemo {
    static void process(Object service) {
        if (service instanceof Loggable) {
            System.out.println("[LOG] Ghi log cho: " + service.getClass().getSimpleName());
        }
        if (service instanceof Auditable) {
            System.out.println("[AUDIT] Audit cho: " + service.getClass().getSimpleName());
        }
    }

    public static void main(String[] args) {
        process(new UserService());
        // [LOG] Ghi log cho: UserService
        // [AUDIT] Audit cho: UserService

        process(new PaymentService());
        // [LOG] Ghi log cho: PaymentService

        process(new NotificationService());
        // Khong in gi -- khong co marker
    }
}
```

---

## 4. Marker Interface vs Annotation

Từ Java 5, **Annotation** có thể thay thế marker interface trong nhiều trường hợp:

```java
import java.lang.annotation.*;

// Marker Interface
interface Loggable { }

// Tuong duong: Annotation
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface LoggableAnnotation { }

// Su dung Marker Interface
class ServiceA implements Loggable { }

// Su dung Annotation
@LoggableAnnotation
class ServiceB { }

public class MarkerVsAnnotation {
    public static void main(String[] args) {
        // Kiem tra Marker Interface: instanceof
        ServiceA a = new ServiceA();
        System.out.println("Loggable (marker): " + (a instanceof Loggable)); // true

        // Kiem tra Annotation: reflection
        ServiceB b = new ServiceB();
        boolean hasAnnotation = b.getClass().isAnnotationPresent(LoggableAnnotation.class);
        System.out.println("Loggable (annotation): " + hasAnnotation); // true
    }
}
```

**So sánh chi tiết:**

| Tiêu chí | Marker Interface | Annotation |
|----------|-----------------|------------|
| **Cách kiểm tra** | `instanceof` (nhanh) | Reflection (chậm hơn) |
| **Kế thừa** | Tự động kế thừa (subclass cũng là marker) | Không tự động kế thừa |
| **Metadata** | Không thể chứa metadata | Có thể chứa giá trị (attributes) |
| **Linh hoạt** | Chỉ đánh dấu class | Đánh dấu class, method, field, parameter... |
| **Compile-time check** | Có (compiler kiểm tra type) | Hạn chế |
| **Version** | Từ Java 1.0 | Từ Java 5 |

**Khi nào dùng cái nào?**
- **Marker Interface**: Khi cần kiểm tra bằng `instanceof`, khi marker ảnh hưởng đến **type system** (ví dụ: method chỉ nhận object có marker).
- **Annotation**: Khi cần metadata, khi đánh dấu trên nhiều mục tiêu (method, field...), khi làm việc với framework hiện đại.

---

## Khi nào dùng?

| Tình huống | Giải pháp khuyên dùng |
|------------|----------------------|
| Serialize object | Implement `Serializable` |
| Clone object | Implement `Cloneable` (nhưng nên cân nhắc copy constructor) |
| Đánh dấu class cần xử lý đặc biệt | Custom marker interface hoặc Annotation |
| Kiểm tra type bằng instanceof | Marker Interface |
| Metadata phức tạp (giá trị, tham số) | Annotation |
| Framework hiện đại (Spring, JPA) | Annotation |

**Best practices:**
- **Ưu tiên Annotation** trong code mới (linh hoạt hơn, là standard hiện đại).
- Vẫn dùng `Serializable`, `Cloneable` khi cần (đây là API cũ của Java).
- Luôn khai báo `serialVersionUID` khi implement `Serializable`.
- Cân nhắc dùng **copy constructor** thay vì `Cloneable` (Effective Java khuyên dùng).
- Khi tạo custom marker, cân nhắc annotation trước (trừ khi cần instanceof check).

---

## Lỗi thường gặp

### Lỗi 1: Quên implement Serializable

```java
// ❌ Sai: Quen Serializable -> NotSerializableException khi serialize
class UserData {
    String name;
}

// Goi writeObject(userData) -> NotSerializableException!
```

```java
// ✅ Dung: Them Serializable
class UserData implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
}
```

### Lỗi 2: Quên serialVersionUID

```java
// ❌ Sai: Khong khai bao serialVersionUID
class Config implements Serializable {
    String setting;
    // Neu them field moi, deserialization tu file cu se LOI!
}
```

```java
// ✅ Dung: Luon khai bao serialVersionUID
class Config implements Serializable {
    private static final long serialVersionUID = 1L;
    String setting;
    // Them field moi an toan hon khi co serialVersionUID
}
```

### Lỗi 3: Nhầm tưởng Cloneable tự động tạo deep copy

```java
// ❌ Sai: Nghi clone() tao deep copy
class Department implements Cloneable {
    String name;
    List<String> employees; // Reference type!

    @Override
    public Department clone() {
        try {
            return (Department) super.clone(); // Shallow copy!
            // employees van tro den CUNG list!
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

```java
// ✅ Dung: Implement deep copy thu cong
class Department implements Cloneable {
    String name;
    List<String> employees;

    @Override
    public Department clone() {
        try {
            Department copy = (Department) super.clone();
            copy.employees = new ArrayList<>(this.employees); // Deep copy list
            return copy;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
}

// ✅ Tot hon: Dung copy constructor thay vi Cloneable
class Department {
    String name;
    List<String> employees;

    // Copy constructor
    Department(Department other) {
        this.name = other.name;
        this.employees = new ArrayList<>(other.employees);
    }
}
```

### Lỗi 4: Nhầm marker interface với interface thường

```java
// ❌ Sai: Day KHONG phai marker interface (co method)
interface Printable {
    void print(); // Co method -> khong phai marker!
}

// ✅ Dung: Marker interface KHONG co method
interface Exportable {
    // Trong -- day la marker interface
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao cần Marker Interface? Mục đích là gì?

**Trả lời:** Marker Interface dùng để **đánh dấu** (mark) một class có khả năng hoặc đặc tính nào đó, mà không cần class đó implement bất kỳ method nào. JVM hoặc framework sẽ dựa vào marker này để **thay đổi cách xử lý**. Ví dụ:
- `Serializable`: JVM cho phép serialize object.
- `Cloneable`: Method `Object.clone()` tạo bản sao thay vì throw exception.
- `RandomAccess`: Thuật toán chọn cách duyệt tối ưu (index vs iterator).

Marker interface tham gia vào **type system** của Java, cho phép kiểm tra bằng `instanceof` tại compile-time và runtime.

### Câu 2: Serializable có bắt buộc không?

**Trả lời:** **Có**, nếu bạn muốn serialize object (ghi ra file, gửi qua mạng, lưu vào session...). Nếu class không implement `Serializable`, `ObjectOutputStream.writeObject()` sẽ throw `NotSerializableException`. Tuy nhiên:
- Field `transient` sẽ bị bỏ qua khi serialize.
- Class cha không cần Serializable (nhưng field của cha sẽ không được serialize).
- Nên khai báo `serialVersionUID` để kiểm soát phiên bản.

### Câu 3: Marker Interface khác gì Annotation?

**Trả lời:**
- **Marker Interface**: Tham gia vào **type system**, kiểm tra bằng `instanceof` (nhanh), tự động kế thừa cho subclass, nhưng chỉ đánh dấu được **class**.
- **Annotation**: Dùng **reflection** để kiểm tra (chậm hơn), có thể mang **metadata** (giá trị, tham số), đánh dấu được **class, method, field, parameter, package**, linh hoạt hơn.
- **Xu hướng**: Annotation được ưu tiên trong code hiện đại. Marker interface vẫn dùng khi cần **type safety** (ví dụ: method chỉ nhận `Serializable` object).

### Câu 4: Cloneable có vấn đề gì? Tại sao nhiều người khuyên không dùng?

**Trả lời:** `Cloneable` có nhiều vấn đề được Joshua Bloch chỉ ra trong *Effective Java*:
1. **`clone()` thuộc `Object`**, không thuộc `Cloneable` -- thiết kế không trực quan.
2. **Shallow copy mặc định**: `super.clone()` chỉ copy reference, không deep copy.
3. **Không gọi constructor**: `clone()` tạo object mà không gọi constructor, có thể gây lỗi với final field.
4. **Exception handling**: Phải xử lý `CloneNotSupportedException` dù đã implement Cloneable.

**Thay thế tốt hơn**: Dùng **copy constructor** (`new MyClass(original)`) hoặc **static factory method** (`MyClass.copyOf(original)`).
