---
sidebar_position: 24
title: "24. Truyền giá trị và tham chiếu"
---

# Truyền giá trị và tham chiếu

## Giới thiệu
Một trong những chủ đề **dễ gây nhầm lẫn nhất** với người học Java là:
> Java truyền **giá trị** hay **tham chiếu** khi gọi phương thức?

Câu trả lời ngắn gọn:
👉 **Java luôn truyền theo giá trị (pass-by-value)**  
Nhưng giá trị đó **có thể là tham chiếu của object**.

Tài liệu này giải thích rõ ràng khái niệm trên bằng **ví dụ trực quan**, đúng theo nội dung bài GP Coder.

---

## Nội dung

1. [Truyền giá trị là gì?](#1-truyền-giá-trị-là-gì)  
2. [Truyền tham chiếu là gì?](#2-truyền-tham-chiếu-là-gì)  
3. [Truyền tham trị với kiểu nguyên thủy](#3-truyền-tham-trị-với-kiểu-nguyên-thủy)  
4. [Truyền object trong Java](#4-truyền-object-trong-java)  
5. [Thay đổi thuộc tính của object](#5-thay-đổi-thuộc-tính-của-object)  
6. [Gán object mới trong phương thức](#6-gán-object-mới-trong-phương-thức)  
7. [Kết luận: Java truyền gì?](#7-kết-luận-java-truyền-gì)  

---

## 1. Truyền giá trị là gì?

**Truyền giá trị (pass-by-value)**:
- Sao chép **giá trị của biến**
- Phương thức nhận **bản sao**
- Thay đổi bên trong **không ảnh hưởng** bên ngoài

---

## 2. Truyền tham chiếu là gì?

**Truyền tham chiếu (pass-by-reference)**:
- Truyền **địa chỉ vùng nhớ**
- Thay đổi bên trong ảnh hưởng trực tiếp bên ngoài

⚠️ **Java KHÔNG hỗ trợ truyền tham chiếu thực sự**.

---

## 3. Truyền tham trị với kiểu nguyên thủy

```java
public static void change(int x) {
    x = 100;
}

public static void main(String[] args) {
    int a = 10;
    change(a);
    System.out.println(a);
}
```

👉 Kết quả:
```
10
```

📌 `a` không đổi vì:
- `x` nhận **bản sao của a**
- Thay đổi `x` không ảnh hưởng `a`

---

## 4. Truyền object trong Java

```java
class Person {
    String name;
}

public static void change(Person p) {
    p.name = "John";
}

public static void main(String[] args) {
    Person p = new Person();
    p.name = "Alex";

    change(p);
    System.out.println(p.name);
}
```

👉 Kết quả:
```
John
```

📌 Vì:
- Java truyền **bản sao của tham chiếu**
- Cả `p` trong main và method **trỏ cùng object**

---

## 5. Thay đổi thuộc tính của object

```java
void update(Person p) {
    p.name = "New Name";
}
```

✔ Object bị thay đổi  
✔ Áp dụng với mọi object

---

## 6. Gán object mới trong phương thức

```java
void reset(Person p) {
    p = new Person();
    p.name = "Reset";
}
```

```java
Person p = new Person();
p.name = "Old";
reset(p);
System.out.println(p.name);
```

👉 Kết quả:
```
Old
```

📌 Vì:
- `p` trong method trỏ object mới
- `p` ngoài method **không bị ảnh hưởng**

---

## 7. Kết luận: Java truyền gì?

👉 **Java luôn truyền theo giá trị**

- Với kiểu nguyên thủy → giá trị là **dữ liệu**
- Với object → giá trị là **tham chiếu**
- Không có pass-by-reference như C++

---

## Tổng kết

- Java **không truyền tham chiếu**
- Object có thể bị thay đổi vì cùng trỏ vùng nhớ
- Gán object mới trong method **không ảnh hưởng bên ngoài**
- Hiểu rõ vấn đề này giúp:
  - Tránh bug khó hiểu
  - Hiểu sâu OOP
  - Phỏng vấn Java tự tin hơn
