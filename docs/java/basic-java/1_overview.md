---
sidebar_position: 1
---

# Tổng quan về Java

## 1. Giới thiệu

Java là một trong những ngôn ngữ lập trình hướng đối tượng phổ biến nhất hiện nay.  
Ngôn ngữ này được khởi đầu bởi **James Gosling** và các đồng nghiệp tại **Sun Microsystems** năm 1991.  
Ban đầu Java có tên là **Oak**, và được tạo ra để lập trình cho các thiết bị gia dụng.

- **1994:** Java được phát hành rộng rãi.  
- **2010:** Oracle mua lại Sun Microsystems → Java thuộc Oracle.  
- Java ra đời với triết lý nổi tiếng:  
  👉 **"Write Once, Run Anywhere" (WORA)**

---

## Nội dung

1. [Giới thiệu](#1-giới-thiệu)  
2. [Đặc điểm của ngôn ngữ lập trình Java](#2-đặc-điểm-của-ngôn-ngữ-lập-trình-java)  
3. [Máy ảo Java (JVM – Java Virtual Machine)](#3-máy-ảo-java-jvm--java-virtual-machine)  
4. [Các loại ứng dụng phát triển bằng Java](#4-các-loại-ứng-dụng-phát-triển-bằng-java)  
5. [Các phiên bản của Java](#5-các-phiên-bản-của-java)  
6. [Các thành phần của Java SE Platform](#6-các-thành-phần-của-java-se-platform)  

---

## 2. Đặc điểm của ngôn ngữ lập trình Java

### 2.1 Tương tự C++ và hướng đối tượng hoàn toàn  
Trong quá trình tạo ra một ngôn ngữ mới phục vụ cho mục đích chạy được trên nhiều nền tảng, các kỹ sư của Sun MicroSystem muốn tạo ra một ngôn ngữ dễ học và quen thuộc với đa số người lập trình. Vì vậy họ đã sử dụng lại các cú pháp của C và C++.

Tuy nhiên, trong Java thao tác với con trỏ bị lược bỏ nhằm đảo bảo tính an toàn và dễ sử dụng hơn. Các thao tác overload, goto hay các cấu trúc như struct và union cũng được loại bỏ khỏi Java.



---

### 2.2 Tính đóng gói (Encapsulation)
Java hỗ trợ các access modifier để giới hạn quyền truy cập, bảo vệ dữ liệu khỏi bị truy cập và sửa đổi ngoài ý muốn. Hầu hết mọi người coi tính đóng gói là một khía cạnh của ngôn ngữ hướng đối tượng.

---

### 2.3 Độc lập phần cứng & hệ điều hành (Platform Independent)
Một chương trình viết bằng ngôn ngữ Java có thể chạy tốt ở nhiều môi trường khác nhau. Gọi là khả năng “cross-platform”. Khả năng độc lập phần cứng và hệ điều hành được thể hiện ở 2 cấp độ là cấp độ mã nguồn và cấp độ nhị phân.


- **Code Java (.java)** → biên dịch → **Bytecode (.class)**  
- JVM thông dịch Bytecode thành mã máy thực tế khi chạy.

📌 Chính JVM tạo ra khả năng **cross-platform** của Java.

---

### 2.4 Ngôn ngữ vừa biên dịch vừa thông dịch  

Ngôn ngữ lập trình thường được chia ra làm 2 loại (tùy theo các hiện thực hóa ngôn ngữ đó) là ngôn ngữ thông dịch (Interpreted Language) và ngôn ngữ biên dịch (Compiled Language).

- **Thông dịch (Interpreter)** : Nó dịch từng lệnh rồi chạy từng lệnh, lần sau muốn chạy lại thì phải dịch lại.

- **Biên dịch (Compiler)**: Code sau khi được biên dịch sẽ tạo ra 1 file thường là .exe, và file .exe này có thể đem sử dụng lại không cần biên dịch nữa.

Ngôn ngữ lập trình Java thuộc loại ngôn ngữ thông dịch. Chính xác hơn, Java là loại ngôn ngữ vừa biên dịch (Interpreted Language) vừa thông dịch. Cụ thể như sau

Khi viết mã, hệ thống tạo ra một tệp .java. Khi biên dịch mã nguồn của chương trình sẽ được biên dịch ra mã byte code. Máy ảo Java (Java Virtual Machine) sẽ thông dịch mã byte code này thành machine code  (hay native code) khi nhận được yêu cầu chạy chương trình.



![Java Overview](/img/java/overview-1.png)

**Ưu điểm:**  
- Chạy được trên mọi nền tảng có JVM  
- Tính linh hoạt cao  

**Nhược điểm:**  
- Tốc độ chậm hơn C++ (nhưng vẫn rất tối ưu)

---

### 2.5 Cơ chế thu gom rác tự động (Garbage Collection)
Khi tạo ra các đối tượng trong Java, JRE sẽ tự động cấp phát không gian bộ nhớ cho các đối tượng ở trên heap.

Với ngôn ngữ như C \ C++, bạn sẽ phải yêu cầu hủy vùng nhớ mà bạn đã  cấp phát, để tránh việc thất thoát vùng nhớ. Tuy nhiên vì một lý do nào đó, bạn không hủy một vài vùng nhớ, dẫn đến việc thất thoát và làm giảm hiệu năng chương trình.

Ngôn ngữ lập trình Java hỗ trợ cho bạn điều đó, nghĩa là bạn không phải  tự gọi hủy các vùng nhớ. Bộ thu dọn rác của Java sẽ theo vết các tài nguyên đã được cấp. Khi không có tham chiếu nào đến vùng nhớ, bộ thu dọn rác sẽ tiến hành thu hồi vùng nhớ đã được cấp phát.


---

### 2.6 Đa luồng (Multithreading)

Java hỗ trợ lập trình đa tiến trình (multithread) để thực thi các công việc đồng thời. Đồng thời cũng cung cấp giải pháp đồng bộ giữa các tiến trình (giải pháp sử dụng priority…).

---

### 2.7 Tương thích ngược (Backward Compatibility)
Các phiên bản Java mới luôn cố gắng giữ tính tương thích với phiên bản cũ.

- Các API cũ không bị xoá ngay mà thường được **deprecated** trước.  
- Giảm rủi ro khi cập nhật Java.

---

### 2.8 Tính an toàn và bảo mật (Secure)

**Tính an toàn:**
- Kiểm tra kiểu dữ liệu nghiêm ngặt  
- Không dùng con trỏ  
- Tránh tràn bộ nhớ  
- Tự động cấp phát & giải phóng bộ nhớ  
- Kiểm soát lỗi tốt

**Tính bảo mật:**
- Kiểm soát truy cập lớp  
- JVM kiểm tra bytecode  
- Trình nạp lớp đảm bảo an toàn khi load class  
- Môi trường chạy có sandbox bảo vệ

---

## 3. Máy ảo Java (JVM – Java Virtual Machine)

JVM là thành phần cốt lõi giúp Java chạy được trên nhiều nền tảng.

- Code Java → Bytecode (.class)  
- JVM thông dịch Bytecode → Mã máy thực sự  
- Mỗi hệ điều hành có phiên bản JVM khác nhau

Ví dụ: JVM cho Windows, Linux, macOS…

![JVM Diagram](/img/java/overview-2.png)

---

## 4. Các loại ứng dụng phát triển bằng Java

Java có mặt ở khắp nơi:

![Java App Types](/img/java/overview-3.png)

- Ứng dụng desktop  
- Ứng dụng web  
- Ứng dụng doanh nghiệp (Enterprise)  
- Ứng dụng di động  
- Hệ thống nhúng  
- Game, Big Data, IoT…

---

## 5. Các phiên bản của Java

![Java Versions](/img/java/overview-4.png)

 **Java SE – Standard Edition**
- Nền tảng cơ bản  
- Dùng để xây dựng ứng dụng desktop, console

 **Java EE – Enterprise Edition**
- Xây dựng ứng dụng web, microservices, hệ thống doanh nghiệp  
- Bao gồm Servlet, JSP, JPA, EJB…

 **Java ME – Mobile Edition**
- Dùng cho thiết bị nhúng, mobile đời cũ

---

## 6. Các thành phần của Java SE Platform

Java SE gồm **JRE** và **JDK**:

![Java Components](/img/java/overview-5.png)

- **JRE (Java Runtime Environment)**: cung cấp JVM  (Java Virtual Machine) và thư viện được sử dụng để chạy chương trình Java.

- **JDK (Java Development Kit)**: được biết đến như bộ cung cụ phát triển Java, bao gồm: trình biên dịch và trình gỡ rối được sử dụng để phát triển các ứng dụng Java.

