---
sidebar_position: 1
title: "1. Unit Testing với JUnit 5"
---

# Unit Testing với JUnit 5

**Unit Test** = test **đơn vị nhỏ nhất** (method, class) một cách **độc lập** -- không phụ thuộc DB, network, file. **JUnit** là framework testing **phổ biến nhất** Java -- mọi project đều dùng.

**Tương tự đơn giản:** Unit test giống **kiểm tra từng linh kiện** ở nhà máy ô tô trước khi lắp ráp. Mỗi linh kiện được test riêng -- nếu sai, sửa ngay; nếu OK mới lắp vào xe.

---

## Mục lục

- [1. Unit Testing là gì?](#1-unit-testing-là-gì)
- [2. JUnit 5 (Jupiter)](#2-junit-5-jupiter)
- [3. Assertion](#3-assertion)
- [4. Lifecycle annotation](#4-lifecycle-annotation)
- [5. Parameterized Test](#5-parameterized-test)
- [6. AssertJ -- assertion mạnh hơn](#6-assertj-assertion-mạnh-hơn)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Unit Testing là gì?

Unit test:

- Test **1 đơn vị code** (method, class)
- **Nhanh** (< 100ms)
- **Độc lập** -- không phụ thuộc state, thứ tự
- **Đáng tin** -- chạy 1000 lần kết quả như nhau
- **Tự kiểm tra** -- assertion pass/fail rõ ràng

### Pyramid testing

```
      /\
     /  \      E2E      (it -- cham, kho viet)
    /----\
   /      \    Integration  (nhieu hon)
  /--------\
 /          \  Unit         (nhieu nhat -- nhanh, re)
/____________\
```

---

## 2. JUnit 5 (Jupiter)

### Cài đặt

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.0</version>
    <scope>test</scope>
</dependency>
```

Spring Boot tự bao gồm.

### Test đầu tiên

```java
package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    void cong_haiSoNguyen_traVeTong() {
        Calculator calc = new Calculator();
        int result = calc.add(2, 3);
        assertEquals(5, result);
    }

    @Test
    void chia_choSoKhong_neamException() {
        Calculator calc = new Calculator();
        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));
    }
}
```

### Convention đặt tên

| Cách           | Ví dụ                            |
| -------------- | -------------------------------- |
| Mô tả tiếng Anh| `shouldReturnSum_whenAddingTwoIntegers` |
| Given-When-Then| `givenTwoIntegers_whenAdding_thenReturnsSum` |
| Tiếng Việt     | `cong_haiSoNguyen_traVeTong`     |

### `@DisplayName`

```java
@Test
@DisplayName("Cộng hai số nguyên trả về tổng đúng")
void testAdd() { ... }
```

---

## 3. Assertion

```java
import static org.junit.jupiter.api.Assertions.*;

// Equal
assertEquals(5, result);
assertEquals(5L, result, "Message neu fail");
assertNotEquals(5, result);

// Boolean
assertTrue(condition);
assertFalse(condition);

// Null
assertNull(obj);
assertNotNull(obj);

// Reference
assertSame(obj1, obj2);     // ==
assertNotSame(obj1, obj2);

// Array
assertArrayEquals(new int[]{1, 2, 3}, result);

// Collection (don gian -- nen dung AssertJ)
assertEquals(List.of(1, 2, 3), list);

// Exception
ArithmeticException ex = assertThrows(
    ArithmeticException.class,
    () -> calc.divide(10, 0)
);
assertEquals("/ by zero", ex.getMessage());

// Multiple
assertAll("user properties",
    () -> assertEquals("Alice", user.name()),
    () -> assertEquals(25, user.age()),
    () -> assertNotNull(user.email())
);

// Timeout
assertTimeout(Duration.ofSeconds(1), () -> {
    // chay xong trong 1s
});
```

---

## 4. Lifecycle annotation

```java
class UserServiceTest {

    @BeforeAll  // 1 lan truoc tat ca test
    static void setUpClass() {
        System.out.println("Setup class");
    }

    @BeforeEach  // Truoc moi test
    void setUp() {
        // tao instance moi
    }

    @AfterEach  // Sau moi test
    void tearDown() {
        // cleanup
    }

    @AfterAll  // 1 lan sau tat ca
    static void tearDownClass() { }

    @Test
    void test1() { }

    @Test
    @Disabled("Lý do disable")
    void testTam() { }

    @Test
    @Tag("slow")
    void testCham() { }
}
```

### Nested test

```java
@Nested
@DisplayName("Khi user dang nhap")
class WhenUserLogin {

    @Test
    void shouldAllowValidCredentials() { ... }

    @Test
    void shouldRejectInvalidCredentials() { ... }
}
```

---

## 5. Parameterized Test

Chạy 1 test với nhiều input.

```java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 4, 5})
void duong(int x) {
    assertTrue(x > 0);
}

@ParameterizedTest
@ValueSource(strings = {"", " ", "\t"})
void rong(String input) {
    assertTrue(input.isBlank());
}

// CsvSource -- nhieu tham so
@ParameterizedTest
@CsvSource({
    "1, 2, 3",
    "5, 5, 10",
    "-1, 1, 0"
})
void cong(int a, int b, int expected) {
    assertEquals(expected, new Calculator().add(a, b));
}

// MethodSource -- du lieu tu method
@ParameterizedTest
@MethodSource("provideUsers")
void testUser(User user) {
    assertNotNull(user.getName());
}

static Stream<User> provideUsers() {
    return Stream.of(
        new User("Alice", 25),
        new User("Bob", 30)
    );
}

// EnumSource
@ParameterizedTest
@EnumSource(Role.class)
void testEveryRole(Role role) { ... }
```

---

## 6. AssertJ -- assertion mạnh hơn

JUnit assertion cơ bản. **AssertJ** cung cấp fluent API rất mạnh.

```xml
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <version>3.24.2</version>
    <scope>test</scope>
</dependency>
```

```java
import static org.assertj.core.api.Assertions.*;

assertThat(result).isEqualTo(5);

assertThat(list)
    .hasSize(3)
    .contains("Alice")
    .doesNotContain("Bob")
    .containsExactly("Alice", "Bob", "Charlie");

assertThat(map)
    .hasSize(2)
    .containsKey("name")
    .containsEntry("age", 25);

assertThat(user)
    .extracting("name", "age")
    .containsExactly("Alice", 25);

assertThat(date).isAfter(LocalDate.of(2020, 1, 1));

assertThatThrownBy(() -> service.fail())
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("invalid");

// Optional
assertThat(opt)
    .isPresent()
    .hasValue("Alice");
```

---

## Khi nào dùng?

- **Viết unit test cho:**
  - Business logic
  - Utility class
  - Algorithm
  - Bug fix (regression test)
- **Best practice:**
  - **F.I.R.S.T**: Fast, Independent, Repeatable, Self-validating, Timely
  - **Arrange-Act-Assert** pattern
  - 1 assertion concept/test (có thể nhiều assertEquals)
  - Test **edge case**: empty, null, max, min
  - Tên test mô tả **kết quả mong đợi**
  - Coverage 80%+ cho code business

---

## Lỗi thường gặp

### Lỗi 1: Test phụ thuộc thứ tự

```java
// SAI -- shared state
static List<User> users = new ArrayList<>();

@Test void test1() { users.add(new User()); }
@Test void test2() { assertEquals(1, users.size()); } // depends on test1

// DUNG -- moi test doc lap
@BeforeEach void setUp() { users = new ArrayList<>(); }
```

### Lỗi 2: Test slow

```java
// SAI -- goi DB that
@Test void test() {
    DB.connect();
    User u = DB.findUser(1);
}

// DUNG -- mock
when(repo.findById(1L)).thenReturn(Optional.of(user));
```

### Lỗi 3: Test 1 method test 10 thứ

```java
// SAI -- kho debug
@Test void everything() {
    // test create
    // test update
    // test delete
}

// DUNG -- moi action 1 test
@Test void create() { ... }
@Test void update() { ... }
@Test void delete() { ... }
```

### Lỗi 4: Test với date hiện tại

```java
// SAI -- chay sau 1 nam co the fail
LocalDate today = LocalDate.now();

// DUNG -- inject Clock
Clock clock = Clock.fixed(Instant.parse("2026-05-28T00:00:00Z"), ZoneOffset.UTC);
```

### Lỗi 5: Quên assertion

```java
@Test
void test() {
    service.doSomething(); // khong co assert -> luon pass
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Unit Test là gì? F.I.R.S.T là gì?

**Trả lời:** Test 1 đơn vị code (method, class) độc lập. **F.I.R.S.T**:

- **F**ast -- chạy < 100ms
- **I**ndependent -- không phụ thuộc test khác
- **R**epeatable -- nhiều lần cùng kết quả
- **S**elf-validating -- pass/fail rõ ràng
- **T**imely -- viết cùng/trước code

### Câu 2: JUnit 4 và JUnit 5 khác gì?

**Trả lời:**

- **Package**: JUnit 4 `org.junit`, JUnit 5 `org.junit.jupiter.api`
- **Annotation**: `@Before` -> `@BeforeEach`, `@BeforeClass` -> `@BeforeAll`
- **Modular**: JUnit 5 chia 3 module (API, Engine, Runner)
- **Extension**: JUnit 5 dùng `@ExtendWith` thay `@RunWith`
- **Tính năng**: JUnit 5 có `@Nested`, `@DisplayName`, `@ParameterizedTest` mạnh hơn

JUnit 5 (Jupiter) là chuẩn cho project mới.

### Câu 3: Arrange-Act-Assert pattern?

**Trả lời:** Cấu trúc 3 phần của test:

```java
@Test
void test() {
    // Arrange -- setup
    Calculator calc = new Calculator();

    // Act -- goi
    int result = calc.add(2, 3);

    // Assert -- check
    assertEquals(5, result);
}
```

Tách rõ phần setup, action, verification -- dễ đọc, dễ maintain.

### Câu 4: Parameterized test khi nào dùng?

**Trả lời:** Khi cùng logic test với nhiều input. Thay vì viết 5 test riêng cho 5 case, viết 1 test parameterized + `@ValueSource`/`@CsvSource`/`@MethodSource`. DRY, dễ thêm case mới.

### Câu 5: AssertJ vs JUnit assertion?

**Trả lời:**

- **JUnit**: cơ bản (`assertEquals`, `assertTrue`)
- **AssertJ**: fluent, mạnh -- chain assertion, error message rõ hơn

```java
// JUnit
assertEquals(3, list.size());
assertTrue(list.contains("a"));

// AssertJ -- chain
assertThat(list).hasSize(3).contains("a");
```

Khuyến nghị AssertJ cho code mới.
