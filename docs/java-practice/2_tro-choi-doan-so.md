---
sidebar_position: 2
title: "2. Trò chơi đoán số"
---

# Project 1: Trò chơi đoán số

Đây là project đầu tiên — máy nghĩ ra một số ngẫu nhiên, bạn đoán, máy gợi ý "lớn hơn / nhỏ hơn" cho đến khi đoán đúng. Project nhỏ nhưng dạy bạn ba viên gạch nền tảng của mọi chương trình: **nhập liệu từ người dùng**, **vòng lặp** lặp lại đến khi đạt điều kiện, và **câu điều kiện** để rẽ nhánh. Làm xong bài này bạn đã viết được một chương trình tương tác hoàn chỉnh.

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Khung chương trình](#bước-1-khung-chương-trình)
- [Bước 2: Sinh số ngẫu nhiên với Random](#bước-2-sinh-số-ngẫu-nhiên-với-random)
- [Bước 3: Nhận số đoán từ người dùng với Scanner](#bước-3-nhận-số-đoán-từ-người-dùng-với-scanner)
- [Bước 4: So sánh và gợi ý bằng câu điều kiện](#bước-4-so-sánh-và-gợi-ý-bằng-câu-điều-kiện)
- [Bước 5: Lặp lại đến khi đoán đúng với while](#bước-5-lặp-lại-đến-khi-đoán-đúng-với-while)
- [Bước 6: Đếm số lần đoán](#bước-6-đếm-số-lần-đoán)
- [Code hoàn chỉnh](#code-hoàn-chỉnh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Phân tích bài toán

Trước khi viết code, hãy mô tả luồng chạy bằng tiếng Việt (gọi là **pseudocode** — mã giả):

```
1. Máy chọn ngẫu nhiên một số bí mật từ 1 đến 100
2. Lặp lại:
     - Hỏi người chơi đoán số
     - Nếu đoán nhỏ hơn số bí mật → in "Lớn hơn đi"
     - Nếu đoán lớn hơn → in "Nhỏ hơn đi"
     - Nếu bằng → in "Chính xác!" và dừng lặp
3. In ra số lần đã đoán
```

Khi đã rõ luồng, việc viết code chỉ là **dịch** từng dòng pseudocode sang Java. Đây là thói quen cực kỳ tốt: **nghĩ trước, code sau**.

---

## Bước 1: Khung chương trình

Tạo file `DoanSo.java` với bộ khung tối thiểu:

```java
public class DoanSo {
    public static void main(String[] args) {
        System.out.println("=== TRÒ CHƠI ĐOÁN SỐ ===");
    }
}
```

Chạy thử (`java DoanSo` hoặc bấm ▶). Nếu thấy dòng tiêu đề in ra là môi trường đã ổn, ta đi tiếp.

---

## Bước 2: Sinh số ngẫu nhiên với Random

Để máy "nghĩ ra" một số, ta dùng lớp `Random` có sẵn của Java.

```java
import java.util.Random;   // PHẢI khai báo ở đầu file, trên dòng "public class"

public class DoanSo {
    public static void main(String[] args) {
        Random random = new Random();
        int soBiMat = random.nextInt(100) + 1;   // số từ 1 đến 100
    }
}
```

Giải thích:

- **`import java.util.Random;`** — báo cho Java biết ta muốn dùng công cụ `Random`. Dòng `import` luôn nằm **trên cùng**, trước `public class`.
- **`new Random()`** — tạo một "máy phát số ngẫu nhiên".
- **`random.nextInt(100)`** — trả về số nguyên ngẫu nhiên từ **0 đến 99** (tức `[0, 100)`, không bao gồm 100).
- **`+ 1`** — dịch khoảng thành **1 đến 100**. Đây là mẹo phổ biến: muốn khoảng `[1, n]` thì viết `nextInt(n) + 1`.

:::tip Mẹo debug khi mới học
Tạm thời in số bí mật ra để kiểm tra: `System.out.println("(DEBUG) Số bí mật: " + soBiMat);`. Khi chơi thật thì **xoá dòng này đi**, kẻo lộ đáp án!
:::

---

## Bước 3: Nhận số đoán từ người dùng với Scanner

`Scanner` là công cụ đọc dữ liệu người dùng gõ từ bàn phím.

```java
import java.util.Random;
import java.util.Scanner;

public class DoanSo {
    public static void main(String[] args) {
        Random random = new Random();
        int soBiMat = random.nextInt(100) + 1;

        Scanner scanner = new Scanner(System.in);
        System.out.print("Nhập số bạn đoán (1-100): ");
        int soDoan = scanner.nextInt();

        System.out.println("Bạn vừa đoán: " + soDoan);
    }
}
```

Giải thích:

- **`new Scanner(System.in)`** — tạo Scanner đọc từ `System.in` (bàn phím).
- **`scanner.nextInt()`** — chờ người dùng gõ một số nguyên rồi nhấn Enter, trả về số đó.
- **`System.out.print`** (không có `ln`) — in **không xuống dòng**, để con trỏ nằm ngay sau dấu nhắc, trông tự nhiên hơn khi nhập.

---

## Bước 4: So sánh và gợi ý bằng câu điều kiện

Dùng `if / else if / else` để rẽ nhánh theo kết quả so sánh:

```java
if (soDoan < soBiMat) {
    System.out.println("Số bí mật LỚN HƠN. Thử lại!");
} else if (soDoan > soBiMat) {
    System.out.println("Số bí mật NHỎ HƠN. Thử lại!");
} else {
    System.out.println("Chính xác! 🎉");
}
```

Giải thích:

- Java kiểm tra lần lượt từ trên xuống. **Đúng nhánh nào thì chạy nhánh đó rồi bỏ qua phần còn lại.**
- `<`, `>` là toán tử so sánh, trả về `true`/`false`.
- Nhánh `else` cuối cùng chỉ chạy khi cả hai điều kiện trên đều sai — tức `soDoan == soBiMat`.

Nhưng hiện tại chương trình chỉ cho đoán **một lần**. Ta cần lặp lại cho đến khi đúng.

---

## Bước 5: Lặp lại đến khi đoán đúng với while

Vòng lặp `while` lặp lại khối lệnh **chừng nào điều kiện còn đúng**. Ta dùng một biến cờ `daDung` để biết khi nào dừng:

```java
boolean daDung = false;

while (!daDung) {                 // lặp khi CHƯA đoán đúng
    System.out.print("Nhập số bạn đoán (1-100): ");
    int soDoan = scanner.nextInt();

    if (soDoan < soBiMat) {
        System.out.println("Số bí mật LỚN HƠN. Thử lại!");
    } else if (soDoan > soBiMat) {
        System.out.println("Số bí mật NHỎ HƠN. Thử lại!");
    } else {
        System.out.println("Chính xác! 🎉");
        daDung = true;            // đặt cờ → vòng lặp sẽ dừng
    }
}
```

Giải thích:

- **`boolean daDung = false;`** — biến kiểu `boolean` chỉ nhận `true`/`false`, dùng làm "cờ" báo trạng thái.
- **`while (!daDung)`** — dấu `!` nghĩa là "phủ định". `!daDung` = "chưa đúng". Vòng lặp chạy chừng nào còn **chưa** đoán đúng.
- Khi đoán đúng, ta gán `daDung = true` → lần kiểm tra điều kiện tiếp theo sẽ là `false` → vòng lặp kết thúc.

:::warning Vòng lặp vô tận
Nếu **quên** dòng `daDung = true;`, điều kiện `!daDung` luôn đúng → chương trình lặp mãi không dừng (gọi là *infinite loop*). Đây là lỗi kinh điển của người mới. Nhấn `Ctrl + C` trong terminal để dừng cưỡng bức.
:::

---

## Bước 6: Đếm số lần đoán

Thêm một biến đếm để báo người chơi mất bao nhiêu lượt:

```java
int soLanDoan = 0;

while (!daDung) {
    System.out.print("Nhập số bạn đoán (1-100): ");
    int soDoan = scanner.nextInt();
    soLanDoan++;                  // tăng biến đếm thêm 1 mỗi lượt
    // ... phần if/else như trên ...
}

System.out.println("Bạn đã đoán đúng sau " + soLanDoan + " lượt!");
```

- **`soLanDoan++`** — viết tắt của `soLanDoan = soLanDoan + 1`, tăng giá trị lên 1.
- Đặt lệnh tăng **ngay sau khi nhập** để mỗi lượt nhập đều được đếm.

---

## Code hoàn chỉnh

```java
import java.util.Random;
import java.util.Scanner;

public class DoanSo {
    public static void main(String[] args) {
        Random random = new Random();
        Scanner scanner = new Scanner(System.in);

        int soBiMat = random.nextInt(100) + 1;
        boolean daDung = false;
        int soLanDoan = 0;

        System.out.println("=== TRÒ CHƠI ĐOÁN SỐ (1-100) ===");

        while (!daDung) {
            System.out.print("Nhập số bạn đoán: ");
            int soDoan = scanner.nextInt();
            soLanDoan++;

            if (soDoan < soBiMat) {
                System.out.println("Số bí mật LỚN HƠN. Thử lại!");
            } else if (soDoan > soBiMat) {
                System.out.println("Số bí mật NHỎ HƠN. Thử lại!");
            } else {
                System.out.println("Chính xác! 🎉");
                daDung = true;
            }
        }

        System.out.println("Bạn đã đoán đúng sau " + soLanDoan + " lượt!");
        scanner.close();   // đóng Scanner khi dùng xong
    }
}
```

`scanner.close()` giải phóng tài nguyên khi không cần đọc nữa — thói quen tốt nên có ở cuối chương trình.

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `cannot find symbol: class Random` | Quên `import java.util.Random;` | Thêm dòng import ở đầu file |
| `InputMismatchException` | Người dùng gõ chữ thay vì số | Hướng dẫn nhập số; bài sau sẽ học cách kiểm tra input |
| Chương trình lặp mãi | Quên `daDung = true;` | Đảm bảo có lệnh dừng trong nhánh đoán đúng |
| Số bí mật luôn là 0 | Quên `+ 1` và hiểu nhầm `nextInt(100)` | `nextInt(100)` ra `[0,99]`, thêm `+1` để được `[1,100]` |

---

## Thử thách mở rộng

Tự làm để nâng kỹ năng (xếp theo độ khó):

1. **Giới hạn lượt đoán:** chỉ cho đoán tối đa 7 lần, hết lượt thì thua và lộ đáp án. (Gợi ý: thêm điều kiện `soLanDoan < 7` vào `while`.)
2. **Chơi lại:** sau mỗi ván hỏi "Chơi tiếp? (c/k)", nếu `c` thì sinh số mới và chơi lại. (Gợi ý: bọc toàn bộ trong một vòng lặp ngoài.)
3. **Chọn độ khó:** cho người chơi chọn khoảng số (1-50 / 1-100 / 1-1000) đầu ván.

---

## Tóm tắt

- **`Random`** sinh số ngẫu nhiên: `nextInt(n) + 1` cho khoảng `[1, n]`.
- **`Scanner`** đọc input người dùng: `nextInt()` đọc một số nguyên.
- **`while`** lặp lại đến khi điều kiện sai; dùng **biến cờ `boolean`** để điều khiển dừng.
- **`if / else if / else`** rẽ nhánh theo kết quả so sánh.
- Luôn **phân tích bài toán bằng pseudocode** trước khi code, và cẩn thận với **vòng lặp vô tận**.

Tiếp theo: [Máy tính dòng lệnh](./3_may-tinh-cli.md) — học cách tách hàm và xử lý lỗi.
