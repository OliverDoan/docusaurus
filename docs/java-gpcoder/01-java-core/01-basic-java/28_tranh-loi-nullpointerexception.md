---
sidebar_position: 28
title: "Tránh lỗi NullPointerException trong Java"
---

# Tránh lỗi NullPointerException trong Java

**NullPointerException** (NPE) là một trong những lỗi phổ biến nhất trong Java. Lỗi này xảy ra khi bạn cố gắng **sử dụng một tham chiếu đang có giá trị `null`** — tức là không trỏ đến đối tượng nào.

---

## Nguyên nhân gây NullPointerException

```java
public class NPECauses {
    public static void main(String[] args) {
        String str = null;

        // 1. Gọi phương thức trên null
        str.length();         // NullPointerException!

        // 2. Truy cập trường của null
        Person person = null;
        person.name;          // NullPointerException!

        // 3. Dùng null trong phép tính
        int[] arr = null;
        int x = arr[0];       // NullPointerException!

        // 4. Unboxing null
        Integer n = null;
        int m = n;            // NullPointerException!

        // 5. Throw null
        throw null;           // NullPointerException!
    }
}
```

---

## Cách 1: Kiểm tra null trước khi dùng

```java
public class NullCheckDemo {
    public static String processName(String name) {
        // Kiểm tra null trước
        if (name == null) {
            return "Tên không xác định";
        }
        return name.toUpperCase();
    }

    public static void main(String[] args) {
        System.out.println(processName("an"));    // AN
        System.out.println(processName(null));    // Tên không xác định
        System.out.println(processName("bình")); // BÌNH
    }
}
```

---

## Cách 2: Optional — Java 8+

**`Optional<T>`** là lớp bọc giúp biểu diễn rõ ràng "giá trị có thể không tồn tại", thay vì dùng `null`.

```java
import java.util.Optional;

public class OptionalDemo {
    // Không dùng Optional
    public static String findUser_Old(int id) {
        if (id == 1) return "An";
        return null;  // Người dùng không tìm thấy
    }

    // Dùng Optional
    public static Optional<String> findUser(int id) {
        if (id == 1) return Optional.of("An");
        return Optional.empty();  // Không có giá trị
    }

    public static void main(String[] args) {
        // Dùng orElse() — giá trị mặc định nếu empty
        String user1 = findUser(1).orElse("Khách");
        System.out.println(user1);  // An

        String user2 = findUser(99).orElse("Khách");
        System.out.println(user2);  // Khách

        // Dùng orElseGet() — tính giá trị lười (lazy)
        String user3 = findUser(99).orElseGet(() -> "Người dùng mặc định");
        System.out.println(user3);  // Người dùng mặc định

        // Dùng orElseThrow() — ném ngoại lệ nếu empty
        try {
            String user4 = findUser(99)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());  // Không tìm thấy user
        }

        // Dùng ifPresent() — chỉ thực thi nếu có giá trị
        findUser(1).ifPresent(name -> System.out.println("Tìm thấy: " + name));

        // Dùng map() — chuyển đổi giá trị bên trong Optional
        Optional<Integer> nameLength = findUser(1).map(String::length);
        System.out.println(nameLength.orElse(0));  // 2
    }
}
```

---

## Cách 3: Objects utility class

```java
import java.util.Objects;

public class ObjectsDemo {
    public static void main(String[] args) {
        String name = null;

        // Objects.isNull() và nonNull()
        System.out.println(Objects.isNull(name));    // true
        System.out.println(Objects.nonNull(name));   // false

        // Objects.requireNonNull() — ném NPE với thông báo rõ ràng
        try {
            String validated = Objects.requireNonNull(name, "Tên không được null");
        } catch (NullPointerException e) {
            System.out.println(e.getMessage());  // Tên không được null
        }

        // Objects.requireNonNullElse() — Java 9+
        String result = Objects.requireNonNullElse(name, "Giá trị mặc định");
        System.out.println(result);  // Giá trị mặc định

        // Objects.toString() — an toàn với null
        System.out.println(Objects.toString(null, "N/A"));  // N/A
        System.out.println(Objects.toString("Java", "N/A")); // Java
    }
}
```

---

## Cách 4: Null Object Pattern

Thay vì trả về `null`, tạo một đối tượng "rỗng" (null object) với hành vi mặc định:

```java
public class NullObjectPattern {
    interface Logger {
        void log(String message);
    }

    // Logger thực sự
    static class ConsoleLogger implements Logger {
        public void log(String message) {
            System.out.println("[LOG] " + message);
        }
    }

    // Null Logger — không làm gì cả, nhưng không ném NPE
    static class NullLogger implements Logger {
        public void log(String message) {
            // Không làm gì
        }
    }

    static class Service {
        private final Logger logger;

        // Thay vì nhận null, nhận NullLogger
        Service(Logger logger) {
            this.logger = Objects.requireNonNull(logger, "logger không được null");
        }

        void process() {
            logger.log("Bắt đầu xử lý");
            // ... logic
            logger.log("Kết thúc xử lý");
        }
    }

    public static void main(String[] args) {
        // Dùng logger thực
        new Service(new ConsoleLogger()).process();

        // Dùng null logger — không log nhưng không lỗi
        new Service(new NullLogger()).process();
    }
}
```

---

## Cách 5: Defensive programming — Xác thực đầu vào

```java
public class DefensiveProgramming {
    // Validate ngay ở đầu phương thức
    public static int calculateLength(String text) {
        if (text == null) {
            throw new IllegalArgumentException("text không được null");
        }
        return text.length();
    }

    // Dùng assert (chỉ khi chạy với -ea flag)
    public static void process(String input) {
        assert input != null : "input không được null";
        // ...
    }

    // Dùng annotation @NonNull (với công cụ hỗ trợ như IntelliJ)
    // Nhắc nhở IDE cảnh báo khi truyền null
    public static void display(@SuppressWarnings("null") String value) {
        // ...
    }
}
```

---

## Cách 6: Sử dụng String an toàn

```java
public class SafeStringDemo {
    public static void main(String[] args) {
        String str = null;

        // Sai: str.equals("hello") → NPE nếu str null
        // if (str.equals("hello")) { ... }  // NPE!

        // Đúng cách 1: đặt hằng số bên trái
        if ("hello".equals(str)) {
            System.out.println("Bằng nhau");
        }

        // Đúng cách 2: dùng Objects.equals()
        if (Objects.equals(str, "hello")) {
            System.out.println("Bằng nhau");
        }

        // Kiểm tra chuỗi rỗng hoặc null an toàn
        if (str == null || str.isEmpty()) {
            System.out.println("Chuỗi null hoặc rỗng");
        }

        // Java 11+: isBlank() kiểm tra null-safe không? Không! Vẫn cần kiểm tra null trước.
        if (str != null && str.isBlank()) {
            System.out.println("Chuỗi rỗng hoặc chỉ có khoảng trắng");
        }
    }
}
```

---

## Helpful NullPointerException (Java 14+)

Từ Java 14, thông báo NPE rõ ràng hơn, chỉ đích xác biến nào là null:

```java
String str = null;
str.length();
```

**Java 14+ message:**
```
Cannot invoke "String.length()" because "str" is null
```

**Trước Java 14:**
```
NullPointerException
```

---

## Tóm tắt các chiến lược tránh NPE

| Chiến lược | Khi nào dùng |
|---|---|
| Kiểm tra `if (x == null)` | Đơn giản, trường hợp cụ thể |
| `Optional<T>` | API trả về có thể không có giá trị |
| `Objects.requireNonNull()` | Xác thực tham số đầu vào |
| `"value".equals(str)` | So sánh chuỗi |
| `Objects.equals(a, b)` | So sánh null-safe |
| Null Object Pattern | Tránh null check lặp đi lặp lại |
