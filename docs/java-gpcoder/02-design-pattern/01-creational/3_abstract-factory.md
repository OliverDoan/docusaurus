---
sidebar_position: 3
title: "Abstract Factory Pattern"
---

# Java Design Pattern - Abstract Factory

## Mục đích

**Abstract Factory Pattern** (mẫu nhà máy trừu tượng) là một **Creational Design Pattern** cung cấp một interface để tạo ra **họ các đối tượng liên quan** (families of related objects) mà không cần chỉ định lớp cụ thể của chúng. Đây là "nhà máy của các nhà máy".

## Vấn đề giải quyết

Khi hệ thống cần tạo nhiều đối tượng thuộc cùng một "họ" và cần đảm bảo tính nhất quán giữa các đối tượng đó.

Ví dụ: Một ứng dụng UI hỗ trợ nhiều giao diện (theme sáng / theme tối). Mỗi theme cần Button, TextField, Checkbox có cùng phong cách — nếu trộn lẫn Button của theme sáng với Checkbox của theme tối sẽ gây ra giao diện không nhất quán.

## Cấu trúc

- **AbstractFactory**: Interface khai báo các phương thức tạo từng loại product.
- **ConcreteFactory**: Lớp cụ thể tạo ra các product thuộc một họ nhất định.
- **AbstractProduct**: Interface cho từng loại product.
- **ConcreteProduct**: Lớp cụ thể của product.
- **Client**: Chỉ làm việc với AbstractFactory và AbstractProduct, không biết lớp cụ thể.

## Ví dụ Java

```java
// AbstractProduct A — giao diện Button
public interface Button {
    void render();
    void onClick();
}

// AbstractProduct B — giao diện Checkbox
public interface Checkbox {
    void render();
    boolean isChecked();
}

// ConcreteProduct — Button theme sáng
public class LightButton implements Button {
    @Override
    public void render() {
        System.out.println("Hiển thị Button [Nền trắng, chữ đen]");
    }

    @Override
    public void onClick() {
        System.out.println("LightButton: Được nhấn");
    }
}

// ConcreteProduct — Button theme tối
public class DarkButton implements Button {
    @Override
    public void render() {
        System.out.println("Hiển thị Button [Nền đen, chữ trắng]");
    }

    @Override
    public void onClick() {
        System.out.println("DarkButton: Được nhấn");
    }
}

// ConcreteProduct — Checkbox theme sáng
public class LightCheckbox implements Checkbox {
    private boolean checked = false;

    @Override
    public void render() {
        System.out.println("Hiển thị Checkbox [Theme sáng] - Trạng thái: " + checked);
    }

    @Override
    public boolean isChecked() {
        return checked;
    }
}

// ConcreteProduct — Checkbox theme tối
public class DarkCheckbox implements Checkbox {
    private boolean checked = true;

    @Override
    public void render() {
        System.out.println("Hiển thị Checkbox [Theme tối] - Trạng thái: " + checked);
    }

    @Override
    public boolean isChecked() {
        return checked;
    }
}

// AbstractFactory — nhà máy UI trừu tượng
public interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// ConcreteFactory — nhà máy tạo component theme sáng
public class LightThemeFactory implements UIFactory {
    @Override
    public Button createButton() {
        return new LightButton();
    }

    @Override
    public Checkbox createCheckbox() {
        return new LightCheckbox();
    }
}

// ConcreteFactory — nhà máy tạo component theme tối
public class DarkThemeFactory implements UIFactory {
    @Override
    public Button createButton() {
        return new DarkButton();
    }

    @Override
    public Checkbox createCheckbox() {
        return new DarkCheckbox();
    }
}

// Client — không biết gì về lớp cụ thể
public class Application {
    private final Button button;
    private final Checkbox checkbox;

    public Application(UIFactory factory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }

    public void render() {
        button.render();
        checkbox.render();
    }
}

// Điểm khởi động ứng dụng
public class Main {
    public static void main(String[] args) {
        String theme = "dark"; // lấy từ config

        UIFactory factory = "dark".equals(theme)
                ? new DarkThemeFactory()
                : new LightThemeFactory();

        Application app = new Application(factory);
        app.render();
    }
}
```

## So sánh với Factory Method

| Tiêu chí | Factory Method | Abstract Factory |
|---|---|---|
| Phạm vi | Tạo **một** loại product | Tạo **nhiều** loại product liên quan |
| Cơ chế | Kế thừa (subclass) | Composition (chứa factory) |
| Mục tiêu | Trì hoãn khởi tạo cho lớp con | Đảm bảo tính nhất quán giữa các product |

## Ưu điểm

- Đảm bảo tính nhất quán giữa các product trong cùng một họ.
- Loại bỏ sự phụ thuộc giữa code client và lớp product cụ thể.
- Dễ thêm họ product mới (thêm ConcreteFactory mới).

## Nhược điểm

- Thêm họ product mới dễ, nhưng thêm **loại product mới** vào AbstractFactory rất khó (phải sửa tất cả ConcreteFactory).
- Số lượng lớp và interface tăng đáng kể.

## Khi nào nên dùng

- Hệ thống cần hoạt động với nhiều họ product khác nhau (multi-theme UI, đa nền tảng).
- Cần đảm bảo rằng các product trong một họ luôn được dùng cùng nhau.
- Muốn che giấu chi tiết triển khai của các product khỏi client.
