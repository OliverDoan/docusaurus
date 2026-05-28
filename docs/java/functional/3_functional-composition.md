---
sidebar_position: 3
title: "3. Functional Composition"
---

# Functional Composition -- Ghép hàm

**Function Composition** là việc **ghép nhiều hàm nhỏ** thành một hàm lớn. Đây là một trong những kỹ thuật mạnh nhất của lập trình hàm: thay vì viết một hàm phức tạp, bạn viết nhiều hàm đơn giản và ghép lại.

**Tương tự đơn giản:** Hãy tưởng tượng dây chuyền sản xuất ở nhà máy. Mỗi máy làm **một việc nhỏ**: cắt, rửa, sấy, đóng gói. Nguyên liệu đi qua **lần lượt** từng máy. **Composition** chính là ghép các "máy" (function) lại với nhau.

---

## Mục lục

- [1. Composition là gì?](#1-composition-là-gì)
- [2. `andThen` và `compose`](#2-andthen-và-compose)
- [3. Predicate composition](#3-predicate-composition)
- [4. Chain với Stream](#4-chain-với-stream)
- [5. Self-composition pattern](#5-self-composition-pattern)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Composition là gì?

Nếu có 2 hàm `f: A -> B` và `g: B -> C`, composition là hàm `h: A -> C` với `h(x) = g(f(x))`.

```java
import java.util.function.Function;

Function<Integer, Integer> add1 = x -> x + 1;
Function<Integer, Integer> mul2 = x -> x * 2;

// add1 roi mul2: (x+1) * 2
Function<Integer, Integer> combined = add1.andThen(mul2);
combined.apply(3); // (3+1)*2 = 8

// mul2 roi add1: (x*2) + 1
Function<Integer, Integer> reversed = add1.compose(mul2);
reversed.apply(3); // (3*2)+1 = 7
```

---

## 2. `andThen` và `compose`

### `andThen(g)` -- chạy `this` rồi `g`

```java
f.andThen(g).apply(x) = g(f(x))
```

### `compose(g)` -- chạy `g` rồi `this`

```java
f.compose(g).apply(x) = f(g(x))
```

**Hình dung:**

```
andThen:  input -> f -> g -> output
compose:  input -> g -> f -> output
```

### Ví dụ thực tế

```java
Function<String, String> trim = String::trim;
Function<String, String> lower = String::toLowerCase;
Function<String, String[]> split = s -> s.split("\\s+");
Function<String, String> normalize = trim.andThen(lower);
Function<String, String[]> normalizeAndSplit = normalize.andThen(split);

normalizeAndSplit.apply("  Hello World  ");
// ["hello", "world"]
```

### Chuỗi nhiều function

```java
Function<Integer, Integer> add5 = x -> x + 5;
Function<Integer, Integer> mul3 = x -> x * 3;
Function<Integer, String> toStr = x -> "Result: " + x;

Function<Integer, String> pipeline = add5
    .andThen(mul3)
    .andThen(toStr);

pipeline.apply(2); // "Result: 21"  -- (2+5)*3 = 21
```

---

## 3. Predicate composition

`Predicate` có 3 method tổ hợp: `and`, `or`, `negate`.

```java
import java.util.function.Predicate;

Predicate<Integer> isPositive = x -> x > 0;
Predicate<Integer> isEven = x -> x % 2 == 0;

Predicate<Integer> positiveEven = isPositive.and(isEven);
Predicate<Integer> positiveOrEven = isPositive.or(isEven);
Predicate<Integer> notPositive = isPositive.negate();

positiveEven.test(4);    // true
positiveEven.test(-4);   // false
positiveOrEven.test(-4); // true
notPositive.test(-1);    // true
```

### Filter chain với composition

```java
import java.util.*;

class User {
    String name; int age; boolean active;
    // ...
}

Predicate<User> isAdult = u -> u.age >= 18;
Predicate<User> isActive = u -> u.active;
Predicate<User> hasName = u -> u.name != null && !u.name.isBlank();

Predicate<User> isValid = isAdult.and(isActive).and(hasName);

List<User> valid = users.stream()
    .filter(isValid)
    .collect(Collectors.toList());
```

---

## 4. Chain với Stream

Stream API là composition tự nhiên:

```java
List<String> result = users.stream()
    .filter(u -> u.age >= 18)         // Predicate
    .map(User::getName)                // Function
    .filter(name -> !name.isBlank())  // Predicate
    .map(String::toUpperCase)          // Function
    .sorted()                          // Comparator
    .collect(Collectors.toList());     // Collector
```

Mỗi bước là một function, ghép lại thành pipeline xử lý dữ liệu.

---

## 5. Self-composition pattern

### Pipeline class

```java
import java.util.function.Function;

public class Pipeline<T, R> {
    private final Function<T, R> fn;

    private Pipeline(Function<T, R> fn) { this.fn = fn; }

    public static <T> Pipeline<T, T> start() {
        return new Pipeline<>(Function.identity());
    }

    public <V> Pipeline<T, V> pipe(Function<R, V> next) {
        return new Pipeline<>(fn.andThen(next));
    }

    public R apply(T input) {
        return fn.apply(input);
    }
}

// Su dung
String result = Pipeline.<String>start()
    .pipe(String::trim)
    .pipe(String::toLowerCase)
    .pipe(s -> s.replace(" ", "_"))
    .apply("  Hello World  ");
// "hello_world"
```

### Sử dụng cho data validation

```java
public class Validator<T> {
    private final Predicate<T> rule;
    private final String error;

    public Validator(Predicate<T> rule, String error) {
        this.rule = rule;
        this.error = error;
    }

    public Validator<T> and(Validator<T> other) {
        return new Validator<>(rule.and(other.rule), error + "; " + other.error);
    }

    public void validate(T input) {
        if (!rule.test(input)) throw new IllegalArgumentException(error);
    }
}

Validator<String> notEmpty = new Validator<>(s -> !s.isBlank(), "Empty");
Validator<String> minLen5 = new Validator<>(s -> s.length() >= 5, "Too short");
Validator<String> emailFormat = new Validator<>(s -> s.contains("@"), "No @");

Validator<String> emailValidator = notEmpty.and(minLen5).and(emailFormat);
emailValidator.validate("a@b.com"); // OK
```

---

## Khi nào dùng?

- **Function composition khi:**
  - Pipeline xử lý dữ liệu (data transformation)
  - Validation chain
  - Decorator pattern functional
  - Stream operations
- **Không nên dùng khi:**
  - Một step có side effect phức tạp -- composition giả định pure function
  - Logic phụ thuộc nhau (cần state) -- khó composition
- **Best practice:**
  - Function nên **pure** (không side effect) -- composition mới an toàn
  - Đặt tên hàm con rõ nghĩa
  - Tách thành **method reference** thay vì lambda dài
  - Test từng function riêng, rồi test pipeline

---

## Lỗi thường gặp

### Lỗi 1: Nhầm `andThen` và `compose`

```java
Function<Integer, Integer> add1 = x -> x + 1;
Function<Integer, Integer> mul2 = x -> x * 2;

add1.andThen(mul2).apply(3); // 8 = (3+1)*2
add1.compose(mul2).apply(3); // 7 = (3*2)+1
```

**Mẹo:** `andThen` đọc trái sang phải; `compose` đọc phải sang trái (như toán học `f∘g`).

### Lỗi 2: Side effect trong composition

```java
// SAI -- composition giai dinh pure
Function<String, String> trim = s -> {
    log("trimming"); // side effect
    return s.trim();
};

// Co the chay nhieu lan khong nhu mong doi
// DUNG -- tach side effect ra ngoai pipeline
```

### Lỗi 3: NPE trong chain

```java
// SAI -- mot buoc tra null, buoc sau NPE
Function<User, String> getEmail = user -> user.getEmail().toLowerCase();
// neu email null -> NPE

// DUNG -- dung Optional
Function<User, Optional<String>> getEmail = user ->
    Optional.ofNullable(user.getEmail()).map(String::toLowerCase);
```

### Lỗi 4: Composition quá dài

```java
// SAI -- 10 buoc, debug kho
fn.andThen(a).andThen(b).andThen(c)...

// DUNG -- tach thanh nhom
Function<X, Y> normalize = a.andThen(b).andThen(c);
Function<Y, Z> enhance = d.andThen(e).andThen(f);
Function<X, Z> pipeline = normalize.andThen(enhance);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Composition là gì?

**Trả lời:** Ghép nhiều function thành một function lớn. Toán học: `(f∘g)(x) = f(g(x))`. Java: `f.compose(g)` hoặc `g.andThen(f)`. Cho phép tách logic phức tạp thành các bước nhỏ, dễ đọc, dễ test.

### Câu 2: `andThen` vs `compose`?

**Trả lời:**

- `f.andThen(g)`: chạy `f` trước, kết quả vào `g` -- giống pipeline đọc trái sang phải
- `f.compose(g)`: chạy `g` trước, kết quả vào `f` -- giống ký hiệu toán `f∘g`

Cả 2 tương đương nhau (chỉ đổi vai trò). Trong code, `andThen` đọc tự nhiên hơn.

### Câu 3: Tại sao function pure quan trọng cho composition?

**Trả lời:** Pure function = cùng input ra cùng output, không side effect. Composition giả định mỗi function độc lập -- nếu có side effect, kết quả phụ thuộc thứ tự thực thi, khó test/debug. Pure function cho phép refactor pipeline tự do.

### Câu 4: Predicate composition khác Function composition?

**Trả lời:**

- **Predicate**: kết hợp logic boolean -- `and`, `or`, `negate`
- **Function**: kết hợp transformation -- `andThen`, `compose`

Predicate composition trả về Predicate; Function composition trả về Function. Cả 2 là functional composition nhưng ngữ nghĩa khác.

### Câu 5: Khi nào không nên composition?

**Trả lời:**

- Step có side effect heavy (DB write, network)
- Cần state giữa các step (dùng class)
- Performance critical -- mỗi `andThen` tạo lambda mới
- Debug khó -- stack trace dài, khó trace lỗi

Trong production, composition tốt cho 80% case data transformation/validation -- còn lại nên cân nhắc.
