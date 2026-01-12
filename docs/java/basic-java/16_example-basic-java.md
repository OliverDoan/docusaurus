# Bài tập cơ bản trong Java

## 1. Giới thiệu
Sau khi đã học:
- `if – else`
- `switch – case`
- Vòng lặp `for`, `while`, `do – while`
- `break` và `continue`

👉 Việc **thực hành bằng chương trình cụ thể** là bước quan trọng nhất để hiểu sâu cấu trúc điều khiển trong Java.

Tài liệu này tổng hợp **các chương trình minh họa tiêu biểu**, thường gặp trong học tập và phỏng vấn.

---

## 2. Kiểm tra số chẵn – lẻ

```java
int n = 7;

if (n % 2 == 0) {
    System.out.println("Số chẵn");
} else {
    System.out.println("Số lẻ");
}
```

📌 Áp dụng:
- Toán tử điều kiện
- if – else cơ bản

---

## 3. Kiểm tra số dương, âm hay bằng 0

```java
int x = -5;

if (x > 0) {
    System.out.println("Số dương");
} else if (x < 0) {
    System.out.println("Số âm");
} else {
    System.out.println("Bằng 0");
}
```

📌 Áp dụng:
- Chuỗi `if – else if – else`

---

## 4. Tìm số lớn nhất trong 3 số

```java
int a = 10, b = 25, c = 15;
int max;

if (a >= b && a >= c) {
    max = a;
} else if (b >= a && b >= c) {
    max = b;
} else {
    max = c;
}

System.out.println("Max = " + max);
```

📌 Áp dụng:
- Toán tử logic
- Điều kiện kết hợp

---

## 5. Giải phương trình bậc nhất

Phương trình:  
**ax + b = 0**

```java
double a = 2;
double b = -4;

if (a == 0) {
    if (b == 0) {
        System.out.println("Vô số nghiệm");
    } else {
        System.out.println("Vô nghiệm");
    }
} else {
    double x = -b / a;
    System.out.println("x = " + x);
}
```

📌 Áp dụng:
- if lồng nhau
- Xử lý trường hợp đặc biệt

---

## 6. In bảng cửu chương

```java
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= 10; j++) {
        System.out.println(i + " x " + j + " = " + (i * j));
    }
    System.out.println();
}
```

📌 Áp dụng:
- Vòng lặp lồng nhau

---

## 7. Tính tổng các số từ 1 đến n

```java
int n = 100;
int sum = 0;

for (int i = 1; i <= n; i++) {
    sum += i;
}

System.out.println("Tổng = " + sum);
```

📌 Áp dụng:
- Vòng lặp for
- Biến tích lũy

---

## 8. Kiểm tra số nguyên tố

```java
int n = 29;
boolean isPrime = true;

if (n < 2) {
    isPrime = false;
} else {
    for (int i = 2; i <= Math.sqrt(n); i++) {
        if (n % i == 0) {
            isPrime = false;
            break;
        }
    }
}

if (isPrime) {
    System.out.println("Là số nguyên tố");
} else {
    System.out.println("Không phải số nguyên tố");
}
```

📌 Áp dụng:
- for
- break
- Tối ưu vòng lặp

---

## 9. Menu lựa chọn với switch – case

```java
int choice = 2;

switch (choice) {
    case 1:
        System.out.println("Thêm");
        break;
    case 2:
        System.out.println("Sửa");
        break;
    case 3:
        System.out.println("Xóa");
        break;
    default:
        System.out.println("Không hợp lệ");
}
```

📌 Áp dụng:
- switch – case
- break

---

## 10. Nhập dữ liệu đến khi hợp lệ (while)

```java
int password = 1234;
int input;

do {
    input = 1234; // giả lập nhập
} while (input != password);

System.out.println("Đăng nhập thành công");
```

📌 Áp dụng:
- do – while
- Kiểm tra điều kiện sau

---

## 11. Duyệt mảng và bỏ qua giá trị không hợp lệ

```java
int[] arr = {1, -2, 3, -4, 5};

for (int x : arr) {
    if (x < 0) {
        continue;
    }
    System.out.println(x);
}
```

📌 Áp dụng:
- for-each
- continue

---

## 12. Tổng kết

Qua các ví dụ trên, ta thấy:
- Cấu trúc điều khiển xuất hiện **ở hầu hết chương trình Java**
- Các câu lệnh có thể **kết hợp linh hoạt**
- Thực hành nhiều giúp tránh lỗi logic

