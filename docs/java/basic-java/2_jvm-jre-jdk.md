---
sidebar_position: 2
---

# Phân biệt JVM, JRE và JDK

Trong bài này, chúng ta sẽ tìm hiểu về **JVM**, **JRE** và **JDK** — ba thành phần cốt lõi của nền tảng Java:  
- Chúng là gì?  
- Gồm những thành phần nào?  
- Nhiệm vụ của từng phần là gì?

---

## Nội dung

1. [JVM (Java Virtual Machine)](#1-jvm-java-virtual-machine)  
2. [JRE (Java Runtime Environment)](#2-jre-java-runtime-environment)  
3. [JDK (Java Development Kit)](#3-jdk-java-development-kit)  
4. [So sánh JVM – JRE – JDK](#4-so-sánh-jvm--jre--jdk)  
5. [Kết luận](#5-kết-luận)  

---
![Java Overview](/img/java/jvm-jre-jdk-1.png)

## 1. JVM (Java Virtual Machine)

**JVM** là máy ảo Java dùng để **thực thi mã bytecode (.class)**.

- Là phần mềm **giả lập một máy tính** thu nhỏ.  
- Chuyển **bytecode** → **mã máy thực** tùy theo nền tảng (Windows, MacOS, Linux…).  
- Cung cấp **môi trường chạy** cho chương trình Java (runtime environment).  
- Giúp Java đạt được tính **khả chuyển** (*write once, run anywhere*).

JVM có 4 vai trò quan trọng:

1️⃣ **Load code** – Nạp bytecode vào bộ nhớ  
2️⃣ **Verify code** – Kiểm tra bytecode có hợp lệ & an toàn  
3️⃣ **Execute code** – Thực thi mã  
4️⃣ **Provide runtime environment** – Cung cấp môi trường chạy (bộ nhớ Heap, Stack, GC…)

 JVM có sẵn trên nhiều nền tảng
- Windows JVM  
- Linux JVM  
- macOS JVM  
→ Nhờ vậy Java có thể chạy trên bất kỳ nền tảng nào có JVM.

---

## 2. JRE (Java Runtime Environment)

**JRE** là môi trường chạy Java.  
Nó gồm:

- **JVM**  
- **Các thư viện chuẩn (Java Class Libraries)**  
- **Các file hỗ trợ runtime**

👉 **JRE dùng để *chạy* ứng dụng Java (Java Application)**  
❌ Nhưng **không có công cụ để *biên dịch***.

Nếu bạn chỉ muốn chạy ứng dụng Java → **chỉ cần JRE**.

---

## 3. JDK (Java Development Kit)

**JDK** là bộ công cụ để **phát triển** ứng dụng Java.

JDK = **JRE + Công cụ lập trình (Development Tools)**

| Công cụ | Chức năng |
|--------|-----------|
| **javac** | Trình biên dịch `.java` → `.class` (bytecode) |
| **java** | Thực thi chương trình Java (gọi JVM để chạy) |
| **jar** | Đóng gói file thành `.jar` |
| **javadoc** | Tạo tài liệu API từ comment trong mã nguồn |
| **jdb** | Trình gỡ lỗi (debugger) |
| **appletviewer** | Chạy chương trình Java Applet |
| **rmic** | Tạo stub cho ứng dụng RMI |
| **rmiregistry** | Server danh bạ trong hệ thống RMI |

👉 **Nếu bạn lập trình Java → bạn luôn cần JDK.**

---

## 4. So sánh JVM – JRE – JDK

| Thành phần | JVM | JRE | JDK |
|-----------|-----|-----|-----|
| Chạy chương trình Java | ✔ | ✔ | ✔ |
| Thư viện Java | ✖ | ✔ | ✔ |
| Công cụ lập trình (javac, jdb…) | ✖ | ✖ | ✔ |
| Dành cho | Người chạy app | Người chạy app | Lập trình viên |
| Bao gồm | JVM | JVM + libs | JRE + công cụ dev |

---

## 5. Kết luận

- **JVM**: chạy bytecode  
- **JRE**: JVM + thư viện để chạy Java  
- **JDK**: JRE + công cụ để phát triển Java  

👉 Nếu chỉ chạy ứng dụng → Cài **JRE**  
👉 Nếu lập trình Java → Cài **JDK**

---

