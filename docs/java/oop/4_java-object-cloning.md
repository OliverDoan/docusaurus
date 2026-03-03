# Object Cloning 


---

## Nội dung

1. [Copy là gì?](#1-copy-là-gì)
2. [Object Cloning](#2-object-cloning)
3. [Shallow Copy và Deep Copy](#3-shallow-copy-và-deep-copy)
4. [Ví dụ Shallow Cloning](#4-ví-dụ-shallow-cloning)
5. [Ví dụ Deep Cloning](#5-ví-dụ-deep-cloning)
6. [Ưu điểm và nhược điểm của Object Cloning](#6-ưu-điểm-và-nhược-điểm-của-object-cloning)
7. [Tổng kết](#7-tổng-kết)

---

## 1. Copy là gì?

Trong Java có **2 loại copy**:

- **Reference Copy (Copy tham chiếu)**
- **Object Copy (Copy toàn bộ object)**

---

### Reference Copy

Khi sử dụng toán tử `=` để copy, cả hai biến sẽ **tham chiếu cùng một vùng nhớ**.

```java
Student s1 = new Student(1, "GP Coder");
Student s2 = s1;
```

➡ Khi thay đổi `s1`, `s2` cũng thay đổi.

---

### Object Copy

Object Copy tạo ra **một object mới trong vùng nhớ khác**.

```java
Student s2 = new Student();
s2.id = s1.id;
s2.name = s1.name;
```

➡ Thay đổi object gốc **không ảnh hưởng** object copy.

---

## 2. Object Cloning

`Object Cloning` là quá trình **tạo object mới từ object đã tồn tại** trong bộ nhớ.

Trong Java, việc clone object được thực hiện bằng phương thức `clone()`.

```java
protected native Object clone() throws CloneNotSupportedException;
```

### Điều kiện sử dụng `clone()`

- Class phải `implements Cloneable`
- Nếu không sẽ xảy ra `CloneNotSupportedException`

---

## 3. Shallow Copy và Deep Copy

### Shallow Copy (Mặc định)

- Copy primitive & String
- Các field là object **vẫn trỏ cùng địa chỉ**
- Dễ gây lỗi logic

### Deep Copy

- Copy **toàn bộ object**
- Tất cả field object đều có địa chỉ mới
- An toàn hơn

📌 Mặc định `clone()` là **Shallow Copy**

---

## 4. Ví dụ Shallow Cloning

```java
class Person implements Cloneable {
    int id;
    String name;
    Address address;

    public Person clone() throws CloneNotSupportedException {
        return (Person) super.clone();
    }
}
```

➡ Field `address` vẫn trỏ chung vùng nhớ.

---

## 5. Ví dụ Deep Cloning

```java
class PersonDeepClone implements Cloneable {
    int id;
    AddressDeepClone address;

    public PersonDeepClone clone() throws CloneNotSupportedException {
        PersonDeepClone cloned = (PersonDeepClone) super.clone();
        cloned.address = this.address.clone();
        return cloned;
    }
}
```

```java
class AddressDeepClone implements Cloneable {
    public AddressDeepClone clone() throws CloneNotSupportedException {
        return (AddressDeepClone) super.clone();
    }
}
```

➡ Thay đổi object gốc **không ảnh hưởng** object clone.

---

## 6. Ưu điểm và nhược điểm của Object Cloning

### Ưu điểm

- Không cần gán từng field
- Tránh lặp code
- Hiệu suất tốt

### Nhược điểm

- Phải sửa code class
- Bắt buộc implements `Cloneable`
- `clone()` là `protected`
- Khó bảo trì với hệ thống kế thừa sâu

---

## 7. Tổng kết

- `clone()` giúp copy object nhanh
- Mặc định là **Shallow Copy**
- Muốn **Deep Copy** → override `clone()` cho tất cả field object
- Chỉ nên dùng khi hiểu rõ cấu trúc object
