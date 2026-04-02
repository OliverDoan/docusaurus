---
sidebar_position: 30
title: "Tranh NullPointerException"
---

# Tranh NullPointerException trong Java

## NullPointerException la gi?

**NullPointerException (NPE)** la mot trong nhung loi runtime **pho bien nhat** trong Java. Loi nay xay ra khi chuong trinh co gang truy cap method, field, hoac property cua mot **tham chieu null** -- tuc la mot bien chua tro den bat ky object nao.

Hay tuong tuong ban co mot **dia chi nha** (bien tham chieu). Binh thuong, dia chi nay tro den mot ngoi nha that (object). Nhung neu dia chi la `null`, tuc la **khong co ngoi nha nao ca**. Khi ban co go cua (goi method) tai dia chi khong ton tai, ban se gap loi -- do chinh la `NullPointerException`.

Hieu va biet cach phong tranh NPE la ky nang thiet yeu cua moi lap trinh vien Java.

---

## 1. Nguyen nhan pho bien gay NPE

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

## 2. Cach phong tranh NPE

### 2.1 Kiem tra null truoc khi su dung

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

### 2.3 Tra ve empty collection thay vi null

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

### 2.4 Su dung Objects.requireNonNull()

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

### 2.5 Su dung Optional (Java 8+)

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

### 2.6 Tranh multi-dot syntax (chuoi goi method dai)

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

## Khi nao dung?

| Ky thuat | Khi nao dung |
|----------|-------------|
| `if (x != null)` | Kiem tra don gian, code cu truoc Java 8 |
| `"constant".equals(var)` | Moi khi so sanh String voi hang so |
| `Objects.requireNonNull()` | Dau constructor/method, fail-fast pattern |
| `Optional` | Return type cua method co the khong co gia tri |
| Return empty collection | Method tra ve List, Set, Map |
| Tach multi-dot | Chuoi goi method dai hon 2 dot |

**Best practices:**
- Dung `Optional` lam **return type**, KHONG dung lam parameter.
- Khong bao gio goi `Optional.get()` ma khong kiem tra `isPresent()` truoc.
- Uu tien `orElse()`, `orElseGet()`, `map()` thay vi `isPresent() + get()`.
- Trong constructor va method public, dung `Objects.requireNonNull()` de fail-fast.
- Luon tra ve empty collection thay vi null.

---

## Loi thuong gap

### Loi 1: Khong kiem tra null truoc khi dung

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

### Loi 2: So sanh String voi bien o truoc

```java
// ❌ Sai: Bien co the null
String status = getStatus();
if (status.equals("ACTIVE")) { } // NPE!
```

```java
// ✅ Dung: Constant o truoc
if ("ACTIVE".equals(status)) { } // An toan, khong bao gio NPE
```

### Loi 3: Lam dung Optional

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

### Loi 4: Tra ve null tu method

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

## Cau hoi phong van

### Cau 1: NullPointerException la checked hay unchecked exception?

**Tra loi:** NPE la **unchecked exception** (ke thua tu `RuntimeException`). Dieu nay co nghia:
- Compiler **khong bat buoc** ban phai try-catch hoac khai bao throws.
- NPE xay ra tai **runtime**, khong phai compile-time.
- Day la loi **logic cua lap trinh vien**, khong phai loi he thong.
- Cach xu ly dung la **phong tranh** (null-check, Optional), khong phai try-catch.

### Cau 2: Optional la gi va khi nao nen dung?

**Tra loi:** `Optional<T>` la mot container class trong `java.util` (Java 8+) co the chua hoac khong chua gia tri non-null.

**Khi nao dung:**
- Lam **return type** cua method khi ket qua co the khong co gia tri.
- Vi du: `Optional<User> findById(int id)`.

**Khi nao KHONG dung:**
- Lam tham so (parameter) cua method.
- Lam field cua class (Optional khong implement Serializable).
- Khi gia tri **luon co** (dung `Objects.requireNonNull()` thay the).

### Cau 3: Nhung null-safe pattern nao ban thuong dung?

**Tra loi:**
1. **"constant".equals(var)**: Dat constant truoc khi so sanh String.
2. **Objects.requireNonNull()**: Fail-fast trong constructor va method.
3. **Optional chain**: `Optional.ofNullable(x).map(...).orElse(default)`.
4. **Return empty collection**: `Collections.emptyList()` thay vi `null`.
5. **Null Object pattern**: Tao object "rong" co hanh vi mac dinh thay vi dung null.

### Cau 4: Helpful NullPointerException trong Java 14+ la gi?

**Tra loi:** Tu Java 14, JVM co the hien thi **thong bao chi tiet** ve nguyen nhan NPE. Vi du:

```
// Truoc Java 14:
Exception: java.lang.NullPointerException

// Tu Java 14 (voi -XX:+ShowCodeDetailsInExceptionMessages):
Exception: java.lang.NullPointerException:
  Cannot invoke "String.length()" because "name" is null
```

Thong bao chi **ro ten bien** va **method** gay loi, giup debug nhanh hon rat nhieu. Tu Java 16, tinh nang nay duoc **bat mac dinh**.
