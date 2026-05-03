---
sidebar_position: 27
title: "27. Sao chép mảng"
---

# Sao chép mảng trong Java

**Sao chép mảng (Clone/Copy Array)** là thao tác tạo một **bản sao độc lập** của mảng gốc, để khi thay đổi bản sao, mảng gốc **không bị ảnh hưởng**. Đây là thao tác quan trọng và thường xuyên trong Java, đặc biệt khi truyền mảng giữa các method hoặc làm việc với dữ liệu chia sẻ.

Hãy tưởng tượng bạn có một **tài liệu gốc** và muốn gửi bản sao cho người khác. Nếu bạn chỉ gửi **liên kết (link)** đến tài liệu, người khác sửa thì tài liệu gốc cũng thay đổi. Nhưng nếu bạn **photo copy** tài liệu rồi gửi bản photo, người khác có sửa thì tài liệu gốc vẫn nguyên vẹn. Sao chép mảng cũng tương tự - bạn cần tạo bản sao thực sự, không phải chỉ tạo "liên kết" đến mảng gốc.

---

## Mục lục

- [1. Cách 1: Vòng lặp `for` (cơ bản)](#1-cách-1-vòng-lặp-for-cơ-bản)
- [2. Cách 2: `Arrays.copyOf()` (phổ biến nhất)](#2-cách-2-arrayscopyof-phổ-biến-nhất)
- [3. Cách 3: `clone()` (nhanh và tiện)](#3-cách-3-clone-nhanh-và-tiện)
- [4. Cách 4: `System.arraycopy()` (hiệu suất cao nhất)](#4-cách-4-systemarraycopy-hiệu-suất-cao-nhất)
- [5. So sánh 4 cách copy](#5-so-sánh-4-cách-copy)
- [6. Shallow Copy vs Deep Copy (RẤT QUAN TRỌNG)](#6-shallow-copy-vs-deep-copy-rất-quan-trọng)
- [7. Copy mảng 2 chiều](#7-copy-mảng-2-chiều)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Cách 1: Vòng lặp `for` (cơ bản)

Đây là cách đơn giản nhất, phù hợp cho người mới học.

```java
public class CopyWithFor {
    public static void main(String[] args) {
        int[] source = {10, 20, 30, 40, 50};

        // Tao mang moi cung kich thuoc
        int[] copy = new int[source.length];

        // Copy tung phan tu
        for (int i = 0; i < source.length; i++) {
            copy[i] = source[i];
        }

        // Thay doi ban sao - mang goc KHONG bi anh huong
        copy[0] = 999;

        System.out.println("Source: " + java.util.Arrays.toString(source));
        // Source: [10, 20, 30, 40, 50] -- khong doi

        System.out.println("Copy:   " + java.util.Arrays.toString(copy));
        // Copy:   [999, 20, 30, 40, 50]
    }
}
```

**Ưu điểm:** Dễ hiểu, linh hoạt (có thể chỉ copy một phần, hoặc biến đổi khi copy).
**Nhược điểm:** Code dài, chậm hơn các cách khác.

---

## 2. Cách 2: `Arrays.copyOf()` (phổ biến nhất)

```java
import java.util.Arrays;

public class CopyWithArraysCopyOf {
    public static void main(String[] args) {
        int[] source = {10, 20, 30, 40, 50};

        // Copy toan bo mang
        int[] fullCopy = Arrays.copyOf(source, source.length);

        // Copy voi kich thuoc lon hon (phan tu thua = gia tri mac dinh)
        int[] biggerCopy = Arrays.copyOf(source, 8);

        // Copy voi kich thuoc nho hon (chi lay phan dau)
        int[] smallerCopy = Arrays.copyOf(source, 3);

        // Copy mot doan (tu index 1 den index 4, khong bao gom 4)
        int[] rangeCopy = Arrays.copyOfRange(source, 1, 4);

        System.out.println("Source:  " + Arrays.toString(source));
        // [10, 20, 30, 40, 50]

        System.out.println("Full:    " + Arrays.toString(fullCopy));
        // [10, 20, 30, 40, 50]

        System.out.println("Bigger:  " + Arrays.toString(biggerCopy));
        // [10, 20, 30, 40, 50, 0, 0, 0]

        System.out.println("Smaller: " + Arrays.toString(smallerCopy));
        // [10, 20, 30]

        System.out.println("Range:   " + Arrays.toString(rangeCopy));
        // [20, 30, 40]

        // Kiem tra doc lap
        fullCopy[0] = 999;
        System.out.println("Source sau khi sua copy: " + Arrays.toString(source));
        // [10, 20, 30, 40, 50] -- khong doi
    }
}
```

**Ưu điểm:** Gọn gàng, dễ đọc, linh hoạt (có thể thay đổi kích thước).
**Nhược điểm:** Với mảng object, chỉ là shallow copy.

---

## 3. Cách 3: `clone()` (nhanh và tiện)

```java
import java.util.Arrays;

public class CopyWithClone {
    public static void main(String[] args) {
        int[] source = {10, 20, 30, 40, 50};

        // clone() tao ban sao moi
        int[] copy = source.clone();

        // Kiem tra doc lap
        copy[0] = 999;
        System.out.println("Source: " + Arrays.toString(source));
        // [10, 20, 30, 40, 50] -- khong doi

        System.out.println("Copy:   " + Arrays.toString(copy));
        // [999, 20, 30, 40, 50]

        // clone() tao mang MOI (khac tham chieu)
        System.out.println("Cung tham chieu: " + (source == copy)); // false
    }
}
```

**Ưu điểm:** Cú pháp ngắn nhất, nhanh.
**Nhược điểm:** Không thể thay đổi kích thước, chỉ shallow copy với mảng object.

---

## 4. Cách 4: `System.arraycopy()` (hiệu suất cao nhất)

```java
import java.util.Arrays;

public class CopyWithSystemArraycopy {
    public static void main(String[] args) {
        int[] source = {10, 20, 30, 40, 50};

        // Copy toan bo
        int[] fullCopy = new int[source.length];
        System.arraycopy(source, 0, fullCopy, 0, source.length);
        // Tham so: (nguon, vi_tri_bat_dau_nguon, dich, vi_tri_bat_dau_dich, so_phan_tu)

        // Copy mot phan (tu index 1, lay 3 phan tu, dat vao index 0 cua dich)
        int[] partialCopy = new int[3];
        System.arraycopy(source, 1, partialCopy, 0, 3);

        // Copy vao giua mang dich
        int[] dest = {100, 200, 300, 400, 500};
        System.arraycopy(source, 0, dest, 1, 3);
        // Ghi de vi tri 1, 2, 3 cua dest

        System.out.println("Full:    " + Arrays.toString(fullCopy));
        // [10, 20, 30, 40, 50]

        System.out.println("Partial: " + Arrays.toString(partialCopy));
        // [20, 30, 40]

        System.out.println("Dest:    " + Arrays.toString(dest));
        // [100, 10, 20, 30, 500]
    }
}
```

**Ưu điểm:** **Hiệu suất cao nhất** - là native method, được tối ưu hoá ở cấp hệ thống. Được dùng trong nội bộ của `ArrayList`, `StringBuilder`, và nhiều lớp Java core.
**Nhược điểm:** Cú pháp phức tạp với nhiều tham số, dễ nhầm.

---

## 5. So sánh 4 cách copy

| Tiêu chí            | `for` loop | `Arrays.copyOf()` | `clone()`    | `System.arraycopy()` |
| ------------------- | ---------- | ----------------- | ------------ | -------------------- |
| Độ đơn giản         | Trung bình | **Gọn nhất**      | **Gọn nhất** | Phức tạp             |
| Hiệu suất           | Chậm nhất  | Nhanh             | Nhanh        | **Nhanh nhất**       |
| Thay đổi kích thước | Có         | Có                | Không        | Có                   |
| Copy một phần       | Có         | Có (copyOfRange)  | Không        | Có                   |
| Dùng trong thực tế  | Ít         | **Nhiều nhất**    | Trung bình   | Framework/Library    |

---

## 6. Shallow Copy vs Deep Copy (RẤT QUAN TRỌNG)

Với mảng **kiểu nguyên thuỷ** (`int[]`, `double[]`...), tất cả 4 cách trên đều tạo **bản sao độc lập hoàn toàn** vì giá trị được copy trực tiếp.

Nhưng với mảng **Object** (`String[]`, `Student[]`...), tất cả 4 cách trên chỉ tạo **Shallow Copy** - copy tham chiếu (reference), không copy đối tượng bên trong.

### Minh hoạ Shallow Copy Bug

```java
import java.util.Arrays;

public class ShallowCopyBug {
    public static void main(String[] args) {
        // Tao mang cac doi tuong Student
        Student[] original = {
            new Student("An", 20),
            new Student("Binh", 22),
            new Student("Cuong", 21)
        };

        // Shallow copy - CHI copy tham chieu
        Student[] shallowCopy = original.clone();

        // Thay doi doi tuong trong ban sao
        shallowCopy[0].setName("DA THAY DOI");

        // BAM! Mang goc CUNG bi anh huong!
        System.out.println("Original[0]: " + original[0].getName());
        // "DA THAY DOI" -- mang goc BI thay doi!

        System.out.println("Copy[0]:     " + shallowCopy[0].getName());
        // "DA THAY DOI"

        // Tai sao? Vi original[0] va shallowCopy[0] TRO CUNG MOT DOI TUONG
        System.out.println("Cung object: " + (original[0] == shallowCopy[0]));
        // true!
    }
}

class Student {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }

    @Override
    public String toString() {
        return name + " (" + age + ")";
    }
}
```

### Deep Copy - Giải pháp đúng

```java
import java.util.Arrays;

public class DeepCopyDemo {
    public static void main(String[] args) {
        Student[] original = {
            new Student("An", 20),
            new Student("Binh", 22),
            new Student("Cuong", 21)
        };

        // Deep copy - tao doi tuong MOI cho moi phan tu
        Student[] deepCopy = new Student[original.length];
        for (int i = 0; i < original.length; i++) {
            // Tao doi tuong Student MOI voi cung gia tri
            deepCopy[i] = new Student(
                original[i].getName(),
                original[i].getAge()
            );
        }

        // Bay gio thay doi ban sao KHONG anh huong mang goc
        deepCopy[0].setName("DA THAY DOI");

        System.out.println("Original[0]: " + original[0].getName());
        // "An" -- mang goc KHONG bi anh huong!

        System.out.println("DeepCopy[0]: " + deepCopy[0].getName());
        // "DA THAY DOI"

        // Hai doi tuong KHAC nhau
        System.out.println("Cung object: " + (original[0] == deepCopy[0]));
        // false - hai doi tuong doc lap
    }
}
```

**Minh hoạ trực quan:**

```
Shallow Copy:
  original[0] --\
                  --> Student("An", 20)  <-- CUNG 1 DOI TUONG
  shallowCopy[0] --/

Deep Copy:
  original[0] ------> Student("An", 20)    <-- DOI TUONG 1
  deepCopy[0] ------> Student("An", 20)    <-- DOI TUONG 2 (doc lap)
```

---

## 7. Copy mảng 2 chiều

Mảng 2 chiều là "mảng của mảng", nên cần **deep copy** để đảm bảo độc lập hoàn toàn.

```java
import java.util.Arrays;

public class Copy2DArray {
    public static void main(String[] args) {
        int[][] original = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        // SAI - Shallow copy (chi copy mang ngoai, mang trong van chung)
        int[][] shallowCopy = original.clone();
        shallowCopy[0][0] = 999;
        System.out.println("Original[0][0]: " + original[0][0]); // 999! BI anh huong

        // DUNG - Deep copy mang 2 chieu
        int[][] deepCopy = new int[original.length][];
        for (int i = 0; i < original.length; i++) {
            deepCopy[i] = Arrays.copyOf(original[i], original[i].length);
        }

        deepCopy[1][1] = 888;
        System.out.println("Original[1][1]: " + original[1][1]); // 5 - KHONG bi anh huong
        System.out.println("DeepCopy[1][1]: " + deepCopy[1][1]); // 888
    }
}
```

---

## Khi nào dùng?

**Chọn cách copy nào:**

- **Học tập, code đơn giản** -> `for` loop (dễ hiểu logic)
- **Code thực tế hàng ngày** -> `Arrays.copyOf()` (gọn, dễ đọc, linh hoạt)
- **Cần copy nhanh toàn bộ mảng** -> `clone()` (ngắn gọn nhất)
- **Cần hiệu suất tối đa / copy một phần** -> `System.arraycopy()` (dùng trong library)

**Khi nào cần Deep Copy:**

- Mảng chứa **Object** (không phải primitive)
- Bạn muốn sửa bản sao mà **không ảnh hưởng mảng gốc**
- Truyền mảng vào method và không muốn method thay đổi mảng gốc

**Best practices:**

- Với mảng primitive (`int[]`, `double[]`...): bất kỳ cách nào cũng cho kết quả độc lập
- Với mảng Object: **luôn cần deep copy** nếu muốn độc lập hoàn toàn
- Dùng `Arrays.copyOfRange()` khi chỉ cần copy một phần của mảng
- Khi viết method nhận mảng, nên copy mảng đầu vào để đảm bảo immutability

---

## Lỗi thường gặp

### 1. Tưởng gán mảng là copy (phổ biến nhất)

```java
// Sai - chi copy tham chieu, KHONG phai copy gia tri
int[] a = {1, 2, 3};
int[] b = a;          // b va a TRO CUNG 1 MANG
b[0] = 999;
System.out.println(a[0]); // 999! Mang goc bi thay doi

// Dung - dung Arrays.copyOf de tao ban sao doc lap
int[] a2 = {1, 2, 3};
int[] b2 = java.util.Arrays.copyOf(a2, a2.length);
b2[0] = 999;
System.out.println(a2[0]); // 1 - khong bi anh huong
```

### 2. Shallow copy mảng Object (tưởng là đã copy xong)

```java
// Sai - tuong rang clone() da copy xong, nhung chi la shallow
String[] names = {"An", "Binh"};
String[] copy = names.clone();

// Voi String thi OK vi String la immutable
// NHUNG voi mutable objects thi BI LOI (xem vi du Student o tren)
```

### 3. Nhầm tham số System.arraycopy()

```java
int[] src = {1, 2, 3, 4, 5};
int[] dest = new int[5];

// Sai - nham thu tu tham so
// System.arraycopy(dest, 0, src, 0, 5); // Copy nguoc!

// Dung - (nguon, batDauNguon, dich, batDauDich, soLuong)
System.arraycopy(src, 0, dest, 0, 5);

// Sai - so luong vuot qua kich thuoc
// System.arraycopy(src, 0, dest, 0, 10);
// ArrayIndexOutOfBoundsException!
```

### 4. Quên deep copy mảng 2 chiều

```java
// Sai - clone() chi copy lop ngoai
int[][] matrix = {{1, 2}, {3, 4}};
int[][] copy = matrix.clone();
copy[0][0] = 999;
System.out.println(matrix[0][0]); // 999! Bi anh huong

// Dung - deep copy tung hang
int[][] deepCopy = new int[matrix.length][];
for (int i = 0; i < matrix.length; i++) {
    deepCopy[i] = matrix[i].clone(); // clone tung mang con
}
```

---

## Câu hỏi phỏng vấn

### 1. Shallow copy và deep copy khác nhau như thế nào?

**Trả lời:** **Shallow copy** chỉ sao chép các tham chiếu (reference) đến các đối tượng, không tạo đối tượng mới. Bản gốc và bản sao cùng trỏ đến cùng các đối tượng bên trong, nên thay đổi một bên sẽ ảnh hưởng bên kia. **Deep copy** tạo các đối tượng hoàn toàn mới, sao chép toàn bộ dữ liệu. Bản gốc và bản sao hoàn toàn độc lập. Với mảng primitive, shallow copy đã đủ vì giá trị được copy trực tiếp. Với mảng Object, cần deep copy để đảm bảo độc lập.

### 2. `Arrays.copyOf()` và `System.arraycopy()` khác nhau như thế nào?

**Trả lời:** `Arrays.copyOf()` tự tạo mảng mới với kích thước chỉ định rồi copy dữ liệu vào, trả về mảng mới - gọn gàng hơn. `System.arraycopy()` yêu cầu bạn tự tạo mảng đích trước, nhưng cho phép kiểm soát chính xác vị trí copy (offset nguồn, offset đích, số lượng phần tử) - linh hoạt và hiệu suất cao hơn. Bên trong, `Arrays.copyOf()` thực chất gọi `System.arraycopy()`. Trong thực tế, dùng `Arrays.copyOf()` cho đơn giản, dùng `System.arraycopy()` khi cần tối ưu hoặc copy phức tạp.

### 3. Clone mảng chứa Object có vấn đề gì?

**Trả lời:** `clone()` trên mảng Object chỉ tạo **shallow copy** - mảng mới chứa các tham chiếu đến **cùng các đối tượng** với mảng gốc. Thay đổi thuộc tính của đối tượng trong bản sao sẽ ảnh hưởng mảng gốc. Để tránh vấn đề này, cần thực hiện deep copy: tạo đối tượng mới cho mỗi phần tử. Có thể dùng constructor copy, implement `Cloneable`, hoặc dùng serialization/deserialization.

### 4. Mảng 2 chiều có cần xử lý đặc biệt khi copy không?

**Trả lời:** Có. Mảng 2 chiều trong Java thực chất là "mảng của mảng" (mảng ngoài chứa tham chiếu đến các mảng con). Khi dùng `clone()` hoặc `Arrays.copyOf()`, chỉ mảng ngoài được copy, các mảng con vẫn được chia sẻ. Cần lặp qua từng hàng và copy riêng từng mảng con để có deep copy hoàn chỉnh: `for (int i = 0; i < matrix.length; i++) { copy[i] = Arrays.copyOf(matrix[i], matrix[i].length); }`.
