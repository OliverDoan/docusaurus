# Clone Array

## Giới thiệu
Trong Java, có **nhiều cách để sao chép các phần tử của một mảng sang mảng khác**.  
Tùy vào mục đích sử dụng (hiệu năng, độ linh hoạt, dễ đọc), chúng ta có thể lựa chọn phương pháp phù hợp.

Tài liệu này tổng hợp **4 cách phổ biến nhất**, đúng theo nội dung bài GP Coder.

---

## Nội dung

1. [Sao chép mảng sử dụng vòng lặp for](#1-sao-chép-mảng-sử-dụng-vòng-lặp-for)  
2. [Sao chép mảng sử dụng phương thức copyOf() của lớp java.util.Arrays](#2-sao-chép-mảng-sử-dụng-phương-thức-copyof-của-lớp-javautilarrays)  
3. [Sao chép mảng sử dụng phương thức clone() của lớp java.lang.Object](#3-sao-chép-mảng-sử-dụng-phương-thức-clone-của-lớp-javalangobject)  
4. [Sử dụng phương thức arraycopy() của lớp System](#4-sử-dụng-phương-thức-arraycopy-của-lớp-system)  

---

## 1. Sao chép mảng sử dụng vòng lặp for

```java
int[] source = {1, 2, 3, 4};
int[] target = new int[source.length];

for (int i = 0; i < source.length; i++) {
    target[i] = source[i];
}
```

👉 Đây là cách **đơn giản và dễ hiểu nhất**.

---

## 2. Sao chép mảng sử dụng phương thức copyOf() của lớp java.util.Arrays

```java
int[] source = {1, 2, 3, 4};
int[] target = Arrays.copyOf(source, source.length);
```

✔ Gọn gàng  
✔ Dễ đọc  
✔ Thường dùng trong thực tế

---

## 3. Sao chép mảng sử dụng phương thức clone() của lớp java.lang.Object

```java
int[] source = {1, 2, 3, 4};
int[] target = source.clone();
```

👉 `clone()` tạo ra **một mảng mới** với nội dung giống mảng cũ.

⚠️ Với mảng object → chỉ là **shallow copy**.

---

## 4. Sử dụng phương thức arraycopy() của lớp System

```java
int[] source = {1, 2, 3, 4};
int[] target = new int[source.length];

System.arraycopy(source, 0, target, 0, source.length);
```

✔ Hiệu năng cao  
✔ Dùng nhiều trong thư viện Java

---

## Tổng kết

- Có nhiều cách sao chép mảng trong Java
- `for` → dễ hiểu  
- `Arrays.copyOf()` → gọn gàng  
- `clone()` → nhanh, tiện  
- `System.arraycopy()` → hiệu năng cao  

👉 Tùy tình huống để chọn cách phù hợp.
