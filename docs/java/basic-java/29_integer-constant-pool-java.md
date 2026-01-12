# Integer Constant Pool trong Java

## Giới thiệu
**Integer Constant Pool** là một cơ chế tối ưu bộ nhớ trong Java, liên quan trực tiếp đến:
- Wrapper class `Integer`
- Autoboxing / Unboxing
- So sánh object bằng `==` và `equals()`

Đây là chủ đề **rất hay xuất hiện trong phỏng vấn Java** và dễ gây nhầm lẫn nếu không hiểu rõ.

---

## Nội dung

1. [Integer Constant Pool là gì?](#1-integer-constant-pool-là-gì)  
2. [Cách Integer Constant Pool hoạt động](#2-cách-integer-constant-pool-hoạt-động)  
3. [So sánh Integer bằng == và equals()](#3-so-sánh-integer-bằng--và-equals)  
4. [Autoboxing và Integer Constant Pool](#4-autoboxing-và-integer-constant-pool)  
5. [Vì sao chỉ từ -128 đến 127?](#5-vì-sao-chỉ-từ--128-đến-127)  
6. [Lỗi thường gặp](#6-lỗi-thường-gặp)  
7. [Tổng kết](#7-tổng-kết)  

---

## 1. Integer Constant Pool là gì?

**Integer Constant Pool** là vùng bộ nhớ trong JVM dùng để **lưu trữ sẵn các object Integer** trong một khoảng giá trị nhất định.

👉 Mặc định: **-128 đến 127**

---

## 2. Cách Integer Constant Pool hoạt động

```java
Integer a = 100;
Integer b = 100;

System.out.println(a == b); // true
```

👉 Vì:
- `100` nằm trong range pool
- `a` và `b` trỏ cùng object trong pool

Ngược lại:

```java
Integer x = 200;
Integer y = 200;

System.out.println(x == y); // false
```

👉 `200` **không nằm trong pool**, JVM tạo 2 object khác nhau.

---

## 3. So sánh Integer bằng == và equals()

```java
Integer a = 100;
Integer b = 100;

Integer x = 200;
Integer y = 200;

System.out.println(a == b);      // true
System.out.println(x == y);      // false
System.out.println(x.equals(y)); // true
```

📌 Quy tắc:
- `==` → so sánh **tham chiếu**
- `equals()` → so sánh **giá trị**

---

## 4. Autoboxing và Integer Constant Pool

```java
Integer a = 10;   // autoboxing
Integer b = 10;

Integer c = new Integer(10);
```

👉
- `a` và `b` dùng pool
- `c` luôn tạo object mới

```java
a == b; // true
a == c; // false
```

---

## 5. Vì sao chỉ từ -128 đến 127?

- Đây là range được **Java specification quy định**
- Phù hợp với kiểu `byte`
- Các giá trị này được dùng rất thường xuyên

⚠️ Có thể mở rộng range bằng JVM option:
```
-XX:AutoBoxCacheMax=...
```

---

## 6. Lỗi thường gặp

### ❌ So sánh Integer bằng ==

```java
Integer a = 1000;
Integer b = 1000;

if (a == b) { } // sai logic
```

### ❌ Không hiểu autoboxing

```java
Integer a = 128;
int b = 128;

a == b; // true (unboxing)
```

---

## 7. Tổng kết

- Integer Constant Pool giúp **tiết kiệm bộ nhớ**
- Áp dụng cho Integer từ **-128 đến 127**
- Luôn dùng `equals()` khi so sánh giá trị
- Hiểu rõ pool giúp tránh bug khó chịu
