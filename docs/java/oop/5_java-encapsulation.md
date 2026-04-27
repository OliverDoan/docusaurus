---
sidebar_position: 5
title: "5. Tính đóng gói (Encapsulation)"
---

# Tính đóng gói (Encapsulation)

Hãy tưởng tượng bạn đến **máy ATM** rút tiền. Bạn nhấn nút, nhập mã PIN, chọn số tiền — máy nhả tiền ra. Bạn **không cần biết** bên trong máy ATM có bao nhiêu ngăn tiền, phần mềm xử lý thế nào, hay dữ liệu được mã hóa ra sao. Bạn chỉ tương tác qua **giao diện** (nút bấm, màn hình). Đó chính là **Encapsulation** — đóng gói dữ liệu bên trong và chỉ cung cấp interface cần thiết.

---


---

## Mục lục

- [1. Encapsulation là gì?](#1-encapsulation-là-gì)
- [2. Cách thực hiện Encapsulation](#2-cách-thực-hiện-encapsulation)
- [3. Validation trong Setter](#3-validation-trong-setter)
- [4. Read-Only và Write-Only Fields](#4-read-only-và-write-only-fields)
- [5. Immutable Class](#5-immutable-class)
- [6. JavaBean Conventions](#6-javabean-conventions)
- [7. Encapsulation vs Abstraction](#7-encapsulation-vs-abstraction)
- [8. Lợi ích của Encapsulation](#8-lợi-ích-của-encapsulation)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [10. Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)

---

## 1. Encapsulation là gì?

**Encapsulation** (tính đóng gói) là một trong **4 tính chất cơ bản** của OOP. Encapsulation gộp **dữ liệu** (fields) và **hành vi** (methods) vào cùng một class, đồng thời **ẩn giấu chi tiết bên trong** và chỉ cho phép truy cập qua các method công khai.

```
┌──────────────────────────────┐
│         Student              │
│  ┌─────────────────────┐    │
│  │ private String name  │    │  ← Dữ liệu ẩn bên trong
│  │ private int age      │    │
│  └─────────────────────┘    │
│                              │
│  + getName(): String         │  ← Chỉ truy cập qua method
│  + setName(name): void       │
│  + getAge(): int             │
│  + setAge(age): void         │
└──────────────────────────────┘
```

### Hai khía cạnh của Encapsulation

| Khía cạnh | Giải thích | Cách thực hiện |
|---|---|---|
| **Data Hiding** | Ẩn dữ liệu khỏi bên ngoài | Khai báo fields là `private` |
| **Data Encapsulation** | Cung cấp cách truy cập có kiểm soát | Dùng `getter` và `setter` công khai |

---

## 2. Cách thực hiện Encapsulation

3 bước đơn giản:

1. Khai báo tất cả fields là `private`
2. Cung cấp `getter` method để đọc giá trị
3. Cung cấp `setter` method để ghi giá trị (có thể thêm validation)

### Ví dụ cơ bản

```java
public class Student {
    // Bước 1: Fields là private
    private String name;
    private int age;

    // Bước 2: Getter — đọc giá trị
    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    // Bước 3: Setter — ghi giá trị
    public void setName(String name) {
        this.name = name;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

### Sử dụng

```java
public class Main {
    public static void main(String[] args) {
        Student s = new Student();

        // Không thể truy cập trực tiếp:
        // s.name = "An";  ← Lỗi compile! name là private

        // Phải dùng setter:
        s.setName("An");
        s.setAge(20);

        // Đọc qua getter:
        System.out.println(s.getName()); // An
        System.out.println(s.getAge());  // 20
    }
}
```

---

## 3. Validation trong Setter

Sức mạnh thực sự của encapsulation là **kiểm soát dữ liệu**. Thay vì cho phép gán bất kỳ giá trị nào, setter có thể **validate** trước khi set:

```java
public class Student {
    private String name;
    private int age;
    private String email;

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên không được để trống");
        }
        this.name = name.trim();
    }

    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Tuổi phải từ 0 đến 150");
        }
        this.age = age;
    }

    public void setEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Email không hợp lệ");
        }
        this.email = email.toLowerCase();
    }

    // Getters...
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getEmail() { return email; }
}
```

### Kiểm tra

```java
Student s = new Student();
s.setName("An");           // OK
s.setAge(20);              // OK
s.setEmail("an@gmail.com"); // OK

s.setAge(-5);              // IllegalArgumentException: Tuổi phải từ 0 đến 150
s.setEmail("khong-co-at"); // IllegalArgumentException: Email không hợp lệ
```

Nếu không có encapsulation, bất kỳ ai cũng có thể gán `s.age = -999` — dữ liệu vô nghĩa!

---

## 4. Read-Only và Write-Only Fields

### Read-Only (chỉ đọc)

Chỉ cung cấp getter, **không có setter**:

```java
public class Employee {
    private final String id; // final — không thể thay đổi sau khi tạo

    public Employee(String id) {
        this.id = id;
    }

    // Chỉ có getter, không có setter
    public String getId() {
        return id;
    }
}
```

```java
Employee e = new Employee("EMP001");
System.out.println(e.getId()); // EMP001
// e.setId("EMP002"); ← Không tồn tại method này!
```

### Write-Only (chỉ ghi)

Hiếm gặp hơn, thường dùng cho password:

```java
public class User {
    private String password;

    // Chỉ có setter
    public void setPassword(String password) {
        // Hash password trước khi lưu
        this.password = hashPassword(password);
    }

    // Không có getPassword() — không ai được đọc password
    public boolean checkPassword(String input) {
        return this.password.equals(hashPassword(input));
    }

    private String hashPassword(String password) {
        // Giả lập hash
        return Integer.toHexString(password.hashCode());
    }
}
```

---

## 5. Immutable Class

**Immutable class** là đỉnh cao của encapsulation — object không thể thay đổi sau khi tạo. `String` trong Java là ví dụ điển hình.

### Cách tạo Immutable Class

```java
public final class Money {               // final — không thể extend
    private final double amount;          // final — không thể thay đổi
    private final String currency;

    public Money(double amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    // Chỉ có getter, KHÔNG có setter
    public double getAmount() { return amount; }
    public String getCurrency() { return currency; }

    // Thay vì modify, tạo object mới
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Không cùng đơn vị tiền");
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    @Override
    public String toString() {
        return amount + " " + currency;
    }
}
```

```java
Money salary = new Money(1000, "USD");
Money bonus = new Money(200, "USD");
Money total = salary.add(bonus); // Tạo object MỚI

System.out.println(salary); // 1000.0 USD — KHÔNG thay đổi
System.out.println(total);  // 1200.0 USD — Object mới
```

### Quy tắc Immutable Class

| Quy tắc | Giải thích |
|---|---|
| Class phải `final` | Ngăn subclass thay đổi hành vi |
| Tất cả fields phải `private final` | Không thể thay đổi sau constructor |
| Không có setter | Không thể modify từ bên ngoài |
| Nếu field là mutable object, trả về defensive copy trong getter | Ngăn thay đổi gián tiếp |

---

## 6. JavaBean Conventions

**JavaBean** là quy chuẩn đặt tên trong Java, được framework như Spring, Hibernate sử dụng rộng rãi:

```java
public class Product {
    // Field là private
    private String name;
    private double price;
    private boolean available; // boolean field

    // Constructor không tham số (bắt buộc cho JavaBean)
    public Product() {}

    // Getter: getXxx()
    public String getName() { return name; }
    public double getPrice() { return price; }

    // Getter cho boolean: isXxx()
    public boolean isAvailable() { return available; }

    // Setter: setXxx()
    public void setName(String name) { this.name = name; }
    public void setPrice(double price) { this.price = price; }
    public void setAvailable(boolean available) { this.available = available; }
}
```

### Quy tắc đặt tên

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Getter (non-boolean) | `get` + tên field viết hoa chữ đầu | `getName()` |
| Getter (boolean) | `is` + tên field viết hoa chữ đầu | `isAvailable()` |
| Setter | `set` + tên field viết hoa chữ đầu | `setName(String name)` |

---

## 7. Encapsulation vs Abstraction

Hai khái niệm hay bị nhầm lẫn:

| Tiêu chí | Encapsulation | Abstraction |
|---|---|---|
| **Mục đích** | Ẩn **dữ liệu** (data hiding) | Ẩn **chi tiết triển khai** (implementation hiding) |
| **Cách thực hiện** | `private` fields + getter/setter | Abstract class, Interface |
| **Trả lời câu hỏi** | "Làm sao bảo vệ dữ liệu?" | "Cần biết gì, không cần biết gì?" |
| **Ví dụ thực tế** | Két sắt: bảo vệ tiền bên trong | Remote TV: chỉ thấy nút bấm, không thấy mạch điện |
| **Level** | Class level (thiết kế class) | Design level (thiết kế hệ thống) |

---

## 8. Lợi ích của Encapsulation

| Lợi ích | Giải thích |
|---|---|
| **Kiểm soát dữ liệu** | Validation trong setter ngăn dữ liệu không hợp lệ |
| **Linh hoạt thay đổi** | Thay đổi cách lưu trữ bên trong mà không ảnh hưởng code bên ngoài |
| **Dễ bảo trì** | Logic tập trung trong class, không phân tán khắp nơi |
| **Bảo mật** | Ẩn dữ liệu nhạy cảm (password, internal state) |
| **Tái sử dụng** | Class đóng gói tốt có thể dùng ở nhiều nơi |

### Ví dụ linh hoạt thay đổi

```java
// Version 1: Lưu tên đầy đủ
public class Person {
    private String fullName;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}

// Version 2: Tách thành firstName + lastName (thay đổi bên trong)
// Code bên ngoài gọi getFullName() VẪN HOẠT ĐỘNG!
public class Person {
    private String firstName;
    private String lastName;

    public String getFullName() { return firstName + " " + lastName; } // Tự ghép
    public void setFullName(String fullName) {
        String[] parts = fullName.split(" ", 2);
        this.firstName = parts[0];
        this.lastName = parts.length > 1 ? parts[1] : "";
    }
}
```

Code bên ngoài gọi `person.getFullName()` **không cần sửa gì** — đó là sức mạnh của encapsulation.

---

## 9. Lỗi thường gặp

### Lỗi 1: Khai báo fields là public

```java
// SAI — ai cũng truy cập, không kiểm soát được
public class Student {
    public String name;
    public int age;
}

Student s = new Student();
s.age = -100; // Hợp lệ về cú pháp, nhưng vô nghĩa!

// ĐÚNG — private + validation
public class Student {
    private String name;
    private int age;

    public void setAge(int age) {
        if (age < 0) throw new IllegalArgumentException("Tuổi không hợp lệ");
        this.age = age;
    }

    public int getAge() { return age; }
}
```

### Lỗi 2: Getter trả về mutable object

```java
// SAI — trả về reference trực tiếp, bên ngoài có thể modify
public class Team {
    private List<String> members = new ArrayList<>();

    public List<String> getMembers() {
        return members; // ⚠ Trả về reference!
    }
}

Team team = new Team();
team.getMembers().add("Hacker"); // Thêm member từ bên ngoài!

// ĐÚNG — trả về defensive copy
public List<String> getMembers() {
    return Collections.unmodifiableList(members); // Không thể modify
    // hoặc: return new ArrayList<>(members); // Trả về bản sao
}
```

### Lỗi 3: Setter không validate

```java
// SAI — setter không kiểm tra gì
public void setEmail(String email) {
    this.email = email; // Chấp nhận mọi giá trị, kể cả null hay ""
}

// ĐÚNG — validate trước khi set
public void setEmail(String email) {
    if (email == null || !email.matches("^[\\w.-]+@[\\w.-]+\\.\\w+$")) {
        throw new IllegalArgumentException("Email không hợp lệ: " + email);
    }
    this.email = email.toLowerCase();
}
```

---

## 10. Câu hỏi phỏng vấn

### Câu 1: Encapsulation là gì? Tại sao cần encapsulation?

**Trả lời:** Encapsulation là việc gộp dữ liệu (fields) và phương thức (methods) vào cùng một class, đồng thời **ẩn giấu dữ liệu** bằng cách khai báo `private` và cung cấp `getter`/`setter` để truy cập có kiểm soát. Cần encapsulation vì: (1) kiểm soát dữ liệu qua validation, (2) thay đổi nội bộ không ảnh hưởng code bên ngoài, (3) bảo mật dữ liệu nhạy cảm, (4) dễ bảo trì và debug.

### Câu 2: Getter trả về một mutable object (List, Map) thì có vi phạm encapsulation không?

**Trả lời:** **Có.** Nếu getter trả về reference trực tiếp đến mutable field, bên ngoài có thể thay đổi dữ liệu mà class không kiểm soát được. Giải pháp: trả về **defensive copy** (`new ArrayList<>(list)`) hoặc **unmodifiable view** (`Collections.unmodifiableList(list)`).

### Câu 3: Sự khác biệt giữa Encapsulation và Abstraction?

**Trả lời:** Encapsulation tập trung vào **ẩn giấu dữ liệu** — dùng `private` fields và getter/setter. Abstraction tập trung vào **ẩn giấu chi tiết triển khai** — dùng abstract class và interface để user chỉ thấy "cái gì" (what) chứ không thấy "làm thế nào" (how). Encapsulation là kỹ thuật ở cấp class, abstraction là khái niệm ở cấp thiết kế.

### Câu 4: Tại sao String trong Java là immutable?

**Trả lời:** String là immutable vì: (1) **String Pool** — nhiều reference có thể trỏ đến cùng một String trong pool, nếu mutable thì thay đổi ảnh hưởng tất cả. (2) **Thread safety** — immutable objects tự nhiên thread-safe. (3) **Security** — String dùng làm tham số cho network connection, file path, database URL — nếu mutable, có thể bị thay đổi sau validation. (4) **HashCode caching** — immutable nên hashCode chỉ cần tính một lần.

### Câu 5: Làm sao tạo một immutable class trong Java?

**Trả lời:** 5 bước: (1) Khai báo class là `final` (ngăn subclass). (2) Tất cả fields là `private final`. (3) Không có setter. (4) Initialize fields qua constructor. (5) Nếu field là mutable object (List, Date), trả về **defensive copy** trong getter và copy trong constructor. Ví dụ: `String`, `Integer`, `LocalDate` đều là immutable class trong Java.
