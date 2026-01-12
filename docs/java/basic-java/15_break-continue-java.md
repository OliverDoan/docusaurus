# Break & continue

## 1. Giới thiệu
Trong Java, **`break`** và **`continue`** là hai câu lệnh dùng để **điều khiển luồng thực thi của vòng lặp**.

- `break`: thoát **hoàn toàn** khỏi vòng lặp
- `continue`: bỏ qua **lần lặp hiện tại**, chuyển sang lần lặp tiếp theo

👉 Có thể ví:
- `break` như **dừng hẳn cuộc họp**
- `continue` như **bỏ qua một câu hỏi và chuyển sang câu tiếp theo**

---

## Nội dung

1. [Giới thiệu](#1-giới-thiệu)  
2. [Câu lệnh break](#2-câu-lệnh-break)  
3. [break có nhãn (Labeled break)](#3-break-có-nhãn-labeled-break)  
4. [Câu lệnh continue](#4-câu-lệnh-continue)  
5. [continue có nhãn (Labeled continue)](#5-continue-có-nhãn-labeled-continue)  
6. [So sánh break và continue](#6-so-sánh-break-và-continue)  
7. [Lỗi thường gặp](#7-lỗi-thường-gặp)  
8. [Khi nào nên dùng break & continue?](#8-khi-nào-nên-dùng-break--continue)  
9. [Tổng kết](#9-tổng-kết)  

---

## 2. Câu lệnh break

### 2.1 break trong vòng lặp

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
```

👉 Kết quả:
```
1
2
3
4
```

Khi `i == 5`, vòng lặp **kết thúc ngay lập tức**.

---

### 2.2 break trong vòng lặp lồng nhau

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (j == 2) {
            break;
        }
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

👉 `break` **chỉ thoát vòng lặp gần nhất**.

---

## 3. break có nhãn (Labeled break)

```java
outer:
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (i == 2 && j == 2) {
            break outer;
        }
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

✔ Thoát khỏi **vòng lặp được gắn nhãn**  
⚠️ Ít dùng, dễ làm code khó đọc

---

## 4. Câu lệnh continue

### 4.1 continue trong vòng lặp

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;
    }
    System.out.println(i);
}
```

👉 Kết quả:
```
1
2
4
5
```

Khi `i == 3`, vòng lặp **bỏ qua lần đó**.

---

### 4.2 continue trong while

```java
int i = 0;

while (i < 5) {
    i++;
    if (i == 2) {
        continue;
    }
    System.out.println(i);
}
```

⚠️ Với `while`, cần cẩn thận cập nhật biến đếm để tránh **vòng lặp vô hạn**.

---

## 5. continue có nhãn (Labeled continue)

```java
outer:
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (j == 2) {
            continue outer;
        }
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

👉 Bỏ qua toàn bộ vòng lặp bên trong và chuyển sang lần lặp tiếp theo của vòng ngoài.

---

## 6. So sánh break và continue

| Tiêu chí | break | continue |
|-------|------|----------|
| Tác dụng | Thoát vòng lặp | Bỏ qua 1 lần lặp |
| Phạm vi | Vòng lặp hiện tại | Vòng lặp hiện tại |
| Có nhãn | Có | Có |

---

## 7. Lỗi thường gặp

### ❌ Vòng lặp vô hạn với continue
```java
while (true) {
    continue;
}
```

### ❌ Lạm dụng break
- Làm luồng chương trình khó theo dõi

### ❌ Dùng nhãn không cần thiết
- Giảm tính dễ đọc của code

---

## 8. Khi nào nên dùng break & continue?

- `break`: tìm thấy kết quả, không cần lặp tiếp
- `continue`: bỏ qua dữ liệu không hợp lệ
- Tránh dùng khi có thể **viết lại logic rõ ràng hơn**

---

## 9. Tổng kết

- `break` và `continue` giúp kiểm soát vòng lặp linh hoạt
- Hiểu rõ phạm vi tác động là rất quan trọng
- Không nên lạm dụng nhãn

