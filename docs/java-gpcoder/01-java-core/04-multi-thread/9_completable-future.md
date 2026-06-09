---
sidebar_position: 9
title: "Lập trình đa luồng với CompletableFuture trong Java 8"
---

# Lập trình đa luồng với CompletableFuture trong Java 8

`CompletableFuture` là công cụ mạnh mẽ của Java 8 để lập trình bất đồng bộ mà không phải chặn luồng chờ kết quả. Nó cho phép ghép nối nhiều tác vụ thành chuỗi (pipeline), kết hợp kết quả từ nhiều tác vụ và xử lý lỗi gọn gàng — giống như Promise trong JavaScript. Bài này giới thiệu khái niệm tổng quan cùng các phương thức thường dùng; chi tiết nằm bên dưới.

## Hạn chế của Future

`Future` có những giới hạn:
- `get()` chặn luồng — phải chờ kết quả, không tiếp tục được.
- Không thể ghép nối các tác vụ: "khi tác vụ A xong thì chạy B".
- Không thể kết hợp kết quả từ nhiều `Future`.
- Không thể xử lý lỗi theo chuỗi.

**CompletableFuture** (tương lai có thể hoàn thành — lớp triển khai cả `Future` và `CompletionStage`) giải quyết tất cả các hạn chế trên bằng cách cho phép **lập trình bất đồng bộ theo chuỗi** (asynchronous pipeline) giống như Promise trong JavaScript.

## Tạo CompletableFuture

```java
import java.util.concurrent.*;

public class TaoCF {
    public static void main(String[] args) throws Exception {
        // supplyAsync — chạy bất đồng bộ, có trả về giá trị
        CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> {
            System.out.println("Đang chạy: " + Thread.currentThread().getName());
            return "Xin chào!";
        });

        // runAsync — chạy bất đồng bộ, không trả về
        CompletableFuture<Void> cf2 = CompletableFuture.runAsync(() ->
                System.out.println("Tác vụ nền chạy xong"));

        // completedFuture — tạo CF với giá trị đã có sẵn (đồng bộ)
        CompletableFuture<Integer> cf3 = CompletableFuture.completedFuture(42);

        System.out.println(cf1.get()); // Xin chào!
        System.out.println(cf3.get()); // 42
    }
}
```

Mặc định `supplyAsync` dùng `ForkJoinPool.commonPool()`. Có thể truyền `Executor` riêng:

```java
ExecutorService myPool = Executors.newFixedThreadPool(4);
CompletableFuture.supplyAsync(() -> "dữ liệu", myPool);
```

## Ghép nối tác vụ theo chuỗi (Pipeline)

### thenApply — chuyển đổi kết quả (giống map)

```java
CompletableFuture<String> pipeline = CompletableFuture
        .supplyAsync(() -> "  Java CompletableFuture  ")   // Bước 1
        .thenApply(String::trim)                            // Bước 2: cắt khoảng trắng
        .thenApply(String::toUpperCase)                     // Bước 3: viết hoa
        .thenApply(s -> "Kết quả: " + s);                  // Bước 4: thêm tiền tố

System.out.println(pipeline.get());
// Kết quả: JAVA COMPLETABLEFUTURE
```

### thenAccept — tiêu thụ kết quả (không trả về)

```java
CompletableFuture.supplyAsync(() -> layDanhSachSanPham())
        .thenAccept(danhSach -> {
            System.out.println("Tìm thấy " + danhSach.size() + " sản phẩm");
            danhSach.forEach(System.out::println);
        });
        // trả về CompletableFuture<Void>
```

### thenCompose — ghép tác vụ bất đồng bộ (giống flatMap)

Dùng khi bước sau **cũng trả về CompletableFuture** (tránh lồng CF trong CF):

```java
// Ví dụ thực tế: lấy user -> lấy đơn hàng của user
CompletableFuture<List<Order>> pipeline = CompletableFuture
        .supplyAsync(() -> layUser(userId))        // CF<User>
        .thenCompose(user -> layDonHang(user));    // CF<List<Order>>  (không phải CF<CF<List<Order>>>)

// layDonHang trả về CompletableFuture<List<Order>> — thenCompose "làm phẳng" nó
```

## Ví dụ thực tế: Xử lý đơn hàng bất đồng bộ

```java
import java.util.concurrent.*;
import java.util.List;

public class XuLyDonHang {

    // Mô phỏng gọi các service bất đồng bộ
    static CompletableFuture<String> xacThucKhachHang(int customerId) {
        return CompletableFuture.supplyAsync(() -> {
            sleep(500);
            if (customerId <= 0) throw new RuntimeException("Khách hàng không tồn tại: " + customerId);
            return "Khách hàng #" + customerId;
        });
    }

    static CompletableFuture<Double> kiemTraTonKho(String sanPham) {
        return CompletableFuture.supplyAsync(() -> {
            sleep(800);
            return 299.0; // giá
        });
    }

    static CompletableFuture<String> xuLyThanhToan(double soTien) {
        return CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return "Thanh toán " + soTien + " VND thành công. Mã GD: TX-" + System.currentTimeMillis();
        });
    }

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    public static void main(String[] args) throws Exception {
        long batDau = System.currentTimeMillis();

        // Pipeline bất đồng bộ — các bước phụ thuộc nhau chạy tuần tự
        CompletableFuture<String> donHang = xacThucKhachHang(123)
                .thenCompose(khach -> {
                    System.out.println("Đã xác thực: " + khach);
                    return kiemTraTonKho("Laptop Pro");
                })
                .thenCompose(gia -> {
                    System.out.println("Giá sản phẩm: " + gia);
                    return xuLyThanhToan(gia);
                })
                .thenApply(maGD -> "ĐƠN HÀNG THÀNH CÔNG - " + maGD);

        String ketQua = donHang.get();
        System.out.println(ketQua);
        System.out.println("Tổng thời gian: " + (System.currentTimeMillis() - batDau) + "ms");
    }
}
```

## Kết hợp nhiều CompletableFuture

### allOf — chờ tất cả hoàn thành

```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> { sleep(1000); return "Dữ liệu A"; });
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> { sleep(1500); return "Dữ liệu B"; });
CompletableFuture<String> cf3 = CompletableFuture.supplyAsync(() -> { sleep(800);  return "Dữ liệu C"; });

// allOf chờ TẤT CẢ xong (trả về CF<Void>)
CompletableFuture<Void> tatCa = CompletableFuture.allOf(cf1, cf2, cf3);

tatCa.thenRun(() -> {
    try {
        // Lấy kết quả — lúc này tất cả đã xong nên get() không block
        System.out.println(cf1.get() + ", " + cf2.get() + ", " + cf3.get());
    } catch (Exception e) { e.printStackTrace(); }
}).get();
```

### anyOf — lấy kết quả nhanh nhất

```java
CompletableFuture<Object> nhanh = CompletableFuture.anyOf(cf1, cf2, cf3);

// Nhận kết quả từ CF nào hoàn thành trước
System.out.println("Nhanh nhất: " + nhanh.get());
```

## Xử lý lỗi

```java
CompletableFuture<String> result = CompletableFuture
        .supplyAsync(() -> {
            if (Math.random() < 0.5) throw new RuntimeException("Lỗi giả lập!");
            return "Thành công!";
        })

        // exceptionally — xử lý lỗi, cung cấp giá trị thay thế
        .exceptionally(ex -> {
            System.out.println("Lỗi: " + ex.getMessage());
            return "Giá trị mặc định";
        })

        // handle — xử lý cả thành công lẫn thất bại
        .handle((giaTri, ex) -> {
            if (ex != null) {
                return "Phục hồi từ lỗi: " + ex.getMessage();
            }
            return "Kết quả tốt: " + giaTri;
        })

        // whenComplete — như handle nhưng không thay đổi kết quả (dùng để log)
        .whenComplete((giaTri, ex) -> {
            System.out.println("Hoàn thành. Giá trị: " + giaTri + " | Lỗi: " + ex);
        });

System.out.println(result.get());
```

## Tổng kết các phương thức chính

| Nhóm | Phương thức | Mô tả |
|---|---|---|
| Tạo | `supplyAsync(Supplier)` | Chạy bất đồng bộ, có kết quả |
| Tạo | `runAsync(Runnable)` | Chạy bất đồng bộ, không kết quả |
| Biến đổi | `thenApply(Function)` | Biến đổi kết quả (đồng bộ) |
| Tiêu thụ | `thenAccept(Consumer)` | Xử lý kết quả, không trả về |
| Ghép | `thenCompose(Function)` | Ghép CF, tránh lồng nhau |
| Kết hợp | `thenCombine(CF, BiFunction)` | Kết hợp 2 CF song song |
| Chờ tất cả | `allOf(CF...)` | Chờ mọi CF hoàn thành |
| Lấy nhanh | `anyOf(CF...)` | Lấy kết quả CF đầu tiên xong |
| Lỗi | `exceptionally(Function)` | Phục hồi từ lỗi |
| Lỗi | `handle(BiFunction)` | Xử lý cả thành công lẫn lỗi |

## Tổng kết

`CompletableFuture` là công cụ mạnh mẽ nhất cho lập trình bất đồng bộ trong Java:
- Ghép nối tác vụ như pipeline mà không chặn luồng.
- Xử lý lỗi theo chuỗi thay vì try-catch lồng nhau.
- Kết hợp nhiều tác vụ song song với `allOf` / `anyOf`.
- Dùng `thenCompose` (không phải `thenApply`) khi bước tiếp theo cũng bất đồng bộ.
