---
sidebar_position: 19
title: "Mảng (Array) trong Java"
---

# Mảng (Array) trong Java

**Mảng (Array)** la cau truc du lieu co ban nhat trong Java, dung de **luu tru mot tap hop co dinh cac phan tu cung kieu du lieu** trong mot bien duy nhat. Thay vi khai bao 100 bien rieng le, ban chi can mot mang co 100 phan tu.

Hay hinh dung mang nhu **mot day tu do co so**: moi ngan tu co mot so thu tu (index), bat dau tu 0, va moi ngan chi chua dung mot loai do vat (cung kieu du lieu). Khi ban muon lay do vat o ngan nao, ban chi can goi dung so thu tu cua ngan do.

Mang la nen tang de hieu cac cau truc du lieu phuc tap hon nhu `ArrayList`, `HashMap`, va toan bo Java Collections Framework.

---

## 1. Khai bao va khoi tao mang

Java cung cap **3 cach** de khai bao va khoi tao mang:

### Cach 1: Khai bao truoc, cap phat sau

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

### Cach 2: Khai bao va cap phat cung luc

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

### Cach 3: Khai bao va khoi tao truc tiep (array literal)

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

**Gia tri mac dinh** khi khoi tao mang bang `new`:

| Kieu du lieu | Gia tri mac dinh |
|---|---|
| `int`, `long`, `short`, `byte` | `0` |
| `float`, `double` | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` (ky tu rong) |
| Object (String, etc.) | `null` |

---

## 2. Truy cap phan tu (index 0-based)

Mang trong Java dung **chi so bat dau tu 0**. Mang co `n` phan tu se co chi so tu `0` den `n-1`.

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

**Luu y**: `length` la **thuoc tinh** (property), khong phai method. Viet `arr.length` (khong co dau ngoac), khong phai `arr.length()`.

---

## 3. Duyet mang

### 3.1 Dung vong lap `for` truyen thong

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

### 3.2 Dung vong lap `for-each` (enhanced for)

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

**So sanh `for` va `for-each`:**

| Tieu chi | `for` truyen thong | `for-each` |
|---|---|---|
| Truy cap index | Co | Khong |
| Thay doi phan tu | Co | Khong truc tiep |
| Code ngan gon | Khong | Co |
| Dung khi nao | Can index hoac thay doi | Chi can doc |

---

## 4. Mang 2 chieu (Multidimensional Array)

Mang 2 chieu la "mang cua mang" - giong nhu mot **bang (table)** co hang va cot.

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

**Mang rang cua (Jagged Array)** - moi hang co so cot khac nhau:

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

## 5. Lop tien ich `java.util.Arrays`

Java cung cap lop `Arrays` voi nhieu method huu ich de lam viec voi mang:

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

Day la loi **pho bien nhat** khi lam viec voi mang. Xay ra khi truy cap index nam ngoai pham vi hop le `[0, length - 1]`.

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

| Tieu chi | Array | ArrayList |
|---|---|---|
| Kich thuoc | **Co dinh** | **Dong** (tu dong mo rong) |
| Kieu du lieu | Primitive + Object | Chi Object (dung Wrapper) |
| Hieu suat | **Nhanh hon** | Cham hon (do boxing/unboxing) |
| Tien ich | `java.util.Arrays` | Nhieu method (`add`, `remove`, ...) |
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

## Khi nao dung?

**Dung Array khi:**
- Du lieu co **kich thuoc co dinh** va biet truoc (vi du: 7 ngay trong tuan, 12 thang trong nam)
- Can **hieu suat cao** nhat (xu ly anh, tinh toan so hoc)
- Lam viec voi **kieu du lieu nguyen thuy** (`int`, `double`, `char`)
- Can mang **nhieu chieu** (ma tran, ban co)

**Dung ArrayList khi:**
- Khong biet truoc so luong phan tu
- Can them/xoa phan tu thuong xuyen
- Can cac method tien loi (`contains`, `indexOf`, `sort`)

**Best practices:**
- Luon khoi tao mang truoc khi su dung (tranh `NullPointerException`)
- Dung `Arrays.toString()` de in mang thay vi `System.out.println(arr)` (se in dia chi bo nho)
- Dung `for-each` khi chi can doc gia tri, dung `for` khi can index
- Dung `Arrays.copyOf()` thay vi gan truc tiep `b = a` (tranh 2 bien tro cung 1 mang)

---

## Loi thuong gap

### 1. Truy cap index ngoai pham vi

```java
// Sai
int[] arr = new int[3];
arr[3] = 10; // ArrayIndexOutOfBoundsException! Index hop le la 0, 1, 2

// Dung
arr[2] = 10; // Index cuoi cung la length - 1
```

### 2. Nham `length` thanh `length()`

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

### 3. Gan mang = copy tham chieu, khong phai copy gia tri

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

### 4. Quen khoi tao mang

```java
// Sai
int[] arr;
// arr[0] = 1; // Loi bien dich! Bien arr chua duoc khoi tao

// Dung
int[] arr2 = new int[5]; // Khoi tao truoc khi dung
arr2[0] = 1;
```

### 5. In mang truc tiep

```java
int[] arr = {1, 2, 3};

// Sai - in dia chi bo nho
System.out.println(arr); // [I@1b6d3586

// Dung - in noi dung mang
System.out.println(Arrays.toString(arr)); // [1, 2, 3]
```

---

## Cau hoi phong van

### 1. Su khac biet giua Array va ArrayList la gi?

**Tra loi:** Array co kich thuoc co dinh (khong the thay doi sau khi khoi tao), ho tro ca kieu nguyen thuy va Object, truy cap nhanh hon. ArrayList co kich thuoc dong (tu dong mo rong), chi ho tro Object (dung Wrapper class cho kieu nguyen thuy), cung cap nhieu method tien loi nhu `add()`, `remove()`, `contains()`. Nen dung Array khi biet truoc kich thuoc va can hieu suat, dung ArrayList khi can linh hoat.

### 2. Gia tri mac dinh cua cac phan tu trong mang la gi?

**Tra loi:** Khi khoi tao mang bang `new`, cac phan tu se co gia tri mac dinh: `int/long/short/byte` la `0`, `float/double` la `0.0`, `boolean` la `false`, `char` la `'\u0000'`, cac kieu Object (String, etc.) la `null`.

### 3. Co the thay doi kich thuoc (resize) cua mang sau khi khoi tao khong?

**Tra loi:** Khong. Mang trong Java co kich thuoc co dinh. Muon "thay doi kich thuoc", phai tao mang moi lon hon roi copy du lieu sang bang `Arrays.copyOf()` hoac `System.arraycopy()`. Day chinh la cach `ArrayList` hoat dong ben trong - khi mang noi bo day, no tao mang moi lon gap 1.5 lan va copy du lieu sang.

### 4. `Arrays.sort()` su dung thuat toan gi?

**Tra loi:** Voi mang kieu nguyen thuy (`int[]`, `double[]`...), `Arrays.sort()` su dung **Dual-Pivot Quicksort** (trung binh O(n log n)). Voi mang Object (`String[]`, `Integer[]`...), no su dung **TimSort** (bien the cua Merge Sort, dam bao stable sort va worst-case O(n log n)). TimSort la thuat toan ket hop Merge Sort va Insertion Sort, rat hieu qua voi du lieu thuc te da duoc sap xep mot phan.

### 5. Tai sao mang bat dau tu index 0 thay vi index 1?

**Tra loi:** Day la quy uoc tu ngon ngu C. Index thuc chat la **do lech (offset)** tu dia chi dau cua mang trong bo nho. Phan tu dau tien nam ngay tai dia chi dau nen co offset la 0. Cong thuc tinh dia chi: `dia_chi_phan_tu = dia_chi_dau + index * kich_thuoc_kieu_du_lieu`. Voi index 0, dia chi phan tu dau = dia chi dau, khong can tinh toan them.
