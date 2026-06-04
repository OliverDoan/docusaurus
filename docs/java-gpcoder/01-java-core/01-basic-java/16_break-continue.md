---
sidebar_position: 16
title: "Câu lệnh điều khiển vòng lặp - break, continue"
---

# Câu lệnh điều khiển vòng lặp - break, continue

Trong khi sử dụng vòng lặp, đôi khi bạn cần **dừng vòng lặp sớm** hoặc **bỏ qua một vòng lặp cụ thể**. Java cung cấp hai câu lệnh: `break` và `continue`.

---

## Câu lệnh `break`

**`break`** dùng để **thoát ngay lập tức** khỏi vòng lặp gần nhất (hoặc câu lệnh `switch`).

### Ví dụ cơ bản

```java
public class BreakDemo {
    public static void main(String[] args) {
        // Tìm số đầu tiên chia hết cho 7 trong khoảng 1-100
        for (int i = 1; i <= 100; i++) {
            if (i % 7 == 0) {
                System.out.println("Số đầu tiên chia hết cho 7: " + i);
                break;  // Dừng vòng lặp ngay khi tìm thấy
            }
        }
        System.out.println("Sau vòng lặp");
    }
}
```

**Kết quả:**
```
Số đầu tiên chia hết cho 7: 7
Sau vòng lặp
```

### break trong vòng lặp lồng nhau

`break` chỉ thoát khỏi **vòng lặp chứa trực tiếp** nó:

```java
public class BreakNestedDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) {
                    break;  // Chỉ thoát vòng lặp j, vòng i vẫn tiếp tục
                }
                System.out.println("i=" + i + ", j=" + j);
            }
        }
    }
}
```

**Kết quả:**
```
i=1, j=1
i=2, j=1
i=3, j=1
```

### break có nhãn (Labeled break)

Dùng **nhãn** (label) để thoát khỏi vòng lặp bên ngoài từ vòng lặp bên trong:

```java
public class LabeledBreakDemo {
    public static void main(String[] args) {
        // Tìm cặp (i, j) đầu tiên có tổng = 10
        outerLoop:  // Đặt nhãn cho vòng lặp ngoài
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= 5; j++) {
                if (i + j == 10) {
                    System.out.println("Tìm thấy: i=" + i + ", j=" + j);
                    break outerLoop;  // Thoát luôn vòng lặp ngoài
                }
            }
        }
        System.out.println("Kết thúc");
    }
}
```

**Kết quả:**
```
Tìm thấy: i=5, j=5
Kết thúc
```

---

## Câu lệnh `continue`

**`continue`** dùng để **bỏ qua phần còn lại** của vòng lặp hiện tại và chuyển sang **vòng lặp tiếp theo**.

### Ví dụ cơ bản

```java
public class ContinueDemo {
    public static void main(String[] args) {
        // In các số lẻ từ 1 đến 10
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue;  // Bỏ qua số chẵn
            }
            System.out.print(i + " ");
        }
    }
}
```

**Kết quả:**
```
1 3 5 7 9
```

### continue trong vòng lặp while

```java
public class ContinueWhileDemo {
    public static void main(String[] args) {
        int i = 0;
        while (i < 10) {
            i++;
            if (i % 3 == 0) {
                continue;  // Bỏ qua các số chia hết cho 3
            }
            System.out.print(i + " ");
        }
    }
}
```

**Kết quả:**
```
1 2 4 5 7 8 10
```

### continue có nhãn (Labeled continue)

```java
public class LabeledContinueDemo {
    public static void main(String[] args) {
        // In bảng nhân nhưng bỏ qua hàng có i=2
        outerLoop:
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= 3; j++) {
                if (i == 2) {
                    continue outerLoop;  // Bỏ qua toàn bộ hàng i=2
                }
                System.out.println(i + " x " + j + " = " + (i * j));
            }
        }
    }
}
```

**Kết quả:**
```
1 x 1 = 1
1 x 2 = 2
1 x 3 = 3
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
4 x 1 = 4
4 x 2 = 8
4 x 3 = 12
```

---

## So sánh break và continue

| | `break` | `continue` |
|---|---|---|
| Tác dụng | Thoát hoàn toàn khỏi vòng lặp | Bỏ qua vòng lặp hiện tại, tiếp tục vòng tiếp |
| Vòng lặp | Kết thúc ngay | Vẫn tiếp tục chạy |
| Dùng trong | `for`, `while`, `do-while`, `switch` | `for`, `while`, `do-while` |

---

## Ví dụ thực tế

### Tìm kiếm trong mảng

```java
public class SearchDemo {
    public static void main(String[] args) {
        int[] numbers = {5, 3, 8, 1, 9, 2, 7};
        int target = 9;
        int foundIndex = -1;

        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                foundIndex = i;
                break;  // Dừng ngay khi tìm thấy
            }
        }

        if (foundIndex != -1) {
            System.out.println("Tìm thấy " + target + " tại vị trí " + foundIndex);
        } else {
            System.out.println("Không tìm thấy " + target);
        }
    }
}
```

### Lọc dữ liệu

```java
public class FilterDemo {
    public static void main(String[] args) {
        String[] names = {"An", "", "Bình", null, "Cường", "   ", "Dũng"};

        System.out.println("Tên hợp lệ:");
        for (String name : names) {
            // Bỏ qua các tên null hoặc rỗng
            if (name == null || name.trim().isEmpty()) {
                continue;
            }
            System.out.println("- " + name.trim());
        }
    }
}
```

**Kết quả:**
```
Tên hợp lệ:
- An
- Bình
- Cường
- Dũng
```

---

## Tóm tắt

- **`break`**: Thoát hoàn toàn khỏi vòng lặp gần nhất
- **`continue`**: Bỏ qua phần còn lại của vòng lặp hiện tại, tiếp tục vòng lặp tiếp theo
- Cả hai đều hỗ trợ **nhãn** (label) để điều khiển vòng lặp lồng nhau
- Sử dụng hợp lý giúp code rõ ràng hơn; sử dụng quá nhiều có thể làm code khó đọc
