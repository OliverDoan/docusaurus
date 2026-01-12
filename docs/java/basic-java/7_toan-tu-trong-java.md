---
sidebar_position: 7
---
# Toán tử trong Java

## Khái niệm
Toán tử (Operator) trong Java là các ký hiệu dùng để thực hiện phép toán trên một hoặc nhiều toán hạng (operand).

---

## Nội dung

1. [Toán tử số học](#1-toán-tử-số-học)  
2. [Toán tử gán](#2-toán-tử-gán)  
3. [Toán tử so sánh](#3-toán-tử-so-sánh)  
4. [Toán tử logic](#4-toán-tử-logic)  
5. [Toán tử tăng giảm](#5-toán-tử-tăng-giảm)  
6. [Toán tử điều kiện (ternary)](#6-toán-tử-điều-kiện-ternary)  
7. [Toán tử instanceof](#7-toán-tử-instanceof)  
8. [Độ ưu tiên toán tử](#8-độ-ưu-tiên-toán-tử)  

---

## 1. Toán tử số học
Dùng cho các phép toán cơ bản.



Ví dụ:
```java
int a = 10, b = 3;
System.out.println(a + b); // 13
System.out.println(a % b); // 1
```

---

## 2. Toán tử gán
Dùng để gán giá trị.



---

## 3. Toán tử so sánh
So sánh hai giá trị, trả về boolean.

---

## 4. Toán tử logic


Ví dụ:
```java
if (a > 5 && b < 10) {
    System.out.println("Đúng");
}
```

---

## 5. Toán tử tăng giảm

---

## 6. Toán tử điều kiện (ternary)

```java
int max = (a > b) ? a : b;
```

---

## 7. Toán tử instanceof
Kiểm tra object có thuộc kiểu dữ liệu nào không.

```java
if (obj instanceof String) {
    System.out.println("Là String");
}
```

---

## 8. Độ ưu tiên toán tử
Một số toán tử có độ ưu tiên cao hơn. Có thể dùng dấu ngoặc () để rõ ràng hơn.

---

## Kết luận
Nắm vững toán tử giúp bạn viết điều kiện, biểu thức và thuật toán Java chính xác hơn.

