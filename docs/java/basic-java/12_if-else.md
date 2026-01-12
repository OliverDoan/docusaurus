---
sidebar_position: 12
---
# Mệnh đề if – else

## 1. Giới thiệu
Trong Java, **mệnh đề if – else** được dùng để điều khiển luồng chương trình dựa trên **điều kiện logic**.  
Nó cho phép chương trình **ra quyết định**: nếu điều kiện đúng thì làm việc này, ngược lại thì làm việc khác.

Có thể hình dung `if – else` giống như một **ngã rẽ giao thông**:
- Nếu đèn xanh → đi tiếp
- Nếu đèn đỏ → dừng lại

---

## Nội dung

1. [Giới thiệu](#1-giới-thiệu)  
2. [Cú pháp cơ bản](#2-cú-pháp-cơ-bản)  
3. [Cú pháp if – else](#3-cú-pháp-if--else)  
4. [Chuỗi if – else if – else](#4-chuỗi-if--else-if--else)  
5. [if lồng nhau (Nested if)](#5-if-lồng-nhau-nested-if)  
6. [Biểu thức điều kiện](#6-biểu-thức-điều-kiện)  
7. [Toán tử 3 ngôi (?:)](#7-toán-tử-3-ngôi-)  
8. [Lỗi thường gặp](#8-lỗi-thường-gặp)  
9. [Khi nào nên dùng if – else?](#9-khi-nào-nên-dùng-if--else)  
10. [Tổng kết](#10-tổng-kết)  

---

## 2. Cú pháp cơ bản

```java
if (condition) {
    // code khi condition == true
}
```

Ví dụ:

```java
int age = 20;

if (age >= 18) {
    System.out.println("Bạn đã đủ 18 tuổi");
}
```

---

## 3. Cú pháp if – else

```java
if (condition) {
    // code khi condition == true
} else {
    // code khi condition == false
}
```

Ví dụ:

```java
int number = 5;

if (number % 2 == 0) {
    System.out.println("Số chẵn");
} else {
    System.out.println("Số lẻ");
}
```

---

## 4. Chuỗi if – else if – else

Khi có **nhiều điều kiện**, ta sử dụng `else if`:

```java
if (condition1) {
    // code 1
} else if (condition2) {
    // code 2
} else if (condition3) {
    // code 3
} else {
    // code mặc định
}
```

Ví dụ:

```java
int score = 85;

if (score >= 90) {
    System.out.println("Xuất sắc");
} else if (score >= 80) {
    System.out.println("Giỏi");
} else if (score >= 65) {
    System.out.println("Khá");
} else {
    System.out.println("Trung bình");
}
```

👉 Java sẽ **kiểm tra từ trên xuống dưới**, gặp điều kiện đúng đầu tiên thì **dừng lại**.

---

## 5. if lồng nhau (Nested if)

```java
int a = 10;
int b = 20;

if (a > 0) {
    if (b > 0) {
        System.out.println("Cả a và b đều dương");
    }
}
```

⚠️ Không nên lạm dụng `if` lồng nhau vì code sẽ **khó đọc và khó bảo trì**.

---

## 6. Biểu thức điều kiện

Điều kiện trong `if` **bắt buộc** phải là kiểu `boolean`:

```java
if (x > 0 && x < 10) { }
if (isValid || isAdmin) { }
```

❌ Sai:

```java
if (x) { } // x không phải boolean
```

---

## 7. Toán tử 3 ngôi (?:)

Trong một số trường hợp đơn giản, có thể thay `if – else` bằng toán tử 3 ngôi:

```java
int a = 10;
int b = 20;

int max = (a > b) ? a : b;
```

Tương đương:

```java
int max;
if (a > b) {
    max = a;
} else {
    max = b;
}
```

---

## 8. Lỗi thường gặp

### ❌ Quên dấu ngoặc nhọn
```java
if (x > 0)
    System.out.println("Positive");
    System.out.println("Done"); // luôn chạy
```

### ❌ Nhầm `=` với `==`
```java
if (x = 5) { } // lỗi biên dịch
```

### ❌ Điều kiện chồng chéo
```java
if (score >= 80) { }
else if (score >= 90) { } // không bao giờ chạy
```

---

## 9. Khi nào nên dùng if – else?

- Số lượng điều kiện **ít**
- Điều kiện **phức tạp**
- Không phù hợp với `switch-case`

---

## 10. Tổng kết

- `if – else` giúp chương trình **ra quyết định**
- Điều kiện phải trả về `boolean`
- Tránh lạm dụng `if` lồng nhau
- Có thể thay bằng toán tử 3 ngôi trong trường hợp đơn giản

