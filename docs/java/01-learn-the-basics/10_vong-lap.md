---
sidebar_position: 10
title: "10. Vòng lặp (Loops)"
---

# Vòng lặp (Loops)

Vòng lặp là cấu trúc cho phép lặp lại một khối lệnh nhiều lần, giúp bạn không phải viết đi viết lại cùng một đoạn code. Đây là công cụ quan trọng để xử lý dữ liệu lặp đi lặp lại như duyệt mảng hay đếm số. Bài này giới thiệu bốn loại vòng lặp chính (for, while, do-while, for-each) cùng break và continue; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao cần vòng lặp?](#vì-sao-cần-vòng-lặp)
- [Vòng lặp là gì?](#vòng-lặp-là-gì)
- [Vòng for](#vòng-for)
- [Vòng while](#vòng-while)
- [Vòng do-while](#vòng-do-while)
- [Vòng for-each](#vòng-for-each)
- [break và continue](#break-và-continue)
- [Vòng lặp lồng nhau](#vòng-lặp-lồng-nhau)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần vòng lặp?

**Vấn đề:** Nếu bạn muốn in 1000 dòng "Xin chào" hoặc xử lý từng phần tử trong một mảng 500 học sinh, cách viết thủ công là bất khả thi — và code không thể tự thích ứng khi kích thước dữ liệu thay đổi.

```java
// Cách cũ: viết tay từng dòng — không thể co giãn
System.out.println("Xin chao 1");
System.out.println("Xin chao 2");
System.out.println("Xin chao 3");
// ... viết đến 1000? Không tưởng!
```

**Giải pháp:** Vòng lặp cho phép lặp lại một khối lệnh nhiều lần với một điều kiện dừng rõ ràng — code ngắn gọn, tự thích ứng với mọi kích thước dữ liệu.

```java
// Với vòng lặp: chỉ 3 dòng, chạy bao nhiêu lần cũng được
for (int i = 1; i <= 1000; i++) {
    System.out.println("Xin chao " + i);
}
```

:::tip[Dùng thực tế]
- In danh sách điểm của tất cả học sinh trong lớp.
- Tính tổng các số trong một mảng dữ liệu lớn.
- Đọc từng dòng file log và kiểm tra lỗi.
- Thử lại kết nối mạng tối đa N lần khi gặp sự cố.
:::

---

## Vòng lặp là gì?

**Vòng lặp** (loop — cấu trúc cho phép lặp lại một khối lệnh nhiều lần) giúp bạn không phải viết đi viết lại cùng một đoạn code. Ví dụ: thay vì in "Xin chao" 100 lần bằng 100 dòng, bạn viết một vòng lặp chạy 100 lần.

Mỗi lần chạy lại gọi là một **lần lặp** (iteration). Java có bốn loại vòng lặp chính.

---

## Vòng for

`for` dùng khi bạn **biết trước số lần lặp**. Cấu trúc gồm ba phần: khởi tạo; điều kiện; bước nhảy.

```java
public class ViDuFor {
    public static void main(String[] args) {
        // for (khởi tạo ; điều kiện ; bước nhảy)
        for (int i = 1; i <= 5; i++) {
            System.out.println("Lan lap thu " + i);
        }
        // i bắt đầu = 1; chạy khi i <= 5; mỗi vòng i tăng 1
    }
}
```

Cách hoạt động từng bước:

1. Khởi tạo `int i = 1` (chỉ chạy một lần đầu).
2. Kiểm tra điều kiện `i <= 5`: nếu đúng thì chạy thân vòng, nếu sai thì dừng.
3. Sau mỗi vòng, chạy bước nhảy `i++`, rồi quay lại bước 2.

---

## Vòng while

`while` (trong khi) lặp **chừng nào điều kiện còn đúng**. Dùng khi không biết trước số lần lặp.

```java
public class ViDuWhile {
    public static void main(String[] args) {
        int dem = 1;

        // Lặp chừng nào dem còn <= 3
        while (dem <= 3) {
            System.out.println("Dem = " + dem);
            dem++; // PHẢI cập nhật, nếu không sẽ lặp vô hạn
        }
    }
}
```

Cảnh báo: bạn phải thay đổi biến điều kiện bên trong vòng (`dem++`), nếu không điều kiện luôn đúng và vòng lặp chạy mãi mãi (**vòng lặp vô hạn** — infinite loop).

---

## Vòng do-while

`do-while` giống `while` nhưng **chạy thân vòng ÍT NHẤT một lần** rồi mới kiểm tra điều kiện (vì điều kiện ở cuối).

```java
public class ViDuDoWhile {
    public static void main(String[] args) {
        int so = 10;

        do {
            // Khối này chạy ít nhất 1 lần, dù điều kiện sai
            System.out.println("Gia tri: " + so);
            so++;
        } while (so < 5); // sai ngay từ đầu (10 < 5 = false)
        // Kết quả: vẫn in "Gia tri: 10" đúng một lần
    }
}
```

Khác biệt cốt lõi: `while` kiểm tra **trước** (có thể chạy 0 lần); `do-while` kiểm tra **sau** (luôn chạy tối thiểu 1 lần).

---

## Vòng for-each

`for-each` (vòng lặp tăng cường) dùng để duyệt qua từng phần tử của mảng hoặc danh sách mà không cần quản lý chỉ số.

```java
public class ViDuForEach {
    public static void main(String[] args) {
        String[] mon = {"Toan", "Ly", "Hoa"};

        // Đọc là: "với mỗi m trong mảng mon"
        for (String m : mon) {
            System.out.println("Mon hoc: " + m);
        }
    }
}
```

`for-each` gọn và an toàn để **đọc** dữ liệu, nhưng không cho bạn chỉ số và không nên dùng khi cần sửa phần tử theo vị trí.

---

## break và continue

Hai từ khóa điều khiển luồng vòng lặp:

```java
public class ViDuBreakContinue {
    public static void main(String[] args) {
        // break: THOÁT hẳn khỏi vòng lặp ngay lập tức
        for (int i = 1; i <= 10; i++) {
            if (i == 5) {
                break; // gặp 5 thì dừng luôn
            }
            System.out.println("break demo: " + i); // in 1,2,3,4
        }

        // continue: BỎ QUA phần còn lại, sang vòng lặp tiếp theo
        for (int i = 1; i <= 5; i++) {
            if (i % 2 == 0) {
                continue; // bỏ qua số chẵn
            }
            System.out.println("continue demo: " + i); // in 1,3,5
        }
    }
}
```

- `break`: dừng toàn bộ vòng lặp, nhảy ra ngoài.
- `continue`: bỏ phần còn lại của lần lặp hiện tại, chuyển sang lần kế tiếp.

---

## Vòng lặp lồng nhau

Một vòng lặp có thể đặt bên trong vòng lặp khác. Hữu ích cho bảng, ma trận:

```java
public class ViDuLongNhau {
    public static void main(String[] args) {
        // In bảng cửu chương 2 và 3
        for (int bang = 2; bang <= 3; bang++) {        // vòng ngoài
            System.out.println("--- Bang " + bang + " ---");
            for (int i = 1; i <= 5; i++) {             // vòng trong
                System.out.println(bang + " x " + i + " = " + (bang * i));
            }
        }
    }
}
```

Với mỗi lần chạy vòng ngoài, toàn bộ vòng trong chạy hết một lượt.

---

## Lỗi thường gặp

- **Vòng lặp vô hạn**: quên cập nhật biến điều kiện trong `while`.
- **Lệch một đơn vị** (off-by-one): dùng `<=` thay vì `<` hay ngược lại, làm chạy thừa/thiếu một vòng.
- **Vượt chỉ số mảng** khi điều kiện `for` đặt sai (`i <= length` thay vì `i < length`).
- **Quên `{ }`** khiến chỉ câu lệnh đầu nằm trong vòng lặp.
- **Dùng `break` khi định dùng `continue`** (hoặc ngược lại).

---

## Tóm tắt

- **Vòng lặp** lặp lại một khối lệnh nhiều lần.
- `for` khi biết trước số lần; `while` khi lặp theo điều kiện; `do-while` chạy ít nhất một lần; `for-each` để duyệt phần tử.
- `break` thoát khỏi vòng lặp; `continue` bỏ qua phần còn lại của lần lặp hiện tại.
- Luôn đảm bảo điều kiện sẽ có lúc sai để tránh **vòng lặp vô hạn**.
