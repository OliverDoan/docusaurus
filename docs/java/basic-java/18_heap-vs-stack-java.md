---
sidebar_position: 18
title: "Heap Space vs Stack"
---
# Heap Space vs Stack

## 1. Gioi thieu

Trong Java, **bo nho (memory)** la tai nguyen quan trong nhat ma chuong trinh su dung. JVM (Java Virtual Machine) quan ly bo nho tu dong, nhung de viet code **hieu qua, tranh loi runtime**, ban can hieu **2 vung bo nho chinh**: **Stack** va **Heap**.

**Tai sao can hieu Stack va Heap?** Vi:
- Cac loi `StackOverflowError` va `OutOfMemoryError` la **loi runtime nguy hiem** co the crash ung dung
- Hieu bo nho giup ban **toi uu hieu nang** va tranh **memory leak**
- Day la **cau hoi phong van bat buoc** o moi level

Hay hinh dung:
- **Stack** giong nhu **mot chong dia**: ban dat dia len (goi method), lay dia ra (method ket thuc). Luon lay dia **tren cung** (LIFO). Chong dia co **gioi han chieu cao** - dat qua nhieu se do (StackOverflowError).
- **Heap** giong nhu **mot kho hang lon**: ban cat do vao bat ky cho nao con trong. Kho hang duoc **chia se** cho nhieu nguoi (thread). Co **nhan vien don dep** (Garbage Collector) dinh ky doc dep do cu.

---

## Noi dung

1. [Gioi thieu](#1-gioi-thieu)
2. [Stack Memory](#2-stack-memory)
3. [Heap Memory](#3-heap-memory)
4. [Vi du minh hoa: bien nam o dau?](#4-vi-du-minh-hoa-bien-nam-o-dau)
5. [StackOverflowError](#5-stackoverflowerror)
6. [OutOfMemoryError](#6-outofmemoryerror)
7. [Garbage Collection co ban](#7-garbage-collection-co-ban)
8. [Cau hinh bo nho JVM (-Xms, -Xmx, -Xss)](#8-cau-hinh-bo-nho-jvm--xms--xmx--xss)
9. [Bang so sanh Stack vs Heap](#9-bang-so-sanh-stack-vs-heap)
10. [Khi nao dung?](#10-khi-nao-dung)
11. [Loi thuong gap](#11-loi-thuong-gap)
12. [Cau hoi phong van](#12-cau-hoi-phong-van)

---

## 2. Stack Memory

### 2.1 Stack la gi?

**Stack Memory** la vung bo nho dung de luu:
- **Bien cuc bo** (local variables) cua primitive type
- **Tham chieu** (reference) den object tren Heap
- **Thong tin method call** (stack frame): tham so, dia chi tra ve

Moi khi goi mot method, JVM tao mot **stack frame** moi dat len dinh stack. Khi method ket thuc, stack frame do duoc **tu dong xoa**.

### 2.2 Dac diem cua Stack

| Dac diem | Mo ta |
|---------|-------|
| **Pham vi** | Moi thread co stack **rieng** |
| **Cau truc** | LIFO (Last In, First Out) |
| **Toc do** | **Rat nhanh** (cap phat/giai phong don gian) |
| **Kich thuoc** | **Gioi han** (mac dinh ~512KB - 1MB) |
| **Quan ly** | Tu dong (khong can GC) |
| **Thread-safe** | Co (rieng biet cho tung thread) |
| **Luu gi** | Primitive, reference, stack frame |

### 2.3 Vi du Stack hoat dong

```java
public class StackDemo {
    public static void main(String[] args) {
        int a = 10;      // a luu tren Stack cua main thread
        int b = 20;      // b luu tren Stack
        int result = add(a, b);  // Goi method add()
        System.out.println("Ket qua: " + result);
    }

    static int add(int x, int y) {
        int sum = x + y;  // x, y, sum luu tren Stack cua add()
        return sum;        // Khi add() ket thuc, stack frame bi xoa
    }
}
```

**Trang thai Stack khi `add()` dang chay:**

```
Stack (main thread)
+-------------------+
| add():            |  <-- Dinh stack (dang chay)
|   x = 10         |
|   y = 20         |
|   sum = 30       |
+-------------------+
| main():           |
|   a = 10         |
|   b = 20         |
|   result = ?     |
+-------------------+
```

Khi `add()` ket thuc va return, stack frame cua `add()` bi **xoa ngay lap tuc**:

```
Stack (main thread)
+-------------------+
| main():           |  <-- Dinh stack
|   a = 10         |
|   b = 20         |
|   result = 30    |
+-------------------+
```

---

## 3. Heap Memory

### 3.1 Heap la gi?

**Heap Memory** la vung bo nho dung de luu:
- **Tat ca object** duoc tao bang `new`
- **Instance variable** (thuoc tinh cua object)
- **Mang** (array)
- **String Pool** (tu Java 7)

### 3.2 Dac diem cua Heap

| Dac diem | Mo ta |
|---------|-------|
| **Pham vi** | **Chia se** giua tat ca thread |
| **Cau truc** | Khong co thu tu cu the |
| **Toc do** | **Cham hon Stack** |
| **Kich thuoc** | **Lon hon Stack** nhieu (co the GB) |
| **Quan ly** | Garbage Collector (GC) |
| **Thread-safe** | Khong (can dong bo khi truy cap chung) |
| **Luu gi** | Object, array, String Pool |

### 3.3 Cau truc Heap (don gian hoa)

```
Heap Memory
+--------------------------------------------------+
|  Young Generation                                  |
|  +--------------------------------------------+  |
|  | Eden Space  | Survivor S0 | Survivor S1    |  |
|  +--------------------------------------------+  |
|                                                    |
|  Old Generation (Tenured)                          |
|  +--------------------------------------------+  |
|  | Object song lau nam o day                   |  |
|  +--------------------------------------------+  |
|                                                    |
|  String Pool                                       |
|  +--------------------------------------------+  |
|  | "Hello", "Java", "World"                    |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

- **Object moi** -> tao trong **Eden Space**
- Sau nhieu lan GC ma van song -> chuyen sang **Survivor Space**
- Song du lau -> chuyen sang **Old Generation**

---

## 4. Vi du minh hoa: bien nam o dau?

```java
public class MemoryDemo {
    // instance variable -> Heap (nam trong object)
    String name;
    int age;

    public static void main(String[] args) {
        // 'args' la reference -> Stack, doi tuong String[] -> Heap
        int count = 5;  // primitive -> Stack

        // 'p' la reference -> Stack
        // object MemoryDemo -> Heap
        MemoryDemo p = new MemoryDemo();
        p.name = "Thuan";  // "Thuan" -> Heap (String Pool)
        p.age = 25;         // age la instance var -> Heap (trong object p)

        // 'numbers' la reference -> Stack
        // mang int[3] -> Heap
        int[] numbers = new int[]{1, 2, 3};

        // 'msg' la reference -> Stack
        // "Hello" -> Heap (String Pool)
        String msg = "Hello";

        process(p);
    }

    static void process(MemoryDemo person) {
        // 'person' la reference -> Stack (copy cua 'p')
        // van tro den cung object MemoryDemo tren Heap

        // 'localVar' -> Stack
        int localVar = person.age * 2;

        // 'temp' la reference -> Stack
        // new String(...) -> Heap
        String temp = new String("Temp");
    }
    // Khi process() ket thuc: person, localVar, temp bi xoa khoi Stack
    // Object "Temp" tren Heap tro thanh rac (khong con ai tro den) -> GC se don dep
}
```

**Tom tat:**

| Bien/Object | Luu o dau | Ghi chu |
|-------------|-----------|---------|
| `count = 5` | Stack | Primitive local var |
| `p` (reference) | Stack | Tham chieu den object |
| Object `MemoryDemo` | Heap | Tao bang `new` |
| `p.name = "Thuan"` | Heap | Instance var + String Pool |
| `p.age = 25` | Heap | Instance var (trong object) |
| `numbers` (reference) | Stack | Tham chieu den mang |
| Mang `int[3]` | Heap | Mang tao bang `new` |
| `msg = "Hello"` | Stack (ref) + Heap (Pool) | Literal trong String Pool |
| `localVar = 50` | Stack | Primitive local var |
| `temp` (reference) | Stack | Tham chieu |
| Object `"Temp"` | Heap | Tao bang `new String(...)` |

**Quy tac don gian:**
- **Primitive local variable** -> Stack
- **Object reference** -> Stack (tham chieu), Heap (object)
- **Tat ca object (tao bang new)** -> Heap
- **Instance variable** -> Heap (nam trong object)
- **Static variable** -> Method Area (vung dac biet cua Heap)

---

## 5. StackOverflowError

### 5.1 Khi nao xay ra?

**StackOverflowError** xay ra khi **stack day** - thuong do **de quy khong co dieu kien dung** (infinite recursion):

```java
public class StackOverflowDemo {
    public static void main(String[] args) {
        try {
            recursiveMethod(1);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError! Stack da day.");
        }
    }

    static void recursiveMethod(int n) {
        System.out.println("Lan goi thu: " + n);
        recursiveMethod(n + 1); // De quy vo han -> Stack day!
    }
}
```

**Ket qua:**
```
Lan goi thu: 1
Lan goi thu: 2
...
Lan goi thu: ~7000 (tuy JVM)
StackOverflowError! Stack da day.
```

### 5.2 Cach khac phuc

```java
// Sai: De quy khong co dieu kien dung
static int factorial(int n) {
    return n * factorial(n - 1); // Khong bao gio dung!
}
```

```java
// Dung: Co dieu kien dung (base case)
static int factorial(int n) {
    if (n <= 1) {
        return 1; // Base case: DUNG de quy
    }
    return n * factorial(n - 1);
}
```

### 5.3 Cac nguyen nhan thuong gap

- **De quy vo han** (thieu base case)
- **De quy qua sau** (n qua lon)
- **Method goi lan nhau** (A goi B, B goi A)
- **Tao qua nhieu local variable** trong method de quy

---

## 6. OutOfMemoryError

### 6.1 Khi nao xay ra?

**OutOfMemoryError** xay ra khi **Heap day** - thuong do tao **qua nhieu object** ma Garbage Collector khong the thu gom:

```java
import java.util.ArrayList;
import java.util.List;

public class OutOfMemoryDemo {
    public static void main(String[] args) {
        List<int[]> list = new ArrayList<>();

        try {
            while (true) {
                list.add(new int[1_000_000]); // Moi mang ~ 4MB
                System.out.println("Da tao " + list.size() + " mang");
            }
        } catch (OutOfMemoryError e) {
            System.out.println("OutOfMemoryError! Heap da day.");
            System.out.println("So mang da tao: " + list.size());
        }
    }
}
```

### 6.2 Cac nguyen nhan thuong gap

- **Memory leak**: giu reference den object khong con can (vi du: dat vao static List ma khong bao gio xoa)
- **Tao qua nhieu object**: vong lap tao object khong gioi han
- **Load du lieu lon**: doc toan bo file/database vao bo nho
- **Heap cau hinh qua nho**: ung dung can nhieu bo nho nhung -Xmx qua thap

### 6.3 Cach khac phuc

```java
// Sai: Memory leak - giu reference mai
static List<byte[]> cache = new ArrayList<>();

void processData() {
    byte[] data = new byte[1_000_000];
    // ... xu ly ...
    cache.add(data); // KHONG BAO GIO xoa! -> Memory leak
}
```

```java
// Dung: Giai phong khi khong can
static List<byte[]> cache = new ArrayList<>();
static final int MAX_CACHE_SIZE = 100;

void processData() {
    byte[] data = new byte[1_000_000];
    // ... xu ly ...
    if (cache.size() >= MAX_CACHE_SIZE) {
        cache.clear(); // Giai phong bo nho
    }
    cache.add(data);
}
```

---

## 7. Garbage Collection co ban

### 7.1 GC la gi?

**Garbage Collection (GC)** la co che **tu dong thu gom va giai phong bo nho** tren Heap khi object khong con duoc tham chieu (khong con bien nao tro den).

```java
public class GarbageCollectionDemo {
    public static void main(String[] args) {
        // Object 1 duoc tao, 'a' tro den no
        String a = new String("Hello");

        // Object 2 duoc tao, 'a' bay gio tro den Object 2
        // Object 1 KHONG CON AI TRO DEN -> tro thanh "rac"
        a = new String("World");

        // Object 3 duoc tao, 'b' tro den no
        String b = new String("Java");

        // b tro den null -> Object 3 tro thanh "rac"
        b = null;

        // Goi de xuat GC chay (khong dam bao chay ngay)
        System.gc();

        System.out.println("a = " + a); // World
        System.out.println("b = " + b); // null
    }
}
```

### 7.2 Khi nao object duoc thu gom?

Object **du dieu kien thu gom** khi:
1. **Khong con reference nao** tro den no
2. **Tat ca reference** tro den no deu la **unreachable** (khong the truy cap tu root)

```java
// Truong hop 1: Gan null
Object obj = new Object();
obj = null; // Object du dieu kien GC

// Truong hop 2: Gan lai reference
Object a = new Object(); // Object A
a = new Object();        // Object A du dieu kien GC

// Truong hop 3: Object trong method ket thuc
void method() {
    Object local = new Object(); // Object tao tren Heap
} // Khi method ket thuc, 'local' bi xoa khoi Stack
  // Object tren Heap khong con ai tro den -> du dieu kien GC
```

### 7.3 Luu y quan trong

- **Khong the ep GC chay**: `System.gc()` chi la **de xuat**, JVM co the **khong chay ngay**
- **Khong nen goi System.gc()**: lam giam hieu nang, de JVM tu quyet dinh
- GC co the **tam dung ung dung** (stop-the-world pause)

---

## 8. Cau hinh bo nho JVM (-Xms, -Xmx, -Xss)

### 8.1 Cac flag quan trong

| Flag | Mo ta | Vi du |
|------|-------|-------|
| `-Xms` | **Heap khoi tao** (initial heap size) | `-Xms256m` (256MB) |
| `-Xmx` | **Heap toi da** (maximum heap size) | `-Xmx1024m` (1GB) |
| `-Xss` | **Stack size** cho moi thread | `-Xss512k` (512KB) |

### 8.2 Cach su dung

```bash
# Chay voi Heap toi thieu 256MB, toi da 1GB
java -Xms256m -Xmx1024m MyApp

# Tang stack size cho de quy sau
java -Xss2m MyApp

# Kiem tra cau hinh mac dinh
java -XX:+PrintFlagsFinal -version | grep -i heap
```

### 8.3 Vi du trong code

```java
public class MemoryInfoDemo {
    public static void main(String[] args) {
        Runtime runtime = Runtime.getRuntime();

        long maxMemory = runtime.maxMemory();       // -Xmx
        long totalMemory = runtime.totalMemory();   // Heap hien tai
        long freeMemory = runtime.freeMemory();     // Bo nho chua dung

        System.out.println("=== Thong tin bo nho ===");
        System.out.printf("Max Memory (Xmx):  %d MB%n", maxMemory / (1024 * 1024));
        System.out.printf("Total Memory:       %d MB%n", totalMemory / (1024 * 1024));
        System.out.printf("Free Memory:        %d MB%n", freeMemory / (1024 * 1024));
        System.out.printf("Used Memory:        %d MB%n",
            (totalMemory - freeMemory) / (1024 * 1024));
    }
}
```

**Ket qua (tham khao):**
```
=== Thong tin bo nho ===
Max Memory (Xmx):  256 MB
Total Memory:       16 MB
Free Memory:        14 MB
Used Memory:        2 MB
```

### 8.4 Khuyen nghi cau hinh

- **Xms = Xmx**: tranh JVM phai resize Heap lien tuc
- **Xmx khong qua 70-80% RAM** vat ly (chhua lai cho OS va cac process khac)
- **Tang Xss** khi co de quy sau hoac method co nhieu local variable
- **Khong dat qua lon**: lang phi RAM, GC pause lau hon

---

## 9. Bang so sanh Stack vs Heap

| Tieu chi | Stack | Heap |
|---------|-------|------|
| **Luu gi** | Primitive local var, reference, stack frame | Object, array, instance var |
| **Pham vi** | **Rieng** cho tung thread | **Chia se** giua tat ca thread |
| **Cau truc** | LIFO (Last In, First Out) | Khong co thu tu |
| **Toc do** | **Rat nhanh** | Cham hon |
| **Kich thuoc** | **Nho** (~512KB - 1MB/thread) | **Lon** (co the GB) |
| **Quan ly** | Tu dong (method ket thuc -> xoa) | Garbage Collector |
| **Thread-safe** | Co (rieng biet) | Khong (can dong bo) |
| **Loi** | `StackOverflowError` | `OutOfMemoryError` |
| **Cau hinh** | `-Xss` | `-Xms`, `-Xmx` |
| **Tuoi tho** | Ngan (theo method) | Dai (cho den khi GC thu gom) |

---

## 10. Khi nao dung?

### Kien thuc nay ap dung khi:
- **Thiet ke ung dung**: chon cau truc du lieu phu hop (tranh tao qua nhieu object)
- **Toi uu hieu nang**: giam so object tao ra, tai su dung object (object pooling)
- **Debug loi runtime**: nhan biet StackOverflowError (stack day) vs OutOfMemoryError (heap day)
- **Cau hinh JVM**: dat -Xms, -Xmx, -Xss phu hop voi ung dung
- **Viet de quy**: dam bao co base case va khong de quy qua sau
- **Da luong**: hieu rang Heap chia se nen can dong bo khi truy cap chung

### Best practices:
- **Tranh tao object khong can thiet** trong vong lap
- **Dung primitive** thay vi Wrapper khi co the (`int` thay vi `Integer`)
- **Dong tai nguyen** (stream, connection) sau khi dung xong (try-with-resources)
- **Tranh giu reference lau** den object lon (memory leak)
- **Su dung WeakReference/SoftReference** cho cache
- **Gioi han do sau de quy** hoac dung vong lap thay the
- **Monitor bo nho** bang VisualVM, JConsole, hoac `-XX:+HeapDumpOnOutOfMemoryError`

---

## 11. Loi thuong gap

### Loi 1: De quy khong co dieu kien dung -> StackOverflowError

```java
// Sai: Khong co base case
static void count(int n) {
    System.out.println(n);
    count(n + 1); // Goi mai khong dung!
}
```

```java
// Dung: Co base case ro rang
static void count(int n, int max) {
    if (n > max) {
        return; // Base case: DUNG
    }
    System.out.println(n);
    count(n + 1, max);
}
```

### Loi 2: Them object vao collection mai khong xoa -> OutOfMemoryError

```java
// Sai: Memory leak!
static List<byte[]> dataStore = new ArrayList<>();

void collectData() {
    while (true) {
        byte[] data = readFromSensor();
        dataStore.add(data); // Chi them, KHONG BAO GIO xoa!
    }
}
```

```java
// Dung: Gioi han kich thuoc hoac xoa du lieu cu
static List<byte[]> dataStore = new ArrayList<>();
static final int MAX_SIZE = 1000;

void collectData() {
    while (true) {
        byte[] data = readFromSensor();
        if (dataStore.size() >= MAX_SIZE) {
            dataStore.remove(0); // Xoa du lieu cu nhat
        }
        dataStore.add(data);
    }
}
```

### Loi 3: Quen dong tai nguyen

```java
// Sai: Khong dong stream -> memory leak
void readFile(String path) throws Exception {
    FileInputStream fis = new FileInputStream(path);
    byte[] data = fis.readAllBytes();
    // Neu exception xay ra o day, fis KHONG duoc dong!
    fis.close();
}
```

```java
// Dung: Dung try-with-resources (tu dong dong)
void readFile(String path) throws Exception {
    try (FileInputStream fis = new FileInputStream(path)) {
        byte[] data = fis.readAllBytes();
        // fis tu dong dong khi thoat try, ke ca khi co exception
    }
}
```

### Loi 4: Nham lan primitive va object ve bo nho

```java
// Nham: Nghi rang int[] nam tren Stack
void example() {
    int x = 10;           // x -> Stack (primitive local var)
    int[] arr = new int[5]; // arr (reference) -> Stack
                             // mang int[5] (object) -> HEAP!
}
```

**Ghi nho:** Bat ky thu gi tao bang `new` deu nam tren **Heap**, ke ca mang primitive.

### Loi 5: Goi System.gc() de "fix" memory leak

```java
// Sai: System.gc() KHONG giai quyet memory leak
static List<Object> leakyList = new ArrayList<>();

void process() {
    leakyList.add(new Object());
    System.gc(); // Vo ich! Object van duoc tham chieu boi leakyList
}
```

```java
// Dung: Fix nguyen nhan goc - xoa reference khong can
static List<Object> leakyList = new ArrayList<>();

void process() {
    Object obj = new Object();
    // ... xu ly ...
    // Khong them vao static list neu khong can thiet
}
```

---

## 12. Cau hoi phong van

### Cau 1: Stack va Heap khac nhau nhu the nao?

**Tra loi:**
- **Stack** la vung bo nho **rieng cho tung thread**, luu **primitive local variable, reference, stack frame**. Quan ly theo **LIFO**, truy cap **nhanh**, kich thuoc **nho** (~512KB-1MB/thread), tu dong giai phong khi method ket thuc.
- **Heap** la vung bo nho **chia se giua tat ca thread**, luu **object, array, instance variable**. Kich thuoc **lon** (co the GB), truy cap **cham hon**, quan ly boi **Garbage Collector**. Khong tu dong giai phong - phai doi GC thu gom.

### Cau 2: Khi nao xay ra StackOverflowError? Cho vi du.

**Tra loi:** StackOverflowError xay ra khi **Stack day**, thuong do:
1. **De quy vo han** (khong co base case)
2. **De quy qua sau** (n rat lon)
3. **Method goi vong** (A goi B, B goi A)

```java
// Vi du: De quy vo han
void infinite() {
    infinite(); // Moi lan goi -> them stack frame -> Stack day -> ERROR
}
```

Khac phuc: dam bao moi de quy co **base case**, gioi han **do sau de quy**, hoac dung **vong lap** thay the.

### Cau 3: Khi nao xay ra OutOfMemoryError? Cach phong tranh?

**Tra loi:** OutOfMemoryError xay ra khi **Heap day** va GC khong the giai phong du bo nho. Nguyen nhan:
1. **Memory leak**: giu reference den object khong can (static collection chi them khong xoa)
2. **Load du lieu lon**: doc toan bo file/database vao bo nho
3. **Heap qua nho**: cau hinh -Xmx thap

Phong tranh:
- Giai phong reference khi khong can (gan null, xoa khoi collection)
- Xu ly du lieu theo **batch/stream** thay vi load het
- Tang `-Xmx` neu can thiet
- Dung tool (VisualVM, MAT) de phat hien memory leak
- Dung `-XX:+HeapDumpOnOutOfMemoryError` de debug

### Cau 4: Garbage Collection la gi? Hoat dong nhu the nao?

**Tra loi:** Garbage Collection (GC) la co che **tu dong cua JVM** de **phat hien va giai phong bo nho** cua cac object khong con duoc tham chieu (unreachable objects) tren Heap.

**Cach hoat dong co ban:**
1. **Mark**: GC duyet tu **GC roots** (Stack variable, static variable...) va **danh dau** tat ca object con **reachable** (co the truy cap duoc)
2. **Sweep**: Cac object **khong duoc danh dau** (unreachable) bi **xoa** va bo nho duoc giai phong
3. **Compact** (tuy GC): Don dep bo nho, dich chuyen object de giam **fragmentation**

**Luu y:** Lap trinh vien **khong the ep GC chay**. `System.gc()` chi la de xuat. JVM tu quyet dinh khi nao chay GC dua tren tinh trang bo nho.

### Cau 5: Tai sao moi thread co Stack rieng nhung chia se Heap?

**Tra loi:**
- **Stack rieng** vi moi thread co **luong thuc thi doc lap**: goi method khac nhau, bien cuc bo khac nhau. Neu chia se Stack, cac thread se ghi de len nhau -> loi.
- **Heap chia se** vi object thuong can duoc **truy cap tu nhieu thread** (vi du: danh sach user, connection pool, shared cache). Neu moi thread co Heap rieng, se khong the chia se du lieu -> lang phi bo nho va khong hieu qua.

Vi Heap chia se, khi nhieu thread **cung doc/ghi** mot object, can dung **synchronized**, **Lock**, hoac **concurrent data structure** de tranh **race condition**.
