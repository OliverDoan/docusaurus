# Chuyển đổi giữa các kiểu dữ liệu

## Giới thiệu
Trong quá trình thực thi chương trình, rất часто chúng ta cần **chuyển đổi qua lại giữa các kiểu dữ liệu** với nhau, ví dụ:
- Từ chuỗi sang số
- Từ số sang chuỗi
- Từ chuỗi sang mảng byte và ngược lại

Tài liệu này tổng hợp các **cách chuyển đổi dữ liệu thông dụng nhất trong Java**, kèm ví dụ minh họa rõ ràng.

---

## Nội dung

1. [Đổi chuỗi thành số](#1-đổi-chuỗi-thành-số)  
2. [Đổi số thành chuỗi](#2-đổi-số-thành-chuỗi)  
3. [Đổi chuỗi thành mảng các byte](#3-đổi-chuỗi-thành-mảng-các-byte)  
4. [Đổi mảng các byte thành chuỗi](#4-đổi-mảng-các-byte-thành-chuỗi)  
5. [Lời kết](#5-lời-kết)  

---

## 1. Đổi chuỗi thành số

### 1.1 Sử dụng wrapper class

```java
int a = Integer.parseInt("10");
double b = Double.parseDouble("3.14");
long c = Long.parseLong("1000");
```

⚠️ Nếu chuỗi không hợp lệ sẽ gây `NumberFormatException`.

---

### 1.2 Sử dụng valueOf()

```java
Integer x = Integer.valueOf("20");
Double y = Double.valueOf("5.6");
```

---

## 2. Đổi số thành chuỗi

### 2.1 Dùng String.valueOf()

```java
int a = 10;
String s = String.valueOf(a);
```

### 2.2 Dùng toán tử +

```java
String s = a + "";
```

---

## 3. Đổi chuỗi thành mảng các byte

```java
String text = "Hello Java";
byte[] bytes = text.getBytes();
```

Hoặc chỉ định charset:

```java
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
```

---

## 4. Đổi mảng các byte thành chuỗi

```java
byte[] bytes = {72, 101, 108, 108, 111};
String text = new String(bytes);
```

Hoặc:

```java
String text = new String(bytes, StandardCharsets.UTF_8);
```

---

## 5. Lời kết

- Chuyển đổi kiểu dữ liệu là thao tác **rất phổ biến**
- Luôn chú ý **exception** khi parse chuỗi
- Quan tâm đến **charset** khi xử lý byte
- Hiểu rõ chuyển đổi giúp code **an toàn và hiệu quả hơn**
