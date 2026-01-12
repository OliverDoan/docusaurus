---
sidebar_position: 4
---
# Biến trong Java

Trong Java, **biến (variable)** là tên đại diện cho **một vùng nhớ**, dùng để lưu trữ dữ liệu trong chương trình.  
Java có **3 loại biến chính**:  
- **Biến cục bộ (Local Variable)**  
- **Biến toàn cục / biến instance (Instance Variable)**  
- **Biến tĩnh (Static Variable)**  

---

## Nội dung

1. [Khai báo biến](#1-khai-báo-biến)  
2. [Quy tắc đặt tên biến](#2-quy-tắc-đặt-tên-biến)  
3. [Các loại biến và phạm vi hoạt động (Scope)](#3-các-loại-biến-và-phạm-vi-hoạt-động-scope)  
4. [Phạm vi tồn tại (Variable Scope)](#4-phạm-vi-tồn-tại-variable-scope)  
5. [Hằng số (Constant)](#5--hằng-số-constant)  

---

## 1. Khai báo biến

- Là vùng nhớ lưu trữ giá trị.
- Mỗi biến gắn với **kiểu dữ liệu (DataType)** và **tên biến (varName)**.


```java
DataType varName [= value] [, varName2] [= value2] ... ;
```


```java
int x1 = 1;
int x1 = 1, x2 = 3;
int x1 = 2; long x2 = 1;
```

⚠️ **Không được khai báo nhiều biến khác kiểu trong cùng một lệnh**  
Ví dụ: ❌ `int x1 = 2, long x2 = 1;`

---

## 2. Quy tắc đặt tên biến

- Phân biệt **chữ hoa – chữ thường**
- Chấp nhận ký tự: chữ, số, `_`, `$`
- Không bắt đầu bằng số
- Không trùng **từ khóa Java**
- Không chứa khoảng trắng
- Không dùng `_` đơn lẻ trong Java 9+


| Loại | Quy tắc | Ví dụ |
|------|---------|--------|
| **Class** | PascalCase | `Student`, `InputStream` |
| **Biến / phương thức** | camelCase | `ngaySinh`, `diemTrungBinh` |


---

## 3. Các loại biến và phạm vi hoạt động (Scope)

### 3.1. Biến cục bộ (Local Variable)

- Khai báo **bên trong phương thức**, constructor hoặc block.
- Tồn tại trong phạm vi block chứa nó.
- Không có **access modifier**
- Lưu trên **stack**
- **Bắt buộc** phải khởi tạo trước khi dùng.

---

### 3.2. Biến toàn cục (Instance Variable)

- Khai báo **trong class**, ngoài phương thức.
- Lưu trên **heap**
- Tạo khi đối tượng được tạo bằng `new`
- Có thể dùng **access modifier**
- Có **giá trị mặc định** (0, 0.0, null,…)
- Dùng thông qua **đối tượng**

---

### 3.3. Biến tĩnh (Static Variable)

- Khai báo với từ khóa `static`
- Chỉ có **một bản sao duy nhất**, dùng chung cho mọi đối tượng
- Lưu trên **static memory**
- Tạo khi chương trình chạy và hủy khi chương trình kết thúc
- Truy cập qua **TênClass.tenBien**


```java
public class Student {
    public static String name = "GP Coder";
    public static int age = 21;

    public static void main(String[] args) {
        System.out.println("Name: " + name);
        System.out.println("Age: " + Student.age);
    }
}
```

---

## 4. Phạm vi tồn tại (Variable Scope)

| Loại biến | Tồn tại từ lúc | Tồn tại đến khi |
|-----------|----------------|------------------|
| **Local** | Khi vào block/method | Kết thúc block/method |
| **Instance** | Khi tạo object | Object bị thu gom rác |
| **Static** | Khi chương trình chạy | Khi chương trình kết thúc |

---

## 5. 🔒 Hằng số (Constant)

- Khai báo bằng từ khóa `final`
- Không thể thay đổi giá trị sau khi gán

### Quy tắc đặt tên hằng
- Viết IN HOA, có thể dùng `_`  
  Ví dụ: `MAX_VALUE`, `PI_NUMBER`

## Ví dụ:

```java
public class VariableTutorial {
    final int HANG_SO = 10; // hằng số

    String bienToanCuc = "Đây là biến toàn cục";
    int number1 = 10;

    public void testVarial() {
        number1 = 20; // OK
        HANG_SO = 50; // ERROR: không thể thay đổi
    }

    public static void main(String[] args) {
        String bienCucBo = "Đây là biến cục bộ";
    }
}
```

---

# 🎉 Tổng kết

| Loại biến | Vị trí khai báo | Vùng nhớ | Giá trị mặc định | Truy cập |
|-----------|------------------|----------|------------------|----------|
| **Local** | Trong method/block | Stack | ❌ Không có | Trong block |
| **Instance** | Trong class | Heap | ✔ Có | Qua object |
| **Static** | Trong class + từ khóa static | Static memory | ✔ Có | Qua Class |

Biến là nền tảng quan trọng trong Java. Hiểu rõ cách hoạt động giúp bạn viết code rõ ràng, hiệu quả và tránh lỗi không đáng có.

