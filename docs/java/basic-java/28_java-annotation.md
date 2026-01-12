# Java Annotation

## Giới thiệu
**Annotation** trong Java cung cấp **metadata (siêu dữ liệu)** cho code.  
Chúng **không trực tiếp thay đổi logic chương trình**, nhưng được dùng rộng rãi để:
- Cung cấp thông tin cho compiler
- Phân tích code ở runtime
- Hỗ trợ framework (Spring, Hibernate, JUnit…)

---

## Nội dung

1. [Các annotation được sử dụng để làm gì?](#1-các-annotation-được-sử-dụng-để-làm-gì)  
2. [Cơ bản về Annotations](#2-cơ-bản-về-annotations)  
3. [Các Annotation sẵn có của Java](#3-các-annotation-sẵn-có-của-java)  
4. [Cách tạo Custom Annotations](#4-cách-tạo-custom-annotations)  
5. [Sử dụng Annotation lồng nhau](#5-sử-dụng-annotation-lồng-nhau)  

---

## 1. Các annotation được sử dụng để làm gì?

Annotation được dùng để:
- Kiểm tra lỗi ở compile-time
- Sinh code tự động
- Cấu hình framework
- Giảm code cấu hình thủ công (XML)

Ví dụ:

```java
@Override
public String toString() {
    return "Hello";
}
```

---

## 2. Cơ bản về Annotations

### 2.1 Cú pháp

```java
@AnnotationName
```

### 2.2 Vị trí sử dụng

Annotation có thể áp dụng cho:
- Class
- Method
- Field
- Constructor
- Parameter

---

## 3. Các Annotation sẵn có của Java

### 3.1 @Override

```java
@Override
public String toString() {
    return "Demo";
}
```

### 3.2 @Deprecated

```java
@Deprecated
public void oldMethod() { }
```

### 3.3 @SuppressWarnings

```java
@SuppressWarnings("unchecked")
List list = new ArrayList();
```

---

## 4. Cách tạo Custom Annotations

### 4.1 Khai báo Annotation

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotation {
    String value();
}
```

### 4.2 Sử dụng Annotation

```java
@MyAnnotation("test")
public void demo() { }
```

---

## 5. Sử dụng Annotation lồng nhau

```java
@Author(
    name = "GP Coder",
    date = "2024"
)
public class Demo { }
```

👉 Annotation có thể chứa:
- Primitive
- String
- Enum
- Annotation khác

---

## Tổng kết

- Annotation là **metadata**, không phải logic
- Rất quan trọng trong Java hiện đại
- Hiểu Annotation là nền tảng để học framework
