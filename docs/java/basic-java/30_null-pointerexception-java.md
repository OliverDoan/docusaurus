---
sidebar_position: 30
title: "Tránh NullPointerException"
---

# Tránh NullPointerException trong Java

## NullPointerException là gì?

**NullPointerException (NPE)** là một trong những lỗi runtime **phổ biến nhất** trong Java. Lỗi này xảy ra khi chương trình cố gắng truy cập method, field, hoặc property của một **tham chiếu null** -- tức là một biến chưa trỏ đến bất kỳ object nào.

Hãy tưởng tượng bạn có một **địa chỉ nhà** (biến tham chiếu). Bình thường, địa chỉ này trỏ đến một ngôi nhà thật (object). Nhưng nếu địa chỉ là `null`, tức là **không có ngôi nhà nào cả**. Khi bạn cố gõ cửa (gọi method) tại địa chỉ không tồn tại, bạn sẽ gặp lỗi -- đó chính là `NullPointerException`.

Hiểu và biết cách phòng tránh NPE là kỹ năng thiết yếu của mọi lập trình viên Java.

---

## 1. Nguyên nhân phổ biến gây NPE

```java
public class NpeExamples {
    public static void main(String[] args) {
        // Nguyen nhan 1: Goi method tren null reference
        String name = null;
        // name.length();  // NullPointerException!

        // Nguyen nhan 2: Truy cap field cua null object
        User user = null;
        // user.name;  // NullPointerException!

        // Nguyen nhan 3: Truy cap phan tu cua mang null
        int[] arr = null;
        // arr[0];  // NullPointerException!

        // Nguyen nhan 4: Unboxing null wrapper
        Integer number = null;
        // int value = number;  // NullPointerException! (unboxing null)

        // Nguyen nhan 5: Method tra ve null khong duoc kiem tra
        String result = getResult();
        // result.toUpperCase();  // NPE neu getResult() tra ve null
    }

    static String getResult() {
        return null; // Method co the tra ve null
    }
}
```

---

## 2. Cách phòng tránh NPE

### 2.1 Kiểm tra null trước khi sử dụng

```java
public class NullCheckDemo {
    public static void main(String[] args) {
        String name = getUserName(); // co the null

        // Cach 1: If-check
        if (name != null) {
            System.out.println(name.toUpperCase());
        }

        // Cach 2: Ternary operator
        String display = (name != null) ? name.toUpperCase() : "Unknown";
        System.out.println(display);
    }

    static String getUserName() {
        return null;
    }
}
```

### 2.2 Null-safe comparison ("constant".equals(var))

```java
public class NullSafeCompare {
    public static void main(String[] args) {
        String role = null;

        // ❌ Sai: Neu role = null thi NPE
        // role.equals("admin");  // NullPointerException!

        // ✅ Dung: Dat constant phia truoc
        if ("admin".equals(role)) {
            System.out.println("La admin");
        } else {
            System.out.println("Khong phai admin");  // In dong nay
        }

        // ✅ Hoac dung Objects.equals() (Java 7+)
        if (java.util.Objects.equals(role, "admin")) {
            System.out.println("La admin");
        }
    }
}
```

### 2.3 Trả về empty collection thay vì null

```java
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

public class ReturnEmptyDemo {
    // ❌ Sai: Tra ve null
    static List<String> getUsersBad() {
        // ... khong tim thay user
        return null; // Nguoi goi phai check null
    }

    // ✅ Dung: Tra ve empty collection
    static List<String> getUsersGood() {
        // ... khong tim thay user
        return Collections.emptyList(); // An toan, nguoi goi dung truc tiep
    }

    // ✅ Dung: Tra ve empty string thay vi null
    static String getDisplayName(String name) {
        if (name == null || name.isEmpty()) {
            return ""; // Thay vi return null
        }
        return name.trim();
    }

    public static void main(String[] args) {
        // Voi getUsersBad():
        List<String> badUsers = getUsersBad();
        // badUsers.size();  // NPE!

        // Voi getUsersGood():
        List<String> goodUsers = getUsersGood();
        System.out.println("So user: " + goodUsers.size()); // An toan: 0
    }
}
```

### 2.4 Sử dụng Objects.requireNonNull()

```java
import java.util.Objects;

public class RequireNonNullDemo {

    private final String name;
    private final String email;

    // Constructor kiem tra null ngay khi tao object
    public RequireNonNullDemo(String name, String email) {
        this.name = Objects.requireNonNull(name, "name khong duoc null");
        this.email = Objects.requireNonNull(email, "email khong duoc null");
    }

    // Method kiem tra tham so dau vao
    public void sendEmail(String to, String subject) {
        Objects.requireNonNull(to, "Dia chi email khong duoc null");
        Objects.requireNonNull(subject, "Tieu de khong duoc null");
        System.out.println("Gui email den: " + to);
    }

    public static void main(String[] args) {
        // OK
        RequireNonNullDemo demo = new RequireNonNullDemo("An", "an@mail.com");
        demo.sendEmail("bob@mail.com", "Hello");

        // Throw NullPointerException voi message ro rang
        try {
            RequireNonNullDemo bad = new RequireNonNullDemo(null, "test@mail.com");
        } catch (NullPointerException e) {
            System.out.println("Loi: " + e.getMessage()); // "name khong duoc null"
        }
    }
}
```

### 2.5 Sử dụng Optional (Java 8+)

```java
import java.util.Optional;

public class OptionalDemo {

    // Tra ve Optional thay vi co the null
    static Optional<String> findUserById(int id) {
        if (id == 1) {
            return Optional.of("Nguyen Van A");
        }
        return Optional.empty(); // Thay vi return null
    }

    public static void main(String[] args) {
        // Cach 1: ifPresent -- thuc hien action neu co gia tri
        findUserById(1).ifPresent(name ->
            System.out.println("Tim thay: " + name)
        );

        // Cach 2: orElse -- gia tri mac dinh neu khong co
        String user = findUserById(99).orElse("Khong tim thay");
        System.out.println(user); // "Khong tim thay"

        // Cach 3: orElseThrow -- throw exception neu khong co
        try {
            String required = findUserById(99)
                .orElseThrow(() -> new RuntimeException("User khong ton tai"));
        } catch (RuntimeException e) {
            System.out.println("Loi: " + e.getMessage());
        }

        // Cach 4: map -- chuyen doi gia tri an toan
        Optional<Integer> nameLength = findUserById(1)
            .map(String::length);
        System.out.println("Do dai ten: " + nameLength.orElse(0)); // 12

        // Cach 5: filter -- loc gia tri
        Optional<String> admin = findUserById(1)
            .filter(name -> name.startsWith("Admin"));
        System.out.println("La admin: " + admin.isPresent()); // false
    }
}
```

### 2.6 Tránh multi-dot syntax (chuỗi gọi method dài)

```java
public class MultiDotDemo {

    static class Address {
        String city;
        Address(String city) { this.city = city; }
        String getCity() { return city; }
    }

    static class Customer {
        Address address;
        Customer(Address address) { this.address = address; }
        Address getAddress() { return address; }
    }

    static class Order {
        Customer customer;
        Order(Customer customer) { this.customer = customer; }
        Customer getCustomer() { return customer; }
    }

    public static void main(String[] args) {
        Order order = new Order(new Customer(null)); // address = null

        // ❌ Sai: Multi-dot -- bat ky dot nao cung co the NPE
        // String city = order.getCustomer().getAddress().getCity(); // NPE!

        // ✅ Cach 1: Tach ra va kiem tra tung buoc
        Customer customer = order.getCustomer();
        if (customer != null) {
            Address address = customer.getAddress();
            if (address != null) {
                System.out.println("City: " + address.getCity());
            }
        }

        // ✅ Cach 2: Dung Optional chain (Java 8+)
        String city = java.util.Optional.ofNullable(order.getCustomer())
            .map(Customer::getAddress)
            .map(Address::getCity)
            .orElse("Khong co thong tin");

        System.out.println("City: " + city); // "Khong co thong tin"
    }
}
```

---

## Khi nào dùng?

| Kỹ thuật | Khi nào dùng |
|----------|-------------|
| `if (x != null)` | Kiểm tra đơn giản, code cũ trước Java 8 |
| `"constant".equals(var)` | Mỗi khi so sánh String với hằng số |
| `Objects.requireNonNull()` | Đầu constructor/method, fail-fast pattern |
| `Optional` | Return type của method có thể không có giá trị |
| Return empty collection | Method trả về List, Set, Map |
| Tách multi-dot | Chuỗi gọi method dài hơn 2 dot |

**Best practices:**
- Dùng `Optional` làm **return type**, KHÔNG dùng làm parameter.
- Không bao giờ gọi `Optional.get()` mà không kiểm tra `isPresent()` trước.
- Ưu tiên `orElse()`, `orElseGet()`, `map()` thay vì `isPresent() + get()`.
- Trong constructor và method public, dùng `Objects.requireNonNull()` để fail-fast.
- Luôn trả về empty collection thay vì null.

---

## Lỗi thường gặp

### Lỗi 1: Không kiểm tra null trước khi dùng

```java
// ❌ Sai: Khong kiem tra
String name = request.getParameter("name");
int length = name.length(); // NPE neu parameter khong ton tai!
```

```java
// ✅ Dung: Kiem tra truoc
String name = request.getParameter("name");
int length = (name != null) ? name.length() : 0;
```

### Lỗi 2: So sánh String với biến ở trước

```java
// ❌ Sai: Bien co the null
String status = getStatus();
if (status.equals("ACTIVE")) { } // NPE!
```

```java
// ✅ Dung: Constant o truoc
if ("ACTIVE".equals(status)) { } // An toan, khong bao gio NPE
```

### Lỗi 3: Lạm dụng Optional

```java
// ❌ Sai: Dung Optional lam parameter
public void process(Optional<String> name) { } // Anti-pattern!

// ✅ Dung: Dung Optional lam return type
public Optional<String> findName(int id) {
    // ...
    return Optional.empty();
}

// ❌ Sai: Goi get() khong kiem tra
Optional<String> opt = findName(1);
String name = opt.get(); // NoSuchElementException neu empty!

// ✅ Dung: Dung orElse hoac ifPresent
String name2 = findName(1).orElse("default");
```

### Lỗi 4: Trả về null từ method

```java
// ❌ Sai: Tra ve null
public List<User> findUsers() {
    if (noResults) return null; // Nguy hiem!
}

// ✅ Dung: Tra ve empty collection
public List<User> findUsers() {
    if (noResults) return Collections.emptyList(); // An toan
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: NullPointerException là checked hay unchecked exception?

**Trả lời:** NPE là **unchecked exception** (kế thừa từ `RuntimeException`). Điều này có nghĩa:
- Compiler **không bắt buộc** bạn phải try-catch hoặc khai báo throws.
- NPE xảy ra tại **runtime**, không phải compile-time.
- Đây là lỗi **logic của lập trình viên**, không phải lỗi hệ thống.
- Cách xử lý đúng là **phòng tránh** (null-check, Optional), không phải try-catch.

### Câu 2: Optional là gì và khi nào nên dùng?

**Trả lời:** `Optional<T>` là một container class trong `java.util` (Java 8+) có thể chứa hoặc không chứa giá trị non-null.

**Khi nào dùng:**
- Làm **return type** của method khi kết quả có thể không có giá trị.
- Ví dụ: `Optional<User> findById(int id)`.

**Khi nào KHÔNG dùng:**
- Làm tham số (parameter) của method.
- Làm field của class (Optional không implement Serializable).
- Khi giá trị **luôn có** (dùng `Objects.requireNonNull()` thay thế).

### Câu 3: Những null-safe pattern nào bạn thường dùng?

**Trả lời:**
1. **"constant".equals(var)**: Đặt constant trước khi so sánh String.
2. **Objects.requireNonNull()**: Fail-fast trong constructor và method.
3. **Optional chain**: `Optional.ofNullable(x).map(...).orElse(default)`.
4. **Return empty collection**: `Collections.emptyList()` thay vì `null`.
5. **Null Object pattern**: Tạo object "rỗng" có hành vi mặc định thay vì dùng null.

### Câu 4: Helpful NullPointerException trong Java 14+ là gì?

**Trả lời:** Từ Java 14, JVM có thể hiển thị **thông báo chi tiết** về nguyên nhân NPE. Ví dụ:

```
// Truoc Java 14:
Exception: java.lang.NullPointerException

// Tu Java 14 (voi -XX:+ShowCodeDetailsInExceptionMessages):
Exception: java.lang.NullPointerException:
  Cannot invoke "String.length()" because "name" is null
```

Thông báo chỉ **rõ tên biến** và **method** gây lỗi, giúp debug nhanh hơn rất nhiều. Từ Java 16, tính năng này được **bật mặc định**.
