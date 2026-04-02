---
sidebar_position: 33
title: "Marker Interface"
---

# Marker Interface trong Java

## Marker Interface la gi?

**Marker Interface** (hay con goi la **Tagging Interface**) la mot interface **khong co bat ky method hay constant nao**. No la mot interface rong, chi duoc dung de **danh dau (mark)** rang mot class co mot kha nang hoac dac tinh nao do.

Hay tuong tuong nhu **tem dan tren hop hang**: ban co 2 hop trong giong het nhau, nhung mot hop dan tem "DE VO" -- nhan vien van chuyen se xu ly hop do cach khac (nhe nhe hon). Marker interface giong nhu cai tem do: no khong thay doi noi dung cua class, nhung bao cho JVM hoac framework biet **cach xu ly class do khac di**.

Day la ky thuat co tu nhung phien ban Java dau tien va van duoc su dung rong rai den ngay nay.

---

## 1. Cau truc cua Marker Interface

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

Cach kiem tra class co implement marker interface khong:

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

Java co 3 marker interface quan trong nhat:

### 2.1 Serializable -- Cho phep serialize object

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

### 2.2 Cloneable -- Cho phep clone object

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

### 2.3 RandomAccess -- Danh dau ho tro truy cap ngau nhien

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

## 3. Tao Custom Marker Interface

Ban co the tao marker interface rieng de danh dau class trong ung dung cua minh:

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

Tu Java 5, **Annotation** co the thay the marker interface trong nhieu truong hop:

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

**So sanh chi tiet:**

| Tieu chi | Marker Interface | Annotation |
|----------|-----------------|------------|
| **Cach kiem tra** | `instanceof` (nhanh) | Reflection (cham hon) |
| **Ke thua** | Tu dong ke thua (subclass cung la marker) | Khong tu dong ke thua |
| **Metadata** | Khong the chua metadata | Co the chua gia tri (attributes) |
| **Linh hoat** | Chi danh dau class | Danh dau class, method, field, parameter... |
| **Compile-time check** | Co (compiler kiem tra type) | Han che |
| **Version** | Tu Java 1.0 | Tu Java 5 |

**Khi nao dung cai nao?**
- **Marker Interface**: Khi can kiem tra bang `instanceof`, khi marker anh huong den **type system** (vi du: method chi nhan object co marker).
- **Annotation**: Khi can metadata, khi danh dau tren nhieu muc tieu (method, field...), khi lam viec voi framework hien dai.

---

## Khi nao dung?

| Tinh huong | Giai phap khuyen dung |
|------------|----------------------|
| Serialize object | Implement `Serializable` |
| Clone object | Implement `Cloneable` (nhung nen can nhac copy constructor) |
| Danh dau class can xu ly dac biet | Custom marker interface hoac Annotation |
| Kiem tra type bang instanceof | Marker Interface |
| Metadata phuc tap (gia tri, tham so) | Annotation |
| Framework hien dai (Spring, JPA) | Annotation |

**Best practices:**
- **Uu tien Annotation** trong code moi (linh hoat hon, la standard hien dai).
- Van dung `Serializable`, `Cloneable` khi can (day la API co cua Java).
- Luon khai bao `serialVersionUID` khi implement `Serializable`.
- Can nhac dung **copy constructor** thay vi `Cloneable` (Effective Java khuyen dung).
- Khi tao custom marker, can nhac annotation truoc (tru khi can instanceof check).

---

## Loi thuong gap

### Loi 1: Quen implement Serializable

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

### Loi 2: Quen serialVersionUID

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

### Loi 3: Nham tuong Cloneable tu dong tao deep copy

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

### Loi 4: Nham marker interface voi interface thuong

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

## Cau hoi phong van

### Cau 1: Tai sao can Marker Interface? Muc dich la gi?

**Tra loi:** Marker Interface dung de **danh dau** (mark) mot class co kha nang hoac dac tinh nao do, ma khong can class do implement bat ky method nao. JVM hoac framework se dua vao marker nay de **thay doi cach xu ly**. Vi du:
- `Serializable`: JVM cho phep serialize object.
- `Cloneable`: Method `Object.clone()` tao ban sao thay vi throw exception.
- `RandomAccess`: Thuat toan chon cach duyet toi uu (index vs iterator).

Marker interface tham gia vao **type system** cua Java, cho phep kiem tra bang `instanceof` tai compile-time va runtime.

### Cau 2: Serializable co bat buoc khong?

**Tra loi:** **Co**, neu ban muon serialize object (ghi ra file, gui qua mang, luu vao session...). Neu class khong implement `Serializable`, `ObjectOutputStream.writeObject()` se throw `NotSerializableException`. Tuy nhien:
- Field `transient` se bi bo qua khi serialize.
- Class cha khong can Serializable (nhung field cua cha se khong duoc serialize).
- Nen khai bao `serialVersionUID` de kiem soat phien ban.

### Cau 3: Marker Interface khac gi Annotation?

**Tra loi:**
- **Marker Interface**: Tham gia vao **type system**, kiem tra bang `instanceof` (nhanh), tu dong ke thua cho subclass, nhung chi danh dau duoc **class**.
- **Annotation**: Dung **reflection** de kiem tra (cham hon), co the mang **metadata** (gia tri, tham so), danh dau duoc **class, method, field, parameter, package**, linh hoat hon.
- **Xu huong**: Annotation duoc uu tien trong code hien dai. Marker interface van dung khi can **type safety** (vi du: method chi nhan `Serializable` object).

### Cau 4: Cloneable co van de gi? Tai sao nhieu nguoi khuyen khong dung?

**Tra loi:** `Cloneable` co nhieu van de duoc Joshua Bloch chi ra trong *Effective Java*:
1. **`clone()` thuoc `Object`**, khong thuoc `Cloneable` -- thiet ke khong truc quan.
2. **Shallow copy mac dinh**: `super.clone()` chi copy reference, khong deep copy.
3. **Khong goi constructor**: `clone()` tao object ma khong goi constructor, co the gay loi voi final field.
4. **Exception handling**: Phai xu ly `CloneNotSupportedException` du da implement Cloneable.

**Thay the tot hon**: Dung **copy constructor** (`new MyClass(original)`) hoac **static factory method** (`MyClass.copyOf(original)`).
