---
sidebar_position: 6
title: "6. Dependency Injection (Tiêm phụ thuộc)"
---

# 6. Dependency Injection (Tiêm phụ thuộc)

Dependency Injection (DI) là kỹ thuật cho một đối tượng nhận các thứ nó cần từ bên ngoài, thay vì tự tạo chúng bên trong. Nhờ vậy code dễ thay đổi, dễ kiểm thử và bớt gắn kết chặt với nhau. Bài này giới thiệu khái niệm tổng quan, Constructor Injection và IoC; chi tiết và ví dụ nằm bên dưới.

---

## Mục lục

- [Dependency Injection là gì?](#dependency-injection-là-gì)
- [Vấn đề khi tự tạo phụ thuộc bên trong](#vấn-đề-khi-tự-tạo-phụ-thuộc-bên-trong)
- [Constructor Injection (tiêm qua hàm dựng)](#constructor-injection-tiêm-qua-hàm-dựng)
- [Inversion of Control (đảo ngược điều khiển)](#inversion-of-control-đảo-ngược-điều-khiển)
- [Lợi ích cho việc kiểm thử (testing)](#lợi-ích-cho-việc-kiểm-thử-testing)
- [Spring làm việc này tự động](#spring-làm-việc-này-tự-động)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Dependency Injection là gì?

**Dependency Injection (DI — tiêm phụ thuộc)** là một kỹ thuật mà ở đó một đối tượng **nhận** các phụ thuộc (dependency — những thứ nó cần để hoạt động) **từ bên ngoài**, thay vì **tự tạo** chúng bên trong.

**Phụ thuộc (dependency)** là bất kỳ đối tượng nào mà một lớp cần dùng để làm việc. Ví dụ, một lớp `OrderService` (xử lý đơn hàng) cần một lớp `PaymentService` (xử lý thanh toán) để hoạt động — `PaymentService` là một phụ thuộc của `OrderService`.

Hãy tưởng tượng một đầu bếp. Đầu bếp cần nguyên liệu để nấu ăn:

- **Không có DI**: đầu bếp tự ra vườn trồng rau, tự nuôi gà — tự lo mọi nguyên liệu. Vất vả và cứng nhắc.
- **Có DI**: đầu bếp được người khác **giao sẵn** nguyên liệu tận tay. Đầu bếp chỉ tập trung nấu. Hôm nay giao gà, mai giao cá — linh hoạt.

DI chính là việc "giao nguyên liệu tận tay" cho đối tượng.

---

## Vấn đề khi tự tạo phụ thuộc bên trong

Xem ví dụ lớp `OrderService` tự tạo phụ thuộc bên trong:

```java
// CÁCH KHÔNG TỐT: tự tạo phụ thuộc bên trong
class PaymentService {
    void thanhToan(double soTien) {
        System.out.println("Thanh toán qua thẻ: " + soTien);
    }
}

class OrderService {
    // OrderService TỰ tạo PaymentService bên trong -> bị "dính chặt"
    private PaymentService paymentService = new PaymentService();

    void datHang(double soTien) {
        paymentService.thanhToan(soTien);
        System.out.println("Đã đặt hàng");
    }
}
```

Những vấn đề của cách này:

- **Khó thay đổi**: nếu muốn dùng `PayPalPaymentService` thay vì thẻ, bạn phải sửa trực tiếp code của `OrderService`.
- **Khó kiểm thử (test)**: khi viết test, bạn không thể thay `PaymentService` bằng một bản giả (mock) — nó luôn gọi thanh toán thật.
- **Gắn kết chặt (tight coupling)**: `OrderService` bị trói buộc cứng vào một lớp `PaymentService` cụ thể.

---

## Constructor Injection (tiêm qua hàm dựng)

Cách phổ biến và được khuyến nghị nhất là **Constructor Injection** — truyền phụ thuộc vào qua **hàm dựng (constructor)**.

Bước 1: tạo một interface để định nghĩa "khả năng" cần có, giúp linh hoạt thay thế.

```java
// Interface định nghĩa khả năng thanh toán
interface PaymentService {
    void thanhToan(double soTien);
}

// Triển khai 1: thanh toán bằng thẻ
class CardPayment implements PaymentService {
    @Override
    public void thanhToan(double soTien) {
        System.out.println("Thanh toán qua thẻ: " + soTien);
    }
}

// Triển khai 2: thanh toán bằng PayPal
class PayPalPayment implements PaymentService {
    @Override
    public void thanhToan(double soTien) {
        System.out.println("Thanh toán qua PayPal: " + soTien);
    }
}
```

Bước 2: `OrderService` **nhận** phụ thuộc qua constructor, không tự tạo.

```java
class OrderService {
    // Phụ thuộc được khai báo là final, nhận từ bên ngoài
    private final PaymentService paymentService;

    // Constructor Injection: phụ thuộc được "tiêm" vào đây
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    void datHang(double soTien) {
        paymentService.thanhToan(soTien); // Dùng phụ thuộc đã được tiêm
        System.out.println("Đã đặt hàng");
    }
}
```

Bước 3: nơi sử dụng quyết định dùng triển khai nào.

```java
public class Main {
    public static void main(String[] args) {
        // Quyết định dùng thẻ -> tiêm CardPayment vào
        OrderService dichVu1 = new OrderService(new CardPayment());
        dichVu1.datHang(100_000);

        // Muốn đổi sang PayPal? Chỉ cần tiêm phụ thuộc khác!
        OrderService dichVu2 = new OrderService(new PayPalPayment());
        dichVu2.datHang(200_000);
    }
}
```

Lưu ý: ngoài Constructor Injection, còn có Setter Injection (tiêm qua phương thức set) và Field Injection (tiêm trực tiếp vào field), nhưng Constructor Injection được ưa chuộng nhất vì giúp phụ thuộc bắt buộc và bất biến (`final`).

---

## Inversion of Control (đảo ngược điều khiển)

**Inversion of Control (IoC — đảo ngược điều khiển)** là nguyên tắc đứng sau DI. Bình thường, một đối tượng **tự kiểm soát** việc tạo ra các phụ thuộc của mình. Với IoC, quyền kiểm soát đó được **đảo ngược** — chuyển ra bên ngoài.

So sánh:

- **Không có IoC**: "Tôi (OrderService) tự quyết định và tự tạo PaymentService."
- **Có IoC**: "Tôi chỉ khai báo tôi cần một PaymentService. Ai đó bên ngoài sẽ tạo và đưa cho tôi."

DI là cách phổ biến nhất để hiện thực hóa nguyên tắc IoC. Kết quả là code linh hoạt hơn, dễ thay đổi và dễ kiểm thử hơn.

---

## Lợi ích cho việc kiểm thử (testing)

DI làm cho việc viết test trở nên dễ dàng vì bạn có thể tiêm một phiên bản **giả (mock)** vào.

```java
// Tạo một PaymentService giả chỉ dùng cho test
class FakePayment implements PaymentService {
    boolean daGoi = false; // Ghi nhận xem có được gọi không

    @Override
    public void thanhToan(double soTien) {
        daGoi = true; // Không thanh toán thật, chỉ đánh dấu
    }
}

public class TestViDu {
    public static void main(String[] args) {
        FakePayment gia = new FakePayment();
        // Tiêm bản giả vào OrderService để kiểm thử
        OrderService dichVu = new OrderService(gia);

        dichVu.datHang(50_000);

        // Kiểm tra: thanh toán đã được gọi mà KHÔNG tốn tiền thật
        System.out.println("Đã gọi thanh toán? " + gia.daGoi); // true
    }
}
```

Nếu `OrderService` tự tạo `PaymentService` bên trong, bạn không thể làm việc này — mỗi lần test sẽ gọi thanh toán thật.

---

## Spring làm việc này tự động

Khi dự án lớn lên với hàng trăm lớp phụ thuộc lẫn nhau, việc tự tay tạo và tiêm mọi thứ trở nên mệt mỏi. Đây là lúc các framework như **Spring** giúp đỡ.

Spring có một **IoC Container (bộ chứa điều khiển đảo ngược)** — nó tự động tạo các đối tượng và tiêm phụ thuộc giúp bạn, chỉ dựa trên annotation.

```java
// Minh họa cách Spring làm việc (chỉ để hình dung khái niệm)

// @Service báo Spring: "Hãy quản lý và tạo đối tượng này giúp tôi"
// @Service
class CardPayment implements PaymentService {
    public void thanhToan(double soTien) {
        System.out.println("Thanh toán qua thẻ: " + soTien);
    }
}

// @Service
class OrderService {
    private final PaymentService paymentService;

    // Spring tự động tìm và TIÊM một PaymentService vào đây
    // mà bạn không cần gọi "new" thủ công
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    void datHang(double soTien) {
        paymentService.thanhToan(soTien);
    }
}
```

Bạn chỉ cần khai báo (qua annotation) rằng lớp nào cần được quản lý và lớp nào cần phụ thuộc gì. Spring lo phần còn lại: tạo đối tượng, kết nối chúng với nhau, theo đúng nguyên tắc DI và IoC mà bạn vừa học.

---

## Lỗi thường gặp

- **Vẫn dùng `new` bên trong dù đã có DI**: làm vậy phá vỡ lợi ích của DI và gây gắn kết chặt trở lại.
- **Phụ thuộc vào lớp cụ thể thay vì interface**: nên phụ thuộc vào interface để dễ thay thế triển khai.
- **Tạo vòng phụ thuộc (A cần B, B cần A)**: gây rắc rối khi khởi tạo; cần thiết kế lại.
- **Nhồi quá nhiều phụ thuộc vào một lớp**: nếu constructor có quá nhiều tham số, lớp đó có thể đang làm quá nhiều việc.
- **Nghĩ DI chỉ dành cho Spring**: DI là một nguyên tắc thiết kế, bạn có thể áp dụng thủ công mà không cần framework.

---

## Tóm tắt

- **Dependency Injection (DI)** là việc đối tượng **nhận** phụ thuộc từ bên ngoài thay vì tự tạo.
- Tự tạo phụ thuộc bên trong gây **gắn kết chặt**, khó thay đổi và khó kiểm thử.
- **Constructor Injection** truyền phụ thuộc qua hàm dựng — cách được khuyến nghị nhất.
- **Inversion of Control (IoC)** là nguyên tắc đảo ngược quyền kiểm soát việc tạo phụ thuộc; DI là cách hiện thực nó.
- DI giúp việc **kiểm thử** dễ dàng nhờ tiêm được các bản giả (mock).
- Framework **Spring** tự động hóa DI thông qua **IoC Container** và annotation.
