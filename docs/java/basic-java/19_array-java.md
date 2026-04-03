---
sidebar_position: 19
title: "Mảng (Array) trong Java"
---

# Mảng (Array) trong Java

**Mảng (Array)** là cấu trúc dữ liệu cơ bản nhất trong Java, dùng để **lưu trữ một tập hợp cố định các phần tử cùng kiểu dữ liệu** trong một biến duy nhất. Thay vì khai báo 100 biến riêng lẻ, bạn chỉ cần một mảng có 100 phần tử.

Hãy hình dung mảng như **một dãy tủ đồ có số**: mỗi ngăn tủ có một số thứ tự (index), bắt đầu từ 0, và mỗi ngăn chỉ chứa đúng một loại đồ vật (cùng kiểu dữ liệu). Khi bạn muốn lấy đồ vật ở ngăn nào, bạn chỉ cần gọi đúng số thứ tự của ngăn đó.

Mảng là nền tảng để hiểu các cấu trúc dữ liệu phức tạp hơn như `ArrayList`, `HashMap`, và toàn bộ Java Collections Framework.

---

## 1. Khai báo và khởi tạo mảng

Java cung cấp **3 cách** để khai báo và khởi tạo mảng:

### Cách 1: Khai báo trước, cấp phát sau

```java
public class ArrayDemo {
    public static void main(String[] args) {
        // Buoc 1: Khai bao bien mang (chua co bo nho)
        int[] numbers;

        // Buoc 2: Cap phat bo nho cho 5 phan tu
        numbers = new int[5];

        // Gan gia tri
        numbers[0] = 10;
        numbers[1] = 20;
        numbers[2] = 30;
        numbers[3] = 40;
        numbers[4] = 50;

        System.out.println("Phan tu dau tien: " + numbers[0]); // 10
        System.out.println("Do dai mang: " + numbers.length);   // 5
    }
}
```

### Cách 2: Khai báo và cấp phát cùng lúc

```java
public class ArrayDemo2 {
    public static void main(String[] args) {
        // Khai bao + cap phat (cac phan tu mac dinh la 0)
        int[] scores = new int[3];

        scores[0] = 85;
        scores[1] = 92;
        scores[2] = 78;

        System.out.println("Diem cao nhat: " + scores[1]); // 92
    }
}
```

### Cách 3: Khai báo và khởi tạo trực tiếp (array literal)

```java
public class ArrayDemo3 {
    public static void main(String[] args) {
        // Khai bao + khoi tao voi gia tri cu the
        int[] primes = {2, 3, 5, 7, 11};

        // Tuong duong voi:
        // int[] primes = new int[]{2, 3, 5, 7, 11};

        System.out.println("So nguyen to thu 3: " + primes[2]); // 5
        System.out.println("Tong phan tu: " + primes.length);    // 5
    }
}
```

**Giá trị mặc định** khi khởi tạo mảng bằng `new`:

| Kiểu dữ liệu | Giá trị mặc định |
|---|---|
| `int`, `long`, `short`, `byte` | `0` |
| `float`, `double` | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` (ký tự rỗng) |
| Object (String, etc.) | `null` |

---

## 2. Truy cập phần tử (index 0-based)

Mảng trong Java dùng **chỉ số bắt đầu từ 0**. Mảng có `n` phần tử sẽ có chỉ số từ `0` đến `n-1`.

```java
public class ArrayAccess {
    public static void main(String[] args) {
        String[] fruits = {"Tao", "Cam", "Chuoi", "Xoai"};
        //                  [0]    [1]    [2]      [3]

        System.out.println("Phan tu dau: " + fruits[0]);                // Tao
        System.out.println("Phan tu cuoi: " + fruits[fruits.length - 1]); // Xoai

        // Thay doi gia tri phan tu
        fruits[1] = "Buoi";
        System.out.println("Sau thay doi: " + fruits[1]); // Buoi
    }
}
```

**Lưu ý**: `length` là **thuộc tính** (property), không phải method. Viết `arr.length` (không có dấu ngoặc), không phải `arr.length()`.

---

## 3. Duyệt mảng

### 3.1 Dùng vòng lặp `for` truyền thống

```java
public class ArrayIteration {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};

        // Duyet voi for - co the truy cap index
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Index " + i + ": " + numbers[i]);
        }
    }
}
```

### 3.2 Dùng vòng lặp `for-each` (enhanced for)

```java
public class ForEachDemo {
    public static void main(String[] args) {
        String[] names = {"An", "Binh", "Cuong"};

        // for-each: gon gang, de doc
        for (String name : names) {
            System.out.println("Ten: " + name);
        }

        // Tinh tong cac phan tu
        int[] values = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int v : values) {
            sum += v;
        }
        System.out.println("Tong: " + sum); // 15
    }
}
```

**So sánh `for` và `for-each`:**

| Tiêu chí | `for` truyền thống | `for-each` |
|---|---|---|
| Truy cập index | Có | Không |
| Thay đổi phần tử | Có | Không trực tiếp |
| Code ngắn gọn | Không | Có |
| Dùng khi nào | Cần index hoặc thay đổi | Chỉ cần đọc |

---

## 4. Mảng 2 chiều (Multidimensional Array)

Mảng 2 chiều là "mảng của mảng" - giống như một **bảng (table)** có hàng và cột.

```java
public class Array2D {
    public static void main(String[] args) {
        // Khai bao mang 2 chieu (3 hang, 4 cot)
        int[][] matrix = {
            {1, 2, 3, 4},
            {5, 6, 7, 8},
            {9, 10, 11, 12}
        };

        // Truy cap phan tu: matrix[hang][cot]
        System.out.println("Hang 1, Cot 2: " + matrix[1][2]); // 7

        // Duyet mang 2 chieu
        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
                System.out.print(matrix[i][j] + "\t");
            }
            System.out.println();
        }

        // Duyet bang for-each
        System.out.println("--- Duyet bang for-each ---");
        for (int[] row : matrix) {
            for (int value : row) {
                System.out.print(value + "\t");
            }
            System.out.println();
        }
    }
}
```

**Mảng răng cưa (Jagged Array)** - mỗi hàng có số cột khác nhau:

```java
public class JaggedArray {
    public static void main(String[] args) {
        int[][] jagged = new int[3][];
        jagged[0] = new int[]{1, 2};
        jagged[1] = new int[]{3, 4, 5};
        jagged[2] = new int[]{6};

        for (int[] row : jagged) {
            for (int val : row) {
                System.out.print(val + " ");
            }
            System.out.println();
        }
        // Output:
        // 1 2
        // 3 4 5
        // 6
    }
}
```

---

## 5. Lớp tiện ích `java.util.Arrays`

Java cung cấp lớp `Arrays` với nhiều method hữu ích để làm việc với mảng:

```java
import java.util.Arrays;

public class ArraysUtility {
    public static void main(String[] args) {
        int[] numbers = {5, 2, 8, 1, 9, 3};

        // 1. toString() - In mang dep
        System.out.println("Ban dau: " + Arrays.toString(numbers));
        // [5, 2, 8, 1, 9, 3]

        // 2. sort() - Sap xep tang dan
        Arrays.sort(numbers);
        System.out.println("Sau sort: " + Arrays.toString(numbers));
        // [1, 2, 3, 5, 8, 9]

        // 3. binarySearch() - Tim kiem nhi phan (mang phai duoc sort truoc)
        int index = Arrays.binarySearch(numbers, 5);
        System.out.println("Vi tri cua 5: " + index); // 3

        // 4. fill() - Dien cung mot gia tri
        int[] filled = new int[5];
        Arrays.fill(filled, 7);
        System.out.println("Fill: " + Arrays.toString(filled));
        // [7, 7, 7, 7, 7]

        // 5. copyOf() - Sao chep mang
        int[] copy = Arrays.copyOf(numbers, numbers.length);
        System.out.println("Copy: " + Arrays.toString(copy));
        // [1, 2, 3, 5, 8, 9]

        // copyOf voi kich thuoc lon hon (them 0 vao cuoi)
        int[] bigger = Arrays.copyOf(numbers, 10);
        System.out.println("Copy lon hon: " + Arrays.toString(bigger));
        // [1, 2, 3, 5, 8, 9, 0, 0, 0, 0]

        // 6. equals() - So sanh noi dung 2 mang
        int[] a = {1, 2, 3};
        int[] b = {1, 2, 3};
        System.out.println("a == b: " + (a == b));              // false (so sanh tham chieu)
        System.out.println("equals: " + Arrays.equals(a, b));   // true  (so sanh noi dung)

        // 7. copyOfRange() - Copy mot phan cua mang
        int[] partial = Arrays.copyOfRange(numbers, 1, 4);
        System.out.println("Partial: " + Arrays.toString(partial));
        // [2, 3, 5]
    }
}
```

---

## 6. ArrayIndexOutOfBoundsException

Đây là lỗi **phổ biến nhất** khi làm việc với mảng. Xảy ra khi truy cập index nằm ngoài phạm vi hợp lệ `[0, length - 1]`.

```java
public class ArrayException {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30}; // index hop le: 0, 1, 2

        try {
            System.out.println(arr[3]); // index 3 KHONG ton tai!
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Loi: " + e.getMessage());
            // Loi: Index 3 out of bounds for length 3
        }

        // Cach phong tranh: luon kiem tra truoc
        int index = 5;
        if (index >= 0 && index < arr.length) {
            System.out.println(arr[index]);
        } else {
            System.out.println("Index " + index + " khong hop le!");
        }
    }
}
```

---

## 7. Array vs ArrayList

| Tiêu chí | Array | ArrayList |
|---|---|---|
| Kích thước | **Cố định** | **Động** (tự động mở rộng) |
| Kiểu dữ liệu | Primitive + Object | Chỉ Object (dùng Wrapper) |
| Hiệu suất | **Nhanh hơn** | Chậm hơn (do boxing/unboxing) |
| Tiện ích | `java.util.Arrays` | Nhiều method (`add`, `remove`, ...) |
| Syntax | `int[] arr = new int[5]` | `ArrayList<Integer> list = new ArrayList<>()` |

```java
import java.util.ArrayList;
import java.util.Arrays;

public class ArrayVsArrayList {
    public static void main(String[] args) {
        // Array: kich thuoc co dinh
        int[] arr = new int[3];
        arr[0] = 1;
        arr[1] = 2;
        arr[2] = 3;
        // arr[3] = 4; // Loi! Khong the them phan tu

        // ArrayList: kich thuoc dong
        ArrayList<Integer> list = new ArrayList<>();
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4); // OK! Tu dong mo rong
        list.remove(0); // Xoa phan tu dau tien

        System.out.println("Array: " + Arrays.toString(arr));
        System.out.println("ArrayList: " + list);

        // Chuyen doi qua lai
        // Array -> ArrayList
        String[] names = {"An", "Binh", "Cuong"};
        ArrayList<String> nameList = new ArrayList<>(Arrays.asList(names));

        // ArrayList -> Array
        String[] nameArr = nameList.toArray(new String[0]);
    }
}
```

---

## Khi nào dùng?

**Dùng Array khi:**
- Dữ liệu có **kích thước cố định** và biết trước (ví dụ: 7 ngày trong tuần, 12 tháng trong năm)
- Cần **hiệu suất cao** nhất (xử lý ảnh, tính toán số học)
- Làm việc với **kiểu dữ liệu nguyên thuỷ** (`int`, `double`, `char`)
- Cần mảng **nhiều chiều** (ma trận, bàn cờ)

**Dùng ArrayList khi:**
- Không biết trước số lượng phần tử
- Cần thêm/xoá phần tử thường xuyên
- Cần các method tiện lợi (`contains`, `indexOf`, `sort`)

**Best practices:**
- Luôn khởi tạo mảng trước khi sử dụng (tránh `NullPointerException`)
- Dùng `Arrays.toString()` để in mảng thay vì `System.out.println(arr)` (sẽ in địa chỉ bộ nhớ)
- Dùng `for-each` khi chỉ cần đọc giá trị, dùng `for` khi cần index
- Dùng `Arrays.copyOf()` thay vì gán trực tiếp `b = a` (tránh 2 biến trỏ cùng 1 mảng)

---

## Lỗi thường gặp

### 1. Truy cập index ngoài phạm vi

```java
// Sai
int[] arr = new int[3];
arr[3] = 10; // ArrayIndexOutOfBoundsException! Index hop le la 0, 1, 2

// Dung
arr[2] = 10; // Index cuoi cung la length - 1
```

### 2. Nhầm `length` thành `length()`

```java
int[] arr = {1, 2, 3};

// Sai
// int size = arr.length(); // Loi bien dich! Mang dung .length (khong co ngoac)

// Dung
int size = arr.length; // property, khong phai method

// Chu y: String thi dung .length() (co ngoac)
String s = "Hello";
int strLen = s.length(); // method cua String
```

### 3. Gán mảng = copy tham chiếu, không phải copy giá trị

```java
// Sai - 2 bien tro cung mot mang
int[] a = {1, 2, 3};
int[] b = a;        // b va a tro cung vung nho
b[0] = 100;
System.out.println(a[0]); // 100! a cung bi thay doi

// Dung - Tao ban sao doc lap
int[] a2 = {1, 2, 3};
int[] b2 = Arrays.copyOf(a2, a2.length);
b2[0] = 100;
System.out.println(a2[0]); // 1 - a2 khong bi anh huong
```

### 4. Quên khởi tạo mảng

```java
// Sai
int[] arr;
// arr[0] = 1; // Loi bien dich! Bien arr chua duoc khoi tao

// Dung
int[] arr2 = new int[5]; // Khoi tao truoc khi dung
arr2[0] = 1;
```

### 5. In mảng trực tiếp

```java
int[] arr = {1, 2, 3};

// Sai - in dia chi bo nho
System.out.println(arr); // [I@1b6d3586

// Dung - in noi dung mang
System.out.println(Arrays.toString(arr)); // [1, 2, 3]
```

---

## Câu hỏi phỏng vấn

### 1. Sự khác biệt giữa Array và ArrayList là gì?

**Trả lời:** Array có kích thước cố định (không thể thay đổi sau khi khởi tạo), hỗ trợ cả kiểu nguyên thuỷ và Object, truy cập nhanh hơn. ArrayList có kích thước động (tự động mở rộng), chỉ hỗ trợ Object (dùng Wrapper class cho kiểu nguyên thuỷ), cung cấp nhiều method tiện lợi như `add()`, `remove()`, `contains()`. Nên dùng Array khi biết trước kích thước và cần hiệu suất, dùng ArrayList khi cần linh hoạt.

### 2. Giá trị mặc định của các phần tử trong mảng là gì?

**Trả lời:** Khi khởi tạo mảng bằng `new`, các phần tử sẽ có giá trị mặc định: `int/long/short/byte` là `0`, `float/double` là `0.0`, `boolean` là `false`, `char` là `'\u0000'`, các kiểu Object (String, etc.) là `null`.

### 3. Có thể thay đổi kích thước (resize) của mảng sau khi khởi tạo không?

**Trả lời:** Không. Mảng trong Java có kích thước cố định. Muốn "thay đổi kích thước", phải tạo mảng mới lớn hơn rồi copy dữ liệu sang bằng `Arrays.copyOf()` hoặc `System.arraycopy()`. Đây chính là cách `ArrayList` hoạt động bên trong - khi mảng nội bộ đầy, nó tạo mảng mới lớn gấp 1.5 lần và copy dữ liệu sang.

### 4. `Arrays.sort()` sử dụng thuật toán gì?

**Trả lời:** Với mảng kiểu nguyên thuỷ (`int[]`, `double[]`...), `Arrays.sort()` sử dụng **Dual-Pivot Quicksort** (trung bình O(n log n)). Với mảng Object (`String[]`, `Integer[]`...), nó sử dụng **TimSort** (biến thể của Merge Sort, đảm bảo stable sort và worst-case O(n log n)). TimSort là thuật toán kết hợp Merge Sort và Insertion Sort, rất hiệu quả với dữ liệu thực tế đã được sắp xếp một phần.

### 5. Tại sao mảng bắt đầu từ index 0 thay vì index 1?

**Trả lời:** Đây là quy ước từ ngôn ngữ C. Index thực chất là **độ lệch (offset)** từ địa chỉ đầu của mảng trong bộ nhớ. Phần tử đầu tiên nằm ngay tại địa chỉ đầu nên có offset là 0. Công thức tính địa chỉ: `dia_chi_phan_tu = dia_chi_dau + index * kich_thuoc_kieu_du_lieu`. Với index 0, địa chỉ phần tử đầu = địa chỉ đầu, không cần tính toán thêm.
