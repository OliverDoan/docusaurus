---
sidebar_position: 1
title: "Adapter Pattern"
---

# Java Design Pattern - Adapter

Adapter là một mẫu thiết kế cấu trúc (structural) giúp hai đối tượng có giao diện không tương thích vẫn làm việc được với nhau. Nó hoạt động như một bộ chuyển đổi đứng ở giữa để "dịch" lời gọi, giống như cục chuyển đổi phích cắm điện khi đi nước ngoài. Mẫu này rất hữu ích khi cần tích hợp thư viện bên thứ ba hoặc tái sử dụng code cũ. Bài này giới thiệu khái niệm tổng quan; phần chi tiết với ví dụ Java nằm bên dưới.

## Mục đích

Adapter (hay còn gọi là Wrapper) là một **Structural Design Pattern** (mẫu thiết kế cấu trúc) cho phép các đối tượng có interface (giao diện) không tương thích có thể làm việc cùng nhau. Pattern này hoạt động như một "bộ chuyển đổi" — giống như bộ chuyển đổi phích cắm điện khi bạn đi du lịch nước ngoài.

## Vấn đề giải quyết

Trong thực tế lập trình, bạn thường gặp tình huống:

- Cần tích hợp một thư viện bên thứ ba (third-party library) vào hệ thống có sẵn, nhưng interface của thư viện đó không khớp với interface hệ thống đang dùng.
- Muốn tái sử dụng (reuse) một class cũ nhưng interface của nó không phù hợp với code mới.
- Cần kết nối hai hệ thống được xây dựng độc lập với nhau.

Thay vì sửa đổi code gốc (có thể gây rủi ro hoặc không thể sửa do là thư viện), ta tạo một lớp Adapter ở giữa để "dịch" các lời gọi.

## Cấu trúc

Adapter Pattern gồm các thành phần chính:

- **Target**: Interface mà client (phía gọi) mong đợi.
- **Adaptee**: Class hiện có với interface không tương thích, cần được "bọc" lại.
- **Adapter**: Class trung gian, implement Target và bên trong gọi đến Adaptee.
- **Client**: Sử dụng Target interface, không biết gì về Adapter hay Adaptee.

## Ví dụ Java

Giả sử hệ thống cũ dùng `RoundHole` (lỗ tròn) và `RoundPeg` (chốt tròn), nhưng ta cần dùng `SquarePeg` (chốt vuông).

```java
// Target interface - hệ thống hiện tại mong đợi
interface RoundPeg {
    double getRadius();
}

// Class cũ không tương thích (Adaptee)
class SquarePeg {
    private double width;

    public SquarePeg(double width) {
        this.width = width;
    }

    public double getWidth() {
        return width;
    }
}

// Adapter: bọc SquarePeg để phù hợp với RoundPeg
class SquarePegAdapter implements RoundPeg {
    private SquarePeg squarePeg;

    public SquarePegAdapter(SquarePeg squarePeg) {
        this.squarePeg = squarePeg;
    }

    @Override
    public double getRadius() {
        // Tính bán kính đường tròn ngoại tiếp hình vuông
        return Math.sqrt(Math.pow(squarePeg.getWidth() / 2, 2) * 2);
    }
}

// RoundHole - Client chỉ biết về RoundPeg
class RoundHole {
    private double radius;

    public RoundHole(double radius) {
        this.radius = radius;
    }

    public boolean fits(RoundPeg peg) {
        return this.radius >= peg.getRadius();
    }
}

// Demo sử dụng
public class AdapterDemo {
    public static void main(String[] args) {
        RoundHole hole = new RoundHole(5);

        // SquarePeg không dùng trực tiếp được với RoundHole
        SquarePeg smallSquare = new SquarePeg(5);
        SquarePeg largeSquare = new SquarePeg(10);

        // Dùng Adapter để tương thích
        SquarePegAdapter smallAdapter = new SquarePegAdapter(smallSquare);
        SquarePegAdapter largeAdapter = new SquarePegAdapter(largeSquare);

        System.out.println("Chốt vuông 5 vừa lỗ: " + hole.fits(smallAdapter));  // true
        System.out.println("Chốt vuông 10 vừa lỗ: " + hole.fits(largeAdapter)); // false
    }
}
```

## Ưu điểm

- **Single Responsibility Principle**: Tách biệt code chuyển đổi khỏi business logic chính.
- **Open/Closed Principle**: Thêm Adapter mới mà không sửa code Client hay Adaptee.
- Tái sử dụng được class cũ mà không cần sửa đổi chúng.
- Dễ tích hợp thư viện bên thứ ba vào hệ thống.

## Nhược điểm

- Tăng số lượng class trong hệ thống, làm code phức tạp hơn.
- Nếu có nhiều lớp cần adapter, việc quản lý trở nên khó khăn.
- Đôi khi việc thay đổi Adaptee để phù hợp trực tiếp đơn giản hơn là tạo Adapter.

## Khi nào nên dùng

- Khi muốn tái sử dụng class có sẵn nhưng interface không tương thích.
- Khi cần tích hợp nhiều subclass (lớp con) có chức năng tương tự nhưng interface khác nhau.
- Khi cần kết nối hệ thống hiện tại với thư viện hoặc API bên ngoài.
- Phổ biến trong các framework Java như `Arrays.asList()`, `InputStreamReader` wrapping `InputStream`.
