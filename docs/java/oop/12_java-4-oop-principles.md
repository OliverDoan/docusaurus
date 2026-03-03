# 4 Tính Chất Của Lập Trình Hướng Đối Tượng


---

## 🧠 MỤC LỤC

1. [4 tính chất của lập trình hướng đối tượng trong Java](#4-tính-chất-của-lập-trình-hướng-đối-tượng-trong-java)
2. [Ví dụ minh họa tổng hợp](#ví-dụ-minh-họa-tổng-hợp)
3. [Phân tích 4 tính chất qua ví dụ](#phân-tích-4-tính-chất-qua-ví-dụ)
4. [Tổng kết](#tổng-kết)

---

## 4 tính chất của lập trình hướng đối tượng trong Java

### 1. Tính đóng gói (Encapsulation)

- Là kỹ thuật **che giấu thông tin** của đối tượng.
- Không cho phép truy cập trực tiếp vào trạng thái nội tại.
- Việc truy cập được kiểm soát thông qua **getter / setter**.
- Đảm bảo **tính toàn vẹn, bảo mật** của dữ liệu.

➡ Trong Java:
- Thể hiện thông qua **access modifier** (`private`, `protected`, `public`)
- Kết hợp với **package** để nhóm các class liên quan

---

### 2. Tính kế thừa (Inheritance)

- Cho phép tạo lớp mới dựa trên lớp đã tồn tại.
- Lớp con kế thừa **thuộc tính và phương thức** của lớp cha.
- Giúp **tái sử dụng code**, dễ mở rộng hệ thống.

➡ Trong Java:
- Sử dụng từ khóa `extends`
- Java **không hỗ trợ đa kế thừa với class**
- Có thể kế thừa nhiều interface

---

### 3. Tính đa hình (Polymorphism)

- Một hành vi có thể được thực hiện theo **nhiều cách khác nhau**.
- Cùng một phương thức nhưng **kết quả khác nhau** tùy đối tượng.

➡ Trong Java:
- **Overloading** (đa hình tại compile-time)
- **Overriding** (đa hình tại runtime)

---

### 4. Tính trừu tượng (Abstraction)

- Ẩn chi tiết cài đặt, chỉ hiển thị hành vi cần thiết.
- Giúp tập trung vào **cái gì làm**, không phải **làm thế nào**.

➡ Trong Java:
- `abstract class`
- `interface`

---

## Ví dụ minh họa tổng hợp

### Animal.java

```java
package com.gpcoder.oop;

public abstract class Animal {

    private String name;

    public Animal(String name) {
        this.name = name;
    }

    public abstract void sayHello();

    public String getName() {
        return name;
    }
}
```

### Cat.java

```java
package com.gpcoder.oop;

public class Cat extends Animal {

    public Cat(String name) {
        super(name);
    }

    @Override
    public void sayHello() {
        System.out.println("Hi, I'm " + super.getName());
    }
}
```

### Dog.java

```java
package com.gpcoder.oop;

public class Dog extends Animal {

    public Dog(String name) {
        super(name);
    }

    @Override
    public void sayHello() {
        System.out.println("Hello, I'm " + super.getName());
    }
}
```

### Zoo.java

```java
package com.gpcoder.oop;

import java.util.ArrayList;
import java.util.List;

public class Zoo {

    private List<Animal> animals = new ArrayList<>();

    public void add(Animal animal) {
        animals.add(animal);
    }

    public void remove(Animal animal) {
        animals.remove(animal);
    }

    public void showListAnimal() {
        for (Animal animal : animals) {
            animal.sayHello();
        }
    }
}
```

### OopDemo.java

```java
package com.gpcoder.oop;

public class OopDemo {

    public static void main(String[] args) {
        Cat cat = new Cat("Tom");
        Dog dog = new Dog("Milu");

        Zoo zoo = new Zoo();
        zoo.add(cat);
        zoo.add(dog);
        zoo.showListAnimal();
    }
}
```

### Kết quả

```
Hi, I'm Tom
Hello, I'm Milu
```

---

## Phân tích 4 tính chất qua ví dụ

- **Abstraction**: `Animal` định nghĩa hành vi `sayHello`
- **Encapsulation**: `name` là `private`, truy cập qua `getName()`
- **Inheritance**: `Cat`, `Dog` kế thừa `Animal`
- **Polymorphism**: `Zoo` gọi `sayHello()` nhưng kết quả khác nhau

---

## Tổng kết

- OOP giúp code:
  - Dễ mở rộng
  - Dễ bảo trì
  - Dễ tái sử dụng
- 4 tính chất OOP là nền tảng của:
  - Java Core
  - Spring Boot
  - Clean Architecture
