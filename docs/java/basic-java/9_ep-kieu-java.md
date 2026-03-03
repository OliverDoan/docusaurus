---
sidebar_position: 9
---
# Ép kiểu trong Java 

Ép kiểu (type casting) là việc **chuyển đổi giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác**.  
Java hỗ trợ 2 loại ép kiểu:

- **Ép kiểu nới rộng (Widening)** → tự động, không mất dữ liệu  
- **Ép kiểu thu hẹp (Narrowing)** → phải ép kiểu tường minh, có thể mất dữ liệu  

---

## Nội dung

1. [Ép kiểu là gì?](#1--ép-kiểu-là-gì)  
2. [Ép kiểu nới rộng (Widening)](#2--ép-kiểu-nới-rộng-widening)  
3. [Ép kiểu thu hẹp (Narrowing)](#3--ép-kiểu-thu-hẹp-narrowing)  
4. [Bảng mô tả ép kiểu trong Java](#4--bảng-mô-tả-ép-kiểu-trong-java)  
5. [Tổng kết](#5--tổng-kết)  

---

## 1. 📘 Ép kiểu là gì?

Ví dụ:

```java
float soLe = 19.7f;
int soNguyen = (int) soLe + 1;
```

- `soLe` (19.7) được ép về `int` thành **19**  
- Sau đó cộng thêm 1 → **20**  

---

## 2. ⬆️ Ép kiểu nới rộng (Widening)

Đây là quá trình **chuyển kiểu nhỏ → kiểu lớn**.  
Không mất dữ liệu, Java thực hiện **tự động**.

Chuỗi nâng kiểu:

```
byte → short → int → long → float → double
```

Ví dụ:

```java
public class TestWidening {
    public static void main(String[] args) {
        int i = 100;
        long l = i;   // tự động
        float f = l;  // tự động

        System.out.println("Int: " + i);
        System.out.println("Long: " + l);
        System.out.println("Float: " + f);
    }
}
```

Kết quả:

```
Int: 100
Long: 100
Float: 100.0
```

---

## 3. ⬇️ Ép kiểu thu hẹp (Narrowing)

Chuyển kiểu **lớn → nhỏ**.  
**Có nguy cơ mất dữ liệu**, Java yêu cầu **ép kiểu tường minh**.

Chuỗi thu hẹp:

```
double → float → long → int → short → byte
```

Ví dụ:

```java
public class TestNarrowwing {
    public static void main(String[] args) {
        double d = 100.04;
        long l = (long) d; // ép kiểu
        int i = (int) l;   // ép kiểu

        System.out.println("Double: " + d);
        System.out.println("Long: " + l);
        System.out.println("Int: " + i);
    }
}
```

Kết quả:

```
Double: 100.04
Long: 100
Int: 100
```

---

## 4. 📊 Bảng mô tả ép kiểu trong Java

| Từ kiểu ▼ / Sang kiểu ▶ | boolean | byte | short | char | int | long | float | double |
|--------------------------|----------|-------|--------|-------|------|-------|--------|---------|
| **boolean** | – | No | No | No | No | No | No | No |
| **byte**    | No | – | Yes | Cast | Yes | Yes | Yes | Yes |
| **short**   | No | Cast | – | Cast | Yes | Yes | Yes | Yes |
| **char**    | No | Cast | Cast | – | Yes | Yes | Yes | Yes |
| **int**     | No | Cast | Cast | Cast | – | Yes | Yes | Yes |
| **long**    | No | Cast | Cast | Cast | Cast | – | Yes | Yes |
| **float**   | No | Cast | Cast | Cast | Cast | Cast | – | Yes |
| **double**  | No | Cast | Cast | Cast | Cast | Cast | Cast | – |

📌 **Giải thích ký hiệu:**

- **–** : chính nó  
- **No** : không thể ép kiểu  
- **Yes** : ép kiểu nới rộng (tự động)  
- **Cast** : ép kiểu thu hẹp (cần `(type)`)  

---

# 🎯 Tổng kết

| Loại | Đặc điểm |
|------|----------|
| **Widening** | Tự động, không mất dữ liệu |
| **Narrowing** | Phải ép kiểu tường minh, có thể mất dữ liệu |
| Nên dùng | Widening khi có thể, Narrowing khi thật sự cần |

---
