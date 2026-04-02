---
sidebar_position: 2
title: "Phan biet JVM, JRE, JDK"
---

# Phan biet JVM, JRE, JDK

Khi bat dau hoc Java, ban se thuong gap ba thuat ngu: **JVM**, **JRE** va **JDK**. Day la ba thanh phan cot loi cua nen tang Java, va hieu ro chung se giup ban nam duoc cach Java hoat dong tu khi viet code den khi chay chuong trinh.

**Tuong tu don gian:** Hay tuong tuong ban muon nghe nhac:
- **JVM** giong nhu **may phat nhac** -- no doc va phat cac ban nhac (bytecode)
- **JRE** giong nhu **may phat nhac + bo suu tap dia nhac** -- co du de ban thuong thuc nhac
- **JDK** giong nhu **studio thu am** -- co may phat, dia nhac, va ca cong cu de ban **thu am, mix, san xuat nhac** (phat trien phan mem)

---

## 1. JVM -- Java Virtual Machine

### JVM la gi?

JVM (Java Virtual Machine) la **may ao Java** -- mot phan mem **gia lap moi truong thuc thi** de chay bytecode Java. JVM la ly do Java co the chay tren nhieu nen tang khac nhau.

### Cach JVM hoat dong

```
Ma nguon (.java)
      |
      v
   javac (Compiler)
      |
      v
Bytecode (.class)
      |
      v
   JVM (doc bytecode --> chuyen thanh ma may cua tung OS)
      |
      v
  Windows / Linux / macOS
```

### Cac thanh phan chinh cua JVM

```java
// Vi du: Khi ban chay chuong trinh nay
public class HelloJVM {
    public static void main(String[] args) {
        String message = "Hello JVM!";
        System.out.println(message);
    }
}
```

JVM thuc hien cac buoc sau:

**1. ClassLoader (Bo nap lop)**
- Nap file `.class` vao bo nho
- Gom 3 giai doan: **Loading** --> **Linking** --> **Initialization**

```
Loading:    Doc file HelloJVM.class tu dia
Linking:    Kiem tra bytecode hop le, cap phat bo nho
Initialize: Gan gia tri ban dau cho cac bien static
```

**2. Runtime Data Areas (Vung du lieu thuc thi)**

| Vung nho | Muc dich |
|----------|----------|
| **Method Area** | Luu thong tin class, static variable, constant pool |
| **Heap** | Luu doi tuong duoc tao bang `new` |
| **Stack** | Luu bien cuc bo, tham chieu phuong thuc |
| **PC Register** | Dia chi lenh dang thuc thi cua moi thread |
| **Native Method Stack** | Goi phuong thuc native (C/C++) |

**3. Execution Engine (Bo thuc thi)**

| Thanh phan | Vai tro |
|------------|---------|
| **Interpreter** | Doc va thuc thi bytecode tung dong |
| **JIT Compiler** | Bien dich bytecode "nong" thanh ma may de tang toc |
| **Garbage Collector** | Tu dong thu hoi bo nho khong con su dung |

### JIT Compiler (Just-In-Time Compiler)

JIT la "vu khi bi mat" giup Java chay nhanh:

```java
public class JITDemo {
    public static void main(String[] args) {
        // Phuong thuc nay duoc goi 10,000 lan
        // JIT se bien dich no thanh ma may truc tiep de tang toc
        for (int i = 0; i < 10000; i++) {
            tinhTong(i, i + 1);
        }
    }

    public static int tinhTong(int a, int b) {
        return a + b;
    }
}
```

- Lan dau: Interpreter thong dich tung dong (cham)
- Sau nhieu lan goi: JIT nhan ra day la **"hot code"** va bien dich thanh ma may
- Cac lan sau: Chay truc tiep ma may (nhanh nhu C++)

---

## 2. JRE -- Java Runtime Environment

### JRE la gi?

JRE (Java Runtime Environment) la **moi truong chay Java**. No cung cap moi thu can thiet de **chay** mot chuong trinh Java, nhung **khong co cong cu de phat trien**.

### Thanh phan cua JRE

```
JRE = JVM + Thu vien chuan (Java Class Libraries) + File ho tro runtime
```

| Thanh phan | Mo ta |
|------------|-------|
| **JVM** | May ao thuc thi bytecode |
| **java.lang** | Cac lop co ban: String, Math, System, Object... |
| **java.util** | Collections, Date, Scanner... |
| **java.io** | Doc/ghi file |
| **java.net** | Lap trinh mang |
| **java.sql** | Ket noi co so du lieu |

### Vi du: Chi can JRE de chay

```java
// File: ChaoMung.class (da duoc bien dich san)
// Nguoi dung chi can JRE de chay:
// java ChaoMung
```

```bash
# Nguoi dung cuoi chi can cai JRE
java -version
# java version "17.0.2" 2022-01-18 LTS
# Java(TM) SE Runtime Environment (build 17.0.2+8-86)
# Java HotSpot(TM) 64-Bit Server VM (build 17.0.2+8-86, mixed mode, sharing)
```

**Khi nao chi can JRE?**
- Ban la **nguoi dung cuoi**, chi muon chay ung dung Java (vi du: Minecraft, cong cu doanh nghiep)
- Ban **khong can** viet hoac bien dich code Java

---

## 3. JDK -- Java Development Kit

### JDK la gi?

JDK (Java Development Kit) la **bo cong cu phat trien Java day du**. Neu ban muon **viet va bien dich** code Java, ban **bat buoc phai cai JDK**.

### Thanh phan cua JDK

```
JDK = JRE + Cong cu phat trien (Development Tools)
```

| Cong cu | Chuc nang |
|---------|-----------|
| **javac** | Trinh bien dich: `.java` --> `.class` (bytecode) |
| **java** | Thuc thi chuong trinh Java (goi JVM) |
| **jar** | Dong goi file thanh `.jar` |
| **javadoc** | Tao tai lieu API tu comment trong code |
| **jdb** | Trinh go loi (debugger) |
| **jconsole** | Giam sat hieu nang ung dung |
| **jshell** | Java REPL -- chay code Java tuong tac (tu Java 9) |

### Vi du su dung cac cong cu JDK

```java
// File: TinhToan.java
public class TinhToan {
    /**
     * Tinh tong hai so nguyen.
     * @param a so thu nhat
     * @param b so thu hai
     * @return tong cua a va b
     */
    public static int tong(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        int ketQua = tong(5, 3);
        System.out.println("5 + 3 = " + ketQua);
    }
}
```

```bash
# Bien dich (can javac -- chi co trong JDK)
javac TinhToan.java

# Chay (can java -- co trong ca JRE va JDK)
java TinhToan
# Output: 5 + 3 = 8

# Tao tai lieu (can javadoc -- chi co trong JDK)
javadoc TinhToan.java

# Dong goi thanh JAR (can jar -- chi co trong JDK)
jar cf TinhToan.jar TinhToan.class

# Chay tuong tac voi jshell (tu Java 9+)
jshell
# jshell> System.out.println("Hello")
# Hello
```

---

## 4. So do long nhau: JDK ⊃ JRE ⊃ JVM

```
+--------------------------------------------------+
|                    JDK                            |
|  +--------------------------------------------+  |
|  |                 JRE                         |  |
|  |  +--------------------------------------+  |  |
|  |  |              JVM                      |  |  |
|  |  |  - ClassLoader                        |  |  |
|  |  |  - Bytecode Verifier                  |  |  |
|  |  |  - Execution Engine (Interpreter+JIT) |  |  |
|  |  |  - Garbage Collector                  |  |  |
|  |  |  - Runtime Data Areas                 |  |  |
|  |  +--------------------------------------+  |  |
|  |                                             |  |
|  |  + Thu vien chuan (java.lang, java.util...) |  |
|  |  + File ho tro runtime                      |  |
|  +--------------------------------------------+  |
|                                                   |
|  + javac (Compiler)                               |
|  + jar (Packaging)                                |
|  + javadoc (Documentation)                        |
|  + jdb (Debugger)                                 |
|  + jshell (REPL)                                  |
+--------------------------------------------------+
```

---

## 5. Bang so sanh tong hop

| Tieu chi | JVM | JRE | JDK |
|----------|-----|-----|-----|
| **La gi?** | May ao thuc thi bytecode | Moi truong chay Java | Bo cong cu phat trien Java |
| **Bao gom** | ClassLoader, Execution Engine, GC | JVM + thu vien chuan | JRE + cong cu dev |
| **Co the bien dich code?** | Khong | Khong | Co (javac) |
| **Co the chay code?** | Co (bytecode) | Co | Co |
| **Danh cho** | Nen tang/thuc thi | Nguoi dung cuoi | Lap trinh vien |
| **Vi du tuong tu** | May phat nhac | May phat + dia nhac | Studio thu am |

---

## Khi nao dung?

- **Chi cai JRE:** Khi ban la nguoi dung cuoi, chi can chay ung dung Java (vi du chay file `.jar`)
- **Cai JDK:** Khi ban la lap trinh vien, can viet, bien dich va debug code Java
- **Best practice:** Luon cai JDK phien ban **LTS** (Long-Term Support) nhu Java 17 hoac Java 21. Su dung tool `sdkman` hoac `jenv` de quan ly nhieu phien ban JDK

:::tip Luu y
Tu **Java 11**, Oracle khong con cung cap JRE rieng le. Khi ban cai JDK 11+, no da bao gom moi thu can thiet. Nen thuc te, hau het moi nguoi chi can cai JDK.
:::

---

## Loi thuong gap

### Loi 1: Nham JVM la platform independent

```
❌ Sai: "JVM la platform independent"
✅ Dung: JVM la PLATFORM DEPENDENT (phu thuoc nen tang).
   Moi OS can cai phien ban JVM rieng.
   Chinh JAVA (bytecode) moi la platform independent.
```

### Loi 2: Tuong JRE du de lap trinh

```
❌ Sai: Cai JRE roi viet code Java
   > javac HelloWorld.java
   > 'javac' is not recognized as a command

✅ Dung: Phai cai JDK de co javac (trinh bien dich).
   JRE chi co the CHAY chuong trinh, khong the BIEN DICH.
```

### Loi 3: Khong phan biet ClassLoader va Compiler

```
❌ Sai: "ClassLoader bien dich code Java"
✅ Dung: ClassLoader NAP (load) file .class da duoc bien dich vao bo nho.
   javac (Compiler) moi la thanh phan bien dich .java thanh .class.
```

### Loi 4: Quen cau hinh JAVA_HOME

```
❌ Sai: Cai JDK xong nhung khong set JAVA_HOME
   > javac HelloWorld.java
   > 'javac' is not recognized

✅ Dung: Sau khi cai JDK, can them JAVA_HOME vao bien moi truong (environment variable)
   va them %JAVA_HOME%\bin vao PATH.
```

---

## Cau hoi phong van

### Cau 1: Phan biet JVM, JRE va JDK?

**Tra loi:**
- **JVM** la may ao thuc thi bytecode Java. No chuyen bytecode thanh ma may cua tung nen tang cu the.
- **JRE** gom JVM + thu vien chuan Java, dung de **chay** chuong trinh Java.
- **JDK** gom JRE + cong cu phat trien (javac, jar, javadoc...), dung de **phat trien** ung dung Java.
- Quan he long nhau: JDK ⊃ JRE ⊃ JVM.

### Cau 2: JIT Compiler la gi? Tai sao can no?

**Tra loi:** JIT (Just-In-Time) Compiler la thanh phan cua JVM, chuyen bytecode thanh **ma may truc tiep** tai thoi diem chay. Thay vi thong dich tung dong (cham), JIT nhan dien cac doan code duoc goi nhieu lan (**hotspot**) va bien dich chung thanh ma may. Cac lan goi tiep theo se chay ma may truc tiep, giup tang hieu nang dang ke -- gan nhu tuong duong voi ngon ngu bien dich nhu C++.

### Cau 3: ClassLoader la gi? No hoat dong nhu the nao?

**Tra loi:** ClassLoader la thanh phan cua JVM co nhiem vu **nap cac file .class vao bo nho**. No hoat dong theo 3 giai doan:
1. **Loading:** Tim va doc file .class tu disk hoac network
2. **Linking:** Kiem tra bytecode (verification), cap phat bo nho (preparation), giai quyet tham chieu (resolution)
3. **Initialization:** Thuc thi cac khoi static va gan gia tri cho static variable

Java co 3 ClassLoader mac dinh: Bootstrap ClassLoader, Extension ClassLoader, va Application ClassLoader, hoat dong theo mo hinh **uy quyen cha (Parent Delegation Model)**.

### Cau 4: JVM co phai la platform independent khong?

**Tra loi:** **Khong.** JVM la **platform dependent** (phu thuoc nen tang). Moi he dieu hanh (Windows, Linux, macOS) can mot phien ban JVM rieng. Tuy nhien, **bytecode Java** la platform independent -- cung mot file `.class` chay duoc tren bat ky JVM nao. Chinh nho JVM "dich" bytecode thanh ma may cua tung nen tang cu the ma Java dat duoc tinh "Write Once, Run Anywhere".
