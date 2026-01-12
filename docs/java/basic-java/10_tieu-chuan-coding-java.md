---
sidebar_position: 10
---
# Tiêu chuẩn Coding 

Việc tuân thủ **Coding Standards** giúp mã nguồn rõ ràng, dễ bảo trì và thống nhất giữa các thành viên trong dự án. Đây là một trong những yếu tố quan trọng để đảm bảo chất lượng phần mềm.

---

## Nội dung

1. [Tiêu chuẩn Coding là gì?](#1--tiêu-chuẩn-coding-là-gì)  
2. [Tầm quan trọng của Coding Standards](#2--tầm-quan-trọng-của-coding-standards)  
3. [Chuẩn hình thức & chuẩn ngữ nghĩa](#3--chuẩn-hình-thức--chuẩn-ngữ-nghĩa)  
4. [White Space (Khoảng trắng)](#4--white-space-khoảng-trắng)  
5. [Ngoặc tròn `()`](#5--ngoặc-tròn-)  
6. [Ngoặc nhọn `{}`](#6--ngoặc-nhọn-)  
7. [Comment](#7--comment)  
8. [Quy ước đặt tên](#8--quy-ước-đặt-tên)  
9. [Đặt tên package](#9--đặt-tên-package)  
10. [Viết phương thức hiệu quả](#10--viết-phương-thức-hiệu-quả)  
11. [Sử dụng biến](#11--sử-dụng-biến)  

---

## 1. 🧩 Tiêu chuẩn Coding là gì?

Coding Standards là **bộ quy tắc** quy định cách viết mã nguồn, bao gồm:

- Quy tắc đặt tên (class, interface, biến, phương thức…)
- Quy tắc sử dụng khoảng trắng, tab, xuống dòng
- Quy tắc comment mã nguồn
- Quy tắc khai báo và sử dụng biến
- Độ dài tối đa dòng code, file code
- Các quy định về cấu trúc điều khiển, xử lý lỗi…

👉 Mỗi dự án hoặc công ty có thể có một bộ tiêu chuẩn riêng, nhưng Java vẫn có các quy tắc chuẩn chung.

---

## 2. 🎯 Tầm quan trọng của Coding Standards

- ✔ Giúp code dễ đọc, dễ hiểu  
- ✔ Dễ dàng sửa lỗi & bảo trì  
- ✔ Giảm nhầm lẫn và lỗi phát sinh  
- ✔ Thống nhất phong cách lập trình trong team  
- ✔ Tăng khả năng tái sử dụng mã  
- ✔ Tạo cảm giác “sở hữu mã” → code chất lượng hơn

Mã nguồn nhất quán giúp người khác (hoặc chính bạn trong tương lai) dễ dàng làm việc lại.

---

## 3. 🧱 Chuẩn hình thức & chuẩn ngữ nghĩa

### ✔ Chuẩn hình thức (Format Rules)

Liên quan đến cách trình bày của mã nguồn:

- Thụt đầu dòng  
- Khoảng trắng  
- Quy tắc đóng/mở ngoặc  
- Quy tắc đặt tên  

### ✔ Chuẩn ngữ nghĩa (Semantic Rules)

Liên quan đến nội dung logic:

- Biểu thức so sánh  
- Cấu trúc điều khiển  
- Khai báo và sử dụng biến  
- Cách viết và tổ chức phương thức  

---

## 4. ⬜ White Space (Khoảng trắng)

### ✔ Thụt đầu dòng (Indentation)

- 1 tab = 1 đơn vị thụt đầu dòng  
- Có thể cấu hình tab = 4 hoặc 5 khoảng trắng  
- **Nên dùng tab thay khoảng trắng** (dễ tùy chỉnh, nhất quán)

### ✔ Dòng trống

- Các đoạn code liên quan thì **gom lại**  
- Các block code **cách nhau ít nhất 1 dòng trống**  
- Đặt khoảng trắng sau dấu `,` và dấu `;`  
- Đặt khoảng trắng xung quanh toán tử:

```java
a + b
i = i + 1;
```

---

## 5. 🔄 Ngoặc tròn `()`

Dùng ngoặc tròn để:

- Giúp người đọc hiểu rõ ý định  
- Đảm bảo thứ tự thực thi như mong muốn  

👉 Khi phân vân có nên dùng ngoặc hay không → **hãy dùng!**

---

## 6. 🔁 Ngoặc nhọn `{}`

**Java quy định**:

```java
if (x > 0) {
    // code
}
```

👉 Ngoặc mở `{` **đặt cùng dòng** với `if`, `for`, `while`...

Trái ngược với C# hoặc các style khác (dùng dòng mới).

---

## 7. 📝 Comment

### ❌ Không nên:

- Comment lặp lại đúng những gì code đã thể hiện  
- Comment dài dòng  
- Comment không còn đúng với code hiện tại  

### ✔ Nên:

- Comment ngắn gọn, rõ ràng  
- Viết comment khi code phức tạp  
- Canh lề các comment dòng cuối cho thẳng hàng  
- Vừa code vừa comment (không để cuối cùng mới viết)

---

## 8. 🏷 Quy ước đặt tên

### ✔ Quy tắc viết hoa

#### PascalCase (cho Class, Interface)

Ví dụ:

```
SinhVien
StringBuilder
FormDangKy
```

#### camelCase (cho biến và phương thức)

```
hoTen
diemTrungBinh
tinhDiem()
```

---

### ✔ Đặt tên Class, Interface, Abstract Class

- Dùng **danh từ**: SinhVien, NhanVien, SanPham  
- Không dùng viết tắt gây khó hiểu

❌ Sai:  
```
FormSV
```

✔ Đúng:  
```
FormSinhVien
```

❌ Không dùng tiền tố “I” cho Interface (không phải C#)

---

### ✔ Đặt tên phương thức

- Dùng **camelCase**
- Tên mô tả rõ chức năng  
- Không đặt tên mơ hồ  
- Không phân biệt phương thức bằng số:

❌ Sai: `tinh1()`, `tinh2()`  
✔ Đúng: `tinhDiemTrungBinh()`

---

### ✔ Đặt tên biến

- camelCase  
- Không đặt biến bằng 1 ký tự (trừ i, j trong vòng lặp)  
- Không đặt tên biến quá ngắn hoặc quá dài  
- Không dùng tiền tố kiểu dữ liệu (không viết kiểu Hungarian notation)

❌ Sai: `strAddress`  
✔ Đúng: `address`

---

### ✔ Biến static & enum – viết IN HOA

```java
static float PI = 3.14f;
static int MAX_WIDTH = 4;

enum ShapeType {
    SQUARE, CIRCLE, RECTANGLE
}
```

---

### ✔ Biến final

Biến final toàn cục → viết HOA:

```java
final float PI = 3.14f;
```

Biến final cục bộ → viết thường như biến thường:

```java
final int max = 100;
```

---

## 9. 📦 Đặt tên package

- **Tất cả chữ thường**
- Không dùng dấu gạch dưới

✔ Đúng:

```
com.example.project
```

❌ Sai:

```
com.example.deepSpace
com.example.deep_space
```

---

## 10. 🛠 Viết phương thức hiệu quả

- Tách code lặp → thành phương thức riêng  
- Mỗi phương thức chỉ làm **1 chức năng**  
- Tránh khai báo tham số không cần thiết  
- Phương thức tốt nhất nên từ **50 – 150 dòng** (theo Code Complete)

---

## 11. 🔧 Sử dụng biến

- Không khai báo biến mà không dùng  
- Tránh lồng `if`, `for`, `while` quá 3 cấp  
- Chỉ import cần thiết:

✔ Nên dùng:

```java
import java.util.List;
```

❌ Tránh:

```java
import java.util.*;
```

---
