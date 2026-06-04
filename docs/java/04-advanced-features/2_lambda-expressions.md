---
sidebar_position: 2
title: "2. Biểu thức Lambda (Lambda Expressions)"
---

# 2. Biểu thức Lambda (Lambda Expressions)

---

## Mục lục

- [Biểu thức Lambda là gì?](#biểu-thức-lambda-là-gì)
- [Cú pháp Lambda](#cú-pháp-lambda)
- [Functional Interface (giao diện hàm)](#functional-interface-giao-diện-hàm)
- [Lambda thay thế Anonymous Class](#lambda-thay-thế-anonymous-class)
- [Ví dụ với Runnable](#ví-dụ-với-runnable)
- [Ví dụ với Comparator](#ví-dụ-với-comparator)
- [Capture biến (bắt biến từ bên ngoài)](#capture-biến-bắt-biến-từ-bên-ngoài)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Biểu thức Lambda là gì?

**Biểu thức Lambda (Lambda Expression)** là một cách viết ngắn gọn để biểu diễn một hàm (function) ẩn danh — tức là một đoạn code có thể được truyền đi như một tham số. Nó được giới thiệu từ **Java 8**.

Hãy tưởng tượng bạn muốn nhờ ai đó làm một việc nhỏ. Thay vì viết cả một bản hợp đồng dài (như cách cũ), bạn chỉ cần ghi một mẩu giấy nhắn: "Hãy in ra dòng chữ Xin chào". Lambda chính là mẩu giấy nhắn ngắn gọn đó.

Trước Java 8, để truyền một hành vi (behavior) vào một phương thức, bạn phải viết rất nhiều code rườm rà. Lambda giúp việc này gọn hơn rất nhiều.

---

## Cú pháp Lambda

Cú pháp cơ bản gồm ba phần: **tham số**, **mũi tên `->`**, và **phần thân**.

```text
(thamSo1, thamSo2) -> { phầnThân }
```

Ví dụ cụ thể:

```java
public class ViDuCuPhap {
    public static void main(String[] args) {
        // Lambda không có tham số
        Runnable r = () -> System.out.println("Xin chào");

        // Lambda có một tham số (không cần ngoặc đơn nếu chỉ 1 tham số)
        // x -> x * x nghĩa là: nhận x, trả về x bình phương

        // Lambda có nhiều tham số và thân nhiều dòng
        java.util.function.BinaryOperator<Integer> cong = (a, b) -> {
            int tong = a + b; // Tính tổng hai số
            return tong;      // Trả về kết quả
        };

        r.run(); // In ra: Xin chào
        System.out.println(cong.apply(3, 5)); // In ra: 8
    }
}
```

Quy tắc rút gọn:

- Nếu chỉ có **một tham số**, có thể bỏ dấu ngoặc đơn: `x -> x * 2`.
- Nếu thân chỉ có **một dòng**, có thể bỏ dấu `{}` và `return`: `(a, b) -> a + b`.

---

## Functional Interface (giao diện hàm)

Lambda chỉ hoạt động với **Functional Interface (giao diện hàm)** — là một interface chỉ có **đúng một** phương thức trừu tượng (abstract method). Lambda chính là phần triển khai cho phương thức duy nhất đó.

```java
// Đánh dấu @FunctionalInterface để compiler kiểm tra giúp
@FunctionalInterface
interface PhepTinh {
    // Chỉ có DUY NHẤT một phương thức trừu tượng
    int tinh(int a, int b);
}

public class ViDuFunctionalInterface {
    public static void main(String[] args) {
        // Lambda triển khai phương thức tinh()
        PhepTinh cong = (a, b) -> a + b;
        PhepTinh nhan = (a, b) -> a * b;

        System.out.println(cong.tinh(4, 6)); // 10
        System.out.println(nhan.tinh(4, 6)); // 24
    }
}
```

Java cung cấp sẵn nhiều functional interface trong package `java.util.function` như `Function`, `Predicate`, `Consumer`, `Supplier`.

---

## Lambda thay thế Anonymous Class

**Anonymous Class (lớp ẩn danh)** là lớp không có tên, được tạo ngay tại chỗ. Trước Java 8, đây là cách phổ biến để truyền hành vi. Lambda giúp viết gọn hơn nhiều.

```java
public class ViDuSoSanh {
    public static void main(String[] args) {
        // CÁCH CŨ: dùng anonymous class - dài dòng
        Runnable cu = new Runnable() {
            @Override
            public void run() {
                System.out.println("Chạy bằng anonymous class");
            }
        };

        // CÁCH MỚI: dùng lambda - ngắn gọn
        Runnable moi = () -> System.out.println("Chạy bằng lambda");

        cu.run();
        moi.run();
    }
}
```

Cả hai làm cùng một việc, nhưng lambda chỉ cần một dòng thay vì sáu dòng.

---

## Ví dụ với Runnable

`Runnable` là một functional interface thường dùng để định nghĩa một tác vụ chạy trong luồng (thread).

```java
public class ViDuRunnable {
    public static void main(String[] args) {
        // Định nghĩa tác vụ bằng lambda
        Runnable tacVu = () -> {
            System.out.println("Đang chạy trong một luồng riêng");
        };

        // Tạo và khởi chạy luồng mới với tác vụ trên
        Thread luong = new Thread(tacVu);
        luong.start();

        System.out.println("Luồng chính vẫn tiếp tục chạy");
    }
}
```

---

## Ví dụ với Comparator

`Comparator` là functional interface dùng để so sánh, thường dùng khi sắp xếp danh sách.

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ViDuComparator {
    public static void main(String[] args) {
        List<String> ten = new ArrayList<>(List.of("Cường", "An", "Bình"));

        // Sắp xếp theo độ dài chuỗi bằng lambda
        // (s1, s2) -> so sánh độ dài của s1 và s2
        Collections.sort(ten, (s1, s2) -> s1.length() - s2.length());
        System.out.println("Sắp theo độ dài: " + ten);

        // Sắp xếp theo bảng chữ cái
        Collections.sort(ten, (s1, s2) -> s1.compareTo(s2));
        System.out.println("Sắp theo chữ cái: " + ten);
    }
}
```

---

## Capture biến (bắt biến từ bên ngoài)

Lambda có thể **capture (bắt)** — tức là sử dụng — các biến từ phạm vi bên ngoài. Tuy nhiên, biến đó phải là **final** hoặc **effectively final** (thực tế không thay đổi sau khi gán).

```java
public class ViDuCapture {
    public static void main(String[] args) {
        String loiChao = "Xin chào"; // Biến này thực tế không bị thay đổi
        int soLan = 3;

        // Lambda "bắt" biến loiChao và soLan từ bên ngoài
        Runnable inLoiChao = () -> {
            for (int i = 0; i < soLan; i++) {
                System.out.println(loiChao + " lần " + (i + 1));
            }
        };

        inLoiChao.run();

        // LƯU Ý: nếu gán lại loiChao = "Tạm biệt"; ở đây
        // thì compiler sẽ báo lỗi vì lambda đã bắt biến này
    }
}
```

Lý do của quy tắc này: lambda có thể chạy ở thời điểm khác (ví dụ trong luồng khác), nên Java yêu cầu biến được bắt phải có giá trị ổn định để tránh kết quả khó lường.

---

## Lỗi thường gặp

- **Dùng lambda với interface có nhiều phương thức trừu tượng**: lambda chỉ dùng được với functional interface (đúng một phương thức trừu tượng).
- **Thay đổi biến đã capture**: gán lại giá trị cho biến mà lambda đã bắt sẽ gây lỗi biên dịch.
- **Quên `return` trong thân nhiều dòng**: khi dùng dấu `{}`, nếu cần trả về giá trị thì phải viết `return` rõ ràng.
- **Viết quá phức tạp trong lambda**: nếu logic dài, hãy tách ra thành phương thức riêng để dễ đọc.
- **Nhầm `->` với toán tử khác**: dấu mũi tên `->` là đặc trưng của lambda, không phải phép toán.

---

## Tóm tắt

- **Biểu thức Lambda** là cách viết ngắn gọn cho một hàm ẩn danh, có từ Java 8.
- Cú pháp: `(tham số) -> { thân hàm }`, có thể rút gọn khi đơn giản.
- Lambda chỉ hoạt động với **Functional Interface** (interface có đúng một phương thức trừu tượng).
- Lambda thay thế **anonymous class** giúp code gọn hơn nhiều.
- Thường dùng với `Runnable`, `Comparator` và các interface trong `java.util.function`.
- Lambda có thể **capture** biến bên ngoài nhưng biến đó phải **effectively final**.
