---
sidebar_position: 1
title: "Tổng quan về Java"
---

# Tổng quan về Java

Java la mot trong nhung ngon ngu lap trinh pho bien nhat the gioi, duoc su dung rong rai tu phat trien ung dung Android, web backend voi Spring Boot, den Big Data va IoT. Neu ban moi bat dau hoc lap trinh, hay tuong tuong Java nhu mot **ngon ngu quoc te** trong the gioi may tinh -- viet mot lan, chay duoc o moi noi (Write Once, Run Anywhere). Bai nay se giup ban hieu Java la gi, lich su hinh thanh, cac dac diem noi bat va quy trinh bien dich cua Java.

---

## 1. Java la gi?

Java la **ngon ngu lap trinh huong doi tuong** (Object-Oriented Programming - OOP), duoc thiet ke de **don gian, an toan va doc lap nen tang**.

```java
public class XinChao {
    public static void main(String[] args) {
        System.out.println("Xin chao, toi la Java!");
    }
}
```

Chuong trinh nay in ra man hinh dong chu `Xin chao, toi la Java!`. Day la chuong trinh Java don gian nhat ma ban se gap.

---

## 2. Lich su hinh thanh

| Moc thoi gian | Su kien |
|---------------|---------|
| **1991** | **James Gosling** va nhom ky su tai **Sun Microsystems** bat dau phat trien. Ten ban dau la **Oak** |
| **1995** | Doi ten thanh **Java**, phat hanh phien ban dau tien |
| **2006** | Sun Microsystems phat hanh Java duoi giay phep ma nguon mo |
| **2010** | **Oracle** mua lai Sun Microsystems, Java thuoc ve Oracle |
| **Hien nay** | Java lien tuc cap nhat (6 thang/phien ban), phien ban moi nhat la Java 21+ (LTS) |

---

## 3. Cac dac diem noi bat cua Java

### 3.1. Doc lap nen tang (Platform Independent - WORA)

Day la dac diem quan trong nhat cua Java. Code Java duoc bien dich thanh **bytecode**, va bytecode nay chay tren **JVM** (Java Virtual Machine). Bat ky may tinh nao co JVM deu chay duoc chuong trinh Java.

```
Ma nguon (.java) --> Compiler (javac) --> Bytecode (.class) --> JVM --> May tinh
```

**Vi du thuc te:** Ban viet mot ung dung tren Windows. File `.class` do co the mang sang macOS hoac Linux va chay binh thuong ma khong can sua code.

### 3.2. Huong doi tuong (Object-Oriented Programming)

Moi thu trong Java deu xoay quanh **doi tuong (object)** va **lop (class)**. Java ho tro day du 4 tinh chat OOP:

- **Dong goi (Encapsulation):** An du lieu ben trong doi tuong
- **Ke thua (Inheritance):** Lop con ke thua tu lop cha
- **Da hinh (Polymorphism):** Cung mot hanh vi nhung ung xu khac nhau
- **Truu tuong (Abstraction):** An chi tiet, chi hien thi nhung gi can thiet

```java
public class DongVat {
    String ten;

    public void keu() {
        System.out.println("...");
    }
}

public class Cho extends DongVat {
    @Override
    public void keu() {
        System.out.println("Gau gau!");
    }
}

public class Meo extends DongVat {
    @Override
    public void keu() {
        System.out.println("Meo meo!");
    }
}
```

### 3.3. Thu gom rac tu dong (Garbage Collection)

Java **tu dong giai phong bo nho** khi doi tuong khong con duoc su dung. Lap trinh vien khong can giai phong bo nho thu cong nhu C/C++.

```java
public class GarbageCollectionDemo {
    public static void main(String[] args) {
        String s1 = new String("Hello");
        s1 = null; // Object "Hello" khong con ai tham chieu --> GC se thu hoi
        System.gc(); // Goi de nghi GC chay (khong dam bao chay ngay)
    }
}
```

### 3.4. An toan va bao mat (Secure)

- Khong su dung **con tro (pointer)** nhu C/C++
- JVM **kiem tra bytecode** truoc khi thuc thi
- Co che **ClassLoader** tai class an toan
- Ho tro **sandbox** ngan chan ma doc

### 3.5. Ho tro da luong (Multithreading)

Java cho phep chay nhieu tac vu **dong thoi** trong cung mot chuong trinh:

```java
public class MultiThreadDemo {
    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("Thread 1: " + i);
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("Thread 2: " + i);
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 3.6. Manh me (Robust)

- Kiem tra kieu du lieu chat che (strongly typed)
- Co che xu ly ngoai le (exception handling)
- Quan ly bo nho tu dong
- Khong co con tro truc tiep --> tranh loi truy cap bo nho

---

## 4. Cac nen tang Java

| Nen tang | Ten day du | Muc dich |
|----------|-----------|----------|
| **Java SE** | Standard Edition | Ung dung desktop, console, thu vien core |
| **Java EE** | Enterprise Edition (nay la Jakarta EE) | Web, Microservices, Enterprise (Servlet, JPA, EJB) |
| **Java ME** | Micro Edition | Thiet bi nhung, IoT, dien thoai doi cu |

---

## 5. Quy trinh bien dich va thuc thi

Java la ngon ngu **vua bien dich (compiled) vua thong dich (interpreted)**:

```
Buoc 1: Viet code         -->  HelloWorld.java
Buoc 2: Bien dich (javac) -->  HelloWorld.class (bytecode)
Buoc 3: JVM thong dich    -->  Ma may (machine code)
Buoc 4: CPU thuc thi      -->  Ket qua
```

```java
// File: HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Chay bang dong lenh:

```bash
javac HelloWorld.java   # Buoc 2: Bien dich thanh bytecode
java HelloWorld         # Buoc 3-4: JVM thuc thi
```

**JIT Compiler (Just-In-Time):** JVM su dung JIT de bien dich bytecode thanh ma may **ngay tai thoi diem chay**, giup tang hieu nang dang ke so voi thong dich thuan tuy.

---

## 6. Ung dung thuc te cua Java

| Linh vuc | Vi du cu the |
|----------|-------------|
| **Android** | Phan lon ung dung Android duoc viet bang Java (hoac Kotlin tren nen JVM) |
| **Web Backend** | Spring Boot, Spring MVC -- dung trong ngan hang, thuong mai dien tu |
| **Big Data** | Apache Hadoop, Apache Spark deu viet bang Java |
| **Enterprise** | He thong ERP, CRM cua cac tap doan lon |
| **Game** | Minecraft duoc viet bang Java |
| **IoT** | Thiet bi nhung, smart home |

---

## Khi nao dung?

- **Chon Java khi:** Can xay dung he thong lon, can tinh on dinh cao, da nen tang, hoac lam viec voi he sinh thai Spring/Android
- **Khong nen chon Java khi:** Can hieu nang cuc cao (game AAA), lap trinh he thong cap thap (dung C/C++), hoac ung dung nho don gian (dung Python/JavaScript)
- **Best practice:** Luon cap nhat phien ban Java moi nhat (LTS), su dung IDE chuyen nghiep (IntelliJ IDEA, Eclipse), va hoc theo chuan OOP

---

## Loi thuong gap

### Loi 1: Nhầm lẫn Java với JavaScript

```
❌ Sai: "Java va JavaScript la cung mot ngon ngu"
✅ Dung: Java va JavaScript la hai ngon ngu hoan toan khac nhau.
   Java la ngon ngu OOP bien dich, JavaScript la ngon ngu scripting cho web.
```

### Loi 2: Khong hieu WORA

```
❌ Sai: "Java chay duoc tren moi may ma khong can cai gi"
✅ Dung: Java can JVM de chay. May tinh phai cai JRE/JDK thi moi chay duoc Java.
```

### Loi 3: Nghi Java da loi thoi

```
❌ Sai: "Java cu roi, khong ai dung nua"
✅ Dung: Java van nam trong top 3 ngon ngu pho bien nhat (TIOBE Index),
   duoc cap nhat lien tuc va su dung rong rai trong enterprise.
```

---

## Cau hoi phong van

### Cau 1: Java la platform independent nhu the nao?

**Tra loi:** Java dat duoc tinh doc lap nen tang nho co **JVM**. Code Java duoc bien dich thanh **bytecode** (file `.class`), va bytecode nay chay tren JVM. Moi he dieu hanh (Windows, Linux, macOS) co phien ban JVM rieng, nen cung mot file `.class` co the chay tren bat ky nen tang nao co JVM. Day chinh la triet ly **"Write Once, Run Anywhere"**.

### Cau 2: Java la compiled hay interpreted?

**Tra loi:** Java la **ca hai**. Dau tien, `javac` **bien dich** ma nguon `.java` thanh bytecode `.class`. Sau do, JVM **thong dich** bytecode thanh ma may. Ngoai ra, JVM con su dung **JIT Compiler** de bien dich cac doan code "nong" (hay thuc thi) thanh ma may truc tiep, giup tang hieu nang.

### Cau 3: Tai sao Java khong ho tro da ke thua (multiple inheritance) voi class?

**Tra loi:** Java khong cho phep mot class ke thua tu nhieu class de tranh **van de Diamond Problem** -- khi hai lop cha co cung mot phuong thuc, lop con khong biet goi phuong thuc cua lop cha nao. Tuy nhien, Java ho tro da ke thua thong qua **interface** (tu Java 8, interface co the co default method).

### Cau 4: Tai sao phuong thuc main phai la static?

**Tra loi:** Phuong thuc `main` phai la `static` vi JVM goi `main` **truoc khi bat ky doi tuong nao duoc tao**. Neu `main` khong phai `static`, JVM se phai tao doi tuong cua class truoc -- nhung de tao doi tuong can goi constructor, va khong co diem bat dau de thuc hien dieu do. `static` cho phep goi truc tiep thong qua ten class ma khong can doi tuong.

### Cau 5: Su khac biet giua JDK, JRE va JVM?

**Tra loi:**
- **JVM** (Java Virtual Machine): May ao thuc thi bytecode
- **JRE** (Java Runtime Environment): JVM + thu vien chuan, dung de **chay** chuong trinh Java
- **JDK** (Java Development Kit): JRE + cong cu phat trien (javac, jar, javadoc...), dung de **phat trien** Java

Quan he: **JDK ⊃ JRE ⊃ JVM**
