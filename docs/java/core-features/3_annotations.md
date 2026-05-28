---
sidebar_position: 3
title: "3. Annotations (Chú thích metadata)"
---

# Annotations -- Chú thích metadata trong Java

Annotation là **metadata** (dữ liệu mô tả dữ liệu) gắn vào code -- không thay đổi logic chạy, nhưng cung cấp thông tin cho **compiler**, **framework**, hoặc **runtime**. Đây là nền tảng của Spring, Hibernate, JUnit và hầu hết framework Java hiện đại.

**Tương tự đơn giản:** Hãy tưởng tượng bạn dán **nhãn** lên các hộp đồ: "Dễ vỡ", "Để trên cùng", "Không lật ngược". Các nhãn này không làm thay đổi nội dung hộp, nhưng cho người vận chuyển biết cách xử lý. Annotation chính là "nhãn dán" của code Java.

---

## Mục lục

- [1. Annotation là gì?](#1-annotation-là-gì)
- [2. Annotation có sẵn](#2-annotation-có-sẵn)
- [3. Meta-Annotation](#3-meta-annotation)
- [4. Tự tạo Annotation](#4-tự-tạo-annotation)
- [5. Đọc Annotation bằng Reflection](#5-đọc-annotation-bằng-reflection)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Annotation là gì?

Annotation bắt đầu bằng ký hiệu `@` và được gắn lên class, method, field, parameter, hoặc package.

```java
public class Animal {
    public void speak() {
        System.out.println("...");
    }
}

public class Dog extends Animal {
    @Override // Annotation
    public void speak() {
        System.out.println("Gau gau");
    }
}
```

`@Override` báo cho compiler biết: "Method này ghi đè từ class cha". Nếu viết sai tên method, compile sẽ báo lỗi -- giúp tránh bug.

---

## 2. Annotation có sẵn

### 2.1. Annotation cho compiler

| Annotation              | Ý nghĩa                                                |
| ----------------------- | ------------------------------------------------------ |
| `@Override`             | Báo method đang override từ class cha                  |
| `@Deprecated`           | Đánh dấu API cũ, không nên dùng                        |
| `@SuppressWarnings`     | Tắt cảnh báo của compiler                              |
| `@FunctionalInterface`  | Đánh dấu interface là Functional Interface             |
| `@SafeVarargs`          | Tắt cảnh báo về unchecked với varargs                  |

```java
public class AnnotationDemo {
    @Deprecated
    public void oldMethod() {
        System.out.println("Khong nen dung nua");
    }

    @SuppressWarnings("unchecked")
    public void riskyCast() {
        List list = new ArrayList();
        List<String> typed = (List<String>) list; // Co canh bao -- bi tat
    }
}
```

### 2.2. Annotation từ framework

```java
// Spring
@RestController
@RequestMapping("/users")
public class UserController { }

// JPA
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private Long id;
}

// JUnit
@Test
public void testAddition() {
    assertEquals(4, 2 + 2);
}
```

---

## 3. Meta-Annotation

**Meta-Annotation** là annotation **dùng để chú thích cho annotation khác**.

| Meta-Annotation   | Ý nghĩa                                                  |
| ----------------- | -------------------------------------------------------- |
| `@Target`         | Vị trí có thể gắn (class, method, field...)              |
| `@Retention`      | Annotation tồn tại đến khi nào (SOURCE, CLASS, RUNTIME)  |
| `@Documented`     | Đưa annotation vào Javadoc                               |
| `@Inherited`      | Class con kế thừa annotation từ class cha                |
| `@Repeatable`     | Cho phép gắn nhiều lần                                   |

### `@Retention` -- Vòng đời annotation

| Mức         | Khi nào tồn tại?                              | Ví dụ                     |
| ----------- | --------------------------------------------- | ------------------------- |
| `SOURCE`    | Chỉ trong code, bị xóa sau compile            | `@Override`               |
| `CLASS`     | Có trong `.class` nhưng JVM không load (default) | Ít dùng                |
| `RUNTIME`   | Có thể đọc bằng Reflection lúc chạy           | `@Autowired`, `@Test`     |

### `@Target` -- Vị trí

```java
@Target({ElementType.METHOD, ElementType.FIELD})
public @interface MyAnnotation { }
```

Các giá trị: `TYPE` (class/interface), `METHOD`, `FIELD`, `PARAMETER`, `CONSTRUCTOR`, `LOCAL_VARIABLE`, `ANNOTATION_TYPE`, `PACKAGE`, `TYPE_PARAMETER`, `TYPE_USE`.

---

## 4. Tự tạo Annotation

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LogExecutionTime {
    String value() default "";
    boolean enabled() default true;
}
```

### Sử dụng

```java
public class MyService {
    @LogExecutionTime(value = "doWork", enabled = true)
    public void doWork() {
        // ...
    }
}
```

### Quy tắc khai báo

- Dùng `@interface` (không phải `interface`)
- Các "method" thực chất là **thuộc tính** -- không có thân hàm
- Kiểu trả về phải là: primitive, `String`, `Class`, `enum`, annotation khác, hoặc array của các kiểu trên
- Có thể đặt giá trị mặc định bằng `default`
- Nếu chỉ có **một thuộc tính tên `value`**, có thể bỏ tên khi dùng: `@LogExecutionTime("doWork")`

---

## 5. Đọc Annotation bằng Reflection

Annotation chỉ thực sự **có ý nghĩa** khi được đọc và xử lý. Framework thường dùng **Reflection**.

```java
import java.lang.reflect.Method;

public class AnnotationReader {
    public static void main(String[] args) throws Exception {
        Method method = MyService.class.getMethod("doWork");

        if (method.isAnnotationPresent(LogExecutionTime.class)) {
            LogExecutionTime anno = method.getAnnotation(LogExecutionTime.class);
            System.out.println("Value: " + anno.value());
            System.out.println("Enabled: " + anno.enabled());
        }
    }
}
```

### Ví dụ: Annotation Processor đơn giản

```java
public class Logger {
    public static void invokeWithLog(Object obj, String methodName) throws Exception {
        Method method = obj.getClass().getMethod(methodName);

        if (method.isAnnotationPresent(LogExecutionTime.class)) {
            long start = System.nanoTime();
            method.invoke(obj);
            long end = System.nanoTime();
            System.out.println(methodName + " ran in " + (end - start) + " ns");
        } else {
            method.invoke(obj);
        }
    }

    public static void main(String[] args) throws Exception {
        invokeWithLog(new MyService(), "doWork");
    }
}
```

**Giải thích thuật ngữ:**

- **Reflection:** API cho phép kiểm tra/sửa class, method, field **lúc runtime**
- **Annotation Processor:** Công cụ xử lý annotation **lúc compile** (như Lombok)

---

## Khi nào dùng?

- **Dùng Annotation có sẵn khi:**
  - `@Override` -- mọi method override
  - `@Deprecated` -- đánh dấu API cần loại bỏ
  - `@SuppressWarnings` -- tạm tắt cảnh báo (dùng tiết kiệm)
- **Tự tạo Annotation khi:**
  - Xây framework hoặc thư viện
  - Cần config declarative (kiểu Spring)
  - Cần validate metadata
- **Best practice:**
  - Annotation chỉ là metadata -- logic phải nằm ở Processor/Reflection
  - Đặt tên rõ ràng (`@LogExecutionTime` hơn `@LET`)
  - Cẩn thận với `RUNTIME` -- ảnh hưởng hiệu năng nếu dùng Reflection nhiều

---

## Lỗi thường gặp

### Lỗi 1: Quên `@Retention(RUNTIME)`

```java
// SAI -- mac dinh la CLASS, Reflection khong doc duoc
@Target(ElementType.METHOD)
public @interface MyAnno { }

// DUNG
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnno { }
```

### Lỗi 2: Lạm dụng `@SuppressWarnings`

```java
// SAI -- bo qua het canh bao
@SuppressWarnings("all")
public void method() { ... }

// DUNG -- chi tat canh bao cu the
@SuppressWarnings("unchecked")
public void method() { ... }
```

### Lỗi 3: Quên `@Override`

```java
// SAI -- viet sai ten van compile, khong override
public void toString(int x) { ... }

// DUNG -- co @Override se bao loi compile
@Override
public String toString() { ... }
```

---

## Câu hỏi phỏng vấn

### Câu 1: Annotation là gì?

**Trả lời:** Annotation là metadata gắn vào code Java -- không thay đổi logic, nhưng cung cấp thông tin cho compiler, framework, hoặc runtime. Bắt đầu bằng `@`, có thể gắn lên class/method/field/parameter. Là nền tảng của Spring, Hibernate, JUnit, JPA.

### Câu 2: Phân biệt 3 mức Retention?

**Trả lời:**

- `SOURCE`: Annotation chỉ tồn tại trong source code, bị xóa sau compile (ví dụ `@Override`, `@SuppressWarnings`)
- `CLASS` (default): Có trong file `.class` nhưng JVM không tải vào memory
- `RUNTIME`: Có thể đọc bằng Reflection lúc chạy -- bắt buộc cho framework như Spring, JUnit

### Câu 3: Cách Spring dùng `@Autowired` thực hiện DI?

**Trả lời:** Spring scan tất cả class có `@Component`, `@Service`, `@Repository`... Khi tìm thấy field/constructor có `@Autowired` (Retention RUNTIME), Spring dùng Reflection để **inject** instance phù hợp từ ApplicationContext.

### Câu 4: Tự tạo annotation cần gì?

**Trả lời:**

1. Dùng từ khóa `@interface`
2. Khai báo `@Target` -- vị trí gắn
3. Khai báo `@Retention` -- vòng đời (thường `RUNTIME`)
4. Định nghĩa các thuộc tính (kiểu primitive, String, Class, enum, hoặc array)
5. Viết code đọc annotation (Reflection hoặc Annotation Processor)

### Câu 5: Annotation Processor khác Reflection thế nào?

**Trả lời:**

- **Annotation Processor**: Chạy **lúc compile**, có thể sinh code (như Lombok generate getter/setter). Không ảnh hưởng performance runtime.
- **Reflection**: Đọc annotation **lúc runtime**, linh hoạt hơn nhưng chậm và phá vỡ encapsulation. Spring chủ yếu dùng Reflection.
