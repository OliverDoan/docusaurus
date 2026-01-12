# Marker Interface trong Java

## Giới thiệu
**Marker Interface** (hay Tagging Interface) là interface **không chứa method**,
dùng để **đánh dấu (mark)** một class.

JVM hoặc framework sẽ dựa vào marker này để **thay đổi hành vi xử lý**.

---

## Nội dung

1. [Marker Interface là gì?](#1-marker-interface-là-gì)  
2. [Built-in Marker Interface trong Java](#2-built-in-marker-interface-trong-java)  
3. [Khi nào nên dùng Marker Interface?](#3-khi-nào-nên-dùng-marker-interface)  
4. [Custom Marker Interface](#4-custom-marker-interface)  
5. [Marker Interface vs Annotation](#5-marker-interface-vs-annotation)  

---

## 1. Marker Interface là gì?

```java
public interface Marker { }
```

Class implement marker:

```java
class MyClass implements Marker { }
```

---

## 2. Built-in Marker Interface trong Java

- `Serializable`
- `Cloneable`
- `RandomAccess`

```java
if (obj instanceof Serializable) {
    // xử lý đặc biệt
}
```

---

## 3. Khi nào nên dùng Marker Interface?

- Đánh dấu class
- Kiểm tra bằng `instanceof`
- Thay đổi logic xử lý

---

## 4. Custom Marker Interface

```java
interface Loggable { }

class Service implements Loggable { }
```

---

## 5. Marker Interface vs Annotation

| Marker Interface | Annotation |
|-----------------|------------|
| instanceof | Reflection |
| Ít linh hoạt | Linh hoạt |
| API cũ | Java hiện đại |

---

## Tổng kết

- Marker Interface là kỹ thuật cũ nhưng vẫn quan trọng
- Annotation thường được ưu tiên hơn hiện nay
