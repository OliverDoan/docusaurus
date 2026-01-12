---
sidebar_position: 5
---
# Các kiểu dữ liệu trong Java

Trong Java, **kiểu dữ liệu (data type)** được chia làm **2 nhóm lớn**:

- **Kiểu nguyên thủy (Primitive types)** → bắt đầu bằng **chữ thường**
- **Kiểu đối tượng (Reference/Object types)** → bắt đầu bằng **chữ hoa**

Ví dụ:  
`int`, `double` → nguyên thủy  
`Integer`, `Double` → đối tượng

---

## Nội dung

1. [Kiểu dữ liệu nguyên thủy (Primitive Types)](#1--kiểu-dữ-liệu-nguyên-thủy-primitive-types)  
2. [Kiểu dữ liệu đối tượng (Reference Types)](#2--kiểu-dữ-liệu-đối-tượng-reference-types)  
3. [Lớp Wrapper trong Java](#3--lớp-wrapper-trong-java)  
4. [Nên dùng kiểu nào?](#4--nên-dùng-kiểu-nào)  
5. [Kết luận](#5--kết-luận)  

---

## 1. 🔢 Kiểu dữ liệu nguyên thủy (Primitive Types)

Java có **8 kiểu nguyên thủy**, chia thành 4 nhóm:

| Nhóm | Kiểu dữ liệu |
|------|---------------|
| Số nguyên | `byte`, `short`, `int`, `long` |
| Số thực | `float`, `double` |
| Ký tự | `char` |
| Logic | `boolean` |

---

### 📊 Bảng chi tiết 8 kiểu dữ liệu nguyên thủy

| Kiểu dữ liệu | Số bit | Giá trị nhỏ nhất | Giá trị lớn nhất |
|--------------|--------|------------------|------------------|
| **byte** | 8 | -128 | 127 |
| **short** | 16 | -32,768 | 32,767 |
| **int** | 32 | -2,147,483,648 | 2,147,483,647 |
| **long** | 64 | -9,223,372,036,854,775,808 | 9,223,372,036,854,775,807 |
| **float** | 32 | ~ -3.4 × 10³⁸ | ~ 3.4 × 10³⁸ |
| **double** | 64 | ~ -1.7 × 10³⁰⁸ | ~ 1.7 × 10³⁰⁸ |
| **boolean** | 1 bit (logic) | false | true |
| **char** | 16 | '\u0000' | '\uffff' |

---

### 🧪 Ví dụ khai báo:

```java
byte b = 1;
short s = 16;
int i = 32;
long lg = 3123456789L; // phải thêm L
float f = 3.14F;       // phải thêm F
double d = 3.24;
boolean bool = true;
```

---

### 📌 Các lưu ý quan trọng

### 1️⃣ Sự khác nhau giữa `short` và `char`
- `short`: có dấu → từ -32,768 đến 32,767  
- `char`: không dấu → từ 0 đến 65,535

### 2️⃣ Mặc định:
- Số nguyên → `int`
- Số thực → `double`

Nên khi dùng `long` hoặc `float` phải thêm hậu tố:

| Kiểu | Hậu tố |
|------|---------|
| **long** | `L` hoặc `l` |
| **float** | `F` hoặc `f` |

### 3️⃣ Các hệ số mà Java hỗ trợ:
| Hệ | Ví dụ | Giải thích |
|----|--------|------------|
| Thập phân | `100` | bình thường |
| Bát phân | `017` | bắt đầu bằng **0** |
| Thập lục phân | `0xFF` | bắt đầu bằng **0x** |
| Nhị phân | `0b10` | bắt đầu bằng **0b** |

### 4️⃣ Dùng dấu gạch dưới cho dễ đọc:

```java
int million = 1_000_000;
double value = 1_00_0.0_0;
```

Không hợp lệ:

```java
_1000.00  // lỗi
1000.00_  // lỗi
1000_.00  // lỗi
```

---

## 🔥 Overflow và Underflow

### Overflow (tràn số):

```java
System.out.println(2147483647 + 1); 
// -2147483648
```

### Underflow (tràn ngược):

```java
System.out.println(-2147483648 - 1);
// 2147483647
```

---

## 2. 🧱 Kiểu dữ liệu đối tượng (Reference Types)

Java có 3 kiểu chính:

| Kiểu dữ liệu | Mô tả |
|--------------|--------|
| **Array** | Mảng chứa các phần tử cùng kiểu |
| **class** | Đối tượng do người dùng định nghĩa |
| **interface** | Tập hợp các hành vi (method) |

---

## 3. 🧰 Lớp Wrapper trong Java

Lớp Wrapper giúp:
- Chuyển **primitive → object** (boxing)
- Chuyển **object → primitive** (unboxing)

| Kiểu nguyên thủy | Wrapper |
|------------------|----------|
| `boolean` | Boolean |
| `char` | Character |
| `byte` | Byte |
| `short` | Short |
| `int` | Integer |
| `long` | Long |
| `float` | Float |
| `double` | Double |

---


### ❓ Tại sao cần Wrapper?

✔ Dùng trong **Collection**  
✔ Cho phép chứa **null**  
✔ Giúp phát hiện lỗi (NullPointerException)  
✔ Hữu ích khi giá trị mặc định 0 có thể gây nhầm lẫn

---

### ⚠ Hạn chế của Wrapper

- Chậm hơn **kiểu nguyên thủy** vì phải tạo object
- So sánh bằng `==` không như kỳ vọng (so sánh reference)

---

### 🏎 So sánh hiệu năng

```java
AutoBoxing with Collection: 23ms
Using an Array: 8ms
```

→ **Kiểu nguyên thủy nhanh hơn rõ rệt**

---

## 💡 Nên dùng kiểu nào?

| Mục đích | Kiểu nên dùng |
|----------|----------------|
| Hiệu năng | Primitive |
| Cần lưu null | Wrapper |
| Dùng trong Collection | Wrapper |
| Tính toán đơn giản | Primitive |

---

## 🎉 Kết luận

- Java cung cấp nhiều kiểu dữ liệu mạnh mẽ và linh hoạt
- Primitive nhanh và nhẹ → dùng khi có thể
- Wrapper cần thiết trong cấu trúc dữ liệu và khi cần nullable
- Hiểu rõ kiểu dữ liệu giúp viết code **hiệu quả, an toàn và tối ưu hơn**

