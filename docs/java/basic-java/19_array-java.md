# Mảng (Array) trong Java

## 1. Giới thiệu
**Mảng (Array)** trong Java là một cấu trúc dữ liệu dùng để **lưu trữ nhiều giá trị cùng kiểu dữ liệu** trong **một biến duy nhất**.

👉 Có thể hình dung mảng giống như:
- Một **dãy ngăn tủ** liên tiếp
- Mỗi ngăn chứa một giá trị
- Mỗi ngăn có **chỉ số (index)** để truy cập

---

## 2. Đặc điểm của mảng trong Java

- Kích thước **cố định** (không thay đổi sau khi khởi tạo)
- Các phần tử **cùng kiểu dữ liệu**
- Truy cập phần tử qua **index**
- Index bắt đầu từ **0**

---

## 3. Khai báo mảng

### 3.1 Cách 1: Khai báo trước, cấp phát sau

```java
int[] arr;
arr = new int[5];
```

### 3.2 Cách 2: Khai báo và cấp phát cùng lúc

```java
int[] arr = new int[5];
```

---

## 4. Khởi tạo mảng

```java
int[] numbers = {1, 2, 3, 4, 5};
```

Hoặc:

```java
int[] numbers = new int[]{1, 2, 3, 4, 5};
```

---

## 5. Truy cập và gán giá trị

```java
int[] arr = new int[3];

arr[0] = 10;
arr[1] = 20;
arr[2] = 30;

System.out.println(arr[1]); // 20
```

❌ Truy cập ngoài phạm vi:

```java
arr[3]; // ArrayIndexOutOfBoundsException
```

---

## 6. Duyệt mảng

### 6.1 Dùng vòng lặp for

```java
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}
```

### 6.2 Dùng vòng lặp for-each

```java
for (int x : arr) {
    System.out.println(x);
}
```

✔ Gọn gàng  
❌ Không truy cập được index

---

## 7. Thuộc tính length

```java
int[] arr = {1, 2, 3};
System.out.println(arr.length); // 3
```

👉 `length` là **thuộc tính**, không phải method.

---

## 8. Mảng một chiều và hai chiều

### 8.1 Mảng một chiều

```java
int[] a = {1, 2, 3};
```

### 8.2 Mảng hai chiều

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};
```

Duyệt mảng 2 chiều:

```java
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

---

## 9. Mảng và bộ nhớ

```java
int[] a = {1, 2, 3};
int[] b = a;

b[0] = 100;
```

👉 `a` và `b` **trỏ cùng vùng nhớ trên Heap**.

---

## 10. So sánh mảng

```java
int[] a = {1, 2};
int[] b = {1, 2};

a == b; // false
```

So sánh nội dung:

```java
Arrays.equals(a, b); // true
```

---

## 11. Một số lớp hỗ trợ mảng

```java
Arrays.sort(arr);
Arrays.toString(arr);
Arrays.copyOf(arr, newSize);
```

---

## 12. Lỗi thường gặp

### ❌ Quên khởi tạo mảng
```java
int[] arr;
arr[0] = 1; // NullPointerException
```

### ❌ Nhầm length với length()
```java
arr.length(); // lỗi
```

---

## 13. Khi nào nên dùng mảng?

- Dữ liệu có kích thước cố định
- Hiệu năng cao
- Cấu trúc dữ liệu đơn giản

Nếu cần linh hoạt kích thước → dùng **ArrayList**.

---

## 14. Tổng kết

- Mảng là cấu trúc dữ liệu nền tảng trong Java
- Kích thước cố định, truy cập nhanh
- Hiểu mảng là bước quan trọng trước khi học Collection
