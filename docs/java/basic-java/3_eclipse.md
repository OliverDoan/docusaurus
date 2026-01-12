---
sidebar_position: 3
---
# Sử dụng Eclipse IDE

## Giới thiệu
Eclipse IDE là một trong những môi trường phát triển tích hợp (IDE) phổ biến nhất cho Java.  
IDE này cung cấp nhiều công cụ hỗ trợ lập trình viên viết code hiệu quả hơn.

---

## Nội dung

1. [Tạo Java Project](#1-tạo-java-project)  
2. [Tạo Class có hàm main](#2-tạo-class-có-hàm-main)  
3. [Viết chương trình Java đầu tiên](#3-viết-chương-trình-java-đầu-tiên)  
4. [Chạy chương trình](#4-chạy-chương-trình)  
5. [Các phím tắt cơ bản trong Eclipse IDE](#5-các-phím-tắt-cơ-bản-trong-eclipse-ide)  

---

### 1. Tạo Java Project
![Java Overview](/img/java/3_eclipse_1.png)

### 2. Tạo Class có hàm main
![Java Overview](/img/java/3_eclipse_2.png)


### 3. Viết chương trình Java đầu tiên

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Xin chào Eclipse IDE!");
    }
}
```

### 4. Chạy chương trình
- Chuột phải vào file Main.java
- Run As → Java Application
- Kết quả hiển thị ở Console

### 5. Các phím tắt cơ bản trong Eclipse IDE

Dưới đây là danh sách các **phím tắt Eclipse quan trọng nhất** giúp tăng tốc độ lập trình và thao tác trong IDE.

---

1. Gợi ý code – **Ctrl + Space**
2. Format code – **Ctrl + Shift + F**
3. Xóa import thừa – **Ctrl + Shift + O**
4. Xem danh sách phương thức – **Ctrl + O**
5. Nhảy đến dòng – **Ctrl + L**
6. Tìm file/Class/Resource – **Ctrl + Shift + R**
7. Tìm nhanh theo từ khóa – **Ctrl + Shift + L**
8. Refactor tên biến – **Alt + Shift + R**
9. Một số phím tắt khác

| Chức năng | Phím tắt |
|-----------|----------|
| Chạy chương trình | **Ctrl + F11** |
| Tạo nhanh getter/setter | **Alt + Shift + S → R** |
| Tạo nhanh constructor | **Alt + Shift + S → O** |
| Di chuyển dòng lên | **Alt + ↑** |
| Di chuyển dòng xuống | **Alt + ↓** |
| Sao chép dòng | **Ctrl + Alt + ↓** |
| Comment dòng | **Ctrl + /** |
| Uncomment dòng | **Ctrl + \\** |
| Comment block | **Ctrl + Shift + /** |
| Uncomment block | **Ctrl + Shift + \\** |
| Mở khai báo (go to definition) | **F3** |
| Tìm occurrences (biến, method…) | **Ctrl + Shift + G** |
| Mở Quick Fix | **Ctrl + 1** |

---
