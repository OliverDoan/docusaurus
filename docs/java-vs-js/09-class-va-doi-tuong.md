---
sidebar_position: 9
title: "9. Class & đối tượng"
---

# 9. Class & đối tượng (Classes & Objects)

:::note[Ghi nhớ nhanh]

- Java **không có object literal** `{ name: "An" }` tùy ý — mọi dữ liệu có cấu trúc phải qua một **class** định nghĩa trước.
- Mỗi field (thuộc tính) trong class phải khai báo **kiểu**.
- **Constructor** (hàm khởi tạo) giống JS nhưng đặt tên **trùng tên class**, không phải `constructor`.
- `this` giống JS nhưng **không bị "mất ngữ cảnh"** — luôn trỏ đúng object.
- Java dùng **`private` + getter/setter** để đóng gói (encapsulation); JS mới có `#private`.
- **`record`** (Java 16+) là cách viết class chứa dữ liệu cực gọn — gần với object literal nhất.

:::

---

## Object literal vs class

Bên JS bạn tạo object tức thì. Bên Java phải định nghĩa "khuôn" (class) trước:

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
// tạo object bất kỳ, tức thì
const user = {
  name: "An",
  age: 25,
};
console.log(user.name);
```

</td>
<td>

```java
// phải có class định nghĩa trước
class User {
    String name;
    int age;
}

User user = new User();
user.name = "An";
user.age = 25;
System.out.println(user.name);
```

</td>
</tr>
</table>

---

## Class đầy đủ với constructor

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Chào ${this.name}`;
  }
}

const u = new User("An", 25);
u.greet();
```

</td>
<td>

```java
class User {
    String name;
    int age;

    // constructor: TRÙNG tên class
    User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    String greet() {
        return "Chào " + this.name;
    }
}

User u = new User("An", 25);
u.greet();
```

</td>
</tr>
</table>

Rất giống nhau! Khác biệt chính:
- Constructor Java **trùng tên class** (`User`), không phải từ khóa `constructor`.
- Mỗi field và method phải khai báo **kiểu**.
- `new` thì cả hai đều dùng.

---

## Đóng gói: private + getter/setter

Trong Java, quy ước là để field **`private`** (chỉ truy cập được trong class) và cung cấp **getter/setter** (hàm đọc/ghi có kiểm soát):

```java
class User {
    private String name;   // ẩn khỏi bên ngoài

    public String getName() {         // getter
        return name;
    }

    public void setName(String name) { // setter
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
    }
}
```

JS truyền thống dùng object công khai; class JS mới có field `#private`. Nhưng "getter/setter khắp nơi" là văn hóa rất Java.

> `public` = ai cũng dùng được; `private` = chỉ trong class này. Đây là các **access modifier** (bổ từ truy cập) — sẽ nói kỹ ở [bài 10](./10-ke-thua-va-interface.md).

---

## `record` — gần nhất với object literal

Nếu bạn chỉ cần một "túi dữ liệu" (như object literal JS), Java 16+ có `record` cực gọn — tự tạo constructor, getter, `equals()`, `toString()`:

```java
record User(String name, int age) {}

User u = new User("An", 25);
u.name();   // "An"
u.age();    // 25
```

Đây là công cụ lý tưởng cho DTO (Data Transfer Object — object chỉ để chở dữ liệu), thay cho việc gõ cả class dài dòng.

---

## `this` — điểm dễ chịu hơn JS

`this` trong JS hay "mất ngữ cảnh" (mất `this` khi truyền callback, phải `.bind()` hoặc arrow function). Trong Java, `this` **luôn trỏ đúng** object hiện tại — không có cạm bẫy đó. Một điều bớt phải lo.
