---
sidebar_position: 3
title: "3. Mô hình bộ nhớ Java (Java Memory Model)"
---

# 3. Mô hình bộ nhớ Java (Java Memory Model)

---

## Mục lục

- [Mô hình bộ nhớ Java là gì?](#mô-hình-bộ-nhớ-java-là-gì)
- [Bộ nhớ chính và bộ nhớ đệm của CPU](#bộ-nhớ-chính-và-bộ-nhớ-đệm-của-cpu)
- [Vấn đề hiển thị (Visibility)](#vấn-đề-hiển-thị-visibility)
- [Ví dụ biến chia sẻ gây lỗi](#ví-dụ-biến-chia-sẻ-gây-lỗi)
- [Quan hệ "xảy ra trước" (Happens-before)](#quan-hệ-xảy-ra-trước-happens-before)
- [Cách bảo đảm an toàn](#cách-bảo-đảm-an-toàn)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Mô hình bộ nhớ Java là gì?

**Mô hình bộ nhớ Java (Java Memory Model — viết tắt JMM)** là bộ quy tắc mô tả: khi nhiều luồng cùng đọc/ghi biến, **lúc nào** một luồng sẽ nhìn thấy thay đổi do luồng khác tạo ra.

Nghe có vẻ khó, nhưng ý chính rất đơn giản: **mỗi luồng có thể giữ một "bản sao" giá trị biến trong vùng nhớ riêng, nên không phải lúc nào nó cũng thấy giá trị mới nhất.**

---

## Bộ nhớ chính và bộ nhớ đệm của CPU

Máy tính có hai loại bộ nhớ liên quan ở đây:

- **Bộ nhớ chính (main memory — RAM)**: nơi lưu trữ chung, tất cả luồng đều thấy.
- **Bộ nhớ đệm CPU (CPU cache)**: vùng nhớ siêu nhanh nằm gần mỗi nhân CPU, lưu bản sao tạm để truy cập cho nhanh.

Ví dụ đời thường: bộ nhớ chính giống như **kho hàng trung tâm**, còn cache giống như **tủ đồ nhỏ tại bàn làm việc** của mỗi người. Khi cần dùng, người ta lấy đồ từ kho về tủ riêng cho tiện. Vấn đề là: nếu một người sửa đồ trong tủ riêng mà chưa trả về kho, người khác lấy từ kho sẽ thấy **bản cũ**.

```
   Luồng 1               Luồng 2
  [cache riêng]         [cache riêng]
        \                   /
         \                 /
        Bộ nhớ chính (RAM)
```

Đây chính là gốc rễ của các lỗi đa luồng "kỳ lạ".

---

## Vấn đề hiển thị (Visibility)

**Hiển thị (visibility)** là việc một luồng có **nhìn thấy** thay đổi mà luồng khác vừa ghi hay không.

Vì mỗi luồng có cache riêng, một luồng có thể ghi giá trị mới vào cache của nó, nhưng luồng khác vẫn đọc giá trị cũ từ cache của mình. Kết quả: thay đổi "vô hình" với luồng kia.

Ví dụ: bạn nhắn tin báo "đổi giờ hẹn sang 8h" nhưng bạn của bạn chưa đọc tin, vẫn đến lúc 7h như cũ. Tin nhắn (thay đổi) đã có, nhưng chưa "hiển thị" với người kia.

---

## Ví dụ biến chia sẻ gây lỗi

Đoạn code sau **có thể chạy mãi không dừng**, dù trông như nó phải dừng:

```java
public class ViDuVisibility {
    // Biến chung, không được đánh dấu đặc biệt
    static boolean dungLai = false;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            // Luồng này đọc dungLai liên tục
            while (!dungLai) {
                // Vòng lặp rỗng, chờ tín hiệu dừng
            }
            System.out.println("Worker đã dừng");
        });
        worker.start();

        Thread.sleep(1000);
        // Luồng main đổi cờ thành true
        dungLai = true;
        System.out.println("Main đã đặt dungLai = true");
    }
}
```

**Vì sao có thể bị treo?** Luồng `worker` có thể đã giữ bản sao `dungLai = false` trong cache của nó và không bao giờ đọc lại từ bộ nhớ chính. Dù `main` đã đổi thành `true`, `worker` vẫn thấy `false` → vòng lặp chạy mãi.

Đây là lỗi **rất nguy hiểm** vì máy này chạy đúng, máy khác lại treo, rất khó tìm ra.

---

## Quan hệ "xảy ra trước" (Happens-before)

Để xử lý các lỗi trên, JMM định nghĩa quan hệ **happens-before (xảy ra trước)**. Nói đơn giản: nếu hành động A "happens-before" hành động B, thì **mọi thay đổi A tạo ra chắc chắn được B nhìn thấy**.

Một số quy tắc happens-before quan trọng (chỉ cần hiểu ý):

- Các lệnh trong **cùng một luồng** chạy theo đúng thứ tự bạn viết.
- Việc **mở khóa** (`synchronized`/`unlock`) happens-before việc **khóa** sau đó của cùng khóa đó.
- Việc ghi vào biến **`volatile`** happens-before việc đọc nó sau đó.
- `start()` của một luồng happens-before mọi việc trong luồng đó.
- Mọi việc trong một luồng happens-before khi luồng khác `join()` xong nó.

Tóm lại: muốn một luồng chắc chắn thấy thay đổi của luồng khác, ta phải tạo ra một mối quan hệ happens-before giữa chúng (bằng `synchronized`, `volatile`, `join()`...).

---

## Cách bảo đảm an toàn

Để tránh lỗi hiển thị, dùng một trong các cách sau:

```java
// Cách 1: dùng volatile — đảm bảo luôn đọc/ghi từ bộ nhớ chính
static volatile boolean dungLai = false;
```

```java
// Cách 2: dùng synchronized — vừa khóa, vừa bảo đảm hiển thị
class CoDung {
    private boolean dungLai = false;

    synchronized void dat()        { dungLai = true; }
    synchronized boolean kiemTra() { return dungLai; }
}
```

```java
// Cách 3: dùng lớp atomic có sẵn (an toàn cho đa luồng)
import java.util.concurrent.atomic.AtomicBoolean;

AtomicBoolean dungLai = new AtomicBoolean(false);
dungLai.set(true);        // ghi an toàn
boolean v = dungLai.get(); // đọc an toàn
```

Phần `volatile` sẽ được nói chi tiết ở bài tiếp theo.

---

## Lỗi thường gặp

1. **Tưởng rằng cứ ghi biến là luồng khác thấy ngay**: sai, vì cache CPU có thể giữ bản cũ.
2. **Dùng vòng lặp chờ một biến `boolean` thường** để báo dừng → có thể treo mãi mãi (cần `volatile`).
3. **Nghĩ rằng test trên máy mình chạy đúng là code đúng**: lỗi hiển thị phụ thuộc phần cứng và thời điểm, rất khó tái hiện.
4. **Quên rằng `synchronized` không chỉ để khóa** mà còn bảo đảm hiển thị (đẩy dữ liệu về bộ nhớ chính).

---

## Tóm tắt

- **JMM** là quy tắc về việc khi nào một luồng thấy thay đổi của luồng khác.
- Mỗi luồng có thể giữ **bản sao biến trong cache CPU**, gây ra vấn đề **hiển thị (visibility)**.
- Biến chia sẻ thường có thể khiến luồng đọc **giá trị cũ**, gây lỗi treo hoặc sai kết quả.
- **Happens-before** là quan hệ bảo đảm một luồng thấy thay đổi của luồng khác.
- Dùng `volatile`, `synchronized`, hoặc các lớp `Atomic` để bảo đảm an toàn.
