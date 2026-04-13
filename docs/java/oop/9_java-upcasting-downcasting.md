---
sidebar_position: 9
title: "9. Upcasting và Downcasting"
---

# Upcasting và Downcasting

Trong cuộc sống, mọi **con chó** đều là **động vật**, nhưng không phải mọi **động vật** đều là **con chó**. Trong Java cũng vậy — bạn có thể gọi Dog là Animal (upcasting), nhưng gọi Animal là Dog (downcasting) thì phải cẩn thận. Bài này giải thích chi tiết cơ chế ép kiểu trong kế thừa.

---

## 1. Type Casting trong OOP là gì?

Trong Java, khi các class có quan hệ kế thừa (IS-A), bạn có thể chuyển đổi kiểu giữa parent và child class.

```java
class Animal {
    void eat() {
        System.out.println("Animal đang ăn");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Gâu gâu!");
    }
}

class Cat extends Animal {
    void meow() {
        System.out.println("Meo meo!");
    }
}
```

| Loại | Hướng chuyển | Tính chất | Cú pháp |
|---|---|---|---|
| **Upcasting** | Child → Parent | Ngầm định, luôn an toàn | `Animal a = new Dog();` |
| **Downcasting** | Parent → Child | Tường minh, có rủi ro | `Dog d = (Dog) animal;` |

---

## 2. Upcasting (Child → Parent)

**Upcasting** là chuyển reference từ **child type** sang **parent type**. Nó xảy ra **tự động** (implicit) và **luôn an toàn** vì con luôn là cha (Dog IS-A Animal).

```java
// Upcasting — tự động, không cần ép kiểu
Animal animal = new Dog(); // Dog → Animal

animal.eat();   // OK — Animal có method eat()
// animal.bark(); // Lỗi compile! Animal không biết bark()
```

### Tại sao upcasting hữu ích?

Upcasting là nền tảng của **đa hình** (polymorphism):

```java
// Không cần upcasting — phải viết method cho từng loại
void feedDog(Dog dog) { dog.eat(); }
void feedCat(Cat cat) { cat.eat(); }
void feedBird(Bird bird) { bird.eat(); }

// Với upcasting — một method xử lý tất cả!
void feedAnimal(Animal animal) {
    animal.eat(); // Polymorphism — gọi đúng method của object thực tế
}

feedAnimal(new Dog()); // Upcasting Dog → Animal
feedAnimal(new Cat()); // Upcasting Cat → Animal
```

### Upcasting trong collection

```java
// Một List chứa nhiều loại Animal
List<Animal> zoo = new ArrayList<>();
zoo.add(new Dog());   // Upcasting
zoo.add(new Cat());   // Upcasting

for (Animal animal : zoo) {
    animal.eat(); // Polymorphism
}
```

### Upcasting và method overriding

```java
class Animal {
    void sound() {
        System.out.println("...");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Gâu gâu!");
    }
}

Animal a = new Dog(); // Upcasting
a.sound(); // "Gâu gâu!" — gọi method của Dog (runtime polymorphism)
```

**Quan trọng:** Upcasting thay đổi **kiểu reference** (compile-time type), nhưng **object thực tế** (runtime type) không đổi. Method overriding vẫn gọi đúng method của object thực tế.

---

## 3. Downcasting (Parent → Child)

**Downcasting** là chuyển reference từ **parent type** sang **child type**. Nó **không tự động** — phải ép kiểu tường minh (explicit cast) và **có rủi ro**.

```java
Animal animal = new Dog(); // Upcasting trước

// Downcasting — phải ép kiểu tường minh
Dog dog = (Dog) animal; // OK vì object thực tế là Dog
dog.bark(); // "Gâu gâu!" — Giờ có thể gọi bark()
```

### Khi nào downcasting thất bại?

```java
Animal animal = new Cat(); // Object thực tế là Cat

Dog dog = (Dog) animal; // ClassCastException! Cat không phải Dog!
```

**`ClassCastException`** xảy ra khi object thực tế không phải kiểu bạn ép sang. Đây là **runtime error** — compiler không phát hiện được.

---

## 4. Kiểm tra an toàn với instanceof

**Luôn dùng `instanceof`** trước khi downcasting:

```java
Animal animal = getAnimalFromSomewhere(); // Không biết là Dog hay Cat

if (animal instanceof Dog) {
    Dog dog = (Dog) animal; // An toàn vì đã kiểm tra
    dog.bark();
} else if (animal instanceof Cat) {
    Cat cat = (Cat) animal;
    cat.meow();
}
```

### Pattern Matching instanceof (Java 16+)

Java 16 giúp gọn hơn — kết hợp kiểm tra và ép kiểu trong một bước:

```java
Animal animal = new Dog();

// Cũ: kiểm tra rồi ép kiểu
if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.bark();
}

// Mới (Java 16+): kết hợp trong một dòng
if (animal instanceof Dog dog) {
    dog.bark(); // Biến dog đã sẵn sàng!
}
```

---

## 5. Ví dụ thực tế: Hệ thống thanh toán

```java
abstract class Payment {
    abstract void pay(double amount);
}

class CreditCard extends Payment {
    private String cardNumber;

    CreditCard(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    @Override
    void pay(double amount) {
        System.out.println("Thanh toán " + amount + " bằng thẻ " + cardNumber);
    }

    void showRewards() {
        System.out.println("Điểm thưởng: 150");
    }
}

class BankTransfer extends Payment {
    private String bankName;

    BankTransfer(String bankName) {
        this.bankName = bankName;
    }

    @Override
    void pay(double amount) {
        System.out.println("Chuyển khoản " + amount + " qua " + bankName);
    }

    void showTransactionId() {
        System.out.println("Mã GD: TXN-" + System.currentTimeMillis());
    }
}
```

### Sử dụng

```java
public class PaymentProcessor {
    // Upcasting — nhận mọi loại Payment
    static void processPayment(Payment payment, double amount) {
        payment.pay(amount); // Polymorphism

        // Downcasting — xử lý riêng từng loại
        if (payment instanceof CreditCard card) {
            card.showRewards();
        } else if (payment instanceof BankTransfer transfer) {
            transfer.showTransactionId();
        }
    }

    public static void main(String[] args) {
        processPayment(new CreditCard("4111-1111"), 500);
        // Thanh toán 500.0 bằng thẻ 4111-1111
        // Điểm thưởng: 150

        processPayment(new BankTransfer("Vietcombank"), 1000);
        // Chuyển khoản 1000.0 qua Vietcombank
        // Mã GD: TXN-1712345678
    }
}
```

---

## 6. Upcasting/Downcasting với Interface

```java
interface Flyable {
    void fly();
}

class Bird extends Animal implements Flyable {
    @Override
    void eat() {
        System.out.println("Chim ăn hạt");
    }

    @Override
    public void fly() {
        System.out.println("Chim đang bay");
    }
}

// Upcasting sang interface
Flyable flyer = new Bird(); // Bird → Flyable
flyer.fly();                // OK
// flyer.eat();             // Lỗi! Flyable không có eat()

// Downcasting từ interface
if (flyer instanceof Bird bird) {
    bird.eat(); // OK sau khi downcasting
}
```

---

## 7. Tổng kết

| Tiêu chí | Upcasting | Downcasting |
|---|---|---|
| **Hướng** | Child → Parent | Parent → Child |
| **Cú pháp** | Ngầm định (implicit) | Tường minh (explicit) |
| **An toàn** | Luôn an toàn | Có thể `ClassCastException` |
| **Mục đích** | Đa hình, xử lý chung | Truy cập method riêng của child |
| **Kiểm tra** | Không cần | Dùng `instanceof` trước |
| **Ví dụ** | `Animal a = new Dog();` | `Dog d = (Dog) animal;` |

---

## 8. Lỗi thường gặp

### Lỗi 1: Downcasting không kiểm tra instanceof

```java
// SAI — ClassCastException nếu animal không phải Dog
void process(Animal animal) {
    Dog dog = (Dog) animal; // Nguy hiểm!
    dog.bark();
}

// ĐÚNG — Kiểm tra trước
void process(Animal animal) {
    if (animal instanceof Dog dog) {
        dog.bark();
    }
}
```

### Lỗi 2: Nghĩ upcasting mất method của child

```java
Animal a = new Dog();
a.eat(); // Gọi eat() của Dog (nếu Dog override) — KHÔNG mất!
// Method overriding vẫn hoạt động sau upcasting
// Chỉ không thể gọi method MỚI (bark()) mà Animal không khai báo
```

### Lỗi 3: Ép kiểu giữa hai class không liên quan

```java
// SAI — Dog và Cat không có quan hệ kế thừa với nhau
Dog dog = new Dog();
Cat cat = (Cat) dog; // Lỗi compile! Incompatible types

// Chỉ có thể cast trong cùng cây kế thừa:
// Animal → Dog (downcasting) hoặc Dog → Animal (upcasting)
```

### Lỗi 4: Nhầm lẫn compile-time type và runtime type

```java
Animal a = new Dog(); // compile-time type: Animal, runtime type: Dog
a.eat();   // Compiler check: Animal có eat()? Có → OK
           // Runtime: Object là Dog, Dog override eat()? Có → Gọi Dog.eat()
// a.bark(); // Compiler check: Animal có bark()? Không → Lỗi compile!
```

---

## 9. Câu hỏi phỏng vấn

### Câu 1: Upcasting và downcasting khác nhau thế nào?

**Trả lời:** Upcasting là chuyển reference từ child sang parent type, xảy ra ngầm định và luôn an toàn (vì child IS-A parent). Downcasting là chuyển từ parent sang child type, phải ép kiểu tường minh và có thể gây `ClassCastException` nếu object thực tế không phải kiểu được ép. Upcasting phục vụ đa hình, downcasting phục vụ truy cập method đặc thù của child.

### Câu 2: Tại sao upcasting luôn an toàn?

**Trả lời:** Vì trong quan hệ kế thừa, child class **có tất cả** những gì parent class có (thừa hưởng fields và methods). Nên khi gán child vào biến parent type, mọi method của parent đều tồn tại trong child — không thể gọi method không tồn tại. Ví dụ: Dog có `eat()` (từ Animal) lẫn `bark()` (riêng). Khi upcasting sang Animal, chỉ gọi được `eat()` — vẫn an toàn.

### Câu 3: ClassCastException xảy ra khi nào? Cách phòng tránh?

**Trả lời:** `ClassCastException` xảy ra khi downcasting sai — object thực tế không phải kiểu được ép. Ví dụ: `Animal a = new Cat(); Dog d = (Dog) a;` sẽ ném exception vì Cat không phải Dog. Phòng tránh bằng cách luôn kiểm tra `instanceof` trước khi downcasting: `if (a instanceof Dog d) { d.bark(); }`.

### Câu 4: Compile-time type và runtime type khác nhau thế nào?

**Trả lời:** **Compile-time type** (static type) là kiểu khai báo của biến — compiler dùng để kiểm tra method nào có thể gọi. **Runtime type** (dynamic type) là kiểu của object thực tế — JVM dùng để quyết định gọi method override nào. Ví dụ: `Animal a = new Dog()` — compile-time type là `Animal` (chỉ gọi được method của Animal), runtime type là `Dog` (method override của Dog được gọi).

### Câu 5: Cho đoạn code sau, output là gì?

```java
class A {
    void show() { System.out.println("A"); }
}
class B extends A {
    void show() { System.out.println("B"); }
}
class C extends B {
    void show() { System.out.println("C"); }
}

A obj = new C();
obj.show();
```

**Trả lời:** Output là `"C"`. Biến `obj` có compile-time type là `A` nhưng runtime type là `C`. Khi gọi `obj.show()`, JVM dùng **dynamic dispatch** — tìm method `show()` trong class `C` (runtime type). `C` override `show()` nên in ra `"C"`. Đây là **runtime polymorphism** kết hợp upcasting.
