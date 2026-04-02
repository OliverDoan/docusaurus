---
sidebar_position: 27
title: "Sao chép mảng"
---

# Sao chep mang trong Java

**Sao chep mang (Clone/Copy Array)** la thao tac tao mot **ban sao doc lap** cua mang goc, de khi thay doi ban sao, mang goc **khong bi anh huong**. Day la thao tac quan trong va thuong xuyen trong Java, dac biet khi truyen mang giua cac method hoac lam viec voi du lieu chia se.

Hay tuong tuong ban co mot **tai lieu goc** va muon gui ban sao cho nguoi khac. Neu ban chi gui **lien ket (link)** den tai lieu, nguoi khac sua thi tai lieu goc cung thay doi. Nhung neu ban **photo copy** tai lieu roi gui ban photo, nguoi khac co sua thi tai lieu goc van nguyen ven. Sao chep mang cung tuong tu - ban can tao ban sao thuc su, khong phai chi tao "lien ket" den mang goc.

---

## 1. Cach 1: Vong lap `for` (co ban)

Day la cach don gian nhat, phu hop cho nguoi moi hoc.

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

**Uu diem:** De hieu, linh hoat (co the chi copy mot phan, hoac bien doi khi copy).
**Nhuoc diem:** Code dai, cham hon cac cach khac.

---

## 2. Cach 2: `Arrays.copyOf()` (pho bien nhat)

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

**Uu diem:** Gon gang, de doc, linh hoat (co the thay doi kich thuoc).
**Nhuoc diem:** Voi mang object, chi la shallow copy.

---

## 3. Cach 3: `clone()` (nhanh va tien)

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

**Uu diem:** Cu phap ngan nhat, nhanh.
**Nhuoc diem:** Khong the thay doi kich thuoc, chi shallow copy voi mang object.

---

## 4. Cach 4: `System.arraycopy()` (hieu suat cao nhat)

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

**Uu diem:** **Hieu suat cao nhat** - la native method, duoc toi uu hoa o cap he thong. Duoc dung trong noi bo cua `ArrayList`, `StringBuilder`, va nhieu lop Java core.
**Nhuoc diem:** Cu phap phuc tap voi nhieu tham so, de nham.

---

## 5. So sanh 4 cach copy

| Tieu chi | `for` loop | `Arrays.copyOf()` | `clone()` | `System.arraycopy()` |
|---|---|---|---|---|
| Do don gian | Trung binh | **Gon nhat** | **Gon nhat** | Phuc tap |
| Hieu suat | Cham nhat | Nhanh | Nhanh | **Nhanh nhat** |
| Thay doi kich thuoc | Co | Co | Khong | Co |
| Copy mot phan | Co | Co (copyOfRange) | Khong | Co |
| Dung trong thuc te | It | **Nhieu nhat** | Trung binh | Framework/Library |

---

## 6. Shallow Copy vs Deep Copy (RAT QUAN TRONG)

Voi mang **kieu nguyen thuy** (`int[]`, `double[]`...), tat ca 4 cach tren deu tao **ban sao doc lap hoan toan** vi gia tri duoc copy truc tiep.

Nhung voi mang **Object** (`String[]`, `Student[]`...), tat ca 4 cach tren chi tao **Shallow Copy** - copy tham chieu (reference), khong copy doi tuong ben trong.

### Minh hoa Shallow Copy Bug

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

### Deep Copy - Giai phap dung

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

**Minh hoa truc quan:**

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

## 7. Copy mang 2 chieu

Mang 2 chieu la "mang cua mang", nen can **deep copy** de dam bao doc lap hoan toan.

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

## Khi nao dung?

**Chon cach copy nao:**
- **Hoc tap, code don gian** -> `for` loop (de hieu logic)
- **Code thuc te hang ngay** -> `Arrays.copyOf()` (gon, de doc, linh hoat)
- **Can copy nhanh toan bo mang** -> `clone()` (ngan gon nhat)
- **Can hieu suat toi da / copy mot phan** -> `System.arraycopy()` (dung trong library)

**Khi nao can Deep Copy:**
- Mang chua **Object** (khong phai primitive)
- Ban muon sua ban sao ma **khong anh huong mang goc**
- Truyen mang vao method va khong muon method thay doi mang goc

**Best practices:**
- Voi mang primitive (`int[]`, `double[]`...): bat ky cach nao cung cho ket qua doc lap
- Voi mang Object: **luon can deep copy** neu muon doc lap hoan toan
- Dung `Arrays.copyOfRange()` khi chi can copy mot phan cua mang
- Khi viet method nhan mang, nen copy mang dau vao de dam bao immutability

---

## Loi thuong gap

### 1. Tuong gan mang la copy (phoi bien nhat)

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

### 2. Shallow copy mang Object (tuong la da copy xong)

```java
// Sai - tuong rang clone() da copy xong, nhung chi la shallow
String[] names = {"An", "Binh"};
String[] copy = names.clone();

// Voi String thi OK vi String la immutable
// NHUNG voi mutable objects thi BI LOI (xem vi du Student o tren)
```

### 3. Nham tham so System.arraycopy()

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

### 4. Quen deep copy mang 2 chieu

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

## Cau hoi phong van

### 1. Shallow copy va deep copy khac nhau nhu the nao?

**Tra loi:** **Shallow copy** chi sao chep cac tham chieu (reference) den cac doi tuong, khong tao doi tuong moi. Ban goc va ban sao cung tro den cung cac doi tuong ben trong, nen thay doi mot ben se anh huong ben kia. **Deep copy** tao cac doi tuong hoan toan moi, sao chep toan bo du lieu. Ban goc va ban sao hoan toan doc lap. Voi mang primitive, shallow copy da du vi gia tri duoc copy truc tiep. Voi mang Object, can deep copy de dam bao doc lap.

### 2. `Arrays.copyOf()` va `System.arraycopy()` khac nhau nhu the nao?

**Tra loi:** `Arrays.copyOf()` tu tao mang moi voi kich thuoc chi dinh roi copy du lieu vao, tra ve mang moi - gon gang hon. `System.arraycopy()` yeu cau ban tu tao mang dich truoc, nhung cho phep kiem soat chinh xac vi tri copy (offset nguon, offset dich, so luong phan tu) - linh hoat va hieu suat cao hon. Ben trong, `Arrays.copyOf()` thuc chat goi `System.arraycopy()`. Trong thuc te, dung `Arrays.copyOf()` cho don gian, dung `System.arraycopy()` khi can toi uu hoac copy phuc tap.

### 3. Clone mang chua Object co van de gi?

**Tra loi:** `clone()` tren mang Object chi tao **shallow copy** - mang moi chua cac tham chieu den **cung cac doi tuong** voi mang goc. Thay doi thuoc tinh cua doi tuong trong ban sao se anh huong mang goc. De tranh van de nay, can thuc hien deep copy: tao doi tuong moi cho moi phan tu. Co the dung constructor copy, implement `Cloneable`, hoac dung serialization/deserialization.

### 4. Mang 2 chieu co can xu ly dac biet khi copy khong?

**Tra loi:** Co. Mang 2 chieu trong Java thuc chat la "mang cua mang" (mang ngoai chua tham chieu den cac mang con). Khi dung `clone()` hoac `Arrays.copyOf()`, chi mang ngoai duoc copy, cac mang con van duoc chia se. Can lap qua tung hang va copy rieng tung mang con de co deep copy hoan chinh: `for (int i = 0; i < matrix.length; i++) { copy[i] = Arrays.copyOf(matrix[i], matrix[i].length); }`.
