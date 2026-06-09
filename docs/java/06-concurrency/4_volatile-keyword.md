---
sidebar_position: 4
title: "4. Từ khóa volatile"
---

# 4. Từ khóa volatile

`volatile` là từ khóa đặt trước biến để buộc biến đó luôn được đọc/ghi trực tiếp tại bộ nhớ chính, không dùng bản sao trong cache CPU. Nhờ vậy thay đổi của một luồng luôn hiển thị ngay với các luồng khác, rất hợp cho các "cờ" báo dừng luồng. Bài này giải thích `volatile` làm được gì và không làm được gì so với `synchronized`; chi tiết nằm bên dưới.

---

## Mục lục

- [volatile là gì?](#volatile-là-gì)
- [volatile bảo đảm hiển thị (Visibility)](#volatile-bảo-đảm-hiển-thị-visibility)
- [Ví dụ: cờ dừng luồng](#ví-dụ-cờ-dừng-luồng)
- [volatile khác synchronized như thế nào?](#volatile-khác-synchronized-như-thế-nào)
- [volatile KHÔNG bảo đảm tính nguyên tử (Atomicity)](#volatile-không-bảo-đảm-tính-nguyên-tử-atomicity)
- [Khi nào nên dùng volatile?](#khi-nào-nên-dùng-volatile)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## volatile là gì?

`volatile` là một từ khóa đặt trước biến, có nghĩa: **"biến này luôn được đọc và ghi trực tiếp tại bộ nhớ chính (RAM), không dùng bản sao trong cache của CPU".**

Như đã học ở bài Mô hình bộ nhớ, mỗi luồng có thể giữ bản sao biến trong cache riêng, dẫn đến luồng khác không thấy thay đổi. `volatile` giải quyết đúng vấn đề này.

```java
// Đặt volatile trước kiểu dữ liệu của biến
private volatile boolean sanSang = false;
```

Ví dụ đời thường: thay vì mỗi người ghi vào sổ tay riêng (cache), `volatile` bắt mọi người **luôn ghi và đọc trên một bảng thông báo chung** giữa văn phòng. Ai sửa gì, người khác thấy ngay.

---

## volatile bảo đảm hiển thị (Visibility)

Khi một biến là `volatile`:

- Mỗi lần **ghi** → đẩy ngay xuống bộ nhớ chính.
- Mỗi lần **đọc** → lấy thẳng từ bộ nhớ chính.

Nhờ vậy, thay đổi của một luồng **luôn hiển thị** với các luồng khác ngay lập tức. Đây gọi là bảo đảm **visibility (hiển thị)**.

---

## Ví dụ: cờ dừng luồng

Đây là tình huống dùng `volatile` kinh điển nhất: một biến `boolean` làm "cờ" báo cho luồng khác dừng lại.

```java
public class ViDuCoDung {
    // KHÔNG có volatile: worker có thể chạy mãi không dừng
    // CÓ volatile: worker thấy thay đổi ngay → dừng đúng
    private static volatile boolean dangChay = true;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long dem = 0;
            // Liên tục kiểm tra cờ
            while (dangChay) {
                dem++;
            }
            System.out.println("Worker dừng sau khi đếm " + dem);
        });

        worker.start();
        Thread.sleep(1000); // để worker chạy 1 giây

        // main hạ cờ → nhờ volatile, worker thấy NGAY và dừng
        dangChay = false;
        System.out.println("Main đã hạ cờ dừng");
    }
}
```

Nếu bỏ `volatile`, đoạn code này có thể **treo vĩnh viễn** vì `worker` đọc giá trị `true` cũ từ cache.

---

## volatile khác synchronized như thế nào?

Đây là bảng so sánh dễ nhớ:

| Đặc điểm | `volatile` | `synchronized` |
|---|---|---|
| Bảo đảm hiển thị (visibility) | Có | Có |
| Bảo đảm nguyên tử (atomicity) | **Không** | Có |
| Có khóa, chặn luồng khác chờ | Không | Có (chỉ 1 luồng vào) |
| Tốc độ | Nhanh (nhẹ) | Chậm hơn (có khóa) |
| Dùng cho | Biến đơn được đọc/ghi độc lập | Khối lệnh phức tạp, nhiều bước |

Tóm gọn: `volatile` **nhẹ** nhưng chỉ lo phần "hiển thị". `synchronized` **nặng hơn** nhưng lo cả "hiển thị" lẫn "không bị tranh chấp".

---

## volatile KHÔNG bảo đảm tính nguyên tử (Atomicity)

**Atomicity (tính nguyên tử)** nghĩa là một thao tác chạy "trọn vẹn một mạch", không bị luồng khác xen vào giữa chừng.

`volatile` **không** bảo đảm điều này. Ví dụ kinh điển là phép `count++`:

```java
public class ViDuVolatileSai {
    // volatile chỉ lo hiển thị, KHÔNG ngăn được tranh chấp khi tăng
    private static volatile int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable job = () -> {
            for (int i = 0; i < 100000; i++) {
                count++; // Gồm 3 bước: đọc, +1, ghi → vẫn bị mất khi đua nhau
            }
        };
        Thread t1 = new Thread(job);
        Thread t2 = new Thread(job);
        t1.start(); t2.start();
        t1.join(); t2.join();

        // Vẫn KHÔNG ra đúng 200000, vì volatile không lo atomicity
        System.out.println("Kết quả: " + count);
    }
}
```

Muốn tăng biến an toàn, dùng `synchronized` hoặc lớp `AtomicInteger`:

```java
import java.util.concurrent.atomic.AtomicInteger;

// AtomicInteger: vừa hiển thị, vừa tăng an toàn (nguyên tử)
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet(); // tương đương count++ nhưng AN TOÀN
```

---

## Khi nào nên dùng volatile?

Dùng `volatile` khi **cả hai** điều sau đúng:

1. Biến chỉ được **một luồng ghi**, các luồng khác chỉ **đọc** (hoặc việc ghi không phụ thuộc giá trị cũ).
2. Bạn chỉ cần bảo đảm các luồng thấy giá trị mới nhất, **không** cần khóa nhiều bước.

Trường hợp điển hình:

- **Cờ trạng thái** (`boolean dangChay`, `boolean daSanSang`).
- Biến cấu hình chỉ ghi một lần rồi nhiều luồng đọc.

**KHÔNG dùng `volatile`** khi thao tác gồm nhiều bước phụ thuộc nhau (như `count++`, kiểm tra rồi mới gán). Khi đó dùng `synchronized` hoặc `Atomic`.

---

## Lỗi thường gặp

1. **Dùng `volatile` cho biến đếm** (`count++`) và tưởng đã an toàn → vẫn bị race condition.
2. **Quên `volatile` cho cờ dừng luồng** → luồng treo mãi không dừng được.
3. **Nghĩ `volatile` thay được `synchronized` trong mọi trường hợp** → sai, nó không có khóa và không lo atomicity.
4. **Đặt `volatile` cho mọi biến cho "chắc"** → thừa thãi, làm chậm và che giấu thiết kế sai.

---

## Tóm tắt

- `volatile` buộc biến luôn đọc/ghi trực tiếp ở **bộ nhớ chính**, bảo đảm **hiển thị (visibility)**.
- Ứng dụng kinh điển: **cờ `boolean` báo dừng luồng**.
- `volatile` **nhẹ hơn** `synchronized` nhưng **không** bảo đảm **nguyên tử (atomicity)**.
- Không dùng `volatile` cho `count++`; hãy dùng `synchronized` hoặc `AtomicInteger`.
- Dùng `volatile` khi một luồng ghi - nhiều luồng đọc, và chỉ cần thấy giá trị mới nhất.
