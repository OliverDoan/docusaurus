---
sidebar_position: 5
title: "5. Optional (Tránh NullPointerException)"
---

# Optional -- Container giá trị có thể null

`NullPointerException` (NPE) là "kẻ thù số một" của lập trình viên Java. Tony Hoare -- người phát minh ra `null` -- gọi nó là **"the billion-dollar mistake"**. Java 8 giới thiệu `Optional<T>` để **bọc giá trị có thể null**, buộc bạn phải xử lý trường hợp không có giá trị một cách tường minh.

**Tương tự đơn giản:** Hãy tưởng tượng `Optional` như một **hộp quà**. Hộp có thể **có quà bên trong** (giá trị) hoặc **rỗng**. Trước khi mở hộp, bạn phải hỏi: "Hộp này có gì không?". Cách làm này giúp bạn không bao giờ bị "mở hộp rỗng" mà không chuẩn bị.

---

## Mục lục

- [1. Optional là gì?](#1-optional-là-gì)
- [2. Tạo Optional](#2-tạo-optional)
- [3. Lấy giá trị từ Optional](#3-lấy-giá-trị-từ-optional)
- [4. Optional với Stream API](#4-optional-với-stream-api)
- [5. Optional cho kiểu primitive](#5-optional-cho-kiểu-primitive)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Optional là gì?

`Optional<T>` là một **container** chứa **0 hoặc 1 giá trị** kiểu `T`.

```java
import java.util.Optional;

public class OptionalDemo {
    public static void main(String[] args) {
        Optional<String> co = Optional.of("Xin chao");
        Optional<String> rong = Optional.empty();

        System.out.println(co.isPresent());    // true
        System.out.println(rong.isPresent());  // false

        co.ifPresent(s -> System.out.println(s));    // In "Xin chao"
        rong.ifPresent(s -> System.out.println(s));  // Khong in gi
    }
}
```

---

## 2. Tạo Optional

### 3 cách tạo

```java
// 1. Optional.of(value) -- value khong duoc null, neu null se NPE
Optional<String> opt1 = Optional.of("hello");

// 2. Optional.ofNullable(value) -- chap nhan ca null
Optional<String> opt2 = Optional.ofNullable(getName()); // co the la null

// 3. Optional.empty() -- rong
Optional<String> opt3 = Optional.empty();
```

### Ví dụ trả về Optional từ method

```java
public class UserRepository {
    private Map<Long, User> data = new HashMap<>();

    // SAI -- tra ve null
    public User findById_BAD(Long id) {
        return data.get(id);
    }

    // DUNG -- tra ve Optional
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(data.get(id));
    }
}
```

---

## 3. Lấy giá trị từ Optional

### 3.1. `get()` -- KHÔNG khuyến khích

```java
Optional<String> opt = Optional.of("hello");
String s = opt.get(); // OK
String s2 = Optional.empty().get(); // NoSuchElementException!
```

`get()` ném exception nếu rỗng -- gần như không bao giờ nên dùng trực tiếp.

### 3.2. `orElse()` -- Giá trị mặc định

```java
String name = repo.findById(1L)
    .map(User::getName)
    .orElse("Khong xac dinh");
```

### 3.3. `orElseGet()` -- Lazy default

```java
// orElse: luon tinh "default name" du co gia tri hay khong
String name = opt.orElse(computeDefault()); // computeDefault() luon goi

// orElseGet: chi tinh khi opt rong
String name = opt.orElseGet(() -> computeDefault()); // chi goi neu can
```

**Lưu ý:** Dùng `orElseGet` khi việc tính default **tốn kém** (gọi DB, API).

### 3.4. `orElseThrow()` -- Ném exception nếu rỗng

```java
User user = repo.findById(1L)
    .orElseThrow(() -> new UserNotFoundException("Khong tim thay user 1"));
```

### 3.5. `ifPresent()` / `ifPresentOrElse()`

```java
// Java 8: chi xu ly khi co
opt.ifPresent(value -> System.out.println(value));

// Java 9+: xu ly ca 2 truong hop
opt.ifPresentOrElse(
    value -> System.out.println("Co: " + value),
    () -> System.out.println("Rong")
);
```

### 3.6. `isPresent()` / `isEmpty()`

```java
if (opt.isPresent()) { ... }    // Java 8
if (opt.isEmpty()) { ... }      // Java 11+
```

**Khuyến nghị:** Tránh `if (isPresent()) get()` -- dùng `ifPresent`, `map`, `orElse` thay thế.

---

## 4. Optional với Stream API

### `map()` và `flatMap()`

```java
// map -- bien doi gia tri
Optional<String> name = Optional.of("Alice");
Optional<Integer> length = name.map(String::length); // Optional[5]

// flatMap -- khi function tra ve Optional
Optional<User> user = repo.findById(1L);
Optional<String> email = user.flatMap(u -> Optional.ofNullable(u.getEmail()));
// Khong dung flatMap se ra Optional<Optional<String>>
```

### `filter()`

```java
Optional<User> adult = repo.findById(1L)
    .filter(user -> user.getAge() >= 18);
// Neu user duoi 18 -> Optional rong
```

### Chain các phép biến đổi

```java
String emailDomain = repo.findById(1L)
    .map(User::getEmail)
    .filter(email -> email.contains("@"))
    .map(email -> email.substring(email.indexOf("@") + 1))
    .orElse("unknown");
```

---

## 5. Optional cho kiểu primitive

Để tránh autoboxing, có các Optional chuyên cho primitive:

| Class            | Cho kiểu  |
| ---------------- | --------- |
| `OptionalInt`    | `int`     |
| `OptionalLong`   | `long`    |
| `OptionalDouble` | `double`  |

```java
OptionalInt age = OptionalInt.of(25);
age.ifPresent(a -> System.out.println("Tuoi: " + a));

int value = age.getAsInt(); // Khong phai get()
```

---

## Khi nào dùng?

- **Dùng Optional cho:**
  - Giá trị **trả về** từ method có thể không có (`findById`, `parse`)
  - API public của thư viện -- gợi ý người dùng xử lý null
- **KHÔNG dùng Optional cho:**
  - **Field** của class -- không serialize được, tốn bộ nhớ
  - **Tham số** method -- không có ý nghĩa, dùng method overload thay thế
  - **Collection** -- collection rỗng đã đủ ý nghĩa, không cần `Optional<List<T>>`
- **Best practice:**
  - Không trả về `null` từ method trả `Optional` -- luôn `Optional.empty()`
  - Dùng `orElseGet` thay `orElse` khi default tốn kém
  - Ưu tiên `ifPresent`, `map`, `orElse` thay vì `isPresent + get`

---

## Lỗi thường gặp

### Lỗi 1: Dùng `Optional.of` với giá trị có thể null

```java
// SAI -- neu getName() la null se NPE ngay
Optional<String> opt = Optional.of(user.getName());

// DUNG
Optional<String> opt = Optional.ofNullable(user.getName());
```

### Lỗi 2: `get()` không check

```java
// SAI
Optional<User> opt = repo.findById(1L);
String name = opt.get().getName(); // NoSuchElementException neu rong

// DUNG
String name = repo.findById(1L)
    .map(User::getName)
    .orElse("Unknown");
```

### Lỗi 3: Lạm dụng `orElse` với call tốn kém

```java
// SAI -- callApi() luon chay du co value
String result = opt.orElse(callApi());

// DUNG
String result = opt.orElseGet(() -> callApi());
```

### Lỗi 4: Optional làm field

```java
// SAI -- khong serialize duoc, ton bo nho
class User {
    private Optional<String> email;
}

// DUNG -- de null, return Optional khi can
class User {
    private String email;

    public Optional<String> getEmail() {
        return Optional.ofNullable(email);
    }
}
```

### Lỗi 5: Optional cho Collection

```java
// SAI -- thua
Optional<List<User>> findAll();

// DUNG -- collection rong da du nghia
List<User> findAll(); // tra ve Collections.emptyList() neu khong co
```

---

## Câu hỏi phỏng vấn

### Câu 1: Optional là gì và giải quyết vấn đề gì?

**Trả lời:** `Optional<T>` là container chứa 0 hoặc 1 giá trị, giới thiệu từ Java 8. Mục tiêu: thay thế việc trả về `null` từ method, **buộc người dùng API xử lý trường hợp rỗng tường minh**, giảm `NullPointerException`. Không phải để thay thế tất cả null mà chủ yếu cho giá trị return của method.

### Câu 2: `orElse` và `orElseGet` khác gì?

**Trả lời:** `orElse(value)` nhận **giá trị** -- luôn được tính dù Optional có giá trị hay không. `orElseGet(supplier)` nhận **Supplier** -- chỉ được gọi khi Optional rỗng. Dùng `orElseGet` khi việc tính default tốn kém (DB, API).

### Câu 3: Tại sao không nên dùng Optional làm field?

**Trả lời:**

- `Optional` không implement `Serializable` -- khó serialize qua mạng/DB
- Tốn bộ nhớ (object wrapper)
- Phá vỡ ý nghĩa: Optional là container "tạm thời", không phải state của entity
- JPA/Hibernate không hỗ trợ tốt

### Câu 4: `map` và `flatMap` khác gì trong Optional?

**Trả lời:** `map(Function<T, R>)` biến đổi giá trị, kết quả tự động wrap lại thành `Optional<R>`. `flatMap(Function<T, Optional<R>>)` dùng khi function **đã trả về Optional** -- tránh `Optional<Optional<R>>` lồng nhau.

### Câu 5: `isPresent + get` có gì sai?

**Trả lời:** Phong cách này **không tận dụng Optional**, vẫn giống `if (x != null)`. Tốt hơn là dùng `map`, `filter`, `ifPresent`, `orElse` -- thể hiện luồng dữ liệu rõ hơn và an toàn hơn.
