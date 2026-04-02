---
sidebar_position: 3
title: "Chuong trinh Java dau tien"
---

# Chuong trinh Java dau tien

Sau khi da hieu Java la gi, JVM/JRE/JDK khac nhau ra sao, bay gio la luc ban **thuc hanh viet chuong trinh Java dau tien**. Bai nay se huong dan ban cai dat JDK, viet va chay chuong trinh "Hello World" bang ca **dong lenh (command line)** va **Eclipse IDE**.

**Vi du don gian:** Viet chuong trinh giong nhu viet thu -- ban can giay (JDK), but (IDE/text editor), va nguoi nhan (JVM de chay). Bay gio chung ta se "viet la thu dau tien" trong the gioi Java.

---

## 1. Cai dat JDK

### Buoc 1: Tai JDK

Tai JDK tu trang chinh thuc cua Oracle hoac dung ban OpenJDK:
- **Oracle JDK:** https://www.oracle.com/java/technologies/downloads/
- **OpenJDK (Adoptium):** https://adoptium.net/

:::tip Khuyen nghi
Chon phien ban **LTS** (Long-Term Support) nhu Java 17 hoac Java 21.
:::

### Buoc 2: Cai dat va cau hinh

Sau khi cai xong, kiem tra bang dong lenh:

```bash
# Kiem tra phien ban Java
java -version

# Kiem tra trinh bien dich
javac -version
```

Ket qua mong doi:

```
java version "17.0.2" 2022-01-18 LTS
javac 17.0.2
```

Neu lenh `javac` khong duoc nhan dien, ban can them **JAVA_HOME** vao bien moi truong:

```bash
# Windows: System Properties > Environment Variables
# Them JAVA_HOME = C:\Program Files\Java\jdk-17
# Them %JAVA_HOME%\bin vao PATH

# macOS/Linux:
export JAVA_HOME=/usr/lib/jvm/java-17
export PATH=$JAVA_HOME/bin:$PATH
```

---

## 2. Chay Java bang Command Line

### Buoc 1: Tao file ma nguon

Tao file `HelloWorld.java` voi noi dung:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Day la chuong trinh Java dau tien cua toi.");
    }
}
```

:::warning Quan trong
Ten file **phai trung** voi ten class chua `main`. Class ten `HelloWorld` --> file ten `HelloWorld.java`.
:::

### Buoc 2: Bien dich

```bash
javac HelloWorld.java
```

Neu thanh cong, se tao ra file `HelloWorld.class` (bytecode).

### Buoc 3: Chay

```bash
java HelloWorld
```

**Ket qua:**

```
Hello, World!
Day la chuong trinh Java dau tien cua toi.
```

### Quy trinh tong quan

```
HelloWorld.java  --[javac]-->  HelloWorld.class  --[java/JVM]-->  Ket qua
  (ma nguon)                     (bytecode)                       (man hinh)
```

---

## 3. Giai thich chi tiet chuong trinh Hello World

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Phan tich tung thanh phan

| Thanh phan | Y nghia |
|------------|---------|
| `public` | Access modifier -- lop nay co the truy cap tu bat ky dau |
| `class` | Tu khoa khai bao mot lop (class) |
| `HelloWorld` | Ten cua lop (phai trung voi ten file) |
| `public` (truoc main) | Phuong thuc co the truy cap tu ben ngoai (JVM can truy cap) |
| `static` | Phuong thuc thuoc ve lop, khong can tao doi tuong de goi |
| `void` | Phuong thuc khong tra ve gia tri |
| `main` | Ten phuong thuc -- **diem bat dau** cua moi chuong trinh Java |
| `String[] args` | Mang chuoi chua tham so dong lenh |
| `System.out.println()` | In noi dung ra man hinh va xuong dong |

### Tai sao main phai la `public static void main(String[] args)`?

```java
public class GiaiThichMain {
    // public: JVM can truy cap tu ben ngoai
    // static: JVM goi truc tiep ma khong can tao doi tuong
    // void:   main khong can tra ve gia tri
    // main:   ten quy uoc, JVM tim phuong thuc nay de bat dau
    // String[] args: nhan tham so tu dong lenh

    public static void main(String[] args) {
        // In tham so dong lenh
        if (args.length > 0) {
            System.out.println("Tham so dau tien: " + args[0]);
        } else {
            System.out.println("Khong co tham so nao.");
        }
    }
}
```

Chay voi tham so:

```bash
javac GiaiThichMain.java
java GiaiThichMain Xin Chao
# Output: Tham so dau tien: Xin
```

---

## 4. Cai dat va su dung Eclipse IDE

### 4.1. Tai va cai Eclipse

1. Truy cap: https://www.eclipse.org/downloads/
2. Chon **Eclipse IDE for Java Developers**
3. Tai va cai dat theo huong dan

### 4.2. Tao Java Project trong Eclipse

1. Mo Eclipse --> **File** --> **New** --> **Java Project**
2. Dat ten project (vi du: `MyFirstProject`)
3. Chon JRE version (vi du: JavaSE-17)
4. Click **Finish**

### 4.3. Tao Class moi

1. Click phai vao **src** --> **New** --> **Class**
2. Dat ten class: `HelloEclipse`
3. Tick chon **public static void main(String[] args)**
4. Click **Finish**

### 4.4. Viet code

```java
public class HelloEclipse {
    public static void main(String[] args) {
        // Khai bao bien
        String ten = "Java";
        int phienBan = 17;

        // In ra man hinh
        System.out.println("Xin chao " + ten + " phien ban " + phienBan + "!");
        System.out.println("Toi dang hoc lap trinh Java.");

        // Phep tinh don gian
        int a = 10;
        int b = 20;
        int tong = a + b;
        System.out.println(a + " + " + b + " = " + tong);
    }
}
```

### 4.5. Chay chuong trinh

- **Cach 1:** Click phai vao file --> **Run As** --> **Java Application**
- **Cach 2:** Nhan **Ctrl + F11**

**Ket qua trong Console:**

```
Xin chao Java phien ban 17!
Toi dang hoc lap trinh Java.
10 + 20 = 30
```

---

## 5. Phim tat Eclipse huu ich

### Phim tat thuong dung nhat

| Phim tat | Chuc nang |
|----------|-----------|
| **Ctrl + Space** | Goi y code (autocomplete) |
| **Ctrl + Shift + F** | Format code tu dong |
| **Ctrl + Shift + O** | Tu dong import va xoa import thua |
| **Ctrl + F11** | Chay chuong trinh |
| **Ctrl + D** | Xoa dong hien tai |
| **Ctrl + /** | Comment/uncomment dong |
| **Ctrl + Shift + /** | Comment block |
| **F3** | Nhay den dinh nghia (Go to Definition) |
| **Ctrl + L** | Nhay den dong bat ky |
| **Ctrl + 1** | Quick Fix (goi y sua loi) |

### Phim tat nang cao

| Phim tat | Chuc nang |
|----------|-----------|
| **Alt + Shift + R** | Doi ten bien/class (Rename Refactor) |
| **Alt + Shift + S --> R** | Tao getter/setter tu dong |
| **Alt + Shift + S --> O** | Tao constructor tu dong |
| **Alt + Up/Down** | Di chuyen dong len/xuong |
| **Ctrl + Alt + Down** | Nhan doi dong hien tai |
| **Ctrl + Shift + R** | Tim file/class nhanh |
| **Ctrl + Shift + G** | Tim tat ca noi su dung (Find Usages) |

### Template nhanh (go tat roi nhan Ctrl+Space)

| Go tat | Ket qua |
|--------|---------|
| `sysout` + Ctrl+Space | `System.out.println();` |
| `main` + Ctrl+Space | Tao phuong thuc `main` |
| `for` + Ctrl+Space | Tao vong lap `for` |
| `foreach` + Ctrl+Space | Tao vong lap `for-each` |

---

## 6. Vi du them: Chuong trinh tinh tuoi

```java
import java.util.Scanner;

public class TinhTuoi {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Nhap ten cua ban: ");
        String ten = scanner.nextLine();

        System.out.print("Nhap nam sinh: ");
        int namSinh = scanner.nextInt();

        int namHienTai = 2026;
        int tuoi = namHienTai - namSinh;

        System.out.println("Chao " + ten + "! Ban " + tuoi + " tuoi.");

        scanner.close();
    }
}
```

**Ket qua:**

```
Nhap ten cua ban: Thuan
Nhap nam sinh: 1995
Chao Thuan! Ban 31 tuoi.
```

---

## Khi nao dung?

- **Command line:** Khi hoc co ban, debug nhanh, hoac lam viec tren server khong co GUI
- **Eclipse IDE:** Khi lam project lon, can autocomplete, debug, va refactor
- **IntelliJ IDEA:** Mot lua chon khac rat pho bien, duoc nhieu lap trinh vien Java ua chuong (dac biet khi lam Spring Boot)
- **Best practice:** Hoc chay bang command line truoc de hieu quy trinh bien dich, sau do chuyen sang IDE de tang nang suat

---

## Loi thuong gap

### Loi 1: Ten file khong trung voi ten class

```java
// File: hello.java
❌ Sai:
public class HelloWorld {  // Ten class la HelloWorld nhung file la hello.java
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}

// File: HelloWorld.java
✅ Dung:
public class HelloWorld {  // Ten class trung voi ten file
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```

### Loi 2: Quen dau cham phay (semicolon)

```java
❌ Sai:
System.out.println("Hello")   // Thieu dau ;
// Loi: ';' expected

✅ Dung:
System.out.println("Hello");  // Co dau ; cuoi lenh
```

### Loi 3: Goi `java` voi duoi `.class`

```bash
❌ Sai:
java HelloWorld.class    # Loi: Could not find or load main class

✅ Dung:
java HelloWorld          # Khong can duoi .class
```

### Loi 4: Viet sai `main` method

```java
❌ Sai:
public static void Main(String[] args) {  // Chu M viet hoa
    // JVM khong tim thay main method
}

✅ Dung:
public static void main(String[] args) {  // Chu m viet thuong
    // JVM tim thay va thuc thi
}
```

### Loi 5: In nham `System.out.Println` (viet hoa P)

```java
❌ Sai:
System.out.Println("Hello");  // Viet hoa P --> loi

✅ Dung:
System.out.println("Hello");  // Viet thuong p
```

---

## Cau hoi phong van

### Cau 1: Giai thich tung tu trong `public static void main(String[] args)`

**Tra loi:**
- `public`: Access modifier, cho phep JVM truy cap phuong thuc tu bat ky dau
- `static`: Phuong thuc thuoc ve lop (class-level), JVM goi duoc ma khong can tao doi tuong
- `void`: Phuong thuc khong tra ve gia tri
- `main`: Ten phuong thuc dac biet, la diem bat dau (entry point) cua moi chuong trinh Java
- `String[] args`: Mang chua cac tham so truyen tu dong lenh (command-line arguments)

### Cau 2: Co the overload phuong thuc main duoc khong?

**Tra loi:** **Co.** Ban co the overload main voi cac tham so khac nhau. Tuy nhien, JVM chi goi phien ban `public static void main(String[] args)` lam diem bat dau. Cac phien ban overload khac phai duoc goi thu cong.

```java
public class OverloadMain {
    public static void main(String[] args) {
        System.out.println("JVM goi phien ban nay");
        main(42); // Goi thu cong phien ban overload
    }

    public static void main(int number) {
        System.out.println("Phien ban overload: " + number);
    }
}
```

### Cau 3: Co the chay chuong trinh Java ma khong co main method khong?

**Tra loi:**
- **Truoc Java 7:** Co the dung khoi `static {}` de chay code ma khong can `main`.
- **Tu Java 7 tro di:** **Khong.** JVM bat buoc phai co phuong thuc `main` de khoi chay chuong trinh. Neu khong co, JVM se bao loi: `Main method not found in class`.

```java
// Chi hoat dong truoc Java 7
public class KhongCoMain {
    static {
        System.out.println("Chay khong can main!");
        System.exit(0);
    }
}
// Tu Java 7+: Error: Main method not found
```

### Cau 4: Su khac biet giua `System.out.println()` va `System.out.print()`?

**Tra loi:**
- `println()`: In noi dung va **xuong dong** sau khi in
- `print()`: In noi dung nhung **khong xuong dong**

```java
public class PrintDemo {
    public static void main(String[] args) {
        System.out.print("A");
        System.out.print("B");
        System.out.println("C");   // Xuong dong sau C
        System.out.println("D");   // Xuong dong sau D
        // Ket qua:
        // ABC
        // D
    }
}
```
