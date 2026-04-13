---
sidebar_position: 23
title: "23. Regular Expression trong Java"
---

# Regular Expression trong Java

## Giới thiệu
**Biểu thức chính quy (Regular Expression – Regex)** là một công cụ mạnh dùng để:
- Kiểm tra chuỗi có đúng định dạng hay không
- Tìm kiếm, trích xuất dữ liệu từ chuỗi
- Thay thế nội dung trong chuỗi

Trong Java, Regex được hỗ trợ trực tiếp thông qua package **`java.util.regex`**.

---

## Nội dung

1. [Biểu thức chính quy là gì?](#1-biểu-thức-chính-quy-là-gì)  
2. [Các lớp Regex trong Java](#2-các-lớp-regex-trong-java)  
3. [Các ký tự Regex thường dùng](#3-các-ký-tự-regex-thường-dùng)  
4. [Ví dụ kiểm tra chuỗi với Regex](#4-ví-dụ-kiểm-tra-chuỗi-với-regex)  
5. [Tìm kiếm chuỗi với Regex](#5-tìm-kiếm-chuỗi-với-regex)  
6. [Thay thế chuỗi với Regex](#6-thay-thế-chuỗi-với-regex)  
7. [Lỗi thường gặp khi dùng Regex](#7-lỗi-thường-gặp-khi-dùng-regex)  
8. [Lời kết](#8-lời-kết)  

---

## 1. Biểu thức chính quy là gì?

Regex là một **chuỗi ký tự đặc biệt** dùng để mô tả **mẫu (pattern)** của chuỗi.

Ví dụ:
- Email
- Số điện thoại
- Mật khẩu
- URL

```text
\d{10}      // số điện thoại 10 chữ số
[a-zA-Z]+   // chuỗi chữ cái
```

---

## 2. Các lớp Regex trong Java

Java cung cấp 2 lớp chính:

- `Pattern`: biểu diễn mẫu Regex
- `Matcher`: dùng để so khớp mẫu với chuỗi

```java
Pattern pattern = Pattern.compile("\d+");
Matcher matcher = pattern.matcher("abc123");
```

---

## 3. Các ký tự Regex thường dùng

| Ký tự | Ý nghĩa |
|-----|--------|
| . | Bất kỳ ký tự nào |
| \d | Chữ số |
| \w | Chữ cái, số, _ |
| \s | Khoảng trắng |
| * | 0 hoặc nhiều |
| + | 1 hoặc nhiều |
| ? | 0 hoặc 1 |
<!-- | {n} | Đúng n lần | -->
<!-- | {n,m} | Từ n đến m lần | -->

---

## 4. Ví dụ kiểm tra chuỗi với Regex

### Kiểm tra số điện thoại

```java
String phone = "0912345678";
boolean valid = phone.matches("\\d{10}");
System.out.println(valid);
```

### Kiểm tra email

```java
String email = "test@gmail.com";
boolean valid =
    email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
```

---

## 5. Tìm kiếm chuỗi với Regex

```java
String text = "Java 8, Java 11, Java 17";
Pattern p = Pattern.compile("\\d+");
Matcher m = p.matcher(text);

while (m.find()) {
    System.out.println(m.group());
}
```

👉 Kết quả:
```
8
11
17
```

---

## 6. Thay thế chuỗi với Regex

```java
String text = "abc123xyz";
String result = text.replaceAll("\\d", "*");
System.out.println(result);
```

👉 Kết quả:
```
abc***xyz
```

---

## 7. Lỗi thường gặp khi dùng Regex

### ❌ Quên escape ký tự

```java
"\d+"  // đúng
"\d+"   // sai
```

### ❌ Regex quá phức tạp
- Khó đọc
- Khó bảo trì

### ❌ Nhầm matches() và find()
- `matches()` → khớp toàn bộ chuỗi
- `find()` → tìm một phần

---

## 8. Lời kết

- Regex rất mạnh nhưng cần dùng đúng cách
- Nên viết Regex **đơn giản – dễ hiểu**
- Thực hành nhiều là cách tốt nhất để thành thạo Regex
