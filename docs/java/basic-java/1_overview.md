---
sidebar_position: 1
---

# Tổng quan về Java

> 📚 Nhóm kiến thức: Java Core  
> 🎯 Mức độ: Cơ bản  
> 🧠 Mục tiêu: Hiểu Java là gì, vì sao Java phổ biến, vai trò của JVM và các nền tảng Java

---

## 🎯 Mục tiêu
- Hiểu nguồn gốc và triết lý của Java
- Nắm các đặc điểm cốt lõi của ngôn ngữ Java
- Hiểu vai trò của JVM
- Phân biệt các nền tảng Java (SE, EE, ME)

---

## 📑 Nội dung

1. [Giới thiệu](#1-giới-thiệu)  
2. [Đặc điểm của ngôn ngữ lập trình Java](#2-đặc-điểm-của-ngôn-ngữ-lập-trình-java)  
3. [Máy ảo Java (JVM – Java Virtual Machine)](#3-máy-ảo-java-jvm--java-virtual-machine)  
4. [Các loại ứng dụng phát triển bằng Java](#4-các-loại-ứng-dụng-phát-triển-bằng-java)  
5. [Các phiên bản của Java](#5-các-phiên-bản-của-java)  
6. [Các thành phần của Java SE Platform](#6-các-thành-phần-của-java-se-platform)

---

## 📌 1. Giới thiệu

Java là một trong những **ngôn ngữ lập trình hướng đối tượng phổ biến nhất** hiện nay.

- Được phát triển bởi **James Gosling** và nhóm kỹ sư tại **Sun Microsystems** (1991)
- Tên ban đầu: **Oak**
- Mục tiêu ban đầu: lập trình cho **thiết bị gia dụng**
- **2010:** Oracle mua lại Sun Microsystems → Java thuộc Oracle

### 🧠 Triết lý cốt lõi
> 👉 **Write Once, Run Anywhere (WORA)**  
Viết một lần – chạy ở mọi nơi có JVM

---

## 🧠 2. Đặc điểm của ngôn ngữ lập trình Java

---

### 2.1 Hướng đối tượng & cú pháp quen thuộc

- Cú pháp tương tự **C / C++** → dễ tiếp cận
- Là ngôn ngữ **hướng đối tượng gần như hoàn toàn**

❌ Java **loại bỏ**:
- Con trỏ (pointer)
- `goto`
- `struct`, `union`
- Một số cơ chế overload nguy hiểm

✅ Mục tiêu:
- An toàn hơn
- Dễ học
- Giảm lỗi runtime

---

### 2.2 Tính đóng gói (Encapsulation)

Java hỗ trợ **access modifier** để:
- Giới hạn quyền truy cập
- Bảo vệ dữ liệu
- Kiểm soát hành vi đối tượng

Các modifier phổ biến:
- `private`
- `default`
- `protected`
- `public`

👉 Encapsulation là **nền tảng của OOP**

---

### 2.3 Độc lập nền tảng (Platform Independent)

Java có khả năng **cross-platform** nhờ JVM.

📌 Quy trình:
- Code Java (`.java`)
- Biên dịch → Bytecode (`.class`)
- JVM dịch Bytecode → Machine Code

➡️ **Chính JVM tạo nên khả năng chạy đa nền tảng**

---

### 2.4 Vừa biên dịch vừa thông dịch

Java không thuần **Compiled** hay **Interpreted**

🧠 Cách Java hoạt động:
1. `.java` → Compiler → `.class` (Bytecode)
2. JVM thông dịch Bytecode → mã máy khi chạy

![Java Overview](/img/java/overview-1.png)

#### ✅ Ưu điểm
- Chạy trên mọi nền tảng có JVM
- Linh hoạt

#### ❌ Nhược điểm
- Chậm hơn C++ (nhưng được tối ưu rất tốt bằng JIT)

---

### 2.5 Thu gom rác tự động (Garbage Collection)

- Object được cấp phát bộ nhớ trên **Heap**
- Java **tự động thu hồi bộ nhớ**
- Tránh memory leak thường gặp ở C/C++

📌 GC sẽ:
- Theo dõi object
- Thu hồi object **không còn reference**

---

### 2.6 Hỗ trợ đa luồng (Multithreading)

Java hỗ trợ:
- Chạy nhiều luồng song song
- Đồng bộ hoá luồng
- Quản lý tài nguyên hiệu quả

➡️ Rất phù hợp cho **server-side & enterprise**

---

### 2.7 Tương thích ngược (Backward Compatibility)

- API cũ **không bị xoá ngay**
- Được đánh dấu `@Deprecated`
- Giúp nâng cấp Java an toàn hơn

---

### 2.8 An toàn & bảo mật

#### 🔒 An toàn
- Không dùng pointer
- Kiểm tra kiểu dữ liệu chặt chẽ
- GC tự động
- Quản lý lỗi tốt

#### 🛡 Bảo mật
- JVM kiểm tra bytecode
- ClassLoader an toàn
- Sandbox runtime

---

## ⚙️ 3. Máy ảo Java (JVM – Java Virtual Machine)

JVM là **trái tim của Java**

📌 Vai trò:
- Thực thi Bytecode
- Quản lý bộ nhớ
- Bảo mật
- Garbage Collection

📌 Mỗi OS có JVM riêng:
- Windows
- Linux
- macOS

![JVM Diagram](/img/java/overview-2.png)

---

## 🌍 4. Các loại ứng dụng Java

Java xuất hiện ở hầu hết mọi lĩnh vực:

![Java App Types](/img/java/overview-3.png)

- Desktop Application
- Web Application
- Enterprise Application
- Mobile Application
- Embedded System
- Big Data, IoT, Game

---

## 📦 5. Các phiên bản Java

![Java Versions](/img/java/overview-4.png)

### Java SE (Standard Edition)
- Nền tảng cơ bản
- Ứng dụng desktop, console

### Java EE (Enterprise Edition)
- Web, Microservices, Enterprise
- Servlet, JSP, JPA, EJB
- Hiện nay chuyển sang **Jakarta EE**

### Java ME (Micro Edition)
- Thiết bị nhúng
- Mobile đời cũ

---

## 🧩 6. Các thành phần của Java SE

Java SE gồm:

![Java Components](/img/java/overview-5.png)

### JRE – Java Runtime Environment
- JVM
- Thư viện chuẩn
- Dùng để **chạy** chương trình Java

### JDK – Java Development Kit
- Compiler
- Debugger
- Công cụ phát triển

➡️ Dùng để **phát triển + chạy** Java

---

## ❓ Câu hỏi tự kiểm tra
- Vì sao Java chạy được trên nhiều nền tảng?
- JVM khác gì JDK?
- Java là compiled hay interpreted?
- Garbage Collection giúp gì cho lập trình viên?

---

## 📝 Ghi chú cá nhân
> (Bổ sung sau khi học xong)
