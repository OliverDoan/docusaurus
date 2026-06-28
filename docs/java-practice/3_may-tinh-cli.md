---
sidebar_position: 3
title: "3. Máy tính dòng lệnh"
---

# Project 2: Máy tính dòng lệnh

Project này xây một máy tính chạy trong terminal: người dùng nhập hai số và một phép toán (`+ - * /`), chương trình in kết quả, rồi lặp lại cho đến khi người dùng chọn thoát. Điểm mới so với project trước là bạn sẽ học **tách code thành các hàm (method)** để gọn gàng, dùng **`switch`** để chọn phép toán, và **xử lý lỗi với `try/catch`** để chương trình không "chết" khi gặp dữ liệu xấu (như chia cho 0).

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Tách phép tính thành hàm riêng](#bước-1-tách-phép-tính-thành-hàm-riêng)
- [Bước 2: Chọn phép toán với switch](#bước-2-chọn-phép-toán-với-switch)
- [Bước 3: Nhận input và nối các phần lại](#bước-3-nhận-input-và-nối-các-phần-lại)
- [Bước 4: Xử lý chia cho 0 với try/catch](#bước-4-xử-lý-chia-cho-0-với-trycatch)
- [Bước 5: Vòng lặp menu để tính nhiều lần](#bước-5-vòng-lặp-menu-để-tính-nhiều-lần)
- [Code hoàn chỉnh](#code-hoàn-chỉnh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Phân tích bài toán

Pseudocode:

```
Lặp lại:
    Hỏi số thứ nhất
    Hỏi phép toán (+ - * /)
    Hỏi số thứ hai
    Tính kết quả tương ứng với phép toán
        - Nếu chia cho 0 → báo lỗi, không tính
    In kết quả
    Hỏi "Tính tiếp không?" → nếu không thì thoát
```

Thay vì nhồi tất cả vào `main`, ta sẽ **tách mỗi phép toán thành một hàm riêng**. Lý do: code dễ đọc, dễ sửa, và mỗi hàm chỉ làm đúng một việc.

---

## Bước 1: Tách phép tính thành hàm riêng

Một **hàm (method)** là một khối code có tên, nhận dữ liệu vào (tham số) và trả về kết quả. Ta viết bốn hàm cho bốn phép toán:

```java
public class MayTinh {

    // hàm cộng: nhận 2 số double, trả về double
    static double cong(double a, double b) {
        return a + b;
    }

    static double tru(double a, double b) {
        return a - b;
    }

    static double nhan(double a, double b) {
        return a * b;
    }

    static double chia(double a, double b) {
        return a / b;
    }

    public static void main(String[] args) {
        System.out.println(cong(3, 5));   // thử gọi hàm → in 8.0
    }
}
```

Giải thích cú pháp một hàm: `static double cong(double a, double b)`

- **`double`** (đứng trước tên hàm) — **kiểu dữ liệu trả về**. `double` là số thực (có phần thập phân), phù hợp cho máy tính vì kết quả chia thường lẻ.
- **`cong`** — tên hàm, đặt theo việc nó làm.
- **`(double a, double b)`** — **tham số**: hai số đầu vào.
- **`return a + b;`** — trả kết quả về cho nơi gọi.
- **`static`** — cho phép gọi hàm trực tiếp trong `main` mà chưa cần tạo object (khái niệm `static` sẽ học kỹ ở phần OOP; giờ cứ ghi nhớ để dùng).

:::tip Vì sao dùng `double` thay vì `int`?
`int` chỉ chứa số nguyên: `5 / 2` ra `2` (mất phần lẻ). `double` giữ phần thập phân: `5.0 / 2.0` ra `2.5`. Máy tính cần độ chính xác nên dùng `double`.
:::

---

## Bước 2: Chọn phép toán với switch

Người dùng nhập ký tự phép toán (`+`, `-`, `*`, `/`), ta cần chạy đúng hàm tương ứng. Dùng `switch` cho gọn hơn nhiều `if/else`:

```java
static double tinh(double a, double b, char phep) {
    switch (phep) {
        case '+':
            return cong(a, b);
        case '-':
            return tru(a, b);
        case '*':
            return nhan(a, b);
        case '/':
            return chia(a, b);
        default:
            throw new IllegalArgumentException("Phép toán không hợp lệ: " + phep);
    }
}
```

Giải thích:

- **`switch (phep)`** — so khớp giá trị của `phep` với từng `case`.
- **`case '+':`** — nếu `phep` là ký tự `'+'` thì chạy nhánh này. Lưu ý ký tự dùng **dấu nháy đơn** `'+'`, còn chuỗi mới dùng nháy kép `"+"`.
- Vì mỗi `case` đều `return` ngay nên không cần `break`. (Nếu không `return`, bạn phải thêm `break;` để tránh "rơi" xuống case kế tiếp.)
- **`default`** — chạy khi không khớp case nào. Ở đây ta **ném lỗi** (`throw`) để báo phép toán sai — sẽ bắt lỗi này ở bước sau.

---

## Bước 3: Nhận input và nối các phần lại

Giờ ghép `Scanner` để nhận input và gọi hàm `tinh`:

```java
import java.util.Scanner;

// ... các hàm cong, tru, nhan, chia, tinh ở trên ...

public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);

    System.out.print("Nhập số thứ nhất: ");
    double a = scanner.nextDouble();

    System.out.print("Nhập phép toán (+ - * /): ");
    char phep = scanner.next().charAt(0);

    System.out.print("Nhập số thứ hai: ");
    double b = scanner.nextDouble();

    double ketQua = tinh(a, b, phep);
    System.out.println("Kết quả: " + a + " " + phep + " " + b + " = " + ketQua);
}
```

Điểm mới:

- **`scanner.nextDouble()`** — đọc một số thực.
- **`scanner.next().charAt(0)`** — `next()` đọc một "từ" (chuỗi), `.charAt(0)` lấy **ký tự đầu tiên** của chuỗi đó. Đây là cách đọc một ký tự đơn từ Scanner.

---

## Bước 4: Xử lý chia cho 0 với try/catch

Chia cho 0 với số `double` không làm chương trình crash — Java trả về `Infinity`. Nhưng ta muốn **chủ động báo lỗi** cho rõ ràng. Ta sửa hàm `chia` để kiểm tra trước:

```java
static double chia(double a, double b) {
    if (b == 0) {
        throw new ArithmeticException("Không thể chia cho 0!");
    }
    return a / b;
}
```

Và bọc lời gọi trong `main` bằng `try/catch` để **bắt lỗi** thay vì để chương trình văng ra:

```java
try {
    double ketQua = tinh(a, b, phep);
    System.out.println("Kết quả = " + ketQua);
} catch (ArithmeticException e) {
    System.out.println("Lỗi: " + e.getMessage());
} catch (IllegalArgumentException e) {
    System.out.println("Lỗi: " + e.getMessage());
}
```

Giải thích cơ chế `try/catch`:

- **`try { ... }`** — "thử" chạy đoạn code có thể lỗi.
- Nếu trong `try` có lệnh `throw` (ném lỗi), Java **nhảy ngay** sang khối `catch` tương ứng, bỏ qua phần còn lại của `try`.
- **`catch (ArithmeticException e)`** — bắt đúng loại lỗi `ArithmeticException` (lỗi chia 0 ta ném ở trên). Biến `e` chứa thông tin lỗi.
- **`e.getMessage()`** — lấy thông điệp lỗi (chuỗi ta truyền vào lúc `throw`).

Nhờ vậy, khi chia cho 0, chương trình in `Lỗi: Không thể chia cho 0!` rồi **chạy tiếp bình thường** thay vì sập.

:::info Vì sao không để chương trình tự crash?
Một chương trình tốt không bao giờ để lỗi của người dùng làm nó "chết". `try/catch` cho phép bạn **xử lý lỗi một cách lịch sự**: báo cho người dùng biết và cho họ thử lại. Đây là nguyên tắc quan trọng trong lập trình thực tế.
:::

---

## Bước 5: Vòng lặp menu để tính nhiều lần

Bọc toàn bộ trong `while` để người dùng tính liên tục cho đến khi muốn thoát:

```java
boolean tiepTuc = true;
while (tiepTuc) {
    // ... nhập a, phep, b và tính như trên ...

    System.out.print("Tính tiếp? (c/k): ");
    String traLoi = scanner.next();
    if (traLoi.equalsIgnoreCase("k")) {
        tiepTuc = false;
    }
}
```

:::warning So sánh chuỗi: dùng `.equals`, KHÔNG dùng `==`
Với chuỗi (`String`), phải dùng `traLoi.equals("k")` hoặc `equalsIgnoreCase("k")` (bỏ qua hoa/thường). Dùng `traLoi == "k"` là **sai** — nó so sánh địa chỉ bộ nhớ chứ không so sánh nội dung, và thường cho kết quả `false` ngoài ý muốn. Đây là một trong những lỗi phổ biến nhất với người mới học Java.
:::

---

## Code hoàn chỉnh

```java
import java.util.Scanner;

public class MayTinh {

    static double cong(double a, double b) { return a + b; }
    static double tru(double a, double b)  { return a - b; }
    static double nhan(double a, double b) { return a * b; }

    static double chia(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Không thể chia cho 0!");
        }
        return a / b;
    }

    static double tinh(double a, double b, char phep) {
        switch (phep) {
            case '+': return cong(a, b);
            case '-': return tru(a, b);
            case '*': return nhan(a, b);
            case '/': return chia(a, b);
            default:
                throw new IllegalArgumentException("Phép toán không hợp lệ: " + phep);
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean tiepTuc = true;

        System.out.println("=== MÁY TÍNH DÒNG LỆNH ===");

        while (tiepTuc) {
            try {
                System.out.print("Nhập số thứ nhất: ");
                double a = scanner.nextDouble();

                System.out.print("Nhập phép toán (+ - * /): ");
                char phep = scanner.next().charAt(0);

                System.out.print("Nhập số thứ hai: ");
                double b = scanner.nextDouble();

                double ketQua = tinh(a, b, phep);
                System.out.println("Kết quả: " + a + " " + phep + " " + b + " = " + ketQua);
            } catch (ArithmeticException | IllegalArgumentException e) {
                System.out.println("Lỗi: " + e.getMessage());
            } catch (java.util.InputMismatchException e) {
                System.out.println("Lỗi: vui lòng nhập đúng định dạng số!");
                scanner.next();   // loại bỏ dữ liệu xấu khỏi bộ đệm
            }

            System.out.print("Tính tiếp? (c/k): ");
            String traLoi = scanner.next();
            if (traLoi.equalsIgnoreCase("k")) {
                tiepTuc = false;
            }
        }

        System.out.println("Tạm biệt!");
        scanner.close();
    }
}
```

Lưu ý cú pháp **`catch (A | B e)`** — bắt nhiều loại lỗi cùng một nhánh bằng dấu `|`, gọn hơn viết hai khối catch riêng.

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Phép `/` trả số nguyên cụt | Dùng `int` thay vì `double` | Khai báo tham số và biến là `double` |
| `==` so sánh chuỗi không đúng | Dùng `==` với `String` | Dùng `.equals()` / `.equalsIgnoreCase()` |
| Chia 0 cho ra `Infinity` | Không kiểm tra `b == 0` | Thêm kiểm tra và `throw` trong hàm `chia` |
| Chương trình lặp vô tận khi nhập chữ | `InputMismatchException` không được dọn bộ đệm | Gọi `scanner.next()` trong catch để bỏ dữ liệu xấu |

---

## Thử thách mở rộng

1. **Thêm phép toán mới:** lũy thừa `^` (dùng `Math.pow(a, b)`) và chia lấy dư `%`.
2. **Bộ nhớ máy tính:** lưu kết quả lần trước, cho phép dùng lại bằng cách gõ `ans` làm toán hạng.
3. **Tách input ra hàm riêng:** viết hàm `docSo(Scanner sc, String thongBao)` để tránh lặp code đọc số — luyện tư duy "mỗi việc một hàm".

---

## Tóm tắt

- **Hàm (method)** giúp tách code theo từng việc: `static double cong(double a, double b) { return a + b; }`.
- **`switch`** chọn nhánh theo giá trị, gọn hơn nhiều `if/else`; nhớ `break` hoặc `return` mỗi case.
- **`double`** giữ phần thập phân — đúng cho phép chia.
- **`try/catch`** bắt lỗi để chương trình không sập; bắt nhiều lỗi bằng `catch (A | B e)`.
- So sánh chuỗi **luôn dùng `.equals()`**, không dùng `==`.

Tiếp theo: [Quản lý công việc (To-Do List)](./4_to-do-list.md) — bước vào thế giới class & object.
