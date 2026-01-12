# Vòng lặp trong Java

## 1. Giới thiệu
**Vòng lặp (Loop)** trong Java cho phép chương trình **lặp lại một khối lệnh nhiều lần** cho đến khi điều kiện không còn đúng.

Hãy tưởng tượng bạn đang:
- Đếm từ 1 đến 100
- Duyệt từng phần tử trong một danh sách
- Chờ người dùng nhập đúng mật khẩu

👉 Nếu không có vòng lặp, bạn sẽ phải **viết code lặp đi lặp lại**, rất tốn công và khó bảo trì.

---

## Nội dung

1. [Giới thiệu](#1-giới-thiệu)  
2. [Các loại vòng lặp trong Java](#2-các-loại-vòng-lặp-trong-java)  
3. [Vòng lặp for](#3-vòng-lặp-for)  
4. [Vòng lặp while](#4-vòng-lặp-while)  
5. [Vòng lặp do – while](#5-vòng-lặp-do--while)  
6. [Vòng lặp for-each](#6-vòng-lặp-for-each)  
7. [break và continue trong vòng lặp](#7-break-và-continue-trong-vòng-lặp)  
8. [Vòng lặp lồng nhau](#8-vòng-lặp-lồng-nhau)  
9. [Lỗi thường gặp](#9-lỗi-thường-gặp)  
10. [So sánh các vòng lặp](#10-so-sánh-các-vòng-lặp)  
11. [Tổng kết](#11-tổng-kết)  

---

## 2. Các loại vòng lặp trong Java

Java hỗ trợ 4 loại vòng lặp chính:

1. `for`
2. `while`
3. `do – while`
4. `for-each`

---

## 3. Vòng lặp for

### 3.1 Cú pháp

```java
for (initialization; condition; update) {
    // code
}
```

Trong đó:
- `initialization`: khởi tạo biến đếm
- `condition`: điều kiện lặp
- `update`: cập nhật biến đếm sau mỗi vòng

### 3.2 Ví dụ

```java
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
```

👉 Kết quả:
```
1
2
3
4
5
```

---

## 4. Vòng lặp while

### 4.1 Cú pháp

```java
while (condition) {
    // code
}
```

### 4.2 Ví dụ

```java
int i = 1;

while (i <= 5) {
    System.out.println(i);
    i++;
}
```

👉 `while` phù hợp khi **chưa biết trước số lần lặp**.

---

## 5. Vòng lặp do – while

### 5.1 Cú pháp

```java
do {
    // code
} while (condition);
```

### 5.2 Ví dụ

```java
int i = 10;

do {
    System.out.println(i);
    i++;
} while (i < 5);
```

👉 Dù điều kiện sai ngay từ đầu, code vẫn chạy **ít nhất 1 lần**.

---

## 6. Vòng lặp for-each

Dùng để duyệt:
- Mảng
- Collection (ArrayList, Set...)

### 6.1 Cú pháp

```java
for (dataType element : collection) {
    // code
}
```

### 6.2 Ví dụ

```java
int[] numbers = {1, 2, 3, 4};

for (int n : numbers) {
    System.out.println(n);
}
```

✔ Gọn gàng  
✔ Ít lỗi  
❌ Không truy cập được index

---

## 7. break và continue trong vòng lặp

### break
Dùng để **thoát khỏi vòng lặp** ngay lập tức:

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
```

### continue
Bỏ qua vòng lặp hiện tại, **chuyển sang vòng tiếp theo**:

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;
    }
    System.out.println(i);
}
```

---

## 8. Vòng lặp lồng nhau

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 2; j++) {
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

👉 Thường dùng trong:
- Bảng cửu chương
- Ma trận
- Thuật toán

⚠️ Lạm dụng có thể gây **giảm hiệu năng**.

---

## 9. Lỗi thường gặp

### ❌ Vòng lặp vô hạn
```java
while (true) { }
```

### ❌ Quên cập nhật biến đếm
```java
int i = 0;
while (i < 5) {
    System.out.println(i);
}
```

### ❌ Điều kiện sai
```java
for (int i = 5; i > 0; i++) {
    // không bao giờ chạy
}
```

---

## 10. So sánh các vòng lặp

| Vòng lặp | Khi nên dùng |
|--------|-------------|
| for | Biết trước số lần lặp |
| while | Chưa biết trước |
| do-while | Cần chạy ít nhất 1 lần |
| for-each | Duyệt collection |

---

## 11. Tổng kết

- Vòng lặp giúp **tự động hoá thao tác lặp**
- Mỗi loại loop phù hợp với từng tình huống
- Cẩn thận vòng lặp vô hạn
- Kết hợp tốt với `break` và `continue`

