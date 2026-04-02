---
sidebar_position: 10
title: "Tiêu chuẩn Coding trong Java"
---

# Tiêu chuẩn Coding trong Java

**Tiêu chuẩn Coding (Coding Standards/Conventions)** là bộ quy tắc quy định cách viết mã nguồn sao cho **nhất quán, dễ đọc, dễ bảo trì** trong dự án. Việc tuân thủ coding standards giúp cả team làm việc hiệu quả hơn và giảm thiểu lỗi phát sinh.

Hãy hình dung coding standards giống như **quy tắc chính tả và ngữ pháp** trong ngôn ngữ tự nhiên: mọi người đều viết theo cùng quy tắc nên ai đọc cũng hiểu. Nếu mỗi người viết một kiểu (người viết hoa, người viết thường, người viết tắt...), văn bản sẽ rất khó đọc. Code cũng vậy -- khi cả team tuân thủ cùng chuẩn, code trở nên dễ đọc như một cuốn sách được biên tập tốt.

---

## Nội dung

1. [Naming Conventions (Quy ước đặt tên)](#1-naming-conventions-quy-ước-đặt-tên)
2. [Indentation và Braces (Thụt lề và ngoặc nhọn)](#2-indentation-và-braces-thụt-lề-và-ngoặc-nhọn)
3. [Comments (Chú thích)](#3-comments-chú-thích)
4. [Code Organization (Tổ chức code)](#4-code-organization-tổ-chức-code)
5. [Clean Code Principles (Nguyên tắc code sạch)](#5-clean-code-principles-nguyên-tắc-code-sạch)
6. [Khi nào dùng?](#6-khi-nào-dùng)
7. [Lỗi thường gặp](#7-lỗi-thường-gặp)
8. [Câu hỏi phỏng vấn](#8-câu-hỏi-phỏng-vấn)

---

## 1. Naming Conventions (Quy ước đặt tên)

Đặt tên đúng chuẩn là điều **quan trọng nhất** trong coding standards. Tên tốt giúp code tự giải thích (self-documenting).

### 1.1. PascalCase -- cho Class, Interface, Enum

Mỗi từ viết hoa chữ cái đầu, không dùng dấu gạch dưới.

```java
// ✅ Đúng
public class StudentManager { }
public interface Serializable { }
public abstract class AbstractShape { }
public enum OrderStatus { PENDING, CONFIRMED, SHIPPED }

// ❌ Sai
public class studentManager { }   // Chữ cái đầu không viết hoa
public class student_manager { }  // Không dùng gạch dưới
public class STUDENTMANAGER { }   // Không viết hoa toàn bộ
```

### 1.2. camelCase -- cho Method và Variable

Từ đầu tiên viết thường, các từ tiếp theo viết hoa chữ cái đầu.

```java
// ✅ Đúng: tên method -- bắt đầu bằng động từ
public void calculateTotalPrice() { }
public String getStudentName() { }
public boolean isActive() { }
public void setEmail(String email) { }

// ✅ Đúng: tên biến -- danh từ hoặc cụm danh từ
int studentAge = 20;
String firstName = "Thuan";
double averageScore = 8.5;
boolean isLoggedIn = false;

// ❌ Sai
public void CalculateTotalPrice() { }  // PascalCase cho method
int StudentAge = 20;                   // PascalCase cho biến
String first_name = "Thuan";           // snake_case (không phải Java convention)
int x = 20;                            // Tên quá ngắn, không rõ nghĩa
```

### 1.3. UPPER_SNAKE_CASE -- cho Constants (Hằng số)

Tất cả viết hoa, các từ cách nhau bằng dấu gạch dưới.

```java
// ✅ Đúng: hằng số static final
public static final int MAX_RETRY_COUNT = 3;
public static final double PI = 3.14159265358979;
public static final String BASE_URL = "https://api.example.com";
public static final int HTTP_STATUS_OK = 200;

// ❌ Sai
public static final int maxRetryCount = 3;  // Không dùng camelCase cho hằng số
public static final int Max_Retry_Count = 3; // Phải viết HOA toàn bộ
```

### 1.4. lowercase -- cho Package

Tất cả viết thường, không dùng dấu gạch dưới, thường bắt đầu bằng tên miền đảo ngược.

```java
// ✅ Đúng
package com.example.studentmanager;
package org.apache.commons.lang;
package vn.edu.hcmus.core;

// ❌ Sai
package com.example.studentManager;  // Không dùng camelCase
package com.example.student_manager;  // Không dùng gạch dưới
```

### Bảng tổng hợp

| Thành phần | Quy tắc | Ví dụ |
|-----------|---------|-------|
| Class, Interface, Enum | PascalCase | `StudentManager`, `Serializable` |
| Method | camelCase, bắt đầu bằng động từ | `calculateTotal()`, `getName()` |
| Variable | camelCase, danh từ | `studentAge`, `firstName` |
| Constant (`static final`) | UPPER_SNAKE_CASE | `MAX_SIZE`, `BASE_URL` |
| Package | lowercase | `com.example.project` |
| Enum values | UPPER_SNAKE_CASE | `PENDING`, `IN_PROGRESS` |

---

## 2. Indentation và Braces (Thụt lề và ngoặc nhọn)

### 2.1. Thụt lề (Indentation)

- Dùng **4 khoảng trắng** (space) cho mỗi cấp thụt lề.
- Nhiều dự án dùng tab = 4 spaces.

### 2.2. Vị trí ngoặc nhọn (Braces)

Java convention: ngoặc mở `{` đặt **cùng dòng** với câu lệnh.

```java
// ✅ Đúng: Java convention (K&R style)
public class Student {
    public void study() {
        if (isReady) {
            startStudying();
        } else {
            prepare();
        }
    }
}

// ❌ Sai: Allman style (dùng trong C#, không phải Java convention)
public class Student
{
    public void study()
    {
        if (isReady)
        {
            startStudying();
        }
    }
}
```

### 2.3. Luôn dùng ngoặc nhọn

Ngay cả khi chỉ có **1 dòng code**, vẫn nên dùng `{}` để tránh lỗi.

```java
// ✅ Đúng: luôn dùng {}
if (age >= 18) {
    System.out.println("Đủ tuổi");
}

// ❌ Sai: thiếu {}, dễ gây lỗi khi thêm code
if (age >= 18)
    System.out.println("Đủ tuổi");
    System.out.println("Được bầu cử"); // Dòng này LUÔN chạy, không thuộc if!
```

### 2.4. Khoảng trắng

```java
// ✅ Đúng: có khoảng trắng xung quanh toán tử và sau dấu phẩy
int result = a + b;
if (x > 0 && y < 10) { }
void method(int a, int b, String name) { }

// ❌ Sai: thiếu khoảng trắng
int result=a+b;
if(x>0&&y<10){}
void method(int a,int b,String name){}
```

---

## 3. Comments (Chú thích)

### 3.1. Single-line comment (Chú thích một dòng)

```java
// Tính tổng điểm của sinh viên
int totalScore = mathScore + englishScore + scienceScore;
```

### 3.2. Multi-line comment (Chú thích nhiều dòng)

```java
/*
 * Phương thức này tính điểm trung bình
 * của sinh viên dựa trên tất cả các môn học.
 * Trả về 0 nếu không có môn nào.
 */
double calculateAverage(List<Integer> scores) {
    if (scores.isEmpty()) {
        return 0;
    }
    int sum = 0;
    for (int score : scores) {
        sum += score;
    }
    return (double) sum / scores.size();
}
```

### 3.3. Javadoc comment (Chú thích tài liệu)

Javadoc dùng để tạo **tài liệu API tự động**. Đặt trước class, method, hoặc field public.

```java
/**
 * Quản lý thông tin sinh viên trong hệ thống.
 *
 * <p>Class này cung cấp các thao tác CRUD cơ bản
 * trên dữ liệu sinh viên.</p>
 *
 * @author Thuan Doan
 * @version 1.0
 * @since 2024-01-01
 */
public class StudentService {

    /**
     * Tìm sinh viên theo ID.
     *
     * @param studentId ID của sinh viên cần tìm, phải lớn hơn 0
     * @return đối tượng Student nếu tìm thấy, null nếu không
     * @throws IllegalArgumentException nếu studentId <= 0
     */
    public Student findById(int studentId) {
        if (studentId <= 0) {
            throw new IllegalArgumentException("Student ID phải > 0");
        }
        // Logic tìm sinh viên...
        return null;
    }
}
```

### Nguyên tắc viết comment tốt

```java
// ❌ Sai: comment lặp lại code (thừa)
int age = 25; // Gán age bằng 25

// ❌ Sai: comment không còn đúng với code
// Tính tổng 2 số
int result = a * b; // Thực tế đang nhân!

// ✅ Đúng: comment giải thích "TẠI SAO" chứ không phải "LÀM GÌ"
// Dùng binary search thay vì linear search vì danh sách đã được sắp xếp
int index = Collections.binarySearch(sortedList, target);

// ✅ Đúng: comment cho logic phức tạp
// Áp dụng công thức Haversine để tính khoảng cách giữa 2 tọa độ GPS
double distance = Math.acos(Math.sin(lat1) * Math.sin(lat2)
    + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * EARTH_RADIUS;
```

---

## 4. Code Organization (Tổ chức code)

### 4.1. Thứ tự trong một file class

```java
package com.example.service; // 1. Package declaration

import java.util.List;       // 2. Import statements
import java.util.Map;

/**
 * Javadoc cho class.
 */
public class UserService {   // 3. Class declaration

    // 4. Constants (static final)
    private static final int MAX_USERS = 1000;

    // 5. Static variables
    private static int totalCount = 0;

    // 6. Instance variables
    private String serviceName;
    private List<String> users;

    // 7. Constructors
    public UserService(String serviceName) {
        this.serviceName = serviceName;
    }

    // 8. Public methods
    public String getServiceName() {
        return this.serviceName;
    }

    public void addUser(String user) {
        this.users.add(user);
        totalCount++;
    }

    // 9. Private methods (helper/utility)
    private void validateUser(String user) {
        if (user == null || user.isEmpty()) {
            throw new IllegalArgumentException("User cannot be empty");
        }
    }
}
```

### 4.2. Import

```java
// ✅ Đúng: import cụ thể
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

// ❌ Sai: import wildcard (khó biết dùng class nào)
import java.util.*;
```

---

## 5. Clean Code Principles (Nguyên tắc code sạch)

### 5.1. Meaningful Names (Tên có ý nghĩa)

```java
// ❌ Sai: tên không rõ ràng
int d; // số ngày? khoảng cách? dữ liệu?
String s;
List<int[]> list1;

// ✅ Đúng: tên tự giải thích
int daysSinceLastLogin;
String customerEmail;
List<int[]> studentScores;
```

### 5.2. Small Methods (Phương thức nhỏ)

Mỗi method chỉ nên làm **một việc duy nhất** và ngắn gọn (dưới 30-50 dòng).

```java
// ❌ Sai: method quá dài, làm nhiều việc
public void processOrder(Order order) {
    // Validate order (20 dòng)...
    // Calculate total (15 dòng)...
    // Apply discount (10 dòng)...
    // Save to database (10 dòng)...
    // Send email (10 dòng)...
}

// ✅ Đúng: tách thành nhiều method nhỏ
public void processOrder(Order order) {
    validateOrder(order);
    double total = calculateTotal(order);
    double finalPrice = applyDiscount(total, order.getCoupon());
    saveOrder(order, finalPrice);
    sendConfirmationEmail(order);
}

private void validateOrder(Order order) { /* ... */ }
private double calculateTotal(Order order) { /* ... */ }
private double applyDiscount(double total, String coupon) { /* ... */ }
private void saveOrder(Order order, double finalPrice) { /* ... */ }
private void sendConfirmationEmail(Order order) { /* ... */ }
```

### 5.3. DRY (Don't Repeat Yourself)

Không lặp lại code -- nếu thấy copy-paste, hãy tách thành method hoặc class riêng.

```java
// ❌ Sai: code lặp lại
public void printStudentReport(Student student) {
    System.out.println("=== BÁO CÁO ===");
    System.out.println("Tên: " + student.getName());
    System.out.println("Tuổi: " + student.getAge());
    System.out.println("================");
}

public void printTeacherReport(Teacher teacher) {
    System.out.println("=== BÁO CÁO ===");
    System.out.println("Tên: " + teacher.getName());
    System.out.println("Tuổi: " + teacher.getAge());
    System.out.println("================");
}

// ✅ Đúng: tách method chung
public void printReport(String name, int age) {
    System.out.println("=== BÁO CÁO ===");
    System.out.println("Tên: " + name);
    System.out.println("Tuổi: " + age);
    System.out.println("================");
}
```

### 5.4. Avoid Magic Numbers (Tránh số "ma thuật")

```java
// ❌ Sai: số 18 xuất hiện trần trụi, không rõ ý nghĩa
if (age > 18) {
    // ...
}

// ✅ Đúng: dùng hằng số có tên rõ ràng
private static final int LEGAL_AGE = 18;

if (age > LEGAL_AGE) {
    // ...
}
```

---

## 6. Khi nào dùng?

**Luôn luôn!** Coding standards nên được áp dụng **từ dòng code đầu tiên** của dự án.

| Tình huống | Áp dụng gì |
|-----------|-----------|
| Bắt đầu dự án mới | Thống nhất coding standards với team từ đầu |
| Viết code hàng ngày | Naming conventions, indentation, clean code |
| Viết class/method public | Javadoc comment |
| Code review | Kiểm tra theo coding standards |
| Dự án cá nhân | Vẫn nên tuân thủ, tạo thói quen tốt |

**Best practices**:
- Dùng **IDE formatter** (IntelliJ, Eclipse) để tự động format code.
- Dùng **Checkstyle**, **SonarQube** để kiểm tra coding standards tự động.
- Thống nhất coding standards trong file **CONTRIBUTING.md** hoặc **code style config** của dự án.
- Code review nên kiểm tra cả coding standards, không chỉ logic.

---

## 7. Lỗi thường gặp

### Lỗi 1: Đặt tên không đúng convention

```java
// ❌ Sai: lẫn lộn convention
public class student_service { }  // snake_case cho class
int MaxValue = 100;               // PascalCase cho biến
public void CalculateTotal() { }  // PascalCase cho method
static final int max_size = 10;   // snake_case cho constant

// ✅ Đúng: đúng convention
public class StudentService { }           // PascalCase cho class
int maxValue = 100;                       // camelCase cho biến
public void calculateTotal() { }          // camelCase cho method
static final int MAX_SIZE = 10;           // UPPER_SNAKE_CASE cho constant
```

### Lỗi 2: Đặt tên biến quá ngắn hoặc vô nghĩa

```java
// ❌ Sai: tên không rõ ràng
int a, b, c;
String s1, s2;
List<Object> list;
boolean flag;

// ✅ Đúng: tên có ý nghĩa
int width, height, depth;
String firstName, lastName;
List<Student> enrolledStudents;
boolean isEmailVerified;
```

### Lỗi 3: Comment thừa hoặc sai

```java
// ❌ Sai: comment thừa
i++; // Tăng i lên 1
String name = "Thuan"; // Gán name bằng Thuan

// ❌ Sai: comment không còn đúng
// Tính tổng 2 số (nhưng code đang nhân!)
int result = a * b;

// ✅ Đúng: không comment khi code đã rõ ràng
i++;
String name = "Thuan";

// ✅ Đúng: comment khi cần giải thích lý do
// Nhân thay vì cộng vì đây là tính diện tích hình chữ nhật
int area = width * height;
```

### Lỗi 4: Import wildcard

```java
// ❌ Sai: import tất cả
import java.util.*;
import java.io.*;

// ✅ Đúng: import cụ thể
import java.util.List;
import java.util.ArrayList;
import java.io.File;
import java.io.IOException;
```

---

## 8. Câu hỏi phỏng vấn

### Q1: Tại sao Coding Standards quan trọng?

**A**: Coding Standards quan trọng vì:

1. **Tính nhất quán**: Cả team viết code theo cùng phong cách, ai đọc cũng hiểu.
2. **Dễ bảo trì**: Code dễ đọc thì dễ sửa lỗi, dễ thêm tính năng.
3. **Giảm thời gian code review**: Reviewer tập trung vào logic thay vì format.
4. **Onboarding nhanh**: Thành viên mới dễ dàng hòa nhập.
5. **Giảm lỗi**: Tên biến rõ ràng, code gọn gàng giúp phát hiện lỗi sớm hơn.

---

### Q2: PascalCase, camelCase, UPPER_SNAKE_CASE dùng ở đâu?

**A**:

| Convention | Áp dụng cho | Ví dụ |
|-----------|-----------|-------|
| **PascalCase** | Class, Interface, Enum, Annotation | `StudentService`, `Comparable` |
| **camelCase** | Method, variable, parameter | `calculateTotal()`, `studentAge` |
| **UPPER_SNAKE_CASE** | Constant (`static final`), Enum value | `MAX_SIZE`, `HTTP_OK` |
| **lowercase** | Package | `com.example.service` |

---

### Q3: Javadoc comment là gì? Khi nào dùng?

**A**: Javadoc comment bắt đầu bằng `/**` và kết thúc bằng `*/`. Nó được Java tool `javadoc` sử dụng để **tự động tạo tài liệu API** dạng HTML.

Nên dùng Javadoc cho:
- Mọi class, interface public.
- Mọi method public và protected.
- Các field public quan trọng.

Javadoc hỗ trợ các tag: `@param` (mô tả tham số), `@return` (mô tả giá trị trả về), `@throws` (mô tả exception), `@author`, `@version`, `@since`, `@see`, `@deprecated`.

```java
/**
 * Tính diện tích hình tròn.
 *
 * @param radius bán kính hình tròn, phải > 0
 * @return diện tích hình tròn
 * @throws IllegalArgumentException nếu radius <= 0
 */
public double calculateCircleArea(double radius) {
    if (radius <= 0) {
        throw new IllegalArgumentException("Radius phải > 0");
    }
    return Math.PI * radius * radius;
}
```
