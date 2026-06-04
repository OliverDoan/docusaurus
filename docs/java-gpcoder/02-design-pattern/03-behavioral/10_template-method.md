---
sidebar_position: 10
title: "Template Method Pattern"
---

# Java Design Pattern - Template Method

## Mục đích

**Template Method** (Phương thức khuôn mẫu) là một mẫu thiết kế hành vi định nghĩa bộ khung (skeleton) của một thuật toán trong lớp cha (superclass), nhưng cho phép các lớp con (subclass) ghi đè một số bước cụ thể mà không thay đổi cấu trúc tổng thể của thuật toán.

## Vấn đề giải quyết

Khi nhiều lớp có thuật toán giống nhau về cấu trúc nhưng khác nhau ở một vài bước chi tiết. Thay vì copy-paste code, lớp cha định nghĩa trình tự các bước, lớp con chỉ cần triển khai các bước khác biệt. Ví dụ: quy trình pha đồ uống — trà và cà phê đều có bước "đun nước", "rót ra ly", nhưng khác nhau ở bước "pha" và "thêm gia vị".

## Cấu trúc

- **AbstractClass**: định nghĩa `templateMethod()` chứa bộ khung thuật toán (final), khai báo các bước trừu tượng.
- **ConcreteClass**: triển khai các bước cụ thể theo từng biến thể.

## Ví dụ Java: Quy trình pha đồ uống

```java
// AbstractClass
abstract class BeverageTemplate {

    // Template Method — final để ngăn lớp con thay đổi trình tự
    public final void prepare() {
        boilWater();
        brew();
        pourInCup();
        if (customerWantsCondiments()) {
            addCondiments();
        }
    }

    // Bước chung — đã có triển khai
    private void boilWater() {
        System.out.println("1. Đun nước sôi.");
    }

    private void pourInCup() {
        System.out.println("3. Rót vào ly.");
    }

    // Bước trừu tượng — lớp con phải triển khai
    protected abstract void brew();
    protected abstract void addCondiments();

    // Hook method (phương thức móc) — lớp con có thể ghi đè, mặc định là true
    protected boolean customerWantsCondiments() {
        return true;
    }
}

// ConcreteClass: Pha trà
class Tea extends BeverageTemplate {
    @Override
    protected void brew() {
        System.out.println("2. Ngâm túi trà trong nước sôi.");
    }

    @Override
    protected void addCondiments() {
        System.out.println("4. Thêm chanh.");
    }
}

// ConcreteClass: Pha cà phê (không thêm gia vị)
class Coffee extends BeverageTemplate {
    @Override
    protected void brew() {
        System.out.println("2. Lọc cà phê qua phin.");
    }

    @Override
    protected void addCondiments() {
        System.out.println("4. Thêm sữa và đường.");
    }

    // Ghi đè hook: không thêm gia vị
    @Override
    protected boolean customerWantsCondiments() {
        return false;
    }
}

// ConcreteClass: Pha cacao sữa
class HotChocolate extends BeverageTemplate {
    @Override
    protected void brew() {
        System.out.println("2. Hòa bột cacao với nước sôi.");
    }

    @Override
    protected void addCondiments() {
        System.out.println("4. Thêm marshmallow.");
    }
}

// Client
public class TemplateMethodDemo {
    public static void main(String[] args) {
        System.out.println("=== Pha Trà ===");
        new Tea().prepare();

        System.out.println("\n=== Pha Cà Phê (không gia vị) ===");
        new Coffee().prepare();

        System.out.println("\n=== Pha Cacao Sữa ===");
        new HotChocolate().prepare();
    }
}
```

**Kết quả:**
```
=== Pha Trà ===
1. Đun nước sôi.
2. Ngâm túi trà trong nước sôi.
3. Rót vào ly.
4. Thêm chanh.

=== Pha Cà Phê (không gia vị) ===
1. Đun nước sôi.
2. Lọc cà phê qua phin.
3. Rót vào ly.

=== Pha Cacao Sữa ===
1. Đun nước sôi.
2. Hòa bột cacao với nước sôi.
3. Rót vào ly.
4. Thêm marshmallow.
```

## Ưu điểm

- Loại bỏ code trùng lặp — phần chung đặt ở lớp cha.
- Đảm bảo trình tự thuật toán luôn đúng, lớp con chỉ thay đổi chi tiết.
- Dễ thêm biến thể mới bằng cách tạo lớp con.

## Nhược điểm

- Lớp con bị ràng buộc bởi bộ khung của lớp cha (nguyên tắc kế thừa).
- Vi phạm Liskov Substitution Principle nếu lớp con thay đổi hành vi quá nhiều.
- Khó debug khi bộ khung phức tạp và nhiều lớp con.

## Khi nào dùng

- Khi muốn định nghĩa bộ khung thuật toán một lần và để lớp con điền vào chi tiết.
- Khi các lớp có bước xử lý giống nhau về trình tự, chỉ khác chi tiết từng bước.
- Ví dụ thực tế: quy trình xây dựng báo cáo (đọc dữ liệu, xử lý, xuất file), `HttpServlet.service()` trong Java EE, `AbstractList` trong Java Collections Framework.
