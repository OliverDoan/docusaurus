---
sidebar_position: 2
title: "2. TestNG"
---

# TestNG -- Framework testing thay thế JUnit

**TestNG** là framework testing **lấy cảm hứng từ JUnit nhưng mạnh hơn** -- hỗ trợ test phụ thuộc, parallel execution, data provider, suite XML. Phổ biến trong test enterprise, automation.

**Tương tự đơn giản:** JUnit giống **xe gia đình** -- đủ cho cuộc sống hằng ngày. TestNG giống **xe SUV** -- to hơn, nhiều tính năng off-road (parallel, dependency, group).

---

## Mục lục

- [1. TestNG là gì?](#1-testng-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Test cơ bản](#3-test-cơ-bản)
- [4. Annotation lifecycle](#4-annotation-lifecycle)
- [5. Data Provider](#5-data-provider)
- [6. Group và Dependency](#6-group-và-dependency)
- [7. Parallel execution](#7-parallel-execution)
- [8. testng.xml -- suite](#8-testngxml-suite)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. TestNG là gì?

Đặc điểm:

- **Annotation richer** -- nhiều hơn JUnit
- **Data Provider** -- parameterized test mạnh
- **Group** -- gắn tag, chạy nhóm
- **Dependency** -- test A chạy trước test B
- **Parallel** -- chạy song song built-in
- **Suite XML** -- config test suite

---

## 2. Cài đặt

```xml
<dependency>
    <groupId>org.testng</groupId>
    <artifactId>testng</artifactId>
    <version>7.9.0</version>
    <scope>test</scope>
</dependency>
```

### Maven Surefire

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.0</version>
    <configuration>
        <suiteXmlFiles>
            <suiteXmlFile>testng.xml</suiteXmlFile>
        </suiteXmlFiles>
    </configuration>
</plugin>
```

---

## 3. Test cơ bản

```java
import org.testng.annotations.Test;
import static org.testng.Assert.*;

public class CalculatorTest {

    @Test
    public void testAdd() {
        Calculator calc = new Calculator();
        assertEquals(calc.add(2, 3), 5);
    }

    @Test(expectedExceptions = ArithmeticException.class)
    public void testDivideByZero() {
        new Calculator().divide(10, 0);
    }
}
```

### Assertion

```java
assertEquals(actual, expected);          // chu y thu tu (TestNG nguoc JUnit)
assertEquals(actual, expected, "msg");
assertNotEquals(actual, expected);
assertTrue(condition);
assertFalse(condition);
assertNull(obj);
assertNotNull(obj);
assertSame(a, b);
assertEqualsNoOrder(actualArr, expectedArr);
```

**Lưu ý:** TestNG `assertEquals(actual, expected)` -- **actual trước**. JUnit ngược (`expected` trước).

---

## 4. Annotation lifecycle

```java
@BeforeSuite    // 1 lan truoc toan suite
@AfterSuite

@BeforeTest     // truoc <test> trong testng.xml
@AfterTest

@BeforeClass    // 1 lan truoc class
@AfterClass

@BeforeMethod   // truoc moi method (= @BeforeEach JUnit)
@AfterMethod

@Test           // method test
```

Ví dụ:

```java
public class UserServiceTest {

    @BeforeClass
    public void setUpAll() { System.out.println("Setup class"); }

    @BeforeMethod
    public void setUp() { System.out.println("Setup method"); }

    @Test
    public void test1() { ... }

    @Test
    public void test2() { ... }

    @AfterMethod
    public void tearDown() { ... }
}
```

---

## 5. Data Provider

Parameterized test mạnh hơn JUnit.

```java
@DataProvider(name = "addData")
public Object[][] addData() {
    return new Object[][] {
        {1, 2, 3},
        {5, 5, 10},
        {-1, 1, 0}
    };
}

@Test(dataProvider = "addData")
public void testAdd(int a, int b, int expected) {
    assertEquals(new Calculator().add(a, b), expected);
}
```

### DataProvider từ class khác

```java
public class DataProviders {
    @DataProvider(name = "users")
    public static Object[][] users() { ... }
}

@Test(dataProvider = "users", dataProviderClass = DataProviders.class)
public void testUser(User u) { ... }
```

---

## 6. Group và Dependency

### Group

```java
@Test(groups = {"smoke", "fast"})
public void test1() { }

@Test(groups = {"slow", "regression"})
public void test2() { }

@Test(groups = {"smoke"})
public void test3() { }
```

Chạy chỉ group:

```bash
mvn test -Dgroups=smoke
```

### Dependency

```java
@Test
public void initDatabase() { }

@Test(dependsOnMethods = "initDatabase")
public void testQuery() { }

@Test(dependsOnMethods = {"initDatabase", "testQuery"})
public void testCleanup() { }
```

JUnit không hỗ trợ dependency -- coi là anti-pattern. TestNG hữu ích cho **integration test** có thứ tự.

---

## 7. Parallel execution

```xml
<!-- testng.xml -->
<suite name="MySuite" parallel="methods" thread-count="4">
    <test name="UserTests">
        <classes>
            <class name="com.example.UserServiceTest" />
        </classes>
    </test>
</suite>
```

`parallel` options: `methods`, `classes`, `tests`, `instances`.

### Test phải thread-safe

```java
// Class-level state -> race condition khi parallel
// Dung @BeforeMethod tao instance moi
```

---

## 8. testng.xml -- suite

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "http://testng.org/testng-1.0.dtd">

<suite name="AllTests" parallel="methods" thread-count="4">

    <test name="SmokeTests">
        <groups>
            <run>
                <include name="smoke" />
                <exclude name="slow" />
            </run>
        </groups>
        <packages>
            <package name="com.example.tests" />
        </packages>
    </test>

    <test name="RegressionTests">
        <classes>
            <class name="com.example.UserServiceTest" />
            <class name="com.example.OrderServiceTest" />
        </classes>
    </test>

</suite>
```

---

## Khi nào dùng?

- **TestNG khi:**
  - Selenium/UI automation (cần dependency, group, parallel)
  - Integration test có thứ tự
  - Cần parallel mạnh
  - Suite XML linh hoạt
- **JUnit khi:**
  - Spring Boot (chuẩn)
  - Unit test thường
  - Project mới (JUnit phổ biến hơn)
- **Best practice:**
  - Group test theo speed (smoke/regression)
  - Parallel test phải thread-safe
  - Dependency hạn chế -- ưu tiên test độc lập

---

## Lỗi thường gặp

### Lỗi 1: Order assertion ngược

```java
// SAI -- JUnit style (expected, actual)
assertEquals(5, calc.add(2, 3));

// DUNG -- TestNG (actual, expected)
assertEquals(calc.add(2, 3), 5);
```

### Lỗi 2: Parallel không thread-safe

```java
// SAI -- shared state
public class Test {
    static int count = 0;

    @Test public void t1() { count++; assertEquals(count, 1); } // FAIL khi parallel
}

// DUNG -- moi method instance moi
```

### Lỗi 3: Lạm dụng dependency

```java
// Anti-pattern -- test phai run theo thu tu
@Test(dependsOnMethods = "create")
public void update() { }

// Better -- test doc lap, dung @BeforeMethod setup
```

---

## Câu hỏi phỏng vấn

### Câu 1: TestNG vs JUnit?

**Trả lời:**

- **TestNG**: Group, dependency, parallel built-in, data provider mạnh, suite XML
- **JUnit**: Phổ biến hơn, Spring chuẩn, đơn giản

TestNG mạnh cho automation (Selenium). JUnit chuẩn cho project mới.

### Câu 2: `@DataProvider` khác `@ParameterizedTest` (JUnit)?

**Trả lời:** Cả 2 đều cung cấp parameter cho test. `@DataProvider` mạnh hơn -- linh hoạt source (method return `Object[][]`, có thể từ DB, file). JUnit `@ParameterizedTest` có `@ValueSource`, `@CsvSource`, `@MethodSource` -- tương tự nhưng cú pháp khác.

### Câu 3: Group và Dependency dùng để làm gì?

**Trả lời:**

- **Group**: gắn tag cho test, chạy nhóm (`-Dgroups=smoke`). Hữu ích cho CI pipeline khác nhau (smoke trên PR, regression hằng đêm).
- **Dependency**: test A chạy xong mới chạy B. Hữu ích cho integration test có thứ tự.

JUnit chưa có dependency (anti-pattern theo JUnit) -- TestNG cho phép.

### Câu 4: Parallel execution trong TestNG?

**Trả lời:** Config trong `testng.xml` -- `parallel="methods/classes/tests"`. TestNG tạo thread pool, chạy nhiều test song song. Cẩn thận thread-safety: shared state, static field, DB sequence...

### Câu 5: testng.xml dùng để làm gì?

**Trả lời:** File XML config test suite -- gom class/method thành nhóm, chạy theo thứ tự, parallel, include/exclude group. Linh hoạt hơn `@Tag` của JUnit. Hữu ích khi CI cần chạy subset khác nhau (smoke, regression, perf...).
